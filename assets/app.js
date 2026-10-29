/* 業務画面の土台: データと保存、書式、ルーター、役割、権限と判定、金額の計算、部品 */
(function () {
  'use strict';

  var App = {};
  window.App = App;

  var SAMPLE = window.SAMPLE || {};
  var KEY = { role: 'pcw.role', searches: 'pcw.searches', lists: 'pcw.lists', data: 'pcw.data' };
  var ROLES = ['eigyo', 'tanto', 'kobai', 'keiri'];
  var ROLE_NAME = { eigyo: '営業', tanto: '工事担当', kobai: '購買', keiri: '経理' };
  var CATS = ['材料費', '外注費', '労務費', '経費'];
  var ORDER_CATS = ['材料費', '外注費', '経費'];
  var KOUJI_STATES = ['見積中', '受注', '施工中', '検収済', '請求済', '完了'];
  var HISTORY_OPS = ['登録', '変更', '承認', '修正依頼', '再提出', '状態を進める', '状態を戻す', '取消',
    '打切', '訂正', '確認', '差戻し', '再受付', '予算改定の起案', '予算改定の承認', '労務費の計上',
    '締め', '締め解除'];
  var NO_VALUE = '–';
  var MINUS = '−';

  App.ROLES = ROLES.slice();
  App.CATS = CATS.slice();
  App.ORDER_CATS = ORDER_CATS.slice();
  App.KOUJI_STATES = KOUJI_STATES.slice();
  App.HISTORY_OPS = HISTORY_OPS.slice();

  function has(o, k) { return o !== null && o !== undefined && Object.prototype.hasOwnProperty.call(o, k); }
  function clone(v) { return v === null || v === undefined ? v : JSON.parse(JSON.stringify(v)); }
  function pad(n, w) { var s = String(n); while (s.length < w) s = '0' + s; return s; }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function sum(list, fn) { var s = 0; for (var i = 0; i < list.length; i++) s += num(fn(list[i])); return s; }

  /* ---------- sessionStorage（使えないときは変数に退避） ---------- */

  var memory = {};

  function readStore(key) {
    try {
      var v = window.sessionStorage.getItem(key);
      if (v !== null) return v;
    } catch (e) {
      /* 使えない環境では退避先を読む */
    }
    return has(memory, key) ? memory[key] : null;
  }

  function writeStore(key, value) {
    if (value === null || value === undefined) {
      delete memory[key];
      try { window.sessionStorage.removeItem(key); } catch (e) { /* 退避先だけで持つ */ }
      return;
    }
    memory[key] = value;
    try { window.sessionStorage.setItem(key, value); } catch (e) { /* 退避先だけで持つ */ }
  }

  function readJSON(key) {
    var s = readStore(key);
    if (!s) return null;
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function writeJSON(key, obj) {
    var s;
    try { s = JSON.stringify(obj); } catch (e) { return; }
    writeStore(key, s);
  }

  /* 'searches.<名前>' は名前を付けて保存した条件、'lists.<名前>' は一覧の今の検索、絞り込み、並べ替え */
  function splitKey(key) {
    var m = /^(searches|lists)\.(.+)$/.exec(String(key || ''));
    if (!m) throw new Error('App.remember のキーは searches.<名前> か lists.<名前> の形');
    return { store: KEY[m[1]], name: m[2] };
  }

  App.remember = function (key, value) {
    var k = splitKey(key);
    var all = readJSON(k.store) || {};
    if (value === null || value === undefined) delete all[k.name];
    else all[k.name] = value;
    writeJSON(k.store, all);
  };

  App.recall = function (key) {
    var k = splitKey(key);
    var all = readJSON(k.store) || {};
    return has(all, k.name) ? clone(all[k.name]) : undefined;
  };

  /* 名前を付けた条件。'searches.<名前>' に [{name, cond}] で持つ。戻り値は App.flash にそのまま渡せる */
  function searchList(key) {
    if (splitKey(key).store !== KEY.searches) throw new Error('名前を付けた条件のキーは searches.<名前> の形');
    var list = App.recall(key);
    return Array.isArray(list) ? list.filter(function (x) { return x && x.name; }) : [];
  }

  /* 同じ名前があれば置き換え、無ければ後ろに足す。置き換えたかを replaced で返す */
  App.saveSearch = function (key, name, cond) {
    var list = searchList(key), at = -1;
    var entry = { name: String(name), cond: cond === undefined ? null : clone(cond) };
    list.forEach(function (x, i) { if (x.name === entry.name) at = i; });
    var replaced = at >= 0;
    if (replaced) list[at] = entry;
    else list.push(entry);
    App.remember(key, list);
    return {
      ok: true, name: entry.name, replaced: replaced,
      message: '条件「' + entry.name + '」を' + (replaced ? '上書きしました。' : '保存しました。')
    };
  };

  App.dropSearch = function (key, name) {
    App.remember(key, searchList(key).filter(function (x) { return x.name !== String(name); }));
    return { ok: true, name: String(name), message: '条件「' + name + '」を削除しました。' };
  };

  /* ---------- 設定 ---------- */

  var S = SAMPLE.settings || {};
  /* 支払条件: 締め日（0は末日）、何か月後、支払日（0は末日） */
  var TERMS = {
    '月末締め翌月末払い': { closeDay: 0, months: 1, payDay: 0 },
    '月末締め翌々月10日払い': { closeDay: 0, months: 2, payDay: 10 },
    '20日締め翌月10日払い': { closeDay: 20, months: 1, payDay: 10 },
    '月末締め翌々月末払い': { closeDay: 0, months: 2, payDay: 0 },
    '25日締め翌月末払い': { closeDay: 25, months: 1, payDay: 0 }
  };
  var settings = {
    company: S.company || S.companyName || '',
    companyLabel: S.companyLabel || ((S.company || S.companyName || '株式会社') + '（架空）'),
    baseDate: String(S.baseDate || SAMPLE['基準日'] || S['基準日'] || S.today || '2026-09-08').slice(0, 10),
    laborRate: num(S.laborRate || S.hourlyRate || S.rate) || 4650,
    roleUsers: S.roleUsers || S.users || { eigyo: 'E01', tanto: 'E03', kobai: 'E07', keiri: 'E08' },
    terms: S.terms || SAMPLE.terms || TERMS,
    defaultRole: ROLES.indexOf(S.defaultRole) >= 0 ? S.defaultRole : 'keiri'
  };

  App.settings = function () { return settings; };
  App.today = function () { return settings.baseDate; };

  /* ---------- 業務データ ---------- */

  var TABLES = {
    kouji: ['kouji', 'koji', 'projects'],
    orders: ['orders', 'hacchu'],
    inspections: ['inspections', 'kenshu'],
    invoices: ['invoices', 'seikyu'],
    revisions: ['revisions', 'kaitei'],
    labor: ['labor', 'roumu'],
    history: ['history', 'rireki'],
    months: ['months', 'shime'],
    partners: ['partners', 'torihikisaki'],
    employees: ['employees', 'shain']
  };
  var ID = {
    kouji: 'no', orders: 'no', inspections: 'no', invoices: 'no', revisions: 'no',
    partners: 'code', employees: 'id', months: 'month'
  };

  function pickTable(names) {
    var places = [SAMPLE, SAMPLE.data || {}, SAMPLE.tables || {}];
    for (var p = 0; p < places.length; p++) {
      for (var n = 0; n < names.length; n++) {
        if (has(places[p], names[n]) && places[p][names[n]]) return places[p][names[n]];
      }
    }
    return null;
  }

  function asList(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v.slice();
    if (typeof v === 'object') return Object.keys(v).map(function (k) { return v[k]; });
    return [];
  }

  function normMonths(v) {
    var list = [];
    if (v && !Array.isArray(v) && typeof v === 'object') {
      Object.keys(v).forEach(function (k) {
        var x = v[k];
        list.push(typeof x === 'string' ? { month: k, status: x } : Object.assign({ month: k }, x));
      });
    } else {
      list = asList(v);
    }
    list.forEach(function (m) {
      if (!m.status) m.status = '未締め';
      if (m.carryover === undefined) m.carryover = false;
    });
    return list.sort(function (a, b) { return a.month < b.month ? -1 : a.month > b.month ? 1 : 0; });
  }

  function normKouji(k) {
    var b = k.budget0;
    if (Array.isArray(b)) {
      var o = {};
      CATS.forEach(function (c, i) { o[c] = b[i] === undefined ? null : b[i]; });
      k.budget0 = o;
    } else if (!b || typeof b !== 'object') {
      k.budget0 = { '材料費': null, '外注費': null, '労務費': null, '経費': null };
    }
  }

  function baseData() {
    var d = {};
    Object.keys(TABLES).forEach(function (t) { d[t] = asList(clone(pickTable(TABLES[t]))); });
    if (!d.months.length && S.months) d.months = clone(S.months);
    d.months = normMonths(d.months);
    d.kouji.forEach(normKouji);
    return d;
  }

  var BASE = null;
  var state = null;
  var fingerprint = (function () {
    var s = '';
    try { s = JSON.stringify(SAMPLE); } catch (e) { s = ''; }
    var h = 0;
    for (var i = 0; i < s.length; i += 7) h = (h * 31 + s.charCodeAt(i)) | 0;
    return s.length + ':' + h;
  })();

  function loadData() {
    BASE = baseData();
    var saved = readJSON(KEY.data);
    state = saved && saved.v === fingerprint && saved.data ? saved.data : clone(BASE);
  }

  function saveData() { writeJSON(KEY.data, { v: fingerprint, data: state }); }

  App.data = function () {
    if (!state) loadData();
    return state;
  };

  var updating = 0;
  App.update = function (fn) {
    var d = App.data();
    var result;
    updating++;
    try {
      result = fn(d);
    } finally {
      updating--;
    }
    if (!updating) saveData();
    return result;
  };

  App.resetData = function () {
    if (!BASE) loadData();
    writeStore(KEY.data, null);
    state = clone(BASE);
  };

  /* 番号やコードで1件を引く。labor は find('labor', 工事番号, 月) */
  App.find = function (table, key, month) {
    var d = App.data();
    var list = d[table] || [];
    if (table === 'labor') {
      for (var j = 0; j < list.length; j++) {
        if (list[j].kouji === key && list[j].month === month) return list[j];
      }
      return null;
    }
    var id = ID[table] || 'no';
    for (var i = 0; i < list.length; i++) if (list[i][id] === key) return list[i];
    return null;
  };

  function rec(table, v) { return v && typeof v === 'object' ? v : (v ? App.find(table, v) : null); }

  App.empName = function (ref) {
    if (!ref) return '';
    var e = App.find('employees', ref);
    return e ? e.name : String(ref);
  };

  App.partnerName = function (ref) {
    if (!ref) return '';
    var p = App.find('partners', ref);
    return p ? p.name : String(ref);
  };

  /* ---------- 履歴と採番 ---------- */

  function addMinute(at) {
    var d = new Date(Date.UTC(+at.slice(0, 4), +at.slice(5, 7) - 1, +at.slice(8, 10),
      +at.slice(11, 13), +at.slice(14, 16) + 1));
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1, 2) + '-' + pad(d.getUTCDate(), 2) + ' ' +
      pad(d.getUTCHours(), 2) + ':' + pad(d.getUTCMinutes(), 2);
  }

  /* 操作した日時: 基準日の 09:00 から、直前の履歴より1分後へ進める */
  function nextStamp(d) {
    var start = settings.baseDate + ' 09:00';
    var last = '';
    d.history.forEach(function (h) { if (h.at && h.at > last) last = h.at; });
    return last && last >= start ? addMinute(last.slice(0, 16)) : start;
  }

  App.user = function (role) {
    role = role || App.role();
    var d = App.data();
    var ref = settings.roleUsers[role];
    var e = null;
    if (ref) e = App.find('employees', ref) || d.employees.filter(function (x) { return x.name === ref; })[0];
    if (!e) e = d.employees.filter(function (x) { return x.role === ROLE_NAME[role]; })[0];
    return e ? { id: e.id, name: e.name, role: ROLE_NAME[role] } : { id: '', name: ROLE_NAME[role], role: ROLE_NAME[role] };
  };

  App.addHistory = function (entry) {
    return App.update(function (d) {
      var u = App.user();
      var h = {
        at: entry.at || nextStamp(d),
        user: entry.user || u.name,
        role: entry.role || u.role,
        target: entry.target || '',
        op: entry.op || '',
        before: entry.before || {},
        after: entry.after || {},
        reason: entry.reason || '',
        related: entry.related || ''
      };
      d.history.push(h);
      return h;
    });
  };

  function reEsc(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function maxSeq(list, re) {
    var m = 0;
    list.forEach(function (v) {
      var x = re.exec(v || '');
      if (x && +x[1] > m) m = +x[1];
    });
    return m;
  }

  /* kind: kouji / order（parent=工事番号）/ inspection（parent=発注番号）/ invoice / revision（parent=工事番号）/ partner */
  App.nextNumber = function (kind, parent) {
    var d = App.data();
    var yy = settings.baseDate.slice(2, 4);
    var p = reEsc(parent || '');
    switch (kind) {
      case 'kouji':
        return yy + '-' + pad(maxSeq(d.kouji.map(function (k) { return k.no; }), new RegExp('^' + yy + '-(\\d{3})$')) + 1, 3);
      case 'order':
        return parent + '-' + pad(maxSeq(d.orders.map(function (o) { return o.no; }), new RegExp('^' + p + '-(\\d{2})$')) + 1, 2);
      case 'inspection':
        return parent + '-K' + (maxSeq(d.inspections.map(function (i) { return i.no; }), new RegExp('^' + p + '-K(\\d+)$')) + 1);
      case 'invoice':
        return 'R-' + pad(maxSeq(d.invoices.map(function (v) { return v.no; }), /^R-(\d+)$/) + 1, 4);
      case 'revision':
        return parent + '-Y' + (maxSeq(d.revisions.map(function (r) { return r.no; }), new RegExp('^' + p + '-Y(\\d+)$')) + 1);
      case 'partner':
        return 'T-' + (maxSeq(d.partners.map(function (x) { return x.code; }), /^T-(\d+)$/) + 1);
      default:
        throw new Error('App.nextNumber: 知らない種類 ' + kind);
    }
  };

  /* ---------- 書式 ---------- */

  function group(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function blank(v) { return v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v)); }

  App.fmt = {
    yen: function (n) {
      if (blank(n) || isNaN(Number(n))) return NO_VALUE;
      n = Math.round(Number(n));
      return (n < 0 ? MINUS : '') + group(Math.abs(n));
    },
    num: function (n, digits) {
      if (blank(n) || isNaN(Number(n))) return NO_VALUE;
      n = Number(n);
      var s = Math.abs(n).toFixed(digits || 0).split('.');
      return (n < 0 ? MINUS : '') + group(s[0]) + (s[1] ? '.' + s[1] : '');
    },
    hours: function (h) {
      if (blank(h) || isNaN(Number(h))) return NO_VALUE;
      return App.fmt.num(h, Number(h) % 1 ? 1 : 0);
    },
    date: function (s) {
      if (blank(s)) return NO_VALUE;
      s = String(s);
      return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
    },
    datetime: function (s) {
      if (blank(s)) return NO_VALUE;
      return String(s).replace('T', ' ').slice(0, 16);
    },
    month: function (m) {
      if (blank(m)) return NO_VALUE;
      return String(m).slice(0, 7);
    },
    /* pct(割合) か pct(値, 予算)。割合が無いか予算が0なら「予算なし」 */
    pct: function (v, base) {
      if (arguments.length > 1) {
        if (!Number(base)) return '予算なし';
        v = Number(v) / Number(base);
      }
      if (blank(v) || !isFinite(Number(v))) return '予算なし';
      return (Math.round(Number(v) * 1000) / 10).toFixed(1) + '%';
    }
  };

  App.NO_VALUE = NO_VALUE;

  App.toHalf = function (s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/，/g, ',').replace(/．/g, '.').replace(/／/g, '/').replace(/：/g, ':')
      .replace(/＋/g, '+').replace(/[－−]/g, '-').replace(/　/g, ' ');
  };

  App.esc = function (s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* 入力の読み取り: 空は null、読めないときは NaN（日付と年月は false） */
  function validDate(y, m, d) {
    var t = new Date(Date.UTC(y, m - 1, d));
    return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
  }

  App.parse = {
    yen: function (s) {
      s = App.toHalf(s).replace(/[\s,円]/g, '');
      if (s === '') return null;
      return /^-?\d+$/.test(s) ? Number(s) : NaN;
    },
    hours: function (s) {
      s = App.toHalf(s).replace(/[\s,時間]/g, '');
      if (s === '') return null;
      return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
    },
    /* 負の数として入れた値か。数は 0 未満、文字は先頭が「-」か「−」 */
    minus: function (s) {
      if (typeof s === 'number') return s < 0;
      return /^[-−]/.test(App.toHalf(s).replace(/\s/g, ''));
    },
    date: function (s) {
      s = App.toHalf(s).trim();
      if (s === '') return null;
      var m = /^(\d{4})[-/.]?(\d{1,2})[-/.]?(\d{1,2})$/.exec(s);
      if (!m) return false;
      if (/^\d+$/.test(s) && s.length !== 8) return false;
      var y = +m[1], mo = +m[2], d = +m[3];
      return validDate(y, mo, d) ? y + '-' + pad(mo, 2) + '-' + pad(d, 2) : false;
    },
    month: function (s) {
      s = App.toHalf(s).trim();
      if (s === '') return null;
      var m = /^(\d{4})[-/.]?(\d{1,2})$/.exec(s);
      return m && +m[2] >= 1 && +m[2] <= 12 ? m[1] + '-' + pad(+m[2], 2) : false;
    }
  };

  /* ---------- 日付の道具 ---------- */

  App.monthOf = function (d) { return d ? String(d).slice(0, 7) : ''; };

  App.addMonths = function (m, n) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1 + n;
    return (y + Math.floor(mo / 12)) + '-' + pad(((mo % 12) + 12) % 12 + 1, 2);
  };

  App.monthEnd = function (m) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7);
    return m.slice(0, 7) + '-' + pad(new Date(Date.UTC(y, mo, 0)).getUTCDate(), 2);
  };

  /* ---------- 役割 ---------- */

  var ROLE_LINE = {
    eigyo: '営業として見ています。工事の登録と受注、予算改定の承認ができます。',
    tanto: '工事担当として見ています。発注の起票、発注検収の登録、着工と施主検収の登録ができます。',
    kobai: '購買として見ています。発注の承認と修正依頼、発注検収の登録、打切ができます。',
    keiri: '経理として見ています。請求の確認、労務費の計上、月次の締めができます。'
  };

  App.role = function () {
    return roleKey(readStore(KEY.role)) || settings.defaultRole;
  };

  App.roleName = function (role) { return ROLE_NAME[role || App.role()] || ''; };

  App.roleLine = function (role) { return ROLE_LINE[role || App.role()] || ''; };

  /* 'keiri' と '経理' のどちらでも役割のキーを返す。知らない値は '' */
  function roleKey(v) {
    if (ROLES.indexOf(v) >= 0) return v;
    for (var i = 0; i < ROLES.length; i++) if (ROLE_NAME[ROLES[i]] === v) return ROLES[i];
    return '';
  }
  App.roleKey = roleKey;

  App.setRole = function (role) {
    role = roleKey(role);
    if (!role) return false;
    writeStore(KEY.role, role);
    drawShell();
    return true;
  };

  /* ---------- 入力途中の印 ---------- */

  var dirty = false;
  App.setDirty = function (v) { dirty = !!v; };
  App.isDirty = function () { return dirty; };

  var LEAVE_TEXT = '入力した内容は保存されていません。この画面を離れると入力は消えます。';

  function askLeave() {
    if (!dirty) return Promise.resolve(true);
    return App.confirm(LEAVE_TEXT, { title: '入力をやめて移動しますか', ok: '入力をやめて移動', cancel: '入力に戻る' })
      .then(function (yes) {
        if (yes) dirty = false;
        return yes;
      });
  }

  /* ---------- ルーター ---------- */

  var routes = [];
  var current = { hash: '', route: null, params: null };
  var pendingFlash = null;
  /* 「条件を外す」を押した一覧の順番（画面の中の .tbl-block の何番目か）。次の描画で使って消す */
  var clearedList = null;
  var routeNotice = '';
  var skipHash = null;
  /* 移動の種類（'url' は URL の指定で開く、'op' は画面の中の操作、'row' は一覧の行のリンク）、前の画面のパス、指された行へ送るか */
  var navKind = 'url', lastPath = null, scrollPick = false;
  /* 「前の履歴を表示」で開いた履歴。同じ画面にいる間は開いたままにする */
  var logOpen = {}, logSeq = 0;

  function safeDecode(s) {
    try { return { ok: true, v: decodeURIComponent(String(s).replace(/\+/g, ' ')) }; } catch (e) { return { ok: false }; }
  }

  App.parseHash = function (hash) {
    var h = hash === undefined ? window.location.hash : String(hash);
    h = h.replace(/^#/, '');
    var q = h.indexOf('?');
    var front = q >= 0 ? h.slice(0, q) : h;
    var back = q >= 0 ? h.slice(q + 1) : '';
    var path = [];
    front.split('/').forEach(function (seg) {
      if (!seg) return;
      var d = safeDecode(seg);
      path.push(d.ok ? d.v : seg);
    });
    var query = {};
    back.split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      var k = safeDecode(i >= 0 ? pair.slice(0, i) : pair);
      var v = safeDecode(i >= 0 ? pair.slice(i + 1) : '');
      if (k.ok && v.ok && k.v) query[k.v] = v.v;
    });
    return { path: path, query: query };
  };

  /* 道筋と指定からハッシュを組む: App.link(['kouji', '26-014'], {role: 'keiri'}) は '#/kouji/26-014?role=keiri' */
  App.link = function (path, query) {
    var parts = Array.isArray(path) ? path : String(path || '').replace(/^#?\/?/, '').split('/');
    var h = '#/' + parts.filter(function (s) { return s !== '' && s !== null && s !== undefined; })
      .map(function (s) { return encodeURIComponent(String(s)); }).join('/');
    var qs = [];
    Object.keys(query || {}).forEach(function (k) {
      var v = query[k];
      if (v === null || v === undefined || v === '') return;
      qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
    });
    return qs.length ? h + '?' + qs.join('&') : h;
  };

  function normHash(hash) {
    var h = String(hash || '');
    if (h.charAt(0) !== '#') h = '#' + (h.charAt(0) === '/' ? '' : '/') + h;
    else if (h.charAt(1) !== '/') h = '#/' + h.slice(1);
    return h;
  }

  /* 画面の登録。name は 'kouji'、'kouji/:no'、'shime/:month?' の形 */
  App.screen = function (name, def) {
    var segs = String(name).split('/');
    routes.push({
      name: name,
      segs: segs,
      literal: segs.filter(function (s) { return s.charAt(0) !== ':'; }).length,
      def: def || {}
    });
  };

  function match(path) {
    var best = null;
    routes.forEach(function (r) {
      var args = {};
      var need = r.segs.filter(function (s) { return !/\?$/.test(s); }).length;
      if (path.length < need || path.length > r.segs.length) return;
      for (var i = 0; i < r.segs.length; i++) {
        var s = r.segs[i];
        if (s.charAt(0) === ':') {
          if (i < path.length) args[s.replace(/^:|\?$/g, '')] = path[i];
        } else if (s !== path[i]) {
          return;
        }
      }
      if (!best || r.literal > best.route.literal) best = { route: r, args: args };
    });
    return best;
  }

  function replaceHash(hash) {
    try {
      window.history.replaceState(window.history.state, '', hash);
    } catch (e) {
      skipHash = hash;
      window.location.replace(hash);
    }
  }

  /* role= と reset= を読んで外す。外したハッシュを返す。
     reset=1 は業務データ、一覧の条件（lists.*）、名前を付けた条件（searches.*）を最初の状態に戻す。役割は戻さない */
  function takeOptions(p) {
    var changed = false;
    if (has(p.query, 'reset')) {
      if (p.query.reset === '1') {
        App.resetData();
        writeStore(KEY.lists, null);
        writeStore(KEY.searches, null);
        dirty = false;
        pendingFlash = null;
      }
      delete p.query.reset;
      changed = true;
    }
    if (has(p.query, 'role')) {
      if (roleKey(p.query.role)) writeStore(KEY.role, roleKey(p.query.role));
      delete p.query.role;
      changed = true;
    }
    return changed ? App.link(p.path, p.query) : null;
  }

  function route(isNav) {
    stampHistory();
    var p = App.parseHash();
    var cleaned = takeOptions(p);
    if (cleaned) replaceHash(cleaned);
    if (!p.path.length) {
      var first = match(['kouji']) ? '#/kouji' : (routes[0] ? '#/' + routes[0].segs[0] : '');
      if (first) {
        replaceHash(first);
        p = App.parseHash(first);
      }
    }
    var m = match(p.path);
    routeNotice = '';
    if (!m) {
      var list = match(['kouji']);
      if (list) {
        routeNotice = '指定の画面が見つからないため、工事一覧を開きました。';
        replaceHash('#/kouji');
        p = { path: ['kouji'], query: {} };
        m = list;
      }
    }
    current = { hash: window.location.hash, route: m ? m.route : null, params: null };
    if (m) current.params = { path: p.path, query: p.query, args: m.args };
    var kind = navKind;
    navKind = 'url';
    var path = p.path.join('/');
    var same = path === lastPath;
    lastPath = path;
    if (!same) logOpen = {};
    /* 指された行（.is-focus）へ送るのは、URL の指定で開いた最初の1回だけ。同じ画面の中の操作では送らない */
    scrollPick = !!isNav && Object.keys(p.query).length > 0 && !((kind === 'op' || kind === 'row') && same);
    dirty = false;
    /* 同じ画面のまま一覧の行のリンクで query を変えたときは、ページを動かさない */
    var stay = kind === 'row' && same;
    draw(isNav && !stay, stay);
  }

  /* kind: 'url' は URL の指定で開く移動、'op' は画面の中の操作での移動、'row' は一覧の行のリンクでの移動 */
  function goTo(hash, kind) {
    var target = normHash(hash);
    return askLeave().then(function (yes) {
      if (!yes) return false;
      navKind = kind;
      if (target === window.location.hash) route(true);
      else window.location.hash = target;
      return true;
    });
  }

  App.go = function (hash) { return goTo(hash, 'op'); };

  App.render = function () { draw(false); };

  App.current = function () { return current.params; };

  /* 履歴の各項目に通し番号を持たせ、戻ると進むの向きを見分ける */
  var histIdx = 0;
  function stampHistory() {
    var st = window.history.state;
    if (st && typeof st.idx === 'number') { histIdx = st.idx; return; }
    histIdx += 1;
    try { window.history.replaceState({ idx: histIdx }, '', window.location.hash); } catch (e) { /* 番号なしで続ける */ }
  }

  /* 入力ありで履歴を移ったときは、移った先に居るまま確認を出す。
     「入力に戻る」なら同じ数だけ逆に移って元のフォームへ戻り、「入力をやめて移動」ならそのまま描く */
  function onHashChange() {
    if (skipHash && window.location.hash === skipHash) {
      skipHash = null;
      return;
    }
    if (!dirty) {
      route(true);
      return;
    }
    var back = current.hash;
    var st = window.history.state;
    var step = st && typeof st.idx === 'number' ? histIdx - st.idx : 0;
    askLeave().then(function (yes) {
      if (yes) {
        route(true);
        return;
      }
      skipHash = back;
      if (step) window.history.go(step);
      else window.history.back();
    });
  }

  /* 描き直しの前後で、同じ役目の要素にフォーカスを戻すための目印。
     要素の種類、name、data-op、文字（チップは件数を除く）と、同じ目印の中の順番で探す */
  function focusSig(el) {
    var tag = el.tagName;
    var text = '';
    if (!/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
      text = el.classList.contains('chip') && el.firstChild ? el.firstChild.textContent : el.textContent;
    }
    return [tag, el.getAttribute('name') || '', el.getAttribute('data-op') || '', (text || '').trim()].join('|');
  }

  function focusMark(root) {
    var el = document.activeElement;
    if (!el || el === document.body || !root.contains(el)) return null;
    var sig = focusSig(el), n = 0;
    var list = root.querySelectorAll(FOCUSABLE);
    for (var i = 0; i < list.length && list[i] !== el; i++) if (focusSig(list[i]) === sig) n++;
    var sel = null;
    try { if (typeof el.selectionStart === 'number') sel = [el.selectionStart, el.selectionEnd]; } catch (e) { sel = null; }
    return { sig: sig, n: n, sel: sel };
  }

  function focusBack(root, mark) {
    if (!mark) return;
    var list = root.querySelectorAll(FOCUSABLE), n = 0;
    for (var i = 0; i < list.length; i++) {
      if (focusSig(list[i]) !== mark.sig) continue;
      if (n++ < mark.n) continue;
      var el = list[i];
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      if (mark.sel) { try { el.setSelectionRange(mark.sel[0], mark.sel[1]); } catch (e2) { /* 範囲を持たない欄 */ } }
      return;
    }
  }

  /* 「条件を外す」で描き直して押したボタンが消えたとき、同じ順番の一覧の絞り込みの最初の欄へフォーカスを置く。
     絞り込みが無ければ一覧の最初の行へ置く */
  function focusAfterClear(root, at) {
    var blocks = root.querySelectorAll('.tbl-block');
    if (!blocks.length) return;
    var block = blocks[Math.min(at, blocks.length - 1)];
    var band = null;
    for (var n = block; n && n !== root && !band; n = n.parentNode) {
      for (var s = n.previousElementSibling; s && !band; s = s.previousElementSibling) {
        band = s.classList.contains('filters') ? s : s.querySelector('.filters');
      }
    }
    var ctrl = 'select:not([disabled]), input:not([disabled]), button:not([disabled])';
    var el = band ? band.querySelector(ctrl) : null;
    if (!el) el = block.querySelector('.row-link');
    if (el) el.focus();
  }

  /* stay は一覧の行のリンクで同じ画面の query を変えた描き直し。ページの位置とフォーカスを保つ */
  function draw(isNav, stay) {
    var content = document.getElementById('content');
    if (!content) return;
    closeDialogs();
    var mark = isNav ? null : focusMark(content);
    var pickIt = scrollPick;
    scrollPick = false;
    logSeq = 0;
    content.textContent = '';
    if (routeNotice) content.appendChild(App.notice(routeNotice, { plain: true }));
    /* 保存の後の知らせは、その直後の1回だけ出す。次の描画で消える */
    var flash = pendingFlash;
    pendingFlash = null;
    var flashBox = flash ? flashEl(flash) : null;
    if (flashBox) content.appendChild(flashBox);
    var el = document.createElement('div');
    el.className = 'screen';
    content.appendChild(el);
    var def = current.route ? current.route.def : null;
    if (def && typeof def.render === 'function') {
      def.render(el, current.params);
      var t = typeof def.title === 'function' ? def.title(current.params) : def.title;
      document.title = (t ? t + ' | ' : '') + '工事原価管理';
    }
    drawShell(def);
    placeActions();
    var cleared = clearedList;
    clearedList = null;
    if (!isNav) {
      focusBack(content, mark);
      if (cleared !== null && (!document.activeElement || document.activeElement === document.body)) focusAfterClear(content, cleared);
      /* 保存の後の知らせが画面の上に外れていれば先頭へ戻し、フォーカスの行き先が無ければ知らせに置く */
      if (flashBox) {
        if (flashBox.getBoundingClientRect().top < 0) window.scrollTo(0, 0);
        if (!document.activeElement || document.activeElement === document.body) {
          flashBox.setAttribute('tabindex', '-1');
          try { flashBox.focus({ preventScroll: true }); } catch (e) { flashBox.focus(); }
        }
      }
      /* 押した行でない .is-focus（発注検収の登録欄など）が最初の .is-focus なら、画面に丸ごと入っていないときだけ中央へ送る */
      var first = stay ? content.querySelector('.is-focus') : null;
      if (first && !isPickedRow(first) && !inFirstView(first)) toCenter(first);
    }
    if (isNav) {
      window.scrollTo(0, 0);
      var h1 = content.querySelector('h1');
      var to = h1 || content;
      if (h1) h1.setAttribute('tabindex', '-1');
      try { to.focus({ preventScroll: true }); } catch (e) { to.focus(); }
      /* URL で指された行が最初の画面に丸ごと入っていなければ、その行を画面の中央へ送る */
      var pick = pickIt ? content.querySelector('.is-focus') : null;
      if (pick && !inFirstView(pick)) toCenter(pick);
    }
  }

  /* 一覧の行のリンクで選んだ行か。行の中のリンクが今のハッシュを指していれば、その行 */
  function isPickedRow(el) {
    var a = el.querySelector('a.row-link');
    return !!a && normHash(a.getAttribute('href')) === window.location.hash;
  }

  /* 下の固定の帯の高さ。帯が無ければ 0 */
  function fixbarHeight() {
    if (!document.body.classList.contains('has-fixbar')) return 0;
    return parseFloat(window.getComputedStyle(document.body).getPropertyValue('--fixbar-h')) || 0;
  }

  /* 要素が画面の中に丸ごと入っているか。下の固定の帯がある間は、その高さを除いた範囲で見る */
  function inFirstView(el) {
    var r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight - fixbarHeight();
  }

  /* 要素を、下の固定の帯を除いた範囲の中央へ送る。範囲より高い物は上端を画面の上端に合わせる */
  function toCenter(el) {
    var r = el.getBoundingClientRect();
    var room = window.innerHeight - fixbarHeight();
    window.scrollBy(0, Math.floor(r.top - Math.max(0, (room - r.height) / 2)));
  }

  /* ---------- 下の固定の帯（幅640以下） ---------- */

  var NARROW = window.matchMedia ? window.matchMedia('(max-width: 640px)') : null;
  var fixWatch = null;

  function btnOf(x) {
    if (!x || x.nodeType !== 1) return null;
    if (x.btn) return x.btn;
    return x.matches('.btn') ? x : x.querySelector('.btn');
  }

  /* 幅640以下では、見出しの右の操作のうち押せる物（主の物を先に選び、多くて2つ）を本文の後ろの帯に移す。
     帯は画面の下に固定し、本文の下に帯の高さの余白を取る。幅641以上では見出しの右に戻す */
  function placeActions() {
    var content = document.getElementById('content');
    if (!content) return;
    var body = document.body;
    var active = document.activeElement;
    var bar = content.querySelector('.page-head .actionbar');
    var old = null;
    for (var i = 0; i < content.children.length; i++) {
      if (content.children[i].classList.contains('fixbar')) old = content.children[i];
    }
    if (bar && !bar._items) bar._items = Array.prototype.slice.call(bar.childNodes);
    if (old) {
      if (bar) bar._items.forEach(function (x) { bar.appendChild(x); });
      content.removeChild(old);
    }
    if (fixWatch) { fixWatch.disconnect(); fixWatch = null; }
    var main = [];
    if (bar && NARROW && NARROW.matches) {
      var on = bar._items.filter(function (x) { var b = btnOf(x); return b && !b.disabled; });
      var isMain = function (x) { return btnOf(x).classList.contains('btn-primary'); };
      var pick = on.filter(isMain).concat(on.filter(function (x) { return !isMain(x); })).slice(0, 2);
      main = on.filter(function (x) { return pick.indexOf(x) >= 0; });
    }
    body.classList.toggle('has-fixbar', main.length > 0);
    if (main.length) {
      var fix = App.h('div', { class: 'fixbar', role: 'group', 'aria-label': '主な操作' }, main);
      content.appendChild(fix);
      var setH = function () {
        body.style.setProperty('--fixbar-h', fix.offsetHeight + 'px');
        document.documentElement.style.setProperty('--fixbar-h', fix.offsetHeight + 'px');
      };
      setH();
      if (window.ResizeObserver) {
        fixWatch = new window.ResizeObserver(setH);
        fixWatch.observe(fix);
      }
    } else {
      body.style.removeProperty('--fixbar-h');
      document.documentElement.style.removeProperty('--fixbar-h');
    }
    if (active && active !== document.activeElement && content.contains(active)) {
      try { active.focus({ preventScroll: true }); } catch (e) { active.focus(); }
    }
  }

  /* ---------- 外枠（役割の1行、切り替え、メニュー） ---------- */

  function drawShell(def) {
    var role = App.role();
    var line = document.getElementById('viewas');
    if (line) line.textContent = ROLE_LINE[role];
    var seg = document.getElementById('role-seg');
    if (seg) {
      if (!seg.children.length) {
        ROLES.forEach(function (r) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = ROLE_NAME[r];
          b.setAttribute('data-role', r);
          b.addEventListener('click', function () {
            if (r === App.role()) return;
            askLeave().then(function (yes) {
              if (!yes) return;
              App.setRole(r);
              draw(false);
            });
          });
          seg.appendChild(b);
        });
      }
      Array.prototype.forEach.call(seg.children, function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-role') === role ? 'true' : 'false');
      });
    }
    var menu = def === undefined ? null : (def && def.menu) || (current.route ? current.route.segs[0] : '');
    if (def !== undefined) {
      Array.prototype.forEach.call(document.querySelectorAll('.nav a[data-menu]'), function (a) {
        if (a.getAttribute('data-menu') === menu) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    }
  }

  function setupShell() {
    var company = document.getElementById('company');
    if (company) {
      var m = /^(.*?)(（[^（）]*）)$/.exec(settings.companyLabel);
      /* 括弧の前の「株式会社」（株式会社で終わらない名称は末尾2文字）と括弧を1行に保つ */
      var tail = m ? (/株式会社$/.test(m[1]) ? 4 : 2) : 0;
      company.textContent = m ? m[1].slice(0, -tail) : settings.companyLabel;
      if (m) append(company, App.h('span', { class: 'nw' }, m[1].slice(-tail) + m[2]));
    }
    var base = document.getElementById('base-date');
    if (base) base.textContent = '基準日 ' + settings.baseDate;
    var btn = document.querySelector('.menu-btn');
    var nav = document.querySelector('.nav');
    if (btn && nav) {
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () {
        var open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    if (nav) {
      nav.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        e.preventDefault();
        nav.classList.remove('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        goTo(a.getAttribute('href'), 'url');
      });
    }
    /* 画面の中の #/ リンクもルーターを通す */
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href^="#/"]') : null;
      if (!a || (nav && nav.contains(a))) return;
      e.preventDefault();
      /* 知らせのリンクが今の画面を指すときは、移動せず data-focus-op の押せるボタンへフォーカスを移す（知らせは残す） */
      var op = a.getAttribute('data-focus-op');
      var content = document.getElementById('content');
      if (op && content && App.parseHash(normHash(a.getAttribute('href'))).path.join('/') === App.parseHash().path.join('/')) {
        var target = content.querySelector('button[data-op="' + op + '"]:not([disabled])');
        if (target) { target.focus({ focusVisible: true }); return; }
      }
      /* 一覧の行のリンクは行を選ぶ操作、そのほかのリンクは URL の指定で開く移動 */
      goTo(a.getAttribute('href'), a.classList.contains('row-link') ? 'row' : 'url');
    });
  }

  App.start = function () {
    loadData();
    setupShell();
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('beforeprint', function () { printLabels(true); });
    window.addEventListener('afterprint', function () { printLabels(false); });
    var PRINT = window.matchMedia ? window.matchMedia('print') : null;
    if (PRINT && PRINT.addEventListener) PRINT.addEventListener('change', function (e) { printLabels(e.matches); });
    if (NARROW) {
      if (NARROW.addEventListener) NARROW.addEventListener('change', placeActions);
      else if (NARROW.addListener) NARROW.addListener(placeActions);
    }
    window.addEventListener('beforeunload', function (e) {
      if (!dirty) return undefined;
      e.preventDefault();
      e.returnValue = '';
      return '';
    });
    route(true);
  };

  /* ---------- 金額の計算 ---------- */

  function D() { return App.data(); }
  function ordersOf(kno) { return D().orders.filter(function (o) { return o.kouji === kno; }); }
  function inspOf(ono) { return D().inspections.filter(function (i) { return i.order === ono; }); }
  function invOf(ono) { return D().invoices.filter(function (v) { return v.order === ono; }); }
  function nos(list) { return list.map(function (x) { return x.no; }); }
  function joinNos(list) { return list.join('、'); }
  /* 理由に並べる番号は3件まで。残りは「ほか n件」にする */
  function fewNos(list) {
    return list.length > 3 ? list.slice(0, 3).join('、') + ' ほか ' + (list.length - 3) + '件' : list.join('、');
  }

  App.orderKind = function (o) {
    o = rec('orders', o);
    if (!o) return '';
    return num(o.amount) < 0 ? '減額' : (o.related ? '追加' : '通常');
  };

  /* 有効発注額: 発注金額＋その発注を対象にした承認済の減額発注の和 */
  function eff(o) {
    var red = D().orders.filter(function (r) { return r.related === o.no && num(r.amount) < 0 && r.status === '承認済'; });
    return num(o.amount) + sum(red, function (r) { return r.amount; });
  }
  function cum(no) { return sum(inspOf(no).filter(function (i) { return i.status === '有効'; }), function (i) { return i.amount; }); }
  function confirmedOf(no) { return sum(invOf(no).filter(function (v) { return v.status === '確認済'; }), function (v) { return v.amount; }); }
  function remaining(o) { return o.status === '打切' || o.status === '取消' ? 0 : eff(o) - cum(o.no); }

  function budgetOf(k, cat) {
    var b = num(k.budget0 ? k.budget0[cat] : 0);
    D().revisions.forEach(function (r) {
      if (r.kouji === k.no && r.cat === cat && r.status === '承認済') b += num(r.after) - num(r.before);
    });
    return b;
  }

  function laborOf(kno) {
    return D().labor.filter(function (l) { return l.kouji === kno && l.recordedOn; });
  }

  /* 発注済: 承認済と検収済の有効発注額＋打切の累計。労務費は計上額の累計 */
  function committedOf(k, cat) {
    if (cat === '労務費') return sum(laborOf(k.no), function (l) { return l.amount; });
    var s = 0;
    ordersOf(k.no).forEach(function (o) {
      if (o.cat !== cat || num(o.amount) < 0) return;
      if (o.status === '承認済' || o.status === '検収済') s += eff(o);
      else if (o.status === '打切') s += cum(o.no);
    });
    return s;
  }

  function incurredOf(k, cat) {
    if (cat === '労務費') return committedOf(k, cat);
    return sum(ordersOf(k.no).filter(function (o) { return o.cat === cat && num(o.amount) > 0; }),
      function (o) { return cum(o.no); });
  }

  function bookedOf(k, cat) {
    if (cat === '労務費') return committedOf(k, cat);
    return sum(ordersOf(k.no).filter(function (o) { return o.cat === cat && num(o.amount) > 0; }),
      function (o) { return confirmedOf(o.no); });
  }

  function ratio(a, b) { return num(b) ? num(a) / num(b) : null; }

  App.calc = {};

  App.calc.kouji = function (k) {
    k = rec('kouji', k);
    if (!k) return null;
    var rows = CATS.map(function (cat) {
      var r = {
        cat: cat,
        budget0: k.budget0 ? k.budget0[cat] : null,
        budget: budgetOf(k, cat),
        committed: committedOf(k, cat),
        incurred: incurredOf(k, cat),
        booked: bookedOf(k, cat)
      };
      r.remain = r.budget - r.committed;
      r.rate = ratio(r.committed, r.budget);
      r.over = r.committed > r.budget;
      return r;
    });
    var total = { cat: '合計' };
    ['budget0', 'budget', 'committed', 'incurred', 'booked', 'remain'].forEach(function (f) {
      total[f] = sum(rows, function (r) { return r[f]; });
    });
    total.rate = ratio(total.committed, total.budget);
    total.over = total.committed > total.budget;
    var byCat = {};
    rows.forEach(function (r) { byCat[r.cat] = r; });
    var contract = k.contract === null || k.contract === undefined ? null : num(k.contract);
    return {
      no: k.no,
      rows: rows,
      byCat: byCat,
      total: total,
      contract: contract,
      profit: contract === null ? null : contract - total.incurred,
      overCats: rows.filter(function (r) { return r.over; }).map(function (r) { return r.cat; }),
      over: rows.some(function (r) { return r.over; })
    };
  };

  function fixState(no) {
    var text = '';
    var pending = false;
    D().history.forEach(function (h) {
      if (h.target !== no) return;
      if (h.op === '修正依頼') { text = h.reason || ''; pending = true; }
      else if (h.op === '再提出') pending = false;
    });
    return { text: text, pending: pending };
  }

  App.calc.hacchu = function (h) {
    var o = rec('orders', h);
    if (!o) return null;
    var kind = App.orderKind(o);
    var red = kind === '減額';
    var e = red ? null : eff(o);
    var c = red ? 0 : cum(o.no);
    var f = fixState(o.no);
    var fixPending = o.status === '起票' && f.pending;
    var rel = D().orders.filter(function (r) { return r.related === o.no; });
    var partial = !red && o.status === '承認済' && c > 0 && c < e;
    var committed = 0;
    if (!red && (o.status === '承認済' || o.status === '検収済')) committed = e;
    else if (!red && o.status === '打切') committed = c;
    return {
      no: o.no,
      kind: kind,
      eff: e,
      cum: c,
      committed: committed,
      remain: red ? 0 : remaining(o),
      confirmed: red ? 0 : confirmedOf(o.no),
      uninvoiced: red ? 0 : c - confirmedOf(o.no),
      partial: partial,
      statusLabel: partial ? '承認済（一部検収）' : o.status,
      fixText: fixPending ? f.text : '',
      fixPending: fixPending,
      additions: nos(rel.filter(function (r) { return num(r.amount) > 0; })),
      reductions: nos(rel.filter(function (r) { return num(r.amount) < 0; }))
    };
  };

  App.orderStatusLabel = function (o) {
    var c = App.calc.hacchu(o);
    return c ? c.statusLabel : '';
  };

  /* ---------- 支払予定日 ---------- */

  function termsOf(t) {
    if (!t) return null;
    if (typeof t === 'object') return t;
    var all = settings.terms || TERMS;
    if (Array.isArray(all)) return all.filter(function (x) { return x.name === t; })[0] || TERMS[t] || null;
    return all[t] || TERMS[t] || null;
  }

  App.calcPayDate = function (seikyu, torihikisaki) {
    var v = rec('invoices', seikyu);
    if (!v || !v.invoiceDate) return null;
    var p = rec('partners', torihikisaki || v.partner);
    var t = termsOf(p ? p.terms : null);
    if (!t) return null;
    var d = String(v.invoiceDate).slice(0, 10);
    var m = d.slice(0, 7);
    if (num(t.closeDay) && +d.slice(8, 10) > num(t.closeDay)) m = App.addMonths(m, 1);
    var pm = App.addMonths(m, num(t.months));
    return num(t.payDay) ? pm + '-' + pad(num(t.payDay), 2) : App.monthEnd(pm);
  };

  App.isOverdue = function (seikyu) {
    var v = rec('invoices', seikyu);
    if (!v || v.status !== '確認済') return false;
    var d = App.calcPayDate(v);
    return !!d && d < settings.baseDate;
  };

  App.calc.torihikisaki = function (t) {
    var p = rec('partners', t);
    if (!p) return null;
    var committed = 0;
    D().orders.forEach(function (o) {
      if (o.partner !== p.code || num(o.amount) < 0) return;
      if (o.status === '承認済' || o.status === '検収済') committed += eff(o);
      else if (o.status === '打切') committed += cum(o.no);
    });
    var conf = D().invoices.filter(function (v) { return v.partner === p.code && v.status === '確認済'; });
    var next = null;
    var overdue = [];
    conf.forEach(function (v) {
      var d = App.calcPayDate(v, p);
      if (!d) return;
      if (d < settings.baseDate) overdue.push(v.no);
      if (!next || d < next) next = d;
    });
    return {
      code: p.code,
      committed: committed,
      scheduled: sum(conf, function (v) { return v.amount; }),
      nextPayDate: next,
      nextPayAmount: next ? sum(conf.filter(function (v) { return App.calcPayDate(v, p) === next; }), function (v) { return v.amount; }) : 0,
      overdue: overdue,
      orders: nos(D().orders.filter(function (o) { return o.partner === p.code; }))
    };
  };

  /* 月の数字: 検収日がその月の有効な発注検収（訂正の負の額を含む）、その月の計上済の労務費、計上月がその月の確認済の請求と、そのうちの過月分 */
  App.calc.month = function (month) {
    var m = App.monthOf(month);
    var kenshu = sum(D().inspections.filter(function (i) { return i.status === '有効' && App.monthOf(i.date) === m; }),
      function (i) { return i.amount; });
    var labor = sum(D().labor.filter(function (l) { return l.month === m && l.recordedOn; }), function (l) { return l.amount; });
    var booked = D().invoices.filter(function (v) { return v.status === '確認済' && v.bookMonth === m; });
    var late = booked.filter(function (v) { return App.isLateInvoice(v); });
    return {
      month: m,
      kenshu: kenshu,
      labor: labor,
      seikyu: sum(booked, function (v) { return v.amount; }),
      overdueCount: late.length,
      overdueAmount: sum(late, function (v) { return v.amount; })
    };
  };

  /* 役割ごとの待ちの項目。修正依頼は App.calc.hacchu、予算超過は App.can('order.approve')、締めは App.openMonths の判定をそのまま使う */
  App.waiting = function (role) {
    role = role || App.role();
    function item(key, label, rows, href) { return { key: key, label: label, count: rows.length, rows: rows, href: href }; }
    function single(rows, prefix, id, other) { return rows.length === 1 ? prefix + rows[0][id] : other; }
    if (role === 'eigyo') {
      return [item('kouji_estimating', '見積中の工事', D().kouji.filter(function (k) { return k.status === '見積中'; }), '#/kouji?status=見積中')];
    }
    if (role === 'tanto') {
      var fix = D().orders.filter(function (o) { return App.calc.hacchu(o).fixPending; });
      return [item('hacchu_fix', '修正依頼を受けた発注', fix, single(fix, '#/hacchu/', 'no', null))];
    }
    if (role === 'kobai') {
      var wait = D().orders.filter(function (o) { return o.status === '起票' && !App.calc.hacchu(o).fixPending; }).map(function (o) {
        var k = App.find('kouji', o.kouji);
        var b = App.can('order.approve', { order: o.no, role: 'kobai' }).budget;
        return {
          no: o.no, kouji: o.kouji, koujiName: k ? k.name : '',
          torihikisaki: o.partner, torihikisakiName: App.partnerName(o.partner),
          amount: o.amount, over: !!(b && b.over)
        };
      });
      return [item('hacchu_approve', '承認を待つ発注', wait, null)];
    }
    if (role === 'keiri') {
      var inv = D().invoices.filter(function (v) { return v.status === '受付'; });
      var now = App.monthOf(App.today());
      var months = App.openMonths().filter(function (m) { return m < now; }).sort().map(function (m) { return { month: m }; });
      return [
        item('seikyu_received', '受付のままの請求', inv, '#/seikyu'),
        item('month_to_close', '締めを待つ月', months, single(months, '#/shime/', 'month', '#/shime'))
      ];
    }
    return [];
  };

  /* ---------- 予算超過 ---------- */

  App.budgetOver = function (kouji, himoku, addAmount) {
    var k = rec('kouji', kouji);
    if (!k) return null;
    var budget = budgetOf(k, himoku);
    var committed = committedOf(k, himoku);
    var add = num(addAmount);
    return {
      over: committed + add > budget,
      budget: budget,
      committed: committed,
      remain: budget - committed,
      after: budget - committed - add
    };
  };

  /* ---------- 請求の判定（上から順に見て最初に当たった物） ---------- */

  App.judge = function (seikyu) {
    var v = rec('invoices', seikyu);
    if (!v) return null;
    var dup = D().invoices.filter(function (w) {
      if (w === v || w.no === v.no) return false;
      if (w.order === v.order && w.status === '受付') return true;
      return w.partner === v.partner && w.invoiceNo === v.invoiceNo && w.status !== '取消' && w.status !== '差戻し';
    });
    if (dup.length) {
      return {
        label: '二重の疑い', ok: false, related: nos(dup),
        reason: fewNos(nos(dup)) + ' との二重の疑いがあるため確認できません',
        fix: ['請求書の現物と照らして、正本を決めます。',
          '正本でない方を取り消します。理由が必要です。',
          '正本の判定が「確定できる」になったら確認済にします。']
      };
    }
    var valid = inspOf(v.order).filter(function (i) { return i.status === '有効'; });
    if (!valid.length) {
      return {
        label: '発注検収なし', ok: false, related: [v.order],
        reason: '発注検収が無いため確認できません',
        fix: ['発注 ' + v.order + ' の発注検収が済むまで確認できません。発注検収は工事担当か購買が登録します。',
          '届く先を誤った請求書なら、差し戻して取引先へ返却します。理由が必要です。']
      };
    }
    var can = cum(v.order) - confirmedOf(v.order);
    if (num(v.amount) > can) {
      return {
        label: '検収額を超えている', ok: false, related: [v.order], limit: can,
        reason: '請求額が確認できる額の ' + App.fmt.yen(can) + '円を超えているため確認できません',
        fix: ['確認できる額は ' + App.fmt.yen(can) + '円です（発注検収の累計 − 確認済の請求額）。',
          '残りの発注検収を待つか、差し戻して正しい額の請求書を出し直してもらいます。']
      };
    }
    return { label: '確定できる', ok: true, related: [], reason: '', fix: [] };
  };

  /* ---------- 月次の締め ---------- */

  function monthRow(m) { return App.find('months', m); }

  App.months = function () { return D().months.map(function (m) { return m.month; }); };

  App.isClosedMonth = function (yyyymm) {
    var m = App.monthOf(yyyymm);
    var list = D().months;
    if (!m || !list.length) return false;
    if (m < list[0].month) return true;
    var r = monthRow(m);
    return !!r && r.status === '締め済';
  };

  App.closedMonths = function () { return App.months().filter(App.isClosedMonth); };
  App.openMonths = function () { return App.months().filter(function (m) { return !App.isClosedMonth(m); }); };
  App.firstOpenMonth = function () { return App.openMonths()[0] || null; };

  /* 締め済の月の日付なら理由の文を返す。未締めなら空文字 */
  App.closedDateReason = function (date) {
    var m = App.monthOf(date);
    if (!m || !App.isClosedMonth(m)) return '';
    var open = App.firstOpenMonth();
    return m + ' は締め済のため入れられません。' + (open ? open + ' 以後の日付にします。' : '');
  };

  App.laborTargets = function (month) {
    var ms = month + '-01', me = App.monthEnd(month);
    return D().kouji.filter(function (k) {
      return k.startOn && k.startOn <= me && (!k.clientInspectOn || k.clientInspectOn >= ms);
    }).map(function (k) { return k.no; });
  };

  App.closeCheck = function (month) {
    var items = [], warnings = [];
    function block(kind, text) { items.push({ kind: kind, text: text }); }
    var r = monthRow(month);
    var prev = App.addMonths(month, -1);
    if (!r) block('other', month + ' は締めの対象の月ではありません');
    else if (r.status === '締め済') block('other', month + ' は締め済です');
    if (App.monthEnd(month) >= settings.baseDate) block('other', month + ' の末日が過ぎていません');
    if (!App.isClosedMonth(prev)) block('other', '前の月（' + prev + '）が締め済ではありません');
    var waiting = D().invoices.filter(function (v) { return v.status === '受付' && App.monthOf(v.invoiceDate) <= month; });
    if (waiting.length) block('seikyu', '受付のままの請求があります（' + fewNos(nos(waiting)) + '）');
    var missing = App.laborTargets(month).filter(function (kno) {
      var l = App.find('labor', kno, month);
      return !l || !l.recordedOn;
    });
    if (missing.length) block('labor', '労務費が計上されていない工事があります（' + fewNos(missing) + '）');
    var reasons = items.map(function (x) { return x.text; });
    var me = App.monthEnd(month);
    var late = D().orders.filter(function (o) {
      return num(o.amount) > 0 && o.status === '承認済' && o.due && o.due <= me && remaining(o) > 0;
    });
    if (late.length) warnings.push('納期を過ぎて未検収の発注があります（' + joinNos(nos(late)) + '）');
    var drafts = D().orders.filter(function (o) { return o.status === '起票'; });
    if (drafts.length) warnings.push('起票のままの発注が ' + drafts.length + '件あります（締めの対象外）');
    return {
      ok: !reasons.length, reasons: reasons, items: items, warnings: warnings,
      waiting: nos(waiting), laborMissing: missing, lateOrders: nos(late), draftOrders: nos(drafts)
    };
  };

  /* 締めを止めている理由を種類で分ける。seikyu と labor は件数、other は理由の文の配列 */
  function closeBlocks(cc) {
    var b = { seikyu: 0, labor: 0, other: [] };
    cc.items.forEach(function (x) {
      if (x.kind === 'seikyu') b.seikyu = cc.waiting.length;
      else if (x.kind === 'labor') b.labor = cc.laborMissing.length;
      else b.other.push(x.text);
    });
    return b;
  }

  App.reopenCheck = function (month) {
    var reasons = [];
    var r = monthRow(month);
    if (!r || r.status !== '締め済') reasons.push(month + ' は締め済ではありません');
    else if (r.carryover) reasons.push(month + ' は期首の繰越の月のため解除できません');
    if (App.isClosedMonth(App.addMonths(month, 1)) && monthRow(App.addMonths(month, 1))) {
      reasons.push('後の月（' + App.addMonths(month, 1) + '）が締め済のため解除できません');
    }
    return { ok: !reasons.length, reasons: reasons };
  };

  /* 確認のときに選べる計上月: 未締めで、請求書の日付の月以後、確認日の月以前 */
  App.bookMonths = function (seikyu, confirmDate) {
    var v = rec('invoices', seikyu);
    var today = confirmDate || settings.baseDate;
    var from = App.monthOf(v.invoiceDate), to = App.monthOf(today);
    var options = App.openMonths().filter(function (m) { return m >= from && m <= to; });
    var def = App.monthOf(v.receivedOn || today);
    if (App.isClosedMonth(def)) def = App.firstOpenMonth();
    if (options.indexOf(def) < 0) def = options[0] || null;
    var skipped = App.closedMonths().filter(function (m) { return m >= from && m <= to; });
    return {
      options: options,
      def: def,
      skipped: skipped,
      note: skipped.length ? skipped.join('、') + ' は締め済のため選べません。' : ''
    };
  };

  App.isLateInvoice = function (seikyu, bookMonth) {
    var v = rec('invoices', seikyu);
    if (!v) return false;
    var im = App.monthOf(v.invoiceDate);
    var bm = bookMonth || v.bookMonth;
    return !!bm && App.isClosedMonth(im) && bm > im;
  };

  /* ---------- 入力の読み取りと誤り ---------- */

  var DATE_MSG = '日付は 2026-09-08 の形で入れてください';

  function given(input, key) { return !!input && has(input, key); }

  function readText(input, key, errors, label, opt) {
    opt = opt || {};
    var v = input[key] === null || input[key] === undefined ? '' : String(input[key]).trim();
    if (!v && opt.required) errors[key] = label + (opt.select ? 'を選んでください' : 'を入れてください');
    else if (opt.max && v.length > opt.max) errors[key] = label + 'は' + opt.max + '字までです';
    return v;
  }

  function readYen(input, key, errors, label, opt) {
    opt = opt || {};
    var v = input[key];
    if (typeof v !== 'number') v = App.parse.yen(v);
    if (v === null) {
      if (opt.required) errors[key] = label + 'を入れてください';
      return null;
    }
    if (isNaN(v)) { errors[key] = label + 'は数字で入れてください'; return null; }
    if (opt.min !== undefined && v < opt.min) errors[key] = label + 'は' + App.fmt.yen(opt.min) + '円以上にします';
    return v;
  }

  function readDate(input, key, errors, label, opt) {
    opt = opt || {};
    var v = input[key];
    v = v ? App.parse.date(v) : null;
    if (v === null) {
      if (opt.required) errors[key] = label + 'を入れてください';
      return null;
    }
    if (v === false) { errors[key] = DATE_MSG; return null; }
    if (opt.notAfterToday && v > settings.baseDate) {
      errors[key] = '基準日（' + settings.baseDate + '）より後の日付は入れられません';
    } else if (opt.from && v < opt.from) {
      errors[key] = label + 'は' + opt.fromLabel + '（' + opt.from + '）以後にします';
    } else if (opt.open) {
      var why = App.closedDateReason(v);
      if (why) errors[key] = why;
    }
    return v;
  }

  /* errors は {項目名: 文}。一括の操作では行ごとの [{kouji, field, message}] の配列 */
  function firstError(errors) {
    if (Array.isArray(errors)) return errors.length ? errors[0].message + (errors[0].kouji ? '（' + errors[0].kouji + '）' : '') : '';
    var k = Object.keys(errors || {});
    return k.length ? errors[k[0]] : '';
  }

  function errorCount(errors) { return Array.isArray(errors) ? errors.length : Object.keys(errors).length; }

  function verdict(reasons, errors, extra) {
    errors = errors || {};
    var r = {
      ok: !reasons.length && !errorCount(errors),
      reason: reasons[0] || firstError(errors),
      reasons: reasons,
      errors: errors
    };
    if (extra) Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
    return r;
  }

  /* ---------- 役割の権限 ---------- */

  var WHO = {
    'kouji.register': [['eigyo'], '工事の登録は営業のみ'],
    'kouji.edit': [['eigyo'], '基本情報の編集は営業のみ'],
    'kouji.win': [['eigyo'], '受注にするのは営業のみ'],
    'kouji.start': [['tanto'], '着工の登録は工事担当のみ'],
    'kouji.handover': [['tanto'], '施主検収の登録は工事担当のみ'],
    'kouji.bill': [['keiri'], '施主への請求は経理のみ'],
    'kouji.complete': [['keiri'], '完了にするのは経理のみ'],
    'revision.draft': [['tanto'], '予算改定の起案は工事担当のみ'],
    'revision.approve': [['eigyo'], '予算改定の承認は営業のみ'],
    'revision.cancel': [['eigyo', 'tanto'], '予算改定の取消は営業か工事担当のみ'],
    'order.draft': [['tanto'], '発注の起票は工事担当のみ'],
    'order.add': [['tanto'], '発注の起票は工事担当のみ'],
    'order.reduce': [['tanto'], '発注の起票は工事担当のみ'],
    'order.edit': [['tanto'], '発注の修正は工事担当のみ'],
    'order.resubmit': [['tanto'], '再提出は工事担当のみ'],
    'order.approve': [['kobai'], '承認は購買のみ'],
    'order.requestFix': [['kobai'], '修正依頼は購買のみ'],
    'order.terminate': [['kobai'], '打切は購買のみ'],
    'inspection.register': [['tanto', 'kobai'], '発注検収の登録は工事担当か購買のみ'],
    'inspection.cancel': [['tanto', 'kobai'], '発注検収の取消は工事担当か購買のみ'],
    'inspection.correct': [['tanto', 'kobai'], '発注検収の訂正は工事担当か購買のみ'],
    'invoice.receive': [['keiri'], '請求の受付は経理のみ'],
    'invoice.reaccept': [['keiri'], '請求の再受付は経理のみ'],
    'invoice.confirm': [['keiri'], '請求の確認は経理のみ'],
    'invoice.return': [['keiri'], '請求の差戻しは経理のみ'],
    'invoice.cancel': [['keiri'], '請求の取消は経理のみ'],
    'labor.record': [['keiri'], '労務費の計上は経理のみ'],
    'labor.recordMany': [['keiri'], '労務費の計上は経理のみ'],
    'month.close': [['keiri'], '締めは経理のみ'],
    'month.reopen': [['keiri'], '締めの解除は経理のみ'],
    'view.contract': [['eigyo', 'keiri'], '受注金額と粗利は営業と経理だけが見られます'],
    'view.payment': [['kobai', 'keiri'], '支払の情報は購買と経理だけが見られます']
  };

  /* 状態や区分で権限が変わる操作。対象が無いときは行える役割を全部返し、対象の理由を先に出す */
  function whoOf(op, c) {
    if (op === 'kouji.contract') {
      if (!c.k) return [['eigyo', 'keiri'], '受注金額を入れるのは営業（見積中）か経理（受注後）のみ'];
      return c.k.status === '見積中' ? [['eigyo'], '見積中の受注金額は営業が入れます'] : [['keiri'], '受注後の受注金額の変更は経理のみ'];
    }
    if (op === 'kouji.revert') {
      if (!c.k) return [['eigyo', 'keiri'], '状態を戻すのは営業（受注から見積中）か経理のみ'];
      return c.k.status === '受注' ? [['eigyo'], '受注から見積中に戻すのは営業のみ'] : [['keiri'], '状態を戻すのは経理のみ'];
    }
    if (op === 'order.cancel') {
      if (!c.o) return [['tanto', 'kobai'], '発注の取消は工事担当（起票）か購買（承認済）のみ'];
      return c.o.status === '起票' ? [['tanto'], '起票のままの発注の取消は工事担当のみ'] : [['kobai'], '承認済の発注の取消は購買のみ'];
    }
    if (op === 'partner.register' || op === 'partner.edit') {
      var kind = c.kind || (c.p && c.p.kind);
      if (kind === '施主') return [['eigyo'], '施主の登録と編集は営業のみ'];
      if (kind) return [['kobai'], '仕入先と外注先の登録と編集は購買のみ'];
      return [['eigyo', 'kobai'], '取引先の登録は営業（施主）か購買（仕入先と外注先）のみ'];
    }
    return WHO[op] || null;
  }

  function context(ctx) {
    ctx = ctx || {};
    var c = {
      role: ctx.role || App.role(),
      k: rec('kouji', ctx.kouji),
      o: rec('orders', ctx.order),
      i: rec('inspections', ctx.inspection),
      v: rec('invoices', ctx.invoice),
      r: rec('revisions', ctx.revision),
      p: rec('partners', ctx.partner),
      src: rec('orders', ctx.moto),
      m: ctx.month || '',
      kind: ctx.kind || '',
      ask: ctx
    };
    if (c.i && !c.o) c.o = App.find('orders', c.i.order);
    if (c.v && !c.o) c.o = App.find('orders', c.v.order);
    if (c.o && !c.src && c.o.related) c.src = App.find('orders', c.o.related);
    if (!c.k) {
      var kno = c.o ? c.o.kouji : c.src ? c.src.kouji : c.r ? c.r.kouji : null;
      if (kno) c.k = App.find('kouji', kno);
    }
    return c;
  }

  /* 対象が無いときの理由。番号を渡して該当が無ければ「〜が見つかりません」、渡していなければ「〜を選んでください」 */
  var K_KOUJI = ['kouji', 'order', 'moto', 'revision', 'inspection', 'invoice'];
  var K_ORDER = ['order', 'inspection', 'invoice'];
  function asked(c, keys) {
    var a = c.ask || {};
    return keys.some(function (k) { return !blank(a[k]); });
  }
  function lack(c, keys, label) { return label + (asked(c, keys) ? 'が見つかりません' : 'を選んでください'); }
  function noTarget(t) { return /(を選んでください|が見つかりません)$/.test(t); }

  /* 行えない役割に出す理由。今の状態では誰も行えないときは状態の理由、選ぶ前か該当が無いときと状態で止まらないときは役割の理由 */
  function roleOrState(reasons, roleReason) { return reasons.length && !noTarget(reasons[0]) ? reasons : [roleReason]; }

  /* 予算改定を渡していないとき。工事に起案の改定が無ければ none（「〜はありません」）を返す */
  function noRevision(c, none) {
    var a = c.ask || {};
    if (!blank(a.revision) && typeof a.revision !== 'object') return '予算改定が見つかりません';
    if (!c.k) return asked(c, ['kouji']) ? '工事が見つかりません' : '予算改定を選んでください';
    var open = D().revisions.some(function (r) { return r.kouji === c.k.no && r.status === '起案'; });
    return open ? '予算改定を選んでください' : none;
  }

  /* ---------- 工事の状態 ---------- */

  var STEPS = {
    '見積中': { to: '受注', op: 'kouji.win', label: '受注にする', date: 'contractOn', prev: null },
    '受注': { to: '施工中', op: 'kouji.start', label: '着工する', date: 'startOn', prev: 'contractOn' },
    '施工中': { to: '検収済', op: 'kouji.handover', label: '施主検収を登録する', date: 'clientInspectOn', prev: 'startOn' },
    '検収済': { to: '請求済', op: 'kouji.bill', label: '施主に請求する', date: 'clientBillOn', prev: 'clientInspectOn' },
    '請求済': { to: '完了', op: 'kouji.complete', label: '完了にする', date: 'paidOn', prev: 'clientBillOn' }
  };
  var BACK = {
    '完了': { to: '請求済', clears: ['paidOn'] },
    '請求済': { to: '検収済', clears: ['clientBillOn', 'clientBillAmount'] },
    '検収済': { to: '施工中', clears: ['clientInspectOn'] },
    '施工中': { to: '受注', clears: ['startOn'] },
    '受注': { to: '見積中', clears: ['contract', 'contractOn'] }
  };
  var LABEL = {
    contractOn: '受注日', startOn: '着工日', clientInspectOn: '施主検収日', clientBillOn: '施主請求日',
    clientBillAmount: '請求額', paidOn: '入金日', contract: '受注金額'
  };
  App.FIELD_LABEL = LABEL;

  function issueText(label, list) { return label + '（' + fewNos(list) + '）'; }

  /* 完了にする条件。満たしていない物を番号付きで返す */
  App.canComplete = function (kouji) {
    var k = rec('kouji', kouji);
    var groups = {}, order = [];
    function add(label, no) {
      if (!groups[label]) { groups[label] = []; order.push(label); }
      if (groups[label].indexOf(no) < 0) groups[label].push(no);
    }
    ordersOf(k.no).forEach(function (o) {
      if (num(o.amount) < 0) {
        if (o.status === '起票') add('起票のままの減額発注', o.no);
        return;
      }
      if (['検収済', '取消', '打切'].indexOf(o.status) < 0) add('発注検収が済んでいない発注', o.no);
      if (cum(o.no) !== confirmedOf(o.no)) add('発注検収の累計と確認済の請求額が合わない発注', o.no);
      invOf(o.no).forEach(function (v) { if (v.status === '受付') add('受付のままの請求', v.no); });
    });
    var issues = order.map(function (l) { return { label: l, nos: groups[l] }; });
    return {
      ok: !issues.length,
      issues: issues,
      reasons: issues.map(function (x) { return issueText(x.label, x.nos); })
    };
  };

  App.canRevert = function (kouji, role) {
    var k = rec('kouji', kouji);
    var b = BACK[k.status];
    if (!b) return verdict(['見積中より前には戻せません'], null, { from: k.status, to: null, clears: [] });
    var c = { k: k, role: role || App.role() };
    var who = whoOf('kouji.revert', c);
    var clears = b.clears.map(function (f) { return { field: f, label: LABEL[f], value: k[f] }; });
    var extra = { from: k.status, to: b.to, clears: clears, roles: who[0] };
    var reasons = [];
    var own = ordersOf(k.no);
    if (k.status === '受注') {
      if (own.length) reasons.push(issueText('発注がある工事は見積中に戻せません', nos(own)));
      var revs = D().revisions.filter(function (r) { return r.kouji === k.no && r.status !== '取消'; });
      if (revs.length) reasons.push(issueText('予算改定がある工事は見積中に戻せません', nos(revs)));
    }
    if (k.status === '施工中') {
      var ins = [], invs = [];
      own.forEach(function (o) {
        inspOf(o.no).forEach(function (i) { if (i.status === '有効') ins.push(i.no); });
        invOf(o.no).forEach(function (v) { if (v.status === '確認済') invs.push(v.no); });
      });
      var lab = laborOf(k.no).map(function (l) { return l.month; });
      if (ins.length) reasons.push(issueText('有効な発注検収があります', ins));
      if (invs.length) reasons.push(issueText('確認済の請求があります', invs));
      if (lab.length) reasons.push(issueText('計上済の労務費があります', lab));
    }
    if (who[0].indexOf(c.role) < 0) return verdict(roleOrState(reasons, who[1]), null, extra);
    return verdict(reasons, null, extra);
  };

  /* 工事の次の状態。input を渡すと入力の誤りも判定する */
  App.transition = function (kouji, input, role) {
    var k = rec('kouji', kouji);
    var s = STEPS[k.status];
    if (!s) return verdict(['完了の工事に進める先はありません'], null, { from: k.status, to: null, op: '', label: '', fields: [] });
    var c = { k: k, role: role || App.role() };
    var who = whoOf(s.op, c);
    var today = settings.baseDate;
    var fields = [];
    if (s.op === 'kouji.win') fields.push({ name: 'contract', label: '受注金額', type: 'yen', value: k.contract !== null && k.contract !== undefined ? k.contract : k.estimate, required: true });
    fields.push({ name: s.date, label: LABEL[s.date], type: 'date', value: today, required: true });
    if (s.op === 'kouji.bill') fields.push({ name: 'clientBillAmount', label: '請求額', type: 'yen', value: k.contract, required: true });
    var extra = { from: k.status, to: s.to, op: s.op, label: s.label, fields: fields, roles: who[0] };
    var reasons = [];
    if (s.op === 'kouji.win') {
      if (!k.manager) reasons.push('工事担当が入っていません。基本情報を編集で入れます');
      var miss = CATS.filter(function (cat) { return k.budget0[cat] === null || k.budget0[cat] === undefined || k.budget0[cat] === ''; });
      if (miss.length) reasons.push('実行予算（当初）の ' + miss.join('、') + ' が入っていません');
    }
    if (s.op === 'kouji.complete') reasons = reasons.concat(App.canComplete(k).reasons);
    if (who[0].indexOf(c.role) < 0) return verdict(roleOrState(reasons, who[1]), null, extra);
    var errors = {};
    if (input) {
      if (s.op === 'kouji.win') readYen(input, 'contract', errors, '受注金額', { required: true, min: 1 });
      if (s.op === 'kouji.bill') readYen(input, 'clientBillAmount', errors, '請求額', { required: true, min: 1 });
      readDate(input, s.date, errors, LABEL[s.date], {
        required: true, notAfterToday: true, from: s.prev ? k[s.prev] : null, fromLabel: s.prev ? LABEL[s.prev] : ''
      });
    }
    return verdict(reasons, errors, extra);
  };

  /* ---------- 操作の定義: 判定（check）と保存（apply） ---------- */

  App.KOUJI_KINDS = ['空調', '給排水', '衛生', '電気', '消防', '改修'];
  App.INSPECTION_KINDS = ['納品', '出来高', '完了'];
  App.PARTNER_KINDS = ['施主', '仕入先', '外注先'];
  var ALLOWED = { '材料費': ['仕入先'], '外注費': ['外注先'], '経費': ['仕入先', '外注先'] };
  App.ALLOWED = ALLOWED;
  var OPEN_KOUJI = '起票できるのは受注か施工中の工事だけ';

  var OPS = {};
  function defOp(name, check, apply, rowErrors) { OPS[name] = { check: check, apply: apply, rowErrors: !!rowErrors }; }

  function actor(c) { return App.user(c.role); }

  function hist(c, target, op, before, after, reason, related) {
    var u = actor(c);
    return App.addHistory({
      user: u.name, role: u.role, target: target, op: op,
      before: before, after: after, reason: reason, related: related
    });
  }

  function done(no, message, next, fix, links) { return { no: no, message: message, next: next || '', fix: fix || '', links: links || [] }; }
  function empRole(id) { var e = id ? App.find('employees', id) : null; return e ? e.role : ''; }
  function yenOf(v) { return typeof v === 'number' ? v : App.parse.yen(v); }
  function isOpenKouji(k) { return !!k && (k.status === '受注' || k.status === '施工中'); }

  /* 変えた項目だけを変更前と変更後に分ける */
  function diff(list) {
    var before = {}, after = {}, n = 0;
    list.forEach(function (x) {
      if (x.from === x.to || (blank(x.from) && blank(x.to))) return;
      before[x.label] = blank(x.from) ? null : x.from;
      after[x.label] = blank(x.to) ? null : x.to;
      n++;
    });
    return { before: before, after: after, count: n };
  }

  function showValue(name, v) {
    if (blank(v)) return null;
    if (name === 'client' || name === 'partner') return App.partnerName(v);
    if (name === 'sales' || name === 'manager') return App.empName(v);
    return v;
  }

  /* ---------- 工事の基本情報 ---------- */

  function koujiSpec() {
    var list = [
      { name: 'name', label: '工事名', type: 'text', required: true, max: 40 },
      { name: 'client', label: '施主', type: 'select', required: true },
      { name: 'site', label: '工事場所', type: 'text', required: true, max: 60 },
      { name: 'kind', label: '工事種別', type: 'select', required: true },
      { name: 'sales', label: '営業担当', type: 'select', required: true },
      { name: 'manager', label: '工事担当', type: 'select' },
      { name: 'estimate', label: '見積金額', type: 'yen', required: true, min: 1 },
      { name: 'contract', label: '受注金額', type: 'yen', min: 1, early: true }
    ];
    CATS.forEach(function (cat) {
      list.push({ name: 'budget0.' + cat, label: '実行予算（当初）' + cat, type: 'yen', min: 0, early: true, cat: cat });
    });
    list.push({ name: 'planStart', label: '着工予定日', type: 'date', required: true });
    list.push({ name: 'planEnd', label: '完工予定日', type: 'date', required: true });
    list.push({ name: 'note', label: '備考', type: 'textarea', max: 200 });
    return list;
  }

  function koujiOptions(name, current) {
    var d = D();
    if (name === 'client') {
      return d.partners.filter(function (p) { return p.kind === '施主' && (p.status !== '停止' || p.code === current); })
        .map(function (p) { return { value: p.code, label: p.name }; });
    }
    if (name === 'kind') return App.KOUJI_KINDS.map(function (x) { return { value: x, label: x }; });
    var role = name === 'sales' ? '営業' : '工事担当';
    return d.employees.filter(function (e) { return e.role === role; }).map(function (e) { return { value: e.id, label: e.name }; });
  }

  var LATE_EDIT = ['manager', 'planEnd', 'note'];

  /* 基本情報のダイアログで扱う項目。kouji を省くと登録の項目 */
  App.koujiFields = function (kouji) {
    var k = rec('kouji', kouji);
    var st = k ? k.status : '見積中';
    return koujiSpec().filter(function (f) { return !f.early || st === '見積中'; }).map(function (f) {
      var v;
      if (f.cat) v = k ? k.budget0[f.cat] : 0;
      else if (k) v = k[f.name];
      else v = f.name === 'sales' && App.role() === 'eigyo' ? App.user('eigyo').id : null;
      var editable = st === '見積中' || st === '受注' || LATE_EDIT.indexOf(f.name) >= 0;
      var out = {
        name: f.name, label: f.label, type: f.type, required: !!f.required || (f.name === 'manager' && !!k && st !== '見積中'),
        value: v === undefined ? null : v, editable: editable, lockReason: editable ? '' : '施工中以後は 工事担当、完工予定日、備考 だけ編集できます'
      };
      if (f.max) out.max = f.max;
      if (f.min !== undefined) out.min = f.min;
      if (f.type === 'yen') out.unit = '円';
      if (f.type === 'select') out.options = koujiOptions(f.name, v);
      return out;
    });
  };

  function readKouji(c, input, errors) {
    var inp = Object.assign({}, input);
    if (inp.budget0 && typeof inp.budget0 === 'object') {
      CATS.forEach(function (cat) { if (has(inp.budget0, cat)) inp['budget0.' + cat] = inp.budget0[cat]; });
    }
    var vals = {}, list = [];
    App.koujiFields(c.k).forEach(function (f) {
      if (!f.editable || (c.k && !given(inp, f.name))) return;
      var v;
      if (f.type === 'yen') v = readYen(inp, f.name, errors, f.label, { required: f.required, min: f.min });
      else if (f.type === 'date') v = readDate(inp, f.name, errors, f.label, { required: f.required });
      else v = readText(inp, f.name, errors, f.label, { required: f.required, select: f.type === 'select', max: f.max }) || null;
      if (v && f.name === 'client') {
        var p = App.find('partners', v);
        if (!p || p.kind !== '施主') errors.client = '施主は区分が施主の取引先から選びます';
      }
      if (v && f.name === 'sales' && empRole(v) !== '営業') errors.sales = '営業担当は営業の社員から選びます';
      if (!v && f.name === 'manager' && f.required) errors.manager = '受注以後の工事では工事担当は必須です';
      if (v && f.name === 'manager' && empRole(v) !== '工事担当') errors.manager = '工事担当は工事担当の社員から選びます';
      if (v && f.name === 'kind' && App.KOUJI_KINDS.indexOf(v) < 0) errors.kind = '工事種別は ' + App.KOUJI_KINDS.join('、') + ' から選びます';
      vals[f.name] = v;
      var from = c.k ? (f.name.indexOf('budget0.') === 0 ? c.k.budget0[f.name.slice(8)] : c.k[f.name]) : null;
      list.push({ label: f.label, from: showValue(f.name, from), to: showValue(f.name, v) });
    });
    var ps = has(vals, 'planStart') ? vals.planStart : (c.k ? c.k.planStart : null);
    if (vals.planEnd && ps && vals.planEnd < ps && !errors.planEnd) {
      errors.planEnd = '完工予定日は着工予定日（' + ps + '）以後にします';
    }
    return { values: vals, changes: diff(list) };
  }

  var REGISTER_ORDER = ['name', 'client', 'site', 'kind', 'sales', 'manager', 'estimate', 'planStart', 'planEnd',
    'budget0.材料費', 'budget0.外注費', 'budget0.労務費', 'budget0.経費', 'contract', 'note'];

  defOp('kouji.register', function (c, input, reasons, errors) {
    return input ? readKouji({ k: null, role: c.role }, input, errors) : {};
  }, function (c, v) {
    var x = v.values;
    var no = App.nextNumber('kouji');
    var budget = {};
    CATS.forEach(function (cat) { budget[cat] = has(x, 'budget0.' + cat) ? x['budget0.' + cat] : null; });
    D().kouji.push({
      no: no, name: x.name, client: x.client, site: x.site, kind: x.kind, status: '見積中', sales: x.sales,
      manager: x.manager || null, estimate: x.estimate, contract: has(x, 'contract') ? x.contract : null, budget0: budget,
      contractOn: null, planStart: x.planStart, planEnd: x.planEnd, startOn: null, clientInspectOn: null,
      clientBillOn: null, clientBillAmount: null, paidOn: null, note: x.note || ''
    });
    var labels = {};
    koujiSpec().forEach(function (f) { labels[f.name] = f.label; });
    var after = {};
    REGISTER_ORDER.forEach(function (n) {
      if (!has(x, n) || (blank(x[n]) && (n === 'manager' || n === 'contract' || n === 'note'))) return;
      after[labels[n]] = showValue(n, x[n]);
    });
    hist(c, no, '登録', null, after);
    return done(no, '工事 ' + no + ' を登録しました。', '', '直すときは工事詳細の「基本情報を編集」で直します。');
  });

  defOp('kouji.edit', function (c, input, reasons, errors) {
    if (!c.k) { reasons.push(lack(c, K_KOUJI, '工事')); return {}; }
    if (!input) return {};
    var r = readKouji(c, input, errors);
    if (!r.changes.count && !Object.keys(errors).length) reasons.push('変えた項目はありません');
    return r;
  }, function (c, v) {
    var k = c.k;
    Object.keys(v.values).forEach(function (n) {
      if (n.indexOf('budget0.') === 0) k.budget0[n.slice(8)] = v.values[n];
      else k[n] = n === 'note' ? (v.values[n] || '') : v.values[n];
    });
    hist(c, k.no, '変更', v.changes.before, v.changes.after);
    return done(k.no, '工事 ' + k.no + ' の基本情報を保存しました。', '', '直すときは「基本情報を編集」で直します。変更前の値は履歴にあります。');
  });

  defOp('kouji.contract', function (c, input, reasons, errors) {
    if (!c.k) { reasons.push(lack(c, K_KOUJI, '工事')); return {}; }
    if (c.k.status === '完了') reasons.push('完了の工事の受注金額は変えられません');
    if (!input) return {};
    var a = readYen(input, 'contract', errors, '受注金額', { required: true, min: 1 });
    if (a !== null && !errors.contract && a === c.k.contract) errors.contract = '今の受注金額と同じです';
    readText(input, 'reason', errors, '理由', { required: c.k.status !== '見積中', max: 200 });
    return { value: a };
  }, function (c, v, input) {
    var k = c.k, old = k.contract;
    k.contract = v.value;
    hist(c, k.no, '変更', { '受注金額': old }, { '受注金額': v.value }, String(input.reason || '').trim());
    return done(k.no, '工事 ' + k.no + ' の受注金額を ' + App.fmt.yen(v.value) + '円にしました。', '', '変更前の額は履歴に残っています。');
  });

  /* ---------- 工事の状態を進める、戻す ---------- */

  var STEP_TEXT = {
    'kouji.win': ['受注にできるのは見積中の工事だけ', 'を受注にしました。', '次は工事担当が発注を起票し、着工を登録します。'],
    'kouji.start': ['着工を登録できるのは受注の工事だけ', 'を施工中にしました。', '次は工事担当が発注検収と施主検収を登録します。'],
    'kouji.handover': ['施主検収を登録できるのは施工中の工事だけ', 'の施主検収を登録しました。', '次は経理が施主に請求します。'],
    'kouji.bill': ['施主に請求できるのは検収済の工事だけ', 'の施主への請求を登録しました。', '入金を確かめたら、経理が完了にします。'],
    'kouji.complete': ['完了にできるのは請求済の工事だけ', 'を完了にしました。', '']
  };
  var STEP_FIX = '戻すときは経理が「状態を1つ戻す」で戻します。';
  var WIN_FIX = '戻すときは営業が「状態を1つ戻す」で見積中に戻します。';
  var STEP_FROM = {};
  Object.keys(STEPS).forEach(function (st) { STEP_FROM[STEPS[st].op] = st; });

  Object.keys(STEP_TEXT).forEach(function (op) {
    defOp(op, function (c, input, reasons, errors) {
      if (!c.k) { reasons.push(lack(c, K_KOUJI, '工事')); return {}; }
      if (c.k.status !== STEP_FROM[op]) { reasons.push(STEP_TEXT[op][0]); return {}; }
      var t = App.transition(c.k, input, c.role);
      t.reasons.forEach(function (r) { reasons.push(r); });
      Object.keys(t.errors).forEach(function (f) { errors[f] = t.errors[f]; });
      return { from: t.from, to: t.to, label: t.label, fields: t.fields };
    }, function (c, v, input) {
      var k = c.k, s = STEPS[k.status], from = k.status;
      var after = { '状態': s.to };
      if (op === 'kouji.win') {
        k.contract = yenOf(input.contract);
        after['受注金額'] = k.contract;
      }
      k[s.date] = App.parse.date(input[s.date]);
      after[LABEL[s.date]] = k[s.date];
      if (op === 'kouji.bill') {
        k.clientBillAmount = yenOf(input.clientBillAmount);
        after['請求額'] = k.clientBillAmount;
      }
      k.status = s.to;
      hist(c, k.no, '状態を進める', { '状態': from }, after);
      var links = op === 'kouji.win'
        ? [{ label: '発注の登録へ', href: App.link(['hacchu', 'new'], { kouji: k.no }), op: 'order.draft', ctx: { kouji: k.no } }] : [];
      return done(k.no, '工事 ' + k.no + ' ' + STEP_TEXT[op][1], STEP_TEXT[op][2], op === 'kouji.win' ? WIN_FIX : STEP_FIX, links);
    });
  });

  defOp('kouji.revert', function (c, input, reasons, errors) {
    if (!c.k) { reasons.push(lack(c, K_KOUJI, '工事')); return {}; }
    var t = App.canRevert(c.k, c.role);
    t.reasons.forEach(function (r) { reasons.push(r); });
    if (input) readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    return { from: t.from, to: t.to, clears: t.clears };
  }, function (c, v, input) {
    var k = c.k, b = BACK[k.status];
    var before = { '状態': k.status }, after = { '状態': b.to };
    b.clears.forEach(function (f) {
      before[LABEL[f]] = blank(k[f]) ? null : k[f];
      after[LABEL[f]] = null;
      k[f] = null;
    });
    k.status = b.to;
    hist(c, k.no, '状態を戻す', before, after, String(input.reason).trim());
    return done(k.no, '工事 ' + k.no + ' を' + b.to + 'に戻しました。', '消した値は履歴に残っています。');
  });

  /* ---------- 予算改定 ---------- */

  defOp('revision.draft', function (c, input, reasons, errors) {
    if (!c.k) { reasons.push(lack(c, K_KOUJI, '工事')); return {}; }
    if (!isOpenKouji(c.k)) reasons.push('予算改定を起案できるのは受注か施工中の工事だけ');
    if (!input) return {};
    var extra = {};
    var cat = readText(input, 'cat', errors, '費目', { required: true, select: true });
    if (cat && CATS.indexOf(cat) < 0) errors.cat = '費目は ' + CATS.join('、') + ' から選びます';
    var after = readYen(input, 'after', errors, '改定後の額', { required: true, min: 0 });
    readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    if (cat && !errors.cat) {
      var open = D().revisions.filter(function (r) { return r.kouji === c.k.no && r.cat === cat && r.status === '起案'; });
      if (open.length) errors.cat = 'この費目には起案のままの予算改定があります（' + joinNos(nos(open)) + '）';
      extra.before = budgetOf(c.k, cat);
      if (after !== null && !errors.after && after === extra.before) errors.after = '改定前の額と同じです';
    }
    extra.values = { cat: cat, after: after };
    return extra;
  }, function (c, v, input) {
    var k = c.k, u = actor(c), x = v.values;
    var no = App.nextNumber('revision', k.no);
    var reason = String(input.reason).trim();
    D().revisions.push({
      no: no, kouji: k.no, cat: x.cat, before: v.before, after: x.after, reason: reason, drafter: u.id,
      draftedOn: settings.baseDate, status: '起案', approver: null, revisedOn: null, cancelReason: null
    });
    hist(c, no, '予算改定の起案', null, { '費目': x.cat, '改定前の額': v.before, '改定後の額': x.after }, reason);
    return done(no, '予算改定 ' + no + ' を起案しました。', '次は営業が承認します。', '取り下げるときは取り消します。');
  });

  defOp('revision.approve', function (c, input, reasons) {
    if (!c.r || !c.r.no) { reasons.push(noRevision(c, '承認を待つ予算改定はありません')); return {}; }
    if (c.r.status !== '起案') reasons.push('承認できるのは起案の予算改定だけ');
    return {};
  }, function (c) {
    var r = c.r, u = actor(c);
    r.status = '承認済';
    r.approver = u.id;
    r.revisedOn = settings.baseDate;
    hist(c, r.no, '予算改定の承認', { '状態': '起案' }, { '状態': '承認済', '改定日': r.revisedOn }, r.reason);
    return done(r.no, '予算改定 ' + r.no + ' を承認しました。', '工事 ' + c.k.no + ' の' + r.cat + 'の予算は ' + App.fmt.yen(budgetOf(c.k, r.cat)) + '円になりました。');
  });

  defOp('revision.cancel', function (c, input, reasons, errors) {
    if (!c.r || !c.r.no) { reasons.push(noRevision(c, '取り消せる予算改定はありません')); return {}; }
    if (c.r.status !== '起案') reasons.push('取り消せるのは起案のままの予算改定だけ');
    if (input) readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    return {};
  }, function (c, v, input) {
    var r = c.r;
    r.status = '取消';
    r.cancelReason = String(input.reason).trim();
    hist(c, r.no, '取消', { '状態': '起案' }, { '状態': '取消' }, r.cancelReason);
    return done(r.no, '予算改定 ' + r.no + ' を取り消しました。', '改定し直すときは工事担当が起案し直します。');
  });

  /* ---------- 発注 ---------- */

  function partnerError(p, cat) {
    if (!p) return '取引先を選んでください';
    if (p.kind === '施主') return '発注先は仕入先か外注先から選びます';
    if (p.status !== '取引中') return '取引が停止の取引先は選べません';
    if (cat && ALLOWED[cat] && ALLOWED[cat].indexOf(p.kind) < 0) return cat + 'で選べる取引先は' + ALLOWED[cat].join('か') + 'です';
    return '';
  }

  /* 費目に合う取引先の選択肢。停止の取引先は今の値のときだけ残す */
  App.partnerOptions = function (cat, current) {
    return D().partners.filter(function (p) {
      if (p.kind === '施主') return false;
      if (cat && ALLOWED[cat] && ALLOWED[cat].indexOf(p.kind) < 0) return false;
      return p.status === '取引中' || p.code === current;
    }).map(function (p) { return { value: p.code, label: p.name + '（' + p.kind + '）', print: p.name }; });
  };

  function budgetCheck(c, cat, amount, overReason, errors, extra) {
    if (!c.k || !cat || amount === null || amount === undefined || isNaN(amount) || amount <= 0) return;
    extra.budget = App.budgetOver(c.k, cat, amount);
    if (extra.budget.over && !overReason && !errors.overReason) {
      errors.overReason = '予算の残りを超えるため、理由を入れてください';
    }
  }

  /* 通常と追加の発注の入力。src があれば取引先と費目は元の発注のまま */
  function readNewOrder(c, input, errors, src) {
    var x = {};
    if (src) {
      x.partner = src.partner;
      x.cat = src.cat;
    } else {
      x.cat = readText(input, 'cat', errors, '費目', { required: true, select: true });
      if (x.cat && ORDER_CATS.indexOf(x.cat) < 0) errors.cat = '費目は ' + ORDER_CATS.join('、') + ' から選びます';
      x.partner = readText(input, 'partner', errors, '取引先', { required: true, select: true });
      if (x.partner) {
        var pe = partnerError(App.find('partners', x.partner), errors.cat ? '' : x.cat);
        if (pe) errors.partner = pe;
      }
    }
    x.title = readText(input, 'title', errors, '件名', { required: true, max: 40 });
    x.amount = readYen(input, 'amount', errors, '発注金額', { required: true, min: 1 });
    x.due = readDate(input, 'due', errors, '納期', { required: true, from: settings.baseDate, fromLabel: '起票日' });
    x.overReason = readText(input, 'overReason', errors, '予算超過の理由', { max: 200 }) || null;
    x.note = readText(input, 'note', errors, '備考', { max: 200 });
    var extra = { values: x };
    if (!errors.cat && !errors.amount) budgetCheck(c, x.cat, x.amount, x.overReason, errors, extra);
    return extra;
  }

  function approveLink(no) {
    return [{ label: '承認へ', href: App.hrefOf(no), op: 'order.approve', ctx: { order: no } }];
  }

  function addOrder(c, x, src) {
    var no = App.nextNumber('order', c.k.no);
    var u = actor(c);
    D().orders.push({
      no: no, kouji: c.k.no, related: src ? src.no : null, partner: x.partner, cat: x.cat, title: x.title,
      amount: x.amount, due: x.due || null, status: '起票', overReason: x.overReason || null, drafter: u.id,
      draftedOn: settings.baseDate, approver: null, orderedOn: null, cancelReason: null, note: x.note || ''
    });
    var after = { '件名': x.title, '取引先': App.partnerName(x.partner), '費目': x.cat, '発注金額': x.amount };
    if (x.due) after['納期'] = x.due;
    hist(c, no, '登録', null, after, x.overReason || '', src ? src.no : '');
    var word = src ? (x.amount < 0 ? '減額発注' : '追加発注') : '発注';
    return done(no, word + ' ' + no + ' を起票しました。', '次は購買が承認します。', '直すときは発注の詳細で直します。', approveLink(no));
  }

  /* 発注の状態の呼び名（「打切済の発注」の形） */
  var ORDER_STATE = { '取消': '取消済', '打切': '打切済' };
  function orderState(o) { return (ORDER_STATE[o.status] || o.status) + 'の発注'; }

  function srcPartnerStopped(src, reasons) {
    var p = App.find('partners', src.partner);
    if (p && p.status !== '取引中') reasons.push('元の発注の取引先は取引が停止のため起票できません');
  }

  defOp('order.draft', function (c, input, reasons, errors) {
    if (!c.k) { reasons.push(lack(c, K_KOUJI, '工事')); return {}; }
    if (!isOpenKouji(c.k)) reasons.push(OPEN_KOUJI);
    return input ? readNewOrder(c, input, errors, null) : {};
  }, function (c, v) { return addOrder(c, v.values, null); });

  defOp('order.add', function (c, input, reasons, errors) {
    var s = c.src;
    if (!s) { reasons.push(lack(c, ['moto', 'order'], '元の発注')); return {}; }
    if (App.orderKind(s) !== '通常' || (s.status !== '承認済' && s.status !== '検収済')) {
      reasons.push('追加発注は承認済か検収済の通常の発注から起票します');
    }
    if (!isOpenKouji(c.k)) reasons.push(OPEN_KOUJI);
    srcPartnerStopped(s, reasons);
    return input ? readNewOrder(c, input, errors, s) : {};
  }, function (c, v) { return addOrder(c, v.values, c.src); });

  defOp('order.reduce', function (c, input, reasons, errors) {
    var s = c.src;
    if (!s) { reasons.push(lack(c, ['moto', 'order'], '元の発注')); return {}; }
    if (num(s.amount) <= 0 || s.status !== '承認済') reasons.push('減額発注は承認済の発注から起票します');
    if (!isOpenKouji(c.k)) reasons.push(OPEN_KOUJI);
    srcPartnerStopped(s, reasons);
    var rem = remaining(s);
    var extra = { remain: rem };
    if (!input) return extra;
    var x = { partner: s.partner, cat: s.cat, due: null, overReason: null };
    x.title = readText(input, 'title', errors, '件名', { required: true, max: 40 });
    var a = readYen(input, 'amount', errors, '減らす額', { required: true });
    if (a !== null && !errors.amount) {
      a = Math.abs(a);
      if (a < 1) errors.amount = '減らす額は1円以上にします';
      else if (a > rem) errors.amount = '減らせるのは元の発注の未検収残（' + App.fmt.yen(rem) + '円）までです';
      x.amount = -a;
    }
    x.note = readText(input, 'note', errors, '備考', { max: 200 });
    extra.values = x;
    return extra;
  }, function (c, v) { return addOrder(c, v.values, c.src); });

  var AMOUNT_LOCK = '承認後は金額を変えられません。増やすときは追加発注、減らすときは減額発注を起票します';
  var REDUCE_LOCK = '承認後は金額を変えられません。さらに減らすときは別の減額発注、戻すときは追加発注を起票します';

  /* 発注の詳細で直せる項目。editable が false の項目は lockReason を横に出す */
  App.orderFields = function (hacchu) {
    var o = rec('orders', hacchu);
    if (!o) return [];
    var kind = App.orderKind(o);
    var spec = [
      { name: 'partner', label: '取引先', type: 'select', required: true },
      { name: 'cat', label: '費目', type: 'select', required: true },
      { name: 'title', label: '件名', type: 'text', required: true, max: 40 },
      { name: 'amount', label: kind === '減額' ? '減らす額' : '発注金額', type: 'yen', required: true },
      { name: 'due', label: '納期', type: 'date', required: kind !== '減額' },
      { name: 'overReason', label: '予算超過の理由', type: 'textarea', max: 200 },
      { name: 'note', label: '備考', type: 'textarea', max: 200 }
    ];
    return spec.map(function (f) {
      var lock = '';
      if (o.status === '取消' || o.status === '打切') lock = '取消と打切の後は編集できません';
      else if (f.name === 'note') lock = '';
      else if ((f.name === 'partner' || f.name === 'cat') && kind !== '通常') lock = '追加発注と減額発注の取引先と費目は元の発注と同じです';
      else if (kind === '減額' && (f.name === 'due' || f.name === 'overReason')) lock = '減額発注には' + f.label + 'を入れません';
      else if (f.name === 'due') lock = o.status === '起票' || o.status === '承認済' ? '' : '納期は承認済まで直せます';
      else if (o.status !== '起票') {
        if (f.name === 'amount') lock = kind === '減額' ? REDUCE_LOCK : AMOUNT_LOCK;
        else lock = '承認後は' + f.label + 'を変えられません';
      }
      var v = f.name === 'amount' && kind === '減額' ? -num(o.amount) : o[f.name];
      var out = {
        name: f.name, label: f.label, type: f.type, required: f.required, value: blank(v) ? null : v,
        editable: !lock, lockReason: lock
      };
      if (f.max) out.max = f.max;
      if (f.type === 'yen') out.unit = '円';
      if (f.name === 'partner') out.options = App.partnerOptions(o.cat, o.partner);
      if (f.name === 'cat') out.options = ORDER_CATS.map(function (x) { return { value: x, label: x }; });
      return out;
    });
  };

  function readOrderEdit(c, input, errors) {
    var o = c.o, red = num(o.amount) < 0;
    var x = {}, list = [];
    App.orderFields(o).forEach(function (f) {
      if (!f.editable || !given(input, f.name)) return;
      var v;
      if (f.name === 'amount') {
        v = readYen(input, 'amount', errors, f.label, { required: true, min: red ? undefined : 1 });
        if (red && v !== null && !errors.amount) {
          var rem = remaining(c.src);
          v = Math.abs(v);
          if (v < 1) errors.amount = '減らす額は1円以上にします';
          else if (v > rem) errors.amount = '減らせるのは元の発注の未検収残（' + App.fmt.yen(rem) + '円）までです';
          v = -v;
        }
      } else if (f.type === 'date') {
        v = readDate(input, f.name, errors, f.label, { required: f.required, from: o.draftedOn, fromLabel: '起票日' });
      } else {
        v = readText(input, f.name, errors, f.label, { required: f.required, select: f.type === 'select', max: f.max }) || null;
      }
      x[f.name] = v;
      list.push({ label: f.label === '減らす額' ? '発注金額' : f.label, from: showValue(f.name, o[f.name]), to: showValue(f.name, v) });
    });
    var cat = has(x, 'cat') ? x.cat : o.cat;
    if (has(x, 'cat') && cat && ORDER_CATS.indexOf(cat) < 0) errors.cat = '費目は ' + ORDER_CATS.join('、') + ' から選びます';
    if ((has(x, 'partner') || has(x, 'cat')) && !errors.partner && !errors.cat) {
      var pe = partnerError(App.find('partners', has(x, 'partner') ? x.partner : o.partner), cat);
      if (pe) errors.partner = pe;
    }
    var extra = { values: x, changes: diff(list) };
    if (o.status === '起票' && !red && !errors.amount && !errors.cat) {
      budgetCheck(c, cat, has(x, 'amount') ? x.amount : o.amount, has(x, 'overReason') ? x.overReason : o.overReason, errors, extra);
    }
    return extra;
  }

  function saveOrderEdit(c, v, op) {
    var o = c.o;
    Object.keys(v.values).forEach(function (n) { o[n] = n === 'note' ? (v.values[n] || '') : v.values[n]; });
    hist(c, o.no, op, v.changes.before, v.changes.after);
  }

  defOp('order.edit', function (c, input, reasons, errors) {
    if (!c.o) { reasons.push(lack(c, K_ORDER, '発注')); return {}; }
    if (c.o.status === '取消' || c.o.status === '打切') reasons.push('取消と打切の後は編集できません');
    if (!input) return {};
    var r = readOrderEdit(c, input, errors);
    if (!r.changes.count && !Object.keys(errors).length) reasons.push('変えた項目はありません');
    return r;
  }, function (c, v) {
    saveOrderEdit(c, v, '変更');
    return done(c.o.no, '発注 ' + c.o.no + ' を保存しました。', '', '直すときは発注の詳細で直します。変更前の値は履歴にあります。');
  });

  defOp('order.resubmit', function (c, input, reasons, errors) {
    if (!c.o) { reasons.push(lack(c, K_ORDER, '発注')); return {}; }
    if (c.o.status !== '起票' || !fixState(c.o.no).pending) reasons.push('再提出できるのは修正依頼を受けた起票の発注だけ');
    if (!input) return {};
    var r = readOrderEdit(c, input, errors);
    if (!r.changes.count && !Object.keys(errors).length) reasons.push('変えた項目はありません。修正依頼に合わせて直してから再提出します');
    return r;
  }, function (c, v) {
    saveOrderEdit(c, v, '再提出');
    return done(c.o.no, '発注 ' + c.o.no + ' を再提出しました。', '次は購買が承認します。', '直すときは発注の詳細で直します。', approveLink(c.o.no));
  });

  defOp('order.approve', function (c, input, reasons) {
    var o = c.o;
    if (!o) { reasons.push(lack(c, K_ORDER, '発注')); return {}; }
    if (o.status !== '起票') { reasons.push('承認できるのは起票の発注だけ'); return {}; }
    var extra = {};
    if (num(o.amount) > 0) {
      extra.budget = App.budgetOver(c.k, o.cat, o.amount);
      if (extra.budget.over && !o.overReason) {
        reasons.push('承認の時点で予算を超えますが、予算超過の理由がありません。修正依頼で戻します');
      }
    } else {
      var s = c.src;
      extra.remain = s ? remaining(s) : 0;
      if (!s || s.status !== '承認済') reasons.push('元の発注が承認済でないため承認できません');
      else if (-num(o.amount) > extra.remain) {
        reasons.push('減らす額が元の発注の未検収残（' + App.fmt.yen(extra.remain) + '円）を超えるため承認できません');
      }
    }
    return extra;
  }, function (c, v) {
    var o = c.o, u = actor(c);
    var over = num(o.amount) > 0 && v.budget && v.budget.over;
    o.status = '承認済';
    o.approver = u.id;
    o.orderedOn = settings.baseDate;
    var after = { '状態': '承認済', '発注日': o.orderedOn };
    var msg = '発注 ' + o.no + ' を承認しました。';
    var next = '次は工事担当か購買が発注検収を登録します。';
    var links = [{ label: '発注検収へ', href: App.link(['kenshu'], { hacchu: o.no }), op: 'inspection.register', ctx: { order: o.no } }];
    if (num(o.amount) < 0) {
      var s = App.find('orders', o.related);
      after['元の発注の有効発注額'] = eff(s);
      if (cum(s.no) >= eff(s)) {
        s.status = '検収済';
        after['元の発注の状態'] = '検収済';
      }
      msg += '元の発注 ' + s.no + ' の有効発注額は ' + App.fmt.yen(eff(s)) + '円になりました。';
      next = '';
      links = [];
    }
    hist(c, o.no, '承認', { '状態': '起票' }, after, over ? o.overReason : '', o.related || '');
    return done(o.no, msg, next, '', links);
  });

  defOp('order.requestFix', function (c, input, reasons, errors) {
    if (!c.o) { reasons.push(lack(c, K_ORDER, '発注')); return {}; }
    if (c.o.status !== '起票') reasons.push('修正を依頼できるのは起票の発注だけ');
    if (input) readText(input, 'reason', errors, '依頼の文言', { required: true, max: 200 });
    return {};
  }, function (c, v, input) {
    hist(c, c.o.no, '修正依頼', null, null, String(input.reason).trim());
    return done(c.o.no, '発注 ' + c.o.no + ' に修正を依頼しました。', '次は工事担当が直して再提出します。', '依頼が要らなくなったときは、そのまま承認できます。');
  });

  defOp('order.cancel', function (c, input, reasons, errors) {
    var o = c.o;
    if (!o) { reasons.push(lack(c, K_ORDER, '発注')); return {}; }
    if (o.status === '承認済' && num(o.amount) > 0) {
      var ins = inspOf(o.no).filter(function (i) { return i.status === '有効'; });
      if (ins.length) {
        var stop = App.can('order.terminate', { order: o.no, role: c.role }).ok ? '。未検収残は打切で止めます' : '';
        reasons.push('有効な発注検収があるため取り消せません（' + fewNos(nos(ins)) + '）' + stop);
      }
      var invs = invOf(o.no).filter(function (x) { return x.status === '受付' || x.status === '確認済'; });
      if (invs.length) reasons.push('受付か確認済の請求があるため取り消せません（' + fewNos(nos(invs)) + '）');
    } else if (o.status !== '起票') {
      reasons.push(o.status === '承認済' ? '承認済の減額発注は取り消せません' : orderState(o) + 'は取り消せません');
    }
    if (input) readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    return {};
  }, function (c, v, input) {
    var o = c.o, prev = o.status;
    o.status = '取消';
    o.cancelReason = String(input.reason).trim();
    hist(c, o.no, '取消', { '状態': prev }, { '状態': '取消' }, o.cancelReason);
    return done(o.no, '発注 ' + o.no + ' を取り消しました。', '発注し直すときは工事担当が起票し直します。');
  });

  defOp('order.terminate', function (c, input, reasons, errors) {
    var o = c.o;
    if (!o) { reasons.push(lack(c, K_ORDER, '発注')); return {}; }
    var e = num(o.amount) > 0 ? eff(o) : 0, cc = cum(o.no);
    if (num(o.amount) <= 0) reasons.push('減額発注は打ち切れません');
    else if (o.status !== '承認済') reasons.push(orderState(o) + 'は打ち切れません');
    else if (!(cc > 0 && cc < e)) reasons.push('打切できるのは一部検収の発注だけ');
    var w = invOf(o.no).filter(function (x) { return x.status === '受付'; });
    if (w.length) reasons.push('受付のままの請求があるため打ち切れません（' + fewNos(nos(w)) + '）');
    if (input) readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    return { remain: e - cc };
  }, function (c, v, input) {
    var o = c.o;
    var left = eff(o) - cum(o.no);
    o.status = '打切';
    o.cancelReason = String(input.reason).trim();
    hist(c, o.no, '打切', { '状態': '承認済', '未検収残': left }, { '状態': '打切', '未検収残': 0 }, o.cancelReason);
    return done(o.no, '発注 ' + o.no + ' の未検収残を打ち切りました。', '検収済の ' + App.fmt.yen(cum(o.no)) + '円は発注済と発生原価に残ります。');
  });

  /* ---------- 発注検収 ---------- */

  /* 発注の状態を累計に合わせる。検収済と承認済の間だけ動かし、打切はそのまま */
  function syncOrder(o, after) {
    if (o.status === '承認済' && cum(o.no) >= eff(o)) {
      o.status = '検収済';
      after['発注の状態'] = '検収済';
    } else if (o.status === '検収済' && cum(o.no) < eff(o)) {
      o.status = '承認済';
      after['発注の状態'] = '承認済';
    }
  }

  /* 訂正元の額から、有効な訂正の分を引いた残り */
  function correctable(i) {
    var done0 = sum(D().inspections.filter(function (x) { return x.corrects === i.no && x.status === '有効'; }),
      function (x) { return x.amount; });
    return num(i.amount) + done0;
  }
  App.correctable = function (kenshu) { var i = rec('inspections', kenshu); return i ? correctable(i) : 0; };

  defOp('inspection.register', function (c, input, reasons, errors) {
    var o = c.o;
    if (!o) {
      var waiting = D().orders.some(function (x) { return num(x.amount) > 0 && x.status === '承認済' && remaining(x) > 0; });
      reasons.push(waiting || asked(c, K_ORDER) ? lack(c, K_ORDER, '発注') : '発注検収を待つ発注はありません');
      return {};
    }
    var rem = num(o.amount) > 0 ? remaining(o) : 0;
    if (num(o.amount) <= 0 || o.status !== '承認済') {
      reasons.push(o.status === '検収済' ? '未検収残はありません' : '発注検収を登録できるのは承認済の発注だけ');
    }
    var extra = { remain: rem };
    if (!input) return extra;
    var x = {};
    x.date = readDate(input, 'date', errors, '検収日', {
      required: true, notAfterToday: true, from: o.orderedOn, fromLabel: '発注日', open: true
    });
    var closedWhy = App.closedDateReason(App.parse.date(input.date) || '');
    if (closedWhy && errors.date === closedWhy) errors.date += '締め済の月の分を直すときは、当月の日付で訂正（マイナス額）を登録します。';
    x.amount = readYen(input, 'amount', errors, '検収額', { required: true, min: 1 });
    if (x.amount !== null && !errors.amount && x.amount > rem) {
      errors.amount = '検収額は未検収残（' + App.fmt.yen(rem) + '円）までです';
    }
    x.content = readText(input, 'content', errors, '内容', { required: true, select: true });
    if (x.content && App.INSPECTION_KINDS.indexOf(x.content) < 0) errors.content = '内容は ' + App.INSPECTION_KINDS.join('、') + ' から選びます';
    x.note = readText(input, 'note', errors, '備考', { max: 200 });
    extra.values = x;
    return extra;
  }, function (c, v) {
    var o = c.o, x = v.values, u = actor(c);
    var no = App.nextNumber('inspection', o.no);
    D().inspections.push({
      no: no, order: o.no, date: x.date, amount: x.amount, content: x.content, status: '有効',
      corrects: null, cancelReason: null, registrant: u.id, note: x.note || ''
    });
    var after = { '検収日': x.date, '検収額': x.amount, '内容': x.content };
    syncOrder(o, after);
    hist(c, no, '登録', null, after);
    var fact = o.status === '検収済' ? '発注 ' + o.no + ' は検収済になりました。' : 'この発注の未検収残は ' + App.fmt.yen(remaining(o)) + '円です。';
    var wait = D().invoices.filter(function (w) { return w.order === o.no && w.status === '受付'; })[0];
    var next = wait ? '次は経理が請求 ' + wait.no + ' を確認します。' : '請求が届いたら経理が受け付けます。';
    var links = wait
      ? [{ label: '請求の確認へ', href: App.link(['seikyu'], { focus: wait.no }), op: 'invoice.confirm', ctx: { invoice: wait.no } }]
      : [{ label: '請求の確認へ', href: App.link(['seikyu']), op: 'invoice.receive', ctx: { order: o.no } }];
    return done(no, '発注検収 ' + no + ' を登録しました。' + fact, next, '誤りは取消で直します。', links);
  });

  defOp('inspection.cancel', function (c, input, reasons, errors) {
    var i = c.i, o = c.o;
    if (!i) { reasons.push(lack(c, ['inspection'], '発注検収')); return {}; }
    if (i.status !== '有効') reasons.push('取り消せるのは有効な発注検収だけ');
    else if (['承認済', '検収済', '打切'].indexOf(o.status) < 0) reasons.push('発注が承認済・検収済・打切のどれでもないため取り消せません');
    else if (App.isClosedMonth(i.date)) {
      reasons.push(App.monthOf(i.date) + ' は締め済のため取り消せません。直すときは当月の日付で訂正（マイナス額）を登録します');
    } else if (cum(o.no) - num(i.amount) < confirmedOf(o.no)) {
      reasons.push('取り消すと累計が確認済の請求額（' + App.fmt.yen(confirmedOf(o.no)) + '円）を下回ります');
    } else if (cum(o.no) - num(i.amount) > eff(o)) {
      reasons.push('取り消すと累計が有効発注額（' + App.fmt.yen(eff(o)) + '円）を超えます');
    }
    if (input) readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    return {};
  }, function (c, v, input) {
    var i = c.i;
    i.status = '取消';
    i.cancelReason = String(input.reason).trim();
    var after = { '状態': '取消' };
    syncOrder(c.o, after);
    hist(c, i.no, '取消', { '状態': '有効' }, after, i.cancelReason);
    return done(i.no, '発注検収 ' + i.no + ' を取り消しました。', '正しい額は発注検収の登録で登録し直します。');
  });

  defOp('inspection.correct', function (c, input, reasons, errors) {
    var i = c.i, o = c.o;
    if (!i) { reasons.push(lack(c, ['inspection'], '訂正元の発注検収')); return {}; }
    var rest = correctable(i);
    var room = cum(o.no) - confirmedOf(o.no);
    var left = Math.min(rest, room);
    if (i.status !== '有効' || num(i.amount) <= 0) reasons.push('訂正できるのは有効な発注検収（プラスの額）だけ');
    else if (['承認済', '検収済', '打切'].indexOf(o.status) < 0) reasons.push('発注が承認済・検収済・打切のどれでもないため訂正できません');
    else if (!App.isClosedMonth(i.date)) reasons.push('検収日の月が未締めのため、訂正ではなく取消で直します');
    else if (rest <= 0) reasons.push('訂正元の額は全て訂正済です');
    else if (room <= 0) reasons.push('確認済の請求額が累計と同額のため訂正できません');
    var extra = { left: left };
    if (!input) return extra;
    var x = {};
    x.date = readDate(input, 'date', errors, '検収日', { required: true, notAfterToday: true, open: true });
    var a = readYen(input, 'amount', errors, '訂正する額', { required: true });
    if (a !== null && !errors.amount) {
      a = Math.abs(a);
      if (a < 1) errors.amount = '訂正する額は1円以上にします';
      else if (a > left) errors.amount = '訂正できるのは ' + App.fmt.yen(Math.max(left, 0)) + '円までです';
      x.amount = -a;
    }
    readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    extra.values = x;
    return extra;
  }, function (c, v, input) {
    var i = c.i, o = c.o, x = v.values, u = actor(c);
    var no = App.nextNumber('inspection', o.no);
    var reason = String(input.reason).trim();
    D().inspections.push({
      no: no, order: o.no, date: x.date, amount: x.amount, content: i.content, status: '有効',
      corrects: i.no, cancelReason: null, registrant: u.id, note: ''
    });
    var after = { '検収日': x.date, '検収額': x.amount, '内容': i.content };
    syncOrder(o, after);
    hist(c, no, '訂正', null, after, reason, i.no);
    return done(no, '訂正 ' + no + ' を登録しました（訂正元 ' + i.no + '）。' + App.monthOf(i.date) + ' の数字は変わらず、訂正は ' + App.monthOf(x.date) + ' に入ります。', '', '誤りは取消で直します。');
  });

  /* ---------- 請求 ---------- */

  function receivable(o) { return !!o && num(o.amount) > 0 && ['承認済', '検収済', '打切'].indexOf(o.status) >= 0; }

  /* 請求を受け付けられる発注の選択肢 */
  App.invoiceOrderOptions = function () {
    return D().orders.filter(receivable).map(function (o) {
      return { value: o.no, label: o.no + ' ' + o.title + '（' + App.partnerName(o.partner) + '）' };
    });
  };

  function readInvoice(input, errors, withOrder) {
    var x = {};
    if (withOrder) {
      x.order = readText(input, 'order', errors, '発注番号', { required: true, select: true });
      if (x.order && !receivable(App.find('orders', x.order))) {
        errors.order = '受け付けられるのは承認済・検収済・打切の通常と追加の発注だけ';
      }
    }
    x.invoiceNo = readText(input, 'invoiceNo', errors, '請求書番号', { required: true, max: 30 });
    x.invoiceDate = readDate(input, 'invoiceDate', errors, '請求書の日付', { required: true });
    x.amount = readYen(input, 'amount', errors, '請求額', { required: true, min: 1 });
    x.note = readText(input, 'note', errors, '備考', { max: 200 });
    return x;
  }

  function addInvoice(c, x, orderNo, related) {
    var o = App.find('orders', orderNo);
    var no = App.nextNumber('invoice');
    var v = {
      no: no, order: o.no, partner: o.partner, invoiceNo: x.invoiceNo, invoiceDate: x.invoiceDate, amount: x.amount,
      receivedOn: settings.baseDate, status: '受付', related: related || null, checker: null, checkedOn: null,
      bookMonth: null, cancelReason: null, note: x.note || ''
    };
    D().invoices.push(v);
    var j = App.judge(v);
    hist(c, no, related ? '再受付' : '登録', null,
      { '発注番号': o.no, '請求書番号': x.invoiceNo, '請求書の日付': x.invoiceDate, '請求額': x.amount, '判定': j.label }, '', related || '');
    var r = done(no, '請求 ' + no + ' を「' + j.label + '」と判定して' + (related ? '再び受け付け' : '受け付け') + 'ました。',
      j.ok ? '次は経理が確認して計上月を決めます。' : j.reason + '。直し方の枠に従って片付けます。', '誤りは取消で直します。');
    r.judge = j;
    return r;
  }

  defOp('invoice.receive', function (c, input, reasons, errors) {
    if (!input) return {};
    if (c.o && !has(input, 'order')) input = Object.assign({ order: c.o.no }, input);
    var x = readInvoice(input, errors, true);
    return { values: x };
  }, function (c, v) { return addInvoice(c, v.values, v.values.order, null); });

  defOp('invoice.reaccept', function (c, input, reasons, errors) {
    var old = c.v;
    if (!old) { reasons.push(lack(c, ['invoice'], '元の請求')); return {}; }
    if (old.status !== '差戻し') reasons.push('再受付できるのは差戻しの請求だけ');
    var again = D().invoices.filter(function (w) { return w.related === old.no; });
    if (again.length) reasons.push('この請求は再受付済です（' + fewNos(nos(again)) + '）');
    if (!receivable(c.o)) reasons.push('発注 ' + old.order + ' は請求を受け付けられる状態ではありません');
    return input ? { values: readInvoice(input, errors, false) } : {};
  }, function (c, v) { return addInvoice(c, v.values, c.v.order, c.v.no); });

  defOp('invoice.confirm', function (c, input, reasons, errors) {
    var v = c.v;
    if (!v) { reasons.push(lack(c, ['invoice'], '請求')); return {}; }
    if (v.status !== '受付') { reasons.push('確認できるのは受付の請求だけ'); return {}; }
    var j = App.judge(v);
    var bm = App.bookMonths(v);
    if (!j.ok) reasons.push(j.reason);
    else if (!bm.options.length) reasons.push('選べる計上月はありません。' + bm.note);
    var extra = { judge: j, book: bm, bookMonth: bm.def };
    if (input && given(input, 'bookMonth') && !blank(input.bookMonth)) {
      var m = App.parse.month(input.bookMonth);
      if (!m || bm.options.indexOf(m) < 0) errors.bookMonth = '計上月は ' + (bm.options.join('、') || '（なし）') + ' から選びます';
      else extra.bookMonth = m;
    }
    extra.late = !!extra.bookMonth && App.isLateInvoice(v, extra.bookMonth);
    return extra;
  }, function (c, x) {
    var v = c.v, u = actor(c);
    v.status = '確認済';
    v.checker = u.id;
    v.checkedOn = settings.baseDate;
    v.bookMonth = x.bookMonth;
    hist(c, v.no, '確認', { '状態': '受付' }, { '状態': '確認済', '確認日': v.checkedOn, '計上月': v.bookMonth }, x.late ? '過月分' : '');
    var pay = App.calcPayDate(v);
    return done(v.no, '請求 ' + v.no + '（計上月 ' + v.bookMonth + (x.late ? '、過月分' : '') + '）を確認済にしました。' +
      (pay ? '支払予定日は ' + pay + ' です。' : ''), laborNext(v.bookMonth), '', waitLink(v.bookMonth).concat(closeLink(v.bookMonth)));
  });

  defOp('invoice.return', function (c, input, reasons, errors) {
    if (!c.v) { reasons.push(lack(c, ['invoice'], '請求')); return {}; }
    if (c.v.status !== '受付') reasons.push('差し戻せるのは受付の請求だけ');
    if (input) readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    return {};
  }, function (c, v, input) {
    var x = c.v;
    x.status = '差戻し';
    x.cancelReason = String(input.reason).trim();
    hist(c, x.no, '差戻し', { '状態': '受付' }, { '状態': '差戻し' }, x.cancelReason);
    return done(x.no, '請求 ' + x.no + ' を差し戻しました。', '修正版が届いたら経理が再び受け付けます。', '再受付は差戻しの行から行います。');
  });

  defOp('invoice.cancel', function (c, input, reasons, errors) {
    if (!c.v) { reasons.push(lack(c, ['invoice'], '請求')); return {}; }
    if (c.v.status !== '受付') reasons.push('取り消せるのは受付の請求だけ');
    if (!input) return {};
    readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    var main = readText(input, 'main', errors, '正本の受付番号', { select: true });
    if (main) {
      var w = App.find('invoices', main);
      if (!w || w.no === c.v.no) errors.main = '正本は取り消す請求とは別の受付番号から選びます';
    }
    return { main: main || '' };
  }, function (c, v, input) {
    var x = c.v;
    x.status = '取消';
    x.cancelReason = String(input.reason).trim();
    hist(c, x.no, '取消', { '状態': '受付' }, { '状態': '取消' }, x.cancelReason, v.main);
    return done(x.no, '請求 ' + x.no + ' を取り消しました。', v.main ? '正本は ' + v.main + ' です。正本の判定を見て確認します。' : '取り消した請求は一覧に残ります。');
  });

  /* ---------- 労務費の計上 ---------- */

  App.laborAmount = function (hours, rate) { return Math.floor(Math.round(num(hours) * 2) * num(rate) / 2); };

  /* その月に施工中だった工事の行。行が無い工事は時間を空にして返す */
  App.laborRows = function (month) {
    return App.laborTargets(month).map(function (kno) {
      var l = App.find('labor', kno, month);
      return l || { kouji: kno, month: month, hours: null, rate: settings.laborRate, amount: null, recorder: null, recordedOn: null };
    });
  };

  defOp('labor.record', function (c, input, reasons, errors) {
    var m = c.m;
    if (!c.k) { reasons.push(lack(c, K_KOUJI, '工事')); return {}; }
    if (!m) { reasons.push('月を選んでください'); return {}; }
    var row = App.find('labor', c.k.no, m);
    var edit = !!(row && row.recordedOn);
    if (!row && App.laborTargets(m).indexOf(c.k.no) < 0) reasons.push(c.k.no + ' は ' + m + ' に施工中ではありません');
    if (App.isClosedMonth(m)) reasons.push(m + ' は締め済のため' + (edit ? '直せません' : '計上できません'));
    var extra = { edit: edit };
    if (!input) return extra;
    var x = {};
    var h = input.hours;
    if (typeof h !== 'number') h = App.parse.hours(h);
    if (h === null) errors.hours = '時間を入れてください';
    else if (App.parse.minus(input.hours)) errors.hours = '時間は0以上で入れてください';
    else if (isNaN(h)) errors.hours = '時間は数字で入れてください';
    else if (h * 2 !== Math.round(h * 2)) errors.hours = '時間は0.5刻みで入れてください';
    x.hours = h;
    x.rate = given(input, 'rate') ? readYen(input, 'rate', errors, '単価', { required: true, min: 1 }) : (row ? row.rate : settings.laborRate);
    var on = given(input, 'recordedOn') ? input.recordedOn : (row && row.recordedOn) || App.monthEnd(m);
    x.recordedOn = readDate({ d: on }, 'd', errors, '計上日', { required: true });
    if (errors.d) { errors.recordedOn = errors.d; delete errors.d; }
    if (x.recordedOn && !errors.recordedOn && App.monthOf(x.recordedOn) !== m) errors.recordedOn = '計上日は ' + m + ' の中の日付にします';
    if (!errors.hours && !errors.rate) x.amount = App.laborAmount(x.hours, x.rate);
    extra.values = x;
    extra.amount = x.amount;
    if (edit && !Object.keys(errors).length) {
      extra.changes = diff([
        { label: '時間', from: row.hours, to: x.hours },
        { label: '単価', from: row.rate, to: x.rate },
        { label: '金額', from: row.amount, to: x.amount },
        { label: '計上日', from: row.recordedOn, to: x.recordedOn }
      ]);
      if (!extra.changes.count) reasons.push('変えた項目はありません');
    }
    return extra;
  }, function (c, v) {
    var x = v.values, u = actor(c), m = c.m, k = c.k;
    var row = App.find('labor', k.no, m);
    if (!row) {
      row = { kouji: k.no, month: m, hours: null, rate: settings.laborRate, amount: null, recorder: null, recordedOn: null };
      D().labor.push(row);
    }
    var target = k.no + ' ' + m;
    row.hours = x.hours;
    row.rate = x.rate;
    row.amount = x.amount;
    row.recordedOn = x.recordedOn;
    if (v.edit) {
      hist(c, target, '変更', v.changes.before, v.changes.after);
      return done(target, k.no + ' の ' + m + ' の労務費を ' + App.fmt.yen(x.amount) + '円 で直しました。', laborNext(m), LABOR_FIX, closeLink(m));
    }
    row.recorder = u.id;
    hist(c, target, '労務費の計上', null, { '時間': x.hours, '単価': x.rate, '金額': x.amount, '計上日': x.recordedOn });
    return done(target, k.no + ' の ' + m + ' の労務費を ' + App.fmt.yen(x.amount) + '円 で計上しました。', laborNext(m), LABOR_FIX, closeLink(m));
  });

  /* 労務費を保存した後の次の一手。保存の後の App.closeCheck で決める */
  var LABOR_FIX = '直すときは行の「直す」で直します。';

  /* 今の画面と同じ締めの画面を指すときは、移動せずに締めのボタンへフォーカスを移す（focus） */
  function closeLink(m) {
    return [{ label: '月次の締めへ', href: App.link(['shime', m]), op: 'month.close', ctx: { month: m }, focus: 'month.close' }];
  }

  /* 受付のままの請求が締めを止めているときは、その先頭の請求を指して受付の一覧を開く */
  function waitLink(m) {
    var w = App.closeCheck(m).waiting;
    return w.length ? [{ label: '受付の一覧へ', href: App.link(['seikyu'], { focus: w[0] }), op: 'invoice.return', ctx: { invoice: w[0] } }] : [];
  }

  function laborNext(m) {
    var b = closeBlocks(App.closeCheck(m));
    var todo = [];
    if (b.labor) todo.push('残りの労務費 ' + b.labor + '件を計上');
    if (b.seikyu) todo.push('受付のままの請求 ' + b.seikyu + '件を確認');
    if (b.other.length) return (todo.length ? todo.join('し、') + 'します。' : '') + b.other[0] + '。';
    return (todo.length ? todo.join('し、') + 'すると、' : '') + m + ' を締められます。';
  }

  function laborRowInput(row) {
    var x = { hours: row.hours };
    if (row.rate !== undefined && row.rate !== null && row.rate !== '') x.rate = row.rate;
    return x;
  }

  /* 複数の行をまとめて計上する。全行を labor.record と同じ判定にかけ、1行でも誤りがあれば1件も保存しない */
  defOp('labor.recordMany', function (c, input, reasons, errors) {
    var m = c.m;
    if (!m) { reasons.push('月を選んでください'); return {}; }
    if (App.isClosedMonth(m)) { reasons.push(m + ' は締め済のため計上できません'); return {}; }
    if (!input) return {};
    var rows = Array.isArray(input.rows) ? input.rows : [];
    if (!rows.length) { reasons.push('計上する行はありません'); return {}; }
    var seen = {}, amounts = [];
    rows.forEach(function (row) {
      var kno = row && row.kouji ? String(row.kouji) : '';
      if (!kno || !App.find('kouji', kno)) {
        errors.push({ kouji: kno, field: 'kouji', message: kno ? 'この番号の工事はありません' : '工事番号を入れてください' });
        return;
      }
      if (seen[kno]) { errors.push({ kouji: kno, field: 'kouji', message: '同じ工事の行が2つあります' }); return; }
      seen[kno] = true;
      var r = App.can('labor.record', { kouji: kno, month: m, role: c.role }, laborRowInput(row));
      r.reasons.forEach(function (x) { errors.push({ kouji: kno, field: null, message: x }); });
      Object.keys(r.errors).forEach(function (f) { errors.push({ kouji: kno, field: f, message: r.errors[f] }); });
      amounts.push(r.amount);
    });
    return { count: rows.length, amount: errors.length ? null : sum(amounts, function (a) { return a; }) };
  }, function (c, v, input) {
    var m = c.m;
    var list = input.rows.map(function (row) {
      var ctx = { kouji: String(row.kouji), month: m, role: c.role };
      var x = laborRowInput(row);
      return OPS['labor.record'].apply(context(ctx), App.can('labor.record', ctx, x), x).no;
    });
    return { no: m, nos: list, message: list.length + '件の労務費を計上しました。', next: laborNext(m), fix: LABOR_FIX, links: closeLink(m) };
  }, true);

  /* ---------- 取引先 ---------- */

  var PARTNER_STATES = ['取引中', '停止'];

  App.termNames = function () {
    var t = settings.terms || TERMS;
    return Array.isArray(t) ? t.map(function (x) { return x.name; }) : Object.keys(t);
  };

  function partnerKindsFor(role) {
    if (role === 'eigyo') return ['施主'];
    if (role === 'kobai') return ['仕入先', '外注先'];
    return App.PARTNER_KINDS.slice();
  }

  function opts(list) { return list.map(function (x) { return { value: x, label: x }; }); }

  /* 取引先のダイアログで扱う項目。torihikisaki を省くと登録の項目。登録できる区分が1つだけの役割では、区分をその値の文字で出す */
  App.partnerFields = function (torihikisaki, kind) {
    var p = rec('partners', torihikisaki);
    var kinds = partnerKindsFor(App.role());
    var oneKind = !p && kinds.length === 1;
    var spec = [
      { name: 'name', label: '名称', type: 'text', required: true, max: 40 },
      { name: 'kind', label: '区分', type: 'select', required: true },
      { name: 'contact', label: '担当者名', type: 'text', max: 20 },
      { name: 'terms', label: '支払条件', type: 'select', required: true },
      { name: 'status', label: '取引状態', type: 'select', required: true },
      { name: 'note', label: '備考', type: 'textarea', max: 200 }
    ];
    var init = { kind: oneKind ? kinds[0] : kind || kinds[0], terms: App.termNames()[0] };
    if (!p) spec = spec.filter(function (f) { return f.name !== 'status'; });
    return spec.map(function (f) {
      var v = p ? p[f.name] : init[f.name];
      var lock = p && f.name === 'kind' ? '区分は登録の後は変えられません' : '';
      var out = { name: f.name, label: f.label, type: f.type, required: f.required, value: blank(v) ? null : v, editable: !lock, lockReason: lock };
      if (f.max) out.max = f.max;
      if (f.name === 'kind' && oneKind) out.type = 'fixed';
      else if (f.name === 'kind') out.options = opts(p ? [p.kind] : kinds);
      if (f.name === 'terms') out.options = opts(App.termNames());
      if (f.name === 'status') out.options = opts(PARTNER_STATES);
      return out;
    });
  };

  function readPartner(c, input, errors) {
    var p = c.p, vals = {}, list = [];
    App.partnerFields(p, c.kind).forEach(function (f) {
      if (!f.editable || (p && !given(input, f.name))) return;
      var v = readText(input, f.name, errors, f.label, { required: f.required, select: f.type === 'select', max: f.max }) || null;
      if (v && f.name === 'kind' && App.PARTNER_KINDS.indexOf(v) < 0) errors.kind = '区分は ' + App.PARTNER_KINDS.join('、') + ' から選びます';
      if (v && f.name === 'terms' && App.termNames().indexOf(v) < 0) errors.terms = '支払条件は一覧から選びます';
      if (v && f.name === 'status' && PARTNER_STATES.indexOf(v) < 0) errors.status = '取引状態は 取引中 か 停止 です';
      if (v && f.name === 'name') {
        var same = D().partners.filter(function (x) { return x.name === v && x !== p; });
        if (same.length) errors.name = '同じ名称の取引先があります（' + same[0].code + '）';
      }
      vals[f.name] = v;
      list.push({ label: f.label, from: p ? (blank(p[f.name]) ? null : p[f.name]) : null, to: v });
    });
    if (!p && !vals.status) vals.status = '取引中';
    return { values: vals, changes: diff(list) };
  }

  defOp('partner.register', function (c, input, reasons, errors) {
    return input ? readPartner({ p: null, kind: c.kind }, input, errors) : {};
  }, function (c, v) {
    var x = v.values;
    var code = App.nextNumber('partner');
    var p = {
      code: code, name: x.name, kind: x.kind, contact: x.contact || '', terms: x.terms, status: x.status || '取引中',
      registeredOn: settings.baseDate, note: x.note || ''
    };
    D().partners.push(p);
    var after = { '名称': p.name, '区分': p.kind, '支払条件': p.terms, '取引状態': p.status };
    if (p.contact) after['担当者名'] = p.contact;
    hist(c, code, '登録', null, after);
    return done(code, '取引先 ' + code + ' ' + p.name + ' を登録しました。',
      p.kind === '施主' ? '工事の登録で施主に選べます。' : '発注の起票で取引先に選べます。', '直すときは「取引先を編集」で直します。');
  });

  defOp('partner.edit', function (c, input, reasons, errors) {
    if (!c.p) { reasons.push(lack(c, ['partner'], '取引先')); return {}; }
    if (!input) return {};
    var r = readPartner(c, input, errors);
    if (!r.changes.count && !Object.keys(errors).length) reasons.push('変えた項目はありません');
    return r;
  }, function (c, v) {
    var p = c.p;
    Object.keys(v.values).forEach(function (n) {
      p[n] = n === 'note' || n === 'contact' ? (v.values[n] || '') : v.values[n];
    });
    hist(c, p.code, '変更', v.changes.before, v.changes.after);
    return done(p.code, '取引先 ' + p.code + ' を保存しました。',
      p.status === '停止' ? '停止の取引先は発注で選べません。' : '', '直すときは「取引先を編集」で直します。変更前の値は履歴にあります。');
  });

  /* ---------- 月次の締め ---------- */

  defOp('month.close', function (c, input, reasons) {
    if (!c.m) { reasons.push('月を選んでください'); return {}; }
    var r = App.closeCheck(c.m);
    /* 受付のままの請求と未計上の労務費は件数だけにする。番号は check（App.closeCheck の結果）にある */
    var b = closeBlocks(r), counts = [];
    b.other.forEach(function (x) { reasons.push(x); });
    if (b.seikyu) counts.push('受付のままの請求 ' + b.seikyu + '件');
    if (b.labor) counts.push('労務費が未計上の工事 ' + b.labor + '件');
    if (counts.length) reasons.push(counts.join('、'));
    var row = monthRow(c.m);
    return { check: r, warnings: r.warnings, count: row ? num(row.closeCount) + 1 : 1 };
  }, function (c, v) {
    var row = monthRow(c.m);
    row.closeCount = num(row.closeCount) + 1;
    row.status = '締め済';
    row.closedOn = settings.baseDate;
    hist(c, c.m, '締め', { '状態': '未締め' }, { '状態': '締め済', '回数': '第' + row.closeCount + '回' });
    return done(c.m, c.m + ' を締めました（第' + row.closeCount + '回）。',
      '締め済の月には発注検収と労務費を入れられず、請求の計上月にも選べません。直すときは経理が理由を付けて締めを解除します。');
  });

  defOp('month.reopen', function (c, input, reasons, errors) {
    if (!c.m) { reasons.push('月を選んでください'); return {}; }
    App.reopenCheck(c.m).reasons.forEach(function (x) { reasons.push(x); });
    if (input) readText(input, 'reason', errors, '理由', { required: true, max: 200 });
    return {};
  }, function (c, v, input) {
    var row = monthRow(c.m);
    row.status = '未締め';
    row.closedOn = null;
    hist(c, c.m, '締め解除', { '状態': '締め済' }, { '状態': '未締め' }, String(input.reason).trim());
    return done(c.m, c.m + ' の締めを解除しました。', '直し終えたら経理が締め直します。', '締め直すときは「' + c.m + ' を締める」で締めます。');
  });

  /* ---------- 流れを確かめる工事 ---------- */

  function sceneKouji() {
    var sc = SAMPLE.scenes || {};
    var s = sc.ipponmichi;
    if (!s) Object.keys(sc).forEach(function (k) { if (!s && /操作の流れ/.test(sc[k].title || '')) s = sc[k]; });
    return s && s.kouji ? s.kouji : null;
  }

  function koujiOfNo(no) {
    var s = String(no || '');
    if (!s) return '';
    if (App.find('kouji', s)) return s;
    var r = App.find('revisions', s);
    if (r) return r.kouji;
    var x = App.find('inspections', s) || App.find('invoices', s);
    var o = App.find('orders', x ? x.order : s);
    if (o) return o.kouji;
    var m = /^(\S+) \d{4}-\d{2}$/.exec(s);
    return m ? m[1] : '';
  }

  App.scenes = function () { return clone(SAMPLE.scenes || {}); };

  /* 番号が流れを確かめる工事のものか。工事、発注、発注検収、請求、予算改定、労務費の番号を受ける */
  App.inScene = function (no) {
    var k = sceneKouji();
    return !!k && koujiOfNo(no) === k;
  };

  /* 受付の後の案内。判定が通るときだけ返し、通らないときは空文字 */
  function judgeNext(res) {
    return res.judge && res.judge.ok ? '確認のダイアログで計上月を選んで確認します' : '';
  }

  var SCENE_NEXT = {
    'order.draft': '購買に切り替えて、この発注を承認します',
    'order.resubmit': '購買に切り替えて、この発注を承認します',
    'order.approve': function (res) {
      var o = App.find('orders', res.no);
      return o && num(o.amount) < 0 ? '' : '工事担当に戻して、発注検収の登録で出来高として一部を登録します';
    },
    'inspection.register': '経理に切り替えて、請求の確認でこの発注の請求書を受け付けます',
    'invoice.receive': judgeNext,
    'invoice.reaccept': judgeNext,
    'invoice.return': '差戻しの行から修正版を再び受け付けます',
    'invoice.confirm': function () { return '月次の締めで ' + (App.firstOpenMonth() || '') + ' を開き、止めている項目を片付けて締めます'; }
  };

  /* ---------- 判定と実行 ---------- */

  /* 操作ができるか。input を渡すと入力の誤りも errors に返す */
  App.can = function (op, ctx, input) {
    var c = context(ctx);
    if (op === 'partner.register' && !c.kind && input && input.kind) c.kind = String(input.kind);
    var who = whoOf(op, c);
    var isView = op.indexOf('view.') === 0;
    if (!who || (!isView && !OPS[op])) throw new Error('App.can: 知らない操作 ' + op);
    var extra = { op: op, roles: who[0].slice() };
    var list = !isView && OPS[op].rowErrors;
    var allowed = who[0].indexOf(c.role) >= 0;
    if (isView) return verdict(allowed ? [] : [who[1]], null, extra);
    var reasons = [], errors = list ? [] : {};
    /* 状態を役割より先に見る */
    if (!allowed) {
      OPS[op].check(c, null, reasons, errors);
      return verdict(roleOrState(reasons, who[1]), list ? [] : null, extra);
    }
    var x = OPS[op].check(c, input || null, reasons, errors) || {};
    Object.keys(x).forEach(function (k) { extra[k] = x[k]; });
    return verdict(reasons, errors, extra);
  };

  /* 判定して、通れば保存して履歴を残す。結果に no、message、next、fix、links、scene が付く */
  App.act = function (op, ctx, input) {
    input = input || {};
    var v = App.can(op, ctx, input);
    if (!v.ok) return v;
    var res = App.update(function () {
      var c = context(ctx);
      if (op === 'partner.register' && !c.kind && input.kind) c.kind = String(input.kind);
      return OPS[op].apply(c, v, input);
    });
    Object.keys(res).forEach(function (k) { v[k] = res[k]; });
    /* 次の一手の入口は、今の役割で行える物だけ残す */
    v.links = (res.links || []).filter(function (a) {
      try { return App.can(a.op, a.ctx).ok; } catch (e) { return false; }
    }).map(function (a) { return a.focus ? { label: a.label, href: a.href, focus: a.focus } : { label: a.label, href: a.href }; });
    var sn = SCENE_NEXT[op];
    var scene = sn && (res.nos || [res.no]).some(App.inScene) ? (typeof sn === 'function' ? sn(res) : sn) : '';
    if (scene) v.scene = scene;
    dirty = false;
    return v;
  };

  App.ops = function () { return Object.keys(OPS).concat(Object.keys(WHO).filter(function (k) { return k.indexOf('view.') === 0; })); };

  /* ---------- 部品: 要素を組む ---------- */

  function append(el, c) {
    if (c === null || c === undefined || c === false) return el;
    if (Array.isArray(c)) {
      c.forEach(function (x) { append(el, x); });
      return el;
    }
    if (c.nodeType) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
    return el;
  }
  App.append = append;

  /* App.h('a', {href: '#/kouji', class: 'row-link'}, ['工事 ', no])。文字は全てテキストとして入る */
  App.h = function (tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs && (Array.isArray(attrs) || attrs.nodeType || typeof attrs !== 'object')) {
      children = attrs;
      attrs = null;
    }
    var value;
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class' || k === 'className') {
        el.className = Array.isArray(v) ? v.filter(Boolean).join(' ') : String(v);
      } else if (k === 'text') {
        el.textContent = String(v);
      } else if (k === 'value') {
        value = v;
      } else if (/^on[A-Za-z]/.test(k) && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else {
        el.setAttribute(k, v === true ? '' : String(v));
      }
    });
    append(el, children);
    if (value !== undefined) el.value = value;
    return el;
  };

  var uid = 0;
  function newId(prefix) { uid++; return (prefix || 'el') + '-' + uid; }
  App.newId = newId;

  /* ---------- 部品: 折り返しで割らない語 ---------- */

  /* 中が9字までのかぎ括弧の語（請求の判定の名前など）、「ほか n件」、日付、年月、金額と時間（括弧ごと）、
     番号（工事、発注、発注検収、予算改定、請求、取引先、労務費） */
  var NW_RE = /「[^「」]{1,9}」|ほか \d+件|（[−-]?\d[\d,]*(?:\.\d+)?(?:円|時間)）|[−-]?\d[\d,]*(?:\.\d+)?(?:円|時間)|\d{4}-\d{2}-\d{2}|\d{2}-\d{3} \d{4}-\d{2}(?![\d-])|\d{4}-\d{2}(?![\d-])|\d{2}-\d{3}(?:-\d{2})?(?:-[KY]\d+)?|[RT]-\d{3,4}|[KY]\d+/g;

  /* 文字列を受け、上の形の語を span.nw で包んだ DocumentFragment を返す。前後に英数字が続く語は包まない */
  App.nw = function (text) {
    var frag = document.createDocumentFragment();
    var s = text === null || text === undefined ? '' : String(text);
    var re = new RegExp(NW_RE.source, 'g');
    var at = 0;
    var m;
    while ((m = re.exec(s))) {
      var prev = m.index > 0 ? s.charAt(m.index - 1) : '';
      var next = s.charAt(m.index + m[0].length);
      if (/[A-Za-z0-9.,\-−]/.test(prev) || /[A-Za-z0-9]/.test(next)) {
        re.lastIndex = m.index + 1;
        continue;
      }
      if (m.index > at) frag.appendChild(document.createTextNode(s.slice(at, m.index)));
      frag.appendChild(App.h('span', { class: 'nw' }, m[0]));
      at = m.index + m[0].length;
    }
    if (at < s.length) frag.appendChild(document.createTextNode(s.slice(at)));
    return frag;
  };

  /* 要素の中のテキストに App.nw を掛ける。入力欄とボタンの中には入らず、a は包まずに中の文字だけを包む */
  function nwIn(el) {
    if (!el || !el.childNodes) return el;
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        NW_RE.lastIndex = 0;
        if (NW_RE.test(n.nodeValue)) el.replaceChild(App.nw(n.nodeValue), n);
      } else if (n.nodeType === 1 && !/^(BUTTON|INPUT|SELECT|TEXTAREA|SCRIPT|STYLE)$/.test(n.tagName) &&
        !n.classList.contains('nw')) {
        nwIn(n);
      }
    });
    NW_RE.lastIndex = 0;
    return el;
  }
  App.nwIn = nwIn;

  /* 文字列は App.nw、要素は nwIn、配列はそれぞれに掛ける */
  function nwAny(x) {
    if (x === null || x === undefined || x === false) return x;
    if (Array.isArray(x)) return x.map(nwAny);
    if (x.nodeType === 3) return App.nw(x.nodeValue);
    if (x.nodeType) return nwIn(x);
    return App.nw(x);
  }

  /* ---------- 部品: 札、絞り込みのチップ ---------- */

  /* 札: App.chip('承認済')、超過は App.chip('超過', {over: true})。
     絞り込み: App.chip('受付', {pressed: true, count: 3, onClick: fn}) */
  App.chip = function (text, opts) {
    opts = opts || {};
    if (typeof opts.onClick !== 'function') {
      return App.h('span', { class: opts.over ? 'tag tag-over' : 'tag' }, text);
    }
    var b = App.h('button', { type: 'button', class: 'chip', 'aria-pressed': opts.pressed ? 'true' : 'false' }, text);
    if (opts.count !== undefined && opts.count !== null) append(b, App.h('span', { class: 'count' }, String(opts.count)));
    b.addEventListener('click', function (e) { opts.onClick(e, b); });
    return b;
  };

  App.tags = function (list) {
    return App.h('span', { class: 'tags' }, (list || []).filter(Boolean).map(function (t) {
      return t.nodeType ? t : App.chip(t);
    }));
  };

  /* 1つだけ選ぶ絞り込み。items は [{value, label, count}]。選んだ値を onChange に渡す */
  App.chips = function (items, selected, onChange, label) {
    var box = App.h('div', { class: 'chips', role: 'group', 'aria-label': label || '絞り込み' });
    items.forEach(function (it) {
      append(box, App.chip(it.label, {
        pressed: it.value === selected,
        count: it.count,
        onClick: function () { onChange(it.value); }
      }));
    });
    return box;
  };

  /* ---------- 部品: ボタン ---------- */

  /* 押せないときも消さず、理由を下（side なら横）に出す。
     opts: primary, small, side, onClick, disabled（理由の文字列か true）, verdict（App.can の結果）,
     danger（元に戻しにくい操作。App.opList で線の下の最後に置く） */
  App.button = function (label, opts) {
    opts = opts || {};
    var reasons = [];
    if (opts.verdict && !opts.verdict.ok) {
      reasons = opts.verdict.reasons && opts.verdict.reasons.length ? opts.verdict.reasons : [opts.verdict.reason];
    }
    if (typeof opts.disabled === 'string' && opts.disabled) reasons = [opts.disabled];
    if (Array.isArray(opts.disabled)) reasons = opts.disabled;
    var off = reasons.length > 0 || opts.disabled === true;
    var b = App.h('button', {
      type: opts.type || 'button',
      class: ['btn', opts.primary ? 'btn-primary' : '', opts.small ? 'btn-s' : ''],
      disabled: off,
      id: opts.id,
      'data-op': opts.op
    }, label);
    if (!off && typeof opts.onClick === 'function') {
      b.addEventListener('click', function (e) { opts.onClick(e, b); });
    }
    var wrap = App.h('span', { class: opts.side ? 'act act-side' : 'act' }, b);
    reasons = reasons.filter(Boolean);
    if (off && reasons.length) {
      var rid = newId('reason');
      b.setAttribute('aria-describedby', rid);
      var r = App.h('span', { class: 'reason', id: rid });
      if (reasons.length === 1) append(r, nwAny(reasons[0]));
      else reasons.forEach(function (x) { append(r, App.h('span', { class: 'reason-line' }, nwAny(x))); });
      append(wrap, r);
    }
    wrap.btn = b;
    if (opts.danger) wrap.danger = true;
    return wrap;
  };

  /* 画面の頭: パンくず、見出し、番号、札、戻るリンク、右端の主な操作 */
  App.pageHead = function (o) {
    var title = App.h('div', { class: 'page-title' });
    if (o.crumbs) append(title, App.crumbs(o.crumbs));
    append(title, App.h('div', { class: 'title-line' }, [
      App.h('h1', null, o.title),
      o.no ? App.h('span', { class: 'rec-no' }, o.no) : null,
      o.tags ? App.tags(o.tags) : null
    ]));
    if (o.back) append(title, App.h('p', { class: 'back' }, App.h('a', { href: o.back.href }, o.back.label)));
    var head = App.h('div', { class: o.back ? 'page-head page-head-back' : 'page-head' }, title);
    if (o.actions && o.actions.length) append(head, App.actionbar(o.actions));
    return head;
  };

  /* 主な操作の置き場所。幅640以下では画面の下に固定される */
  App.actionbar = function (items) {
    return App.h('div', { class: 'actionbar' }, items);
  };

  /* 主でない操作の並び。1行に ボタン（左、幅を揃える）と理由（右）を置く。
     押せる物を先、押せない物を後にし、danger の物は線で区切って最後に置く。items は App.button の戻り値 */
  App.opList = function (items, opts) {
    opts = opts || {};
    var list = (items || []).filter(Boolean).map(function (x, i) {
      var b = btnOf(x);
      return { el: x, rank: (x.danger ? 2 : 0) + (b && b.disabled ? 1 : 0), i: i };
    });
    list.sort(function (a, b) { return a.rank - b.rank || a.i - b.i; });
    var lined = false;
    return App.h('ul', { class: 'oplist', 'aria-label': opts.label || 'そのほかの操作' }, list.map(function (x, n) {
      var line = x.rank >= 2 && !lined && n > 0;
      if (x.rank >= 2) lined = true;
      return App.h('li', { class: ['oplist-row', line ? 'is-danger-first' : ''] }, x.el);
    }));
  };

  /* 副の操作は左、戻す・取消は線で離し、主な操作は右端 */
  App.toolbar = function (o) {
    var bar = App.h('div', { class: 'toolbar' });
    if (o.left && o.left.length) append(bar, App.h('div', { class: 'toolbar-left' }, o.left));
    if (o.danger && o.danger.length) append(bar, App.h('div', { class: 'toolbar-danger' }, o.danger));
    if (o.right && o.right.length) append(bar, App.h('div', { class: 'toolbar-right' }, o.right));
    return bar;
  };

  /* 面: 見出しと右の道具、中身、下の注記 */
  App.panel = function (o) {
    var p = App.h('section', { class: 'panel' });
    if (o.title) {
      append(p, App.h('div', { class: 'panel-head' }, [
        App.h('h2', null, o.title),
        o.tools && o.tools.length ? App.h('div', { class: 'tools' }, o.tools) : null
      ]));
    }
    append(p, o.flush ? o.body : App.h('div', { class: 'panel-body' }, o.body));
    if (o.foot) append(p, App.h('div', { class: 'panel-foot' }, o.foot));
    return p;
  };

  /* ---------- 部品: 現在地 ---------- */

  /* items は [{label, href}]。最後が今の画面でリンクにしない。
     リンクの項目は区切りと1つの塊にして、区切りだけが行に残らないようにする */
  App.crumbs = function (items) {
    var ol = App.h('ol');
    items.forEach(function (it, i) {
      var last = i === items.length - 1;
      var linked = !last && it.href;
      append(ol, App.h('li', last ? { 'aria-current': 'page' } : (linked ? { class: 'nw' } : null),
        linked ? App.h('a', { href: it.href }, it.label) : it.label));
    });
    return App.h('nav', { class: 'crumbs', 'aria-label': '現在地' }, ol);
  };

  /* 番号から開く画面のハッシュ: 工事、発注、発注検収、請求、予算改定、取引先、月、労務費。
     労務費（工事番号と年月）は工事の画面、その工事の画面の中では月次の締め */
  App.hrefOf = function (no) {
    var s = String(no || '');
    if (!s) return '';
    if (App.find('kouji', s)) return App.link(['kouji', s]);
    if (App.find('orders', s)) return App.link(['hacchu', s]);
    var i = App.find('inspections', s);
    if (i) return App.link(['kenshu'], { hacchu: i.order });
    if (App.find('invoices', s)) return App.link(['seikyu'], { focus: s });
    var r = App.find('revisions', s);
    if (r) return App.link(['kouji', r.kouji]);
    if (App.find('partners', s)) return App.link(['torihikisaki', s]);
    if (/^\d{4}-\d{2}$/.test(s)) return App.link(['shime', s]);
    var m = /^(\S+) (\d{4}-\d{2})$/.exec(s);
    var cur = App.current();
    var here = cur && cur.path[0] === 'kouji' && cur.path[1] === (m && m[1]);
    if (m && App.find('kouji', m[1]) && !here) return App.link(['kouji', m[1]]);
    if (m) return App.link(['shime', m[2]]);
    return '';
  };

  /* 番号の並びをリンクにする。区切りは「、」 */
  App.noLinks = function (list) {
    var span = App.h('span');
    (list || []).forEach(function (no, i) {
      if (i) append(span, '、');
      var href = App.hrefOf(no);
      append(span, href ? App.h('a', { href: href }, no) : no);
    });
    return span;
  };

  /* ---------- 部品: 知らせ ---------- */

  /* 注目の知らせ（予算超過など）。plain で無彩色の枠。lines は下に並べる文 */
  App.notice = function (title, opts) {
    opts = opts || {};
    var box = App.h('div', { class: opts.plain ? 'notice notice-plain' : 'notice', role: opts.role || null },
      App.h('p', { class: 'notice-title' }, title));
    (opts.lines || []).forEach(function (l) { append(box, App.h('p', null, l)); });
    if (opts.fix && opts.fix.length) {
      opts.fix.forEach(function (l, i) {
        append(box, App.h('p', null, [i === 0 ? App.h('span', { class: 'notice-fix-label' }, '直し方') : null, l]));
      });
    }
    if (opts.links && opts.links.length) {
      append(box, App.h('p', { class: 'actions' }, opts.links.map(function (a) {
        return App.h('a', { href: a.href }, a.label);
      })));
    }
    return nwIn(box);
  };

  /* 直し方の枠。App.judge の結果か {title, fix, links} を受ける。判定が通っていれば null */
  App.fixBox = function (j, opts) {
    if (!j || j.ok) return null;
    opts = opts || {};
    var title = j.title || j.reason || j.label;
    var fix = j.fix || [];
    if (fix.length > 3) fix = fix.slice(0, 3);
    var links = opts.links || j.links || [];
    if (!opts.links && j.related && j.related.length) {
      links = j.related.map(function (no) {
        var href = App.hrefOf(no);
        return href ? { label: no + ' を開く', href: href } : null;
      }).filter(Boolean);
    }
    return App.notice(title, { plain: true, fix: fix, links: links, role: 'note' });
  };

  /* ---------- 部品: 保存の後の知らせ ---------- */

  /* App.act の結果か文字列を受ける。次の描画（App.go か App.render）の画面の上に1回出る。
     結果の message、next（誰が次に行うか）、fix（直す道）、links（[{label, href}]）、scene（操作の流れの次の段）を出す。
     opts の next、fix、scene は結果の値を置き換え、opts.links は結果の links の後ろに足す */
  App.flash = function (res, opts) {
    opts = opts || {};
    var f = typeof res === 'string' ? { text: res, links: [] } : {
      text: res.message || '', next: res.next || '', fix: res.fix || '', scene: res.scene || '', links: (res.links || []).slice()
    };
    if (opts.next !== undefined) f.next = opts.next;
    if (opts.fix !== undefined) f.fix = opts.fix;
    if (opts.scene !== undefined) f.scene = opts.scene;
    f.links = f.links.concat(opts.links || []);
    pendingFlash = f;
    return f;
  };

  /* 結果の文と次の文を1つの span に続けて入れ、リンク、直す道、「次: 」の順に並べる。
     操作の流れの次の段があるときは、それが次の文の代わりになる。
     並べる物の間には空白を1つ置く。幅641以上で文に続けて流すリンクの前の空きになる */
  function flashEl(f) {
    var box = App.h('div', { class: 'flash', role: 'status' });
    var put = function (el) { if (box.firstChild) append(box, ' '); append(box, el); };
    var text = f.text || '';
    if (f.next && !f.scene) text += (text && !/。$/.test(text) ? ' ' : '') + f.next;
    if (text) put(App.h('span', null, text));
    (f.links || []).forEach(function (a) { put(App.h('a', { href: a.href, 'data-focus-op': a.focus || null }, a.label)); });
    if (f.fix) put(App.h('span', null, f.fix));
    if (f.scene) put(App.h('span', null, '次: ' + f.scene));
    return nwIn(box);
  }

  /* ---------- 部品: 消化率と横棒、状態の段 ---------- */

  /* 横棒は 0〜125% を描く。100% は左から 80% の縦線。超えた部分だけ有彩色 */
  App.bar = function (rate, opts) {
    opts = opts || {};
    var none = rate === null || rate === undefined || !isFinite(rate);
    var over = !none && rate > 1;
    var top = App.h('span', { class: 'rate-top' });
    if (opts.text !== false) append(top, App.h('span', { class: over ? 'over-val' : null }, none ? '予算なし' : App.fmt.pct(rate)));
    if (over) append(top, App.chip('超過', { over: true }));
    var bar = App.h('span', { class: none ? 'bar bar-none' : 'bar', 'aria-hidden': 'true' });
    if (!none) {
      var fill = App.h('span', { class: 'bar-fill' });
      fill.style.width = (Math.max(0, Math.min(rate, 1)) * 80) + '%';
      append(bar, fill);
      if (over) {
        var ov = App.h('span', { class: 'bar-over' });
        ov.style.width = (Math.min(rate - 1, 0.25) * 80) + '%';
        append(bar, ov);
      }
    }
    return App.h('span', { class: 'rate' }, [top, bar]);
  };

  /* 差異の消化率の濃淡（5段）。超過は最も濃い段 */
  App.heat = function (rate) {
    if (rate === null || rate === undefined || !isFinite(rate)) return '';
    if (rate > 1) return 'heat-5';
    if (rate >= 0.9) return 'heat-4';
    if (rate >= 0.7) return 'heat-3';
    if (rate >= 0.4) return 'heat-2';
    return 'heat-1';
  };

  var STEP_DATE = { '受注': 'contractOn', '施工中': 'startOn', '検収済': 'clientInspectOn', '請求済': 'clientBillOn', '完了': 'paidOn' };

  /* 工事の状態の段。済んだ段に到達日を出す */
  App.steps = function (kouji) {
    var k = rec('kouji', kouji);
    var at = KOUJI_STATES.indexOf(k.status);
    return App.h('ol', { class: 'steps', 'aria-label': '工事の状態' }, KOUJI_STATES.map(function (st, i) {
      var d = STEP_DATE[st] ? k[STEP_DATE[st]] : null;
      return App.h('li', { class: i < at ? 'is-done' : null, 'aria-current': i === at ? 'step' : null }, [
        st,
        i <= at && d ? App.h('span', { class: 'step-date' }, App.fmt.date(d)) : null
      ]);
    }));
  };

  /* ---------- 部品: 表 ---------- */

  var CARD_CLASS = { head: 'k-head', tag: 'k-tag', title: 'k-title', wide: 'k-wide', row: 'k-row', hide: 'k-hide' };

  function cellOf(col, row, i) {
    if (typeof col.cell === 'function') return col.cell(row, i);
    var v = typeof col.value === 'function' ? col.value(row) : row[col.key];
    if (col.yen) return App.fmt.yen(v);
    if (col.date) return App.fmt.date(v);
    return v === null || v === undefined || v === '' ? NO_VALUE : v;
  }

  /* foot が真なら合計の行。1列目（first）を見出し、2列目からを見出し付きの行にし、本体の行で隠す列（card: 'hide'）は隠す */
  function tdFor(col, content, cards, extra, foot, first) {
    var card = foot ? (first ? 'head' : (col.card === 'hide' ? 'hide' : 'row')) : (col.card || 'row');
    var cls = [];
    if (col.num) cls.push('num');
    if (col.nw) cls.push('nw');
    if (col.label === '操作') cls.push('col-ops');
    if (cards) cls.push(CARD_CLASS[card]);
    if (extra && cls.indexOf(extra) < 0) cls.push(extra);
    var td = App.h('td', { class: cls, 'data-label': cards && card === 'row' ? col.label : null });
    append(td, content);
    return td;
  }

  function isControl(el, stop) {
    for (var n = el; n && n !== stop; n = n.parentNode) {
      if (/^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL)$/.test(n.nodeName)) return true;
    }
    return false;
  }

  /* 一覧の表。行全体を押せる（href か onRow）。幅640以下はカードに組み替える。
     columns: [{key, label, num, nw, yen, date, card, link, cell(row), value(row), cls(row)}] */
  App.table = function (o) {
    var cols = o.columns;
    var rows = o.rows || [];
    var cards = o.cards !== false;
    var block = App.h('div', { class: 'tbl-block' });
    if (o.count !== false) {
      var n = rows.length;
      var total = o.total === undefined || o.total === null ? n : o.total;
      append(block, App.h('p', { class: 'tbl-count', role: 'status' }, total === n ? n + '件' : total + '件中 ' + n + '件'));
    }
    if (!rows.length) {
      var empty = App.h('div', { class: 'empty' }, App.h('p', null, o.empty || '条件に合う行はありません'));
      if (typeof o.onClear === 'function') {
        append(empty, App.button('条件を外す', {
          small: true,
          onClick: function (e, b) {
            var content = document.getElementById('content');
            var all = content ? Array.prototype.slice.call(content.querySelectorAll('.tbl-block')) : [];
            clearedList = Math.max(0, all.indexOf(block));
            o.onClear(e, b);
          }
        }));
      }
      append(block, empty);
      if (o.note) append(block, App.h('p', { class: 'tbl-note' }, o.note));
      return block;
    }
    var linkAt = 0;
    cols.forEach(function (c, i) { if (c.link) linkAt = i; });
    var table = App.h('table', { class: cards ? 'tbl tbl-cards' : 'tbl' });
    if (o.caption) append(table, App.h('caption', { class: 'vh' }, o.caption));
    append(table, App.h('thead', null, App.h('tr', null, cols.map(function (c) {
      var thCls = [c.num ? 'num' : '', c.nw ? 'nw' : '', c.label === '操作' ? 'col-ops' : ''].filter(Boolean).join(' ');
      return App.h('th', { scope: 'col', class: thCls || null }, c.label);
    }))));
    var body = App.h('tbody');
    rows.forEach(function (row, ri) {
      var href = typeof o.href === 'function' ? o.href(row) : '';
      var click = typeof o.onRow === 'function';
      var tr = App.h('tr', { class: [href || click ? 'is-link' : '', typeof o.rowClass === 'function' ? o.rowClass(row) : ''] });
      cols.forEach(function (c, ci) {
        var content = cellOf(c, row, ri);
        if (ci === linkAt && href) content = App.h('a', { class: 'row-link', href: href }, content);
        else if (ci === linkAt && click) {
          content = App.h('button', { type: 'button', class: 'row-link', onClick: function () { o.onRow(row); } }, content);
        }
        append(tr, tdFor(c, content, cards, typeof c.cls === 'function' ? c.cls(row) : ''));
      });
      if (href || click) {
        tr.addEventListener('click', function (e) {
          if (isControl(e.target, tr)) return;
          if (href) goTo(href, 'row');
          else o.onRow(row);
        });
      }
      append(body, tr);
    });
    append(table, body);
    if (o.foot) {
      var f = o.foot;
      var ftr = App.h('tr', { class: f.className || null });
      cols.forEach(function (c, ci) {
        var v = f.cells ? f.cells[c.key] : undefined;
        if (v === undefined && ci === 0) v = f.label || '合計';
        append(ftr, tdFor(c, v === undefined || v === null ? '' : v, cards, v === undefined || v === null || v === '' ? 'k-hide' : '', true, ci === 0));
      });
      append(table, App.h('tfoot', null, ftr));
    }
    append(block, App.h('div', { class: 'tbl-wrap' }, table));
    if (o.note) append(block, App.h('p', { class: 'tbl-note' }, o.note));
    return block;
  };

  /* 並べ替え。value は行から比べる値を返す関数。空の値は常に末尾 */
  App.sortRows = function (rows, value, dir) {
    var sign = dir === 'desc' ? -1 : 1;
    return rows.map(function (r, i) { return { r: r, i: i, v: value(r) }; }).sort(function (a, b) {
      var ea = a.v === null || a.v === undefined || a.v === '', eb = b.v === null || b.v === undefined || b.v === '';
      if (ea || eb) return ea === eb ? a.i - b.i : (ea ? 1 : -1);
      if (a.v < b.v) return -sign;
      if (a.v > b.v) return sign;
      return a.i - b.i;
    }).map(function (x) { return x.r; });
  };

  /* 検索と絞り込みの帯。end は右に寄せる物 */
  App.filters = function (items, end) {
    var box = App.h('div', { class: 'filters' }, items);
    if (end && end.length) append(box, App.h('div', { class: 'filters-end' }, end));
    return box;
  };

  /* 一覧の検索欄。打ち終わって少し待つと onSearch(文字) を呼ぶ。日本語の変換中は呼ばない。
     文字は 'lists.<name>' の q に残し、value を省くとそこから読む。入力途中の印は立てない。
     o: name, label（既定「検索」）, placeholder, value, wait（待つミリ秒。既定 250）, onSearch(文字) */
  App.search = function (o) {
    o = o || {};
    var key = 'lists.' + o.name;
    var id = newId('search');
    var input = App.h('input', {
      type: 'search', class: 'input', id: id, name: 'search-' + o.name, autocomplete: 'off', placeholder: o.placeholder
    });
    var saved = App.recall(key);
    var first = o.value !== undefined ? o.value : (saved && saved.q);
    input.value = first === null || first === undefined ? '' : String(first);
    var timer = null;
    function fire(wait) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!document.body.contains(input)) return;
        var t = input.value.trim();
        var st = App.recall(key);
        if (!st || typeof st !== 'object' || Array.isArray(st)) st = {};
        if (t) st.q = t; else delete st.q;
        App.remember(key, st);
        if (typeof o.onSearch === 'function') o.onSearch(t);
      }, wait);
    }
    var wait = o.wait === undefined ? 250 : o.wait;
    input.addEventListener('input', function (e) { if (!e.isComposing) fire(wait); });
    input.addEventListener('compositionend', function () { fire(wait); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); fire(0); }
    });
    var box = App.h('div', { class: 'field grow' }, [App.h('label', { class: 'field-label', for: id }, o.label || '検索'), input]);
    box.control = input;
    return box;
  };

  /* 項目の並び。items は [{label, value, num}]。kind は 'info'（4列）か 'kv'（2列） */
  App.info = function (items, kind) {
    var dl = App.h('dl', { class: kind === 'kv' ? 'kv' : 'info' });
    items.filter(Boolean).forEach(function (it) {
      var v = it.value === null || it.value === undefined || it.value === '' ? NO_VALUE : it.value;
      if (kind === 'kv') {
        append(dl, [App.h('dt', null, it.label), App.h('dd', { class: it.num ? 'num' : null }, v)]);
      } else {
        append(dl, App.h('div', { class: it.num ? 'num' : null }, [App.h('dt', null, it.label), App.h('dd', null, v)]));
      }
    });
    return dl;
  };

  /* 合計の並び。items は [{label, value, over}] */
  App.sums = function (items) {
    return App.h('dl', { class: 'sums' }, items.map(function (it) {
      return App.h('div', { class: 'sum' }, [
        App.h('dt', null, it.label),
        App.h('dd', { class: it.over ? 'over-val' : null }, it.value)
      ]);
    }));
  };

  /* ---------- 部品: 履歴 ---------- */

  /* 履歴の値の文字。bare のときは、項目名が単位で終われば値に単位を付けない（「時間 104.5」） */
  function logValue(key, v, bare) {
    if (v === null || v === undefined || v === '') return NO_VALUE;
    if (typeof v === 'number') {
      if (/時間/.test(key)) return App.fmt.hours(v) + (bare && /時間$/.test(key) ? '' : '時間');
      if (/額|予算|単価|費|残/.test(key)) return App.fmt.yen(v) + (bare && /円$/.test(key) ? '' : '円');
      return App.fmt.num(v);
    }
    if (typeof v === 'boolean') return v ? 'あり' : 'なし';
    return String(v);
  }

  /* 日付、金額、番号、時間と、16文字までの英数字の番号（取引先の請求書番号など） */
  var SHORT_VALUE = new RegExp('^(?:' + NW_RE.source + '|[−-]?\\d[\\d,]*(?:\\.\\d+)?' +
    '|(?=[A-Za-z0-9-]{1,16}$)[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)$');

  /* 変えた項目。両側の物は「項目をAからBに」、後の値だけの物は「項目 値」、前の値だけの物は「項目 値 を消去」。
     項目名と値の間は改行しない空白にする。片側だけで値が日付、金額、番号、時間の物は、項目名と値の対を span.nw で包む */
  function changeNodes(before, after) {
    before = before || {};
    after = after || {};
    var keys = Object.keys(before);
    Object.keys(after).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); });
    if (!keys.length) return null;
    var frag = document.createDocumentFragment();
    keys.forEach(function (k, n) {
      var from = has(before, k) ? logValue(k, before[k]) : NO_VALUE;
      var to = has(after, k) ? logValue(k, after[k]) : NO_VALUE;
      if (n) frag.appendChild(document.createTextNode('、'));
      if (from !== NO_VALUE && to !== NO_VALUE) {
        frag.appendChild(App.nw(k + 'を' + from + 'から' + to + 'に'));
        return;
      }
      var cleared = from !== NO_VALUE;
      var v = logValue(k, cleared ? before[k] : after[k], true);
      if (SHORT_VALUE.test(v)) {
        frag.appendChild(App.h('span', { class: 'nw' }, k + ' ' + v));
        if (cleared) frag.appendChild(document.createTextNode(' を消去'));
      } else {
        frag.appendChild(App.nw(k + ' ' + v + (cleared ? ' を消去' : '')));
      }
    });
    return frag;
  }

  /* 番号に関わる履歴を新しい順に返す。deep で工事に属する発注や請求の履歴も含める */
  App.historyFor = function (list, opts) {
    list = Array.isArray(list) ? list : [list];
    opts = opts || {};
    var out = [];
    D().history.forEach(function (h, i) {
      var t = String(h.target || '');
      var hit = list.some(function (no) {
        if (t === no || t.indexOf(no + ' ') === 0) return true;
        if (opts.related && String(h.related || '').split(/[、,\s]+/).indexOf(no) >= 0) return true;
        return !!opts.deep && koujiOfNo(t) === no;
      });
      if (hit) out.push({ h: h, i: i });
    });
    out.sort(function (a, b) { return a.h.at === b.h.at ? b.i - a.i : (a.h.at < b.h.at ? 1 : -1); });
    return out.map(function (x) { return x.h; });
  };

  var LOG_FIRST = 10;

  /* 履歴の一覧。理由は折りたたまない。
     新しい10件を出し、残りは一覧の下の「前の履歴を表示」で全部出す。印刷では全件を出す */
  App.log = function (entries, opts) {
    opts = opts || {};
    if (!entries.length) return App.h('p', { class: 'empty' }, opts.empty || '履歴はありません');
    var key = (lastPath || '') + '|' + (logSeq++);
    var rest = logOpen[key] ? 0 : entries.length - LOG_FIRST;
    var list = App.h('ol', { class: 'log', 'aria-label': opts.label || '履歴' }, entries.map(function (h, n) {
      var target = String(h.target || '');
      var href = opts.link === false ? '' : App.hrefOf(target);
      var detail = changeNodes(h.before, h.after);
      return App.h('li', { class: rest > 0 && n >= LOG_FIRST ? 'is-old' : null }, [
        App.h('span', { class: 'log-time' }, App.fmt.datetime(h.at)),
        App.h('span', { class: 'log-who' }, h.user + (h.role ? '（' + h.role + '）' : '')),
        App.h('span', null, [h.op + ' ', href ? App.h('a', { href: href }, target) : target]),
        detail ? App.h('span', { class: 'log-detail' }, detail) : null,
        h.related ? App.h('span', { class: 'log-detail' }, ['関連 ', nwIn(App.noLinks(String(h.related).split(/[、,\s]+/).filter(Boolean)))]) : null,
        h.reason ? App.h('span', { class: 'log-reason' }, ['理由 ', App.nw(h.reason)]) : null
      ]);
    }));
    if (rest <= 0) return list;
    var box = App.h('div', { class: 'log-box' }, list);
    var more = App.h('p', { class: 'log-more' }, App.button('前の履歴を表示（残り ' + rest + '件）', {
      small: true,
      onClick: function () {
        logOpen[key] = true;
        var olds = Array.prototype.slice.call(list.querySelectorAll('li.is-old'));
        olds.forEach(function (li) { li.classList.remove('is-old'); });
        box.removeChild(more);
        if (olds[0]) {
          olds[0].setAttribute('tabindex', '-1');
          try { olds[0].focus({ preventScroll: true }); } catch (e) { olds[0].focus(); }
        }
      }
    }));
    append(box, more);
    return box;
  };

  /* ---------- 部品: CSV と印刷 ---------- */

  function csvCell(v) {
    var s;
    if (typeof v === 'number') s = isFinite(v) ? String(v) : '';
    else {
      s = v === null || v === undefined ? '' : String(v);
      if (/^[=+\-@]/.test(s)) s = "'" + s;
    }
    return '"' + s.replace(/"/g, '""') + '"';
  }

  /* columns: [{label, value(row)}]。数値の列は value が数値を返せばそのまま出る */
  App.csvText = function (columns, rows) {
    var lines = [columns.map(function (c) { return csvCell(c.label); }).join(',')];
    rows.forEach(function (r) {
      lines.push(columns.map(function (c) {
        return csvCell(typeof c.value === 'function' ? c.value(r) : r[c.key]);
      }).join(','));
    });
    return lines.join('\r\n') + '\r\n';
  };

  /* UTF-8（BOM 付き）、改行 CRLF で保存させる。作った文字列を返す */
  App.csv = function (filename, columns, rows) {
    var text = App.csvText(columns, rows);
    var blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = App.h('a', { href: url, download: filename, hidden: true });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    return text;
  };

  /* 印刷の間だけ、data-print を持つ選択肢の文字をその値に替える */
  function printLabels(on) {
    Array.prototype.forEach.call(document.querySelectorAll('option[data-print]'), function (op) {
      if (on) {
        if (!op.hasAttribute('data-label')) op.setAttribute('data-label', op.textContent);
        op.textContent = op.getAttribute('data-print');
      } else if (op.hasAttribute('data-label')) {
        op.textContent = op.getAttribute('data-label');
        op.removeAttribute('data-label');
      }
    });
  }

  /* 印刷。メニュー、役割の切り替え、ボタンは印刷用の CSS で外れる */
  App.print = function () {
    closeDialogs();
    window.print();
  };

  /* ---------- 部品: ダイアログ ---------- */

  var dialogs = [];
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function focusIn(el) {
    if (!el || !el.focus) return;
    try { el.focus({ preventScroll: false }); } catch (e) { el.focus(); }
  }

  /* 開いているダイアログを全て閉じる。画面の描き直しと印刷の前に呼ぶ */
  function closeDialogs() {
    while (dialogs.length) dialogs[dialogs.length - 1].close('closeAll');
  }
  App.closeDialogs = closeDialogs;

  function bodyLines(text, more) {
    var out = [];
    if (text) out.push(text.nodeType ? nwIn(text) : App.h('p', null, App.nw(text)));
    (more || []).forEach(function (l) { if (l) out.push(l.nodeType ? nwIn(l) : App.h('p', null, App.nw(l))); });
    return out;
  }

  /* 開くと最初の入力欄（無ければ最初のボタン）に移る。Tab は中で回り、Esc で閉じる。
     Enter は入力欄の上でだけ主な操作を押す（複数行の欄は改行のまま）。閉じると開いた元の要素に戻る。
     o: title, body（要素か文字の配列）, id, actions [{label, primary, id, disabled, verdict, onClick(handle)}], onClose(why),
        top（true なら本文の先頭を見せたまま、送らずに最初の入力欄へ移る）
     onClick が false を返すと開いたまま。戻り値 {el, body, actions, close(why)} */
  App.dialog = function (o) {
    o = o || {};
    var opener = document.activeElement;
    var tid = newId('dlg-title');
    var body = App.h('div', { class: 'dlg-body' }, o.body);
    var bar = App.h('div', { class: 'dlg-actions' });
    var box = App.h('div', { class: 'dlg', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid, id: o.id },
      [App.h('h2', { class: 'dlg-title', id: tid }, o.title || ''), body, bar]);
    var back = App.h('div', { class: 'dlg-back' });
    var handle = { el: box, body: body, actions: bar, closed: false };
    var primary = null;

    function run(a) {
      if (handle.closed) return;
      var r = typeof a.onClick === 'function' ? a.onClick(handle) : undefined;
      if (r && typeof r.then === 'function') {
        r.then(function (v) { if (v !== false) handle.close('done'); });
      } else if (r !== false) {
        handle.close(a.primary ? 'done' : 'cancel');
      }
    }

    var acts = o.actions && o.actions.length ? o.actions : [{ label: '閉じる' }];
    acts.forEach(function (a) {
      var off = !!a.disabled || (a.verdict && !a.verdict.ok);
      append(bar, App.button(a.label, {
        primary: a.primary, id: a.id, disabled: a.disabled, verdict: a.verdict,
        onClick: function () { run(a); }
      }));
      if (a.primary && !off && !primary) primary = a;
    });

    function onKey(e) {
      if (dialogs[dialogs.length - 1] !== handle) return;
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handle.close('cancel');
        return;
      }
      if (e.key === 'Tab') {
        var list = Array.prototype.filter.call(box.querySelectorAll(FOCUSABLE), function (x) {
          return x.offsetWidth > 0 || x.offsetHeight > 0;
        });
        if (!list.length) { e.preventDefault(); return; }
        var first = list[0], last = list[list.length - 1], at = document.activeElement;
        if (!box.contains(at)) { e.preventDefault(); focusIn(e.shiftKey ? last : first); }
        else if (e.shiftKey && at === first) { e.preventDefault(); focusIn(last); }
        else if (!e.shiftKey && at === last) { e.preventDefault(); focusIn(first); }
        return;
      }
      if (e.key === 'Enter' && primary) {
        var t = e.target;
        if (!box.contains(t) || ['INPUT', 'SELECT'].indexOf(t.tagName) < 0) return;
        e.preventDefault();
        run(primary);
      }
    }

    handle.close = function (why) {
      if (handle.closed) return;
      handle.closed = true;
      document.removeEventListener('keydown', onKey, true);
      if (box.parentNode) box.parentNode.removeChild(box);
      if (back.parentNode) back.parentNode.removeChild(back);
      var i = dialogs.indexOf(handle);
      if (i >= 0) dialogs.splice(i, 1);
      if (typeof o.onClose === 'function') o.onClose(why || 'cancel');
      if (opener && opener !== document.body && document.body.contains(opener)) focusIn(opener);
    };

    document.body.appendChild(back);
    document.body.appendChild(box);
    dialogs.push(handle);
    document.addEventListener('keydown', onKey, true);
    var start = body.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])') ||
      bar.querySelector('button:not([disabled])');
    if (!start) {
      box.setAttribute('tabindex', '-1');
      start = box;
    }
    if (o.top) {
      try { start.focus({ preventScroll: true }); } catch (e) { start.focus(); }
      box.scrollTop = 0;
    } else {
      focusIn(start);
    }
    return handle;
  };

  /* 取り消せない操作の確認。実行を押すと true、やめるか Esc で false で解決する。
     最初に選ばれているのは「やめる」なので、Enter だけでは実行されない */
  App.confirm = function (text, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var yes = false;
      App.dialog({
        title: opts.title || '確認',
        id: opts.dialogId,
        body: bodyLines(text, opts.lines),
        actions: [
          { label: opts.cancel || 'やめる', id: opts.cancelId },
          { label: opts.ok || '実行する', primary: true, id: opts.id, onClick: function () { yes = true; } }
        ],
        onClose: function () { resolve(yes); }
      });
    });
  };

  /* 理由を入れて実行する。取り消せない操作では、これがそのまま確認になる。
     submit(reason) が ok: false を返すと、理由の欄の下に出して開いたままにする。
     opts.danger が true なら、実行のボタンを主な操作の見た目にしない。
     解決する値: submit の戻り値（submit が無ければ理由の文字列）。やめたときは null */
  App.confirmWithReason = function (text, opts) {
    opts = opts || {};
    var was = dirty, openHash = current.hash;
    return new Promise(function (resolve) {
      var result = null;
      var f = App.field({
        name: 'reason', label: opts.label || '理由', type: 'textarea',
        required: opts.required !== false, max: opts.max || 200, value: opts.value, hint: opts.hint
      });
      App.dialog({
        title: opts.title || '理由を入れてください',
        id: opts.dialogId,
        body: bodyLines(text, opts.lines).concat([f]),
        actions: [
          { label: opts.cancel || 'やめる', id: opts.cancelId },
          {
            label: opts.ok || '実行する', primary: !opts.danger, id: opts.id,
            onClick: function () {
              if (f.check()) { focusIn(f.control); return false; }
              var reason = f.get();
              var r = typeof opts.submit === 'function' ? opts.submit(reason) : reason;
              if (r && r.ok === false) {
                var e = r.errors || {};
                f.setError(e.reason || e.overReason || r.reason || '実行できませんでした');
                focusIn(f.control);
                return false;
              }
              result = r === undefined ? reason : r;
            }
          }
        ],
        onClose: function () {
          /* 画面を移った後に閉じたときは、移った先の印をそのままにする */
          if (result === null && current.hash === openHash) dirty = was;
          /* submit の中で描き直して閉じた場合も、戻り値が決まってから解決する */
          Promise.resolve().then(function () { resolve(result); });
        }
      });
    });
  };

  /* ---------- 部品: 入力欄 ---------- */

  var FIELD_UNIT = { yen: '円', hours: '時間' };
  var MONTH_MSG = '年月は 2026-09 の形で入れてください';

  function fieldText(type, v) {
    if (blank(v)) return '';
    if (type === 'yen') {
      var n = typeof v === 'number' ? v : App.parse.yen(v);
      return typeof n === 'number' && !isNaN(n) ? App.fmt.yen(n) : String(v);
    }
    if (type === 'date') return App.fmt.date(v);
    if (type === 'month') return App.fmt.month(v);
    return String(v);
  }

  function optionList(list) {
    return (list || []).map(function (x) { return x && typeof x === 'object' ? x : { value: x, label: x }; });
  }

  /* 1項目の入力欄。
     o: name, label, type（text, yen, hours, date, month, select, textarea, check, fixed）, value, required,
        options（[{value, label}] か文字の配列）, unit, hint, max, min, step, placeholder,
        disabled（入れられない理由）, editable と lockReason（App.koujiFields などの項目をそのまま渡せる）,
        span2, error, check(値)（誤りの文言を返す。空の欄でも呼ぶ）, onInput(値, 欄)
     金額は全角の数字とカンマも受け、欄を離れると3桁区切りに整える。日付は 2026-09-08 の形に整える。
     fixed は変えられない値を文字で出し、保存のときは value をそのまま送る。
     誤りは欄を離れたとき（一度でも書き換えた欄だけ）と保存のときに欄の下へ出す。
     戻り値の要素に control, name, get(), set(値), check(), setError(文言) が付く。select には setOptions(選択肢) も付く */
  App.field = function (o) {
    o = o || {};
    var type = o.type || 'text';
    var id = newId('f');
    var lock = type === 'fixed' ? '' : o.disabled || (o.editable === false ? (o.lockReason || true) : '');
    var label = o.label || '';
    var fixedValue = blank(o.value) ? '' : String(o.value);
    var ctl;
    function fillSelect(list, value) {
      ctl.textContent = '';
      if (blank(value) || !o.required) append(ctl, App.h('option', { value: '' }, o.required ? '選んでください' : '指定なし'));
      list.forEach(function (x) {
        append(ctl, App.h('option', { value: x.value, 'data-print': x.print }, x.label === undefined ? String(x.value) : x.label));
      });
      ctl.value = blank(value) ? '' : String(value);
    }
    if (type === 'select') {
      ctl = App.h('select', { class: 'select', id: id, name: o.name });
      fillSelect(optionList(o.options), o.value);
    } else if (type === 'textarea') {
      ctl = App.h('textarea', { class: 'textarea', id: id, name: o.name, rows: o.rows || 3, placeholder: o.placeholder });
      ctl.value = blank(o.value) ? '' : String(o.value);
    } else if (type === 'check') {
      ctl = App.h('input', { type: 'checkbox', id: id, name: o.name });
      ctl.checked = !!o.value;
    } else if (type === 'fixed') {
      ctl = App.h('p', { class: 'field-fixed', id: id }, fixedValue);
    } else {
      ctl = App.h('input', {
        type: 'text', id: id, name: o.name, autocomplete: 'off',
        class: type === 'yen' || type === 'hours' ? 'input num' : 'input',
        inputmode: type === 'yen' ? 'numeric' : (type === 'hours' ? 'decimal' : null),
        placeholder: o.placeholder || (lock ? null : (type === 'date' ? '年-月-日' : (type === 'month' ? '年-月' : null)))
      });
      ctl.value = fieldText(type, o.value);
    }
    if (lock) ctl.disabled = true;

    var wide = o.span2 || (type === 'textarea' && o.span2 !== false);
    var field = App.h('div', { class: ['field', wide ? 'span-2' : ''], 'data-name': o.name });
    var desc = [];
    if (type === 'check') {
      append(field, App.h('label', { class: 'check' }, [ctl, App.h('span', null, label)]));
    } else if (type === 'fixed') {
      append(field, [App.h('span', { class: 'field-label' }, label), ctl]);
    } else {
      var lab = App.h('label', { class: 'field-label', for: id }, label);
      if (o.required && !lock) append(lab, App.h('span', { class: 'req' }, '必須'));
      append(field, lab);
      var unit = o.unit || FIELD_UNIT[type];
      if (unit) {
        desc.push(id + '-unit');
        append(field, App.h('div', { class: lock ? 'input-wrap is-disabled' : 'input-wrap' },
          [ctl, App.h('span', { class: 'unit', id: id + '-unit' }, unit)]));
      } else {
        append(field, ctl);
      }
    }
    var note = lock ? (typeof lock === 'string' ? lock : '') : o.hint;
    if (note) {
      desc.push(id + '-hint');
      append(field, App.h('p', { class: 'hint', id: id + '-hint' }, nwAny(note)));
    }
    var err = App.h('p', { class: 'err', id: id + '-err', hidden: true });
    append(field, err);

    function describe(withErr) {
      var list = withErr ? desc.concat([err.id]) : desc;
      if (list.length) ctl.setAttribute('aria-describedby', list.join(' '));
      else ctl.removeAttribute('aria-describedby');
    }
    function setError(msg) {
      msg = msg || '';
      err.textContent = '';
      append(err, App.nw(msg));
      err.hidden = !msg;
      field.classList.toggle('is-err', !!msg);
      if (msg) ctl.setAttribute('aria-invalid', 'true');
      else ctl.removeAttribute('aria-invalid');
      describe(!!msg);
    }
    function get() {
      if (type === 'check') return ctl.checked;
      if (type === 'fixed') return fixedValue;
      return ctl.value.trim();
    }
    function problem() {
      if (ctl.disabled || type === 'fixed') return '';
      var v = get();
      if (type !== 'check' && v === '' && o.required) return label + (type === 'select' ? 'を選んでください' : 'を入れてください');
      /* 空の欄も check に渡す（条件で必須になる欄のため） */
      if (type !== 'check' && v !== '') {
        if (type === 'yen') {
          var n = App.parse.yen(v);
          if (isNaN(n)) return label + 'は数字で入れてください';
          if (o.min !== undefined && o.min !== null && n < o.min) return label + 'は' + App.fmt.yen(o.min) + '円以上にします';
        } else if (type === 'hours') {
          var h = App.parse.hours(v);
          if (App.parse.minus(v)) return label + 'は0以上で入れてください';
          if (isNaN(h)) return label + 'は数字で入れてください';
          if (o.step && Math.abs(h / o.step - Math.round(h / o.step)) > 1e-9) return label + 'は' + o.step + '刻みで入れてください';
        } else if (type === 'date') {
          if (App.parse.date(v) === false) return DATE_MSG;
        } else if (type === 'month') {
          if (App.parse.month(v) === false) return MONTH_MSG;
        } else if (o.max && v.length > o.max) {
          return label + 'は' + o.max + '字までです';
        }
      }
      return typeof o.check === 'function' ? (o.check(v) || '') : '';
    }
    /* 読める値だけ決まった形に直す。読めない値はそのまま残して誤りを出す */
    function tidy() {
      var v = get();
      if (v === '' || type === 'check') return;
      var p = null;
      if (type === 'yen') { p = App.parse.yen(v); if (!isNaN(p)) ctl.value = App.fmt.yen(p); }
      else if (type === 'hours') { p = App.parse.hours(v); if (!isNaN(p)) ctl.value = String(p); }
      else if (type === 'date') { p = App.parse.date(v); if (p) ctl.value = p; }
      else if (type === 'month') { p = App.parse.month(v); if (p) ctl.value = p; }
    }

    /* 値が空の欄に data-empty を付ける。印刷では欄の代わりに「–」を出す。check と fixed には付けない */
    function markEmpty() {
      if (type === 'check' || type === 'fixed') return;
      if (get() === '') field.setAttribute('data-empty', '');
      else field.removeAttribute('data-empty');
    }
    ctl.addEventListener('input', markEmpty);
    ctl.addEventListener('change', markEmpty);

    var touched = false;
    ctl.addEventListener(type === 'select' || type === 'check' ? 'change' : 'input', function () {
      touched = true;
      dirty = true;
      if (field.classList.contains('is-err') && !problem()) setError('');
      if (typeof o.onInput === 'function') o.onInput(get(), field);
    });
    ctl.addEventListener('blur', function () {
      if (!touched && !field.classList.contains('is-err')) return;
      tidy();
      setError(problem());
    });

    describe(false);
    markEmpty();
    if (o.error) setError(o.error);
    field.control = ctl;
    field.name = o.name || '';
    field.type = type;
    field.get = get;
    field.set = function (v) {
      if (type === 'fixed') { fixedValue = blank(v) ? '' : String(v); ctl.textContent = fixedValue; }
      else if (type === 'check') ctl.checked = !!v;
      else if (type === 'select' || type === 'textarea') ctl.value = blank(v) ? '' : String(v);
      else ctl.value = fieldText(type, v);
      markEmpty();
    };
    field.check = function () {
      tidy();
      var m = problem();
      setError(m);
      return m;
    };
    field.setError = setError;
    /* 選択肢の差し替え。今の値が新しい選択肢に無ければ空に戻す */
    if (type === 'select') {
      field.setOptions = function (list) {
        var opts = optionList(list);
        var cur = ctl.value;
        var keep = opts.some(function (x) { return String(x.value) === cur; });
        fillSelect(opts, keep ? cur : '');
        markEmpty();
        return keep;
      };
    }
    return field;
  };

  /* ---------- 部品: フォーム ---------- */

  function uniq(list) { return list.filter(function (x, i) { return x && list.indexOf(x) === i; }); }

  /* 入力欄を並べたフォーム。
     o: fields（App.field の設定か組んだ欄）, onSubmit(values, form)（App.act の結果などを返す）,
        submitLabel, submitId, disabled（保存できない理由）, verdict, cancel {label, onClick}, lead,
        actions（false でボタンを付けない。ダイアログの中で使う）
     保存の前に全ての欄を検査し、誤りがあれば最初の誤りの欄に移る。onSubmit が ok: false を返したときも同じ。
     戻り値の要素に fields, field(name), values(), validate(), showErrors(errors, reasons), clearErrors(), send() が付く */
  App.form = function (o) {
    o = o || {};
    var fields = (o.fields || []).map(function (f) { return f && f.nodeType ? f : App.field(f); });
    var form = App.h('form', { novalidate: true });
    var msg = App.h('div');
    if (o.lead) append(form, o.lead.nodeType ? o.lead : App.h('p', null, o.lead));
    append(form, [msg, App.h('div', { class: 'form' }, fields)]);
    if (o.actions !== false) {
      append(form, App.h('div', { class: 'form-actions' }, [
        App.button(o.submitLabel || '保存', { primary: true, type: 'submit', id: o.submitId, disabled: o.disabled, verdict: o.verdict }),
        o.cancel ? App.button(o.cancel.label || 'やめる', { onClick: o.cancel.onClick }) : null
      ]));
    }

    function byName(name) {
      for (var i = 0; i < fields.length; i++) if (fields[i].name === name) return fields[i];
      return null;
    }
    function usable(f) { return f && f.name && f.get && !(f.control && f.control.disabled); }

    form.fields = fields;
    form.field = byName;
    form.values = function () {
      var v = {};
      fields.forEach(function (f) { if (usable(f)) v[f.name] = f.get(); });
      return v;
    };
    form.clearErrors = function () {
      msg.textContent = '';
      fields.forEach(function (f) { if (f.setError) f.setError(''); });
    };
    /* errors は {欄の名前: 文言}。欄が無い誤りと reasons（文字か配列）は、フォームの上の枠に出す */
    form.showErrors = function (errors, reasons) {
      errors = errors || {};
      form.clearErrors();
      var under = [], rest = [];
      Object.keys(errors).forEach(function (k) {
        var f = byName(k);
        if (usable(f) && f.setError) {
          f.setError(errors[k]);
          under.push(errors[k]);
        } else {
          rest.push(errors[k]);
        }
      });
      var top = uniq((typeof reasons === 'string' ? [reasons] : (reasons || [])).concat(rest))
        .filter(function (t) { return under.indexOf(t) < 0; });
      if (top.length) append(msg, App.notice(top[0], { plain: true, lines: top.slice(1), role: 'alert' }));
      var first = null;
      fields.forEach(function (f) { if (!first && f.classList.contains('is-err')) first = f; });
      if (first) {
        focusIn(first.control);
      } else if (top.length) {
        msg.setAttribute('tabindex', '-1');
        focusIn(msg);
      }
    };
    /* 全ての欄を検査して誤りを欄の下に出す。誤りがあれば最初の誤りの欄に移る */
    form.validate = function () {
      var errs = {};
      fields.forEach(function (f) {
        if (usable(f) && f.check) {
          var m = f.check();
          if (m) errs[f.name] = m;
        }
      });
      var keys = Object.keys(errs);
      if (keys.length) form.showErrors(errs);
      else msg.textContent = '';
      return { ok: !keys.length, reason: keys.length ? errs[keys[0]] : '', reasons: [], errors: errs };
    };
    form.send = function () {
      var chk = form.validate();
      if (!chk.ok) return chk;
      var values = form.values();
      if (typeof o.onSubmit !== 'function') return { ok: true, values: values };
      var r = o.onSubmit(values, form);
      if (r && r.ok === false) {
        form.showErrors(r.errors, r.reasons && r.reasons.length ? r.reasons : r.reason);
      } else {
        form.clearErrors();
        dirty = false;
      }
      return r;
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.send();
    });
    return form;
  };

  /* 入力欄を並べたダイアログ。
     o: title, text, lines, fields, ok（保存のボタンの文字）, cancel, okId, id, verdict, submit(values, form)
     submit が ok: false を返すと、欄の下（欄の無い誤りは上の枠）に出して開いたままにする。
     解決する値: submit の戻り値（submit が無ければ values）。やめたときは null */
  App.formDialog = function (o) {
    o = o || {};
    var was = dirty, openHash = current.hash;
    /* 編集できない理由が同じ欄が2つ以上あれば、その理由は欄の並びの上に1回だけ出す */
    var specs = o.fields || [];
    var count = {};
    specs.forEach(function (f) {
      if (f && !f.nodeType && f.editable === false && typeof f.lockReason === 'string' && f.lockReason) {
        count[f.lockReason] = (count[f.lockReason] || 0) + 1;
      }
    });
    var shared = Object.keys(count).filter(function (t) { return count[t] >= 2; });
    var fields = specs.map(function (f) {
      if (f && !f.nodeType && f.editable === false && shared.indexOf(f.lockReason) >= 0) {
        return Object.assign({}, f, { lockReason: true });
      }
      return f;
    });
    var lead = shared.length ? App.h('div', null, shared.map(function (t) {
      return App.h('p', { class: 'hint' }, App.nw(t));
    })) : null;
    return new Promise(function (resolve) {
      var result = null;
      var form = App.form({ fields: fields, lead: lead, actions: false, onSubmit: o.submit });
      App.dialog({
        title: o.title || '',
        id: o.id,
        top: true,
        body: bodyLines(o.text, o.lines).concat([form]),
        actions: [
          { label: o.cancel || 'やめる', id: o.cancelId },
          {
            label: o.ok || '保存', primary: true, id: o.okId, verdict: o.verdict,
            onClick: function () {
              var r = form.send();
              if (r && r.ok === false) return false;
              result = typeof o.submit === 'function' && r !== undefined ? r : form.values();
            }
          }
        ],
        onClose: function () {
          if (result === null && current.hash === openHash) dirty = was;
          Promise.resolve().then(function () { resolve(result); });
        }
      });
    });
  };

  /* 工事の登録と基本情報の編集のダイアログ。工事一覧と工事詳細で共用する。kouji を省くと登録。
     通ると知らせを預け、登録なら工事詳細へ移り、編集なら描き直す。解決する値: App.act の結果。やめたときは null */
  App.koujiDialog = function (kouji) {
    var k = rec('kouji', kouji);
    var op = k ? 'kouji.edit' : 'kouji.register';
    var ctx = k ? { kouji: k.no } : null;
    return App.formDialog({
      title: k ? '基本情報を編集' : '工事を登録',
      id: 'dlg-kouji',
      okId: 'kouji-save',
      text: k ? '工事 ' + k.no + ' ' + k.name : '',
      fields: App.koujiFields(k),
      ok: k ? '保存' : '登録',
      verdict: App.can(op, ctx),
      submit: function (values) { return App.act(op, ctx, values); }
    }).then(function (res) {
      if (!res || !res.ok) return res;
      App.flash(res);
      if (k) App.render();
      else App.go(App.link(['kouji', res.no]));
      return res;
    });
  };

})();
