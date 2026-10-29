(function () {
  'use strict';

  var LIST_KEY = 'lists.seikyu';
  var STATUSES = ['受付', '確認済', '差戻し', '取消'];
  var h = App.h;

  /* 条件を触った後は、同じ URL のまま描き直しても focus で条件を上書きしない */
  var released = null;

  function focusHref(no) { return App.link(['seikyu'], { focus: no }); }

  function hit(v, q) {
    if (!q) return true;
    var text = [v.no, App.partnerName(v.partner), v.order, v.invoiceNo].join(' ');
    return App.toHalf(text).toUpperCase().indexOf(App.toHalf(q).toUpperCase()) >= 0;
  }

  /* 判定の相手の請求が一覧にあれば、その行の直後に並べる */
  function pairRows(rows, judges) {
    var byNo = {}, done = {}, out = [];
    rows.forEach(function (v) { byNo[v.no] = v; });
    rows.forEach(function (v) {
      if (done[v.no]) return;
      done[v.no] = true;
      out.push(v);
      var j = judges[v.no];
      (j && !j.ok ? j.related : []).forEach(function (no) {
        if (byNo[no] && !done[no]) { done[no] = true; out.push(byNo[no]); }
      });
    });
    return out;
  }

  function about(v) {
    return '請求 ' + v.no + '（' + App.partnerName(v.partner) + '、' + App.fmt.yen(v.amount) + '円）';
  }

  function invoiceFields() {
    return [
      { name: 'invoiceNo', label: '請求書番号', type: 'text', required: true, max: 30 },
      { name: 'invoiceDate', label: '請求書の日付', type: 'date', required: true },
      { name: 'amount', label: '請求額', type: 'yen', required: true }
    ];
  }

  function openReceive() {
    App.formDialog({
      title: '請求の受付', ok: '受け付ける', id: 'dlg-seikyu', okId: 'seikyu-receive-ok',
      verdict: App.can('invoice.receive'),
      fields: [{ name: 'order', label: '発注番号', type: 'select', required: true, options: App.invoiceOrderOptions() }]
        .concat(invoiceFields()),
      submit: function (values) { return App.act('invoice.receive', {}, values); }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      App.go(focusHref(res.no));
    });
  }

  function openReaccept(v) {
    App.formDialog({
      title: '請求の再受付', ok: '再び受け付ける', id: 'dlg-seikyu', okId: 'seikyu-reaccept-ok',
      text: h('p', null, ['差戻しの' + about(v) + 'の修正版を、', h('span', { class: 'nw' }, '発注 ' + v.order), ' で受け付けます。']),
      verdict: App.can('invoice.reaccept', { invoice: v.no }),
      fields: invoiceFields(),
      submit: function (values) { return App.act('invoice.reaccept', { invoice: v.no }, values); }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      App.go(focusHref(res.no));
    });
  }

  function openConfirm(v) {
    var book = App.bookMonths(v, App.today());
    App.formDialog({
      title: '請求の確認', ok: '確認済にする', id: 'dlg-seikyu', okId: 'seikyu-confirm-ok',
      text: about(v) + 'を確認済にします。',
      lines: book.note ? [book.note] : [],
      verdict: App.can('invoice.confirm', { invoice: v.no }),
      fields: [{ name: 'bookMonth', label: '計上月', type: 'select', required: true, value: book.def, options: book.options }],
      submit: function (values) { return App.act('invoice.confirm', { invoice: v.no }, values); }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      App.render();
    });
  }

  function openReturn(v) {
    App.confirmWithReason(about(v) + 'を差し戻します。', {
      title: '請求の差戻し', ok: '差し戻す', label: '差戻しの理由', id: 'seikyu-return-ok', dialogId: 'dlg-seikyu',
      submit: function (reason) { return App.act('invoice.return', { invoice: v.no }, { reason: reason }); }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      App.render();
    });
  }

  /* 二重の疑いの相手が1件なら、取り消さない方を正本にする */
  function openCancel(v, j) {
    var dups = j && !j.ok ? j.related.filter(function (no) { return App.find('invoices', no); }) : [];
    var main = dups.length === 1 ? dups[0] : '';
    App.confirmWithReason(about(v) + 'を取り消します。', {
      title: '請求の取消', ok: '取り消す', label: '取消の理由', id: 'seikyu-cancel-ok', dialogId: 'dlg-seikyu',
      lines: main ? ['正本は ' + main + ' です。'] : [],
      submit: function (reason) { return App.act('invoice.cancel', { invoice: v.no }, { reason: reason, main: main }); }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      if (main) App.go(focusHref(main));
      else App.render();
    });
  }

  /* 折り返すときに1つのまとまりとして扱う文の単位 */
  function unit(nodes) { return h('span', { class: 'seikyu-unit' }, nodes); }

  /* 子の並びを、sep の語の後ろで区切ったまとまりに分ける。番号やリンクの要素は途中で分けない */
  function toUnits(el, sep) {
    var groups = [[]];
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType !== 3) { groups[groups.length - 1].push(n); return; }
      n.nodeValue.split(sep).forEach(function (t, i) {
        if (t) groups[groups.length - 1].push(document.createTextNode(t));
        if (i % 2) groups.push([]);
      });
    });
    groups = groups.filter(function (g) { return g.length; });
    if (groups.length < 2) return;
    el.textContent = '';
    groups.forEach(function (g) { App.append(el, unit(g)); });
  }

  /* 押せない理由と直し方の枠の見出しは「ため」の後ろで先に折り返す */
  function keepGroups(el) {
    if (el) Array.prototype.forEach.call(el.querySelectorAll('.reason, .notice-title'), function (r) { toUnits(r, /(ため)/); });
    return el;
  }

  /* 「ため」は前の字と同じ行に置く */
  function keepTame(el) {
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), list = [], t;
    while ((t = walk.nextNode())) {
      if (/.ため/.test(t.nodeValue) && !t.parentNode.closest('.nw, .seikyu-nobr, button, option')) list.push(t);
    }
    list.forEach(function (n) {
      var frag = document.createDocumentFragment();
      n.nodeValue.split(/(.ため)/).forEach(function (x, i) {
        if (x) frag.appendChild(i % 2 ? h('span', { class: 'seikyu-nobr' }, x) : document.createTextNode(x));
      });
      n.parentNode.replaceChild(frag, n);
    });
    return el;
  }

  function opsCell(v, j) {
    var ctx = { invoice: v.no };
    return keepGroups(h('span', { class: 'seikyu-ops' }, [
      App.button('確認済にする', {
        small: true, id: 'seikyu-confirm-' + v.no, op: 'invoice.confirm',
        verdict: App.can('invoice.confirm', ctx), onClick: function () { openConfirm(v); }
      }),
      App.button('差戻し', {
        small: true, id: 'seikyu-return-' + v.no, op: 'invoice.return',
        verdict: App.can('invoice.return', ctx), onClick: function () { openReturn(v); }
      }),
      App.button('取消', {
        small: true, id: 'seikyu-cancel-' + v.no, op: 'invoice.cancel',
        verdict: App.can('invoice.cancel', ctx), onClick: function () { openCancel(v, j); }
      })
    ]));
  }

  function reacceptCell(v) {
    return App.button('再受付', {
      small: true, id: 'seikyu-reaccept-' + v.no, op: 'invoice.reaccept',
      verdict: App.can('invoice.reaccept', { invoice: v.no }), onClick: function () { openReaccept(v); }
    });
  }

  /* 取引先名は、会社の種類と名前の間で折り返す。10字を超える語があれば字の間でも折り返す */
  function partnerCell(code) {
    var name = App.partnerName(code);
    var m = /^(株式会社|有限会社|合同会社)(.+)$/.exec(name) || /^(.+?)(株式会社|有限会社|合同会社)$/.exec(name);
    var long = (m ? [m[1], m[2]] : [name]).some(function (p) { return p.length > 10; });
    return h('span', { class: ['seikyu-name', long ? 'seikyu-name-long' : null] }, m ? [m[1], h('wbr'), m[2]] : name);
  }

  /* 見出しを2段にする。2段目は小さい字 */
  function subLabel(a, b) { return h('span', null, [a, h('span', { class: 'sub-line' }, b)]); }
  function twoLines(a, b) { return h('span', null, [a, h('br'), b]); }

  /* 幅640以下で隠す列の値。焦点の行だけ、請求額の下に並べる */
  function moreList(v, status, pay) {
    var c = status === '受付' ? App.calc.hacchu(v.order) : null;
    var items = [
      ['発注番号', h('a', { href: App.hrefOf(v.order) }, v.order)],
      ['請求書番号', v.invoiceNo],
      ['請求書の日付', App.fmt.date(v.invoiceDate)]
    ];
    if (c) items.push(['発注検収の累計（円）', App.fmt.yen(c.cum), 'num'], ['確認済の請求額（円）', App.fmt.yen(c.confirmed), 'num']);
    else if (status === '確認済') {
      items.push(['確認日', App.fmt.date(v.checkedOn)], ['計上月', App.fmt.month(v.bookMonth)]);
      if (pay) items.push(['支払予定日', App.fmt.date(App.calcPayDate(v))]);
    } else items.push([status + 'の理由', v.cancelReason || App.NO_VALUE, 'seikyu-more-long']);
    var dl = h('dl', { class: 'kv seikyu-more' });
    items.forEach(function (it) {
      App.append(dl, [h('dt', null, it[0]), h('dd', { class: it[2] || null }, it[1])]);
    });
    return dl;
  }

  function columnsFor(status, judges, pay, focusNo) {
    var cols = [
      { key: 'no', label: '受付番号', nw: true, card: 'head' },
      { key: 'partner', label: subLabel('取引先', '発注番号'), card: 'title', cell: function (v) {
        return h('span', null, [partnerCell(v.partner),
          h('span', { class: 'sub-line seikyu-order' }, h('a', { href: App.hrefOf(v.order) }, v.order))]);
      } },
      { key: 'invoiceNo', label: subLabel('請求書番号', '請求書の日付'), nw: true, card: 'hide', cell: function (v) {
        return h('span', null, [h('span', { class: 'seikyu-ino' }, v.invoiceNo), h('span', { class: 'sub-line' }, App.fmt.date(v.invoiceDate))]);
      } },
      { key: 'amount', label: '請求額（円）', num: true, yen: true },
      /* カードだけで使う列。幅641以上では見出しごと隠す。焦点の行には直し方の枠も置く */
      { key: 'more', label: h('span', { class: 'seikyu-more-h' }, '詳細'), card: 'wide',
        cls: function () { return 'seikyu-more-c'; },
        cell: function (v) {
          if (v.no !== focusNo) return null;
          return [moreList(v, status, pay), status === '受付' ? fixFor(v, judges[v.no]) : null];
        } }
    ];
    if (status === '受付') {
      return cols.concat([
        { key: 'cum', label: twoLines('発注検収の', '累計（円）'), num: true, yen: true, card: 'hide',
          value: function (v) { return App.calc.hacchu(v.order).cum; } },
        { key: 'confirmed', label: twoLines('確認済の', '請求額（円）'), num: true, yen: true, card: 'hide',
          value: function (v) { return App.calc.hacchu(v.order).confirmed; } },
        { key: 'judge', label: '判定', card: 'tag', cell: function (v) { return App.chip(judges[v.no].label); } },
        { key: 'act', label: '操作', card: 'wide', cell: function (v) { return opsCell(v, judges[v.no]); } }
      ]);
    }
    if (status === '確認済') {
      return cols.concat([
        { key: 'checkedOn', label: subLabel('確認日', '計上月'), nw: true, card: 'hide', cell: function (v) {
          return h('span', null, [App.fmt.date(v.checkedOn), h('span', { class: 'sub-line' }, App.fmt.month(v.bookMonth))]);
        } },
        pay ? { key: 'payDate', label: '支払予定日', nw: true, date: true, card: 'hide',
          value: function (v) { return App.calcPayDate(v); } } : null,
        { key: 'state', label: '状態', card: 'tag', cell: function (v) {
          return App.tags([v.status, App.isLateInvoice(v) ? '過月分' : null, pay && App.isOverdue(v) ? '支払期日経過' : null]);
        } }
      ]).filter(Boolean);
    }
    cols = cols.concat([
      { key: 'cancelReason', label: status + 'の理由', card: 'hide', cell: function (v) {
        return h('span', { class: 'seikyu-why' }, v.cancelReason || App.NO_VALUE);
      } },
      { key: 'state', label: '状態', card: 'tag', cell: function (v) { return App.tags([v.status]); } }
    ]);
    if (status === '差戻し') {
      cols.push({ key: 'act', label: '操作', card: 'wide', cls: function () { return 'seikyu-reacc'; }, cell: reacceptCell });
    }
    return cols;
  }

  /* 直し方の枠。発注の側で直す判定には、発注と発注検収の登録へのリンクを付ける */
  function fixFor(v, j) {
    if (!j || j.ok) return null;
    var dup = j.related.some(function (no) { return App.find('invoices', no); });
    if (dup) return keepGroups(App.fixBox(j));
    return keepGroups(App.fixBox(j, { links: [
      { label: v.order + ' を開く', href: App.hrefOf(v.order) },
      { label: '発注検収の登録を開く', href: App.link(['kenshu'], { hacchu: v.order }) }
    ] }));
  }

  /* 幅641以上の直し方の枠。焦点の行と、その後ろに並べた判定の相手の行のすぐ下に、1行を足して置く。
     span は幅641以上で見える列の数 */
  function addFixRow(block, rows, fv, j, span) {
    var box = fixFor(fv, j);
    var body = block.querySelector('tbody');
    if (!box || !body) return;
    var at = rows.indexOf(fv);
    while (at + 1 < rows.length && j.related.indexOf(rows[at + 1].no) >= 0) at++;
    body.insertBefore(h('tr', { class: 'seikyu-fixrow' }, h('td', { colspan: span }, box)), body.rows[at + 1] || null);
  }

  /* 履歴の「項目 値、」の組をまとめ、組の途中では折り返さない */
  function keepPairs(el) {
    Array.prototype.forEach.call(el.querySelectorAll('.log-detail'), function (d) { toUnits(d, /(、)/); });
    return el;
  }

  /* 焦点の行から直し方の枠の行までを1つの tbody（.is-focus）にまとめる。開いたときは、このまとまりが最初の画面に入るよう送られる */
  function groupFocus(block) {
    var fix = block.querySelector('tr.seikyu-fixrow');
    if (!fix) return;
    var body = fix.parentNode, table = body.parentNode;
    var rows = Array.prototype.slice.call(body.rows);
    var from = rows.indexOf(body.querySelector('tr.is-focus')), to = rows.indexOf(fix);
    if (from < 0) return;
    var group = h('tbody', { class: 'is-focus' }, rows.slice(from, to + 1));
    table.insertBefore(group, body.nextSibling);
    if (to + 1 < rows.length) table.insertBefore(h('tbody', null, rows.slice(to + 1)), group.nextSibling);
    if (!from) table.removeChild(body);
  }

  function render(el, p) {
    var query = (p && p.query) || {};
    var all = App.data().invoices;
    var fv = query.focus ? App.find('invoices', query.focus) : null;
    var useFocus = !!fv && released !== p;
    var st = App.recall(LIST_KEY) || {};
    var q = st.q || '';
    var status = STATUSES.indexOf(st.status) >= 0 ? st.status : '受付';
    /* URL で指された行は、保存した条件より優先して出す（条件は保存しない） */
    if (useFocus) {
      status = fv.status;
      if (!hit(fv, q)) q = '';
    }
    var pay = App.can('view.payment').ok;

    function keep(key, value) {
      var s = App.recall(LIST_KEY) || {};
      if (useFocus) {
        s.status = status;
        if (q) s.q = q; else delete s.q;
        released = p;
      }
      if (key) { if (value) s[key] = value; else delete s[key]; }
      App.remember(LIST_KEY, s);
      App.render();
    }

    var found = all.filter(function (v) { return hit(v, q); });
    var rows = found.filter(function (v) { return v.status === status; });
    var judges = {};
    if (status === '受付') {
      rows.forEach(function (v) { judges[v.no] = App.judge(v); });
      rows = pairRows(App.sortRows(rows, function (v) { return v.no; }), judges);
    } else {
      rows = App.sortRows(rows, function (v) { return v.no; });
    }
    var shown = fv && rows.indexOf(fv) >= 0;

    var tabs = STATUSES.map(function (s) {
      return { value: s, label: s, count: found.filter(function (v) { return v.status === s; }).length };
    });

    var cols = columnsFor(status, judges, pay, fv ? fv.no : '');
    var none = q ? '条件に合う請求はありません' : status + 'の請求はありません';
    var list = App.table({
      columns: cols, rows: rows, total: all.length, caption: '請求の一覧',
      empty: status === '受付' ? none : [unit(none + '。'), unit('条件を外すと受付の一覧に戻ります')],
      href: function (v) { return focusHref(v.no); },
      rowClass: function (v) {
        return [fv && v.no === fv.no ? 'is-focus' : '', v.status === '取消' ? 'is-void' : ''].join(' ').trim();
      },
      onClear: function () { released = p; App.remember(LIST_KEY, null); App.render(); }
    });
    /* 詳細の列は幅641以上で隠れるので、足す行はその1列を除いた幅にする */
    if (shown && status === '受付') {
      addFixRow(list, rows, fv, judges[fv.no], cols.length - 1);
      groupFocus(list);
    }
    if (status === '確認済') list.classList.add('seikyu-done');

    el.classList.add('seikyu');
    App.append(el, [
      App.pageHead({
        crumbs: [{ label: '請求の確認' }],
        title: '請求の確認',
        actions: [App.button('請求を受付', {
          primary: true, id: 'seikyu-receive', verdict: App.can('invoice.receive'),
          onClick: openReceive
        })]
      }),
      App.filters([
        App.search({
          name: 'seikyu', placeholder: '受付番号、取引先、発注番号、請求書番号',
          value: useFocus ? q : undefined,
          onSearch: function (t) { keep('q', t); }
        }),
        App.chips(tabs, status, function (v) { keep('status', v); }, '状態')
      ]),
      list,
      shown ? App.panel({ title: fv.no + ' の履歴', body: keepPairs(App.log(App.historyFor(fv.no, { related: true }))) }) : null
    ]);
    keepTame(el);
  }

  App.screen('seikyu', { title: '請求の確認', render: render });
})();
