(function () {
  'use strict';

  var h = App.h;
  var yen = App.fmt.yen;
  var BACK = { href: App.link(['kouji']), label: '工事一覧に戻る' };

  function koujiCrumbs(kno) {
    return [{ label: '工事一覧', href: App.link(['kouji']) }, { label: '工事 ' + kno, href: App.link(['kouji', kno]) }];
  }

  function missing(el, last, text) {
    App.append(el, [
      App.pageHead({ crumbs: [{ label: '工事一覧', href: App.link(['kouji']) }, { label: last }], title: last, back: BACK }),
      App.notice(text, { plain: true })
    ]);
  }

  /* 条件で必須になる欄の「必須」の印を付け外しする */
  function setRequired(field, on) {
    var lab = field.querySelector('.field-label');
    var mark = lab ? lab.querySelector('.req') : null;
    if (on && lab && !mark) App.append(lab, h('span', { class: 'req' }, '必須'));
    if (!on && mark) lab.removeChild(mark);
  }

  /* 費目の横に出す予算の残り。値は App.budgetOver のまま出す */
  function budgetBox() {
    var box = h('div', { class: 'hacchu-budget', 'aria-live': 'polite' });
    box.show = function (cat, b) {
      box.textContent = '';
      var after = b ? yen(b.after) + '円' : '';
      App.append(box, [
        h('p', { class: 'hacchu-budget-title' }, cat ? cat + 'の予算' : '費目の予算'),
        App.info([
          { label: '予算', value: b ? yen(b.budget) + '円' : '', num: true },
          { label: '発注済', value: b ? yen(b.committed) + '円' : '', num: true },
          { label: 'この発注を入れた後の残', value: b && b.over ? h('span', { class: 'over-val' }, after) : after, num: true }
        ], 'kv')
      ]);
    };
    return box;
  }

  /* 発注金額の欄の下に出す、予算を超える額 */
  function overLine(field) {
    var p = h('p', { class: 'hacchu-over', 'aria-live': 'polite', hidden: true });
    field.insertBefore(p, field.querySelector('.err'));
    p.show = function (cat, b) {
      var on = !!(b && b.over);
      p.hidden = !on;
      p.textContent = on ? cat + 'の予算を ' + yen(-b.after) + '円 超えます' : '';
    };
    return p;
  }

  /* 減らす額の横に出す元の発注の未検収残 */
  function remainBox(motoNo) {
    return h('div', { class: 'hacchu-budget hacchu-remain' }, App.info([
      { label: '元の発注の未検収残', value: yen(App.calc.hacchu(motoNo).remain) + '円', num: true }
    ], 'kv'));
  }

  /* 欄の検査は App.can の errors のうち、その欄の分だけを返す */
  function checker(op, ctx, formOf, name) {
    return function () {
      var form = formOf();
      return form ? (App.can(op, ctx, form.values()).errors || {})[name] || '' : '';
    };
  }

  /* 1行の入力欄で Enter を押すと、保存のボタンと同じ検査と保存を行う */
  function enterSends(form) {
    form.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229 || e.target.tagName !== 'INPUT') return;
      e.preventDefault();
      form.send();
    });
  }

  function closedReason(v) {
    var d = App.parse.date(v);
    return d ? App.closedDateReason(d) : '';
  }

  /* ---------- 登録 ---------- */

  function renderNew(el, q) {
    var moto = q.moto ? App.find('orders', q.moto) : null;
    if (q.moto && !moto) return missing(el, '発注の登録', '発注 ' + q.moto + ' は見つかりません。');
    var kno = moto ? moto.kouji : q.kouji;
    var k = kno ? App.find('kouji', kno) : null;
    if (!k) return missing(el, '発注の登録', kno ? '工事 ' + kno + ' は見つかりません。' : '発注は工事の詳細から起票します。');

    var mode = moto ? (q.kind === 'reduce' ? 'reduce' : 'add') : 'draft';
    var op = 'order.' + mode;
    var ctx = moto ? { moto: moto.no } : { kouji: k.no };
    var v = App.can(op, ctx);
    var off = !v.ok;
    var form = null;
    var formOf = function () { return form; };
    var check = function (name) { return checker(op, ctx, formOf, name); };
    var box = mode === 'reduce' ? null : budgetBox();
    var cat, partner, title, amount, due, reason, over;

    function refresh() {
      if (!box) return;
      var c = cat.get();
      var b = c ? App.budgetOver(k.no, c, App.parse.yen(amount.get()) || 0) : null;
      box.show(c, b);
      over.show(c, b);
      var on = !!(b && b.over);
      reason.hidden = !on;
      reason.control.disabled = !on || off;
      setRequired(reason, on && !off);
      if (!on) reason.setError('');
    }

    if (mode === 'draft') {
      cat = App.field({
        name: 'cat', label: '費目', type: 'select', required: true, options: App.ORDER_CATS, disabled: off, check: check('cat'),
        onInput: function (val) { partner.setOptions(App.partnerOptions(val)); refresh(); }
      });
      partner = App.field({
        name: 'partner', label: '取引先', type: 'select', required: true, options: App.partnerOptions(''), disabled: off, check: check('partner')
      });
    } else {
      cat = App.field({ name: 'cat', label: '費目', type: 'select', required: true, options: App.ORDER_CATS, value: moto.cat, disabled: true });
      partner = App.field({
        name: 'partner', label: '取引先', type: 'select', required: true, options: App.partnerOptions(moto.cat, moto.partner), value: moto.partner,
        disabled: '追加発注と減額発注の取引先と費目は元の発注と同じです'
      });
    }
    title = App.field({ name: 'title', label: '件名', required: true, max: 40, span2: true, disabled: off, check: check('title') });
    amount = App.field({
      name: 'amount', label: mode === 'reduce' ? '減らす額' : '発注金額', type: 'yen', required: true, min: mode === 'reduce' ? undefined : 1,
      disabled: off, check: check('amount'), onInput: refresh
    });
    if (box) over = overLine(amount);
    var list = box ? [cat, box, partner, title, amount] : [cat, partner, title, amount, remainBox(moto.no)];
    if (mode !== 'reduce') {
      due = App.field({ name: 'due', label: '納期', type: 'date', required: true, disabled: off, check: check('due') });
      list.push(due);
    }
    list.push(
      App.field({ name: 'draftedOn', label: '起票日', type: 'date', value: App.today(), disabled: true }),
      App.field({ name: 'orderedOn', label: '発注日', type: 'text', disabled: '承認した日に入ります' })
    );
    if (mode !== 'reduce') {
      reason = App.field({ name: 'overReason', label: '予算超過の理由', type: 'textarea', max: 200, disabled: off, check: check('overReason') });
      list.push(reason);
    }
    list.push(App.field({ name: 'note', label: '備考', type: 'textarea', max: 200, disabled: off, check: check('note') }));

    form = App.form({
      actions: false,
      lead: h('div', { class: 'hacchu-lead' }, App.info([
        { label: '工事', value: k.no + ' ' + k.name },
        moto ? { label: '元の発注', value: moto.no + ' ' + moto.title } : null
      ], 'kv')),
      fields: list,
      onSubmit: function (values) {
        var res = App.act(op, ctx, values);
        if (!res.ok) return res;
        App.flash(res);
        App.go(App.hrefOf(res.no));
        return res;
      }
    });
    enterSends(form);
    refresh();

    /* 必須の空、起票日より前の納期、予算の残りを超える額を入れ、App.can の誤りを欄の下に出す */
    function example() {
      cat.set('外注費');
      partner.setOptions(App.partnerOptions('外注費'));
      var first = App.partnerOptions('外注費')[0];
      partner.set(first ? first.value : '');
      title.set('');
      amount.set(Math.max(App.budgetOver(k.no, '外注費', 0).remain, 0) + 1);
      due.set(App.addMonths(App.monthOf(App.today()), -1) + '-28');
      reason.set('');
      refresh();
      App.setDirty(true);
      form.showErrors(App.can(op, ctx, form.values()).errors);
    }

    var pageTitle = mode === 'reduce' ? '減額発注の登録' : (mode === 'add' ? '追加発注の登録' : '発注の登録');
    var crumbs = koujiCrumbs(k.no);
    if (moto) crumbs.push({ label: '発注 ' + moto.no, href: App.hrefOf(moto.no) });
    crumbs.push({ label: pageTitle });

    var save = App.button(mode === 'reduce' ? '減額発注を起票' : (mode === 'add' ? '追加発注を起票' : '発注を起票'), {
      primary: true, id: 'hacchu-save', op: op, verdict: v, onClick: function () { form.send(); }
    });
    var exampleBtn = mode === 'draft' && v.ok ? App.button('誤りの例を出す', { small: true, side: true, id: 'hacchu-example', onClick: example }) : null;

    App.append(el, [
      App.pageHead({ crumbs: crumbs, title: pageTitle, back: BACK, actions: [save] }),
      App.panel({ title: '発注の内容', tools: exampleBtn ? [exampleBtn] : null, body: form })
    ]);
  }

  /* ---------- 詳細 ---------- */

  /* 件名の末尾の短い括弧書きは途中で折り返さない */
  function titleNode(t) {
    var m = /^(.+?)(（[^（）]{1,14}）)$/.exec(t || '');
    return m ? [m[1], h('span', { class: 'nw' }, m[2])] : t;
  }

  function cancelInspection(i) {
    App.confirmWithReason('発注検収 ' + i.no + ' を取り消します。', {
      title: '発注検収の取消', ok: '取り消す', id: 'hacchu-kcancel-ok', dialogId: 'dlg-hacchu-kcancel',
      lines: ['検収日 ' + App.fmt.date(i.date) + '、検収額 ' + yen(i.amount) + '円、' + i.content],
      submit: function (reason) { return App.act('inspection.cancel', { inspection: i.no }, { reason: reason }); }
    }).then(done);
  }

  function correctInspection(i) {
    var verdict = App.can('inspection.correct', { inspection: i.no });
    App.formDialog({
      title: '発注検収の訂正', ok: '訂正を登録', id: 'dlg-hacchu-kcorrect', okId: 'hacchu-kcorrect-ok',
      text: '発注検収 ' + i.no + '（検収日 ' + App.fmt.date(i.date) + '、' + yen(i.amount) + '円）を当月の日付で訂正します。',
      lines: ['訂正できるのは ' + yen(Math.max(verdict.left || 0, 0)) + '円までで、マイナス額で登録します。'],
      verdict: verdict,
      fields: [
        { name: 'date', label: '検収日', type: 'date', required: true, value: App.today(), check: closedReason },
        { name: 'amount', label: '訂正する額', type: 'yen', required: true },
        { name: 'reason', label: '理由', type: 'textarea', required: true, max: 200 }
      ],
      submit: function (values) { return App.act('inspection.correct', { inspection: i.no }, values); }
    }).then(done);
  }

  function done(res) {
    if (!res) return;
    App.flash(res);
    App.render();
  }

  function inspectionOps(i) {
    var ctx = { inspection: i.no };
    return h('div', { class: 'hacchu-ops' }, [
      App.button('取消', {
        small: true, op: 'inspection.cancel', id: 'hacchu-kcancel-' + i.no,
        verdict: App.can('inspection.cancel', ctx), onClick: function () { cancelInspection(i); }
      }),
      App.button('訂正', {
        small: true, op: 'inspection.correct', id: 'hacchu-kcorrect-' + i.no,
        verdict: App.can('inspection.correct', ctx), onClick: function () { correctInspection(i); }
      })
    ]);
  }

  function relatedPanel(o, c) {
    var rows = [];
    if (o.related) rows.push({ rel: '元', no: o.related });
    c.additions.forEach(function (n) { rows.push({ rel: '追加', no: n }); });
    c.reductions.forEach(function (n) { rows.push({ rel: '減額', no: n }); });
    rows.forEach(function (r) { r.o = App.find('orders', r.no); });
    rows = rows.filter(function (r) { return r.o; });
    return App.panel({
      title: '関連する発注',
      flush: true,
      body: App.table({
        caption: '関連する発注',
        columns: [
          { key: 'no', label: '発注番号', nw: true, card: 'head' },
          { key: 'rel', label: '関係', nw: true },
          { key: 'title', label: '件名', card: 'title', value: function (r) { return r.o.title; } },
          { key: 'amount', label: '発注金額（円）', num: true, nw: true, yen: true, value: function (r) { return r.o.amount; } },
          { key: 'status', label: '状態', nw: true, card: 'tag', cell: function (r) { return App.chip(App.orderStatusLabel(r.o)); } }
        ],
        rows: rows,
        count: rows.length > 0,
        href: function (r) { return App.hrefOf(r.no); },
        rowClass: function (r) { return r.o.status === '取消' ? 'is-void' : ''; },
        empty: '関連する発注はありません'
      })
    });
  }

  function inspectionPanel(rows) {
    var columns = [
      { key: 'no', label: '検収番号', nw: true, card: 'head' },
      { key: 'date', label: '検収日', nw: true, date: true },
      { key: 'amount', label: '検収額（円）', num: true, nw: true, yen: true },
      { key: 'content', label: '内容', nw: true },
      { label: '状態', nw: true, card: 'tag', cell: function (i) { return App.chip(i.status); } }
    ];
    /* 値のある行が1つも無い列は出さない */
    if (rows.some(function (i) { return i.corrects; })) {
      columns.push({ key: 'corrects', label: '訂正元', nw: true, cls: function (i) { return i.corrects ? '' : 'k-hide'; } });
    }
    if (rows.some(function (i) { return i.cancelReason; })) {
      columns.push({ key: 'cancelReason', label: '取消の理由', cls: function (i) { return i.cancelReason ? '' : 'k-hide'; } });
    }
    var hasOp = rows.some(function (i) { return i.status === '有効'; });
    if (hasOp) {
      columns.push({
        label: '操作', card: 'wide',
        cls: function (i) { return i.status === '有効' ? '' : 'k-hide'; },
        cell: function (i) { return i.status === '有効' ? inspectionOps(i) : null; }
      });
    }
    var p = App.panel({
      title: '発注検収',
      flush: true,
      body: App.table({
        caption: '発注検収',
        columns: columns,
        rows: rows,
        count: rows.length > 0,
        rowClass: function (i) { return i.status === '取消' ? 'is-void' : ''; },
        empty: '発注検収はまだありません'
      })
    });
    return p;
  }

  function invoicePanel(rows) {
    return App.panel({
      title: '請求',
      flush: true,
      body: App.table({
        caption: '請求',
        columns: [
          { key: 'no', label: '受付番号', nw: true, card: 'head' },
          { key: 'invoiceNo', label: '請求書番号', nw: true, card: 'hide' },
          { key: 'invoiceDate', label: '請求書の日付', nw: true, date: true },
          { key: 'amount', label: '請求額（円）', num: true, nw: true, yen: true },
          { key: 'bookMonth', label: '計上月', nw: true, value: function (x) { return x.bookMonth ? App.fmt.month(x.bookMonth) : ''; } },
          { key: 'status', label: '状態', nw: true, card: 'tag', cell: function (x) { return App.chip(x.status); } }
        ],
        rows: rows,
        count: rows.length > 0,
        href: function (x) { return App.hrefOf(x.no); },
        rowClass: function (x) { return x.status === '取消' ? 'is-void' : ''; },
        empty: '請求はまだありません'
      })
    });
  }

  function renderDetail(el, no) {
    var o = App.find('orders', no);
    if (!o) return missing(el, '発注 ' + no, '発注 ' + no + ' は見つかりません。');
    var k = App.find('kouji', o.kouji);
    var c = App.calc.hacchu(o);
    var red = c.kind === '減額';
    var ctx = { order: o.no };
    var editOp = c.fixPending ? 'order.resubmit' : 'order.edit';
    var kenshuHref = App.link(['kenshu'], { hacchu: red ? o.related : o.no });
    var amountLine = (red ? '減らす額 ' + yen(-o.amount) : '発注金額 ' + yen(o.amount)) + '円';
    var form = null;
    var formOf = function () { return form; };

    /* ---- 項目 ---- */
    var specs = App.orderFields(o);
    var ev = App.can(editOp, ctx);
    /* 減額発注は納期を持たないので欄を出さない */
    if (red) specs = specs.filter(function (f) { return f.name !== 'due'; });
    /* 画面に出る欄（予算超過の理由は値のあるときだけ）をフォームの並びの順に */
    var ORDER = ['cat', 'partner', 'title', 'amount', 'due', 'overReason', 'note'];
    var shown = specs.filter(function (f) { return f.name !== 'overReason' || f.value; })
      .sort(function (a, b) { return ORDER.indexOf(a.name) - ORDER.indexOf(b.name); });
    /* 発注を直せないときは、欄を入力欄でなく値の文で出し、欄ごとの理由は出さない。値が無ければ「–」 */
    var view = !ev.ok;
    /* 2つ以上の欄に同じ理由があるときは、欄ごとに出さずフォームの上に1回だけ、対象の欄の名前を付けて出す */
    var groups = {};
    if (!view) shown.forEach(function (f) { if (f.lockReason) (groups[f.lockReason] = groups[f.lockReason] || []).push(f.label); });
    var shared = Object.keys(groups).filter(function (r) { return groups[r].length > 1; });
    function lockLine(r) {
      var labels = groups[r];
      var named = labels.every(function (l) { return r.indexOf(l) >= 0; });
      return labels.length === shown.length || named ? r : labels.join('、') + 'は' + r;
    }
    function valueText(f) {
      var v = f.value;
      if (v === null || v === undefined || v === '') return '';
      if (f.name === 'partner') return App.partnerName(v);
      if (f.type === 'yen') return yen(v) + '円';
      if (f.type === 'date') return App.fmt.date(v);
      return String(v);
    }
    function textField(f, wide) {
      var text = valueText(f);
      var box = h('div', { class: ['field', wide ? 'span-2' : '', 'hacchu-text'], 'data-name': f.name }, [
        h('p', { class: 'field-label' }, f.label),
        h('p', { class: 'hacchu-val' }, text ? App.nw(text) : '–')
      ]);
      box.name = f.name;
      box.control = { disabled: true };
      box.get = function () { return f.value === null || f.value === undefined ? '' : String(f.value); };
      box.setError = function () {};
      return box;
    }
    var fields = {};
    specs.forEach(function (f) {
      if (view) {
        fields[f.name] = textField(f, f.name === 'title' || f.type === 'textarea');
        return;
      }
      var opts = {
        name: f.name, label: f.label, type: f.type, required: f.required, value: f.value, max: f.max, unit: f.unit,
        options: f.options, editable: f.editable, lockReason: f.lockReason, span2: f.name === 'title' || f.type === 'textarea',
        check: checker(editOp, ctx, formOf, f.name)
      };
      if (f.name === 'amount' && !red) opts.min = 1;
      if (shared.indexOf(f.lockReason) >= 0) opts.disabled = true;
      if (f.name === 'cat') {
        opts.onInput = function (val) {
          fields.partner.setOptions(App.partnerOptions(val, o.partner));
          refresh();
        };
      }
      if (f.name === 'amount' || f.name === 'overReason') opts.onInput = function () { refresh(); };
      fields[f.name] = App.field(opts);
    });
    var box = null;
    if (o.status === '起票') box = red ? remainBox(o.related) : budgetBox();
    var overAt = box && box.show ? overLine(fields.amount) : null;
    var reason = fields.overReason;

    function refresh() {
      var on = false;
      if (overAt) {
        var cat = fields.cat.get();
        var b = cat ? App.budgetOver(o.kouji, cat, App.parse.yen(fields.amount.get()) || 0) : null;
        box.show(cat, b);
        overAt.show(cat, b);
        on = !!(b && b.over);
      }
      reason.hidden = !on && !reason.get();
      setRequired(reason, on && !reason.control.disabled);
      if (!on && reason.classList.contains('is-err') && !reason.get()) reason.setError('');
    }

    var order = red ? ['cat', 'partner', 'title', 'amount', 'box', 'due', 'overReason', 'note'] : ['cat', 'box', 'partner', 'title', 'amount', 'due', 'overReason', 'note'];
    var list = order.map(function (n) { return n === 'box' ? box : fields[n]; }).filter(Boolean);
    var anyEditable = specs.some(function (f) { return f.editable; });
    /* 保存のボタンが無い発注を直せない役割には、直せない理由をフォームの上に1回だけ出す */
    var lockLines = shared.map(lockLine);
    if (view && !anyEditable && !c.fixPending) lockLines = [ev.reason];
    form = App.form({
      fields: list,
      lead: lockLines.length ? h('div', { class: 'hacchu-lock' }, lockLines.map(function (r) { return h('p', { class: 'hint' }, App.nw(r)); })) : null,
      actions: c.fixPending || !anyEditable ? false : undefined,
      submitLabel: '発注を保存',
      submitId: 'hacchu-edit',
      verdict: ev,
      onSubmit: function (values) {
        var res = App.act(editOp, ctx, values);
        if (!res.ok) return res;
        App.flash(res);
        App.render();
        return res;
      }
    });
    form.classList.add('hacchu-form');
    if (c.fixPending && !view) enterSends(form);
    refresh();

    /* ---- 操作 ---- */
    function approve() {
      var lines = [
        '発注日は ' + App.fmt.date(App.today()) + ' になります。',
        '取引先 ' + App.partnerName(o.partner) + '、' + amountLine
      ];
      if (o.overReason) lines.push('予算超過の理由 ' + o.overReason);
      App.confirm('発注 ' + o.no + ' を承認します。', {
        title: '発注を承認', ok: '承認する', id: 'hacchu-approve-ok', dialogId: 'dlg-hacchu-approve', lines: lines
      }).then(function (yes) {
        if (!yes) return;
        var res = App.act('order.approve', ctx);
        if (res.ok) App.flash(res);
        else App.flash(res.reason);
        App.render();
      });
    }
    function requestFix() {
      App.confirmWithReason('発注 ' + o.no + ' に修正を依頼します。', {
        title: '修正を依頼', label: '依頼の文言', ok: '依頼する', id: 'hacchu-fix-ok', dialogId: 'dlg-hacchu-fix',
        submit: function (r) { return App.act('order.requestFix', ctx, { reason: r }); }
      }).then(done);
    }
    function cancelOrder() {
      App.confirmWithReason('発注 ' + o.no + ' を取り消します。', {
        title: '発注を取消', ok: '取り消す', id: 'hacchu-cancel-ok', dialogId: 'dlg-hacchu-cancel',
        lines: [o.title + '、' + amountLine],
        submit: function (r) { return App.act('order.cancel', ctx, { reason: r }); }
      }).then(done);
    }
    function terminate() {
      App.confirmWithReason('発注 ' + o.no + ' の未検収残を打ち切ります。', {
        title: '未検収残を打切', ok: '打ち切る', id: 'hacchu-terminate-ok', dialogId: 'dlg-hacchu-terminate',
        lines: ['発注検収の累計 ' + yen(c.cum) + '円、未検収残 ' + yen(c.remain) + '円'],
        submit: function (r) { return App.act('order.terminate', ctx, { reason: r }); }
      }).then(done);
    }

    var defs = {
      approve: ['発注を承認', 'order.approve', App.can('order.approve', ctx), approve],
      fix: ['修正を依頼', 'order.requestFix', App.can('order.requestFix', ctx), requestFix],
      resubmit: ['発注を再提出', 'order.resubmit', App.can('order.resubmit', ctx), function () { form.send(); }],
      kenshu: ['発注検収へ', null, App.can('inspection.register', { order: red ? o.related : o.no }), function () { App.go(kenshuHref); }],
      add: ['追加発注を起票', 'order.add', App.can('order.add', { moto: o.no }), function () {
        App.go(App.link(['hacchu', 'new'], { moto: o.no }));
      }],
      reduce: ['減額発注を起票', 'order.reduce', App.can('order.reduce', { moto: o.no }), function () {
        App.go(App.link(['hacchu', 'new'], { moto: o.no, kind: 'reduce' }));
      }],
      cancel: ['発注を取消', 'order.cancel', App.can('order.cancel', ctx), cancelOrder],
      terminate: ['未検収残を打切', 'order.terminate', App.can('order.terminate', ctx), terminate]
    };
    function btn(key, primary) {
      var d = defs[key];
      return App.button(d[0], {
        primary: !!primary, danger: key === 'cancel' || key === 'terminate',
        id: 'hacchu-' + key, op: d[1], verdict: d[2], onClick: d[3]
      });
    }
    /* 見出しの右は今の状態で次に進める操作だけにし、残りはそのほかの操作に置く */
    var main = [];
    var rest = ['add', 'reduce', 'cancel', 'terminate'];
    if (o.status === '起票') {
      main = c.fixPending ? [btn('resubmit', true)] : [btn('fix'), btn('approve', true)];
      rest = (c.fixPending ? ['approve', 'fix', 'kenshu'] : ['kenshu']).concat(rest);
    } else if (o.status === '承認済' && !red) {
      main = [btn('kenshu', true)];
    } else {
      rest = ['kenshu'].concat(rest);
    }

    App.append(el, [
      App.pageHead({
        crumbs: koujiCrumbs(o.kouji).concat([{ label: '発注 ' + o.no }]),
        title: titleNode(o.title),
        no: o.no,
        tags: [c.statusLabel, c.fixPending ? '修正依頼あり' : null],
        back: BACK,
        actions: main
      }),
      App.toolbar({ left: [App.button('印刷', { id: 'hacchu-print', onClick: App.print })] })
    ]);

    if (c.fixPending) {
      var fix = ['工事担当が下の項目を直し、「発注を再提出」を押します。'];
      if (!red && App.budgetOver(o.kouji, o.cat, o.amount).over) fix.push('予算を増やすときは、工事担当が工事詳細で予算改定を起案します。');
      App.append(el, App.fixBox({
        title: c.fixText,
        fix: fix,
        links: [{ label: '工事 ' + o.kouji + ' を開く', href: App.link(['kouji', o.kouji]) }]
      }));
    }

    var showSums = !red && ['承認済', '検収済', '打切'].indexOf(o.status) >= 0;
    var facts = App.info([
      { label: '工事', value: k ? k.no + ' ' + k.name : o.kouji },
      { label: '区分', value: c.kind },
      o.related ? { label: '元の発注', value: o.related } : null,
      { label: '起票者', value: App.empName(o.drafter) },
      { label: '起票日', value: App.fmt.date(o.draftedOn) },
      { label: '承認者', value: App.empName(o.approver) },
      { label: '発注日', value: o.status === '起票' && !o.orderedOn ? '承認した日に入ります' : App.fmt.date(o.orderedOn) },
      o.cancelReason ? { label: o.status === '打切' ? '打切の理由' : '取消の理由', value: o.cancelReason } : null
    ]);
    /* 取消と打切の理由は1行の幅いっぱいに出す */
    if (o.cancelReason) facts.lastChild.classList.add('hacchu-wide');
    App.append(el, App.panel({
      title: '発注の内容',
      body: [
        facts,
        showSums ? App.sums([
          { label: '有効発注額（円）', value: yen(c.eff) },
          { label: '発注検収の累計（円）', value: yen(c.cum) },
          { label: '未検収残（円）', value: yen(c.remain) },
          { label: '確認済の請求額（円）', value: yen(c.confirmed) }
        ]) : null,
        form
      ]
    }));
    App.append(el, App.panel({ title: 'そのほかの操作', body: App.opList(rest.map(function (key) { return btn(key); })) }));

    App.append(el, relatedPanel(o, c));
    var ins = App.data().inspections.filter(function (i) { return i.order === o.no; });
    var invs = App.data().invoices.filter(function (x) { return x.order === o.no; });
    if (!red) App.append(el, [inspectionPanel(ins), invoicePanel(invs)]);
    var nos = [o.no].concat(ins.map(function (i) { return i.no; }), invs.map(function (x) { return x.no; }));
    App.append(el, App.panel({
      title: '履歴',
      flush: true,
      body: App.log(App.historyFor(nos, { related: true }), { label: '履歴' })
    }));
  }

  App.screen('hacchu/:no', {
    menu: 'kouji',
    title: function (p) {
      var q = p.query || {};
      if (p.args.no !== 'new') return '発注 ' + p.args.no;
      if (!q.moto) return '発注の登録';
      return q.kind === 'reduce' ? '減額発注の登録' : '追加発注の登録';
    },
    render: function (el, params) {
      el.classList.add('hacchu');
      if (params.args.no === 'new') renderNew(el, params.query || {});
      else renderDetail(el, params.args.no);
    }
  });
})();
