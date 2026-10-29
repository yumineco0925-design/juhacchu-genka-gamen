"""サンプルデータ assets/data.js を業務の決まりごとに照らして検査する。

使い方:
  python check_rules.py                 項目ごとに 合格／不合格 と該当の番号を出す
  python check_rules.py --table         工事ごと費目ごとの 予算、発注済、発生原価、計上額 も出す
  python check_rules.py --words 一覧    site の全ファイルに一覧の語が無いかも調べる（語そのものは出さない）
不合格が1件でもあれば終了コード1で終わる。
"""
import calendar
import json
import os
import re
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.normpath(os.path.join(HERE, '..'))
DATA = os.path.join(SITE, 'assets', 'data.js')
PREFIX = 'window.SAMPLE = '
TEXT_EXT = {'.html', '.htm', '.js', '.css', '.py', '.md', '.txt', '.svg', '.json', '.csv', '.gs', '.xml'}
ZIP_EXT = {'.xlsx', '.docx', '.pptx'}
REASON_OPS = {'取消', '打切', '訂正', '差戻し', '修正依頼', '状態を戻す', '締め解除', '予算改定の起案', '予算改定の承認'}
KOUJI_STEPS = [('見積中', []), ('受注', ['contract', 'contractOn']), ('施工中', ['startOn']),
               ('検収済', ['clientInspectOn']), ('請求済', ['clientBillOn', 'clientBillAmount']),
               ('完了', ['paidOn'])]
KOUJI_DATES = ['contractOn', 'startOn', 'clientInspectOn', 'clientBillOn', 'paidOn']
SCENE_KEYS = ['budgetOver', 'closedMonth', 'duplicate', 'noInspection', 'ipponmichi']


def load(path=DATA):
    """data.js の「window.SAMPLE = 」の後を JSON として読む。"""
    with open(path, encoding='utf-8') as f:
        text = f.read()
    body = text[text.index(PREFIX) + len(PREFIX):].rstrip()
    if body.endswith(';'):
        body = body[:-1]
    return json.loads(body)


def ym(d):
    return d[:7]


def month_end(m):
    y, mo = int(m[:4]), int(m[5:7])
    return '%s-%02d' % (m, calendar.monthrange(y, mo)[1])


def add_months(m, n):
    y, mo = int(m[:4]), int(m[5:7]) - 1 + n
    return '%04d-%02d' % (y + mo // 12, mo % 12 + 1)


def due_date(inv_date, t):
    """請求書の日付に支払条件を当てて支払予定日を出す。"""
    m = ym(inv_date)
    if t['closeDay'] and int(inv_date[8:10]) > t['closeDay']:
        m = add_months(m, 1)
    pm = add_months(m, t['months'])
    return month_end(pm) if t['payDay'] == 0 else '%s-%02d' % (pm, t['payDay'])


def yen(a):
    return '{:,}'.format(a)


class Model:
    """画面と同じ式で金額と判定を出す。過去の時点の状態は履歴をたどって出す。"""

    def __init__(self, S):
        st = S['settings']
        self.S = S
        self.base = S['基準日']
        self.cats = st['categories']
        self.terms = st['terms']
        self.first_month = st['months'][0]['month']
        self.kouji = {k['no']: k for k in S['kouji']}
        self.orders = {o['no']: o for o in S['orders']}
        self.insp = {i['no']: i for i in S['inspections']}
        self.inv = {v['no']: v for v in S['invoices']}
        self.rev = {r['no']: r for r in S['revisions']}
        self.labor = {'%s %s' % (l['kouji'], l['month']): l for l in S['labor']}
        self.partners = {p['code']: p for p in S['partners']}
        self.emp = {e['id']: e for e in S['employees']}
        self.by_name = {e['name']: e for e in S['employees']}
        self.months = {m['month']: m for m in st['months']}
        self.hist = S['history']
        self.rows = {}
        for n, h in enumerate(self.hist):
            self.rows.setdefault(h['target'], []).append(n)
        self.o_insp = {}
        for i in S['inspections']:
            self.o_insp.setdefault(i['order'], []).append(i)
        self.o_inv = {}
        for v in S['invoices']:
            self.o_inv.setdefault(v['order'], []).append(v)

    # ---- 今の値 ----
    @staticmethod
    def kind(o):
        if o['amount'] < 0:
            return '減額'
        return '追加' if o['related'] else '通常'

    def eff(self, no):
        return self.orders[no]['amount'] + sum(
            r['amount'] for r in self.orders.values()
            if r['related'] == no and r['amount'] < 0 and r['status'] == '承認済')

    def cum(self, no):
        return sum(i['amount'] for i in self.o_insp.get(no, []) if i['status'] == '有効')

    def confirmed(self, no):
        return sum(v['amount'] for v in self.o_inv.get(no, []) if v['status'] == '確認済')

    def remaining(self, no):
        if self.orders[no]['status'] in ('打切', '取消'):
            return 0
        return self.eff(no) - self.cum(no)

    def budget(self, k, cat):
        return self.kouji[k]['budget0'][cat] + sum(
            r['after'] - r['before'] for r in self.rev.values()
            if r['kouji'] == k and r['cat'] == cat and r['status'] == '承認済')

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
        """二重の疑い、発注検収なし、検収額を超えている、確定できる の順に見る。"""
        for w in self.inv.values():
            if w['no'] == v['no']:
                continue
            if w['order'] == v['order'] and w['status'] == '受付':
                return '二重の疑い'
            if (w['partner'] == v['partner'] and w['invoiceNo'] == v['invoiceNo']
                    and w['status'] not in ('取消', '差戻し')):
                return '二重の疑い'
        if not any(i['status'] == '有効' for i in self.o_insp.get(v['order'], [])):
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
                    out.append('起票のままの減額発注 ' + o['no'])
                continue
            if o['status'] not in ('検収済', '取消', '打切'):
                out.append('発注検収が済んでいない発注 ' + o['no'])
            if self.cum(o['no']) != self.confirmed(o['no']):
                out.append('発注検収の累計と確認済の請求額が合わない発注 ' + o['no'])
            for v in self.o_inv.get(o['no'], []):
                if v['status'] == '受付':
                    out.append('受付のままの請求 ' + v['no'])
        return out

    def exists(self, t):
        return (t in self.kouji or t in self.orders or t in self.insp or t in self.inv or t in self.rev
                or t in self.labor or t in self.months)

    # ---- 過去の時点（履歴の行番号 n の直前）の値 ----
    def at_index(self, target, op):
        for n in self.rows.get(target, []):
            if self.hist[n]['op'] == op:
                return n
        return None

    def count_op(self, target, op):
        return sum(1 for n in self.rows.get(target, []) if self.hist[n]['op'] == op)

    def day(self, n):
        return self.hist[n]['at'][:10] if n is not None else None

    def kouji_status_at(self, k, n):
        st = None
        for i in self.rows.get(k, []):
            if i >= n:
                break
            h = self.hist[i]
            if h['op'] == '登録':
                st = '見積中'
            elif h['op'] in ('状態を進める', '状態を戻す'):
                st = h['after'].get('状態')
        return st

    def order_status_at(self, no, n):
        st = None
        for h in self.hist[:n]:
            t = h['target']
            if t == no:
                st = {'登録': '起票', '承認': '承認済', '取消': '取消', '打切': '打切'}.get(h['op'], st)
            elif t in self.insp and self.insp[t]['order'] == no and '発注の状態' in h['after']:
                st = h['after']['発注の状態']
            elif h['op'] == '承認' and h['related'] == no and '元の発注の状態' in h['after']:
                st = h['after']['元の発注の状態']
        return st

    def invoice_status_at(self, no, n):
        st = None
        for i in self.rows.get(no, []):
            if i >= n:
                break
            st = {'登録': '受付', '再受付': '受付', '確認': '確認済', '差戻し': '差戻し',
                  '取消': '取消'}.get(self.hist[i]['op'], st)
        return st

    def closed_at(self, m, n):
        if m <= self.first_month:
            return True
        st = False
        for i in self.rows.get(m, []):
            if i >= n:
                break
            op = self.hist[i]['op']
            if op == '締め':
                st = True
            elif op == '締め解除':
                st = False
        return st

    def cum_at(self, no, n):
        s = 0
        for i in self.o_insp.get(no, []):
            made = self.at_index(i['no'], '訂正' if i['corrects'] else '登録')
            gone = self.at_index(i['no'], '取消')
            if made is not None and made < n and (gone is None or gone >= n):
                s += i['amount']
        return s

    def eff_at(self, no, n):
        s = self.orders[no]['amount']
        for r in self.orders.values():
            if r['related'] == no and r['amount'] < 0:
                a = self.at_index(r['no'], '承認')
                if a is not None and a < n:
                    s += r['amount']
        return s

    def committed_at(self, k, cat, n):
        s = 0
        for o in self.orders.values():
            if o['kouji'] != k or o['cat'] != cat or o['amount'] < 0:
                continue
            st = self.order_status_at(o['no'], n)
            if st in ('承認済', '検収済'):
                s += self.eff_at(o['no'], n)
            elif st == '打切':
                s += self.cum_at(o['no'], n)
        return s

    def budget_at(self, k, cat, n):
        b = self.kouji[k]['budget0'][cat]
        for r in self.rev.values():
            if r['kouji'] == k and r['cat'] == cat:
                a = self.at_index(r['no'], '予算改定の承認')
                if a is not None and a < n:
                    b += r['after'] - r['before']
        return b


# ---- 検査の項目 ----

def check_amounts(M):
    bad = []
    for o in M.orders.values():
        no = o['no']
        if o['amount'] > 0:
            c, e, f = M.cum(no), M.eff(no), M.confirmed(no)
            if c > e:
                bad.append('%s 発注検収の累計 %s が有効発注額 %s を超える' % (no, yen(c), yen(e)))
            if c < 0:
                bad.append('%s 発注検収の累計が負 %s' % (no, yen(c)))
            if f > c:
                bad.append('%s 確認済の請求額 %s が発注検収の累計 %s を超える' % (no, yen(f), yen(c)))
            continue
        if M.o_insp.get(no) or M.o_inv.get(no):
            bad.append('%s 減額発注に発注検収か請求が付いている' % no)
        if o['status'] == '承認済':
            n = M.at_index(no, '承認')
            r = o['related']
            if n is None or r not in M.orders:
                bad.append('%s 減額発注の承認の履歴か元の発注が無い' % no)
                continue
            rem = M.eff_at(r, n) - M.cum_at(r, n)
            if -o['amount'] > rem:
                bad.append('%s 減額 %s が承認の時点の元の未検収残 %s を超える' % (no, yen(-o['amount']), yen(rem)))
            shown = M.hist[n]['after'].get('元の発注の有効発注額')
            if shown != M.eff_at(r, n + 1):
                bad.append('%s 承認の履歴の元の発注の有効発注額 %s が計算 %s と違う' % (no, shown, yen(M.eff_at(r, n + 1))))
    for o in M.orders.values():
        if o['amount'] <= 0:
            continue
        for op in ('登録', '承認'):
            n = M.at_index(o['no'], op)
            if n is None:
                continue
            b = M.budget_at(o['kouji'], o['cat'], n)
            c = M.committed_at(o['kouji'], o['cat'], n)
            if c + o['amount'] > b and not o['overReason']:
                bad.append('%s %sの時点で発注済 %s と発注金額 %s が予算 %s を超えるのに予算超過の理由が無い' % (
                    o['no'], op, yen(c), yen(o['amount']), yen(b)))
    for k in M.kouji:
        for cat in M.cats:
            if cat == '労務費':
                continue
            by_amount = 0
            for o in M.orders.values():
                if o['kouji'] != k or o['cat'] != cat:
                    continue
                if o['amount'] > 0 and o['status'] in ('承認済', '検収済'):
                    by_amount += o['amount']
                elif o['amount'] > 0 and o['status'] == '打切':
                    by_amount += M.cum(o['no'])
                elif o['amount'] < 0 and o['status'] == '承認済' and \
                        M.orders[o['related']]['status'] in ('承認済', '検収済'):
                    by_amount += o['amount']
            if by_amount != M.committed(k, cat):
                bad.append('%s %s 発注済 %s が発注金額と減額からの計算 %s と違う' % (
                    k, cat, yen(M.committed(k, cat)), yen(by_amount)))
    for r in M.rev.values():
        n = M.at_index(r['no'], '予算改定の起案')
        if n is None:
            continue
        b = M.budget_at(r['kouji'], r['cat'], n)
        if r['before'] != b:
            bad.append('%s 改定前の額 %s がその時点の予算 %s と違う' % (r['no'], yen(r['before']), yen(b)))
    for k in M.kouji:
        for cat in M.cats:
            done = [r for r in M.rev.values() if r['kouji'] == k and r['cat'] == cat and r['status'] == '承認済']
            if done:
                last = max(done, key=lambda r: M.at_index(r['no'], '予算改定の承認'))
                if last['after'] != M.budget(k, cat):
                    bad.append('%s %s 予算 %s が最後の改定後の額 %s と違う' % (
                        k, cat, yen(M.budget(k, cat)), yen(last['after'])))
    for key, l in M.labor.items():
        h2 = l['hours'] * 2
        if h2 != int(h2) or l['hours'] < 0:
            bad.append('%s 時間 %s が0.5刻みでない' % (key, l['hours']))
            continue
        if l['amount'] != int(h2) * l['rate'] // 2:
            bad.append('%s 金額 %s が時間×単価 %s と違う' % (key, yen(l['amount']), yen(int(h2) * l['rate'] // 2)))
    return bad


def check_states(M):
    bad = []
    names = [s for s, _ in KOUJI_STEPS]
    end = len(M.hist)
    for k in M.kouji.values():
        no = k['no']
        s = names.index(k['status'])
        for j, (_, fields) in enumerate(KOUJI_STEPS):
            for f in fields:
                has = k[f] is not None
                if j <= s and not has:
                    bad.append('%s 状態 %s なのに %s が空' % (no, k['status'], f))
                if j > s and has and not (f == 'contract' and s == 0):
                    bad.append('%s 状態 %s なのに %s が入っている' % (no, k['status'], f))
        dates = [k[f] for f in KOUJI_DATES if k[f]]
        if dates != sorted(dates):
            bad.append('%s 状態の日付が順になっていない %s' % (no, dates))
        if any(d > M.base for d in dates):
            bad.append('%s 基準日より後の日付がある' % no)
        if s >= 1 and not k['manager']:
            bad.append('%s 受注以後なのに工事担当が空' % no)
        if k['planStart'] > k['planEnd']:
            bad.append('%s 着工予定日が完工予定日より後' % no)
        if M.kouji_status_at(no, end) != k['status']:
            bad.append('%s 状態 %s が履歴の最後の状態と違う' % (no, k['status']))
        if k['status'] == '完了':
            for x in M.completion_issues(no):
                bad.append('%s 完了の条件を満たさない: %s' % (no, x))

    for o in M.orders.values():
        no = o['no']
        n_reg, n_app = M.at_index(no, '登録'), M.at_index(no, '承認')
        if not no.startswith(o['kouji'] + '-'):
            bad.append('%s 工事番号 %s と合わない' % (no, o['kouji']))
        if n_reg is not None:
            ks = M.kouji_status_at(o['kouji'], n_reg)
            if ks not in ('受注', '施工中'):
                bad.append('%s 起票の時点の工事の状態が %s' % (no, ks))
            if o['draftedOn'] != M.day(n_reg):
                bad.append('%s 起票日 %s が登録の履歴の日付 %s と違う' % (no, o['draftedOn'], M.day(n_reg)))
            if M.hist[n_reg]['user'] != M.emp[o['drafter']]['name']:
                bad.append('%s 起票者と登録の履歴の操作者が違う' % no)
        if M.emp[o['drafter']]['role'] != '工事担当':
            bad.append('%s 起票者が工事担当でない' % no)
        if o['status'] == '起票' and (o['orderedOn'] or o['approver']):
            bad.append('%s 起票のままなのに発注日か承認者が入っている' % no)
        if n_app is not None:
            if o['orderedOn'] != M.day(n_app):
                bad.append('%s 発注日 %s が承認の履歴の日付 %s と違う' % (no, o['orderedOn'], M.day(n_app)))
            if not o['approver'] or M.emp[o['approver']]['role'] != '購買':
                bad.append('%s 承認者が購買でない' % no)
            elif o['approver'] == o['drafter']:
                bad.append('%s 起票者と承認者が同じ人' % no)
            elif M.hist[n_app]['user'] != M.emp[o['approver']]['name']:
                bad.append('%s 承認者と承認の履歴の操作者が違う' % no)
        elif o['status'] not in ('起票', '取消') or o['orderedOn'] or o['approver']:
            bad.append('%s 承認の履歴が無いのに状態 %s か発注日がある' % (no, o['status']))
        if o['status'] in ('取消', '打切') and not o['cancelReason']:
            bad.append('%s %s の理由が空' % (no, o['status']))
        if o['amount'] < 0:
            if o['status'] not in ('起票', '承認済', '取消'):
                bad.append('%s 減額発注の状態が %s' % (no, o['status']))
            continue
        if not o['due']:
            bad.append('%s 納期が空' % no)
        c, e, st = M.cum(no), M.eff(no), o['status']
        if st == '検収済' and c != e:
            bad.append('%s 検収済なのに累計 %s が有効発注額 %s と違う' % (no, yen(c), yen(e)))
        if st == '承認済' and not c < e:
            bad.append('%s 承認済なのに累計 %s が有効発注額 %s に達している' % (no, yen(c), yen(e)))
        if st == '打切':
            n = M.at_index(no, '打切')
            if not c < e:
                bad.append('%s 打切なのに累計 %s が有効発注額 %s に達している' % (no, yen(c), yen(e)))
            if n is None or M.cum_at(no, n) <= 0:
                bad.append('%s 打切の時点の累計が0' % no)
        if st in ('起票', '取消') and any(i['status'] == '有効' for i in M.o_insp.get(no, [])):
            bad.append('%s %s なのに有効な発注検収がある' % (no, st))

    for o in M.orders.values():
        no = o['no']
        if not o['related']:
            if o['amount'] < 0:
                bad.append('%s 減額発注なのに関連発注番号が空' % no)
            continue
        r = M.orders.get(o['related'])
        if r is None:
            bad.append('%s 関連発注番号 %s が無い' % (no, o['related']))
            continue
        if (r['kouji'], r['partner'], r['cat']) != (o['kouji'], o['partner'], o['cat']):
            bad.append('%s 元の発注 %s と工事、取引先、費目が合わない' % (no, r['no']))
        n = M.at_index(no, '登録')
        if n is None:
            continue
        st = M.order_status_at(r['no'], n)
        if o['amount'] > 0:
            if M.kind(r) != '通常' or st not in ('承認済', '検収済'):
                bad.append('%s 追加発注の元 %s が承認済か検収済の通常の発注でない（%s）' % (no, r['no'], st))
        else:
            rem = M.eff_at(r['no'], n) - M.cum_at(r['no'], n)
            if r['amount'] <= 0 or st != '承認済' or -o['amount'] > rem:
                bad.append('%s 減額発注の元 %s の状態 %s、起票の時点の未検収残 %s' % (no, r['no'], st, yen(rem)))

    for i in M.insp.values():
        o = M.orders.get(i['order'])
        if o is None or o['amount'] <= 0:
            bad.append('%s 発注検収の発注が通常か追加の発注でない' % i['no'])
            continue
        if not o['orderedOn'] or i['date'] < o['orderedOn'] or i['date'] > M.base:
            bad.append('%s 検収日 %s が発注日 %s 以後で基準日以前でない' % (i['no'], i['date'], o['orderedOn']))
        if i['corrects']:
            src = M.insp.get(i['corrects'])
            if src is None or src['order'] != i['order'] or i['amount'] >= 0:
                bad.append('%s 訂正元 %s か額が合わない' % (i['no'], i['corrects']))
        elif i['amount'] <= 0:
            bad.append('%s 検収額が1円未満' % i['no'])
        if i['status'] == '取消' and not i['cancelReason']:
            bad.append('%s 取消の理由が空' % i['no'])

    for v in M.inv.values():
        no = v['no']
        trio = [v['checker'], v['checkedOn'], v['bookMonth']]
        if v['status'] == '確認済':
            if not all(trio):
                bad.append('%s 確認済なのに確認者、確認日、計上月のどれかが空' % no)
            else:
                if not ym(v['invoiceDate']) <= v['bookMonth'] <= ym(v['checkedOn']):
                    bad.append('%s 計上月 %s が請求書の日付の月以後で確認日の月以前でない' % (no, v['bookMonth']))
                if M.emp[v['checker']]['role'] != '経理':
                    bad.append('%s 確認者が経理でない' % no)
                n = M.at_index(no, '確認')
                if n is not None and v['checkedOn'] != M.day(n):
                    bad.append('%s 確認日が確認の履歴の日付と違う' % no)
            if not any(i['status'] == '有効' for i in M.o_insp.get(v['order'], [])):
                bad.append('%s 確認済の請求の発注に有効な発注検収が無い' % no)
        elif any(x is not None for x in trio):
            bad.append('%s %s なのに確認者、確認日、計上月のどれかが入っている' % (no, v['status']))
        if v['status'] in ('差戻し', '取消') and not v['cancelReason']:
            bad.append('%s %s の理由が空' % (no, v['status']))
        o = M.orders.get(v['order'])
        if o is None:
            bad.append('%s 発注 %s が無い' % (no, v['order']))
            continue
        if v['partner'] != o['partner']:
            bad.append('%s 取引先が発注と違う' % no)
        n = M.at_index(no, '再受付' if v['related'] else '登録')
        if n is None:
            continue
        if v['receivedOn'] != M.day(n):
            bad.append('%s 受付日が受付の履歴の日付と違う' % no)
        st = M.order_status_at(v['order'], n)
        if o['amount'] <= 0 or st not in ('承認済', '検収済', '打切'):
            bad.append('%s 受付の時点の発注 %s の状態が %s' % (no, v['order'], st))
        if v['related']:
            r = M.inv.get(v['related'])
            if r is None or r['status'] != '差戻し' or r['order'] != v['order']:
                bad.append('%s 関連する受付番号 %s が同じ発注の差戻しの請求でない' % (no, v['related']))

    for n, h in enumerate(M.hist):
        if h['op'] == '修正依頼' and not h['reason'].strip():
            bad.append('履歴%d %s 修正依頼の文言が空' % (n + 1, h['target']))
    return bad


def check_closing(M):
    bad = []
    end = len(M.hist)
    first = M.months.get(M.first_month)
    if not first or first['status'] != '締め済' or not first['carryover']:
        bad.append('%s が繰越の締め済で始まっていない' % M.first_month)
    if M.rows.get(M.first_month):
        bad.append('%s に締めか締め解除の履歴がある' % M.first_month)

    for n, h in enumerate(M.hist):
        t, op = h['target'], h['op']
        m = None
        if op == '承認' and t in M.orders and M.orders[t]['orderedOn']:
            m, what = ym(M.orders[t]['orderedOn']), '発注日'
        elif op in ('登録', '訂正') and t in M.insp:
            m, what = ym(M.insp[t]['date']), '検収日'
        elif op == '取消' and t in M.insp:
            m, what = ym(M.insp[t]['date']), '取り消した発注検収の検収日'
        elif op == '労務費の計上' and t in M.labor and M.labor[t]['recordedOn']:
            m, what = ym(M.labor[t]['recordedOn']), '計上日'
        elif op == '確認' and t in M.inv and M.inv[t]['bookMonth']:
            m, what = M.inv[t]['bookMonth'], '計上月'
        if m and M.closed_at(m, n):
            bad.append('%s %s の%sが締め済の月 %s（%s）' % (t, op, what, m, h['at']))

        if op == '締め' and t in M.months:
            if M.closed_at(t, n):
                bad.append('%s 締め済のまま締めている（%s）' % (t, h['at']))
            if not M.closed_at(add_months(t, -1), n):
                bad.append('%s 前の月が締め済でないのに締めている（%s）' % (t, h['at']))
            if h['at'][:10] <= month_end(t):
                bad.append('%s 締めた日 %s が月末より後でない' % (t, h['at'][:10]))
            waiting = [v['no'] for v in M.inv.values()
                       if ym(v['invoiceDate']) <= t and M.invoice_status_at(v['no'], n) == '受付']
            if waiting:
                bad.append('%s 締めた時点で受付のままの請求 %s' % (t, '、'.join(waiting)))
            for k in M.labor_targets(t):
                key = '%s %s' % (k, t)
                a = M.at_index(key, '労務費の計上')
                if a is None or a > n:
                    bad.append('%s 締めた時点で労務費が未計上 %s' % (t, key))
        if op == '締め解除' and t in M.months:
            if t == M.first_month:
                bad.append('%s 繰越の月を解除している' % t)
            if not M.closed_at(t, n):
                bad.append('%s 締め済でない月を解除している（%s）' % (t, h['at']))
            if M.closed_at(add_months(t, 1), n):
                bad.append('%s 後の月が締め済なのに解除している（%s）' % (t, h['at']))

    for m, mm in M.months.items():
        closed = M.closed_at(m, end)
        if (mm['status'] == '締め済') != closed:
            bad.append('%s 状態 %s が履歴と合わない' % (m, mm['status']))
        if m == M.first_month:
            continue
        cnt = M.count_op(m, '締め')
        if mm['closeCount'] != cnt:
            bad.append('%s 締めた回数 %s が履歴の %d 回と違う' % (m, mm['closeCount'], cnt))
        last = None
        for n in M.rows.get(m, []):
            if M.hist[n]['op'] == '締め':
                last = M.day(n)
        if mm['closedOn'] != (last if closed else None):
            bad.append('%s 締めた日 %s が履歴と合わない' % (m, mm['closedOn']))
        if closed:
            for k in M.labor_targets(m):
                l = M.labor.get('%s %s' % (k, m))
                if not l or not l['recordedOn'] or ym(l['recordedOn']) != m:
                    bad.append('%s 締め済の月の労務費が未計上 %s' % (m, k))
    return bad


def check_history(M, S):
    bad = []
    op_field = [f for f in S['schema']['history']['fields'] if f['key'] == 'op'][0]
    ops = set(op_field['type'].split('、'))
    prev = ''
    for n, h in enumerate(M.hist):
        tag = '履歴%d（%s %s %s）' % (n + 1, h['at'], h['target'], h['op'])
        if not re.match(r'^\d{4}-\d\d-\d\d \d\d:\d\d$', h['at']):
            bad.append(tag + ' 日時の形が違う')
        if h['at'] < prev:
            bad.append(tag + ' 前の行より日時が前')
        prev = h['at']
        if h['at'][:10] > M.base:
            bad.append(tag + ' 基準日より後')
        if h['op'] not in ops:
            bad.append(tag + ' 操作の種類が定義に無い')
        e = M.by_name.get(h['user'])
        if e is None or e['role'] != h['role']:
            bad.append(tag + ' 操作者と役割が社員の表と合わない')
        if not M.exists(h['target']):
            bad.append(tag + ' 対象の番号が無い')
        rel = h['related']
        if rel and not (rel in M.orders or rel in M.insp or rel in M.inv):
            bad.append(tag + ' 関連する番号 %s が無い' % rel)
        if h['op'] in REASON_OPS and not h['reason'].strip():
            bad.append(tag + ' 理由が空')
        t = h['target']
        if h['op'] == '変更' and t in M.kouji and M.kouji_status_at(t, n) != '見積中' and not h['reason']:
            bad.append(tag + ' 受注後の受注金額の変更に理由が無い')
        if h['op'] == '確認' and t in M.inv:
            v = M.inv[t]
            late = M.closed_at(ym(v['invoiceDate']), n) and (v['bookMonth'] or '') > ym(v['invoiceDate'])
            if late != (h['reason'] == '過月分'):
                bad.append(tag + ' 過月分の記録が合わない')

    def need(target, op, label):
        if M.at_index(target, op) is None:
            bad.append('%s %sの履歴が無い' % (target, label))

    for k in M.kouji.values():
        need(k['no'], '登録', '登録')
        if k['status'] != '見積中':
            need(k['no'], '状態を進める', '状態を進める')
    for o in M.orders.values():
        need(o['no'], '登録', '登録')
        if o['orderedOn']:
            need(o['no'], '承認', '承認')
        if o['status'] in ('取消', '打切'):
            need(o['no'], o['status'], o['status'])
        n = M.at_index(o['no'], '登録')
        if o['overReason'] and n is not None and M.hist[n]['reason'] != o['overReason']:
            bad.append('%s 登録の履歴に予算超過の理由が無い' % o['no'])
        if o['related'] and n is not None and M.hist[n]['related'] != o['related']:
            bad.append('%s 登録の履歴に関連発注番号が無い' % o['no'])
        a = M.at_index(o['no'], '承認')
        if a is not None and M.hist[a]['reason'] and M.hist[a]['reason'] != o['overReason']:
            bad.append('%s 承認の履歴の理由が予算超過の理由と違う' % o['no'])
    for i in M.insp.values():
        if i['corrects']:
            n = M.at_index(i['no'], '訂正')
            if n is None or M.hist[n]['related'] != i['corrects']:
                bad.append('%s 訂正の履歴か訂正元の番号が無い' % i['no'])
        else:
            need(i['no'], '登録', '登録')
        if i['status'] == '取消':
            need(i['no'], '取消', '取消')
    for v in M.inv.values():
        if v['related']:
            n = M.at_index(v['no'], '再受付')
            if n is None or M.hist[n]['related'] != v['related']:
                bad.append('%s 再受付の履歴か関連する受付番号が無い' % v['no'])
        else:
            need(v['no'], '登録', '登録')
        if v['status'] == '確認済':
            need(v['no'], '確認', '確認')
        elif v['status'] in ('差戻し', '取消'):
            need(v['no'], v['status'], v['status'])
    for r in M.rev.values():
        need(r['no'], '予算改定の起案', '予算改定の起案')
        if r['status'] == '承認済':
            need(r['no'], '予算改定の承認', '予算改定の承認')
        elif r['status'] == '取消':
            need(r['no'], '取消', '取消')
    for key, l in M.labor.items():
        if l['recordedOn']:
            need(key, '労務費の計上', '労務費の計上')
        elif M.at_index(key, '労務費の計上') is not None:
            bad.append('%s 未計上なのに計上の履歴がある' % key)
    for n, h in enumerate(M.hist):
        if h['op'] == '状態を戻す' and not h['before']:
            bad.append('履歴%d %s 状態を戻す の変更前が空' % (n + 1, h['target']))
    return bad


def check_scenes(M, S):
    bad = []
    sc = S.get('scenes', {})
    for key in SCENE_KEYS:
        if key not in sc:
            bad.append('場面 %s が無い' % key)
    if bad:
        return bad
    end = len(M.hist)

    b = sc['budgetOver']
    k, cat, o = M.kouji.get(b['kouji']), b['cat'], M.orders.get(b['order'])
    if not k or not o:
        bad.append('budgetOver の工事か発注が無い')
    else:
        kno = k['no']
        over = M.committed(kno, cat) - M.budget(kno, cat)
        if k['status'] != '施工中' or over <= 0:
            bad.append('budgetOver %s %s が施工中で予算超過でない（超過 %s）' % (kno, cat, yen(over)))
        if o['kouji'] != kno or o['cat'] != cat or o['status'] not in ('承認済', '検収済') or not o['overReason']:
            bad.append('budgetOver %s が理由付きで承認された発注でない' % o['no'])
        elif M.committed(kno, cat) - M.eff(o['no']) > M.budget(kno, cat):
            bad.append('budgetOver %s が無くても予算を超えている' % o['no'])
        if ('#/kouji/%s?' % kno) not in b['url']:
            bad.append('budgetOver の url が工事を指していない')

    c = sc['closedMonth']
    o = M.orders.get(c['order'])
    if not o:
        bad.append('closedMonth の発注 %s が無い' % c['order'])
    else:
        d = c['date']
        if o['status'] != '承認済' or o['amount'] <= 0 or M.remaining(o['no']) <= 0:
            bad.append('closedMonth %s が未検収残のある承認済の発注でない' % o['no'])
        if not M.closed_at(ym(d), end) or d < (o['orderedOn'] or '9999') or d > M.base:
            bad.append('closedMonth %s の日付 %s が締め済の月で発注日以後でない' % (o['no'], d))
        if not o['due'] or not M.closed_at(ym(o['due']), end):
            bad.append('closedMonth %s の納期が締め済の月にない' % o['no'])
        if ('hacchu=%s' % o['no']) not in c['url'] or ('date=%s' % d) not in c['url']:
            bad.append('closedMonth の url が発注と日付を指していない')

    d = sc['duplicate']
    vs = [M.inv.get(x) for x in d.get('invoices', [])]
    if len(vs) != 2 or not all(vs):
        bad.append('duplicate の請求が2本そろっていない')
    else:
        a, z = vs
        if not (a['status'] == z['status'] == '受付' and a['order'] == z['order'] == d['order']
                and a['partner'] == z['partner'] and a['invoiceNo'] == z['invoiceNo']):
            bad.append('duplicate %s と %s が同じ発注で同じ請求書番号の受付でない' % (a['no'], z['no']))
        for v in vs:
            if M.judge(v) != '二重の疑い':
                bad.append('duplicate %s の判定が %s' % (v['no'], M.judge(v)))
        if ('focus=%s' % a['no']) not in d['url']:
            bad.append('duplicate の url が請求を指していない')

    q = sc['noInspection']
    v = M.inv.get(q.get('invoice'))
    if not v:
        bad.append('noInspection の請求が無い')
    else:
        if v['status'] != '受付' or v['order'] != q['order'] or M.judge(v) != '発注検収なし':
            bad.append('noInspection %s の状態 %s、判定 %s' % (v['no'], v['status'], M.judge(v)))
        if ('focus=%s' % v['no']) not in q['url']:
            bad.append('noInspection の url が請求を指していない')

    p = sc['ipponmichi']
    k = M.kouji.get(p['kouji'])
    if not k:
        bad.append('ipponmichi の工事が無い')
    else:
        kno, cat = k['no'], p['cat']
        rest = M.budget(kno, cat) - M.committed(kno, cat)
        if k['status'] != '施工中' or not 0 < rest <= M.budget(kno, cat) * 0.15:
            bad.append('ipponmichi %s %s の残 %s が少ない残でない' % (kno, cat, yen(rest)))
        others = {sc['budgetOver']['kouji']}
        for x in (sc['closedMonth']['order'], sc['duplicate']['order'], sc['noInspection']['order']):
            if x in M.orders:
                others.add(M.orders[x]['kouji'])
        if kno in others:
            bad.append('ipponmichi %s が他の場面と重なる' % kno)
        if ('kouji=%s' % kno) not in p['url']:
            bad.append('ipponmichi の url が工事を指していない')
    return bad


def check_words(list_path):
    """site の全ファイルに一覧の語が無いか調べる。語そのものは出さない。"""
    with open(list_path, encoding='utf-8-sig') as f:
        words = [(n, w.strip().lower()) for n, w in enumerate(f, 1)
                 if w.strip() and not w.strip().startswith('#')]
    bad = []

    def scan(label, text):
        for ln, line in enumerate(text.splitlines(), 1):
            low = line.lower()
            for n, w in words:
                if w in low:
                    bad.append('%s:%d 一覧の%d行目の語' % (label, ln, n))

    for root, dirs, files in os.walk(SITE):
        dirs[:] = sorted(d for d in dirs if d != '__pycache__')
        for fn in sorted(files):
            p = os.path.join(root, fn)
            rel = os.path.relpath(p, SITE).replace(os.sep, '/')
            ext = os.path.splitext(fn)[1].lower()
            if ext in TEXT_EXT:
                with open(p, encoding='utf-8', errors='replace') as f:
                    scan(rel, f.read())
            elif ext in ZIP_EXT:
                with zipfile.ZipFile(p) as z:
                    for name in z.namelist():
                        if name.endswith(('.xml', '.rels')):
                            scan(rel + '!' + name, z.read(name).decode('utf-8', 'replace'))
    return bad


def run_checks(S):
    """項目ごとに (項目名, 該当の一覧) を返す。一覧が空なら合格。"""
    M = Model(S)
    return [
        ('金額の整合', check_amounts(M)),
        ('状態の整合', check_states(M)),
        ('締めの期間', check_closing(M)),
        ('履歴の対応', check_history(M, S)),
        ('場面', check_scenes(M, S)),
    ]


def table(S):
    """工事ごと費目ごとの 予算、発注済、発生原価、計上額。"""
    M = Model(S)
    out = []
    for k in sorted(M.kouji):
        for cat in M.cats:
            out.append((k, cat, M.budget(k, cat), M.committed(k, cat), M.incurred(k, cat), M.booked(k, cat)))
    return out


def print_table(S):
    head = ('工事番号', '費目', '予算', '発注済', '発生原価', '計上額')
    print('%-8s %-4s %13s %13s %13s %13s' % head)
    prev = None
    sums = [0, 0, 0, 0]
    for k, cat, *vals in table(S):
        if prev and k != prev:
            print('%-8s %-4s %13s %13s %13s %13s' % ((prev, '計') + tuple(yen(x) for x in sums)))
            sums = [0, 0, 0, 0]
        prev = k
        sums = [a + b for a, b in zip(sums, vals)]
        print('%-8s %-4s %13s %13s %13s %13s' % ((k, cat) + tuple(yen(x) for x in vals)))
    if prev:
        print('%-8s %-4s %13s %13s %13s %13s' % ((prev, '計') + tuple(yen(x) for x in sums)))


def main(argv):
    args = argv[1:]
    words = None
    if '--words' in args:
        i = args.index('--words')
        if i + 1 >= len(args):
            print('--words の後に一覧のパスを渡す')
            return 2
        words = args[i + 1]
    S = load()
    results = run_checks(S)
    if words:
        results.append(('公開禁止語', check_words(words)))
    if '--table' in args:
        print_table(S)
        print()
    fail = False
    for name, bad in results:
        print('%s: %s' % (name, '不合格' if bad else '合格'))
        for b in bad:
            print('  ' + b)
        fail = fail or bool(bad)
    return 1 if fail else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
