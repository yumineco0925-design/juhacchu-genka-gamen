(function () {
  'use strict';

  var h = App.h;
  var KEY = 'lists.sai';
  var NONE = 'none';

  /* 工事×費目の行。金額と消化率は App.calc.kouji の行をそのまま持つ。予算も発注も原価も無い工事は合計の行1つにまとめる */
  function allRows() {
    var rows = [];
    App.data().kouji.forEach(function (k) {
      var c = App.calc.kouji(k);
      var t = c.total;
      var blank = !t.budget && !t.committed && !t.incurred;
      (blank ? [t] : c.rows).forEach(function (x) {
        rows.push({
          no: k.no, name: k.name, manager: k.manager || '', cat: blank ? '' : x.cat,
          budget: x.budget, committed: x.committed, incurred: x.incurred,
          remain: x.remain, rate: x.rate, over: x.over
        });
      });
    });
    return rows;
  }

  /* 表に出ている行の合計。工事をまたぐ合計は App.calc に無いので、ここで行の値を足す。
     消化率は App.calc.kouji の合計と同じく発注済 ÷ 予算、over は消化率が100%を超えるとき */
  function sumRows(rows) {
    var s = { budget: 0, committed: 0, incurred: 0, remain: 0 };
    rows.forEach(function (r) {
      Object.keys(s).forEach(function (f) { s[f] += r[f]; });
    });
    s.rate = s.budget ? s.committed / s.budget : null;
    s.over = s.rate !== null && s.rate > 1;
    return s;
  }

  /* 担当の絞り込みの初期値。工事担当で開くと自分、他の役割は全て。役割を替えたときだけ入れ直す */
  function managerOf(st) {
    var role = App.role();
    if (st.mgrRole !== role) {
      st.manager = role === 'tanto' ? App.user('tanto').id : '';
      st.mgrRole = role;
      App.remember(KEY, st);
    }
    return st.manager || '';
  }

  /* 工事担当の名前。担当の無い工事は空（表では –、CSV では空のセル） */
  function managerName(r) {
    return App.empName(r.manager);
  }

  /* 絞り込みの選択。入力途中の印を立てないよう App.field を使わずに組む */
  function selectField(label, name, options, value, onChange) {
    var id = App.newId('sai-f');
    var sel = h('select', {
      class: 'select', id: id, name: name, value: value,
      onChange: function () { onChange(sel.value); }
    }, options.map(function (o) { return h('option', { value: o.value }, o.label); }));
    return h('div', { class: 'field sai-field' }, [h('label', { class: 'field-label', for: id }, label), sel]);
  }

  function rateCell(r) {
    return (r.over ? '超過 ' : '') + App.fmt.pct(r.rate);
  }

  function keyCls() { return 'sai-key'; }

  /* 工事番号の順のときは同じ工事が続く行を1つのまとまりにする。
     span はまとまりの最初の行に行の数、cont は2行目からの行 */
  function markGroups(rows, on) {
    var start = 0;
    rows.forEach(function (r, i) {
      r.span = 1;
      r.cont = on && i > 0 && rows[i - 1].no === r.no;
      if (r.cont) rows[start].span++;
      else start = i;
    });
    return rows;
  }

  /* まとまりの最初の行の工事番号、工事名、工事担当のセルを、まとまりの行の数だけ縦に伸ばす */
  function spanKeys(block, rows) {
    var trs = block.querySelectorAll('tbody tr');
    rows.forEach(function (r, i) {
      if (r.span < 2 || !trs[i]) return;
      Array.prototype.forEach.call(trs[i].querySelectorAll('td.sai-key'), function (td) { td.rowSpan = r.span; });
    });
  }

  /* まとまりごとに tbody を分け、どの行を指しても工事のまとまり全体の色が変わるようにする */
  function groupBodies(block, rows) {
    var body = block.querySelector('tbody');
    if (!body) return;
    var group = null;
    Array.prototype.slice.call(body.children).forEach(function (tr, i) {
      if (!group || !rows[i].cont) {
        group = h('tbody', { class: 'sai-g' });
        body.parentNode.insertBefore(group, body);
      }
      group.appendChild(tr);
    });
    body.parentNode.removeChild(body);
  }

  /* line2 は狭い幅で見出しの2行目に送る語。part は表の幅が足りないときに外す列の目印 */
  var COLUMNS = [
    { key: 'no', label: '工事番号', nw: true, card: 'head', cls: keyCls, cell: function (r) {
      return [h('span', { class: 'sai-hno' }, r.no), h('span', { class: 'sai-hname' }, r.name)];
    } },
    { key: 'name', label: '工事名', card: 'hide', cls: keyCls, cell: function (r) { return h('span', null, r.name); } },
    { key: 'manager', label: '工事担当', line2: '担当', part: 'sai-c-mgr', nw: true, card: 'hide', cls: keyCls, value: managerName },
    { key: 'cat', label: '費目', nw: true, cls: function () { return 'sai-cat'; } },
    { key: 'budget', label: '予算（円）', line2: '（円）', num: true, yen: true },
    { key: 'committed', label: '発注済（円）', line2: '（円）', num: true, yen: true },
    { key: 'incurred', label: '発生原価（円）', line2: '（円）', part: 'sai-c-inc', num: true, yen: true, card: 'hide' },
    { key: 'remain', label: '差異（円）', line2: '（円）', part: 'sai-c-rem', num: true, yen: true, card: 'hide' },
    { key: 'rate', label: '消化率', num: true, nw: true, cell: rateCell, cls: function (r) { return App.heat(r.rate); } }
  ];

  /* 見出しの line2 の語を別の要素に分ける。括弧で始まる語は括弧の前後の空きを詰める */
  function splitHeads(block) {
    Array.prototype.forEach.call(block.querySelectorAll('thead th'), function (th, i) {
      var c = COLUMNS[i];
      if (!c || !c.line2) return;
      th.textContent = '';
      App.append(th, [
        c.label.slice(0, -c.line2.length),
        h('span', { class: c.line2.charAt(0) === '（' ? 'sai-line2 sai-paren' : 'sai-line2' }, c.line2)
      ]);
    });
  }

  /* 外せる列の見出し、行、合計のセルに列の目印のクラスを付ける */
  function markParts(block) {
    Array.prototype.forEach.call(block.querySelectorAll('tr'), function (tr) {
      COLUMNS.forEach(function (c, i) {
        if (c.part && tr.children[i]) tr.children[i].classList.add(c.part);
      });
    });
  }

  /* 消化率は画面と同じ丸め方で、小数1桁まで出した百分率にする */
  var CSV_COLUMNS = [
    { label: '工事番号', key: 'no' },
    { label: '工事名', key: 'name' },
    { label: '工事担当', value: managerName },
    { label: '費目', key: 'cat' },
    { label: '予算（円）', key: 'budget' },
    { label: '発注済（円）', key: 'committed' },
    { label: '発生原価（円）', key: 'incurred' },
    { label: '差異（円）', key: 'remain' },
    { label: '消化率', value: function (r) { return r.rate === null ? '' : (Math.round(r.rate * 1000) / 10).toFixed(1); } }
  ];

  App.screen('sai', {
    title: '予算と実績の差異',
    render: function (el) {
      el.classList.add('sai');
      var st = App.recall(KEY) || {};
      var q = st.q || '';
      var manager = managerOf(st);
      var sort = st.sort === 'rate' ? 'rate' : 'no';
      var all = allRows();

      function change(key, value) {
        st[key] = value;
        App.remember(KEY, st);
        App.render();
      }

      function ofManager(r) {
        return !manager || (manager === NONE ? !r.manager : r.manager === manager);
      }

      /* 超過の件数は検索と担当で絞った行で数える */
      var byMgr = all.filter(function (r) {
        return (!q || [r.no, r.name, r.cat].join(' ').indexOf(q) >= 0) && ofManager(r);
      });
      var rows = byMgr.filter(function (r) { return !st.overOnly || r.over; });
      if (sort === 'rate') rows = App.sortRows(rows, function (r) { return r.rate; }, 'desc');
      markGroups(rows, sort === 'no');

      var self = App.role() === 'tanto' ? App.user('tanto').id : '';
      var managers = [{ value: '', label: '全て' }].concat(
        App.data().employees.filter(function (e) { return e.role === App.roleName('tanto'); }).map(function (e) {
          return { value: e.id, label: e.id === self ? e.name + '（自分）' : e.name };
        }),
        manager === NONE || all.some(function (r) { return !r.manager; }) ? [{ value: NONE, label: '未定' }] : []
      );

      var sum = sumRows(rows);

      var table = App.table({
        columns: COLUMNS, rows: rows, total: all.length, caption: '工事と費目ごとの予算と実績',
        href: function (r) { return App.link(['kouji', r.no]); },
        rowClass: function (r) { return r.cont ? 'sai-cont' : ''; },
        foot: { label: '合計', cells: {
          budget: App.fmt.yen(sum.budget),
          committed: App.fmt.yen(sum.committed),
          incurred: App.fmt.yen(sum.incurred),
          remain: App.fmt.yen(sum.remain),
          rate: sum.over ? h('span', { class: 'over-val' }, App.fmt.pct(sum.rate)) : App.fmt.pct(sum.rate)
        } },
        empty: '条件に合う工事と費目はありません',
        onClear: function () { App.remember(KEY, { manager: '', mgrRole: App.role(), sort: st.sort }); App.render(); },
        /* 差異の部分は差異の列を外す幅では出さない */
        note: rows.length ? [h('span', { class: 'sai-note-rem' }, '差異は予算 − 発注済、'), '消化率は発注済 ÷ 予算です。'] : null
      });
      splitHeads(table);
      markParts(table);
      spanKeys(table, rows);
      groupBodies(table, rows);

      App.append(el, [
        App.pageHead({
          crumbs: [{ label: '予算と実績の差異' }],
          title: '予算と実績の差異',
          actions: [App.button('CSV で書き出す', {
            primary: true, side: !rows.length, disabled: rows.length ? false : '書き出す行がありません',
            onClick: function () { App.csv('sai_' + App.today() + '.csv', CSV_COLUMNS, rows); }
          })]
        }),
        App.filters([
          App.search({ name: 'sai', placeholder: '工事番号、工事名、費目', onSearch: function () { App.render(); } }),
          App.chip('超過だけ', {
            pressed: !!st.overOnly,
            count: byMgr.filter(function (r) { return r.over; }).length,
            onClick: function () { change('overOnly', !st.overOnly); }
          }),
          h('div', { class: 'sai-conds' }, [
            selectField('工事担当', 'sai-manager', managers, manager, function (v) { change('manager', v); }),
            selectField('並べ替え', 'sai-sort', [{ value: 'no', label: '工事番号の順' }, { value: 'rate', label: '消化率の高い順' }],
              sort, function (v) { change('sort', v); })
          ])
        ]),
        table
      ]);
    }
  });
})();
