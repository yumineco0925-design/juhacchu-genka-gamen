(function () {
  'use strict';

  var h = App.h;
  var KEY = 'lists.kenshu';
  var yen = App.fmt.yen;
  /* 画面の中で一覧の条件を変えた後の発注番号。開き直すまで、この発注では URL の指定で表示の条件を合わせない */
  var released = '';
  var opened = null;
  /* 一覧の条件を変えて描き直す前の登録欄の値。描き直した後の欄に戻す */
  var typed = null;

  /* 選べる発注: 承認済・検収済・打切 の通常と追加 */
  function candidates() {
    return App.data().orders.filter(function (o) {
      return ['承認済', '検収済', '打切'].indexOf(o.status) >= 0 && App.orderKind(o) !== '減額';
    });
  }

  /* 欄の検査。保存と同じ判定（App.can の errors）のうち、その欄の分を返す */
  function errorOf(op, ctx, name) {
    return function (v) {
      var input = {};
      input[name] = v;
      return (App.can(op, ctx, input).errors || {})[name] || '';
    };
  }

  /* 日付の欄の誤りが締め済の月の理由か */
  function isClosed(err, v) {
    var d = App.parse.date(v);
    var why = d ? App.closedDateReason(d) : '';
    return !!why && err.indexOf(why) === 0;
  }

  /* 絞り込みの選択。先頭は「全て」。入力途中の印を立てないよう App.field を使わない */
  function pick(label, name, options, value, onChange) {
    var id = App.newId('kenshu-' + name);
    var sel = h('select', { class: 'select', id: id, name: 'kenshu-' + name },
      [h('option', { value: '' }, '全て')].concat(options.map(function (x) {
        return h('option', { value: x.value }, x.label);
      })));
    sel.value = value || '';
    sel.addEventListener('change', function () { onChange(sel.value); });
    return h('div', { class: 'field' }, [h('label', { class: 'field-label', for: id }, label), sel]);
  }

  function uniqueBy(list, keyOf) {
    var seen = {};
    return list.filter(function (x) {
      var k = keyOf(x);
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    });
  }

  /* 始め括弧で始まるまとまりと、その前のまとまりの印。行頭に来た括弧の空きを詰める */
  function openCls(parts, i) {
    var c = [];
    if (i && parts[i].charAt(0) === '（') c.push('kenshu-open');
    if (parts[i + 1] && parts[i + 1].charAt(0) === '（') c.push('kenshu-pre');
    return c;
  }

  /* 語のまとまりを折り返さずに並べ、まとまりの間でだけ折り返す */
  function phrased(parts) {
    var out = [];
    parts.forEach(function (p, i) {
      if (i) out.push(h('wbr'));
      out.push(h('span', { class: ['kenshu-ph'].concat(openCls(parts, i)) }, p));
    });
    return h('span', null, out);
  }

  /* 件名は始め括弧の前で区切る。区切りの中も折り返す */
  function titled(s) {
    var parts = s.split(/(?=（)/);
    if (parts.length < 2) return s;
    return h('span', null, parts.map(function (p, i) {
      var c = openCls(parts, i);
      return h('span', { class: c.length ? c : null }, p);
    }));
  }

  /* 取引先の名称の頭か末に付く法人の種類 */
  var FORMS = ['株式会社', '有限会社', '合同会社', '合資会社', '合名会社'];

  /* 法人の種類を除いた取引先の名称。絞り込みの選択肢に使う */
  function bareName(s) {
    for (var i = 0; i < FORMS.length; i++) {
      var f = FORMS[i];
      if (s.length <= f.length) continue;
      if (s.indexOf(f) === 0) return s.slice(f.length);
      if (s.slice(-f.length) === f) return s.slice(0, -f.length);
    }
    return s;
  }

  /* 対象の発注の取引先。カードでは法人の種類の前後でだけ折り返し、表では折り返さない（表の側は style.css で1行にする） */
  function partnerCell(o) {
    var s = App.partnerName(o.partner);
    for (var i = 0; i < FORMS.length; i++) {
      var f = FORMS[i];
      if (s.length <= f.length) continue;
      var parts = s.indexOf(f) === 0 ? [f, s.slice(f.length)] : s.slice(-f.length) === f ? [s.slice(0, -f.length), f] : null;
      if (parts) return h('span', null, parts.map(function (p) { return h('span', { class: 'kenshu-ph' }, p); }));
    }
    return s;
  }

  /* 工事名は「・」の後と括弧の前でだけ折り返す（括弧の中では折り返さない） */
  function koujiName(s) {
    var at = s.indexOf('（');
    var head = at > 0 ? s.slice(0, at) : s;
    var parts = head.split('・').map(function (p, i, all) { return i < all.length - 1 ? p + '・' : p; });
    if (at > 0) parts.push(s.slice(at));
    return phrased(parts.filter(Boolean));
  }

  /* 工事の値: 工事番号と工事名を分けて置く */
  function koujiValue(o) {
    var k = App.find('kouji', o.kouji);
    if (!k) return o.kouji;
    return h('span', null, [h('span', { class: 'kenshu-kno' }, k.no), ' ', h('span', { class: 'kenshu-kname' }, koujiName(k.name))]);
  }

  function orderNo(o) {
    var kind = App.orderKind(o);
    if (kind === '通常') return o.no;
    return h('span', null, [o.no, h('span', { class: 'sub-line' }, kind + ' 元 ' + o.related)]);
  }

  /* ---------- 選んだ発注と登録欄 ---------- */

  function orderPanel(o, date, v, kept) {
    var hc = App.calc.hacchu(o);
    /* 発注の項目。工事、取引先、件名は幅375でも金額の集計のすぐ上に置く */
    var head = App.info([
      { label: '工事', value: koujiValue(o) },
      { label: '取引先', value: App.partnerName(o.partner) },
      { label: '件名', value: titled(o.title) }
    ]);
    head.classList.add('kenshu-head');
    head.firstChild.classList.add('kenshu-kouji');
    var rest = App.info([
      { label: '費目', value: o.cat },
      App.orderKind(o) === '通常' ? null : { label: '元の発注', value: o.related },
      { label: '発注日', value: App.fmt.date(o.orderedOn) },
      { label: '納期', value: App.fmt.date(o.due) }
    ]);
    rest.classList.add('kenshu-rest');
    /* 金額と登録欄 */
    var entry = h('div', { class: 'kenshu-entry' }, [App.sums([
      { label: '有効発注額（円）', value: yen(hc.eff) },
      { label: '発注検収の累計（円）', value: yen(hc.cum) },
      { label: '未検収残（円）', value: yen(hc.remain) },
      { label: '確認済の請求額（円）', value: yen(hc.confirmed) }
    ])]);
    var form = null;
    var first = '';
    if (hc.remain > 0) {
      var off = !v.ok;
      var ctx = { order: o.no };
      var dateError = errorOf('inspection.register', ctx, 'date');
      var bad = kept ? kept.bad : ['date'];
      first = off || bad.indexOf('date') < 0 ? '' : dateError(date);
      /* 検収日が締め済の月のときだけ出す。日付と訂正の直し方は欄の下の誤りが示し、この枠は締めを解除する道を示す */
      var fix = App.notice('締めを解除して直すとき', {
        plain: true,
        fix: ['経理が月次の締めで、理由を付けて締めを解除します。解除できるのは直近の締め済の月だけです。解除した月の日付で入れた後、経理が締め直します。']
      });
      fix.classList.add('kenshu-fix');
      fix.hidden = !isClosed(first, date);
      form = App.form({
        actions: false,
        fields: [
          {
            name: 'date', label: '検収日', type: 'date', required: true, value: date, disabled: off, error: first,
            check: dateError,
            onInput: function (val, f) {
              var m = dateError(val);
              if (isClosed(m, val)) f.setError(m);
              fix.hidden = !isClosed(m, val);
            }
          },
          {
            name: 'amount', label: '検収額', type: 'yen', required: true, disabled: off,
            value: kept ? kept.values.amount : '',
            check: errorOf('inspection.register', ctx, 'amount')
          },
          {
            name: 'content', label: '内容', type: 'select', required: true, options: App.INSPECTION_KINDS, disabled: off,
            value: kept ? kept.values.content : ''
          }
        ],
        onSubmit: function (values) {
          var res = App.act('inspection.register', { order: o.no }, values);
          if (!res.ok) return res;
          App.flash(res, { links: [{ label: '発注 ' + o.no + ' を開く', href: App.hrefOf(o.no) }] });
          App.render();
          return res;
        }
      });
      form.classList.add('kenshu-form');
      /* 描き直す前に誤りを出していた欄は、戻した値でもう一度判定する */
      bad.forEach(function (n) { if (n !== 'date' && !off) form.field(n).check(); });
      /* 日付と金額の欄で Enter を押すと登録する */
      form.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229 || e.target.tagName !== 'INPUT') return;
        e.preventDefault();
        form.send();
      });
      App.append(entry, [form, fix]);
    }
    var title = h('span', { class: 'kenshu-title' }, ['発注 ' + o.no, App.chip(App.orderStatusLabel(o))]);
    var panel = App.panel({
      title: title,
      tools: [
        h('a', { class: 'btn btn-s', href: App.hrefOf(o.no) }, '発注の詳細を開く'),
        h('a', { class: 'btn btn-s', href: App.link(['kenshu']) }, '発注を選び直す')
      ],
      body: h('div', { class: 'kenshu-sel' }, [head, rest, entry])
    });
    /* 選んだ発注を開いたときに画面へ入れる所。登録できないときは発注番号、検収日が締め済の月のときは登録欄と直し方の枠、ほかは発注番号から登録欄まで */
    (!v.ok ? title : first ? entry : panel).classList.add('is-focus');
    return { el: panel, form: form };
  }

  /* ---------- 選んだ発注の発注検収 ---------- */

  function cancel(i) {
    App.confirmWithReason('発注検収 ' + i.no + ' を取り消します。', {
      title: '発注検収の取消', ok: '取り消す', id: 'kenshu-cancel-ok', dialogId: 'dlg-kenshu-cancel',
      lines: ['検収日 ' + App.fmt.date(i.date) + '、検収額 ' + yen(i.amount) + '円、' + i.content],
      submit: function (reason) { return App.act('inspection.cancel', { inspection: i.no }, { reason: reason }); }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      App.render();
    });
  }

  function correct(i) {
    var verdict = App.can('inspection.correct', { inspection: i.no });
    App.formDialog({
      title: '発注検収の訂正', ok: '訂正を登録', id: 'dlg-kenshu-correct', okId: 'kenshu-correct-ok',
      text: '発注検収 ' + i.no + '（検収日 ' + App.fmt.date(i.date) + '、' + yen(i.amount) + '円）を当月の日付で訂正します。',
      lines: ['訂正できるのは ' + yen(Math.max(verdict.left || 0, 0)) + '円までで、マイナス額で登録します。'],
      verdict: verdict,
      fields: [
        {
          name: 'date', label: '検収日', type: 'date', required: true, value: App.today(),
          check: errorOf('inspection.correct', { inspection: i.no }, 'date')
        },
        { name: 'amount', label: '訂正する額', type: 'yen', required: true },
        { name: 'reason', label: '理由', type: 'textarea', required: true, max: 200 }
      ],
      submit: function (values) { return App.act('inspection.correct', { inspection: i.no }, values); }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      App.render();
    });
  }

  /* 取消は未締めの月の物、訂正は締め済の月の物 */
  function opButton(i) {
    if (App.isClosedMonth(i.date)) {
      return App.button('訂正', {
        small: true, side: true, op: 'inspection.correct', id: 'kenshu-correct-' + i.no,
        verdict: App.can('inspection.correct', { inspection: i.no }),
        onClick: function () { correct(i); }
      });
    }
    return App.button('取消', {
      small: true, side: true, op: 'inspection.cancel', id: 'kenshu-cancel-' + i.no,
      verdict: App.can('inspection.cancel', { inspection: i.no }),
      onClick: function () { cancel(i); }
    });
  }

  function inspectionPanel(o, rows) {
    function any(test) { return rows.some(test); }
    /* 値のある行が1つも無い列は出さない */
    var columns = [
      { key: 'no', label: '検収番号', nw: true, card: 'head' },
      { key: 'date', label: '検収日', nw: true, date: true },
      { key: 'amount', label: '検収額（円）', num: true, yen: true },
      { key: 'content', label: '内容', nw: true },
      { label: '状態', nw: true, card: 'tag', cell: function (i) { return App.chip(i.status); } },
      any(function (i) { return i.corrects; }) ? {
        key: 'corrects', label: '訂正元', nw: true, cls: function (i) { return i.corrects ? '' : 'k-hide'; }
      } : null,
      any(function (i) { return i.cancelReason; }) ? {
        key: 'cancelReason', label: '取消の理由', cls: function (i) { return i.cancelReason ? 'kenshu-reason' : 'k-hide'; }
      } : null,
      any(function (i) { return i.status === '有効'; }) ? {
        label: '操作', card: 'wide',
        cls: function (i) { return i.status === '有効' ? '' : 'k-hide'; },
        cell: function (i) { return i.status === '有効' ? opButton(i) : null; }
      } : null
    ].filter(Boolean);
    return App.panel({
      title: '発注 ' + o.no + ' の発注検収',
      flush: true,
      body: App.table({
        caption: '発注 ' + o.no + ' の発注検収',
        columns: columns,
        rows: rows,
        count: false,
        rowClass: function (i) { return i.status === '取消' ? 'is-void' : ''; },
        empty: '発注検収はまだありません'
      })
    });
  }

  /* ---------- 対象の発注の一覧 ---------- */

  /* 絞り込みの選択肢。値で並べる */
  function optionsOf(list, key, labelOf) {
    var opts = uniqueBy(list, function (o) { return o[key]; }).map(function (o) {
      return { value: o[key], label: labelOf(o) };
    });
    return App.sortRows(opts, function (x) { return x.value; });
  }

  function listPanel(sel, cond, change) {
    var all = candidates();
    /* 一覧に出る範囲。既定は未検収残のある発注だけ */
    var scope = all.filter(function (o) { return cond.all || App.calc.hacchu(o).remain > 0; });
    var rows = scope.filter(function (o) {
      if (cond.kouji && o.kouji !== cond.kouji) return false;
      return !cond.partner || o.partner === cond.partner;
    });
    rows = App.sortRows(rows, function (o) { return o.due; });

    /* 選択肢は一覧に出る範囲から作り、取引先は選んだ工事に発注がある物だけにする。選んでいる値は範囲の外でも残す */
    var koujiOpts = optionsOf(all.filter(function (o) {
      return o.kouji === cond.kouji || scope.indexOf(o) >= 0;
    }), 'kouji', function (o) {
      var k = App.find('kouji', o.kouji);
      return k ? k.no + ' ' + k.name : o.kouji;
    });
    var partnerOpts = optionsOf(all.filter(function (o) {
      return o.partner === cond.partner || (scope.indexOf(o) >= 0 && (!cond.kouji || o.kouji === cond.kouji));
    }), 'partner', function (o) { return bareName(App.partnerName(o.partner)); });

    /* 工事を変えたとき、その工事に発注が無い取引先の絞り込みは外す */
    function pickKouji(val) {
      var keep = !cond.partner || scope.some(function (o) {
        return o.partner === cond.partner && (!val || o.kouji === val);
      });
      change(keep ? { kouji: val } : { kouji: val, partner: '' });
    }

    var panel = App.panel({
      title: '対象の発注',
      flush: true,
      body: [
        App.filters([
          pick('工事', 'kouji', koujiOpts, cond.kouji, pickKouji),
          pick('取引先', 'partner', partnerOpts, cond.partner, function (val) { change({ partner: val }); }),
          App.chip('検収済と打切も出す', { pressed: cond.all, onClick: function () { change({ all: !cond.all }); } })
        ]),
        App.table({
          caption: '対象の発注',
          columns: [
            { label: '発注番号', nw: true, card: 'head', cell: orderNo },
            { label: '工事番号', nw: true, card: 'hide', value: function (o) { return o.kouji; } },
            { label: '取引先', card: 'title', cell: partnerCell, cls: function () { return 'kenshu-partner'; } },
            { label: '件名', card: 'hide', cell: function (o) { return titled(o.title); }, cls: function () { return 'kenshu-subject'; } },
            {
              label: '未検収残（円）', num: true, yen: true, value: function (o) { return App.calc.hacchu(o).remain; },
              cls: function () { return 'kenshu-remain'; }
            },
            { label: '納期', nw: true, date: true, value: function (o) { return o.due; }, cls: function () { return 'kenshu-due'; } },
            /* カードでは打切の札だけを出す */
            {
              label: '状態', nw: true, card: 'tag', cell: function (o) { return App.chip(App.orderStatusLabel(o)); },
              cls: function (o) { return o.status === '打切' ? '' : 'k-hide'; }
            }
          ],
          rows: rows,
          total: all.length,
          href: function (o) { return App.link(['kenshu'], { hacchu: o.no }); },
          rowClass: function (o) {
            return [sel && o.no === sel.no ? 'is-focus' : '', o.status === '打切' ? 'is-void' : ''].join(' ');
          },
          empty: '条件に合う発注はありません',
          onClear: function () { App.remember(KEY, null); App.render(); }
        })
      ]
    });
    panel.classList.add('kenshu-list');
    return panel;
  }

  App.screen('kenshu', {
    title: '発注検収の登録',
    render: function (el, params) {
      el.classList.add('kenshu');
      var query = params.query || {};
      var st = App.recall(KEY) || {};
      var cond = { kouji: st.kouji || '', partner: st.partner || '', all: !!st.all };
      var sel = query.hacchu ? App.find('orders', query.hacchu) : null;
      if (params !== opened || !sel) released = '';
      opened = params;

      /* URL の指定を保存した条件より優先し、選んだ発注が一覧に出るように表示の条件だけを合わせる。保存はしない */
      if (sel && released !== sel.no) {
        if (cond.kouji && cond.kouji !== sel.kouji) cond.kouji = sel.kouji;
        if (cond.partner && cond.partner !== sel.partner) cond.partner = sel.partner;
        if (!cond.all && App.calc.hacchu(sel).remain <= 0) cond.all = true;
      }

      /* 画面の中で変えた条件は、見えている条件に変えた分を足して保存する */
      function change(patch) {
        var next = { kouji: cond.kouji, partner: cond.partner, all: cond.all };
        Object.keys(patch).forEach(function (k) { next[k] = patch[k]; });
        if (sel) released = sel.no;
        App.remember(KEY, next);
        typed = picked && picked.form && App.isDirty() ? {
          order: sel.no,
          values: picked.form.values(),
          bad: picked.form.fields.filter(function (f) { return f.classList.contains('is-err'); }).map(function (f) { return f.name; })
        } : null;
        App.render();
      }

      var v = App.can('inspection.register', { order: sel ? sel.no : null });
      var mine = sel ? App.data().inspections.filter(function (i) { return i.order === sel.no; }) : [];
      var kept = typed && sel && typed.order === sel.no && typed.values.date !== undefined ? typed : null;
      typed = null;
      var picked = sel ? orderPanel(sel, kept ? kept.values.date : query.date || App.today(), v, kept) : null;

      App.append(el, App.pageHead({
        crumbs: [{ label: '発注検収の登録' }],
        title: '発注検収の登録',
        actions: [App.button('発注検収を登録', {
          primary: true, id: 'kenshu-register', op: 'inspection.register', verdict: v,
          onClick: function () { if (picked && picked.form) picked.form.send(); }
        })]
      }));
      if (query.hacchu && !sel) {
        App.append(el, App.notice('発注 ' + query.hacchu + ' は見つかりません。', { plain: true }));
      }
      if (picked) App.append(el, [picked.el, inspectionPanel(sel, mine)]);
      App.append(el, listPanel(sel, cond, change));
    }
  });
})();
