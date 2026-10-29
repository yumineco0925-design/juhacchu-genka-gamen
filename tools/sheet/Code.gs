/*
 * 受発注と原価の管理（スプレッドシート版）
 *
 * 前提のシート: 設定、工事、予算改定、発注、発注検収、請求、労務費、履歴。
 * 各シートの1行目が見出し。列は見出しの名前で探すので、列の順を入れ替えても動く。
 * 予算超過と点検結果のシートは、メニューの操作で作り直す。
 */

// シート名、列名、値

const SHEET = Object.freeze({
  SETTINGS: '設定',
  KOUJI: '工事',
  KAITEI: '予算改定',
  HACCHU: '発注',
  KENSHU: '発注検収',
  SEIKYU: '請求',
  ROUMU: '労務費',
  RIREKI: '履歴',
  OVER_BUDGET: '予算超過',
  CHECK_RESULT: '点検結果',
});

const COST_ITEMS = Object.freeze(['材料費', '外注費', '労務費', '経費']);
const LABOR_ITEM = '労務費';

/** 発注に使う費目。労務費は労務費シートで計上する。 */
const ORDER_ITEMS = Object.freeze(COST_ITEMS.filter((item) => item !== LABOR_ITEM));

/** 工事シートの、費目ごとの当初の実行予算の列。 */
const BUDGET_COLUMN = Object.freeze({
  '材料費': '実行予算（当初）材料費',
  '外注費': '実行予算（当初）外注費',
  '労務費': '実行予算（当初）労務費',
  '経費': '実行予算（当初）経費',
});

const COL = Object.freeze({
  SETTINGS: Object.freeze({
    KEY: '項目',
    VALUE: '値',
    CLOSED_MONTH: '締め済の月',
    CLOSE_KIND: '締めの種類',
  }),
  KOUJI: Object.freeze({
    NO: '工事番号',
    NAME: '工事名',
    START: '着工日',
    OWNER_ACCEPT: '施主検収日',
  }),
  KAITEI: Object.freeze({
    KOUJI: '工事番号',
    ITEM: '費目',
    BEFORE: '改定前の額',
    AFTER: '改定後の額',
    STATUS: '状態',
  }),
  HACCHU: Object.freeze({
    NO: '発注番号',
    KOUJI: '工事番号',
    RELATED: '関連発注番号',
    ITEM: '費目',
    AMOUNT: '発注金額',
    DUE: '納期',
    STATUS: '状態',
    ORDER_DATE: '発注日',
  }),
  KENSHU: Object.freeze({
    HACCHU: '発注番号',
    DATE: '検収日',
    AMOUNT: '検収額',
    STATUS: '状態',
  }),
  SEIKYU: Object.freeze({
    NO: '受付番号',
    HACCHU: '発注番号',
    INVOICE_DATE: '請求書の日付',
    AMOUNT: '請求額',
    STATUS: '状態',
    BOOK_MONTH: '計上月',
  }),
  ROUMU: Object.freeze({
    KOUJI: '工事',
    MONTH: '月',
    HOURS: '時間',
    RATE: '単価',
    AMOUNT: '金額',
    BOOK_DATE: '計上日',
  }),
  RIREKI: Object.freeze({
    AT: '日時',
    OPERATOR: '操作者',
    ROLE: '役割',
    TARGET: '対象の番号',
    ACTION: '操作の種類',
    BEFORE: '変更前',
    AFTER: '変更後',
    REASON: '理由',
    RELATED: '関連する番号',
  }),
  OVER_BUDGET: Object.freeze({
    KOUJI: '工事番号',
    NAME: '工事名',
    ITEM: '費目',
    BUDGET: '予算',
    COMMITTED: '発注済',
    OVER: '超過額',
    CAUSE: '原因の発注番号',
  }),
  CHECK_RESULT: Object.freeze({
    KIND: '点検の種類',
    VERDICT: '結果',
    TARGET: '対象の番号',
    DETAIL: '内容',
  }),
});

/**
 * setupSheets が作るシートと見出し。
 * スクリプトが読む列は COL の名前で、読まない列は見出しの文字で並べる。
 */
const SHEET_HEADERS = Object.freeze({
  [SHEET.SETTINGS]: [COL.SETTINGS.KEY, COL.SETTINGS.VALUE, '', COL.SETTINGS.CLOSED_MONTH, COL.SETTINGS.CLOSE_KIND],
  [SHEET.KOUJI]: [
    COL.KOUJI.NO, COL.KOUJI.NAME, '施主', '工事場所', '工事種別', '状態', '営業担当', '工事担当',
    '見積金額', '受注金額', ...COST_ITEMS.map((item) => BUDGET_COLUMN[item]),
    '受注日', '着工予定日', '完工予定日', COL.KOUJI.START, COL.KOUJI.OWNER_ACCEPT,
    '施主請求日', '請求額', '入金日', '備考',
  ],
  [SHEET.KAITEI]: [
    '改定番号', COL.KAITEI.KOUJI, COL.KAITEI.ITEM, COL.KAITEI.BEFORE, COL.KAITEI.AFTER, '理由',
    '起案者', '起案日', COL.KAITEI.STATUS, '承認者', '改定日', '取消の理由',
  ],
  [SHEET.HACCHU]: [
    COL.HACCHU.NO, COL.HACCHU.KOUJI, COL.HACCHU.RELATED, '取引先', COL.HACCHU.ITEM, '件名',
    COL.HACCHU.AMOUNT, COL.HACCHU.DUE, COL.HACCHU.STATUS, '予算超過の理由', '起票者', '起票日',
    '承認者', COL.HACCHU.ORDER_DATE, '取消・打切の理由', '備考',
  ],
  [SHEET.KENSHU]: [
    '検収番号', COL.KENSHU.HACCHU, COL.KENSHU.DATE, COL.KENSHU.AMOUNT, '内容', COL.KENSHU.STATUS,
    '訂正元の検収番号', '取消の理由', '登録者', '備考',
  ],
  [SHEET.SEIKYU]: [
    COL.SEIKYU.NO, COL.SEIKYU.HACCHU, '取引先', '請求書番号', COL.SEIKYU.INVOICE_DATE, COL.SEIKYU.AMOUNT,
    '受付日', COL.SEIKYU.STATUS, '関連する受付番号', '確認者', '確認日', COL.SEIKYU.BOOK_MONTH,
    '差戻し・取消の理由', '備考',
  ],
  [SHEET.ROUMU]: [
    COL.ROUMU.KOUJI, COL.ROUMU.MONTH, COL.ROUMU.HOURS, COL.ROUMU.RATE, COL.ROUMU.AMOUNT, '計上者',
    COL.ROUMU.BOOK_DATE,
  ],
  [SHEET.RIREKI]: Object.values(COL.RIREKI),
});

const OVER_BUDGET_HEADER = Object.freeze(Object.values(COL.OVER_BUDGET));
const CHECK_HEADER = Object.freeze(Object.values(COL.CHECK_RESULT));

/** 2026-08 の形の月を入れる列。日付に変わらないように書式を文字にする。 */
const MONTH_TEXT_COLUMNS = Object.freeze({
  [SHEET.SETTINGS]: [COL.SETTINGS.CLOSED_MONTH],
  [SHEET.SEIKYU]: [COL.SEIKYU.BOOK_MONTH],
  [SHEET.ROUMU]: [COL.ROUMU.MONTH],
});

const SETTING_KEY = Object.freeze({
  BASE_DATE: '基準日',
  LABOR_RATE: '標準の時間単価',
  OPERATOR: '操作者',
  ROLE: '役割',
});

/** 設定シートの項目と初期値。setupSheets が足りない項目を足す。 */
const SETTING_ITEMS = Object.freeze([
  [SETTING_KEY.BASE_DATE, ''],
  [SETTING_KEY.LABOR_RATE, ''],
  [SETTING_KEY.OPERATOR, ''],
  [SETTING_KEY.ROLE, '経理'],
]);

const ORDER_STATUS = Object.freeze({
  DRAFT: '起票',
  APPROVED: '承認済',
  ACCEPTED: '検収済',
  CUT_OFF: '打切',
  CANCELED: '取消',
});
const ORDER_KIND = Object.freeze({ NORMAL: '通常', ADDITION: '追加', REDUCTION: '減額' });
const ACCEPTANCE_VALID = '有効';
const REVISION_APPROVED = '承認済';
const INVOICE_STATUS = Object.freeze({ RECEIVED: '受付', CONFIRMED: '確認済' });
const CLOSE_KIND = Object.freeze({ NORMAL: '通常', CARRIED: '繰越' });
const HISTORY_ACTION = Object.freeze({ CLOSE: '締め', REOPEN: '締め解除' });

const MENU_TITLE = '原価管理';
const MENU = Object.freeze({
  OVER_BUDGET: '予算超過の一覧を作る',
  CLOSE: '月を締める',
  REOPEN: '締めを解除する',
  CHECK: 'データの整合を点検する',
});
const GUARD_TITLE = '締めの確認';

const CHECK_KIND = Object.freeze({
  ACCEPTANCE: '発注検収の累計と有効発注額',
  INVOICE: '確認済の請求と発注検収',
  ORDER_DATE: '起票中の発注と発注日',
  ORDER_ITEM: '発注の費目',
});
const CHECK_VERDICT = Object.freeze({ OK: '問題なし', NG: '問題あり' });

const FORMAT = Object.freeze({ TEXT: '@', AMOUNT: '#,##0', DATETIME: 'yyyy-mm-dd hh:mm' });

const TOAST_SECONDS = 6;
/** 締めの確認の知らせは、読み終えられるように長めに出す。 */
const GUARD_TOAST_SECONDS = 10;
/** 締めと解除で、ほかの操作が終わるのを待つ長さ（ミリ秒）。 */
const LOCK_WAIT_MS = 10000;
const REASON_MAX_LENGTH = 200;
/** 労務費の時間は0.5時間単位にそろえる。 */
const LABOR_STEPS_PER_HOUR = 2;

/**
 * 締め済の月に入る編集を止めるシートと列。
 * dateColumns はその行の月を決める列。lockedColumns は締め済の月の行で直させない列。
 */
const CLOSE_GUARDS = Object.freeze([
  {
    sheet: SHEET.HACCHU,
    dateColumns: [COL.HACCHU.ORDER_DATE],
    lockedColumns: [COL.HACCHU.KOUJI, COL.HACCHU.RELATED, COL.HACCHU.ITEM, COL.HACCHU.AMOUNT],
  },
  {
    sheet: SHEET.KENSHU,
    dateColumns: [COL.KENSHU.DATE],
    lockedColumns: [COL.KENSHU.HACCHU, COL.KENSHU.AMOUNT, COL.KENSHU.STATUS],
  },
  {
    sheet: SHEET.SEIKYU,
    dateColumns: [COL.SEIKYU.BOOK_MONTH],
    lockedColumns: [COL.SEIKYU.HACCHU, COL.SEIKYU.AMOUNT, COL.SEIKYU.STATUS],
  },
  {
    sheet: SHEET.ROUMU,
    dateColumns: [COL.ROUMU.MONTH, COL.ROUMU.BOOK_DATE],
    lockedColumns: [COL.ROUMU.KOUJI, COL.ROUMU.HOURS, COL.ROUMU.RATE, COL.ROUMU.AMOUNT],
  },
]);

// メニュー

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(MENU_TITLE)
    .addItem(MENU.OVER_BUDGET, 'makeOverBudgetList')
    .addItem(MENU.CLOSE, 'closeMonth')
    .addItem(MENU.REOPEN, 'reopenMonth')
    .addItem(MENU.CHECK, 'checkConsistency')
    .addToUi();
}

// 締め済の月に入る編集を止める（単純トリガー）

function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  const guard = CLOSE_GUARDS.find((g) => g.sheet === sheet.getName());
  if (!guard) return;
  try {
    guardClosedMonths_(e, sheet, guard);
  } catch (err) {
    e.source.toast(errorText_(err), GUARD_TITLE, GUARD_TOAST_SECONDS);
  }
}

function guardClosedMonths_(e, sheet, guard) {
  if (e.range.getLastRow() < 2) return;
  const map = headerMap_(sheet);
  const dateColumns = guard.dateColumns.map((name) => columnOf_(map, sheet.getName(), name));
  const lockedColumns = guard.lockedColumns.map((name) => map[name]).filter(Boolean);
  if (!touchesColumns_(e.range, dateColumns.concat(lockedColumns))) return;
  const closed = closedMonthState_();
  if (closed.isEmpty) return;
  const target = { sheet, dateColumns, lockedColumns, closed };
  if (isSingleCell_(e.range)) {
    guardSingleCell_(e, target);
  } else {
    guardManyCells_(e, target);
  }
}

function touchesColumns_(range, columns) {
  const first = range.getColumn();
  const last = range.getLastColumn();
  return columns.some((c) => c >= first && c <= last);
}

function isSingleCell_(range) {
  return range.getNumRows() === 1 && range.getNumColumns() === 1;
}

/** 1セルの編集は、止める理由があれば元の値に戻して知らせる。 */
function guardSingleCell_(e, target) {
  const range = e.range;
  const reason = reasonToStop_(e, target);
  if (!reason) {
    clearGuardNote_(range);
    return;
  }
  const message = reason + (text_(e.oldValue) === ''
    ? '空にしました。元の値があったときは、編集の取り消し（Ctrl+Z）で戻してください。'
    : '元の値に戻しました。');
  restoreOldValue_(range, e.oldValue);
  range.setNote(guardNote_(message));
  e.source.toast(message, GUARD_TITLE, GUARD_TOAST_SECONDS);
}

/** 止める理由を返す。止めないときは空の文字。 */
function reasonToStop_(e, target) {
  const column = e.range.getColumn();
  const isDate = target.dateColumns.indexOf(column) !== -1;
  const isLocked = target.lockedColumns.indexOf(column) !== -1;
  if (!isDate && !isLocked) return '';
  if (isDate) {
    const newMonth = toMonthKey_(e.range.getValue());
    if (target.closed.has(newMonth)) return closedDateReason_(newMonth, target.closed);
    const oldMonth = toMonthKey_(e.oldValue);
    if (target.closed.has(oldMonth)) return `この行は ${oldMonth}（締め済の月）の記録のため、日付を動かせません。`;
  }
  const otherDateColumns = target.dateColumns.filter((c) => c !== column);
  const rowMonth = closedMonthOfRow_(target, e.range.getRow(), otherDateColumns);
  return rowMonth ? `この行は ${rowMonth}（締め済の月）の記録のため、直せません。` : '';
}

/** 締め済の月の日付を入れたときの文。 */
function closedDateReason_(month, closed) {
  return `${month} は締め済のため入れられません。${closed.firstOpen} 以後の日付にします。`;
}

function closedMonthOfRow_(target, row, columns) {
  for (let i = 0; i < columns.length; i++) {
    const month = toMonthKey_(target.sheet.getRange(row, columns[i]).getValue());
    if (target.closed.has(month)) return month;
  }
  return '';
}

/** 複数セルの編集は元の値が届かないため、該当のセルに注記を付けて知らせる。 */
function guardManyCells_(e, target) {
  const cells = closedCellsInRange_(e.range, target);
  if (cells.length === 0) return;
  cells.forEach((cell) => {
    cell.range.setNote(guardNote_(
      `この行は ${cell.month}（締め済の月）の記録です。まとめて変えたため元の値に戻せませんでした。編集の取り消しで戻してください。`
    ));
  });
  e.source.toast(
    `締め済の月の行に入る編集が ${cells.length} セルあります。注記の付いたセルを、編集の取り消し（Ctrl+Z）で戻してください。`,
    GUARD_TITLE,
    GUARD_TOAST_SECONDS
  );
}

function closedCellsInRange_(range, target) {
  const top = Math.max(range.getRow(), 2);
  const rowCount = range.getLastRow() - top + 1;
  if (rowCount < 1) return [];
  const columns = target.dateColumns.concat(target.lockedColumns)
    .filter((c) => c >= range.getColumn() && c <= range.getLastColumn());
  const monthsByColumn = target.dateColumns.map((c) => target.sheet.getRange(top, c, rowCount, 1).getValues());
  const cells = [];
  for (let i = 0; i < rowCount; i++) {
    const month = monthsByColumn.map((values) => toMonthKey_(values[i][0])).find((m) => target.closed.has(m));
    if (!month) continue;
    columns.forEach((c) => cells.push({ range: target.sheet.getRange(top + i, c), month }));
  }
  return cells;
}

/** 元の値に戻す。数字は数値として戻す（日付はシリアル値で届く）。文字の書式のセルは文字のまま戻す。 */
function restoreOldValue_(range, oldValue) {
  if (text_(oldValue) === '') {
    range.clearContent();
    return;
  }
  const text = String(oldValue);
  const asText = range.getNumberFormat() === FORMAT.TEXT;
  range.setValue(!asText && /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : text);
}

function guardNote_(message) {
  return `${GUARD_TITLE}（${nowText_()}）\n${message}`;
}

function clearGuardNote_(range) {
  if (range.getNote().indexOf(GUARD_TITLE + '（') === 0) range.clearNote();
}

// 予算超過の一覧

function makeOverBudgetList() {
  runWithAlert_(MENU.OVER_BUDGET, () => {
    const settings = readSettings_();
    const rows = buildOverBudgetRows_(settings);
    const c = COL.OVER_BUDGET;
    writeOutputSheet_(SHEET.OVER_BUDGET, OVER_BUDGET_HEADER, rows, [c.BUDGET, c.COMMITTED, c.OVER],
      `作成 ${nowText_()}。作成した時点の集計です。元のシートを直したら作り直してください。`);
    toast_(rows.length > 0 ? `予算超過 ${rows.length} 行を書き出しました。` : '予算超過はありません。');
  });
}

function buildOverBudgetRows_(settings) {
  const c = COL.OVER_BUDGET;
  const projects = readProjects_();
  const rows = [];
  Object.values(sumCommitted_(settings.laborRate)).sort(compareGroups_).forEach((group) => {
    const project = projects[group.kouji];
    const budget = project ? (project.budget[group.item] || 0) : 0;
    if (group.total <= budget) return;
    rows.push(rowOf_(OVER_BUDGET_HEADER, {
      [c.KOUJI]: group.kouji,
      [c.NAME]: project ? project.name : '（工事シートに無い番号）',
      [c.ITEM]: group.item,
      [c.BUDGET]: budget,
      [c.COMMITTED]: group.total,
      [c.OVER]: group.total - budget,
      [c.CAUSE]: causeText_(group.parts, budget),
    }));
  });
  return rows;
}

/**
 * 工事と費目ごとの発注済。
 * 承認済と検収済は有効発注額、打切は発注検収の累計を足す。労務費は労務費シートの計上した額だけを足す。
 * 起票、取消、減額発注そのもの、費目が労務費の発注は足さない。
 */
function sumCommitted_(laborRate) {
  const orders = readOrders_();
  const index = indexOrders_(orders);
  const acceptance = sumAcceptance_();
  const groups = {};
  orders.forEach((order) => {
    const amount = committedAmount_(order, index, acceptance);
    if (amount === null) return;
    addToGroup_(groups, order.kouji, order.item, { no: order.no, date: order.orderDate, amount });
  });
  readBookedLabor_(laborRate).forEach((labor) => {
    const date = labor.month ? monthEndKey_(labor.month) : '';
    addToGroup_(groups, labor.kouji, LABOR_ITEM, { no: '', date, amount: labor.amount });
  });
  return groups;
}

function committedAmount_(order, index, acceptance) {
  if (order.kind === ORDER_KIND.REDUCTION || order.item === LABOR_ITEM) return null;
  if (order.status === ORDER_STATUS.APPROVED || order.status === ORDER_STATUS.ACCEPTED) {
    return effectiveAmount_(order, index);
  }
  if (order.status === ORDER_STATUS.CUT_OFF) return acceptance.total[order.no] || 0;
  return null;
}

function addToGroup_(groups, kouji, item, part) {
  const key = groupKey_(kouji, item);
  if (!groups[key]) groups[key] = { kouji, item, total: 0, parts: [] };
  groups[key].total += part.amount;
  groups[key].parts.push(part);
}

/**
 * 発注日の順（労務費は計上した月の末日）に足して、予算を超えた時点からの発注を原因として並べる。
 * 労務費の計上が含まれるときは「労務費の計上」と書く。
 */
function causeText_(parts, budget) {
  const sorted = parts.slice().sort((a, b) => compareText_(a.date + a.no, b.date + b.no));
  let running = 0;
  let from = sorted.length;
  for (let i = 0; i < sorted.length; i++) {
    running += sorted[i].amount;
    if (running > budget) {
      from = i;
      break;
    }
  }
  const causes = sorted.slice(from);
  const labels = causes.filter((p) => p.no && p.amount > 0).map((p) => p.no);
  if (causes.some((p) => !p.no)) labels.push('労務費の計上');
  return labels.join('、');
}

function compareGroups_(a, b) {
  return compareText_(a.kouji, b.kouji) || (itemOrder_(a.item) - itemOrder_(b.item));
}

function itemOrder_(item) {
  const i = COST_ITEMS.indexOf(item);
  return i === -1 ? COST_ITEMS.length : i;
}

// 月を締める

function closeMonth() {
  runWithAlert_(MENU.CLOSE, () => {
    const settings = readSettings_();
    const month = nextMonthToClose_(settings.closed);
    const blockers = findCloseBlockers_(month, settings.baseDate);
    if (blockers.length > 0) {
      alert_(MENU.CLOSE, `${month} はまだ締められません。\n\n${blockers.join('\n\n')}`);
      return;
    }
    if (!confirm_(MENU.CLOSE, closeConfirmText_(month))) {
      toast_('締めませんでした。');
      return;
    }
    const times = withDocumentLock_(() => recordClose_(month));
    alert_(MENU.CLOSE, `${month} を締めました（第${times}回）。履歴に残しました。`);
  });
}

/** 締めるのは、最後に締めた月の次の月だけ。 */
function nextMonthToClose_(closed) {
  if (closed.length === 0) {
    throw new Error('設定シートの「締め済の月」が空です。期首の前の月（例 2026-03）を、締めの種類「繰越」として入れてください。');
  }
  return nextMonthKey_(closed[closed.length - 1].month);
}

function findCloseBlockers_(month, baseDate) {
  const blockers = [];
  const monthEnd = monthEndKey_(month);
  if (!(monthEnd < baseDate)) {
    blockers.push(`末日（${monthEnd}）が基準日（${baseDate}）より前ではありません。月が終わってから締めます。`);
  }
  const invoices = findPendingInvoices_(month);
  if (invoices.length > 0) {
    blockers.push(`受付のままの請求があります（請求書の日付が ${month} 以前の物）。確認するか、差し戻すか、取り消してください。\n受付番号: ${invoices.join('、')}`);
  }
  const projects = findUnbookedLabor_(month);
  if (projects.length > 0) {
    blockers.push(`${month} に施工中だった工事で、労務費が計上されていない物があります。労務費のシートで計上日を入れてください。\n工事番号: ${projects.join('、')}`);
  }
  return blockers;
}

/** 請求書の日付がその月以前で、受付のままの請求の受付番号。日付が空の物も含める。 */
function findPendingInvoices_(month) {
  const c = COL.SEIKYU;
  return readRecords_(SHEET.SEIKYU, [c.NO, c.INVOICE_DATE, c.STATUS])
    .filter((r) => text_(r[c.STATUS]) === INVOICE_STATUS.RECEIVED)
    .filter((r) => {
      const invoiceMonth = toMonthKey_(r[c.INVOICE_DATE]);
      return invoiceMonth === '' || invoiceMonth <= month;
    })
    .map((r) => labelOf_(r[c.NO], r));
}

/** その月に施工中だった工事のうち、その月の労務費に計上日が無い物の工事番号。 */
function findUnbookedLabor_(month) {
  const k = COL.KOUJI;
  const booked = bookedLaborProjects_(month);
  return readRecords_(SHEET.KOUJI, [k.NO, k.START, k.OWNER_ACCEPT])
    .filter((r) => wasUnderConstruction_(r, month))
    .map((r) => text_(r[k.NO]))
    .filter((no) => !booked.has(no));
}

function bookedLaborProjects_(month) {
  const c = COL.ROUMU;
  const rows = readRecords_(SHEET.ROUMU, [c.KOUJI, c.MONTH, c.BOOK_DATE])
    .filter((r) => toMonthKey_(r[c.MONTH]) === month && toDateKey_(r[c.BOOK_DATE]) !== '');
  return new Set(rows.map((r) => text_(r[c.KOUJI])));
}

/** 着工日がその月の末日以前で、施主検収日が無いかその月の初日以後。 */
function wasUnderConstruction_(project, month) {
  const start = toMonthKey_(project[COL.KOUJI.START]);
  if (start === '' || start > month) return false;
  const accepted = toMonthKey_(project[COL.KOUJI.OWNER_ACCEPT]);
  return accepted === '' || accepted >= month;
}

function closeConfirmText_(month) {
  const lines = [`${month} を締めます。締めた後は、発注日、検収日、請求の計上月、労務費の月と計上日に ${month} の日付を入れられず、${month} の行の金額も直せません。`];
  const warnings = findCloseWarnings_(month);
  if (warnings.length > 0) lines.push(`締めは止めませんが、次の物があります。\n\n${warnings.join('\n\n')}`);
  lines.push('締めますか。');
  return lines.join('\n\n');
}

/** 納期がその月の末日以前で未検収残のある承認済の発注と、起票のままの発注。締めは止めない。 */
function findCloseWarnings_(month) {
  const monthEnd = monthEndKey_(month);
  const orders = readOrders_();
  const index = indexOrders_(orders);
  const acceptance = sumAcceptance_();
  const late = orders.filter((o) => o.amount > 0 && o.status === ORDER_STATUS.APPROVED
    && o.due !== '' && o.due <= monthEnd
    && effectiveAmount_(o, index) - (acceptance.total[o.no] || 0) > 0);
  const drafts = orders.filter((o) => o.status === ORDER_STATUS.DRAFT).length;
  const warnings = [];
  if (late.length > 0) {
    warnings.push(`納期が ${monthEnd} 以前で、未検収残のある発注があります。\n発注番号: ${late.map((o) => o.label).join('、')}`);
  }
  if (drafts > 0) warnings.push(`起票のままの発注が ${drafts} 件あります（発注日が無いため締めの対象外）。`);
  return warnings;
}

function recordClose_(month) {
  const closed = readClosedMonths_();
  if (nextMonthToClose_(closed) !== month) {
    throw new Error('締めの一覧が途中で変わりました。もう一度やり直してください。');
  }
  const times = countCloses_(month) + 1;
  appendHistory_({
    target: month,
    action: HISTORY_ACTION.CLOSE,
    before: '状態: 未締め',
    after: `状態: 締め済、回数: 第${times}回`,
  });
  writeClosedMonths_(closed.concat([{ month, kind: CLOSE_KIND.NORMAL }]));
  return times;
}

function countCloses_(month) {
  const c = COL.RIREKI;
  return readRecords_(SHEET.RIREKI, [c.TARGET, c.ACTION])
    .filter((r) => toMonthKey_(r[c.TARGET]) === month && text_(r[c.ACTION]) === HISTORY_ACTION.CLOSE)
    .length;
}

// 締めを解除する

function reopenMonth() {
  runWithAlert_(MENU.REOPEN, () => {
    const latest = latestClosed_(readClosedMonths_());
    const reason = askReason_(MENU.REOPEN,
      `解除できるのは直近の締め済の月だけです。${latest.month} の締めを解除します。理由を入れてください（必須、${REASON_MAX_LENGTH}字まで）。`);
    if (reason === null) return;
    withDocumentLock_(() => recordReopen_(latest.month, reason));
    alert_(MENU.REOPEN,
      `${latest.month} の締めを解除しました。直した後、もう一度「${MENU.CLOSE}」で締めてください。締めた回数は履歴に残ります。`);
  });
}

function latestClosed_(closed) {
  if (closed.length === 0) throw new Error('締め済の月がありません。');
  const latest = closed[closed.length - 1];
  if (latest.kind === CLOSE_KIND.CARRIED) {
    throw new Error(`${latest.month} は期首の繰越の月のため、解除できません。`);
  }
  return latest;
}

/** 理由を聞く。取りやめたとき、空のとき、字数を超えたときは null。 */
function askReason_(title, message) {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(title, message, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) {
    toast_('取りやめました。');
    return null;
  }
  const reason = text_(response.getResponseText());
  if (reason === '') {
    alert_(title, '理由が空のため、取りやめました。理由は必須です。');
    return null;
  }
  if (reason.length > REASON_MAX_LENGTH) {
    alert_(title, `理由が ${REASON_MAX_LENGTH} 字を超えているため、取りやめました。`);
    return null;
  }
  return reason;
}

function recordReopen_(month, reason) {
  const closed = readClosedMonths_();
  if (latestClosed_(closed).month !== month) {
    throw new Error('締めの一覧が途中で変わりました。もう一度やり直してください。');
  }
  appendHistory_({
    target: month,
    action: HISTORY_ACTION.REOPEN,
    before: '状態: 締め済',
    after: '状態: 未締め',
    reason,
  });
  writeClosedMonths_(closed.slice(0, -1));
}

// データの整合を点検する

function checkConsistency() {
  runWithAlert_(MENU.CHECK, () => {
    const orders = readOrders_();
    const index = indexOrders_(orders);
    const acceptance = sumAcceptance_();
    const results = [
      { kind: CHECK_KIND.ACCEPTANCE, findings: checkAcceptanceTotals_(orders, index, acceptance) },
      { kind: CHECK_KIND.INVOICE, findings: checkConfirmedInvoices_(index, acceptance) },
      { kind: CHECK_KIND.ORDER_DATE, findings: checkOrderDates_(orders) },
      { kind: CHECK_KIND.ORDER_ITEM, findings: checkOrderItems_(orders) },
    ];
    writeOutputSheet_(SHEET.CHECK_RESULT, CHECK_HEADER, checkRows_(results), [],
      `点検 ${nowText_()}。点検した時点の結果です。直したら点検し直してください。`);
    alert_(MENU.CHECK, checkSummary_(results));
  });
}

/** 発注検収の累計が有効発注額（取消の発注は0）を超えていないか。 */
function checkAcceptanceTotals_(orders, index, acceptance) {
  const findings = [];
  orders.filter((o) => o.kind !== ORDER_KIND.REDUCTION).forEach((order) => {
    const total = acceptance.total[order.no] || 0;
    const canceled = order.status === ORDER_STATUS.CANCELED;
    const limit = canceled ? 0 : effectiveAmount_(order, index);
    if (total <= limit) return;
    const detail = canceled
      ? `取消の発注に、発注検収の累計 ${yen_(total)}が残っています。`
      : `発注検収の累計 ${yen_(total)}が、有効発注額 ${yen_(limit)}を超えています。`;
    findings.push({ target: order.label, detail });
  });
  Object.keys(acceptance.total).forEach((no) => {
    const order = index.byNo[no];
    if (!order) {
      findings.push({ target: no || '（空）', detail: '発注検収の発注番号が発注シートにありません。' });
    } else if (order.kind === ORDER_KIND.REDUCTION) {
      findings.push({ target: order.label, detail: '減額発注に発注検収が付いています。発注検収は元の発注に付けます。' });
    }
  });
  return findings;
}

/** 確認済の請求の発注に有効な発注検収があり、確認済の額の合計が検収の累計以下か。 */
function checkConfirmedInvoices_(index, acceptance) {
  const c = COL.SEIKYU;
  const findings = [];
  const sums = {};
  readRecords_(SHEET.SEIKYU, [c.NO, c.HACCHU, c.AMOUNT, c.STATUS])
    .filter((r) => text_(r[c.STATUS]) === INVOICE_STATUS.CONFIRMED)
    .forEach((r) => {
      const no = labelOf_(r[c.NO], r);
      const orderNo = text_(r[c.HACCHU]);
      if (!index.byNo[orderNo]) {
        findings.push({ target: no, detail: `発注番号 ${orderNo || '（空）'} が発注シートにありません。` });
      } else if (!acceptance.count[orderNo]) {
        findings.push({ target: no, detail: `発注 ${orderNo} に有効な発注検収が無いのに、確認済になっています。` });
      } else {
        if (!sums[orderNo]) sums[orderNo] = { total: 0, invoices: [] };
        sums[orderNo].total += toNumber_(r[c.AMOUNT]);
        sums[orderNo].invoices.push(no);
      }
    });
  Object.keys(sums).forEach((orderNo) => {
    const accepted = acceptance.total[orderNo] || 0;
    if (sums[orderNo].total <= accepted) return;
    findings.push({
      target: sums[orderNo].invoices.join('、'),
      detail: `発注 ${orderNo} の確認済の請求額の合計 ${yen_(sums[orderNo].total)}が、発注検収の累計 ${yen_(accepted)}を超えています。`,
    });
  });
  return findings;
}

/** 起票の発注に発注日が入っていないか。承認済、検収済、打切の発注に発注日があるか。 */
function checkOrderDates_(orders) {
  const approvedOrLater = [ORDER_STATUS.APPROVED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.CUT_OFF];
  const findings = [];
  orders.forEach((order) => {
    if (order.status === ORDER_STATUS.DRAFT && order.orderDate !== '') {
      findings.push({ target: order.label, detail: `起票のままなのに発注日（${order.orderDate}）が入っています。発注日は承認した日に入ります。` });
    }
    if (approvedOrLater.indexOf(order.status) !== -1 && order.orderDate === '') {
      findings.push({ target: order.label, detail: `${order.status}なのに発注日が空です。` });
    }
  });
  return findings;
}

/** 発注の費目が、発注に使う費目のどれかか。費目が労務費の発注は発注済に足さないため拾う。 */
function checkOrderItems_(orders) {
  return orders.filter((o) => ORDER_ITEMS.indexOf(o.item) === -1).map((order) => ({
    target: order.label,
    detail: order.item === LABOR_ITEM
      ? '費目が労務費の発注です。労務費は労務費シートで計上します。この発注は発注済に足していません。'
      : `費目「${order.item || '（空）'}」は、${ORDER_ITEMS.join('、')}のどれでもありません。`,
  }));
}

function checkRows_(results) {
  const c = COL.CHECK_RESULT;
  const rows = [];
  results.forEach((result) => {
    if (result.findings.length === 0) {
      rows.push(rowOf_(CHECK_HEADER, { [c.KIND]: result.kind, [c.VERDICT]: CHECK_VERDICT.OK }));
    }
    result.findings.forEach((f) => rows.push(rowOf_(CHECK_HEADER, {
      [c.KIND]: result.kind,
      [c.VERDICT]: CHECK_VERDICT.NG,
      [c.TARGET]: f.target,
      [c.DETAIL]: f.detail,
    })));
  });
  return rows;
}

function checkSummary_(results) {
  const lines = results.map((r) => {
    const count = r.findings.length;
    return `${r.kind}: ${count === 0 ? CHECK_VERDICT.OK : `${CHECK_VERDICT.NG} ${count} 件`}`;
  });
  return `点検しました。\n\n${lines.join('\n')}\n\n結果は「${SHEET.CHECK_RESULT}」シートにあります。`;
}

// 発注、発注検収、労務費、工事、予算改定の読み取り

function readOrders_() {
  const c = COL.HACCHU;
  const columns = [c.NO, c.KOUJI, c.RELATED, c.ITEM, c.AMOUNT, c.DUE, c.STATUS, c.ORDER_DATE];
  return readRecords_(SHEET.HACCHU, columns).map((r) => {
    const amount = toNumber_(r[c.AMOUNT]);
    const related = text_(r[c.RELATED]);
    return {
      no: text_(r[c.NO]),
      label: labelOf_(r[c.NO], r),
      kouji: text_(r[c.KOUJI]),
      related,
      item: text_(r[c.ITEM]),
      amount,
      due: toDateKey_(r[c.DUE]),
      status: orderStatus_(r[c.STATUS]),
      orderDate: toDateKey_(r[c.ORDER_DATE]),
      kind: orderKind_(related, amount),
    };
  });
}

/** 区分は金額の符号と関連発注番号で決める。負の額は減額、関連発注番号があれば追加、無ければ通常。 */
function orderKind_(related, amount) {
  if (amount < 0) return ORDER_KIND.REDUCTION;
  return related === '' ? ORDER_KIND.NORMAL : ORDER_KIND.ADDITION;
}

/** 「承認済（一部検収）」も承認済として扱う。 */
function orderStatus_(value) {
  const status = text_(value);
  return status.indexOf(ORDER_STATUS.APPROVED) === 0 ? ORDER_STATUS.APPROVED : status;
}

/** 発注番号で引ける表と、承認済の減額発注を元の発注ごとに足した額。 */
function indexOrders_(orders) {
  const byNo = {};
  const reduction = {};
  orders.forEach((o) => {
    if (o.no) byNo[o.no] = o;
  });
  orders.forEach((o) => {
    if (o.kind !== ORDER_KIND.REDUCTION || o.status !== ORDER_STATUS.APPROVED || o.related === '') return;
    reduction[o.related] = (reduction[o.related] || 0) + o.amount;
  });
  return { byNo, reduction };
}

/** 有効発注額 = 発注金額 + 承認済の減額発注の額（負）。 */
function effectiveAmount_(order, index) {
  return order.amount + (index.reduction[order.no] || 0);
}

/** 有効な発注検収の累計と件数を発注番号ごとに出す。状態が空の行は有効として数える。 */
function sumAcceptance_() {
  const c = COL.KENSHU;
  const total = {};
  const count = {};
  readRecords_(SHEET.KENSHU, [c.HACCHU, c.AMOUNT, c.STATUS]).forEach((r) => {
    const status = text_(r[c.STATUS]) || ACCEPTANCE_VALID;
    if (status !== ACCEPTANCE_VALID) return;
    const no = text_(r[c.HACCHU]);
    total[no] = (total[no] || 0) + toNumber_(r[c.AMOUNT]);
    count[no] = (count[no] || 0) + 1;
  });
  return { total, count };
}

/** 計上日が入った労務費の行。 */
function readBookedLabor_(standardRate) {
  const c = COL.ROUMU;
  return readRecords_(SHEET.ROUMU, [c.KOUJI, c.MONTH, c.HOURS, c.RATE, c.AMOUNT, c.BOOK_DATE])
    .filter((r) => toDateKey_(r[c.BOOK_DATE]) !== '')
    .map((r) => ({ kouji: text_(r[c.KOUJI]), month: toMonthKey_(r[c.MONTH]), amount: laborAmount_(r, standardRate) }));
}

/** 金額が空なら、時間を0.5時間単位にそろえて単価を掛け、円未満を切り捨てる。単価が空なら標準の時間単価を使う。 */
function laborAmount_(record, standardRate) {
  const c = COL.ROUMU;
  if (text_(record[c.AMOUNT]) !== '') return toNumber_(record[c.AMOUNT]);
  const rate = text_(record[c.RATE]) !== '' ? toNumber_(record[c.RATE]) : standardRate;
  const steps = Math.round(toNumber_(record[c.HOURS]) * LABOR_STEPS_PER_HOUR);
  return Math.floor(steps * rate / LABOR_STEPS_PER_HOUR);
}

/** 工事番号から、工事名と費目ごとの予算（当初 + 承認済の予算改定の差）を引ける表。 */
function readProjects_() {
  const c = COL.KOUJI;
  const budgetColumns = COST_ITEMS.map((item) => BUDGET_COLUMN[item]);
  const revised = sumApprovedRevisions_();
  const projects = {};
  readRecords_(SHEET.KOUJI, [c.NO, c.NAME].concat(budgetColumns)).forEach((r) => {
    const no = text_(r[c.NO]);
    const budget = {};
    COST_ITEMS.forEach((item) => {
      budget[item] = toNumber_(r[BUDGET_COLUMN[item]]) + (revised[groupKey_(no, item)] || 0);
    });
    projects[no] = { name: text_(r[c.NAME]), budget };
  });
  return projects;
}

/** 承認済の予算改定の差（改定後の額 - 改定前の額）を、工事と費目ごとに足した額。 */
function sumApprovedRevisions_() {
  const c = COL.KAITEI;
  const sums = {};
  readRecords_(SHEET.KAITEI, [c.KOUJI, c.ITEM, c.BEFORE, c.AFTER, c.STATUS])
    .filter((r) => text_(r[c.STATUS]) === REVISION_APPROVED)
    .forEach((r) => {
      const key = groupKey_(text_(r[c.KOUJI]), text_(r[c.ITEM]));
      sums[key] = (sums[key] || 0) + toNumber_(r[c.AFTER]) - toNumber_(r[c.BEFORE]);
    });
  return sums;
}

// 設定と締め済の月

function readSettings_() {
  const items = readSettingItems_();
  return {
    baseDate: toDateKey_(items[SETTING_KEY.BASE_DATE]) || toDateKey_(new Date()),
    laborRate: toNumber_(items[SETTING_KEY.LABOR_RATE]),
    operator: text_(items[SETTING_KEY.OPERATOR]),
    role: text_(items[SETTING_KEY.ROLE]),
    closed: readClosedMonths_(),
  };
}

/** 設定シートの項目と値を { 項目: 値 } で返す。 */
function readSettingItems_() {
  const sheet = getSheet_(SHEET.SETTINGS);
  const map = headerMap_(sheet);
  const keyIndex = columnOf_(map, SHEET.SETTINGS, COL.SETTINGS.KEY) - 1;
  const valueIndex = columnOf_(map, SHEET.SETTINGS, COL.SETTINGS.VALUE) - 1;
  const items = {};
  dataBelowHeader_(sheet).forEach((row) => {
    const key = text_(row[keyIndex]);
    if (key) items[key] = row[valueIndex];
  });
  return items;
}

/** [{ month: '2026-07', kind: '通常' }] を月の順で返す。同じ月は1つにまとめる。 */
function readClosedMonths_() {
  const sheet = getSheet_(SHEET.SETTINGS);
  const map = headerMap_(sheet);
  const monthIndex = columnOf_(map, SHEET.SETTINGS, COL.SETTINGS.CLOSED_MONTH) - 1;
  const kindIndex = columnOf_(map, SHEET.SETTINGS, COL.SETTINGS.CLOSE_KIND) - 1;
  const byMonth = {};
  dataBelowHeader_(sheet).forEach((row) => {
    const month = toMonthKey_(row[monthIndex]);
    if (month) byMonth[month] = text_(row[kindIndex]) || CLOSE_KIND.NORMAL;
  });
  return Object.keys(byMonth).sort().map((month) => ({ month, kind: byMonth[month] }));
}

/**
 * 締め済の月の判定。一覧の最初の月より前の月も締め済として扱う。
 * firstOpen は最後に締めた月の次の月。
 */
function closedMonthState_() {
  const list = readClosedMonths_();
  const months = new Set(list.map((x) => x.month));
  const first = list.length > 0 ? list[0].month : '';
  return {
    isEmpty: list.length === 0,
    has: (month) => month !== '' && (months.has(month) || month < first),
    firstOpen: list.length > 0 ? nextMonthKey_(list[list.length - 1].month) : '',
  };
}

function writeClosedMonths_(list) {
  const sheet = getSheet_(SHEET.SETTINGS);
  const map = headerMap_(sheet);
  const monthColumn = columnOf_(map, SHEET.SETTINGS, COL.SETTINGS.CLOSED_MONTH);
  const kindColumn = columnOf_(map, SHEET.SETTINGS, COL.SETTINGS.CLOSE_KIND);
  const lastRow = Math.max(sheet.getLastRow(), list.length + 1);
  if (lastRow >= 2) {
    sheet.getRange(2, monthColumn, lastRow - 1, 1).clearContent();
    sheet.getRange(2, kindColumn, lastRow - 1, 1).clearContent();
  }
  if (list.length === 0) return;
  const monthRange = sheet.getRange(2, monthColumn, list.length, 1);
  monthRange.setNumberFormat(FORMAT.TEXT);
  monthRange.setValues(list.map((x) => [x.month]));
  sheet.getRange(2, kindColumn, list.length, 1).setValues(list.map((x) => [x.kind]));
}

// 履歴

/** 履歴に1行足す。操作者と役割は設定シートの値をそのまま書く（空なら空）。 */
function appendHistory_(entry) {
  const settings = readSettings_();
  const sheet = getSheet_(SHEET.RIREKI);
  const map = headerMap_(sheet);
  const c = COL.RIREKI;
  const row = new Array(sheet.getLastColumn()).fill('');
  const put = (name, value) => {
    row[columnOf_(map, SHEET.RIREKI, name) - 1] = value;
  };
  put(c.AT, new Date());
  put(c.OPERATOR, settings.operator);
  put(c.ROLE, settings.role);
  put(c.TARGET, entry.target);
  put(c.ACTION, entry.action);
  put(c.BEFORE, entry.before || '');
  put(c.AFTER, entry.after || '');
  put(c.REASON, entry.reason || '');
  put(c.RELATED, entry.related || '');
  const rowNumber = sheet.getLastRow() + 1;
  sheet.getRange(rowNumber, columnOf_(map, SHEET.RIREKI, c.TARGET)).setNumberFormat(FORMAT.TEXT);
  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  sheet.getRange(rowNumber, columnOf_(map, SHEET.RIREKI, c.AT)).setNumberFormat(FORMAT.DATETIME);
}

// シートの準備（スクリプトエディタから1回実行する）

/** 足りないシートを見出しつきで作り、設定シートに足りない項目を足す。既にある値は変えない。 */
function setupSheets() {
  const ss = SpreadsheetApp.getActive();
  const made = Object.keys(SHEET_HEADERS).filter((name) => !ss.getSheetByName(name));
  made.forEach((name) => createSheetWithHeader_(ss, name));
  const added = fillSettingKeys_();
  const parts = [];
  if (made.length > 0) parts.push(`シートを作りました: ${made.join('、')}。`);
  if (added.length > 0) parts.push(`設定シートに項目を足しました: ${added.join('、')}。`);
  const message = parts.length > 0 ? parts.join('') : '足りないシートと設定の項目はありませんでした。';
  console.log(message);
  toast_(message);
}

function createSheetWithHeader_(ss, name) {
  const sheet = ss.insertSheet(name);
  const header = SHEET_HEADERS[name];
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  sheet.setFrozenRows(1);
  (MONTH_TEXT_COLUMNS[name] || []).forEach((columnName) => {
    const column = header.indexOf(columnName) + 1;
    sheet.getRange(2, column, sheet.getMaxRows() - 1, 1).setNumberFormat(FORMAT.TEXT);
  });
}

/** 設定シートに無い項目を、初期値と一緒に項目の列の最後の行の下へ足す。足した項目名を返す。 */
function fillSettingKeys_() {
  const sheet = getSheet_(SHEET.SETTINGS);
  const map = headerMap_(sheet);
  const keyColumn = columnOf_(map, SHEET.SETTINGS, COL.SETTINGS.KEY);
  const valueColumn = columnOf_(map, SHEET.SETTINGS, COL.SETTINGS.VALUE);
  const keys = dataBelowHeader_(sheet).map((row) => text_(row[keyColumn - 1]));
  const missing = SETTING_ITEMS.filter(([key]) => keys.indexOf(key) === -1);
  if (missing.length === 0) return [];
  let lastKeyRow = 1;
  keys.forEach((key, i) => {
    if (key) lastKeyRow = i + 2;
  });
  const startRow = lastKeyRow + 1;
  sheet.getRange(startRow, keyColumn, missing.length, 1).setValues(missing.map(([key]) => [key]));
  sheet.getRange(startRow, valueColumn, missing.length, 1).setValues(missing.map(([, value]) => [value]));
  return missing.map(([key]) => key);
}

// シートの読み書きの共通部品

function getSheet_(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) throw new Error(`「${name}」シートがありません。`);
  return sheet;
}

/** 1行目の見出しから、列名と列番号（1始まり）の対応を作る。 */
function headerMap_(sheet) {
  const map = {};
  const lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) return map;
  sheet.getRange(1, 1, 1, lastColumn).getValues()[0].forEach((name, i) => {
    const key = text_(name);
    if (key && !(key in map)) map[key] = i + 1;
  });
  return map;
}

/** 列名から列番号を引く。見出しに無ければ、どのシートのどの列かを書いて止める。 */
function columnOf_(map, sheetName, columnName) {
  const column = map[columnName];
  if (!column) {
    throw new Error(`「${sheetName}」シートに「${columnName}」の列がありません。1行目の見出しを確かめてください。`);
  }
  return column;
}

function dataBelowHeader_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) return [];
  return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
}

/**
 * 2行目以降を、列名をキーにした入れ物の配列にして返す。rowNumber に行番号を持つ。
 * columns に挙げた列が見出しに無ければ止める。挙げた列が全て空の行は飛ばす。
 */
function readRecords_(sheetName, columns) {
  const sheet = getSheet_(sheetName);
  const map = headerMap_(sheet);
  const indexes = columns.map((name) => columnOf_(map, sheetName, name) - 1);
  const records = [];
  dataBelowHeader_(sheet).forEach((row, i) => {
    const record = { rowNumber: i + 2 };
    let filled = false;
    columns.forEach((name, j) => {
      record[name] = row[indexes[j]];
      if (text_(row[indexes[j]]) !== '') filled = true;
    });
    if (filled) records.push(record);
  });
  return records;
}

/** 結果のシートを作り直す。amountColumns に挙げた列は金額の書式、他は文字の書式。 */
function writeOutputSheet_(name, header, rows, amountColumns, note) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clear();
  sheet.clearNotes();
  const values = [header.slice()].concat(rows);
  sheet.getRange(1, 1, values.length, header.length).setNumberFormat(FORMAT.TEXT);
  if (rows.length > 0) {
    amountColumns.forEach((columnName) => {
      sheet.getRange(2, header.indexOf(columnName) + 1, rows.length, 1).setNumberFormat(FORMAT.AMOUNT);
    });
  }
  sheet.getRange(1, 1, values.length, header.length).setValues(values);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1).setNote(note);
  sheet.activate();
}

/** 見出しの順に値を並べた1行。無い列は空。 */
function rowOf_(header, values) {
  return header.map((name) => (name in values ? values[name] : ''));
}

function groupKey_(kouji, item) {
  return `${kouji}\t${item}`;
}

// 値の読み方

function text_(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function toNumber_(value) {
  if (typeof value === 'number') return value;
  const cleaned = text_(value).replace(/[,，円¥￥\s]/g, '');
  if (cleaned === '') return 0;
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

function labelOf_(value, record) {
  return text_(value) || `${record.rowNumber}行目`;
}

let timeZoneCache_ = null;

function timeZone_() {
  if (!timeZoneCache_) timeZoneCache_ = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  return timeZoneCache_;
}

const SERIAL_ORIGIN_MS = Date.UTC(1899, 11, 30);
const DAY_MS = 24 * 60 * 60 * 1000;
/** シリアル値の上限（9999-12-31）。 */
const SERIAL_MAX = 2958465;

/**
 * セルの値から年、月、日を取り出す。読めなければ null。
 * 受ける形: 日付の値、シリアル値（onEdit の oldValue で届く数字）、2026-07-15、2026/07、2026年7月。
 */
function dateParts_(value) {
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const p = Utilities.formatDate(value, timeZone_(), 'yyyy-MM-dd').split('-');
    return { year: Number(p[0]), month: Number(p[1]), day: Number(p[2]) };
  }
  const s = text_(value);
  if (/^\d+(\.\d+)?$/.test(s)) {
    const serial = Number(s);
    if (serial < 1 || serial > SERIAL_MAX) return null;
    const d = new Date(SERIAL_ORIGIN_MS + Math.floor(serial) * DAY_MS);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  }
  const m = s.match(/^(\d{4})\s*[-\/.年]\s*(\d{1,2})(?:\s*[-\/.月]\s*(\d{1,2}))?/);
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: m[3] ? Number(m[3]) : 0 };
}

/** 2026-07 の形。読めなければ空の文字。 */
function toMonthKey_(value) {
  const p = dateParts_(value);
  return p ? `${p.year}-${pad2_(p.month)}` : '';
}

/** 2026-07-15 の形。日の無い値と読めない値は空の文字。 */
function toDateKey_(value) {
  const p = dateParts_(value);
  return p && p.day ? `${p.year}-${pad2_(p.month)}-${pad2_(p.day)}` : '';
}

function monthEndKey_(month) {
  const p = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(p[0], p[1], 0)).getUTCDate();
  return `${month}-${pad2_(lastDay)}`;
}

function nextMonthKey_(month) {
  const p = month.split('-').map(Number);
  return p[1] === 12 ? `${p[0] + 1}-01` : `${p[0]}-${pad2_(p[1] + 1)}`;
}

function pad2_(n) {
  return (n < 10 ? '0' : '') + n;
}

function nowText_() {
  return Utilities.formatDate(new Date(), timeZone_(), 'yyyy-MM-dd HH:mm');
}

function yen_(amount) {
  const digits = String(Math.abs(Math.round(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${amount < 0 ? '-' : ''}${digits}円`;
}

function compareText_(a, b) {
  const x = String(a);
  const y = String(b);
  if (x < y) return -1;
  return x > y ? 1 : 0;
}

// 画面の知らせ

function alert_(title, message) {
  const ui = SpreadsheetApp.getUi();
  ui.alert(title, message, ui.ButtonSet.OK);
}

function confirm_(title, message) {
  const ui = SpreadsheetApp.getUi();
  return ui.alert(title, message, ui.ButtonSet.YES_NO) === ui.Button.YES;
}

function toast_(message) {
  SpreadsheetApp.getActive().toast(message, MENU_TITLE, TOAST_SECONDS);
}

function errorText_(err) {
  return err && err.message ? err.message : String(err);
}

/** メニューの操作を包み、止めた理由はダイアログで出す。 */
function runWithAlert_(title, task) {
  try {
    task();
  } catch (err) {
    alert_(title, errorText_(err));
  }
}

/** 締めと解除が同時に走らないように、スプレッドシート単位の鍵を取ってから書く。 */
function withDocumentLock_(task) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(LOCK_WAIT_MS)) {
    throw new Error('ほかの操作が終わらないため、取りやめました。少し待ってからやり直してください。');
  }
  try {
    return task();
  } finally {
    lock.releaseLock();
  }
}
