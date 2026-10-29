(function () {
  'use strict';

  var h = App.h;
  var KEY = 'lists.kouji';
  var SAVED = 'searches.kouji';
  var NONE = 'none';
  var CUT = 5;

  /* 幅640以下で絞り込みの欄を開いているか */
  var open = false;
  /* URL の指定から外れて描き直すときに戻す位置とフォーカス */
  var restore = null;
  /* 札で絞って欄を閉じた後に、件数と行を画面に入れる */
  var settle = false;

  /* 条件の形をそろえる。比べるときと保存するときに使う */
  function norm(st) {
    st = st || {};
    return {
      q: st.q || '',
      status: st.status || '',
      manager: st.manager || '',
      month: st.month || '',
      overOnly: !!st.overOnly,
      sort: st.sort === 'rate' ? 'rate' : 'no'
    };
  }

  function sameCond(a, b) {
    a = norm(a);
    b = norm(b);
    return Object.keys(a).every(function (f) { return a[f] === b[f]; });
  }

  function savedList() {
    var list = App.recall(SAVED);
    return Array.isArray(list) ? list.filter(function (s) { return s && s.name; }) : [];
  }

  /* 着工月は着工日の月。着工前の工事は着工予定日の月 */
  function startMonth(k) {
    return App.monthOf(k.startOn || k.planStart);
  }

  function group(label, body, cls) {
    var id = App.newId('kouji-g');
    body.setAttribute('aria-labelledby', id);
    return h('div', { class: ['kouji_list-group', cls] }, [h('span', { class: 'kouji_list-group-label', id: id }, label), body]);
  }

  /* 絞り込みの選択。入力途中の印を立てないよう App.field を使わずに組む */
  function selectField(label, name, options, value, onChange) {
    var id = App.newId('kouji-f');
    var sel = h('select', {
      class: 'select', id: id, name: name, value: value,
      onChange: function () { onChange(sel.value); }
    }, options.map(function (o) { return h('option', { value: o.value }, o.label); }));
    return h('div', { class: ['field', 'kouji_list-field', 'kouji_list-' + name] }, [
      h('label', { class: 'field-label', for: id }, label), sel
    ]);
  }

  /* 施主の名前は法人の種類の前後で折り返せるようにする */
  var CORP = /(株式会社|有限会社|合同会社|医療法人|社会福祉法人|学校法人|一般社団法人|一般財団法人)/;
  function clientCell(k) {
    var parts = String(App.partnerName(k.client) || '').split(CORP).filter(Boolean);
    if (!parts.length) return App.NO_VALUE;
    var out = [];
    parts.forEach(function (p, i) {
      if (i) out.push(h('wbr'));
      out.push(p);
    });
    return out;
  }

  /* 工事名の末尾の括弧書きを分け、括弧の前の空きを詰める */
  function nameCell(k) {
    var m = /^(.+?)(（[^（）]*）)$/.exec(String(k.name || ''));
    if (!m) return k.name || App.NO_VALUE;
    return [m[1], h('span', { class: 'kouji_list-paren' }, m[2])];
  }

  /* 番号の並び。多いときは先頭の5件と残りの件数 */
  function nosText(nos) {
    var text = nos.slice(0, CUT).join('、');
    return nos.length > CUT ? text + ' ほか ' + (nos.length - CUT) + '件' : text;
  }

  /* 締めを待つ月は件数を出さず、月そのものを出す */
  var NO_COUNT = { month_to_close: true };

  /* 件数の位置の文字。0件の項目は「なし」 */
  function waitCount(w) {
    if (!w.count) return 'なし';
    return NO_COUNT[w.key] ? null : w.count + '件';
  }

  /* 2行に分けられる見出し。幅が狭いときは後ろの語を2行目に送る。cls は列を外すときの目印 */
  function twoLineHead(first, second, cls) {
    return h('span', { class: cls || null }, [first, h('span', { class: 'kouji_list-line2' }, second)]);
  }

  /* フォーカスの目印。要素の種類、name、文字（チップは件数を除く） */
  function focusKey(e) {
    if (!e || !e.tagName || e === document.body) return '';
    var text = /^(INPUT|SELECT)$/.test(e.tagName) ? ''
      : (e.classList.contains('chip') && e.firstChild ? e.firstChild.textContent : e.textContent);
    return [e.tagName, e.getAttribute('name') || '', (text || '').trim()].join('|');
  }

  function putBack(root, r) {
    window.scrollTo(0, r.y);
    if (!r.key) return;
    var list = root.querySelectorAll('button, input, select');
    for (var i = 0; i < list.length; i++) {
      if (focusKey(list[i]) !== r.key) continue;
      list[i].focus({ preventScroll: true });
      if (list[i].tagName === 'INPUT') list[i].setSelectionRange(list[i].value.length, list[i].value.length);
      return;
    }
  }

  /* 描き直しで押したボタンが消えたときは、代わりの場所にフォーカスを移す。id か要素を受け取る */
  function focusIfLost(to) {
    var a = document.activeElement;
    if (a && a !== document.body) return;
    var b = typeof to === 'string' ? document.getElementById(to) : to;
    if (b) b.focus();
  }

  /* 欄を閉じた後は「絞り込み」にフォーカスを置き、件数が画面に無ければ帯の上端まで戻す */
  function showCount(root) {
    var t = document.getElementById('kouji-filter-toggle');
    if (t) t.focus({ preventScroll: true });
    var band = root.querySelector('.filters');
    var count = root.querySelector('.tbl-count');
    if (!band || !count) return;
    var fix = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--fixbar-h')) || 0;
    var r = count.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= window.innerHeight - fix) return;
    window.scrollBy(0, Math.floor(band.getBoundingClientRect().top - 8));
  }

  /* 予算が無い工事は予算の額を出さない（消化率は「予算なし」） */
  function budgetOf(c) {
    return c.total.rate === null || c.total.rate === undefined ? null : c.total.budget;
  }

  /* 待ちの欄。購買は承認を待つ発注の表、ほかの役割は件数と入口の1行 */
  function waitingPanel() {
    var items = App.waiting(App.role());
    if (!items.length) return null;
    if (items[0].key === 'hacchu_approve') {
      var it = items[0];
      return App.panel({
        title: it.label, flush: true,
        body: App.table({
          columns: [
            { key: 'no', label: '発注番号', nw: true, card: 'head' },
            { key: 'koujiName', label: '工事名', card: 'title' },
            { key: 'torihikisakiName', label: '取引先' },
            { key: 'amount', label: '発注金額（円）', num: true, yen: true },
            { key: 'over', label: '予算超過', nw: true, cell: function (r) { return r.over ? App.chip('超過', { over: true }) : 'なし'; } }
          ],
          rows: it.rows, caption: it.label,
          href: function (r) { return App.link(['hacchu', r.no]); },
          empty: '承認を待つ発注はありません'
        })
      });
    }
    var list = h('ul', { class: 'kouji_list-wait' }, items.map(function (w) {
      var nos = w.rows.map(function (r) { return r.no || r.month; });
      var entry = null;
      if (nos.length && w.href) entry = h('a', { href: w.href }, nosText(nos));
      else if (nos.length) {
        entry = App.noLinks(nos.slice(0, CUT));
        if (nos.length > CUT) App.append(entry, ' ほか ' + (nos.length - CUT) + '件');
      }
      var count = waitCount(w);
      return h('li', null, [
        h('span', null, w.label),
        count ? h('span', { class: 'kouji_list-wait-count' }, count) : null,
        entry
      ]);
    }));
    return App.panel({ body: list, flush: true });
  }

  App.screen('kouji', {
    title: '工事一覧',
    render: function (el, params) {
      el.classList.add('kouji_list');
      var showContract = App.can('view.contract').ok;
      /* 受注金額の列がある役割は、表の幅が同じでも外す列が多い */
      if (showContract) el.classList.add('kouji_list-has-contract');
      var query = (params && params.query) || {};
      var urlStatus = App.KOUJI_STATES.indexOf(query.status) >= 0 ? query.status : '';
      /* URL で状態を指定されたときは、その状態だけで絞る（並べ替えは保存した物）。指定は保存しない */
      var stored = norm(App.recall(KEY));
      var cur = urlStatus ? norm({ status: urlStatus, sort: stored.sort }) : stored;
      var all = App.data().kouji;
      var calc = {};
      all.forEach(function (k) { calc[k.no] = App.calc.kouji(k); });

      if (restore && !urlStatus) {
        var back = restore;
        restore = null;
        /* 移動の描画が見出しへ送った後に、元の位置と操作の場所へ戻す */
        Promise.resolve().then(function () { putBack(el, back); });
      }
      if (settle) {
        settle = false;
        Promise.resolve().then(function () { showCount(el); });
      }

      /* URL の指定から条件を変えたときは、今の表示を起点に保存して指定の無い URL へ移る */
      function redraw() {
        if (!urlStatus) {
          App.render();
          return;
        }
        restore = { y: window.pageYOffset, key: focusKey(document.activeElement) };
        App.go(App.link(['kouji'])).then(function (moved) { if (!moved) { restore = null; settle = false; } });
      }

      function change(key, value) {
        var s = urlStatus ? norm(cur) : (App.recall(KEY) || {});
        s[key] = value;
        App.remember(KEY, s);
        redraw();
      }

      /* 幅640以下で開いた欄の札を押したときは、欄を閉じて結果を見せる */
      function pick(key, value) {
        if (open && toggle.getClientRects().length) {
          open = false;
          settle = true;
        }
        change(key, value);
      }

      function clear() {
        App.remember(KEY, cur.sort === 'rate' ? { sort: 'rate' } : {});
        redraw();
      }

      function recallSaved(name) {
        var s = savedList().filter(function (x) { return x.name === name; })[0];
        if (!s) return;
        App.remember(KEY, norm(s.cond));
        redraw();
      }

      function searched(t) {
        if (urlStatus) change('q', t);
        else App.render();
      }

      function removeSaved(name) {
        App.flash(App.dropSearch(SAVED, name));
        App.render();
        focusIfLost(document.getElementById('kouji-cond-save') || document.querySelector('.kouji_list .filters input[type="search"]'));
      }

      function saveCond() {
        App.formDialog({
          title: '条件を保存', ok: '保存', id: 'dlg-kouji-cond', okId: 'kouji-cond-ok',
          fields: [{ name: 'name', label: '条件の名前', required: true, max: 20 }],
          submit: function (v) { return App.saveSearch(SAVED, String(v.name).trim(), cur); }
        }).then(function (res) {
          if (!res) return;
          App.flash(res);
          App.render();
          focusIfLost('kouji-cond-delete');
        });
      }

      /* 状態の件数は状態以外の条件で絞った行で数える。超過の件数は超過以外の条件で数える */
      var q = cur.q;
      var base = all.filter(function (k) {
        if (q && [k.no, k.name, App.partnerName(k.client)].join(' ').indexOf(q) < 0) return false;
        if (cur.manager && (cur.manager === NONE ? !!k.manager : k.manager !== cur.manager)) return false;
        return !cur.month || startMonth(k) === cur.month;
      });
      var hit = base.filter(function (k) { return !cur.overOnly || calc[k.no].over; });
      var rows = hit.filter(function (k) { return !cur.status || k.status === cur.status; });
      rows = cur.sort === 'rate'
        ? App.sortRows(rows, function (k) { return calc[k.no].total.rate; }, 'desc')
        : App.sortRows(rows, function (k) { return k.no; });
      var overCount = base.filter(function (k) { return (!cur.status || k.status === cur.status) && calc[k.no].over; }).length;

      var states = [{ value: '', label: '全て', count: hit.length }].concat(App.KOUJI_STATES.map(function (s) {
        return { value: s, label: s, count: hit.filter(function (k) { return k.status === s; }).length };
      }));

      var self = App.role() === 'tanto' ? App.user('tanto').id : '';
      var managers = [{ value: '', label: '全て' }].concat(
        App.data().employees.filter(function (e) { return e.role === App.roleName('tanto'); }).map(function (e) {
          return { value: e.id, label: e.id === self ? e.name + '（自分）' : e.name };
        }),
        all.some(function (k) { return !k.manager; }) ? [{ value: NONE, label: '未定' }] : []
      );

      var months = [];
      all.forEach(function (k) {
        var m = startMonth(k);
        if (m && months.indexOf(m) < 0) months.push(m);
      });
      months.sort();

      var saved = savedList();
      var matched = '';
      saved.forEach(function (s) { if (!matched && sameCond(s.cond, cur)) matched = s.name; });

      var active = !!(cur.q || cur.status || cur.manager || cur.month || cur.overOnly);
      var used = [cur.status, cur.manager, cur.month, cur.overOnly].filter(Boolean).length;

      var columns = [
        { key: 'no', label: '工事番号', nw: true, card: 'head' },
        { key: 'name', label: '工事名', card: 'title', cell: nameCell, cls: function () { return 'kouji_list-name'; } },
        { key: 'client', label: h('span', { class: 'kouji_list-h-client' }, '施主'), card: 'hide', cell: clientCell, cls: function () { return 'kouji_list-client'; } },
        { key: 'status', label: '状態', card: 'tag', cell: function (k) { return App.chip(k.status); } },
        { key: 'manager', label: twoLineHead('工事', '担当'), nw: true, card: 'hide', value: function (k) { return App.empName(k.manager); } },
        showContract ? { key: 'contract', label: twoLineHead('受注金額', '（円）', 'kouji_list-h-contract'), num: true, yen: true, card: 'hide',
          cls: function () { return 'kouji_list-contract'; }, value: function (k) { return calc[k.no].contract; } } : null,
        { key: 'budget', label: twoLineHead('予算', '（円）'), num: true, yen: true, card: 'hide', value: function (k) { return budgetOf(calc[k.no]); } },
        { key: 'committed', label: twoLineHead('発注済', '（円）', 'kouji_list-h-committed'), num: true, yen: true, card: 'hide',
          cls: function () { return 'kouji_list-committed'; }, value: function (k) { return calc[k.no].total.committed; } },
        { key: 'rate', label: '消化率', num: true, cls: function () { return 'kouji_list-ratecell'; }, cell: function (k) {
          var c = calc[k.no];
          return h('span', { class: 'kouji_list-rate' }, [
            App.bar(c.total.rate),
            c.overCats.length ? h('span', { class: 'kouji_list-overcats' }, c.overCats.join('、') + 'が超過') : null
          ]);
        } },
        { key: 'planEnd', label: '完工予定日', nw: true, date: true }
      ].filter(Boolean);

      var csvColumns = [
        { label: '工事番号', key: 'no' },
        { label: '工事名', key: 'name' },
        { label: '施主', value: function (k) { return App.partnerName(k.client); } },
        { label: '状態', key: 'status' },
        { label: '工事担当', value: function (k) { return App.empName(k.manager); } },
        showContract ? { label: '受注金額（円）', value: function (k) { return calc[k.no].contract; } } : null,
        { label: '予算（円）', value: function (k) { var b = budgetOf(calc[k.no]); return b === null ? '' : b; } },
        { label: '発注済（円）', value: function (k) { return calc[k.no].total.committed; } },
        { label: '消化率', value: function (k) {
          var r = calc[k.no].total.rate;
          return r === null || r === undefined ? '' : (Math.round(r * 1000) / 10).toFixed(1);
        } },
        { label: '完工予定日', key: 'planEnd' }
      ].filter(Boolean);

      /* 1段目: 検索、担当、着工月、並べ替え、保存した条件。2段目: 状態と予算超過 */
      var idConds = App.newId('kouji-conds');
      var idSaved = App.newId('kouji-saved');
      var idMore = App.newId('kouji-more');

      /* 条件が何も無いときは保存のボタンを置かない。保存した条件も無ければ欄ごと置かない */
      var savedItems = [
        saved.length ? selectField('保存した条件', 'kouji-saved',
          [{ value: '', label: '選んでください' }].concat(saved.map(function (s) { return { value: s.name, label: s.name }; })),
          matched, recallSaved) : null,
        matched ? App.button('この条件を削除', { id: 'kouji-cond-delete', onClick: function () { removeSaved(matched); } })
          : sameCond(cur, {}) ? null
          : App.button('この条件を保存', { id: 'kouji-cond-save', onClick: saveCond })
      ].filter(Boolean);
      var savedBox = savedItems.length ? h('div', { class: 'kouji_list-saved kouji_list-more', id: idSaved }, savedItems) : null;

      var toggle = App.button(used ? ['絞り込み', h('span', { class: 'kouji_list-used' }, String(used))] : '絞り込み', {
        id: 'kouji-filter-toggle',
        onClick: function () { open = !open; App.render(); }
      });
      toggle.classList.add('kouji_list-toggle');
      toggle.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.btn.setAttribute('aria-controls', [idConds, savedBox ? idSaved : '', idMore].filter(Boolean).join(' '));

      var band = App.filters([
        h('div', { class: 'kouji_list-row' }, [
          App.search({ name: 'kouji', placeholder: '工事番号、工事名、施主', value: cur.q, onSearch: searched }),
          toggle,
          h('div', { class: 'kouji_list-conds kouji_list-more', id: idConds }, [
            selectField('工事担当', 'kouji-manager', managers, cur.manager, function (v) { change('manager', v); }),
            selectField('着工月', 'kouji-month', [{ value: '', label: '全て' }].concat(months.map(function (m) {
              return { value: m, label: m };
            })), cur.month, function (v) { change('month', v); }),
            selectField('並べ替え', 'kouji-sort', [{ value: 'no', label: '工事番号の順' }, { value: 'rate', label: '消化率の高い順' }],
              cur.sort, function (v) { change('sort', v); })
          ]),
          savedBox
        ]),
        h('div', { class: 'kouji_list-row kouji_list-more', id: idMore }, [
          group('状態', App.chips(states, cur.status, function (v) { pick('status', v); }, '状態'), 'kouji_list-states'),
          group('予算', h('div', { class: 'chips' }, App.chip('予算超過だけ', {
            pressed: cur.overOnly, count: overCount, onClick: function () { pick('overOnly', !cur.overOnly); }
          }))),
          active && rows.length ? App.button('条件を外す', { onClick: function () {
            clear();
            focusIfLost(document.querySelector('.kouji_list .filters input[type="search"]'));
          } }) : null
        ])
      ]);
      if (open) band.classList.add('is-open');

      var table = App.table({
        columns: columns, rows: rows, total: all.length, caption: '工事の一覧',
        href: function (k) { return App.link(['kouji', k.no]); },
        rowClass: function (k) { return calc[k.no].over ? 'is-over' : ''; },
        empty: '条件に合う工事はありません',
        onClear: clear
      });
      /* 件数の行の右に CSV の書き出しを置く */
      var count = table.querySelector('.tbl-count');
      if (count && rows.length) {
        var line = h('div', { class: 'kouji_list-count' });
        table.insertBefore(line, count);
        App.append(line, [count, App.button('CSV で書き出す', { small: true, onClick: function () {
          App.csv('kouji_' + App.today() + '.csv', csvColumns, rows);
        } })]);
      }

      App.append(el, [
        App.pageHead({
          crumbs: [{ label: '工事一覧' }],
          title: '工事一覧',
          actions: [App.button('工事を登録', {
            primary: true, id: 'kouji-register', verdict: App.can('kouji.register'),
            onClick: function () { App.koujiDialog(); }
          })]
        }),
        waitingPanel(),
        band,
        table
      ]);
    }
  });
})();
