(function () {
  'use strict';

  var LIST_KEY = 'lists.torihikisaki';
  var LIST_HREF = '#/torihikisaki';
  var open = false;

  /* 停止の札と、支払の情報を見られる役割だけに出す支払期日経過の札 */
  function stateTags(t, c, pay) {
    return App.tags([t.status === '停止' ? t.status : null, pay && c.overdue.length ? '支払期日経過' : null]);
  }

  /* 名称は法人の種類の前後、支払条件は締めと払いの間でだけ折り返す。8字を超える区切りは中で折り返してよい */
  var FORMS = ['特定非営利活動法人', '一般社団法人', '一般財団法人', '公益社団法人', '公益財団法人', '社会福祉法人',
    '株式会社', '有限会社', '合同会社', '合資会社', '合名会社', '医療法人', '学校法人', '宗教法人'];

  function phrases(parts, space) {
    var out = [];
    parts.forEach(function (s, i) {
      if (i) out.push(space ? ' ' : App.h('wbr'));
      out.push(s.length <= 8 ? App.h('span', { class: 'torihikisaki-ph' }, s) : s);
    });
    return App.h('span', null, out);
  }

  function nameCell(name) {
    var s = String(name || '').trim();
    if (/\s/.test(s)) return phrases(s.split(/\s+/), true);
    for (var i = 0; i < FORMS.length; i++) {
      var f = FORMS[i];
      if (s.length <= f.length) continue;
      if (s.indexOf(f) === 0) return phrases([f, s.slice(f.length)]);
      if (s.slice(-f.length) === f) return phrases([s.slice(0, -f.length), f]);
    }
    return phrases([s]);
  }

  function termsCell(terms) {
    var s = String(terms || '');
    if (!s) return App.NO_VALUE;
    var at = s.indexOf('締め');
    return at > 0 && at + 2 < s.length ? phrases([s.slice(0, at + 2), s.slice(at + 2)]) : phrases([s]);
  }

  /* 登録の欄は名称、区分、担当者名と、支払の情報を見られる役割だけに支払条件。出さない支払条件は既定の値、備考は空で送る */
  function openRegister(kind) {
    var pay = App.can('view.payment').ok;
    var fields = App.partnerFields(null, kind);
    var terms = fields.filter(function (f) { return f.name === 'terms'; })[0];
    App.formDialog({
      title: '取引先を登録', ok: '登録', id: 'dlg-torihikisaki', okId: 'torihikisaki-register-ok',
      fields: fields.filter(function (f) { return f.name !== 'note' && (pay || f.name !== 'terms'); }),
      submit: function (values) {
        var v = { note: '' };
        Object.keys(values || {}).forEach(function (k) { v[k] = values[k]; });
        if (!pay && terms) v.terms = terms.value;
        return App.act('partner.register', {}, v);
      }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      App.go(App.link(['torihikisaki', res.no]));
    });
  }

  /* 区分は編集で変えないので、選択欄でなく値の文字で出す。支払条件の欄は支払の情報を見られる役割だけに出し、出さないときは今の値のまま */
  function openEdit(t) {
    var pay = App.can('view.payment').ok;
    var fields = App.partnerFields(t.code).filter(function (f) { return pay || f.name !== 'terms'; }).map(function (f) {
      return f.name === 'kind' ? { name: f.name, label: f.label, type: 'fixed', value: f.value } : f;
    });
    App.formDialog({
      title: '取引先を編集', ok: '保存', id: 'dlg-torihikisaki', okId: 'torihikisaki-save',
      fields: fields,
      submit: function (values) { return App.act('partner.edit', { partner: t.code }, values); }
    }).then(function (res) {
      if (!res) return;
      App.flash(res);
      App.render();
    });
  }

  /* 見出しを付けたチップのまとまり。見出しをチップの組の名前にする。幅640以下では「絞り込み」で開く */
  function group(label, chips) {
    var id = App.newId('torihikisaki-group');
    chips.setAttribute('aria-labelledby', id);
    return App.h('div', { class: 'torihikisaki-group torihikisaki-more', id: App.newId('torihikisaki-more') },
      [App.h('span', { class: 'torihikisaki-group-label', id: id }, label), chips]);
  }

  /* 列の見出しを語で分ける。幅1280未満で2行にする */
  function thLines(parts) {
    return App.h('span', null, parts.map(function (s) { return App.h('span', { class: 'torihikisaki-th-line' }, s); }));
  }

  /* 表の1つの列の見出しと各行のマスに印を付ける。幅の狭いときに外す列や折り返さない見出しを CSS で選ぶ */
  function markCol(block, columns, key, cls) {
    var at = columns.map(function (c) { return c.key; }).indexOf(key);
    if (at < 0) return;
    Array.prototype.forEach.call(block.querySelectorAll('tr'), function (tr) {
      if (tr.children[at]) tr.children[at].classList.add(cls);
    });
  }

  function renderList(el) {
    var st = App.recall(LIST_KEY) || {};
    var q = App.toHalf(st.q || '').toUpperCase();
    var pay = App.can('view.payment').ok;
    var all = App.data().partners;
    var calc = {};
    all.forEach(function (t) { calc[t.code] = App.calc.torihikisaki(t); });
    var overOnly = pay && !!st.overdueOnly;
    var sort = st.sort === 'pay' && !pay ? 'code' : (st.sort || 'code');

    function change(key, value) {
      st[key] = value;
      App.remember(LIST_KEY, st);
      App.render();
    }

    /* 検索で絞った行。支払期日経過の件数は区分を、区分の件数は支払期日経過を掛けたうえで数える */
    var found = all.filter(function (t) {
      return !q || App.toHalf(t.code + ' ' + t.name).toUpperCase().indexOf(q) >= 0;
    });
    var overCount = found.filter(function (t) { return (!st.kind || t.kind === st.kind) && calc[t.code].overdue.length > 0; }).length;
    var hit = found.filter(function (t) { return !overOnly || calc[t.code].overdue.length > 0; });
    var rows = hit.filter(function (t) { return !st.kind || t.kind === st.kind; });
    if (sort === 'committed') rows = App.sortRows(rows, function (t) { return calc[t.code].committed; }, 'desc');
    else if (sort === 'pay') rows = App.sortRows(rows, function (t) { return calc[t.code].nextPayDate; });
    else rows = App.sortRows(rows, function (t) { return t.code; });

    var kinds = [{ value: '', label: '全て', count: hit.length }].concat(App.PARTNER_KINDS.map(function (k) {
      return { value: k, label: k, count: hit.filter(function (t) { return t.kind === k; }).length };
    }));
    var sorts = [{ value: 'code', label: 'コードの順' }, { value: 'committed', label: '発注済の多い順' }];
    if (pay) sorts.push({ value: 'pay', label: '支払予定日の近い順' });

    /* 施主には発注も支払もないので、額は「–」にし、カードでは出さない */
    var client = function (t) { return t.kind === '施主'; };
    var columns = [
      { key: 'code', label: 'コード', nw: true, card: 'head' },
      { key: 'name', label: '名称', card: 'title', cell: function (t) { return nameCell(t.name); } },
      { key: 'kind', label: '区分', nw: true },
      { key: 'state', label: '状態', card: 'tag', cls: function () { return 'torihikisaki-state'; },
        cell: function (t) { return stateTags(t, calc[t.code], pay); } },
      { key: 'committed', label: '発注済（円）', num: true, yen: true, cls: function (t) { return client(t) ? 'k-hide' : ''; },
        value: function (t) { return client(t) ? null : calc[t.code].committed; } },
      pay ? { key: 'scheduled', label: thLines(['確認済で', phrases(['支払予定の', '額（円）'])]), num: true, yen: true, card: 'hide',
        value: function (t) { return client(t) ? null : calc[t.code].scheduled; } } : null,
      pay ? { key: 'nextPayDate', label: thLines(['次の', '支払予定日']), nw: true, date: true, card: 'hide',
        value: function (t) { return calc[t.code].nextPayDate; } } : null,
      pay ? { key: 'terms', label: '支払条件', card: 'hide', cell: function (t) { return termsCell(t.terms); } } : null
    ].filter(Boolean);

    /* 登録の区分は、絞り込み中の区分を今の役割が登録できるときだけ引き継ぐ */
    var regKind = st.kind && App.can('partner.register', { kind: st.kind }).ok ? st.kind : undefined;

    var groups = [
      pay ? group('支払', App.h('div', { class: 'chips' }, App.chip('支払期日経過だけ', {
        pressed: overOnly, count: overCount, onClick: function () { change('overdueOnly', !overOnly); }
      }))) : null,
      group('区分', App.chips(kinds, st.kind || '', function (v) { change('kind', v); }, '区分')),
      group('並べ替え', App.chips(sorts, sort, function (v) { change('sort', v); }, '並べ替え'))
    ].filter(Boolean);
    /* 並べ替えの札は幅640以下で2列にそろえる */
    groups[groups.length - 1].querySelector('.chips').classList.add('torihikisaki-sort');
    var used = [st.kind, overOnly].filter(Boolean).length;
    var toggle = App.button(used ? ['絞り込み', App.h('span', { class: 'torihikisaki-used' }, String(used))] : '絞り込み', {
      id: 'torihikisaki-filter-toggle',
      onClick: function () { open = !open; App.render(); }
    });
    toggle.classList.add('torihikisaki-toggle');
    toggle.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.btn.setAttribute('aria-controls', groups.map(function (g) { return g.id; }).join(' '));
    var band = App.filters([
      App.search({ name: 'torihikisaki', placeholder: '取引先コード、名称', onSearch: function () { App.render(); } }),
      toggle
    ].concat(groups));
    if (open) band.classList.add('is-open');

    var table = App.table({
      columns: columns, rows: rows, total: all.length, caption: '取引先の一覧',
      empty: '条件に合う取引先はありません',
      href: function (t) { return App.link(['torihikisaki', t.code]); },
      onClear: function () { App.remember(LIST_KEY, null); App.render(); }
    });
    /* 支払の列の無い一覧は、名称の列に余りを寄せる */
    if (!pay) table.classList.add('torihikisaki-brief');
    markCol(table, columns, 'name', 'torihikisaki-c-name');
    markCol(table, columns, 'terms', 'torihikisaki-c-terms');

    el.classList.add('torihikisaki');
    App.append(el, [
      App.pageHead({
        crumbs: [{ label: '取引先の一覧' }],
        title: '取引先の一覧',
        actions: [App.button('取引先を登録', {
          primary: true, id: 'torihikisaki-register', verdict: App.can('partner.register'),
          onClick: function () { openRegister(regKind); }
        })]
      }),
      band,
      table
    ]);
  }

  /* 発注の履歴は確認済の請求と同じく発注日の古い順に並べ、発注日のない発注は最後に置く */
  function orderPanel(c) {
    var rows = App.sortRows(c.orders.map(function (no) { return App.find('orders', no); }).filter(Boolean),
      function (o) { return o.orderedOn; });
    var hc = {};
    rows.forEach(function (o) { hc[o.no] = App.calc.hacchu(o); });
    var counted = function (o) { return hc[o.no].committed > 0; };
    /* 全ての行で発注金額と発注済が同じなら発注済の1列にする。違う行があれば2列にし、カードでは発注済の額がある行は発注済を、ない行は発注金額を出す */
    var same = rows.every(function (o) { return hc[o.no].committed === Number(o.amount); });
    var columns = [
      { key: 'no', label: '発注番号', nw: true, card: 'head', cell: function (o) {
        var kind = hc[o.no].kind;
        if (kind === '通常') return o.no;
        return App.h('span', null, [o.no, App.h('span', { class: 'sub-line' }, kind + ' 元 ' + o.related)]);
      } },
      { key: 'title', label: App.h('span', null, ['件名', App.h('span', { class: 'sub-line' }, '工事名')]), card: 'title', cell: function (o) {
        var k = App.find('kouji', o.kouji);
        return App.h('span', null, [o.title || App.NO_VALUE, App.h('span', { class: 'sub-line torihikisaki-kouji' }, k ? k.name : o.kouji)]);
      } },
      { key: 'cat', label: '費目', nw: true, card: 'hide' },
      same ? null : { key: 'amount', label: '発注金額（円）', num: true, yen: true, cls: function (o) { return counted(o) ? 'k-hide' : ''; } },
      { key: 'committed', label: '発注済（円）', num: true, yen: true, cls: function (o) { return same || counted(o) ? '' : 'k-hide'; },
        value: function (o) { return same || counted(o) ? hc[o.no].committed : null; } },
      { key: 'status', label: '状態', card: 'tag', cell: function (o) { return App.chip(hc[o.no].statusLabel); } },
      { key: 'orderedOn', label: '発注日', nw: true, date: true, card: 'hide' }
    ].filter(Boolean);
    var table = App.table({
      columns: columns, rows: rows, caption: '発注の履歴',
      empty: 'この取引先への発注はありません',
      href: function (o) { return App.hrefOf(o.no); },
      rowClass: function (o) { return o.status === '取消' ? 'is-void' : ''; },
      foot: rows.length ? { label: '合計', cells: { committed: App.fmt.yen(c.committed) } } : null
    });
    markCol(table, columns, 'title', 'torihikisaki-c-title');
    markCol(table, columns, 'cat', 'torihikisaki-c-cat');
    markCol(table, columns, 'amount', 'torihikisaki-c-amount');
    markCol(table, columns, 'committed', 'torihikisaki-c-committed');
    return App.panel({ title: '発注の履歴', flush: true, body: table });
  }

  function invoicePanel(t, c) {
    var rows = App.sortRows(App.data().invoices.filter(function (v) { return v.partner === t.code && v.status === '確認済'; }),
      function (v) { return App.calcPayDate(v, t); });
    /* 状態の列は支払期日経過の行があるときだけ置く */
    var over = rows.some(function (v) { return App.isOverdue(v); });
    var columns = [
      { key: 'no', label: '受付番号', nw: true, card: 'head' },
      { key: 'order', label: '発注番号', nw: true, card: 'hide' },
      { key: 'invoiceNo', label: '請求書番号', nw: true, card: 'hide' },
      { key: 'invoiceDate', label: phrases(['請求書の', '日付']), nw: true, date: true, card: 'hide' },
      { key: 'bookMonth', label: '計上月', nw: true, card: 'hide' },
      { key: 'amount', label: '請求額（円）', num: true, yen: true },
      { key: 'payDate', label: '支払予定日', nw: true, date: true, value: function (v) { return App.calcPayDate(v, t); } },
      over ? { key: 'state', label: '状態', card: 'tag', cell: function (v) { return App.tags([App.isOverdue(v) ? '支払期日経過' : null]); } } : null
    ].filter(Boolean);
    var table = App.table({
      columns: columns, rows: rows, caption: '確認済の請求',
      empty: '確認済の請求はありません',
      href: function (v) { return App.hrefOf(v.no); },
      foot: rows.length ? { label: '合計', cells: { amount: App.fmt.yen(c.scheduled) } } : null
    });
    markCol(table, columns, 'invoiceDate', 'torihikisaki-c-invdate');
    return App.panel({ title: '確認済の請求', flush: true, body: table });
  }

  /* 確認済で支払予定の額のうち、支払予定日を過ぎた請求の額 */
  function overdueAmount(c) {
    return c.overdue.reduce(function (s, no) {
      var v = App.find('invoices', no);
      return s + (v ? Number(v.amount) || 0 : 0);
    }, 0);
  }

  /* 支払の情報を見られない役割の履歴。変えた項目から支払条件を外し、支払条件だけを変えた行は出さない */
  function withoutTerms(entries) {
    var key = App.partnerFields(null).filter(function (f) { return f.name === 'terms'; })[0].label;
    var strip = function (x) {
      if (!x || !Object.prototype.hasOwnProperty.call(x, key)) return x;
      var out = {};
      Object.keys(x).forEach(function (k) { if (k !== key) out[k] = x[k]; });
      return out;
    };
    var size = function (x) { return x ? Object.keys(x).length : 0; };
    return entries.map(function (h) {
      var before = strip(h.before), after = strip(h.after);
      if (before === h.before && after === h.after) return h;
      if (!size(before) && !size(after) && !h.reason && !h.related) return null;
      var copy = {};
      Object.keys(h).forEach(function (k) { copy[k] = h[k]; });
      copy.before = before;
      copy.after = after;
      return copy;
    }).filter(Boolean);
  }

  /* 合計の見出し。語の区切りでだけ折り返す。配列で渡した語の組は、組の前で折り返しても入らないときだけ組の中で折り返す */
  function sumLabel(parts) {
    var out = [];
    parts.forEach(function (s, i) {
      if (i) out.push(App.h('wbr'));
      out.push(Array.isArray(s) ? App.h('span', { class: 'torihikisaki-ph-set' }, sumLabel(s)) : App.h('span', { class: 'torihikisaki-ph' }, s));
    });
    return App.h('span', null, out);
  }

  function renderDetail(el, code) {
    var t = App.find('partners', code);
    el.classList.add('torihikisaki');
    if (!t) {
      App.append(el, [
        App.pageHead({ crumbs: [{ label: '取引先の一覧', href: LIST_HREF }, { label: code }], title: '取引先 ' + code }),
        App.notice('取引先 ' + code + ' は見つかりません。', {
          plain: true, links: [{ label: '取引先の一覧に戻る', href: LIST_HREF }]
        })
      ]);
      return;
    }
    var c = App.calc.torihikisaki(t);
    var pay = App.can('view.payment').ok;
    /* 施主には発注も支払もないので、額と発注・請求の面を出さず基本情報だけにする */
    var trade = t.kind !== '施主';
    var history = pay ? App.historyFor(t.code) : withoutTerms(App.historyFor(t.code));

    var head = App.pageHead({
      crumbs: [{ label: '取引先の一覧', href: LIST_HREF }, { label: t.name }],
      title: t.name, no: t.code,
      tags: [t.status === '停止' ? t.status : null, pay && c.overdue.length ? '支払期日経過' : null],
      back: { href: LIST_HREF, label: '取引先の一覧に戻る' },
      actions: [App.button('取引先を編集', {
        primary: true, id: 'torihikisaki-edit', verdict: App.can('partner.edit', { partner: t.code }),
        onClick: function () { openEdit(t); }
      })]
    });

    var info = App.info([
      { label: '区分', value: t.kind },
      { label: '担当者名', value: t.contact },
      { label: '取引状態', value: t.status },
      { label: '登録日', value: App.fmt.date(t.registeredOn) },
      pay ? { label: '支払条件', value: termsCell(t.terms) } : null,
      !pay && trade ? { label: '発注済（円）', value: App.fmt.yen(c.committed) } : null,
      { label: '備考', value: t.note }
    ]);
    var sums = pay && trade ? App.sums([
      { label: '発注済（円）', value: App.fmt.yen(c.committed) },
      { label: sumLabel(['確認済で', ['支払予定の', '額（円）']]), value: App.fmt.yen(c.scheduled) },
      c.overdue.length ? { label: sumLabel(['うち', ['支払期日経過', '（円）']]), value: App.fmt.yen(overdueAmount(c)) } : null,
      { label: sumLabel(['次の', '支払予定日']), value: App.fmt.date(c.nextPayDate) },
      { label: sumLabel(['その日の', '支払額（円）']), value: c.nextPayDate ? App.fmt.yen(c.nextPayAmount) : App.NO_VALUE }
    ].filter(Boolean)) : null;
    /* 項目と合計を同じ列の区切りに並べる。列の数は合計の数 */
    if (sums) {
      info.classList.add('torihikisaki-cols', 'torihikisaki-c' + sums.children.length);
      sums.classList.add('torihikisaki-cols', 'torihikisaki-c' + sums.children.length);
    }

    App.append(el, [
      head,
      App.panel({
        title: '基本情報',
        body: [info, sums]
      }),
      pay && trade ? invoicePanel(t, c) : null,
      trade ? orderPanel(c) : null,
      history.length ? App.panel({ title: '履歴', flush: true, body: App.log(history, { label: '履歴' }) }) : null
    ]);
  }

  App.screen('torihikisaki/:code?', {
    title: function (p) { return p.args.code ? '取引先 ' + p.args.code : '取引先の一覧'; },
    render: function (el, p) {
      if (p.args.code) renderDetail(el, p.args.code);
      else renderList(el);
    }
  });
})();
