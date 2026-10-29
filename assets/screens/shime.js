(function () {
  'use strict';

  var h = App.h;
  var yen = App.fmt.yen;

  /* 労務費の欄に入れたまま保存していない値。別の行を保存して描き直しても残す。画面を離れると捨てる */
  var typed = { month: '', values: {} };

  /* 締めを止めている件数。受付のままの請求と未計上の労務費は1件ずつ、末日や前の月などの条件は1つを1件に数える */
  function blockCount(cc) {
    var other = cc.items.filter(function (x) { return x.kind === 'other'; }).length;
    return other + cc.waiting.length + cc.laborMissing.length;
  }

  function stateText(row) {
    return row.carryover ? '締め済（繰越）' : row.status;
  }

  function countText(n) {
    return n === null || n === undefined ? App.NO_VALUE : n + '件';
  }

  /* 番号を「、」で並べる。href(no) が空でなければリンクにする。番号と後ろの「、」は途中で折り返さない */
  function nos(list, href) {
    var span = h('span', { class: 'shime-links' });
    list.forEach(function (no, i) {
      var to = href(no);
      App.append(span, h('span', { class: 'shime-no' }, [
        to ? h('a', { href: to }, no) : no,
        i < list.length - 1 ? h('span', { class: 'shime-sep' }, '、') : null
      ]));
    });
    return span;
  }

  /* 描き直した画面の先頭に移り、見出しに焦点を置く。保存の後の知らせと主な操作が画面に入る */
  function toTop() {
    window.scrollTo(0, 0);
    var h1 = document.querySelector('#content h1');
    if (!h1) return;
    h1.setAttribute('tabindex', '-1');
    try { h1.focus({ preventScroll: true }); } catch (e) { h1.focus(); }
  }

  /* 行の保存の後の知らせを、押した行の直後の行に移す。押した行は押す前と同じ高さに置き、表の横の送りも押す前に戻す。
     知らせが下の端（固定の帯があればその上）に外れていれば送る。焦点は同じ行のボタンに置く */
  function flashBeside(id, top, left) {
    var btn = document.getElementById(id);
    var tr = btn ? btn.closest('tr') : null;
    if (!tr) return;
    var box = document.querySelector('#content > .flash');
    var last = tr;
    if (box) {
      last = h('tr', { class: 'shime-flashrow' }, h('td', { colspan: tr.cells.length }, box));
      tr.parentNode.insertBefore(last, tr.nextSibling);
    }
    var wrap = tr.closest('.tbl-wrap');
    if (wrap && left) wrap.scrollLeft = left;
    try { btn.focus({ preventScroll: true }); } catch (e) { btn.focus(); }
    window.scrollBy(0, Math.round(tr.getBoundingClientRect().top - top));
    var bar = document.body.classList.contains('has-fixbar') ? parseFloat(window.getComputedStyle(document.body).getPropertyValue('--fixbar-h')) || 0 : 0;
    var over = last.getBoundingClientRect().bottom - (window.innerHeight - bar - 8);
    if (over > 0) window.scrollBy(0, Math.ceil(over));
  }

  /* label は文字か要素。要素のときはリンクとして置く。note は件数の後ろに添える */
  function item(label, n, links, attention, note) {
    return h('li', null, [
      h('span', null, [label, ' ', h('span', { class: attention ? 'shime-count' : null }, n + '件'), note || null]),
      links
    ]);
  }

  /* 同じ画面の労務費の計上の節へ移り、節の見出しに焦点を置く。次の Tab で一括の計上に届く */
  function toLabor(e) {
    var sec = document.getElementById('shime-labor');
    if (!sec) return;
    e.preventDefault();
    sec.scrollIntoView({ block: 'start' });
    var h2 = sec.querySelector('h2');
    if (!h2) return;
    h2.setAttribute('tabindex', '-1');
    try { h2.focus({ preventScroll: true }); } catch (err) { h2.focus(); }
  }

  /* ---------- 月の一覧 ---------- */

  function renderList(el) {
    var first = App.firstOpenMonth();
    /* 新しい月を上に並べる。止めている件数は次に締める月の行にだけ出す */
    var rows = App.months().slice().reverse().map(function (m) {
      return { month: m, row: App.find('months', m), blocks: m === first ? blockCount(App.closeCheck(m)) : null };
    });
    App.append(el, App.pageHead({ crumbs: [{ label: '月次の締め' }], title: '月次の締め' }));
    App.append(el, App.panel({
      title: '月の一覧',
      flush: true,
      body: App.table({
        caption: '月の一覧',
        columns: [
          { label: '月', card: 'head', link: true, value: function (r) { return r.month; } },
          { label: '状態', card: 'tag', cell: function (r) { return App.chip(stateText(r.row)); } },
          { label: '締めた回数', num: true, card: 'hide', value: function (r) { return r.row.closeCount ? r.row.closeCount + '回' : null; } },
          { label: '締めた日', card: 'hide', date: true, value: function (r) { return r.row.closedOn; } },
          {
            label: '止めている件数', num: true,
            cls: function (r) { return r.blocks === null ? 'shime-none' : ''; },
            cell: function (r) {
              if (r.blocks === null) return App.NO_VALUE;
              return h('span', { class: r.blocks ? 'shime-count' : null }, countText(r.blocks));
            }
          }
        ],
        rows: rows,
        href: function (r) { return App.link(['shime', r.month]); },
        rowClass: function (r) { return r.month === first ? 'is-focus' : ''; }
      })
    }));
  }

  /* ---------- 月の画面 ---------- */

  function doClose(m, v) {
    App.confirm(m + ' を締めます（第' + v.count + '回）。', {
      title: m + ' を締めますか',
      ok: '締める',
      lines: v.warnings,
      id: 'shime-close-ok'
    }).then(function (yes) {
      if (!yes) return;
      var res = App.act('month.close', { month: m });
      if (res.ok) {
        /* 締めた月の入れかけの時間は捨てる */
        typed = { month: m, values: {} };
        App.setDirty(false);
      }
      App.flash(res.ok ? res : res.reason);
      App.render();
      toTop();
    });
  }

  function doReopen(m) {
    App.confirmWithReason(m + ' の締めを解除します。', {
      title: m + ' の締めを解除',
      ok: '解除する',
      danger: true,
      id: 'shime-reopen-ok',
      submit: function (reason) { return App.act('month.reopen', { month: m }, { reason: reason }); }
    }).then(function (res) {
      if (!res || !res.ok) return;
      App.flash(res);
      App.render();
      toTop();
    });
  }

  function checkPanel(m, cc) {
    var blocks = h('ul', { class: 'shime-items' });
    cc.items.forEach(function (x) {
      if (x.kind === 'seikyu') App.append(blocks, item(h('a', { href: App.link(['seikyu']) }, '受付のままの請求'), cc.waiting.length, nos(cc.waiting, App.hrefOf), true));
      else if (x.kind === 'labor') {
        var head = h('a', { href: App.link(['shime', m]), onClick: toLabor }, '労務費が未計上の工事');
        App.append(blocks, item(head, cc.laborMissing.length, nos(cc.laborMissing, function (kno) { return App.link(['shime', m], { focus: kno }); }), true));
      }
      else App.append(blocks, h('li', null, x.text));
    });
    if (!cc.items.length) App.append(blocks, h('li', null, '止めている項目はありません'));
    var body = [h('div', { class: 'shime-group' }, [h('h3', null, '止めている項目'), blocks])];
    var warns = h('ul', { class: 'shime-items' });
    if (cc.lateOrders.length) {
      App.append(warns, item('納期を過ぎて未検収の発注', cc.lateOrders.length, nos(cc.lateOrders, function (no) { return App.link(['kenshu'], { hacchu: no }); })));
    }
    if (cc.draftOrders.length) {
      App.append(warns, item('起票のままの発注', cc.draftOrders.length, nos(cc.draftOrders, App.hrefOf), false, '（締めの対象外）'));
    }
    if (warns.children.length) body.push(h('div', { class: 'shime-group' }, [h('h3', null, '警告'), warns]));
    return App.panel({ title: '締める前の確認', body: h('div', { class: 'shime-check' }, body) });
  }

  function numbersPanel(m) {
    var n = App.calc.month(m);
    return App.panel({
      title: m + ' の数字',
      body: App.sums([
        { label: '発注検収の額（円）', value: yen(n.kenshu) },
        { label: '労務費の計上額（円）', value: yen(n.labor) },
        { label: '請求の計上額（円）', value: yen(n.seikyu) },
        { label: '過月分の件数', value: n.overdueCount + '件' },
        { label: '過月分の額（円）', value: yen(n.overdueAmount) }
      ])
    });
  }

  /* 締めた回数と最後に締めた日を見出しの状態の札の横に並べる。一度も締めていない月は出さず、解除して未締めに戻った月は締めた日を出さない */
  function closedInfo(head, row) {
    if (!row.closeCount) return;
    var line = head.querySelector('.title-line');
    if (!line) return;
    App.append(line, h('dl', { class: 'shime-closed' }, [
      h('div', null, [h('dt', null, '締めた回数'), h('dd', null, row.closeCount + '回')]),
      row.closedOn ? h('div', null, [h('dt', null, '締めた日'), h('dd', null, App.fmt.date(row.closedOn))]) : null
    ]));
  }

  /* 描き直しの後も残す値を覚え、残りがあれば画面を離れるときの確認を効かせたままにする */
  function keepTyped() {
    if (Object.keys(typed.values).length) App.setDirty(true);
  }

  function laborPanel(m, focus) {
    var rows = App.laborRows(m);
    var closed = App.isClosedMonth(m);
    var canRow = !closed && App.can('labor.recordMany', { month: m }).ok;
    var fields = {}, amounts = {};
    var pend = rows.filter(function (r) { return !r.recordedOn; });
    var bulkV = App.can('labor.recordMany', { month: m }, pend.length ? null : { rows: [] });

    function hoursNow(r) {
      return Object.prototype.hasOwnProperty.call(typed.values, r.kouji) ? typed.values[r.kouji] : r.hours;
    }

    function amountOf(r, hours) {
      var hv = typeof hours === 'number' ? hours : App.parse.hours(hours);
      if (hv === null || isNaN(hv)) return App.NO_VALUE;
      return yen(App.laborAmount(hv, r.rate));
    }

    /* 誤りを欄の下に出す。最初の誤りの行（欄と誤りの文と工事番号）を、画面の上に付いた表の見出しと下の固定の帯に掛からない所へ送ってから、欄に焦点を置く。
       上と下の限りは html の scroll-padding（1101 以上は上 52px、下は固定の帯の高さ + 8px）に従う */
    function showErrors(list) {
      Object.keys(fields).forEach(function (k) { fields[k].setError(''); });
      var first = null;
      list.forEach(function (e) {
        var f = fields[e.kouji];
        if (!f) return;
        f.setError(e.message);
        if (!first) first = f;
      });
      if (!first) return;
      (first.closest('tr') || first).scrollIntoView({ block: 'nearest' });
      (first.querySelector('.input-wrap') || first.control).scrollIntoView({ block: 'nearest', inline: 'nearest' });
      try { first.control.focus({ preventScroll: true }); } catch (e) { first.control.focus(); }
    }

    function recordOne(r) {
      var f = fields[r.kouji];
      var btn = document.getElementById(rowBtnId(r));
      var top = btn ? btn.closest('tr').getBoundingClientRect().top : 0;
      var wrap = btn ? btn.closest('.tbl-wrap') : null;
      var left = wrap ? wrap.scrollLeft : 0;
      var res = App.act('labor.record', { kouji: r.kouji, month: m }, { hours: f.get() });
      if (!res.ok) {
        showErrors([{ kouji: r.kouji, message: (res.errors && res.errors.hours) || res.reason }]);
        return;
      }
      delete typed.values[r.kouji];
      App.flash(res);
      keepTyped();
      App.render();
      flashBeside(rowBtnId(r), top, left);
    }

    function recordAll() {
      var list = pend.map(function (r) {
        return { kouji: r.kouji, hours: fields[r.kouji] ? fields[r.kouji].get() : r.hours };
      });
      var res = App.act('labor.recordMany', { month: m }, { rows: list });
      if (!res.ok) {
        showErrors(res.errors && res.errors.length ? res.errors : [{ kouji: pend[0].kouji, message: res.reason }]);
        return;
      }
      pend.forEach(function (r) { delete typed.values[r.kouji]; });
      App.flash(res);
      keepTyped();
      App.render();
      toTop();
    }

    function rowBtnId(r) { return 'shime-rec-' + r.kouji; }

    /* 一括の計上のボタン。行が無い月は置かない */
    var bulk = rows.length ? App.button('表示中を全て計上する', { small: true, side: true, id: 'shime-record-all', verdict: bulkV, onClick: recordAll }) : null;

    /* 行のボタン。押せないときは行ごとに理由を横に出す。
       時間の欄に焦点があるときはボタンを押し下げても焦点を動かさない。欄を離れたときの誤りでボタンが下にずれ、押した所から外れるのを防ぐ */
    function rowButton(r) {
      var wrap = App.button(r.recordedOn ? '直す' : '計上する', {
        small: true, side: true, op: 'labor.record', id: rowBtnId(r),
        verdict: App.can('labor.record', { kouji: r.kouji, month: m }),
        onClick: function () { recordOne(r); }
      });
      wrap.btn.addEventListener('mousedown', function (e) {
        var a = document.activeElement;
        if (a && a.closest && a.closest('.shime-hours')) e.preventDefault();
      });
      return wrap;
    }

    /* 未計上の行の金額の印。印刷では金額の代わりに値の無い印を刷る */
    function pendCls(r) { return r.recordedOn ? '' : 'shime-pend'; }

    function hoursCell(r) {
      if (!canRow) return App.fmt.hours(r.hours) + (r.hours === null || r.hours === undefined ? '' : '時間');
      /* 欄の名前は「時間」にして、欄を離れたときと計上したときの誤りの文をそろえる。読み上げの名前には工事番号を付ける */
      var f = App.field({
        name: 'hours-' + r.kouji,
        label: '時間',
        type: 'hours',
        step: 0.5,
        value: hoursNow(r),
        onInput: function (v) {
          typed.values[r.kouji] = v;
          if (amounts[r.kouji]) amounts[r.kouji].textContent = amountOf(r, v);
        }
      });
      f.classList.add('shime-hours');
      f.control.setAttribute('aria-label', r.kouji + ' の時間');
      f.querySelector('.field-label').classList.add('vh');
      fields[r.kouji] = f;
      return f;
    }

    /* 工事名の末尾の括弧書きを分け、括弧の前の空きを詰める */
    function nameCell(r) {
      var k = App.find('kouji', r.kouji);
      var name = k ? String(k.name || '') : '';
      var m = /^(.+?)(（[^（）]*）)$/.exec(name);
      if (!m) return name || App.NO_VALUE;
      return [m[1], h('span', { class: 'shime-paren' }, m[2])];
    }

    var columns = [
      { label: '工事番号', card: 'head', nw: true, cell: function (r) { return h('a', { href: App.link(['kouji', r.kouji]) }, r.kouji); } },
      { label: '工事名', card: 'hide', cls: function () { return 'shime-name'; }, cell: nameCell },
      { label: '時間', num: true, cell: hoursCell },
      { label: '単価（円）', num: true, card: 'hide', yen: true, value: function (r) { return r.rate; } },
      {
        label: '金額（円）', num: true, cls: pendCls,
        cell: function (r) {
          var span = h('span', null, r.recordedOn && !canRow ? yen(r.amount) : amountOf(r, hoursNow(r)));
          amounts[r.kouji] = span;
          return span;
        }
      },
      /* 未計上の行は計上日の位置に札を出し、計上者は値の無い印を出す。札は印刷でも刷る。
         計上者、計上日、操作の列は幅を決めておき、行を計上しても入力欄とボタンの位置を動かさない */
      {
        label: '計上者', card: 'hide', cls: function () { return 'shime-who'; },
        cell: function (r) { return r.recordedOn && r.recorder ? App.empName(r.recorder) : App.NO_VALUE; }
      },
      {
        label: '計上日', card: 'tag', cls: function () { return 'shime-on'; },
        cell: function (r) { return r.recordedOn ? App.fmt.date(r.recordedOn) : App.chip('未計上'); }
      }
    ];
    if (!closed) {
      columns.push({
        label: '操作', card: 'wide', cls: function () { return canRow ? 'shime-op' : ''; },
        cell: rowButton
      });
    }

    var panel = App.panel({
      title: '労務費の計上',
      flush: true,
      tools: bulk ? [bulk] : null,
      body: App.table({
        caption: m + ' の労務費',
        columns: columns,
        rows: rows,
        count: rows.length > 0,
        rowClass: function (r) { return r.kouji === focus ? 'is-focus' : ''; },
        empty: '計上する労務費はありません'
      })
    });
    /* 止めている項目のリンクの行き先 */
    panel.id = 'shime-labor';
    return panel;
  }

  function renderMonth(el, m, query) {
    var row = App.find('months', m);
    var crumbs = [{ label: '月次の締め', href: App.link(['shime']) }, { label: m }];
    var back = { href: App.link(['shime']), label: '月次の締めに戻る' };
    if (!row) {
      App.append(el, App.pageHead({ crumbs: crumbs, title: m + ' の締め', back: back }));
      App.append(el, App.notice(m + ' は月の一覧にありません。', { plain: true }));
      return;
    }
    if (typed.month !== m || !App.isDirty()) typed = { month: m, values: {} };
    var closed = App.isClosedMonth(m);
    var actions = [];
    if (!closed) {
      var v = App.can('month.close', { month: m });
      actions.push(App.button(m + ' を締める', {
        primary: true, id: 'shime-close', op: 'month.close', verdict: v,
        onClick: function () { doClose(m, v); }
      }));
    }
    var head = App.pageHead({
      crumbs: crumbs,
      title: m + ' の締め',
      tags: [stateText(row)],
      back: back,
      actions: actions
    });
    closedInfo(head, row);
    App.append(el, head);
    App.append(el, App.toolbar({ left: [App.button('印刷', { onClick: App.print })] }));
    if (!closed) App.append(el, checkPanel(m, App.closeCheck(m)));
    App.append(el, numbersPanel(m));
    App.append(el, laborPanel(m, query.focus || ''));
    /* 繰越の月は解除の対象にしない */
    if (closed && !row.carryover) {
      App.append(el, App.panel({
        title: 'そのほかの操作',
        body: App.opList([App.button('締めを解除', {
          id: 'shime-reopen', op: 'month.reopen', danger: true,
          verdict: App.can('month.reopen', { month: m }),
          onClick: function () { doReopen(m); }
        })])
      }));
    }
    var targets = [m].concat(App.laborTargets(m).map(function (kno) { return kno + ' ' + m; }));
    App.append(el, App.panel({ title: '履歴', flush: true, body: App.log(App.historyFor(targets), { label: m + ' の履歴' }) }));
  }

  App.screen('shime/:month?', {
    title: function (p) { return p && p.args.month ? p.args.month + ' の締め' : '月次の締め'; },
    render: function (el, params) {
      el.classList.add('shime');
      var m = params.args.month;
      if (m) renderMonth(el, m, params.query || {});
      else {
        typed = { month: '', values: {} };
        renderList(el);
      }
    }
  });
})();
