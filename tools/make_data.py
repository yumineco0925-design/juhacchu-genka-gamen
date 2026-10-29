"""サンプルデータ assets/data.js を生成する。

基礎表（社員、取引先、工事と実行予算の当初）は手で書き、
発注、発注検収、請求、予算改定、労務費、履歴、締めは
操作を日時の順に実行して組み立てる。操作ごとに決まりごとを確かめ、
最後の自己検査を全て通ったときだけ data.js を書き出す。

使い方: python make_data.py
"""
import calendar
import json
import os
import random
import sys
from datetime import date, timedelta

SEED = 20260908
rng = random.Random(SEED)

BASE_DATE = '2026-09-08'
COMPANY = '青嶺設備工業株式会社'
LABOR_RATE = 4650
CATS = ['材料費', '外注費', '労務費', '経費']
ORDER_CATS = ['材料費', '外注費', '経費']
MONTHS = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']
HEADER = '// 架空の会社の資料です（自主制作）'

# ---- 基礎表 ----

EMPLOYEES = [
    {'id': 'E01', 'name': '島田', 'role': '営業'},
    {'id': 'E02', 'name': '野口', 'role': '営業'},
    {'id': 'E03', 'name': '松浦', 'role': '工事担当'},
    {'id': 'E04', 'name': '久保', 'role': '工事担当'},
    {'id': 'E05', 'name': '早川', 'role': '工事担当'},
    {'id': 'E06', 'name': '中西', 'role': '工事担当'},
    {'id': 'E07', 'name': '岩崎', 'role': '購買'},
    {'id': 'E08', 'name': '三浦', 'role': '経理'},
]
EMP = {e['id']: e for e in EMPLOYEES}
ROLES = {'eigyo': '営業', 'tanto': '工事担当', 'kobai': '購買', 'keiri': '経理'}
ROLE_USERS = {'eigyo': 'E01', 'tanto': 'E03', 'kobai': 'E07', 'keiri': 'E08'}

# 支払条件: 締め日（0は末日）、何か月後、支払日（0は末日）
TERMS = {
    '月末締め翌月末払い': {'closeDay': 0, 'months': 1, 'payDay': 0},
    '月末締め翌々月10日払い': {'closeDay': 0, 'months': 2, 'payDay': 10},
    '20日締め翌月10日払い': {'closeDay': 20, 'months': 1, 'payDay': 10},
    '月末締め翌々月末払い': {'closeDay': 0, 'months': 2, 'payDay': 0},
    '25日締め翌月末払い': {'closeDay': 25, 'months': 1, 'payDay': 0},
}

_P = [
    ('T-101', '桐原ビル管理株式会社', '施主', '相沢', '月末締め翌月末払い', '取引中', '2019-06-12'),
    ('T-102', '株式会社朝陽不動産', '施主', '大西', '月末締め翌月末払い', '取引中', '2021-02-08'),
    ('T-103', '医療法人 碧水会', '施主', '片山', '月末締め翌々月末払い', '取引中', '2022-09-20'),
    ('T-104', '社会福祉法人 楓の会', '施主', '石井', '月末締め翌月末払い', '取引中', '2023-04-03'),
    ('T-105', '株式会社丸越フーズ', '施主', '平野', '20日締め翌月10日払い', '取引中', '2020-11-16'),
    ('T-106', '葵管材株式会社', '仕入先', '川村', '月末締め翌々月10日払い', '取引中', '2015-05-11'),
    ('T-107', '株式会社光陽電材', '仕入先', '西田', '20日締め翌月10日払い', '取引中', '2017-08-01'),
    ('T-108', '白鷺空調機器株式会社', '仕入先', '小池', '月末締め翌々月末払い', '取引中', '2016-03-22'),
    ('T-109', '株式会社銀河防災用品', '仕入先', '堀', '月末締め翌月末払い', '取引中', '2018-10-05'),
    ('T-110', '株式会社杉本建材', '仕入先', '杉本', '25日締め翌月末払い', '取引中', '2014-07-14'),
    ('T-111', '有限会社村瀬設備', '外注先', '村瀬', '月末締め翌々月10日払い', '取引中', '2013-04-08'),
    ('T-112', '株式会社岡野電気工事', '外注先', '岡野', '月末締め翌々月末払い', '取引中', '2016-09-26'),
    ('T-113', '株式会社星野保温', '外注先', '星野', '20日締め翌月10日払い', '取引中', '2019-01-21'),
    ('T-114', '有限会社丸山ダクト', '外注先', '丸山', '25日締め翌月末払い', '取引中', '2018-05-28'),
    ('T-115', '株式会社新井塗装', '外注先', '新井', '月末締め翌月末払い', '停止', '2012-10-01'),
]
PARTNERS = [dict(code=c, name=n, kind=k, contact=p, terms=t, status=s, registeredOn=r, note='')
            for c, n, k, p, t, s, r in _P]
PARTNER = {p['code']: p for p in PARTNERS}


def _k(no, name, client, site, kind, sales, manager, estimate, contract, budget, plan_start, plan_end):
    return dict(no=no, name=name, client=client, site=site, kind=kind, sales=sales, manager=manager,
                estimate=estimate, contract=contract, budget0=dict(zip(CATS, budget)),
                planStart=plan_start, planEnd=plan_end)


# 実行予算（当初）の並びは 材料費、外注費、労務費、経費
KOUJI_BASE = [
    _k('26-001', '事務所フロア空調機更新', 'T-101', '本町2丁目 桐原第二ビル', '空調', 'E01', 'E04',
       1036800, 978500, (324600, 268400, 143700, 94300), '2026-07-06', '2026-07-24'),
    _k('26-002', '給湯設備更新', 'T-103', '桜台1丁目 碧水会クリニック', '給排水', 'E02', 'E05',
       6712000, 6482000, (2184600, 1736400, 790500, 312800), '2026-05-25', '2026-07-31'),
    _k('26-003', '自動火災報知設備・誘導灯更新', 'T-104', '旭町3丁目 楓の杜ホーム', '消防', 'E01', 'E06',
       4026000, 3864000, (1286400, 1148700, 511500, 146200), '2026-06-15', '2026-08-07'),
    _k('26-004', '厨房排気ダクト改修', 'T-105', '港町2丁目 丸越フーズ第一工場', '改修', 'E02', 'E03',
       12860000, 12386000, (3864200, 5218600, 1432200, 486500), '2026-05-25', '2026-08-28'),
    _k('26-005', '空調設備更新（全館）', 'T-101', '本町2丁目 桐原第一ビル', '空調', 'E01', 'E03',
       49860000, 48316000, (18642300, 14286500, 3718600, 1462800), '2026-04-20', '2026-10-30'),
    _k('26-006', '受変電設備更新', 'T-102', '緑町4丁目 朝陽ビル', '電気', 'E01', 'E06',
       19480000, 18946000, (7684300, 5426800, 2027400, 624600), '2026-04-27', '2026-08-31'),
    _k('26-007', '給排水衛生設備改修（病棟）', 'T-103', '桜台1丁目 碧水会病院', '衛生', 'E02', 'E04',
       9864000, 9468000, (3146800, 3286400, 1209000, 318600), '2026-06-22', '2026-10-09'),
    _k('26-008', '非常用照明・幹線改修', 'T-102', '緑町4丁目 朝陽第二ビル', '電気', 'E02', 'E05',
       7564000, 7238000, (2468300, 2284600, 883500, 214300), '2026-07-13', '2026-10-23'),
    _k('26-009', '給水ポンプ・受水槽更新', 'T-105', '港町2丁目 丸越フーズ第二工場', '給排水', 'E01', 'E05',
       16380000, 15824000, (5486200, 4862400, 1627500, 538700), '2026-06-29', '2026-10-16'),
    _k('26-010', '照明設備LED化', 'T-104', '旭町3丁目 楓の杜ホーム東館', '電気', 'E01', 'E06',
       6184000, 5946000, (2386500, 1684200, 697500, 168400), '2026-07-21', '2026-09-30'),
    _k('26-011', '空調機更新（2・3階）', 'T-102', '緑町4丁目 朝陽第三ビル', '空調', 'E01', 'E03',
       4486000, 4318000, (1528600, 1286500, 418500, 126300), '2026-08-17', '2026-10-02'),
    _k('26-012', '浴室給湯配管改修', 'T-103', '桜台1丁目 碧水会ケアセンター', '給排水', 'E02', 'E04',
       3286000, 3164000, (986400, 1124800, 418500, 96800), '2026-10-05', '2026-11-13'),
    _k('26-013', '屋内消火栓設備更新', 'T-105', '港町2丁目 丸越フーズ物流センター', '消防', 'E02', 'E06',
       8146000, 7862000, (2864300, 2638400, 790500, 246800), '2026-10-13', '2026-12-18'),
    _k('26-014', '中央監視設備更新', 'T-101', '本町2丁目 桐原第一ビル', '電気', 'E01', 'E03',
       22640000, None, (8426300, 7184600, 1862300, 612400), '2027-01-12', '2027-03-19'),
    _k('26-015', '厨房給排水改修', 'T-104', '旭町3丁目 楓の杜ホーム', '衛生', 'E02', None,
       1186000, None, (0, 0, 0, 0), '2026-11-09', '2026-11-20'),
]
KB = {k['no']: k for k in KOUJI_BASE}

# ---- 日付と金額の道具 ----


def D(s):
    """'MM-DD' や 'MM-DD HH:MM' を 2026年の日付に補う。"""
    return s if s.startswith('20') else '2026-' + s


def ym(d):
    return d[:7]


def month_end(m):
    y, mo = int(m[:4]), int(m[5:7])
    return '%s-%02d' % (m, calendar.monthrange(y, mo)[1])


def add_months(m, n):
    y, mo = int(m[:4]), int(m[5:7]) - 1 + n
    return '%04d-%02d' % (y + mo // 12, mo % 12 + 1)


def to_date(s):
    return date(int(s[:4]), int(s[5:7]), int(s[8:10]))


def due_date(inv_date, terms_name):
    """請求書の日付に支払条件を当てて支払予定日を出す。"""
    t = TERMS[terms_name]
    m = ym(inv_date)
    if t['closeDay'] and int(inv_date[8:10]) > t['closeDay']:
        m = add_months(m, 1)
    pm = add_months(m, t['months'])
    return month_end(pm) if t['payDay'] == 0 else '%s-%02d' % (pm, t['payDay'])


USED_AMOUNTS = set()


def pick(base):
    """通常と追加の発注金額: 100円単位、1万円ちょうどを避け、同じ数字を2回使わない。"""
    a = int(round(base * rng.uniform(0.985, 1.0) / 100.0)) * 100
    if a % 10000 == 0:
        a += 300
    while a in USED_AMOUNTS:
        a += 300
    USED_AMOUNTS.add(a)
    return a


def part(total, share):
    """一部の額（出来高や分納）を100円単位で出す。"""
    a = int(round(total * share / 100.0)) * 100
    if a % 10000 == 0:
        a += 200
    return a


def half(h):
    """0.5刻みの時間。整数なら int で持つ。"""
    h = round(h * 2) / 2.0
    return int(h) if h == int(h) else h


# ---- 状態と操作 ----

class RuleError(Exception):
    pass


def need(cond, msg):
    if not cond:
        raise RuleError(msg)


# 費目ごとに選べる取引先の区分
ALLOWED = {'材料費': ('仕入先',), '外注費': ('外注先',), '経費': ('仕入先', '外注先')}
CLEAR_LABEL = {'paidOn': '入金日', 'clientBillOn': '施主請求日', 'clientBillAmount': '請求額',
               'clientInspectOn': '施主検収日', 'startOn': '着工日', 'contract': '受注金額',
               'contractOn': '受注日'}


class World:
    def __init__(self):
        self.now = None
        self.kouji = {}
        self.orders = {}
        self.inspections = {}
        self.invoices = {}
        self.revisions = {}
        self.labor = {}
        self.history = []
        self.months = {}
        for m in MONTHS:
            self.months[m] = {'month': m, 'status': '未締め', 'carryover': False,
                              'closeCount': 0, 'closedOn': None}
        self.months['2026-03'].update(status='締め済', carryover=True, closeCount=None)
        self.inv_seq = 90
        self.refs = {}
        self.log = {'draftStatus': {}, 'reduceRemain': {}, 'revBefore': {}, 'terminateCum': {},
                    'rollback': [], 'closeCheck': [], 'receiptOrderStatus': {}}

    # ---- 共通 ----
    @property
    def today(self):
        return self.now[:10]

    def closed(self, m):
        if m < MONTHS[0]:
            return True
        return m in self.months and self.months[m]['status'] == '締め済'

    def first_open_month(self):
        return min(m for m in MONTHS if not self.closed(m))

    @staticmethod
    def role_of(uid):
        return EMP[uid]['role']

    def act(self, uid, *roles):
        need(self.role_of(uid) in roles, '権限: %s は %s' % (uid, '・'.join(roles)))

    def hist(self, uid, target, op, before=None, after=None, reason='', related=''):
        self.history.append({'at': self.now, 'user': EMP[uid]['name'], 'role': EMP[uid]['role'],
                             'target': target, 'op': op, 'before': before or {}, 'after': after or {},
                             'reason': reason or '', 'related': related or ''})

    # ---- 金額 ----
    @staticmethod
    def kind(o):
        if o['amount'] < 0:
            return '減額'
        return '追加' if o['related'] else '通常'

    def eff(self, no):
        red = sum(r['amount'] for r in self.orders.values()
                  if r['related'] == no and r['amount'] < 0 and r['status'] == '承認済')
        return self.orders[no]['amount'] + red

    def insp_of(self, no):
        return [i for i in self.inspections.values() if i['order'] == no]

    def inv_of(self, no):
        return [v for v in self.invoices.values() if v['order'] == no]

    def cum(self, no):
        return sum(i['amount'] for i in self.insp_of(no) if i['status'] == '有効')

    def confirmed(self, no):
        return sum(v['amount'] for v in self.inv_of(no) if v['status'] == '確認済')

    def remaining(self, no):
        if self.orders[no]['status'] in ('打切', '取消'):
            return 0
        return self.eff(no) - self.cum(no)

    def budget(self, k, cat):
        b = self.kouji[k]['budget0'][cat]
        for r in self.revisions.values():
            if r['kouji'] == k and r['cat'] == cat and r['status'] == '承認済':
                b += r['after'] - r['before']
        return b

    def committed(self, k, cat):
        if cat == '労務費':
            return sum(l['amount'] for l in self.labor.values() if l['kouji'] == k and l['recordedOn'])
        s = 0
        for o in self.orders.values():
            if o['kouji'] != k or o['cat'] != cat or o['amount'] < 0:
                continue
            if o['status'] in ('承認済', '検収済'):
                s += self.eff(o['no'])
            elif o['status'] == '打切':
                s += self.cum(o['no'])
        return s

    def incurred(self, k, cat):
        if cat == '労務費':
            return self.committed(k, cat)
        return sum(self.cum(o['no']) for o in self.orders.values()
                   if o['kouji'] == k and o['cat'] == cat and o['amount'] > 0)

    def booked(self, k, cat):
        if cat == '労務費':
            return self.committed(k, cat)
        return sum(self.confirmed(o['no']) for o in self.orders.values()
                   if o['kouji'] == k and o['cat'] == cat and o['amount'] > 0)

    def judge(self, v):
        for w in self.invoices.values():
            if w is v:
                continue
            if w['order'] == v['order'] and w['status'] == '受付':
                return '二重の疑い'
            if (w['partner'] == v['partner'] and w['invoiceNo'] == v['invoiceNo']
                    and w['status'] not in ('取消', '差戻し')):
                return '二重の疑い'
        if not any(i['status'] == '有効' for i in self.insp_of(v['order'])):
            return '発注検収なし'
        if v['amount'] > self.cum(v['order']) - self.confirmed(v['order']):
            return '検収額を超えている'
        return '確定できる'

    def labor_targets(self, month):
        ms, me = month + '-01', month_end(month)
        return [k['no'] for k in self.kouji.values()
                if k['startOn'] and k['startOn'] <= me
                and (k['clientInspectOn'] is None or k['clientInspectOn'] >= ms)]

    def completion_issues(self, no):
        out = []
        for o in self.orders.values():
            if o['kouji'] != no:
                continue
            if o['amount'] < 0:
                if o['status'] == '起票':
                    out.append(('起票のままの減額発注', o['no']))
                continue
            if o['status'] not in ('検収済', '取消', '打切'):
                out.append(('発注検収が済んでいない発注', o['no']))
            if self.cum(o['no']) != self.confirmed(o['no']):
                out.append(('発注検収の累計と確認済の請求額が合わない発注', o['no']))
            for v in self.inv_of(o['no']):
                if v['status'] == '受付':
                    out.append(('受付のままの請求', v['no']))
        return out

    # ---- 工事 ----
    def k_register(self, uid, no):
        self.act(uid, '営業')
        b = KB[no]
        k = dict(no=no, name=b['name'], client=b['client'], site=b['site'], kind=b['kind'],
                 status='見積中', sales=b['sales'], manager=b['manager'], estimate=b['estimate'],
                 contract=None, budget0=dict(b['budget0']), contractOn=None,
                 planStart=b['planStart'], planEnd=b['planEnd'], startOn=None, clientInspectOn=None,
                 clientBillOn=None, clientBillAmount=None, paidOn=None, note='')
        self.kouji[no] = k
        after = {'工事名': k['name'], '施主': PARTNER[k['client']]['name'], '工事場所': k['site'],
                 '工事種別': k['kind'], '営業担当': EMP[k['sales']]['name']}
        if k['manager']:
            after['工事担当'] = EMP[k['manager']]['name']
        after.update({'見積金額': k['estimate'], '着工予定日': k['planStart'], '完工予定日': k['planEnd']})
        for c in CATS:
            after['実行予算（当初）' + c] = k['budget0'][c]
        self.hist(uid, no, '登録', after=after)

    def k_contract(self, uid, no, amount, reason=''):
        k = self.kouji[no]
        if k['status'] == '見積中':
            self.act(uid, '営業')
        else:
            self.act(uid, '経理')
            need(reason, '受注後の受注金額の変更は理由が必要')
        old = k['contract']
        k['contract'] = amount
        self.hist(uid, no, '変更', before={'受注金額': old}, after={'受注金額': amount}, reason=reason)

    def k_win(self, uid, no, amount=None):
        self.act(uid, '営業')
        k = self.kouji[no]
        need(k['status'] == '見積中', '受注にできるのは見積中')
        c = amount if amount is not None else (k['contract'] or KB[no]['contract'])
        need(c and k['manager'] and all(v is not None for v in k['budget0'].values()), '受注の前提: ' + no)
        k.update(status='受注', contract=c, contractOn=self.today)
        self.hist(uid, no, '状態を進める', before={'状態': '見積中'},
                  after={'状態': '受注', '受注金額': c, '受注日': self.today})

    def k_start(self, uid, no):
        self.act(uid, '工事担当')
        k = self.kouji[no]
        need(k['status'] == '受注' and self.today >= k['contractOn'], '着工の前提: ' + no)
        k.update(status='施工中', startOn=self.today)
        self.hist(uid, no, '状態を進める', before={'状態': '受注'}, after={'状態': '施工中', '着工日': self.today})

    def k_handover(self, uid, no):
        self.act(uid, '工事担当')
        k = self.kouji[no]
        need(k['status'] == '施工中' and self.today >= k['startOn'], '施主検収の前提: ' + no)
        k.update(status='検収済', clientInspectOn=self.today)
        self.hist(uid, no, '状態を進める', before={'状態': '施工中'},
                  after={'状態': '検収済', '施主検収日': self.today})

    def k_bill(self, uid, no):
        self.act(uid, '経理')
        k = self.kouji[no]
        need(k['status'] == '検収済' and self.today >= k['clientInspectOn'], '施主請求の前提: ' + no)
        k.update(status='請求済', clientBillOn=self.today, clientBillAmount=k['contract'])
        self.hist(uid, no, '状態を進める', before={'状態': '検収済'},
                  after={'状態': '請求済', '施主請求日': self.today, '請求額': k['contract']})

    def k_complete(self, uid, no, paid_on):
        self.act(uid, '経理')
        k = self.kouji[no]
        need(k['status'] == '請求済' and paid_on >= k['clientBillOn'], '完了の前提: ' + no)
        need(not self.completion_issues(no), '完了の条件: %s' % self.completion_issues(no))
        k.update(status='完了', paidOn=paid_on)
        self.hist(uid, no, '状態を進める', before={'状態': '請求済'}, after={'状態': '完了', '入金日': paid_on})

    def k_back(self, uid, no, reason):
        k = self.kouji[no]
        need(reason, '状態を戻すには理由が必要')
        st = k['status']
        steps = {'完了': ('請求済', ['paidOn']), '請求済': ('検収済', ['clientBillOn', 'clientBillAmount']),
                 '検収済': ('施工中', ['clientInspectOn']), '施工中': ('受注', ['startOn']),
                 '受注': ('見積中', ['contract', 'contractOn'])}
        need(st in steps, '戻せない状態: ' + st)
        to, clear = steps[st]
        if st == '受注':
            self.act(uid, '営業')
            need(not any(o['kouji'] == no for o in self.orders.values()), '発注がある工事は見積中に戻せない')
            need(not any(r['kouji'] == no and r['status'] != '取消' for r in self.revisions.values()),
                 '予算改定がある工事は見積中に戻せない')
        else:
            self.act(uid, '経理')
        if st == '施工中':
            own = [o['no'] for o in self.orders.values() if o['kouji'] == no]
            need(not any(i['status'] == '有効' for n in own for i in self.insp_of(n)), '有効な発注検収がある')
            need(not any(v['status'] == '確認済' for n in own for v in self.inv_of(n)), '確認済の請求がある')
            need(not any(l['kouji'] == no and l['recordedOn'] for l in self.labor.values()), '計上済の労務費がある')
            self.log['rollback'].append({'kouji': no, 'from': st, 'at': self.now})
        before = {'状態': st}
        after = {'状態': to}
        for f in clear:
            before[CLEAR_LABEL[f]] = k[f]
            after[CLEAR_LABEL[f]] = None
            k[f] = None
        k['status'] = to
        self.hist(uid, no, '状態を戻す', before=before, after=after, reason=reason)

    # ---- 発注 ----
    def o_draft(self, uid, no, partner, cat, title, amount, due=None, over=None, related=None):
        self.act(uid, '工事担当')
        kno = no[:6]
        k = self.kouji[kno]
        need(k['status'] in ('受注', '施工中'), '起票できるのは受注か施工中の工事だけ: ' + no)
        seq = 1 + sum(1 for o in self.orders.values() if o['kouji'] == kno)
        need(no == '%s-%02d' % (kno, seq), '発注番号の採番: ' + no)
        p = PARTNER[partner]
        need(cat in ORDER_CATS and p['status'] == '取引中' and p['kind'] in ALLOWED[cat], '取引先と費目: ' + no)
        if related:
            r = self.orders[related]
            need(r['kouji'] == kno and r['partner'] == partner and r['cat'] == cat, '元の発注と取引先・費目: ' + no)
            if amount > 0:
                need(self.kind(r) == '通常' and r['status'] in ('承認済', '検収済'), '追加発注の元: ' + no)
            else:
                need(r['amount'] > 0 and r['status'] == '承認済' and -amount <= self.remaining(related),
                     '減額発注の元と額: ' + no)
        else:
            need(amount >= 1, '発注金額: ' + no)
        if amount > 0:
            need(due and due >= self.today, '納期: ' + no)
            if self.committed(kno, cat) + amount > self.budget(kno, cat):
                need(over, '予算超過の理由が必要: ' + no)
        self.orders[no] = dict(no=no, kouji=kno, related=related, partner=partner, cat=cat, title=title,
                               amount=amount, due=due, status='起票', overReason=over, drafter=uid,
                               draftedOn=self.today, approver=None, orderedOn=None, cancelReason=None,
                               note='')
        self.log['draftStatus'][no] = k['status']
        after = {'件名': title, '取引先': p['name'], '費目': cat, '発注金額': amount}
        if due:
            after['納期'] = due
        self.hist(uid, no, '登録', after=after, reason=over or '', related=related or '')

    def o_request_fix(self, uid, no, text):
        self.act(uid, '購買')
        need(self.orders[no]['status'] == '起票' and text, '修正依頼の前提: ' + no)
        self.hist(uid, no, '修正依頼', reason=text)

    def o_approve(self, uid, no):
        self.act(uid, '購買')
        o = self.orders[no]
        need(o['status'] == '起票', '承認できるのは起票: ' + no)
        need(self.role_of(o['drafter']) == '工事担当' and o['drafter'] != uid, '起票者と承認者: ' + no)
        over = False
        if o['amount'] > 0:
            over = self.committed(o['kouji'], o['cat']) + o['amount'] > self.budget(o['kouji'], o['cat'])
            need(not over or o['overReason'], '予算超過の理由が無いため承認できない: ' + no)
        else:
            rem = self.remaining(o['related'])
            need(self.orders[o['related']]['status'] == '承認済' and -o['amount'] <= rem, '減額の承認: ' + no)
            self.log['reduceRemain'][no] = rem
        o.update(status='承認済', approver=uid, orderedOn=self.today)
        after = {'状態': '承認済', '発注日': self.today}
        if o['amount'] < 0:
            r = self.orders[o['related']]
            after['元の発注の有効発注額'] = self.eff(r['no'])
            if self.cum(r['no']) >= self.eff(r['no']):
                r['status'] = '検収済'
                after['元の発注の状態'] = '検収済'
        self.hist(uid, no, '承認', before={'状態': '起票'}, after=after,
                  reason=o['overReason'] if over else '', related=o['related'] or '')

    def o_cancel(self, uid, no, reason):
        o = self.orders[no]
        need(reason, '取消の理由: ' + no)
        prev = o['status']
        if prev == '起票':
            self.act(uid, '工事担当')
        else:
            self.act(uid, '購買')
            need(prev == '承認済' and o['amount'] > 0, '取り消せる状態: ' + no)
            need(not any(i['status'] == '有効' for i in self.insp_of(no)), '有効な発注検収がある: ' + no)
            need(not any(v['status'] in ('受付', '確認済') for v in self.inv_of(no)), '請求がある: ' + no)
        o.update(status='取消', cancelReason=reason)
        self.hist(uid, no, '取消', before={'状態': prev}, after={'状態': '取消'}, reason=reason)

    def o_terminate(self, uid, no, reason):
        self.act(uid, '購買')
        o = self.orders[no]
        c, e = self.cum(no), self.eff(no)
        need(reason and o['amount'] > 0 and o['status'] == '承認済' and 0 < c < e, '打切の前提: ' + no)
        need(not any(v['status'] == '受付' for v in self.inv_of(no)), '受付のままの請求がある: ' + no)
        self.log['terminateCum'][no] = c
        o.update(status='打切', cancelReason=reason)
        self.hist(uid, no, '打切', before={'状態': '承認済', '未検収残': e - c},
                  after={'状態': '打切', '未検収残': 0}, reason=reason)

    # ---- 発注検収 ----
    def _insp_no(self, order):
        return '%s-K%d' % (order, 1 + len(self.insp_of(order)))

    def i_register(self, uid, order, date, amount, content):
        self.act(uid, '工事担当', '購買')
        o = self.orders[order]
        need(o['amount'] > 0 and o['status'] == '承認済', '発注検収の対象: ' + order)
        need(not self.closed(ym(date)), '締め済の月の検収日: %s %s' % (order, date))
        need(o['orderedOn'] <= date <= self.today, '検収日: %s %s' % (order, date))
        need(1 <= amount <= self.remaining(order), '検収額: %s %s' % (order, amount))
        no = self._insp_no(order)
        self.inspections[no] = dict(no=no, order=order, date=date, amount=amount, content=content,
                                    status='有効', corrects=None, cancelReason=None, registrant=uid, note='')
        after = {'検収日': date, '検収額': amount, '内容': content}
        if self.cum(order) >= self.eff(order):
            o['status'] = '検収済'
            after['発注の状態'] = '検収済'
        self.hist(uid, no, '登録', after=after)

    def i_cancel(self, uid, no, reason):
        self.act(uid, '工事担当', '購買')
        i = self.inspections[no]
        o = self.orders[i['order']]
        need(reason and i['status'] == '有効' and o['status'] in ('承認済', '検収済', '打切'), '検収の取消: ' + no)
        need(not self.closed(ym(i['date'])), '締め済の月の検収は取り消せない: ' + no)
        need(self.cum(o['no']) - i['amount'] >= self.confirmed(o['no']), '確認済の請求額を下回る: ' + no)
        i.update(status='取消', cancelReason=reason)
        after = {'状態': '取消'}
        if o['status'] == '検収済' and self.cum(o['no']) < self.eff(o['no']):
            o['status'] = '承認済'
            after['発注の状態'] = '承認済'
        self.hist(uid, no, '取消', before={'状態': '有効'}, after=after, reason=reason)

    def i_correct(self, uid, orig, date, amount, reason):
        self.act(uid, '工事担当', '購買')
        src = self.inspections[orig]
        o = self.orders[src['order']]
        need(reason and amount < 0 and src['status'] == '有効' and src['amount'] > 0, '訂正の前提: ' + orig)
        need(o['status'] in ('承認済', '検収済', '打切'), '訂正の対象: ' + orig)
        need(self.closed(ym(src['date'])) and not self.closed(ym(date)), '訂正の月: ' + orig)
        done = sum(i['amount'] for i in self.inspections.values() if i['corrects'] == orig and i['status'] == '有効')
        need(-amount <= src['amount'] + done, '訂正の額: ' + orig)
        need(self.cum(o['no']) + amount >= self.confirmed(o['no']), '確認済の請求額を下回る: ' + orig)
        no = self._insp_no(o['no'])
        self.inspections[no] = dict(no=no, order=o['no'], date=date, amount=amount, content=src['content'],
                                    status='有効', corrects=orig, cancelReason=None, registrant=uid, note='')
        after = {'検収日': date, '検収額': amount, '内容': src['content']}
        if o['status'] == '検収済' and self.cum(o['no']) < self.eff(o['no']):
            o['status'] = '承認済'
            after['発注の状態'] = '承認済'
        self.hist(uid, no, '訂正', after=after, reason=reason, related=orig)

    # ---- 請求 ----
    def v_receive(self, uid, key, order, inv_no, inv_date, amount, again=None):
        self.act(uid, '経理')
        o = self.orders[order]
        need(o['amount'] > 0 and o['status'] in ('承認済', '検収済', '打切'), '受付できる発注: ' + order)
        need(amount >= 1, '請求額: ' + key)
        rel = None
        if again:
            r = self.invoices[self.refs[again]]
            need(r['status'] == '差戻し' and r['order'] == order, '再受付の元: ' + key)
            rel = r['no']
        self.inv_seq += 1
        no = 'R-%04d' % self.inv_seq
        v = dict(no=no, order=order, partner=o['partner'], invoiceNo=inv_no, invoiceDate=inv_date,
                 amount=amount, receivedOn=self.today, status='受付', related=rel, checker=None,
                 checkedOn=None, bookMonth=None, cancelReason=None, note='')
        self.invoices[no] = v
        self.refs[key] = no
        self.log['receiptOrderStatus'][no] = o['status']
        after = {'発注番号': order, '請求書番号': inv_no, '請求書の日付': inv_date, '請求額': amount,
                 '判定': self.judge(v)}
        self.hist(uid, no, '再受付' if rel else '登録', after=after, related=rel or '')

    def v_confirm(self, uid, key, book=None):
        self.act(uid, '経理')
        v = self.invoices[self.refs[key]]
        need(v['status'] == '受付' and self.judge(v) == '確定できる', '確認の前提: %s %s' % (key, self.judge(v)))
        default = ym(v['receivedOn'])
        if self.closed(default):
            default = self.first_open_month()
        book = book or default
        need(not self.closed(book) and ym(v['invoiceDate']) <= book <= ym(self.today), '計上月: ' + key)
        late = self.closed(ym(v['invoiceDate'])) and book > ym(v['invoiceDate'])
        v.update(status='確認済', checker=uid, checkedOn=self.today, bookMonth=book)
        self.hist(uid, v['no'], '確認', before={'状態': '受付'},
                  after={'状態': '確認済', '確認日': self.today, '計上月': book},
                  reason='過月分' if late else '')

    def v_return(self, uid, key, reason):
        self.act(uid, '経理')
        v = self.invoices[self.refs[key]]
        need(v['status'] == '受付' and reason, '差戻しの前提: ' + key)
        v.update(status='差戻し', cancelReason=reason)
        self.hist(uid, v['no'], '差戻し', before={'状態': '受付'}, after={'状態': '差戻し'}, reason=reason)

    def v_cancel(self, uid, key, reason, main=None):
        self.act(uid, '経理')
        v = self.invoices[self.refs[key]]
        need(v['status'] == '受付' and reason, '請求の取消の前提: ' + key)
        v.update(status='取消', cancelReason=reason)
        self.hist(uid, v['no'], '取消', before={'状態': '受付'}, after={'状態': '取消'}, reason=reason,
                  related=self.refs[main] if main else '')

    # ---- 予算改定 ----
    def r_draft(self, uid, no, cat, after, reason):
        self.act(uid, '工事担当')
        kno = no[:6]
        need(self.kouji[kno]['status'] in ('受注', '施工中') and reason and after >= 0, '改定の起案: ' + no)
        seq = 1 + sum(1 for r in self.revisions.values() if r['kouji'] == kno)
        need(no == '%s-Y%d' % (kno, seq), '改定番号の採番: ' + no)
        need(not any(r['kouji'] == kno and r['cat'] == cat and r['status'] == '起案'
                     for r in self.revisions.values()), '起案のままの改定がある: ' + no)
        before = self.budget(kno, cat)
        self.revisions[no] = dict(no=no, kouji=kno, cat=cat, before=before, after=after, reason=reason,
                                  drafter=uid, draftedOn=self.today, status='起案', approver=None,
                                  revisedOn=None, cancelReason=None)
        self.log['revBefore'][no] = before
        self.hist(uid, no, '予算改定の起案', after={'費目': cat, '改定前の額': before, '改定後の額': after},
                  reason=reason)

    def r_approve(self, uid, no):
        self.act(uid, '営業')
        r = self.revisions[no]
        need(r['status'] == '起案', '改定の承認: ' + no)
        r.update(status='承認済', approver=uid, revisedOn=self.today)
        self.hist(uid, no, '予算改定の承認', before={'状態': '起案'}, after={'状態': '承認済', '改定日': self.today},
                  reason=r['reason'])

    # ---- 労務費 ----
    def l_month(self, uid, month, record):
        """その月に施工中だった工事の時間（日報の集計）を入れ、record なら計上する。"""
        for kno in self.labor_targets(month):
            key = '%s %s' % (kno, month)
            if key not in self.labor:
                h = labor_hours(self.kouji[kno], month)
                self.labor[key] = dict(kouji=kno, month=month, hours=h, rate=LABOR_RATE,
                                       amount=int(h * 2) * LABOR_RATE // 2, recorder=None, recordedOn=None)
            if record:
                self.l_record(uid, kno, month)

    def l_record(self, uid, kno, month, on=None):
        self.act(uid, '経理')
        row = self.labor['%s %s' % (kno, month)]
        on = on or month_end(month)
        need(row['recordedOn'] is None and ym(on) == month and not self.closed(month), '労務費の計上: ' + kno)
        row.update(recorder=uid, recordedOn=on)
        self.hist(uid, '%s %s' % (kno, month), '労務費の計上',
                  after={'時間': row['hours'], '単価': row['rate'], '金額': row['amount'], '計上日': on})

    # ---- 締め ----
    def m_close(self, uid, month):
        self.act(uid, '経理')
        mm = self.months[month]
        need(mm['status'] == '未締め' and month_end(month) < self.today, '締めの前提: ' + month)
        need(self.closed(add_months(month, -1)), '前の月が締め済でない: ' + month)
        waiting = [v['no'] for v in self.invoices.values() if v['status'] == '受付' and ym(v['invoiceDate']) <= month]
        need(not waiting, '受付のままの請求: %s' % waiting)
        for kno in self.labor_targets(month):
            row = self.labor.get('%s %s' % (kno, month))
            need(row and row['recordedOn'], '労務費が未計上: %s %s' % (kno, month))
        self.log['closeCheck'].append((month, self.now))
        mm['closeCount'] += 1
        mm.update(status='締め済', closedOn=self.today)
        self.hist(uid, month, '締め', before={'状態': '未締め'},
                  after={'状態': '締め済', '回数': '第%d回' % mm['closeCount']})

    def m_reopen(self, uid, month, reason):
        self.act(uid, '経理')
        mm = self.months[month]
        need(reason and mm['status'] == '締め済' and not mm['carryover'], '締め解除の前提: ' + month)
        need(not self.closed(add_months(month, 1)), '後の月が締め済: ' + month)
        mm.update(status='未締め', closedOn=None)
        self.hist(uid, month, '締め解除', before={'状態': '締め済'}, after={'状態': '未締め'}, reason=reason)


def labor_hours(k, month):
    """日報の集計に当たる時間。労務費の予算を工期の日数で割り振る。"""
    total = KB[k['no']]['budget0']['労務費'] / float(LABOR_RATE) * 0.93
    start = k['startOn']
    end = k['clientInspectOn'] or KB[k['no']]['planEnd']
    span = (to_date(end) - to_date(start)).days + 1
    a = max(start, month + '-01')
    b = min(end, month_end(month))
    days = max((to_date(b) - to_date(a)).days + 1, 3)
    return half(max(total * days / span * rng.uniform(0.82, 1.0), 4.0))


# ---- 操作の予定（日付の順に並べ替えて実行する） ----

KOBAI, KEIRI = 'E07', 'E08'
PLAN = []
ORDER_PARTNER = {}
USED_INV = set()


def at(when, fn, *args, **kw):
    PLAN.append((D(when), len(PLAN), fn, args, kw))


def mg(no):
    return KB[no[:6]]['manager']


def B(kno, cat):
    return KB[kno]['budget0'][cat]


def inv_no(partner, inv_date):
    """取引先ごとの書式で請求書番号を振る。"""
    y4, y2m, y6 = inv_date[:4], inv_date[2:4] + inv_date[5:7], inv_date[:4] + inv_date[5:7]
    while True:
        n = rng.randint(120, 880)
        s = rng.randint(11, 68)
        v = {'T-106': 'AK-%s-%03d' % (y6, n), 'T-107': 'KY%05d' % (18000 + n * 7),
             'T-108': 'SS-%s-%04d' % (y4, 1000 + n), 'T-109': 'GB%s-%02d' % (y2m, s),
             'T-110': 'SG-%05d' % (40000 + n * 11), 'T-111': 'MS%s%02d' % (y2m, s),
             'T-112': 'OD-%04d' % (3000 + n), 'T-113': 'HH%s-%03d' % (y2m, n),
             'T-114': 'MY-%s-%02d' % (y2m, s)}[partner]
        if (partner, v) not in USED_INV:
            USED_INV.add((partner, v))
            return v


def order(no, partner, cat, title, amount, draft, approve=None, due=None, over=None, related=None):
    ORDER_PARTNER[no] = partner
    at(draft, 'o_draft', mg(no), no, partner, cat, title, amount, due=D(due) if due else None,
       over=over, related=related)
    if approve:
        at(approve, 'o_approve', KOBAI, no)
    return amount


def share(no, s):
    return lambda w: part(w.orders[no]['amount'], s)


def rest(no):
    return lambda w: w.remaining(no)


def full(no):
    return lambda w: w.eff(no)


def unbilled(no):
    return lambda w: w.cum(no) - w.confirmed(no)


def last_insp(no):
    return lambda w: [i for i in w.insp_of(no) if i['status'] == '有効'][-1]['amount']


def insp(when, no, date, amount, content, uid=None):
    at(when, 'i_register', uid or mg(no), no, D(date), amount, content)


def recv(when, key, no, date, amount, number=None, again=None):
    number = number or inv_no(ORDER_PARTNER[no], D(date))
    at(when, 'v_receive', KEIRI, key, no, number, D(date), amount, again=again)
    return number


def conf(when, key, book=None):
    at(when, 'v_confirm', KEIRI, key, book=book)


def kouji_flow(no, reg, win=None, start=None, handover=None, bill=None, amount=None):
    k = KB[no]
    at(reg, 'k_register', k['sales'], no)
    if win:
        at(win, 'k_win', k['sales'], no, amount)
    if start:
        at(start, 'k_start', k['manager'], no)
    if handover:
        at(handover, 'k_handover', k['manager'], no)
    if bill:
        at(bill, 'k_bill', KEIRI, no)


# 26-001 完了まで進んだ工事
kouji_flow('26-001', '04-01', '06-19', '07-06', '07-24', '07-31')
order('26-001-01', 'T-108', '材料費', 'パッケージエアコン（室内機・室外機）',
      pick(B('26-001', '材料費') * 0.93), '06-29', '07-01', '07-08')
order('26-001-02', 'T-113', '外注費', '空調機据付・冷媒配管の保温工事',
      pick(B('26-001', '外注費') * 0.95), '06-29', '07-01', '07-22')
order('26-001-03', 'T-110', '経費', '養生材・仮設材', pick(B('26-001', '経費') * 0.9), '06-30', '07-01', '07-10')
insp('07-08', '26-001-01', '07-08', rest('26-001-01'), '納品')
insp('07-10', '26-001-03', '07-10', rest('26-001-03'), '完了')
insp('07-22', '26-001-02', '07-22', rest('26-001-02'), '完了')
recv('07-27', 'n02', '26-001-02', '07-24', full('26-001-02'))
conf('07-29', 'n02')
recv('08-03', 'n03', '26-001-01', '07-31', full('26-001-01'))
recv('08-03', 'n04', '26-001-03', '07-31', full('26-001-03'))
conf('08-05', 'n03', '2026-07')
conf('08-05', 'n04', '2026-07')
at('09-02', 'k_complete', KEIRI, '26-001', '2026-08-31')

# 26-002 施主請求済
kouji_flow('26-002', '04-02', '05-08', '05-25', '07-31', '08-20')
order('26-002-01', 'T-108', '材料費', '業務用ガス給湯器', pick(B('26-002', '材料費') * 0.58), '05-18', '05-20', '06-10')
order('26-002-02', 'T-106', '材料費', '給湯配管材・継手・バルブ', pick(B('26-002', '材料費') * 0.36),
      '05-19', '05-21', '06-12')
order('26-002-03', 'T-111', '外注費', '給湯器据付・配管工事', pick(B('26-002', '外注費') * 0.82),
      '05-22', '05-25', '07-28')
order('26-002-04', 'T-110', '経費', '仮設・養生・撤去品の処分', pick(B('26-002', '経費') * 0.85),
      '06-01', '06-03', '07-15')
order('26-002-05', 'T-112', '外注費', '給湯器の電源・制御配線工事', pick(B('26-002', '外注費') * 0.14),
      '06-10', '06-11', '07-24')
insp('06-10', '26-002-01', '06-10', rest('26-002-01'), '納品')
insp('06-12', '26-002-02', '06-12', rest('26-002-02'), '納品')
insp('07-15', '26-002-04', '07-15', rest('26-002-04'), '完了')
insp('07-24', '26-002-05', '07-24', rest('26-002-05'), '完了')
insp('07-28', '26-002-03', '07-28', rest('26-002-03'), '完了')
_n = recv('08-04', 'n08', '26-002-03', '07-31', lambda w: w.eff('26-002-03') + 58300)
at('08-04', 'v_return', KEIRI, 'n08', '発注額を超える追加分が含まれていたため返却。発注額での再発行を依頼')
recv('08-18', 'n11', '26-002-03', '08-17', full('26-002-03'), number=_n, again='n08')
conf('08-19', 'n11')

# 26-003 施主請求済。発注の取消と、発注検収の取消・登録し直し
kouji_flow('26-003', '04-03', '06-03', '06-15', '08-07', '08-28')
order('26-003-01', 'T-109', '材料費', '自動火災報知設備の感知器・発信機・受信機',
      pick(B('26-003', '材料費') * 0.55), '06-08', '06-10', '06-26')
order('26-003-02', 'T-107', '材料費', '誘導灯器具', pick(B('26-003', '材料費') * 0.33), '06-08', '06-10', '07-10')
order('26-003-03', 'T-112', '外注費', '自動火災報知設備の配線・機器取付工事',
      pick(B('26-003', '外注費') * 0.9), '06-12', '06-15', '08-05')
order('26-003-04', 'T-110', '経費', '脚立・足場の損料', pick(B('26-003', '経費') * 0.8), '06-15', '06-16', '07-03')
at('06-17', 'o_cancel', KOBAI, '26-003-02', 'メーカーの型式変更で品番が合わないため。新しい型式で発注し直す')
order('26-003-05', 'T-107', '材料費', '誘導灯器具（新型式）', pick(B('26-003', '材料費') * 0.35),
      '06-18', '06-19', '08-04')
insp('06-26', '26-003-01', '06-26', rest('26-003-01'), '納品')
insp('07-03', '26-003-04', '07-03', rest('26-003-04'), '完了')
insp('07-10', '26-003-03', '07-10', share('26-003-03', 0.5), '出来高')
insp('08-04', '26-003-05', '08-04', lambda w: w.orders['26-003-05']['amount'] - 36000, '納品')
at('08-05', 'i_cancel', mg('26-003-05'), '26-003-05-K1', '検収額の入力誤り（納品書の額と相違）')
insp('08-05', '26-003-05', '08-04', rest('26-003-05'), '納品')
insp('08-05', '26-003-03', '08-05', rest('26-003-03'), '完了')
recv('08-03', 'n06', '26-003-03', '07-31', unbilled('26-003-03'))
conf('08-04', 'n06', '2026-07')
recv('08-10', 'n10', '26-003-01', '07-31', full('26-003-01'))
conf('08-12', 'n10')
recv('09-02', 'n20', '26-003-03', '08-31', unbilled('26-003-03'))
conf('09-04', 'n20', '2026-08')

# 26-004 施主検収済で施主請求前。外注の打切
kouji_flow('26-004', '04-06', '05-12', '05-25', '08-26')
order('26-004-01', 'T-110', '材料費', 'ダクト用鋼板・支持金物', pick(B('26-004', '材料費') * 0.52),
      '05-20', '05-22', '06-19')
order('26-004-02', 'T-114', '外注費', '排気ダクトの製作・吊り込み工事', pick(B('26-004', '外注費') * 0.62),
      '05-22', '05-25', '08-21')
order('26-004-03', 'T-108', '材料費', '排気ファン・排気フード', pick(B('26-004', '材料費') * 0.4),
      '05-27', '05-29', '07-02')
order('26-004-04', 'T-110', '経費', '仮設材・養生材', pick(B('26-004', '経費') * 0.75), '06-01', '06-02', '06-30')
order('26-004-05', 'T-111', '外注費', 'グリース阻集器・排水配管工事', pick(B('26-004', '外注費') * 0.3),
      '06-08', '06-10', '08-20')
insp('06-19', '26-004-01', '06-19', rest('26-004-01'), '納品')
insp('06-30', '26-004-02', '06-30', share('26-004-02', 0.45), '出来高')
insp('06-30', '26-004-04', '06-30', rest('26-004-04'), '完了')
insp('07-02', '26-004-03', '07-02', rest('26-004-03'), '納品')
insp('07-31', '26-004-02', '07-31', share('26-004-02', 0.41), '出来高')
insp('08-20', '26-004-05', '08-20', rest('26-004-05'), '完了')
recv('08-03', 'n05', '26-004-02', '07-31', unbilled('26-004-02'))
conf('08-05', 'n05', '2026-07')
recv('08-24', 'n19', '26-004-05', '08-20', full('26-004-05'))
conf('08-26', 'n19')
at('08-27', 'o_terminate', KOBAI, '26-004-02', '残りの吊り込みは施主の設備更新に合わせて取りやめになったため')

# 26-005 外注費が予算超過の施工中の工事（原因は 26-005-04）
kouji_flow('26-005', '04-06', '04-10', '04-20', amount=47862000)
order('26-005-01', 'T-108', '材料費', '空調機（1期分）', pick(B('26-005', '材料費') * 0.46), '04-13', '04-15', '05-20')
order('26-005-02', 'T-106', '材料費', '冷媒配管材・ドレン配管材（分納）', pick(B('26-005', '材料費') * 0.28),
      '04-16', '04-17', '09-30')
o3 = order('26-005-03', 'T-111', '外注費', '空調機据付・冷媒配管工事', pick(B('26-005', '外注費') * 0.678),
           '04-17', '04-20', '10-23')
order('26-005-04', 'T-114', '外注費', 'ダクト交換工事（範囲拡大分）', pick(B('26-005', '外注費') - o3 + 530000),
      '07-20', '07-22', '10-09', over='既設ダクトの劣化が想定より進んでおり、交換範囲が広がったため')
order('26-005-05', 'T-110', '経費', '仮設・養生・揚重', pick(B('26-005', '経費') * 0.45), '07-23', '07-24', '08-31')
order('26-005-06', 'T-107', '材料費', '空調用電線・制御ケーブル', pick(B('26-005', '材料費') * 0.18),
      '07-27', '07-29', '09-18')
order('26-005-07', 'T-109', '材料費', '防火ダンパー（変更契約分）', pick(386700), '08-03', '08-04', '08-27')
order('26-005-08', 'T-110', '経費', '撤去機器の運搬・処分', pick(86400), '08-19', '08-20', '09-25')
insp('05-15', '26-005-02', '05-15', share('26-005-02', 0.4), '納品')
insp('05-20', '26-005-01', '05-20', rest('26-005-01'), '納品')
insp('05-29', '26-005-03', '05-29', share('26-005-03', 0.25), '出来高')
insp('07-10', '26-005-02', '07-10', share('26-005-02', 0.3), '納品')
insp('07-14 10:30', '26-005-03', '06-30', share('26-005-03', 0.2), '出来高')
insp('08-03', '26-005-03', '07-31', share('26-005-03', 0.2), '出来高')
insp('08-10', '26-005-04', '08-10', share('26-005-04', 0.3), '出来高')
insp('08-18', '26-005-02', '08-18', share('26-005-02', 0.15), '納品')
insp('08-27', '26-005-07', '08-27', rest('26-005-07'), '納品')
insp('09-01', '26-005-05', '08-31', rest('26-005-05'), '完了')
recv('06-02', 'n01', '26-005-01', '05-31', full('26-005-01'))
conf('06-04', 'n01', '2026-05')
recv('08-03', 'n21', '26-005-03', '07-31', unbilled('26-005-03'))
conf('08-05', 'n21', '2026-07')
at('08-06', 'k_contract', KEIRI, '26-005', 48316000, '変更契約（防火ダンパーの追加）を締結したため')
recv('08-27', 'n22', '26-005-04', '08-25', unbilled('26-005-04'))
recv('08-28', 'n17', '26-005-02', '08-25', last_insp('26-005-02'))
conf('08-31', 'n22')

# 26-006 施主検収済で施主請求前。減額発注
kouji_flow('26-006', '04-07', '04-17', '04-27', '08-31')
order('26-006-01', 'T-107', '材料費', 'キュービクル式高圧受電設備', pick(B('26-006', '材料費') * 0.62),
      '04-20', '04-23', '06-18')
o62 = order('26-006-02', 'T-112', '外注費', '受変電設備の据付・結線工事', pick(B('26-006', '外注費') * 0.7),
            '04-24', '04-27', '07-28')
order('26-006-03', 'T-110', '経費', '仮設電源・養生', pick(B('26-006', '経費') * 0.8), '04-27', '04-28', '06-30')
order('26-006-04', 'T-107', '材料費', '高圧ケーブル・端末処理材', pick(B('26-006', '材料費') * 0.2),
      '05-07', '05-08', '06-05')
order('26-006-05', 'T-111', '外注費', '機器基礎・架台工事', pick(B('26-006', '外注費') * 0.22), '05-11', '05-12', '05-29')
order('26-006-06', 'T-107', '材料費', '接地材・端子類', pick(236800), '06-29', '06-30', '07-07')
order('26-006-07', 'T-112', '外注費', '据付・結線工事の減額（試験立会い1回分）', -part(o62, 0.08),
      '07-10', '07-13', related='26-006-02')
insp('05-29', '26-006-05', '05-29', rest('26-006-05'), '完了')
insp('06-05', '26-006-04', '06-05', rest('26-006-04'), '納品')
insp('06-18', '26-006-01', '06-18', rest('26-006-01'), '納品')
insp('06-30', '26-006-02', '06-30', share('26-006-02', 0.5), '出来高')
insp('06-30', '26-006-03', '06-30', rest('26-006-03'), '完了')
insp('07-07', '26-006-06', '07-07', rest('26-006-06'), '納品')
insp('07-28', '26-006-02', '07-28', rest('26-006-02'), '完了')
recv('08-04', 'n09', '26-006-02', '07-31', full('26-006-02'))
conf('08-06', 'n09', '2026-07')

# 26-007 締め済の月に納期がある未検収の発注、マイナス訂正、二重の請求
kouji_flow('26-007', '04-15', '06-05', '06-22')
order('26-007-01', 'T-111', '外注費', '給排水配管・衛生器具取付工事', pick(B('26-007', '外注費') * 0.9),
      '06-16', '06-18', '10-02')
order('26-007-02', 'T-106', '材料費', '衛生器具・水栓', pick(B('26-007', '材料費') * 0.45), '06-19', '06-22', '07-14')
order('26-007-03', 'T-108', '材料費', '換気扇・電気温水器', pick(B('26-007', '材料費') * 0.4), '06-22', '06-24', '07-24')
order('26-007-04', 'T-110', '経費', '仮設間仕切り・養生', pick(B('26-007', '経費') * 0.7), '06-24', '06-25', '07-20')
order('26-007-05', 'T-106', '材料費', '洗面水栓（追加分）', pick(B('26-007', '材料費') * 0.08), '07-06', due='07-31')
at('07-07', 'o_cancel', mg('26-007-05'), '26-007-05', '26-007-02 に含まれている品目を重ねて起票したため')
insp('07-14', '26-007-02', '07-14', rest('26-007-02'), '納品')
insp('07-20', '26-007-04', '07-20', rest('26-007-04'), '完了')
insp('07-31', '26-007-01', '07-31', share('26-007-01', 0.3), '出来高')
at('08-19', 'i_correct', mg('26-007-02'), '26-007-02-K1', '2026-08-19', -86400,
   '7月14日納品分のうち、型番違いの衛生器具を返品したため')
insp('08-20', '26-007-01', '08-20', share('26-007-01', 0.2), '出来高')
insp('08-28', '26-007-02', '08-28', rest('26-007-02'), '納品')
recv('08-03', 'n07', '26-007-01', '07-31', unbilled('26-007-01'))
conf('08-05', 'n07', '2026-07')
_n = recv('08-24', 'n15', '26-007-01', '08-20', last_insp('26-007-01'))
recv('08-27', 'n16', '26-007-01', '08-20', last_insp('26-007-01'), number=_n)

# 26-008 材料費が予算超過の施工中の工事
kouji_flow('26-008', '05-12', '06-26', '07-13')
o81 = order('26-008-01', 'T-107', '材料費', '非常用照明器具', pick(B('26-008', '材料費') * 0.58),
            '07-06', '07-08', '08-05')
order('26-008-02', 'T-112', '外注費', '幹線張替え・器具取付工事', pick(B('26-008', '外注費') * 0.85),
      '07-13', '07-15', '09-30')
order('26-008-03', 'T-110', '経費', '高所作業車の損料', pick(B('26-008', '経費') * 0.6), '07-20', '07-21', '08-07')
order('26-008-04', 'T-107', '材料費', '幹線ケーブル・配線器具', pick(B('26-008', '材料費') - o81 + 190000),
      '07-27', '07-29', '09-15', over='幹線ルートの変更でケーブルの長さが増えたため')
insp('08-05', '26-008-01', '08-05', rest('26-008-01'), '納品')
insp('08-07', '26-008-03', '08-07', rest('26-008-03'), '完了')
insp('08-24', '26-008-04', '08-24', share('26-008-04', 0.6), '納品')
insp('09-01', '26-008-02', '08-31', share('26-008-02', 0.35), '出来高')
recv('08-12', 'n12', '26-008-01', '08-10', full('26-008-01'))
conf('08-14', 'n12')

# 26-009 予算改定（材料費の増額）と追加発注
kouji_flow('26-009', '05-18', '06-12', '06-29')
order('26-009-01', 'T-108', '材料費', '加圧給水ポンプユニット', pick(B('26-009', '材料費') * 0.5),
      '06-22', '06-24', '07-22')
order('26-009-02', 'T-106', '材料費', '受水槽（パネル式）', pick(B('26-009', '材料費') * 0.4), '06-24', '06-26', '07-30')
order('26-009-03', 'T-111', '外注費', '受水槽組立・給水配管工事', pick(B('26-009', '外注費') * 0.72),
      '06-26', '06-29', '10-09')
order('26-009-04', 'T-110', '経費', '仮設給水・養生', pick(B('26-009', '経費') * 0.7), '07-01', '07-02', '08-31')
order('26-009-05', 'T-112', '外注費', 'ポンプ制御盤の電気工事', pick(B('26-009', '外注費') * 0.2),
      '07-15', '07-16', '09-18')
at('07-21', 'r_draft', mg('26-009'), '26-009-Y1', '材料費', 6128700, '受水槽の容量を施主の要望で増やしたため')
at('07-23', 'r_approve', 'E02', '26-009-Y1')
order('26-009-06', 'T-106', '材料費', '受水槽（パネル式）の容量変更分', pick(584600), '07-24', '07-27', '08-12',
      related='26-009-02')
order('26-009-07', 'T-106', '材料費', '給水配管材・弁類', pick(452300), '08-03', '08-04', '09-11')
insp('07-22', '26-009-01', '07-22', rest('26-009-01'), '納品')
insp('07-30', '26-009-02', '07-30', rest('26-009-02'), '納品')
insp('07-31', '26-009-03', '07-31', share('26-009-03', 0.3), '出来高')
insp('07-31', '26-009-04', '07-31', share('26-009-04', 0.5), '出来高')
insp('08-12', '26-009-06', '08-12', rest('26-009-06'), '納品')
insp('08-26', '26-009-07', '08-26', share('26-009-07', 0.5), '納品')
insp('09-02', '26-009-03', '08-31', share('26-009-03', 0.3), '出来高')
recv('08-03', 'n13', '26-009-01', '07-31', full('26-009-01'))
conf('08-05', 'n13', '2026-07')
recv('08-24', 'n14', '26-009-06', '08-20', full('26-009-06'))
conf('08-26', 'n14')

# 26-010 検収していない発注への請求、修正依頼
kouji_flow('26-010', '06-01', '07-06', '07-21')
order('26-010-01', 'T-107', '材料費', 'LED照明器具（居室）', pick(B('26-010', '材料費') * 0.55), '07-14', '07-16', '08-28')
order('26-010-02', 'T-107', '材料費', 'LED照明器具（共用部）', pick(B('26-010', '材料費') * 0.3),
      '07-15', '07-17', '07-31')
order('26-010-03', 'T-112', '外注費', '照明器具の交換工事', pick(B('26-010', '外注費') * 0.8), '07-21', '07-22', '09-30')
order('26-010-04', 'T-110', '経費', '高所作業台・養生材', pick(B('26-010', '経費') * 0.7), '07-21', '07-22', '08-21')
order('26-010-05', 'T-111', '外注費', '天井点検口の設置工事', pick(B('26-010', '外注費') * 0.15),
      '09-01', '09-04', '09-25')
order('26-010-06', 'T-112', '外注費', '照明器具の交換工事（倉庫・機械室）', pick(136800), '09-03', due='09-30')
at('09-07', 'o_request_fix', KOBAI, '26-010-06', '外注費の予算を超えます。予算超過の理由を入れて再提出してください')
insp('08-04', '26-010-01', '08-04', share('26-010-01', 0.7), '納品')
insp('08-21', '26-010-04', '08-21', rest('26-010-04'), '完了')
insp('09-01', '26-010-03', '08-31', share('26-010-03', 0.4), '出来高')
recv('08-24', 'n23', '26-010-04', '08-21', full('26-010-04'))
conf('08-26', 'n23')
recv('08-27', 'n18', '26-010-02', '08-25', full('26-010-02'))

# 26-011 操作の流れで使う工事（外注費の残が少ない）
kouji_flow('26-011', '06-22', '07-30', '08-17')
order('26-011-01', 'T-108', '材料費', 'ビル用マルチエアコン', pick(B('26-011', '材料費') * 0.9), '08-10', '08-11', '08-25')
order('26-011-02', 'T-111', '外注費', '空調機据付・冷媒配管工事', pick(B('26-011', '外注費') - 126000),
      '08-12', '08-13', '09-30')
order('26-011-03', 'T-110', '経費', '養生材・揚重', pick(B('26-011', '経費') * 0.75), '08-12', '08-13', '08-24')
insp('08-24', '26-011-03', '08-24', rest('26-011-03'), '完了')
insp('08-25', '26-011-01', '08-25', rest('26-011-01'), '納品')
recv('09-02', 'n24', '26-011-01', '08-31', full('26-011-01'))
conf('09-03', 'n24', '2026-08')

# 26-012 受注
kouji_flow('26-012', '07-01', '08-21')
order('26-012-01', 'T-106', '材料費', '給湯配管材・保温材', pick(B('26-012', '材料費') * 0.6), '08-27', '08-28', '10-02')
order('26-012-02', 'T-111', '外注費', '給湯配管の更新工事', pick(B('26-012', '外注費') * 0.9), '09-04', due='10-30')

# 26-013 受注（着工を誤って登録し、1段戻した）
kouji_flow('26-013', '07-09', '08-03', '08-24')
order('26-013-01', 'T-109', '材料費', '屋内消火栓箱・ホース・ノズル', pick(B('26-013', '材料費') * 0.6),
      '08-10', '08-12', '10-09')
at('08-25', 'k_back', KEIRI, '26-013', '着工の登録を誤ったため。着工は10月の予定')
order('26-013-02', 'T-111', '外注費', '消火配管の更新工事', pick(B('26-013', '外注費') * 0.8), '09-07', due='11-27')

# 26-014、26-015 見積中
kouji_flow('26-014', '08-03')
kouji_flow('26-015', '08-31')
at('09-04', 'k_contract', 'E02', '26-015', 1142000)

# 労務費と月次の締め
at('05-07', 'l_month', KEIRI, '2026-04', True)
at('05-08', 'm_close', KEIRI, '2026-04')
at('06-03', 'l_month', KEIRI, '2026-05', True)
at('06-05', 'm_close', KEIRI, '2026-05')
at('07-03', 'l_month', KEIRI, '2026-06', True)
at('07-06', 'm_close', KEIRI, '2026-06')
at('07-14 09:10', 'm_reopen', KEIRI, '2026-06', '6月30日の外注の出来高の検収が未登録のため')
at('07-15', 'm_close', KEIRI, '2026-06')
at('08-05', 'l_month', KEIRI, '2026-07', True)
at('08-07', 'm_close', KEIRI, '2026-07')
at('09-01', 'l_month', KEIRI, '2026-08', False)


def run():
    """日付ごとに、時刻の決まった操作を先に、残りを予定の順に実行する。"""
    w = World()
    days = {}
    for d, seq, fn, args, kw in PLAN:
        days.setdefault(d[:10], []).append((d[11:] or None, seq, fn, args, kw))
    for day in sorted(days):
        evs = days[day]
        fixed = sorted([e for e in evs if e[0]], key=lambda e: (e[0], e[1]))
        loose = sorted([e for e in evs if not e[0]], key=lambda e: e[1])
        t = None
        for tm, seq, fn, args, kw in fixed + loose:
            if tm:
                t = int(tm[:2]) * 60 + int(tm[3:])
            elif t is None:
                t = 9 * 60 + rng.randint(2, 24)
            else:
                t += rng.randint(6, 28)
            need(t < 19 * 60, '時刻: ' + day)
            w.now = '%s %02d:%02d' % (day, t // 60, t % 60)
            need(w.today <= BASE_DATE, '基準日より後の操作: ' + w.now)
            getattr(w, fn)(*[a(w) if callable(a) else a for a in args], **kw)
    w.now = BASE_DATE + ' 18:00'
    return w


# ---- 項目の定義 ----

def F(key, name, typ, req='', edit='', default=''):
    f = {'name': name, 'type': typ, 'required': req, 'edit': edit, 'default': default}
    f['keys' if isinstance(key, list) else 'key'] = key
    return f


SCHEMA = {
    'kouji': {
        'name': '工事',
        'fields': [
            F('no', '工事番号', '文字 26-001 の形（年度2桁-連番3桁）', '○', '不可', '自動採番'),
            F('name', '工事名', '文字 40字まで', '○', '見積中・受注で可', '空'),
            F('client', '施主', '取引先（区分=施主）', '○', '見積中・受注で可', '空'),
            F('site', '工事場所', '文字', '○', '見積中・受注で可', '空'),
            F('kind', '工事種別', '空調／給排水／衛生／電気／消防／改修', '○', '見積中・受注で可', '空'),
            F('status', '状態', '6つ', '○', '遷移のみ', '見積中'),
            F('sales', '営業担当', '社員', '○', '見積中・受注で可', '操作者（営業のとき）'),
            F('manager', '工事担当', '社員', '受注時に○', '可', '空'),
            F('estimate', '見積金額', '円（税抜）', '○', '見積中・受注で可', '空'),
            F('contract', '受注金額', '円（税抜）', '受注時に○', '見積中は可。受注後は経理のみ可（理由必須）', '見積金額'),
            F('budget0', '実行予算（当初、費目別4つ）', '円×4（材料費／外注費／労務費／経費）', '受注時に○',
              '見積中は可。受注後は不可（予算改定で変える）', '0'),
            F('contractOn', '受注日', '日付', '受注時に○', '不可', '空'),
            F('planStart', '着工予定日', '日付', '○', '見積中・受注で可', '空'),
            F('planEnd', '完工予定日', '日付（着工予定日以降）', '○', '可', '空'),
            F('startOn', '着工日', '日付', '施工中で○', '不可', '空'),
            F('clientInspectOn', '施主検収日', '日付', '検収済で○', '不可', '空'),
            F(['clientBillOn', 'clientBillAmount'], '施主請求日／請求額', '日付／円（一括）', '請求済で○', '不可', '空'),
            F('paidOn', '入金日', '日付（一括）', '完了で○', '不可', '空'),
            F('note', '備考', '文字', '', '可', '空'),
        ],
        'notes': [
            '工事の登録と基本情報の編集は、同じ「基本情報」のダイアログで行う。操作できるのは営業のみ。扱う項目は 工事名、施主、'
            '工事場所、工事種別、営業担当、工事担当、見積金額、着工予定日、完工予定日、備考。見積中は受注金額と実行予算（当初）も扱う。'
            '見積中と受注では扱う項目を全部編集でき、施工中以後は 工事担当、完工予定日、備考 だけ編集できる。'
            '受注後の受注金額の変更は、経理が工事詳細の金額のまとめから理由を付けて行う。',
            '実行予算（当初）の合計は4費目の和で持たない（計算する）。',
        ],
        'computed': ['予算（今の値、費目ごとと合計）', '発注済', '発生原価', '計上額', '残', '消化率', '粗利（発生原価ベース）'],
    },
    'orders': {
        'name': '発注',
        'fields': [
            F('no', '発注番号', '文字 26-001-03 の形（工事番号-連番2桁）', '○', '不可', '自動採番'),
            F('kouji', '工事番号', '工事（受注か施工中の物）', '○', '不可', '遷移元の工事'),
            F('related', '関連発注番号', '発注（追加は元の通常の発注、減額は減らす対象の発注）', '追加・減額のときに○', '不可',
              '遷移元の発注'),
            F('partner', '取引先', '取引先（仕入先か外注先、取引中の物）', '○', '起票中のみ可（追加・減額は元と同じで不可）', '空'),
            F('cat', '費目', '材料費／外注費／経費', '○', '起票中のみ可（追加・減額は元と同じで不可）', '空'),
            F('title', '件名', '文字 40字まで', '○', '起票中のみ可', '空'),
            F('amount', '発注金額', '円（税抜。通常と追加は1円以上、減額は負で元の未検収残まで）', '○', '起票中のみ可', '空'),
            F('due', '納期', '日付（起票日以降）', '通常と追加で○', '承認済まで可', '空'),
            F('status', '状態', '起票／承認済／検収済／打切／取消', '○', '遷移のみ', '起票'),
            F('overReason', '予算超過の理由', '文字', '超過時に○（承認のときに判定し直す）', '起票中のみ可', '空'),
            F(['drafter', 'draftedOn'], '起票者／起票日', '社員（工事担当）／日付（起票した日）', '○', '不可', '操作者／操作した日'),
            F(['approver', 'orderedOn'], '承認者／発注日', '社員（購買）／日付（承認した日）', '承認時に○', '不可', '空（起票中は空）'),
            F('cancelReason', '取消・打切の理由', '文字', '取消・打切のときに○', '不可', '空'),
            F('note', '備考', '文字', '', '可', '空'),
        ],
        'notes': [],
        'computed': ['区分（通常／追加／減額）', '有効発注額（通常と追加）', '発注検収の累計', '未検収残', '確認済の請求額',
                     '修正依頼の文言（修正依頼の後に再提出していない物）'],
    },
    'inspections': {
        'name': '発注検収',
        'fields': [
            F('no', '検収番号', '文字 26-001-03-K1 の形（発注番号-K連番）', '○', '不可', '自動採番'),
            F('order', '発注番号', '発注（承認済・検収済・打切の通常と追加の物）', '○', '不可', '選んだ発注'),
            F('date', '検収日', '日付（未締めの月、発注日以後）', '○', '不可', '基準日'),
            F('amount', '検収額', '円（通常は1円以上で未検収残以下。訂正は負で、絶対値は訂正元の残りまで）', '○', '不可', '空'),
            F('content', '内容', '納品／出来高／完了', '○', '不可', '空（訂正は訂正元と同じ）'),
            F('status', '状態', '有効／取消', '○', '遷移のみ', '有効'),
            F('corrects', '訂正元の検収番号', '発注検収（締め済の月の物）', '訂正のときに○', '不可', '空'),
            F('cancelReason', '取消の理由', '文字', '取消のときに○', '不可', '空'),
            F('registrant', '登録者', '社員', '○', '不可', '操作者'),
            F('note', '備考', '文字', '', '可', '空'),
        ],
        'notes': ['訂正（マイナス額）は、訂正元の検収番号が入った発注検収として登録する。額を直す操作は無く、取消と訂正で直す。'],
        'computed': [],
    },
    'invoices': {
        'name': '請求',
        'fields': [
            F('no', '受付番号', '文字 R-0081 の形', '○', '不可', '自動採番'),
            F('order', '発注番号', '発注（承認済・検収済・打切の通常と追加の物）', '○', '受付のみ可', '空'),
            F('partner', '取引先', '取引先', '○', '不可', '発注の取引先'),
            F('invoiceNo', '請求書番号', '文字（仕入先・外注先が付けた番号）', '○', '受付のみ可', '空'),
            F('invoiceDate', '請求書の日付', '日付', '○', '受付のみ可', '空'),
            F('amount', '請求額', '円（税抜、1円以上）', '○', '受付のみ可', '空'),
            F('receivedOn', '受付日', '日付', '○', '不可', '操作した日'),
            F('status', '状態', '受付／確認済／差戻し／取消', '○', '遷移のみ', '受付'),
            F('related', '関連する受付番号', '請求（差戻しの物。再受付の元）', '再受付のときに○', '不可', '空'),
            F(['checker', 'checkedOn'], '確認者／確認日', '社員／日付（実際に確認した日）', '確認時に○', '不可', '操作者／操作した日'),
            F('bookMonth', '計上月', '年月（未締めの月で、請求書の日付の月以後、確認日の月以前）', '確認時に○', '不可',
              '受付日の月（締め済なら未締めの最も早い月）'),
            F('cancelReason', '差戻し・取消の理由', '文字', '差戻し・取消のときに○', '不可', '空'),
            F('note', '備考', '文字', '', '可', '空'),
        ],
        'notes': [],
        'computed': ['判定（二重の疑い／発注検収なし／検収額を超えている／確定できる）', '過月分かどうか', '支払予定日',
                     '支払期日経過かどうか'],
    },
    'revisions': {
        'name': '予算改定',
        'fields': [
            F('no', '改定番号', '文字 26-009-Y1 の形（工事番号-Y連番）', '○', '不可', '自動採番'),
            F('kouji', '工事番号', '工事', '○', '不可', '遷移元の工事'),
            F('cat', '費目', '材料費／外注費／労務費／経費', '○', '起案中のみ可', '空'),
            F('before', '改定前の額', '円', '○', '不可', 'その時点の予算（今の値）'),
            F('after', '改定後の額', '円（0以上）', '○', '起案中のみ可', '空'),
            F('reason', '理由', '文字', '○', '起案中のみ可', '空'),
            F(['drafter', 'draftedOn'], '起案者／起案日', '社員（工事担当）／日付', '○', '不可', '操作者／基準日'),
            F('status', '状態', '起案／承認済／取消', '○', '遷移のみ', '起案'),
            F(['approver', 'revisedOn'], '承認者／改定日', '社員（営業）／日付（承認した日）', '承認時に○', '不可', '空'),
            F('cancelReason', '取消の理由', '文字', '取消のときに○', '不可', '空'),
        ],
        'notes': ['改定者は起案者と承認者の2人を持つ。改定日から予算（今の値）に入る。当初の値は工事の項目に残り、変わらない。'],
        'computed': [],
    },
    'labor': {
        'name': '労務費の計上',
        'fields': [
            F('kouji', '工事', '工事番号', '○', '不可', '対象の工事'),
            F('month', '月', '年月 2026-08 の形', '○', '不可', '対象の月'),
            F('hours', '時間', '時間（0.5刻み、0以上）', '○', '未締めの月は可', '日報の集計'),
            F('rate', '単価', '円／時間', '○', '未締めの月は可', '標準の時間単価'),
            F('amount', '金額', '円（時間×単価、円未満切り捨て）', '○', '不可', '計算'),
            F('recorder', '計上者', '社員（経理）', '計上時に○', '不可', '操作者'),
            F('recordedOn', '計上日', '日付（その月の中で未締めの月）', '計上時に○', '未締めの月は可', 'その月の末日'),
        ],
        'notes': ['1工事1か月に1行。計上日が空の行は未計上（時間だけ日報の集計が入っている）。'],
        'computed': [],
    },
    'partners': {
        'name': '取引先',
        'fields': [
            F('code', '取引先コード', 'T-101 の形'),
            F('name', '名称', '文字'),
            F('kind', '区分', '施主／仕入先／外注先'),
            F('contact', '担当者名', '姓のみ'),
            F('terms', '支払条件', '月末締め翌月末払い、など'),
            F('status', '取引状態', '取引中／停止'),
            F('registeredOn', '登録日', '日付'),
            F('note', '備考', '文字'),
        ],
        'notes': ['停止の取引先は発注で選べない。支払の実績は対象外。'],
        'computed': ['発注済', '確認済で支払予定の額（支払期日経過の物を含む）', '次の支払予定日（確認済の請求のうち最も早い支払予定日。支払期日経過の物も含む）'],
    },
    'history': {
        'name': '履歴',
        'columns': ['項目', '型', '内容'],
        'fields': [
            {'key': 'at', 'name': '日時', 'type': '日付と時刻 2026-09-08 14:05 の形', 'content': '操作した日時'},
            {'key': 'user', 'name': '操作者', 'type': '社員（姓）', 'content': ''},
            {'key': 'role', 'name': '役割', 'type': '営業／工事担当／購買／経理', 'content': '操作したときの役割'},
            {'key': 'target', 'name': '対象の番号',
             'type': '工事番号、発注番号、検収番号、受付番号、改定番号、労務費（工事番号と月）、締めの月', 'content': ''},
            {'key': 'op', 'name': '操作の種類',
             'type': '登録、変更、承認、修正依頼、再提出、状態を進める、状態を戻す、取消、打切、訂正、確認、差戻し、再受付、'
                     '予算改定の起案、予算改定の承認、労務費の計上、締め、締め解除', 'content': ''},
            {'key': 'before', 'name': '変更前', 'type': '項目名と値の組', 'content': '消した値と変えた値を含む'},
            {'key': 'after', 'name': '変更後', 'type': '項目名と値の組', 'content': '締めは「第2回」のように回数を含む'},
            {'key': 'reason', 'name': '理由', 'type': '文字',
             'content': '取消、打切、訂正、差戻し、修正依頼（依頼の文言）、状態を戻す、受注後の受注金額の変更、締め解除、予算超過、'
                        '予算改定では必須。過月分の確認は「過月分」と入る'},
            {'key': 'related', 'name': '関連する番号', 'type': '番号',
             'content': '元の発注番号、訂正元の検収番号、再受付の元の受付番号、重複の正本の受付番号'},
        ],
        'notes': ['全ての登録・変更・承認・修正依頼・再提出・取消・打切・訂正・状態変更・計上・締めに1行残す。履歴は直せず、消せない。',
                  '工事詳細、発注の詳細、請求の行、月次の締めに新しい順で出し、理由は折りたたまない。'],
        'computed': [],
    },
}
HIST_OPS = ['登録', '変更', '承認', '修正依頼', '再提出', '状態を進める', '状態を戻す', '取消', '打切', '訂正', '確認',
            '差戻し', '再受付', '予算改定の起案', '予算改定の承認', '労務費の計上', '締め', '締め解除']

# ---- 状態遷移 ----

TRANSITION_COLUMNS = [('target', '対象'), ('op', '操作'), ('from', '変更前の状態'), ('to', '変更後の状態'),
                      ('roles', '権限'), ('pre', '前提'), ('after', '後始末'), ('undo', '取消の方法')]
_T = [
    ('工事（進める）', '登録する', 'なし', '見積中', '営業',
     '工事名、施主、工事場所、工事種別、営業担当、見積金額、着工予定日、完工予定日が入っている', '工事番号を採番する', 'なし'),
    ('工事（進める）', '受注にする', '見積中', '受注', '営業',
     '受注金額（見積中に入れた値が初期値）、受注日、工事担当、実行予算（当初、4費目）が入っている',
     '受注金額、受注日を記録する。実行予算（当初）を固定する', '受注から見積中に戻す'),
    ('工事（進める）', '着工する', '受注', '施工中', '工事担当', '着工日が受注日以後', '着工日を記録する', '施工中から受注に戻す'),
    ('工事（進める）', '施主検収を登録する', '施工中', '検収済', '工事担当', '施主検収日が着工日以後', '施主検収日を記録する',
     '検収済から施工中に戻す'),
    ('工事（進める）', '施主に請求する', '検収済', '請求済', '経理', '施主検収日がある。施主請求日が施主検収日以後',
     '施主請求日、請求額（一括）を記録する', '請求済から検収済に戻す'),
    ('工事（進める）', '完了にする', '請求済', '完了', '経理',
     '入金日が施主請求日以後。その工事の通常と追加の発注が全て 検収済・取消・打切 のどれかで、発注ごとに有効な発注検収の累計と'
     '確認済の請求額の合計が一致している。起票のままの減額発注が無い。受付のままの請求が無い',
     '入金日（一括）を記録する', '完了から請求済に戻す'),
    ('工事（戻す）', '状態を1つ戻す', '完了', '請求済', '経理', 'なし', '入金日を消す', '完了にする'),
    ('工事（戻す）', '状態を1つ戻す', '請求済', '検収済', '経理', 'なし', '施主請求日、請求額を消す', '施主に請求する'),
    ('工事（戻す）', '状態を1つ戻す', '検収済', '施工中', '経理', 'なし', '施主検収日を消す', '施主検収を登録する'),
    ('工事（戻す）', '状態を1つ戻す', '施工中', '受注', '経理', 'その工事に、有効な発注検収、確認済の請求、計上済の労務費が無い',
     '着工日を消す', '着工する'),
    ('工事（戻す）', '状態を1つ戻す', '受注', '見積中', '営業',
     'その工事に発注が1件も無い（起票のままと取消の物も数える）。取消以外の予算改定が無い',
     '受注金額、受注日を消す。実行予算（当初）は値を残し、固定を外す', '受注にする'),
    ('発注', '起票する', 'なし', '起票', '工事担当', '工事が受注か施工中。予算を超えるときは予算超過の理由',
     '起票者、起票日＝操作した日。発注日は空', '取り消す（起票のまま）'),
    ('発注', '追加発注を起票する', 'なし', '起票', '工事担当',
     '元の発注が承認済か検収済の通常の発注。取引先と費目は元の発注と同じ。工事が受注か施工中。予算を超えるときは予算超過の理由',
     '関連発注番号に元の発注番号を入れる', '取り消す（起票のまま）'),
    ('発注', '減額発注を起票する', 'なし', '起票', '工事担当',
     '元の発注が承認済（一部検収を含む）。金額は負で、絶対値は元の発注の未検収残まで。工事が受注か施工中',
     '関連発注番号に減らす対象の発注番号を入れる', '取り消す（起票のまま）'),
    ('発注', '修正依頼する', '起票', '起票', '購買', 'なし', '依頼の文言必須。状態は変えず、履歴に「修正依頼」と文言を残す',
     '再提出する'),
    ('発注', '再提出する', '起票', '起票', '工事担当', '修正依頼を受けている',
     '直した内容（予算超過の理由など）の変更前と変更後を履歴に残す', 'なし'),
    ('発注', '承認する', '起票', '承認済', '購買',
     '承認の時点の予算と発注済で予算超過を判定し直し、超過なら予算超過の理由が入っている（無ければ承認できず、修正依頼で戻す）。'
     '減額発注は絶対値が元の発注の未検収残以下',
     '承認者、発注日＝承認した日。以後、発注金額、取引先、費目は変えない。減額発注は元の発注の有効発注額を下げ、'
     '元の発注の累計が有効発注額に達すれば元の発注は検収済に移る',
     '取り消す（承認済）。金額を変えるときは追加発注か減額発注'),
    ('発注', '検収で達する', '承認済', '検収済', '自動', '通常と追加の発注で、発注検収の累計が有効発注額に達した', 'なし',
     '発注検収の取消か訂正で承認済に戻る'),
    ('発注', '検収の取消や訂正で戻る', '検収済', '承認済', '自動', '発注検収の取消か訂正で、累計が有効発注額を下回った',
     'なし。打切の発注は打切のまま', 'なし'),
    ('発注', '未検収残を打ち切る', '承認済（一部検収）', '打切', '購買',
     '発注検収の累計が0より大きく有効発注額より小さい。受付のままの請求が無い',
     '理由必須。未検収残を0にする。検収済の額はそのまま残る', 'なし'),
    ('発注', '取り消す（起票のまま）', '起票', '取消', '工事担当', 'なし', '理由必須', 'なし'),
    ('発注', '取り消す（承認済）', '承認済', '取消', '購買', '有効な発注検収が無い。受付のままの請求と確認済の請求が無い',
     '理由必須', 'なし'),
    ('発注検収', '登録する', 'なし', '有効', '工事担当、購買',
     '発注が承認済（未検収残がある）。検収日が未締めの月で、発注日以後。検収額が1円以上で未検収残以下',
     '発注の累計が増え、達したら発注が検収済になる', '検収日の月が未締めなら取り消す。締め済なら訂正（マイナス額）を登録する'),
    ('発注検収', '取り消す', '有効', '取消', '工事担当、購買',
     '発注が承認済・検収済・打切のどれか。検収日の月が未締め。取り消した後の累計が、その発注の確認済の請求額以上',
     '理由必須。元の記録は消さない。累計が減り、検収済の発注は累計が有効発注額を下回ると承認済に戻る。打切の発注は打切のまま',
     'なし（正しい額で登録し直す）'),
    ('発注検収', '訂正する（マイナス額）', 'なし', '有効', '工事担当、購買',
     '発注が承認済・検収済・打切のどれか。訂正元の検収日の月が締め済。検収日は未締めの月。額は負で、絶対値は訂正元の額'
     '（既にある訂正の分を引いた残り）まで。訂正後の累計が、その発注の確認済の請求額以上',
     '訂正元の検収番号を持つ。締め済の月の数字は変えず、訂正は検収日の月に入る。検収済の発注は累計が有効発注額を下回ると'
     '承認済に戻る。打切の発注は打切のまま', '検収日の月が未締めなら取り消す'),
    ('請求', '受付する', 'なし', '受付', '経理',
     '発注は 承認済・検収済・打切 の通常と追加の発注から選ぶ（起票、取消、減額発注は選べない）。日付の制限は無い',
     '受付日＝操作した日。判定をすぐ出す', '取り消す、または差し戻す'),
    ('請求', '確認する', '受付', '確認済', '経理', '判定が「確定できる」。確認のダイアログで計上月を選ぶ（締め済の月は選べない）',
     '確認者、確認日＝実際に確認した日（操作した日）、計上月。過月分ならその旨を履歴に残す', 'なし'),
    ('請求', '差し戻す', '受付', '差戻し', '経理', 'なし', '理由必須（取引先へ返却したことと理由）', '修正版が届いたら再受付する'),
    ('請求', '再受付する', 'なし', '受付', '経理', '元の請求が差戻し', '関連する受付番号に元の受付番号', '取り消す、または差し戻す'),
    ('請求', '取り消す', '受付', '取消', '経理', 'なし', '理由必須。重複の解消のときは、履歴の関連する番号に正本の受付番号', 'なし'),
    ('予算改定', '起案する', 'なし', '起案', '工事担当', '工事が受注か施工中。同じ工事の同じ費目に、起案のままの改定が無い',
     '改定前の額にその時点の予算（今の値）を入れる', '取り消す（起案のまま）'),
    ('予算改定', '承認する', '起案', '承認済', '営業', 'なし', '承認者、改定日＝承認した日。改定日から予算（今の値）に入る',
     '新しい改定を起案する'),
    ('予算改定', '取り消す（起案のまま）', '起案', '取消', '工事担当、営業', 'なし', '理由必須', 'なし'),
    ('労務費の計上', '計上する', '未計上', '計上済', '経理', '計上日がその月の中の日付で、未締めの月',
     '計上者、計上日。金額＝時間×単価（円未満切り捨て）', '未締めの月なら直す'),
    ('労務費の計上', '直す', '計上済', '計上済', '経理', '計上日の月が未締め', '変更前と変更後を履歴に残す', 'なし'),
    ('月次の締め', '締める', '未締め', '締め済', '経理',
     'その月の末日が基準日より前。前の月が締め済（4月は3月の繰越で満たす）。請求書の日付がその月以前で受付のままの請求が無い'
     '（差戻しと取消は止めない）。その月に施工中だった工事の労務費が全て計上済',
     '締めた回数を履歴に残す。納期を過ぎて未検収の発注と起票のままの発注は警告に出すが止めない', '締め解除する'),
    ('月次の締め', '締め解除する', '締め済', '未締め', '経理', '直近の締め済の月（後の月が締め済でない）。3月（繰越）は解除できない',
     '理由必須', 'もう一度締める（条件を判定し直す）'),
]
ROLE_KEY = {v: k for k, v in ROLES.items()}
TRANSITIONS = {
    'columns': [{'key': k, 'name': n} for k, n in TRANSITION_COLUMNS],
    'rows': [dict(target=t, op=o, **{'from': a}, to=b, roles=r, pre=p, after=af, undo=u,
                  roleKeys=[ROLE_KEY[x] for x in r.split('、') if x in ROLE_KEY])
             for t, o, a, b, r, p, af, u in _T],
    'notes': {
        '工事（戻す）': ['1回に1段だけ戻す。理由は必須。確認を出してから戻す。',
                     '発注、発注検収、請求、予算改定は状態を戻さない。直しは取消、打切、訂正、修正依頼、差戻し、再受付で行い、元の記録は残す。'],
        '発注': ['一部検収の間は「承認済（一部検収）」と表示する。', '取消と打切の後は編集できない。'],
        '発注検収': ['締め済の月の発注検収は取り消せない。直すときは当月の日付で訂正（マイナス額）を登録する。'],
        '請求': ['判定は 二重の疑い、発注検収なし、検収額を超えている、確定できる の順に見て、最初に当たった物を出す。'],
    },
}

# ---- 役割と権限 ----

_PERM = [
    ('工事の登録・基本情報の編集（施工中以後は工事担当、完工予定日、備考だけ）', '○', '×', '×', '×'),
    ('受注金額の入力（見積中）', '○', '×', '×', '×'),
    ('受注金額の変更（受注後、理由必須）', '×', '×', '×', '○'),
    ('工事を受注に進める', '○', '×', '×', '×'),
    ('工事を受注から見積中に戻す', '○', '×', '×', '×'),
    ('着工・施主検収の登録', '×', '○', '×', '×'),
    ('施主請求・入金の登録', '×', '×', '×', '○'),
    ('工事の状態を1つ戻す（受注から見積中を除く）', '×', '×', '×', '○'),
    ('予算改定の起案', '×', '○', '×', '×'),
    ('予算改定の承認', '○', '×', '×', '×'),
    ('予算改定の取消（起案のまま）', '○', '○', '×', '×'),
    ('発注の起票・再提出（追加発注・減額発注を含む。工事が受注か施工中のとき）', '×', '○', '×', '×'),
    ('発注の承認・修正依頼', '×', '×', '○', '×'),
    ('発注の取消', '×', '起票のままの物', '承認済の物', '×'),
    ('未検収残の打切', '×', '×', '○', '×'),
    ('発注検収の登録・取消・訂正', '×', '○', '○', '×'),
    ('請求の受付・確認・差戻し・再受付・取消', '×', '×', '×', '○'),
    ('労務費の計上', '×', '×', '×', '○'),
    ('取引先の登録・編集', '施主のみ', '×', '仕入先・外注先', '×'),
    ('月次の締め・解除', '×', '×', '×', '○'),
]
PERMISSIONS = {
    'columns': [{'key': k, 'name': v} for k, v in ROLES.items()],
    'rows': [dict(op=r[0], eigyo=r[1], tanto=r[2], kobai=r[3], keiri=r[4]) for r in _PERM],
    'rules': ['操作の権限は役割の単位で決める。同じ役割なら誰が操作してもよい。',
              '起票と承認は別の役割にする。発注は工事担当が起票して購買が承認する。予算改定は工事担当が起案して営業が承認する。'],
    'visibility': [
        {'items': ['受注金額', '粗利（発生原価ベース）'], 'roles': ['eigyo', 'keiri']},
        {'items': ['支払条件', '確認済で支払予定の額', '支払予定日'], 'roles': ['kobai', 'keiri']},
    ],
    'disabledMessages': [
        '承認は購買のみ', '発注の起票は工事担当のみ', '起票できるのは受注か施工中の工事だけ', '基本情報の編集は営業のみ',
        '請求の確認は経理のみ', '承認後は金額を変えられません。増やすときは追加発注、減らすときは減額発注を起票します',
        '発注検収が無いため確認できません',
    ],
}
BANNERS = {
    'eigyo': '営業として見ています。工事の登録と受注、予算改定の承認ができます。',
    'tanto': '工事担当として見ています。発注の起票、発注検収の登録、着工と施主検収の登録ができます。',
    'kobai': '購買として見ています。発注の承認と修正依頼、発注検収の登録、打切ができます。',
    'keiri': '経理として見ています。請求の確認、労務費の計上、月次の締めができます。',
}

# ---- 場面 ----

SCENE_DEF = {
    'budgetOver': {'title': '予算を超えている工事', 'kouji': '26-005', 'order': '26-005-04', 'cat': '外注費',
                   'url': 'app.html#/kouji/26-005?role=keiri&reset=1'},
    'closedMonth': {'title': '締めた月に入力しようとした', 'order': '26-007-03', 'date': '2026-07-15',
                    'url': 'app.html#/kenshu?hacchu=26-007-03&date=2026-07-15&role=tanto&reset=1'},
    'duplicate': {'title': '同じ発注に請求が2本', 'refs': ['n15', 'n16'], 'order': '26-007-01'},
    'noInspection': {'title': '検収していないのに請求', 'ref': 'n18', 'order': '26-010-02'},
    'ipponmichi': {'title': '操作の流れ', 'kouji': '26-011', 'cat': '外注費',
                   'url': 'app.html#/hacchu/new?kouji=26-011&role=tanto&reset=1'},
}


def build(w):
    """World から window.SAMPLE の中身を組み立てる。"""
    scenes = {}
    for key, s in SCENE_DEF.items():
        s = dict(s)
        if 'refs' in s:
            s['invoices'] = [w.refs[r] for r in s.pop('refs')]
            s['url'] = 'app.html#/seikyu?focus=%s&role=keiri&reset=1' % s['invoices'][0]
        if 'ref' in s:
            s['invoice'] = w.refs[s.pop('ref')]
            s['url'] = 'app.html#/seikyu?focus=%s&role=keiri&reset=1' % s['invoice']
        scenes[key] = s

    def ins_key(i):
        return (i['order'], int(i['no'].rsplit('-K', 1)[1]))

    settings = {
        'company': COMPANY,
        'companyLabel': COMPANY + '（架空）',
        'baseDate': BASE_DATE,
        'defaultRole': 'keiri',
        'roleUsers': dict(ROLE_USERS),
        'roles': [{'key': k, 'name': v, 'user': ROLE_USERS[k], 'banner': BANNERS[k]} for k, v in ROLES.items()],
        'laborRate': LABOR_RATE,
        'terms': TERMS,
        'categories': CATS,
        'orderCategories': ORDER_CATS,
        'statuses': {
            'kouji': ['見積中', '受注', '施工中', '検収済', '請求済', '完了'],
            'orders': ['起票', '承認済', '検収済', '打切', '取消'],
            'inspections': ['有効', '取消'],
            'invoices': ['受付', '確認済', '差戻し', '取消'],
            'revisions': ['起案', '承認済', '取消'],
            'months': ['未締め', '締め済'],
        },
        'koujiKinds': ['空調', '給排水', '衛生', '電気', '消防', '改修'],
        'inspectionContents': ['納品', '出来高', '完了'],
        'judgements': ['二重の疑い', '発注検収なし', '検収額を超えている', '確定できる'],
        'months': [dict(w.months[m]) for m in MONTHS],
    }
    return {
        '基準日': BASE_DATE,
        'settings': settings,
        'employees': [dict(e) for e in EMPLOYEES],
        'partners': [dict(p) for p in PARTNERS],
        'kouji': [w.kouji[k] for k in sorted(w.kouji)],
        'orders': [w.orders[k] for k in sorted(w.orders)],
        'inspections': sorted(w.inspections.values(), key=ins_key),
        'invoices': [w.invoices[k] for k in sorted(w.invoices)],
        'revisions': [w.revisions[k] for k in sorted(w.revisions)],
        'labor': sorted(w.labor.values(), key=lambda l: (l['kouji'], l['month'])),
        'history': w.history,
        'schema': SCHEMA,
        'transitions': TRANSITIONS,
        'permissions': PERMISSIONS,
        'scenes': scenes,
    }


# ---- 自己検査（場面と件数、生成の途中の値） ----

def self_check(w):
    """全ての不合格の文を返す。空なら合格。"""
    bad = []

    def ok(cond, msg):
        if not cond:
            bad.append(msg)

    K, O, I, V, R, L, H = w.kouji, w.orders, w.inspections, w.invoices, w.revisions, w.labor, w.history
    pos = [o for o in O.values() if o['amount'] > 0]
    normal = [o for o in pos if not o['related']]

    # 件数と金額の桁
    ok(len(K) == 15, '工事の件数 %d' % len(K))
    ok(60 <= len(O) <= 70, '発注の件数 %d' % len(O))
    ok(50 <= len(I) <= 60, '発注検収の件数 %d' % len(I))
    ok(22 <= len(V) <= 28, '請求の件数 %d' % len(V))
    ok(30 <= len(L) <= 45, '労務費の件数 %d' % len(L))
    ok(1 <= len(R) <= 2, '予算改定の件数 %d' % len(R))
    ok(250 <= len(H) <= 330, '履歴の件数 %d' % len(H))
    cs = [k['contract'] for k in K.values() if k['contract'] and k['status'] != '見積中']
    ok(900000 <= min(cs) <= 999999 and 48000000 <= max(cs) <= 48999999, '受注金額の幅 %d〜%d' % (min(cs), max(cs)))
    am = [o['amount'] for o in pos]
    ok(80000 <= min(am) <= 89999 and 9000000 <= max(am) <= 9999999, '発注金額の幅 %d〜%d' % (min(am), max(am)))
    ok(len({o['amount'] for o in normal}) == len(normal), '通常の発注に同じ金額がある')
    ok(sum(1 for o in O.values() if o['amount'] % 1000 == 0) * 2 < len(O), '千円ちょうどの発注金額が半分以上')
    ok(all(l['hours'] * 2 == int(l['hours'] * 2) for l in L.values()), '0.5刻みでない時間がある')
    ok(any(l['hours'] != int(l['hours']) for l in L.values()), '端数のある時間が無い')
    ok(due_date('2026-08-25', '月末締め翌月末払い') == '2026-09-30', '支払予定日の計算')
    late = [v['no'] for v in V.values()
            if v['status'] == '確認済' and due_date(v['invoiceDate'], PARTNER[v['partner']]['terms']) < BASE_DATE]
    ok(1 <= len(late) <= 2, '支払期日経過の請求 %s' % late)

    # 予算超過
    over = {(k, c) for k in K for c in CATS if w.committed(k, c) > w.budget(k, c)}
    ok(over == {('26-005', '外注費'), ('26-008', '材料費')}, '予算超過の組 %s' % sorted(over))
    o = O['26-005-04']
    ok(K['26-005']['status'] == '施工中' and o['status'] in ('承認済', '検収済') and o['overReason'],
       '26-005 と 26-005-04 の状態')
    ok(w.committed('26-005', '外注費') - w.eff('26-005-04') <= w.budget('26-005', '外注費'), '26-005-04 が超過の原因でない')

    # 締め済の月に納期がある未検収の発注
    july = {o['no'] for o in pos if o['status'] == '承認済' and o['due'][:7] == '2026-07' and w.cum(o['no']) == 0}
    ok(july == {'26-007-03', '26-010-02'}, '7月納期の未検収の発注 %s' % sorted(july))

    # 受付のままの請求
    wait = [v for v in V.values() if v['status'] == '受付']
    ok(len(wait) == 4 and all(ym(v['invoiceDate']) == ym(v['receivedOn']) == '2026-08' for v in wait),
       '受付のままの請求 %s' % [v['no'] for v in wait])
    ok(sorted(w.judge(v) for v in wait) == sorted(['二重の疑い', '二重の疑い', '発注検収なし', '確定できる']),
       '受付の請求の判定 %s' % [(v['no'], w.judge(v)) for v in wait])
    a, z = V[w.refs['n15']], V[w.refs['n16']]
    ok(a['order'] == z['order'] and a['invoiceNo'] == z['invoiceNo'] and a['partner'] == z['partner'], '二重の請求の組')
    ok(w.judge(V[w.refs['n18']]) == '発注検収なし', '発注検収なしの請求')
    ok(w.judge(V[w.refs['n17']]) == '確定できる', '確定できる請求')

    # 差戻しと再受付
    ret = [v for v in V.values() if v['status'] == '差戻し']
    again = [v for v in V.values() if v['related']]
    ok(len(ret) == 1 and len(again) == 1 and again[0]['related'] == ret[0]['no'] and again[0]['status'] == '確認済',
       '差戻しと再受付の組')

    # 発注の状態の場面
    partial = [o['no'] for o in pos if o['status'] == '承認済' and 0 < w.cum(o['no']) < w.eff(o['no'])]
    ok(len(partial) >= 3, '一部検収の発注 %s' % partial)
    cancel = [o for o in O.values() if o['status'] == '取消']
    ok(len(cancel) == 2 and all(o['cancelReason'] for o in cancel), '取消の発注 %s' % [o['no'] for o in cancel])
    term = [o for o in O.values() if o['status'] == '打切']
    ok(len(term) == 1 and K[term[0]['kouji']]['status'] == '検収済' and w.log['terminateCum'].get(term[0]['no'], 0) > 0
       and w.log['terminateCum'][term[0]['no']] < w.eff(term[0]['no']), '打切の発注')
    add = [o for o in pos if o['related']]
    red = [o for o in O.values() if o['amount'] < 0]
    ok(len(add) == 1 and len(red) == 1, '追加と減額の発注 %s %s' % ([o['no'] for o in add], [o['no'] for o in red]))
    ok(len(w.log['draftStatus']) == len(O) and all(s in ('受注', '施工中') for s in w.log['draftStatus'].values()),
       '起票の時点の工事の状態')
    ok(w.eff('26-006-02') == O['26-006-02']['amount'] + O['26-006-07']['amount'], '26-006-02 の有効発注額')
    for r in red:
        if r['status'] == '承認済':
            ok(-r['amount'] <= w.log['reduceRemain'].get(r['no'], -1), '減額の承認の時点の未検収残 ' + r['no'])

    # 発注検収の場面
    for i in I.values():
        oo = O[i['order']]
        ok(oo['amount'] > 0 and oo['orderedOn'] and oo['orderedOn'] <= i['date'] <= BASE_DATE, '検収の対象と日付 ' + i['no'])
    gone = [i for i in I.values() if i['status'] == '取消']
    ok(len(gone) == 1 and ym(gone[0]['date']) == '2026-08' and any(
        j['order'] == gone[0]['order'] and j['date'] == gone[0]['date'] and j['status'] == '有効' and not j['corrects']
        for j in I.values()), '取り消して登録し直した発注検収')
    corr = [i for i in I.values() if i['corrects']]
    ok(len(corr) == 1 and corr[0]['amount'] < 0 and ym(corr[0]['date']) == '2026-08'
       and w.closed(ym(I[corr[0]['corrects']]['date'])), 'マイナスの訂正')
    row = [h for h in H if h['op'] == '訂正']
    ok(len(row) == 1 and row[0]['after'].get('発注の状態') == '承認済', '訂正で発注が承認済に戻る')

    # 締め
    ops6 = [h['op'] for h in H if h['target'] == '2026-06']
    ok(ops6 == ['締め', '締め解除', '締め'], '6月の締めの履歴 %s' % ops6)
    idx = {(h['target'], h['op']): n for n, h in enumerate(H) if h['op'] in ('締め', '締め解除')}
    ok(idx.get(('2026-06', '締め解除'), 10 ** 6) < idx.get(('2026-07', '締め'), -1), '6月の解除が7月の締めより前')
    ok(w.months['2026-06']['closeCount'] == 2 and [h for h in H if h['target'] == '2026-06'][-1]['after'].get('回数') == '第2回',
       '6月の締めの回数')
    ok([m for m, _ in w.log['closeCheck']] == ['2026-04', '2026-05', '2026-06', '2026-06', '2026-07'], '締めの順')
    ok(all(t[:10] > month_end(m) for m, t in w.log['closeCheck']), '締めた日が月末より後でない')
    ok([m for m in MONTHS if w.closed(m)] == ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07'], '締め済の月')

    # 労務費
    for m in ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08']:
        rows = [l for l in L.values() if l['month'] == m]
        ok(sorted(l['kouji'] for l in rows) == sorted(w.labor_targets(m)), '労務費の行と対象の工事 ' + m)
        if m == '2026-08':
            ok(rows and all(l['recordedOn'] is None for l in rows), '8月の労務費は未計上')
        else:
            ok(all(l['recordedOn'] for l in rows), '労務費の未計上 ' + m)
    ok(not any(l['month'] == '2026-09' for l in L.values()), '9月の労務費の行がある')
    ok(all(l['amount'] == int(l['hours'] * 2) * l['rate'] // 2 for l in L.values()), '労務費の金額')

    # 予算改定
    for r in R.values():
        ok(r['status'] == '承認済' and r['cat'] == '材料費' and r['after'] > r['before']
           and K[r['kouji']]['status'] == '施工中', '予算改定 ' + r['no'])
        ok(EMP[r['drafter']]['role'] == '工事担当' and EMP[r['approver']]['role'] == '営業', '予算改定の起案者と承認者')
        ok(r['before'] == w.log['revBefore'][r['no']] == KB[r['kouji']]['budget0'][r['cat']], '改定前の額 ' + r['no'])

    # 工事の状態
    back = [h for h in H if h['op'] == '状態を戻す']
    ok(len(back) == 1 and back[0]['reason'] and '着工日' in back[0]['before'] and len(w.log['rollback']) == 1,
       '状態を戻した工事')
    ok(sum(1 for k in K.values() if k['status'] == '検収済') == 2, '検収済の工事の数')
    done = [k['no'] for k in K.values() if k['status'] == '完了']
    ok(done == ['26-001'] and not w.completion_issues('26-001'), '完了の工事 %s' % done)
    b11, c11 = w.budget('26-011', '外注費'), w.committed('26-011', '外注費')
    ok(K['26-011']['status'] == '施工中' and 0 < b11 - c11 <= b11 * 0.15, '26-011 の外注費の残 %d' % (b11 - c11))
    ok(all(o['status'] in ('承認済', '検収済') for o in O.values() if o['kouji'] == '26-011'), '26-011 の発注の状態')

    # 起票日、発注日、受付の時点の発注の状態
    first = {}
    for h in H:
        first.setdefault((h['target'], h['op']), h['at'][:10])
    for o in O.values():
        ok(o['draftedOn'] == first.get((o['no'], '登録')), '起票日 ' + o['no'])
        ok(o['orderedOn'] == first.get((o['no'], '承認')), '発注日 ' + o['no'])
        if o['status'] == '起票':
            ok(o['orderedOn'] is None and o['approver'] is None, '起票のままの発注日 ' + o['no'])
    ok(len(w.log['receiptOrderStatus']) == len(V)
       and all(s in ('承認済', '検収済', '打切') for s in w.log['receiptOrderStatus'].values()), '受付の時点の発注の状態')
    return bad


def main():
    try:
        w = run()
    except RuleError as e:
        print('決まりごとに合わない操作: %s' % e)
        sys.exit(1)
    data = build(w)
    bad = self_check(w)
    here = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, here)
    sys.dont_write_bytecode = True
    import check_rules
    for name, items in check_rules.run_checks(json.loads(json.dumps(data, ensure_ascii=False))):
        bad += ['%s: %s' % (name, x) for x in items]
    if bad:
        print('自己検査: 不合格 %d件（data.js は書き出さない）' % len(bad))
        for b in bad:
            print('  ' + b)
        sys.exit(1)
    out_dir = os.path.join(here, '..', 'assets')
    os.makedirs(out_dir, exist_ok=True)
    body = json.dumps(data, ensure_ascii=False, indent=1)
    with open(os.path.join(out_dir, 'data.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(HEADER + '\n' + 'window.SAMPLE = ' + body + ';\n')
    print('自己検査: 合格')
    for key in ['employees', 'partners', 'kouji', 'orders', 'inspections', 'invoices', 'revisions', 'labor', 'history']:
        print('%s %d' % (key, len(data[key])))


if __name__ == '__main__':
    main()
