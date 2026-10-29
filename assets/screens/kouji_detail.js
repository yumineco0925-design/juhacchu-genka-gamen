/* 工事詳細: 状態の段、金額のまとめ、予算と実績の対比、予算の改定、基本情報、発注、労務費、そのほかの操作、履歴 */
(function () {
  'use strict';

  var h = App.h;
  var KEY = 'lists.kouji_detail';

  function yen(n) { return App.fmt.yen(n); }

  /* 状態を戻すと消える項目の1行 */
  function clearText(c) {
    return c.label + ' ' + (typeof c.value === 'number' ? yen(c.value) + '円' : App.fmt.date(c.value));
  }

  /* 保存が通ったら知らせを預けて開き直す。知らせの出る画面の先頭から見せる */
  function after(res) {
    if (!res || !res.ok) return;
    App.flash(res);
    App.go(window.location.hash);
  }

  /* 施主名は法人の種類の前後と空白で、工事場所は空白でだけ折り返す印を付ける */
  var CORP = /(株式会社|有限会社|合同会社|合資会社|合名会社|医療法人|社会福祉法人|学校法人|一般社団法人|一般財団法人)/;
  function nameCell(t, corp) {
    if (!t) return t;
    var out = [];
    (corp ? String(t).split(CORP).filter(Boolean) : [String(t)]).forEach(function (p, i, all) {
      if (i && !/\s$/.test(all[i - 1]) && !/^\s/.test(p)) out.push(h('wbr'));
      out.push(p);
    });
    return h('span', { class: 'kouji_detail-name' }, out);
  }

  /* この工事の予算改定（番号の若い順） */
  function revisionsOf(no) {
    return App.data().revisions.filter(function (r) { return r.kouji === no; })
      .sort(function (a, b) { return a.no < b.no ? -1 : 1; });
  }

  /* 承認を待つ予算改定（番号の若い順） */
  function pendingRevisions(no) {
    return revisionsOf(no).filter(function (r) { return r.status === '起案'; });
  }

  /* 予算を超えた費目の直し方。承認を待つ改定がある費目は承認の段、ない費目は起案の段を出す */
  function fixLines(c, pending) {
    var waiting = pending.filter(function (r) { return c.overCats.indexOf(r.cat) >= 0; });
    var waitCats = waiting.map(function (r) { return r.cat; });
    var rest = c.overCats.filter(function (cat) { return waitCats.indexOf(cat) < 0; });
    var lines = [];
    if (waiting.length) {
      lines.push('営業が「改定を承認」で' + waiting.map(function (r) { return r.cat + 'の予算改定 ' + r.no; }).join('、') + ' を承認します。');
    }
    if (rest.length) lines.push('工事担当が「改定を起案」で' + rest.join('、') + 'の予算を直します。');
    if (!waiting.length) lines.push('営業が「改定を承認」で承認します。');
    lines.push('改定までに起票する発注には予算超過の理由を書きます。');
    return lines;
  }

  /* 受注金額の変更で理由が要るか（App.can の誤りの有無で見る） */
  function needsReason(no) {
    var v = App.can('kouji.contract', { kouji: no }, { contract: 1, reason: '' });
    return !!(v.errors && v.errors.reason);
  }

  /* 受注金額が分かる項目（受注金額、見積金額、施主への請求額）の履歴での名前 */
  function contractKeys() {
    var est = App.koujiFields().filter(function (f) { return f.name === 'estimate'; })[0];
    return [App.FIELD_LABEL.contract, App.FIELD_LABEL.clientBillAmount, est ? est.label : ''].filter(Boolean);
  }

  /* 工事そのものの履歴から受注金額が分かる項目を外す。外して何も残らない履歴は出さない */
  function withoutContract(list, no) {
    var keys = contractKeys();
    function strip(obj) {
      var out = {}, cut = false;
      Object.keys(obj || {}).forEach(function (key) {
        if (keys.indexOf(key) >= 0) cut = true;
        else out[key] = obj[key];
      });
      return cut ? out : obj;
    }
    return list.map(function (e) {
      if (e.target !== no) return e;
      var b = strip(e.before), a = strip(e.after);
      if (b === e.before && a === e.after) return e;
      if (!Object.keys(b || {}).length && !Object.keys(a || {}).length) return null;
      var copy = {};
      Object.keys(e).forEach(function (key) { copy[key] = e[key]; });
      copy.before = b;
      copy.after = a;
      return copy;
    }).filter(Boolean);
  }

  /* この工事の労務費の行: 月ごとの App.laborRows から拾い、そこに無い計上済の行を足す */
  function laborList(no) {
    var rows = [], seen = {};
    App.data().months.forEach(function (m) {
      App.laborRows(m.month).forEach(function (r) {
        if (r.kouji !== no) return;
        rows.push(r);
        seen[r.month] = true;
      });
    });
    App.data().labor.forEach(function (l) {
      if (l.kouji === no && !seen[l.month]) rows.push(l);
    });
    return rows.sort(function (a, b) { return a.month < b.month ? -1 : 1; });
  }

  function notFound(el, no) {
    App.append(el, [
      App.pageHead({
        crumbs: [{ label: '工事一覧', href: App.link(['kouji']) }, { label: '工事 ' + no }],
        title: '工事 ' + no,
        back: { href: App.link(['kouji']), label: '工事一覧に戻る' }
      }),
      App.notice('工事 ' + no + ' は見つかりません。', { plain: true, links: [{ label: '工事一覧に戻る', href: App.link(['kouji']) }] })
    ]);
  }

  App.screen('kouji/:no', {
    title: function (p) {
      var k = App.find('kouji', p.args.no);
      return k ? k.name : '工事 ' + p.args.no;
    },
    render: function (el, params) {
      el.classList.add('kouji_detail');
      var no = params.args.no;
      var k = App.find('kouji', no);
      if (!k) { notFound(el, no); return; }

      var ctx = { kouji: k.no };
      var c = App.calc.kouji(k);
      var see = App.can('view.contract');
      var t = App.transition(k);
      var back = App.canRevert(k);
      var ov = App.can('order.draft', ctx);
      /* 発注は、起票できる役割で見て今の状態で起票できるときだけ見出しの右に置く */
      var orderNow = App.can('order.draft', { kouji: k.no, role: ov.roles[0] }).ok;
      var pending = pendingRevisions(k.no);
      var pick = pending[0] || null;
      var av = App.can('revision.approve', { kouji: k.no, revision: pick });

      function approve() {
        App.confirm('予算改定 ' + pick.no + ' を承認します。', {
          title: '予算改定の承認',
          ok: '承認する',
          id: 'kouji_detail-approve-ok',
          dialogId: 'kouji_detail-approve-dlg',
          lines: [
            pick.cat + 'の予算を ' + yen(pick.before) + '円から ' + yen(pick.after) + '円にします。',
            '理由 ' + pick.reason
          ]
        }).then(function (yes) {
          if (!yes) return;
          var res = App.act('revision.approve', { revision: pick.no });
          App.flash(res.ok ? res : res.reason);
          App.go(window.location.hash);
        });
      }

      /* ---- 見出しと主な操作 ---- */
      var approveHead = av.ok ? App.button('改定を承認', {
        primary: true, id: 'kouji_detail-approve-head', op: 'revision.approve', verdict: av, onClick: approve
      }) : null;
      var orderBtn = App.button('発注を起票', {
        primary: ov.ok && orderNow && !approveHead, id: 'kouji_detail-order', op: 'order.draft', verdict: ov,
        onClick: function () { App.go(App.link(['hacchu', 'new'], { kouji: k.no })); }
      });
      var advanceBtn = t.to ? App.button(t.label, {
        primary: !(ov.ok && orderNow) && !approveHead, id: 'kouji_detail-advance', op: t.op, verdict: t,
        onClick: function () {
          App.formDialog({
            title: t.label,
            id: 'kouji_detail-advance-dlg',
            okId: 'kouji_detail-advance-ok',
            text: '工事 ' + k.no + ' を' + t.to + 'にします。',
            fields: t.fields,
            ok: t.label,
            verdict: t,
            submit: function (v) { return App.act(t.op, ctx, v); }
          }).then(after);
        }
      }) : null;
      var head = !orderNow ? [advanceBtn] : ov.ok ? [advanceBtn, orderBtn] : [orderBtn, advanceBtn];

      App.append(el, [
        App.pageHead({
          crumbs: [{ label: '工事一覧', href: App.link(['kouji']) }, { label: k.name }],
          title: k.name,
          no: k.no,
          tags: [k.status],
          back: { href: App.link(['kouji']), label: '工事一覧に戻る' },
          actions: [approveHead].concat(head).filter(Boolean)
        }),
        App.steps(k)
      ]);

      App.append(el, App.toolbar({ left: [App.button('印刷', { small: true, id: 'kouji_detail-print', onClick: App.print })] }));

      /* ---- 金額のまとめ ---- */
      var cv = App.can('kouji.contract', ctx);
      App.append(el, App.panel({
        title: '金額のまとめ',
        tools: [App.button('受注金額を変更', {
          small: true, id: 'kouji_detail-contract', op: 'kouji.contract', verdict: cv,
          onClick: function () {
            App.formDialog({
              title: '受注金額を変更',
              id: 'kouji_detail-contract-dlg',
              okId: 'kouji_detail-contract-ok',
              text: '工事 ' + k.no + ' ' + k.name,
              ok: '変更する',
              verdict: cv,
              fields: [
                { name: 'contract', label: '受注金額', type: 'yen', value: k.contract, required: true, min: 1 },
                { name: 'reason', label: '理由', type: 'textarea', required: needsReason(k.no), max: 200 }
              ],
              submit: function (v) { return App.act('kouji.contract', ctx, v); }
            }).then(after);
          }
        })],
        body: App.sums([
          see.ok ? { label: '受注金額（円）', value: yen(c.contract) } : null,
          { label: '予算（円）', value: yen(c.total.budget) },
          { label: '発注済（円）', value: yen(c.total.committed) },
          { label: '発生原価（円）', value: yen(c.total.incurred) },
          { label: '計上額（円）', value: yen(c.total.booked) },
          see.ok ? { label: [
            h('span', { class: 'kouji_detail-phrase' }, '粗利'),
            h('span', { class: 'kouji_detail-phrase' }, '（発生原価ベース、円）')
          ], value: yen(c.profit) } : null
        ].filter(Boolean)),
        foot: see.ok ? null : see.reason
      }));

      /* ---- 予算を超えた費目があるときの直し方 ---- */
      if (c.over) {
        App.append(el, App.fixBox({
          title: '予算を超えています（' + c.overCats.map(function (cat) {
            return cat + ' ' + yen(-c.byCat[cat].remain) + '円';
          }).join('、') + '）',
          fix: fixLines(c, pending)
        }));
      }

      /* ---- 予算と実績の対比 ---- */
      App.append(el, App.panel({
        title: '予算と実績の対比',
        flush: true,
        body: h('div', { class: 'kouji_detail-vs' }, App.table({
          caption: '予算と実績の対比',
          count: false,
          rows: c.rows,
          columns: [
            { key: 'cat', label: '費目', nw: true, card: 'head' },
            { key: 'budget', label: '予算（円）', num: true, yen: true },
            { key: 'committed', label: '発注済（円）', num: true, yen: true },
            { key: 'incurred', label: '発生原価（円）', num: true, yen: true },
            { key: 'booked', label: '計上額（円）', num: true, yen: true },
            {
              key: 'remain', label: '残（円）', num: true, nw: true,
              cell: function (r) { return h('span', { class: r.over ? 'over-val' : null }, yen(r.remain)); }
            },
            { key: 'rate', label: '消化率', cls: function () { return 'kouji_detail-rate'; }, cell: function (r) { return App.bar(r.rate); } }
          ],
          foot: {
            label: '合計',
            cells: {
              budget: yen(c.total.budget),
              committed: yen(c.total.committed),
              incurred: yen(c.total.incurred),
              booked: yen(c.total.booked),
              remain: yen(c.total.remain),
              rate: App.fmt.pct(c.total.rate)
            }
          }
        }))
      }));

      /* ---- 予算の改定 ---- */
      var all = revisionsOf(k.no);
      var dv = App.can('revision.draft', ctx);
      var revs = all.filter(function (r) { return r.status !== '取消'; });
      /* 当初の予算と今の値の表は、改定が2つ以上ある費目だけ出す */
      var baseRows = c.rows.filter(function (row) {
        return revs.filter(function (r) { return r.cat === row.cat; }).length > 1;
      });
      var revCols = [
        { key: 'no', label: '改定番号', nw: true, card: 'head' },
        { key: 'status', label: '状態', card: 'tag', cell: function (r) { return App.chip(r.status); } },
        { key: 'revisedOn', label: '改定日', date: true, nw: true },
        { key: 'cat', label: '費目', nw: true },
        { key: 'before', label: '改定前（円）', num: true, yen: true },
        { key: 'after', label: '改定後（円）', num: true, yen: true },
        { key: 'reason', label: '理由', card: 'wide' },
        { key: 'drafter', label: '起案者', nw: true, value: function (r) { return App.empName(r.drafter); } },
        { key: 'approver', label: '承認者', nw: true, value: function (r) { return App.empName(r.approver); } }
      ];
      /* 取消の列は起案のままの改定があるときだけ置く */
      if (pick) {
        revCols.push({
          key: 'op', label: '操作',
          cls: function (r) { return r.status === '起案' ? '' : 'k-hide'; },
          cell: function (r) {
            if (r.status !== '起案') return '';
            return App.button('取消', {
              small: true, op: 'revision.cancel', verdict: App.can('revision.cancel', { revision: r.no }),
              onClick: function () {
                App.confirmWithReason('予算改定 ' + r.no + ' を取り消します。', {
                  title: '予算改定の取消',
                  ok: '取り消す',
                  id: 'kouji_detail-cancel-ok',
                  dialogId: 'kouji_detail-cancel-dlg',
                  submit: function (reason) { return App.act('revision.cancel', { revision: r.no }, { reason: reason }); }
                }).then(after);
              }
            });
          }
        });
      }
      App.append(el, App.panel({
        title: '予算の改定',
        flush: true,
        tools: [
          App.button('改定を起案', {
            small: true, id: 'kouji_detail-draft', op: 'revision.draft', verdict: dv,
            onClick: function () {
              App.formDialog({
                title: '予算改定の起案',
                id: 'kouji_detail-draft-dlg',
                okId: 'kouji_detail-draft-ok',
                text: '工事 ' + k.no + ' ' + k.name,
                lines: [h('p', null, ['今の予算 '].concat(c.rows.map(function (r, i) {
                  return h('span', { class: 'kouji_detail-pair' }, r.cat + ' ' + yen(r.budget) + '円' + (i < c.rows.length - 1 ? '、' : ''));
                })))],
                ok: '起案する',
                verdict: dv,
                fields: [
                  { name: 'cat', label: '費目', type: 'select', options: App.CATS, value: c.overCats[0] || '', required: true },
                  { name: 'after', label: '改定後の額', type: 'yen', required: true, min: 0 },
                  { name: 'reason', label: '理由', type: 'textarea', required: true, max: 200 }
                ],
                submit: function (v) { return App.act('revision.draft', ctx, v); }
              }).then(after);
            }
          }),
          App.button('改定を承認', {
            small: true, id: 'kouji_detail-approve', op: 'revision.approve', verdict: av, onClick: approve
          })
        ],
        body: revs.length ? [
          baseRows.length ? h('div', { class: 'kouji_detail-base' }, App.table({
            caption: '改定した費目の当初の予算と今の値',
            count: false,
            cards: false,
            rows: baseRows,
            columns: [
              { key: 'cat', label: '費目', nw: true },
              { key: 'budget0', label: '当初（円）', num: true, yen: true },
              { key: 'budget', label: '今の値（円）', num: true, yen: true }
            ]
          })) : null,
          h('div', { class: 'kouji_detail-revs' }, App.table({
            caption: '予算改定の一覧',
            count: false,
            rows: revs,
            columns: revCols
          }))
        ].filter(Boolean) : App.table({
          caption: '予算改定の一覧',
          count: false,
          rows: [],
          empty: '予算改定はありません',
          columns: revCols
        })
      }));

      /* ---- 基本情報 ---- */
      App.append(el, App.panel({
        title: '基本情報',
        tools: [App.button('基本情報を編集', {
          small: true, id: 'kouji_detail-edit', op: 'kouji.edit', verdict: App.can('kouji.edit', ctx),
          onClick: function () { App.koujiDialog(k.no); }
        })],
        body: App.info([
          { label: '施主', value: nameCell(App.partnerName(k.client), true) },
          { label: '工事場所', value: nameCell(k.site) },
          { label: '工事種別', value: k.kind },
          { label: '営業担当', value: App.empName(k.sales) },
          { label: '工事担当', value: App.empName(k.manager) },
          { label: '着工予定日', value: App.fmt.date(k.planStart) },
          { label: '完工予定日', value: App.fmt.date(k.planEnd) },
          see.ok ? { label: '見積金額（円）', value: yen(k.estimate) } : null,
          see.ok ? { label: '施主への請求額（円）', value: yen(k.clientBillAmount) } : null,
          { label: '備考', value: k.note }
        ])
      }));

      /* ---- 発注の一覧 ---- */
      var saved = App.recall(KEY) || {};
      var orders = App.data().orders.filter(function (o) { return o.kouji === k.no; })
        .sort(function (a, b) { return a.no < b.no ? -1 : 1; });
      var voids = orders.filter(function (o) { return o.status === '取消'; }).length;
      var shown = (saved.voidShown ? orders : orders.filter(function (o) { return o.status !== '取消'; }))
        .map(function (o) { return { o: o, x: App.calc.hacchu(o) }; });
      /* 発注金額の列は有効発注額と違う行（減額発注と、減額が入った元の発注）があるときだけ置く */
      var amountDiffers = shown.some(function (r) { return r.x.kind === '減額' || r.x.eff !== Number(r.o.amount); });
      App.append(el, App.panel({
        title: '発注の一覧',
        flush: true,
        tools: voids ? [App.chip('取消も見る', {
          pressed: !!saved.voidShown,
          count: voids,
          onClick: function () {
            App.remember(KEY, { voidShown: !saved.voidShown });
            App.render();
          }
        })] : null,
        body: h('div', { class: 'kouji_detail-orders' }, App.table({
          caption: '発注の一覧',
          count: shown.length ? undefined : false,
          total: orders.length,
          rows: shown,
          empty: voids ? '取消のほかに発注はありません' : '発注はありません',
          href: function (r) { return App.hrefOf(r.o.no); },
          rowClass: function (r) { return r.o.status === '取消' ? 'is-void' : ''; },
          columns: [
            {
              key: 'no', label: '発注番号', nw: true, card: 'head',
              cell: function (r) {
                if (r.x.kind === '通常') return r.o.no;
                return [h('span', null, r.o.no), h('span', { class: 'sub-line' }, r.x.kind + ' 元 ' + r.o.related)];
              }
            },
            { key: 'partner', label: '取引先', card: 'title', value: function (r) { return App.partnerName(r.o.partner); } },
            { key: 'cat', label: '費目', nw: true, card: 'hide', value: function (r) { return r.o.cat; } },
            { key: 'title', label: '件名', card: 'hide', value: function (r) { return r.o.title; } },
            amountDiffers ? {
              key: 'amount', label: '発注金額（円）', num: true, nw: true,
              cls: function (r) { return r.x.kind === '減額' ? '' : 'k-hide'; },
              cell: function (r) { return yen(r.o.amount); }
            } : null,
            {
              key: 'eff', label: '有効発注額（円）', num: true, nw: true,
              cls: function (r) { return r.x.kind === '減額' ? 'k-hide' : ''; },
              cell: function (r) { return r.x.kind === '減額' ? '' : yen(r.x.eff); }
            },
            {
              key: 'cum', label: '発注検収の累計（円）', num: true, nw: true, card: 'hide',
              cell: function (r) { return r.x.kind === '減額' ? '' : yen(r.x.cum); }
            },
            { key: 'status', label: '状態', card: 'tag', cell: function (r) { return App.chip(r.x.statusLabel); } }
          ].filter(Boolean)
        }))
      }));

      /* ---- 労務費 ---- */
      App.append(el, App.panel({
        title: '労務費',
        flush: true,
        body: h('div', { class: 'kouji_detail-labor' }, App.table({
          caption: '労務費',
          count: false,
          rows: laborList(k.no),
          empty: '労務費はありません',
          href: function (r) { return App.hrefOf(k.no + ' ' + r.month); },
          columns: [
            { key: 'month', label: '月', nw: true, card: 'head' },
            { key: 'state', label: '計上', card: 'tag', cell: function (r) { return App.chip(r.recordedOn ? '計上済' : '未計上'); } },
            { key: 'hours', label: '時間', num: true, cell: function (r) { return App.fmt.hours(r.hours); } },
            {
              key: 'rate', label: '単価（円）', num: true, yen: true,
              value: function (r) { return r.hours === null || r.hours === undefined ? null : r.rate; }
            },
            { key: 'amount', label: '金額（円）', num: true, yen: true },
            { key: 'recordedOn', label: '計上日', date: true, nw: true, card: 'hide' }
          ]
        }))
      }));

      /* ---- そのほかの操作 ---- */
      App.append(el, App.panel({
        title: 'そのほかの操作',
        body: App.opList([orderNow ? null : orderBtn, App.button('状態を1つ戻す', {
          id: 'kouji_detail-revert', op: 'kouji.revert', danger: true, verdict: back,
          onClick: function () {
            App.confirmWithReason('工事 ' + k.no + ' を' + back.from + 'から' + back.to + 'に戻します。', {
              title: '状態を1つ戻す',
              ok: '戻す',
              danger: true,
              id: 'kouji_detail-revert-ok',
              dialogId: 'kouji_detail-revert-dlg',
              lines: [h('div', { class: 'kouji_detail-clears' }, [
                h('p', null, '戻すと次の項目が消えます。'),
                h('ul', null, back.clears.map(function (cl) { return h('li', null, clearText(cl)); }))
              ])],
              submit: function (reason) { return App.act('kouji.revert', ctx, { reason: reason }); }
            }).then(after);
          }
        })])
      }));

      /* ---- 履歴（受注金額は営業と経理にだけ出す） ---- */
      var entries = App.historyFor(k.no, { deep: true });
      App.append(el, App.panel({
        title: '履歴',
        flush: true,
        body: App.log(see.ok ? entries : withoutContract(entries, k.no))
      }));
    }
  });
})();
