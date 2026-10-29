// 架空の会社の資料です（自主制作）
window.SAMPLE = {
 "基準日": "2026-09-08",
 "settings": {
  "company": "青嶺設備工業株式会社",
  "companyLabel": "青嶺設備工業株式会社（架空）",
  "baseDate": "2026-09-08",
  "defaultRole": "keiri",
  "roleUsers": {
   "eigyo": "E01",
   "tanto": "E03",
   "kobai": "E07",
   "keiri": "E08"
  },
  "roles": [
   {
    "key": "eigyo",
    "name": "営業",
    "user": "E01",
    "banner": "営業として見ています。工事の登録と受注、予算改定の承認ができます。"
   },
   {
    "key": "tanto",
    "name": "工事担当",
    "user": "E03",
    "banner": "工事担当として見ています。発注の起票、発注検収の登録、着工と施主検収の登録ができます。"
   },
   {
    "key": "kobai",
    "name": "購買",
    "user": "E07",
    "banner": "購買として見ています。発注の承認と修正依頼、発注検収の登録、打切ができます。"
   },
   {
    "key": "keiri",
    "name": "経理",
    "user": "E08",
    "banner": "経理として見ています。請求の確認、労務費の計上、月次の締めができます。"
   }
  ],
  "laborRate": 4650,
  "terms": {
   "月末締め翌月末払い": {
    "closeDay": 0,
    "months": 1,
    "payDay": 0
   },
   "月末締め翌々月10日払い": {
    "closeDay": 0,
    "months": 2,
    "payDay": 10
   },
   "20日締め翌月10日払い": {
    "closeDay": 20,
    "months": 1,
    "payDay": 10
   },
   "月末締め翌々月末払い": {
    "closeDay": 0,
    "months": 2,
    "payDay": 0
   },
   "25日締め翌月末払い": {
    "closeDay": 25,
    "months": 1,
    "payDay": 0
   }
  },
  "categories": [
   "材料費",
   "外注費",
   "労務費",
   "経費"
  ],
  "orderCategories": [
   "材料費",
   "外注費",
   "経費"
  ],
  "statuses": {
   "kouji": [
    "見積中",
    "受注",
    "施工中",
    "検収済",
    "請求済",
    "完了"
   ],
   "orders": [
    "起票",
    "承認済",
    "検収済",
    "打切",
    "取消"
   ],
   "inspections": [
    "有効",
    "取消"
   ],
   "invoices": [
    "受付",
    "確認済",
    "差戻し",
    "取消"
   ],
   "revisions": [
    "起案",
    "承認済",
    "取消"
   ],
   "months": [
    "未締め",
    "締め済"
   ]
  },
  "koujiKinds": [
   "空調",
   "給排水",
   "衛生",
   "電気",
   "消防",
   "改修"
  ],
  "inspectionContents": [
   "納品",
   "出来高",
   "完了"
  ],
  "judgements": [
   "二重の疑い",
   "発注検収なし",
   "検収額を超えている",
   "確定できる"
  ],
  "months": [
   {
    "month": "2026-03",
    "status": "締め済",
    "carryover": true,
    "closeCount": null,
    "closedOn": null
   },
   {
    "month": "2026-04",
    "status": "締め済",
    "carryover": false,
    "closeCount": 1,
    "closedOn": "2026-05-08"
   },
   {
    "month": "2026-05",
    "status": "締め済",
    "carryover": false,
    "closeCount": 1,
    "closedOn": "2026-06-05"
   },
   {
    "month": "2026-06",
    "status": "締め済",
    "carryover": false,
    "closeCount": 2,
    "closedOn": "2026-07-15"
   },
   {
    "month": "2026-07",
    "status": "締め済",
    "carryover": false,
    "closeCount": 1,
    "closedOn": "2026-08-07"
   },
   {
    "month": "2026-08",
    "status": "未締め",
    "carryover": false,
    "closeCount": 0,
    "closedOn": null
   },
   {
    "month": "2026-09",
    "status": "未締め",
    "carryover": false,
    "closeCount": 0,
    "closedOn": null
   }
  ]
 },
 "employees": [
  {
   "id": "E01",
   "name": "島田",
   "role": "営業"
  },
  {
   "id": "E02",
   "name": "野口",
   "role": "営業"
  },
  {
   "id": "E03",
   "name": "松浦",
   "role": "工事担当"
  },
  {
   "id": "E04",
   "name": "久保",
   "role": "工事担当"
  },
  {
   "id": "E05",
   "name": "早川",
   "role": "工事担当"
  },
  {
   "id": "E06",
   "name": "中西",
   "role": "工事担当"
  },
  {
   "id": "E07",
   "name": "岩崎",
   "role": "購買"
  },
  {
   "id": "E08",
   "name": "三浦",
   "role": "経理"
  }
 ],
 "partners": [
  {
   "code": "T-101",
   "name": "桐原ビル管理株式会社",
   "kind": "施主",
   "contact": "相沢",
   "terms": "月末締め翌月末払い",
   "status": "取引中",
   "registeredOn": "2019-06-12",
   "note": ""
  },
  {
   "code": "T-102",
   "name": "株式会社朝陽不動産",
   "kind": "施主",
   "contact": "大西",
   "terms": "月末締め翌月末払い",
   "status": "取引中",
   "registeredOn": "2021-02-08",
   "note": ""
  },
  {
   "code": "T-103",
   "name": "医療法人 碧水会",
   "kind": "施主",
   "contact": "片山",
   "terms": "月末締め翌々月末払い",
   "status": "取引中",
   "registeredOn": "2022-09-20",
   "note": ""
  },
  {
   "code": "T-104",
   "name": "社会福祉法人 楓の会",
   "kind": "施主",
   "contact": "石井",
   "terms": "月末締め翌月末払い",
   "status": "取引中",
   "registeredOn": "2023-04-03",
   "note": ""
  },
  {
   "code": "T-105",
   "name": "株式会社丸越フーズ",
   "kind": "施主",
   "contact": "平野",
   "terms": "20日締め翌月10日払い",
   "status": "取引中",
   "registeredOn": "2020-11-16",
   "note": ""
  },
  {
   "code": "T-106",
   "name": "葵管材株式会社",
   "kind": "仕入先",
   "contact": "川村",
   "terms": "月末締め翌々月10日払い",
   "status": "取引中",
   "registeredOn": "2015-05-11",
   "note": ""
  },
  {
   "code": "T-107",
   "name": "株式会社光陽電材",
   "kind": "仕入先",
   "contact": "西田",
   "terms": "20日締め翌月10日払い",
   "status": "取引中",
   "registeredOn": "2017-08-01",
   "note": ""
  },
  {
   "code": "T-108",
   "name": "白鷺空調機器株式会社",
   "kind": "仕入先",
   "contact": "小池",
   "terms": "月末締め翌々月末払い",
   "status": "取引中",
   "registeredOn": "2016-03-22",
   "note": ""
  },
  {
   "code": "T-109",
   "name": "株式会社銀河防災用品",
   "kind": "仕入先",
   "contact": "堀",
   "terms": "月末締め翌月末払い",
   "status": "取引中",
   "registeredOn": "2018-10-05",
   "note": ""
  },
  {
   "code": "T-110",
   "name": "株式会社杉本建材",
   "kind": "仕入先",
   "contact": "杉本",
   "terms": "25日締め翌月末払い",
   "status": "取引中",
   "registeredOn": "2014-07-14",
   "note": ""
  },
  {
   "code": "T-111",
   "name": "有限会社村瀬設備",
   "kind": "外注先",
   "contact": "村瀬",
   "terms": "月末締め翌々月10日払い",
   "status": "取引中",
   "registeredOn": "2013-04-08",
   "note": ""
  },
  {
   "code": "T-112",
   "name": "株式会社岡野電気工事",
   "kind": "外注先",
   "contact": "岡野",
   "terms": "月末締め翌々月末払い",
   "status": "取引中",
   "registeredOn": "2016-09-26",
   "note": ""
  },
  {
   "code": "T-113",
   "name": "株式会社星野保温",
   "kind": "外注先",
   "contact": "星野",
   "terms": "20日締め翌月10日払い",
   "status": "取引中",
   "registeredOn": "2019-01-21",
   "note": ""
  },
  {
   "code": "T-114",
   "name": "有限会社丸山ダクト",
   "kind": "外注先",
   "contact": "丸山",
   "terms": "25日締め翌月末払い",
   "status": "取引中",
   "registeredOn": "2018-05-28",
   "note": ""
  },
  {
   "code": "T-115",
   "name": "株式会社新井塗装",
   "kind": "外注先",
   "contact": "新井",
   "terms": "月末締め翌月末払い",
   "status": "停止",
   "registeredOn": "2012-10-01",
   "note": ""
  }
 ],
 "kouji": [
  {
   "no": "26-001",
   "name": "事務所フロア空調機更新",
   "client": "T-101",
   "site": "本町2丁目 桐原第二ビル",
   "kind": "空調",
   "status": "完了",
   "sales": "E01",
   "manager": "E04",
   "estimate": 1036800,
   "contract": 978500,
   "budget0": {
    "材料費": 324600,
    "外注費": 268400,
    "労務費": 143700,
    "経費": 94300
   },
   "contractOn": "2026-06-19",
   "planStart": "2026-07-06",
   "planEnd": "2026-07-24",
   "startOn": "2026-07-06",
   "clientInspectOn": "2026-07-24",
   "clientBillOn": "2026-07-31",
   "clientBillAmount": 978500,
   "paidOn": "2026-08-31",
   "note": ""
  },
  {
   "no": "26-002",
   "name": "給湯設備更新",
   "client": "T-103",
   "site": "桜台1丁目 碧水会クリニック",
   "kind": "給排水",
   "status": "請求済",
   "sales": "E02",
   "manager": "E05",
   "estimate": 6712000,
   "contract": 6482000,
   "budget0": {
    "材料費": 2184600,
    "外注費": 1736400,
    "労務費": 790500,
    "経費": 312800
   },
   "contractOn": "2026-05-08",
   "planStart": "2026-05-25",
   "planEnd": "2026-07-31",
   "startOn": "2026-05-25",
   "clientInspectOn": "2026-07-31",
   "clientBillOn": "2026-08-20",
   "clientBillAmount": 6482000,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-003",
   "name": "自動火災報知設備・誘導灯更新",
   "client": "T-104",
   "site": "旭町3丁目 楓の杜ホーム",
   "kind": "消防",
   "status": "請求済",
   "sales": "E01",
   "manager": "E06",
   "estimate": 4026000,
   "contract": 3864000,
   "budget0": {
    "材料費": 1286400,
    "外注費": 1148700,
    "労務費": 511500,
    "経費": 146200
   },
   "contractOn": "2026-06-03",
   "planStart": "2026-06-15",
   "planEnd": "2026-08-07",
   "startOn": "2026-06-15",
   "clientInspectOn": "2026-08-07",
   "clientBillOn": "2026-08-28",
   "clientBillAmount": 3864000,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-004",
   "name": "厨房排気ダクト改修",
   "client": "T-105",
   "site": "港町2丁目 丸越フーズ第一工場",
   "kind": "改修",
   "status": "検収済",
   "sales": "E02",
   "manager": "E03",
   "estimate": 12860000,
   "contract": 12386000,
   "budget0": {
    "材料費": 3864200,
    "外注費": 5218600,
    "労務費": 1432200,
    "経費": 486500
   },
   "contractOn": "2026-05-12",
   "planStart": "2026-05-25",
   "planEnd": "2026-08-28",
   "startOn": "2026-05-25",
   "clientInspectOn": "2026-08-26",
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-005",
   "name": "空調設備更新（全館）",
   "client": "T-101",
   "site": "本町2丁目 桐原第一ビル",
   "kind": "空調",
   "status": "施工中",
   "sales": "E01",
   "manager": "E03",
   "estimate": 49860000,
   "contract": 48316000,
   "budget0": {
    "材料費": 18642300,
    "外注費": 14286500,
    "労務費": 3718600,
    "経費": 1462800
   },
   "contractOn": "2026-04-10",
   "planStart": "2026-04-20",
   "planEnd": "2026-10-30",
   "startOn": "2026-04-20",
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-006",
   "name": "受変電設備更新",
   "client": "T-102",
   "site": "緑町4丁目 朝陽ビル",
   "kind": "電気",
   "status": "検収済",
   "sales": "E01",
   "manager": "E06",
   "estimate": 19480000,
   "contract": 18946000,
   "budget0": {
    "材料費": 7684300,
    "外注費": 5426800,
    "労務費": 2027400,
    "経費": 624600
   },
   "contractOn": "2026-04-17",
   "planStart": "2026-04-27",
   "planEnd": "2026-08-31",
   "startOn": "2026-04-27",
   "clientInspectOn": "2026-08-31",
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-007",
   "name": "給排水衛生設備改修（病棟）",
   "client": "T-103",
   "site": "桜台1丁目 碧水会病院",
   "kind": "衛生",
   "status": "施工中",
   "sales": "E02",
   "manager": "E04",
   "estimate": 9864000,
   "contract": 9468000,
   "budget0": {
    "材料費": 3146800,
    "外注費": 3286400,
    "労務費": 1209000,
    "経費": 318600
   },
   "contractOn": "2026-06-05",
   "planStart": "2026-06-22",
   "planEnd": "2026-10-09",
   "startOn": "2026-06-22",
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-008",
   "name": "非常用照明・幹線改修",
   "client": "T-102",
   "site": "緑町4丁目 朝陽第二ビル",
   "kind": "電気",
   "status": "施工中",
   "sales": "E02",
   "manager": "E05",
   "estimate": 7564000,
   "contract": 7238000,
   "budget0": {
    "材料費": 2468300,
    "外注費": 2284600,
    "労務費": 883500,
    "経費": 214300
   },
   "contractOn": "2026-06-26",
   "planStart": "2026-07-13",
   "planEnd": "2026-10-23",
   "startOn": "2026-07-13",
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-009",
   "name": "給水ポンプ・受水槽更新",
   "client": "T-105",
   "site": "港町2丁目 丸越フーズ第二工場",
   "kind": "給排水",
   "status": "施工中",
   "sales": "E01",
   "manager": "E05",
   "estimate": 16380000,
   "contract": 15824000,
   "budget0": {
    "材料費": 5486200,
    "外注費": 4862400,
    "労務費": 1627500,
    "経費": 538700
   },
   "contractOn": "2026-06-12",
   "planStart": "2026-06-29",
   "planEnd": "2026-10-16",
   "startOn": "2026-06-29",
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-010",
   "name": "照明設備LED化",
   "client": "T-104",
   "site": "旭町3丁目 楓の杜ホーム東館",
   "kind": "電気",
   "status": "施工中",
   "sales": "E01",
   "manager": "E06",
   "estimate": 6184000,
   "contract": 5946000,
   "budget0": {
    "材料費": 2386500,
    "外注費": 1684200,
    "労務費": 697500,
    "経費": 168400
   },
   "contractOn": "2026-07-06",
   "planStart": "2026-07-21",
   "planEnd": "2026-09-30",
   "startOn": "2026-07-21",
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-011",
   "name": "空調機更新（2・3階）",
   "client": "T-102",
   "site": "緑町4丁目 朝陽第三ビル",
   "kind": "空調",
   "status": "施工中",
   "sales": "E01",
   "manager": "E03",
   "estimate": 4486000,
   "contract": 4318000,
   "budget0": {
    "材料費": 1528600,
    "外注費": 1286500,
    "労務費": 418500,
    "経費": 126300
   },
   "contractOn": "2026-07-30",
   "planStart": "2026-08-17",
   "planEnd": "2026-10-02",
   "startOn": "2026-08-17",
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-012",
   "name": "浴室給湯配管改修",
   "client": "T-103",
   "site": "桜台1丁目 碧水会ケアセンター",
   "kind": "給排水",
   "status": "受注",
   "sales": "E02",
   "manager": "E04",
   "estimate": 3286000,
   "contract": 3164000,
   "budget0": {
    "材料費": 986400,
    "外注費": 1124800,
    "労務費": 418500,
    "経費": 96800
   },
   "contractOn": "2026-08-21",
   "planStart": "2026-10-05",
   "planEnd": "2026-11-13",
   "startOn": null,
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-013",
   "name": "屋内消火栓設備更新",
   "client": "T-105",
   "site": "港町2丁目 丸越フーズ物流センター",
   "kind": "消防",
   "status": "受注",
   "sales": "E02",
   "manager": "E06",
   "estimate": 8146000,
   "contract": 7862000,
   "budget0": {
    "材料費": 2864300,
    "外注費": 2638400,
    "労務費": 790500,
    "経費": 246800
   },
   "contractOn": "2026-08-03",
   "planStart": "2026-10-13",
   "planEnd": "2026-12-18",
   "startOn": null,
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-014",
   "name": "中央監視設備更新",
   "client": "T-101",
   "site": "本町2丁目 桐原第一ビル",
   "kind": "電気",
   "status": "見積中",
   "sales": "E01",
   "manager": "E03",
   "estimate": 22640000,
   "contract": null,
   "budget0": {
    "材料費": 8426300,
    "外注費": 7184600,
    "労務費": 1862300,
    "経費": 612400
   },
   "contractOn": null,
   "planStart": "2027-01-12",
   "planEnd": "2027-03-19",
   "startOn": null,
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  },
  {
   "no": "26-015",
   "name": "厨房給排水改修",
   "client": "T-104",
   "site": "旭町3丁目 楓の杜ホーム",
   "kind": "衛生",
   "status": "見積中",
   "sales": "E02",
   "manager": null,
   "estimate": 1186000,
   "contract": 1142000,
   "budget0": {
    "材料費": 0,
    "外注費": 0,
    "労務費": 0,
    "経費": 0
   },
   "contractOn": null,
   "planStart": "2026-11-09",
   "planEnd": "2026-11-20",
   "startOn": null,
   "clientInspectOn": null,
   "clientBillOn": null,
   "clientBillAmount": null,
   "paidOn": null,
   "note": ""
  }
 ],
 "orders": [
  {
   "no": "26-001-01",
   "kouji": "26-001",
   "related": null,
   "partner": "T-108",
   "cat": "材料費",
   "title": "パッケージエアコン（室内機・室外機）",
   "amount": 298500,
   "due": "2026-07-08",
   "status": "検収済",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-06-29",
   "approver": "E07",
   "orderedOn": "2026-07-01",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-001-02",
   "kouji": "26-001",
   "related": null,
   "partner": "T-113",
   "cat": "外注費",
   "title": "空調機据付・冷媒配管の保温工事",
   "amount": 251900,
   "due": "2026-07-22",
   "status": "検収済",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-06-29",
   "approver": "E07",
   "orderedOn": "2026-07-01",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-001-03",
   "kouji": "26-001",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "養生材・仮設材",
   "amount": 83800,
   "due": "2026-07-10",
   "status": "検収済",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-06-30",
   "approver": "E07",
   "orderedOn": "2026-07-01",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-002-01",
   "kouji": "26-002",
   "related": null,
   "partner": "T-108",
   "cat": "材料費",
   "title": "業務用ガス給湯器",
   "amount": 1257300,
   "due": "2026-06-10",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-05-18",
   "approver": "E07",
   "orderedOn": "2026-05-20",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-002-02",
   "kouji": "26-002",
   "related": null,
   "partner": "T-106",
   "cat": "材料費",
   "title": "給湯配管材・継手・バルブ",
   "amount": 786200,
   "due": "2026-06-12",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-05-19",
   "approver": "E07",
   "orderedOn": "2026-05-21",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-002-03",
   "kouji": "26-002",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "給湯器据付・配管工事",
   "amount": 1423500,
   "due": "2026-07-28",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-05-22",
   "approver": "E07",
   "orderedOn": "2026-05-25",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-002-04",
   "kouji": "26-002",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "仮設・養生・撤去品の処分",
   "amount": 263500,
   "due": "2026-07-15",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-06-01",
   "approver": "E07",
   "orderedOn": "2026-06-03",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-002-05",
   "kouji": "26-002",
   "related": null,
   "partner": "T-112",
   "cat": "外注費",
   "title": "給湯器の電源・制御配線工事",
   "amount": 242600,
   "due": "2026-07-24",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-06-10",
   "approver": "E07",
   "orderedOn": "2026-06-11",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-003-01",
   "kouji": "26-003",
   "related": null,
   "partner": "T-109",
   "cat": "材料費",
   "title": "自動火災報知設備の感知器・発信機・受信機",
   "amount": 707100,
   "due": "2026-06-26",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-06-08",
   "approver": "E07",
   "orderedOn": "2026-06-10",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-003-02",
   "kouji": "26-003",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "誘導灯器具",
   "amount": 420700,
   "due": "2026-07-10",
   "status": "取消",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-06-08",
   "approver": "E07",
   "orderedOn": "2026-06-10",
   "cancelReason": "メーカーの型式変更で品番が合わないため。新しい型式で発注し直す",
   "note": ""
  },
  {
   "no": "26-003-03",
   "kouji": "26-003",
   "related": null,
   "partner": "T-112",
   "cat": "外注費",
   "title": "自動火災報知設備の配線・機器取付工事",
   "amount": 1024800,
   "due": "2026-08-05",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-06-12",
   "approver": "E07",
   "orderedOn": "2026-06-15",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-003-04",
   "kouji": "26-003",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "脚立・足場の損料",
   "amount": 115900,
   "due": "2026-07-03",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-06-15",
   "approver": "E07",
   "orderedOn": "2026-06-16",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-003-05",
   "kouji": "26-003",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "誘導灯器具（新型式）",
   "amount": 443800,
   "due": "2026-08-04",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-06-18",
   "approver": "E07",
   "orderedOn": "2026-06-19",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-004-01",
   "kouji": "26-004",
   "related": null,
   "partner": "T-110",
   "cat": "材料費",
   "title": "ダクト用鋼板・支持金物",
   "amount": 1984500,
   "due": "2026-06-19",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-05-20",
   "approver": "E07",
   "orderedOn": "2026-05-22",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-004-02",
   "kouji": "26-004",
   "related": null,
   "partner": "T-114",
   "cat": "外注費",
   "title": "排気ダクトの製作・吊り込み工事",
   "amount": 3227300,
   "due": "2026-08-21",
   "status": "打切",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-05-22",
   "approver": "E07",
   "orderedOn": "2026-05-25",
   "cancelReason": "残りの吊り込みは施主の設備更新に合わせて取りやめになったため",
   "note": ""
  },
  {
   "no": "26-004-03",
   "kouji": "26-004",
   "related": null,
   "partner": "T-108",
   "cat": "材料費",
   "title": "排気ファン・排気フード",
   "amount": 1528600,
   "due": "2026-07-02",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-05-27",
   "approver": "E07",
   "orderedOn": "2026-05-29",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-004-04",
   "kouji": "26-004",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "仮設材・養生材",
   "amount": 364700,
   "due": "2026-06-30",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-06-01",
   "approver": "E07",
   "orderedOn": "2026-06-02",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-004-05",
   "kouji": "26-004",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "グリース阻集器・排水配管工事",
   "amount": 1544900,
   "due": "2026-08-20",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-06-08",
   "approver": "E07",
   "orderedOn": "2026-06-10",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-005-01",
   "kouji": "26-005",
   "related": null,
   "partner": "T-108",
   "cat": "材料費",
   "title": "空調機（1期分）",
   "amount": 8548500,
   "due": "2026-05-20",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-04-13",
   "approver": "E07",
   "orderedOn": "2026-04-15",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-005-02",
   "kouji": "26-005",
   "related": null,
   "partner": "T-106",
   "cat": "材料費",
   "title": "冷媒配管材・ドレン配管材（分納）",
   "amount": 5170100,
   "due": "2026-09-30",
   "status": "承認済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-04-16",
   "approver": "E07",
   "orderedOn": "2026-04-17",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-005-03",
   "kouji": "26-005",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "空調機据付・冷媒配管工事",
   "amount": 9553700,
   "due": "2026-10-23",
   "status": "承認済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-04-17",
   "approver": "E07",
   "orderedOn": "2026-04-20",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-005-04",
   "kouji": "26-005",
   "related": null,
   "partner": "T-114",
   "cat": "外注費",
   "title": "ダクト交換工事（範囲拡大分）",
   "amount": 5211700,
   "due": "2026-10-09",
   "status": "承認済",
   "overReason": "既設ダクトの劣化が想定より進んでおり、交換範囲が広がったため",
   "drafter": "E03",
   "draftedOn": "2026-07-20",
   "approver": "E07",
   "orderedOn": "2026-07-22",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-005-05",
   "kouji": "26-005",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "仮設・養生・揚重",
   "amount": 657300,
   "due": "2026-08-31",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-07-23",
   "approver": "E07",
   "orderedOn": "2026-07-24",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-005-06",
   "kouji": "26-005",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "空調用電線・制御ケーブル",
   "amount": 3352800,
   "due": "2026-09-18",
   "status": "承認済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-07-27",
   "approver": "E07",
   "orderedOn": "2026-07-29",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-005-07",
   "kouji": "26-005",
   "related": null,
   "partner": "T-109",
   "cat": "材料費",
   "title": "防火ダンパー（変更契約分）",
   "amount": 385300,
   "due": "2026-08-27",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-08-03",
   "approver": "E07",
   "orderedOn": "2026-08-04",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-005-08",
   "kouji": "26-005",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "撤去機器の運搬・処分",
   "amount": 85500,
   "due": "2026-09-25",
   "status": "承認済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-08-19",
   "approver": "E07",
   "orderedOn": "2026-08-20",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-006-01",
   "kouji": "26-006",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "キュービクル式高圧受電設備",
   "amount": 4695500,
   "due": "2026-06-18",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-04-20",
   "approver": "E07",
   "orderedOn": "2026-04-23",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-006-02",
   "kouji": "26-006",
   "related": null,
   "partner": "T-112",
   "cat": "外注費",
   "title": "受変電設備の据付・結線工事",
   "amount": 3759900,
   "due": "2026-07-28",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-04-24",
   "approver": "E07",
   "orderedOn": "2026-04-27",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-006-03",
   "kouji": "26-006",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "仮設電源・養生",
   "amount": 499200,
   "due": "2026-06-30",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-04-27",
   "approver": "E07",
   "orderedOn": "2026-04-28",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-006-04",
   "kouji": "26-006",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "高圧ケーブル・端末処理材",
   "amount": 1520700,
   "due": "2026-06-05",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-05-07",
   "approver": "E07",
   "orderedOn": "2026-05-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-006-05",
   "kouji": "26-006",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "機器基礎・架台工事",
   "amount": 1184500,
   "due": "2026-05-29",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-05-11",
   "approver": "E07",
   "orderedOn": "2026-05-12",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-006-06",
   "kouji": "26-006",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "接地材・端子類",
   "amount": 235700,
   "due": "2026-07-07",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-06-29",
   "approver": "E07",
   "orderedOn": "2026-06-30",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-006-07",
   "kouji": "26-006",
   "related": "26-006-02",
   "partner": "T-112",
   "cat": "外注費",
   "title": "据付・結線工事の減額（試験立会い1回分）",
   "amount": -300800,
   "due": null,
   "status": "承認済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-07-10",
   "approver": "E07",
   "orderedOn": "2026-07-13",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-007-01",
   "kouji": "26-007",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "給排水配管・衛生器具取付工事",
   "amount": 2940600,
   "due": "2026-10-02",
   "status": "承認済",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-06-16",
   "approver": "E07",
   "orderedOn": "2026-06-18",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-007-02",
   "kouji": "26-007",
   "related": null,
   "partner": "T-106",
   "cat": "材料費",
   "title": "衛生器具・水栓",
   "amount": 1410800,
   "due": "2026-07-14",
   "status": "検収済",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-06-19",
   "approver": "E07",
   "orderedOn": "2026-06-22",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-007-03",
   "kouji": "26-007",
   "related": null,
   "partner": "T-108",
   "cat": "材料費",
   "title": "換気扇・電気温水器",
   "amount": 1251500,
   "due": "2026-07-24",
   "status": "承認済",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-06-22",
   "approver": "E07",
   "orderedOn": "2026-06-24",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-007-04",
   "kouji": "26-007",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "仮設間仕切り・養生",
   "amount": 221000,
   "due": "2026-07-20",
   "status": "検収済",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-06-24",
   "approver": "E07",
   "orderedOn": "2026-06-25",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-007-05",
   "kouji": "26-007",
   "related": null,
   "partner": "T-106",
   "cat": "材料費",
   "title": "洗面水栓（追加分）",
   "amount": 248500,
   "due": "2026-07-31",
   "status": "取消",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-07-06",
   "approver": null,
   "orderedOn": null,
   "cancelReason": "26-007-02 に含まれている品目を重ねて起票したため",
   "note": ""
  },
  {
   "no": "26-008-01",
   "kouji": "26-008",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "非常用照明器具",
   "amount": 1427600,
   "due": "2026-08-05",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-07-06",
   "approver": "E07",
   "orderedOn": "2026-07-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-008-02",
   "kouji": "26-008",
   "related": null,
   "partner": "T-112",
   "cat": "外注費",
   "title": "幹線張替え・器具取付工事",
   "amount": 1918800,
   "due": "2026-09-30",
   "status": "承認済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-07-13",
   "approver": "E07",
   "orderedOn": "2026-07-15",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-008-03",
   "kouji": "26-008",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "高所作業車の損料",
   "amount": 127900,
   "due": "2026-08-07",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-07-20",
   "approver": "E07",
   "orderedOn": "2026-07-21",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-008-04",
   "kouji": "26-008",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "幹線ケーブル・配線器具",
   "amount": 1223500,
   "due": "2026-09-15",
   "status": "承認済",
   "overReason": "幹線ルートの変更でケーブルの長さが増えたため",
   "drafter": "E05",
   "draftedOn": "2026-07-27",
   "approver": "E07",
   "orderedOn": "2026-07-29",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-009-01",
   "kouji": "26-009",
   "related": null,
   "partner": "T-108",
   "cat": "材料費",
   "title": "加圧給水ポンプユニット",
   "amount": 2712300,
   "due": "2026-07-22",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-06-22",
   "approver": "E07",
   "orderedOn": "2026-06-24",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-009-02",
   "kouji": "26-009",
   "related": null,
   "partner": "T-106",
   "cat": "材料費",
   "title": "受水槽（パネル式）",
   "amount": 2165500,
   "due": "2026-07-30",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-06-24",
   "approver": "E07",
   "orderedOn": "2026-06-26",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-009-03",
   "kouji": "26-009",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "受水槽組立・給水配管工事",
   "amount": 3483600,
   "due": "2026-10-09",
   "status": "承認済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-06-26",
   "approver": "E07",
   "orderedOn": "2026-06-29",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-009-04",
   "kouji": "26-009",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "仮設給水・養生",
   "amount": 374600,
   "due": "2026-08-31",
   "status": "承認済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-07-01",
   "approver": "E07",
   "orderedOn": "2026-07-02",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-009-05",
   "kouji": "26-009",
   "related": null,
   "partner": "T-112",
   "cat": "外注費",
   "title": "ポンプ制御盤の電気工事",
   "amount": 968100,
   "due": "2026-09-18",
   "status": "承認済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-07-15",
   "approver": "E07",
   "orderedOn": "2026-07-16",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-009-06",
   "kouji": "26-009",
   "related": "26-009-02",
   "partner": "T-106",
   "cat": "材料費",
   "title": "受水槽（パネル式）の容量変更分",
   "amount": 576900,
   "due": "2026-08-12",
   "status": "検収済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-07-24",
   "approver": "E07",
   "orderedOn": "2026-07-27",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-009-07",
   "kouji": "26-009",
   "related": null,
   "partner": "T-106",
   "cat": "材料費",
   "title": "給水配管材・弁類",
   "amount": 451200,
   "due": "2026-09-11",
   "status": "承認済",
   "overReason": null,
   "drafter": "E05",
   "draftedOn": "2026-08-03",
   "approver": "E07",
   "orderedOn": "2026-08-04",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-010-01",
   "kouji": "26-010",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "LED照明器具（居室）",
   "amount": 1293600,
   "due": "2026-08-28",
   "status": "承認済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-07-14",
   "approver": "E07",
   "orderedOn": "2026-07-16",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-010-02",
   "kouji": "26-010",
   "related": null,
   "partner": "T-107",
   "cat": "材料費",
   "title": "LED照明器具（共用部）",
   "amount": 705500,
   "due": "2026-07-31",
   "status": "承認済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-07-15",
   "approver": "E07",
   "orderedOn": "2026-07-17",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-010-03",
   "kouji": "26-010",
   "related": null,
   "partner": "T-112",
   "cat": "外注費",
   "title": "照明器具の交換工事",
   "amount": 1335800,
   "due": "2026-09-30",
   "status": "承認済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-07-21",
   "approver": "E07",
   "orderedOn": "2026-07-22",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-010-04",
   "kouji": "26-010",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "高所作業台・養生材",
   "amount": 117100,
   "due": "2026-08-21",
   "status": "検収済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-07-21",
   "approver": "E07",
   "orderedOn": "2026-07-22",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-010-05",
   "kouji": "26-010",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "天井点検口の設置工事",
   "amount": 249200,
   "due": "2026-09-25",
   "status": "承認済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-09-01",
   "approver": "E07",
   "orderedOn": "2026-09-04",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-010-06",
   "kouji": "26-010",
   "related": null,
   "partner": "T-112",
   "cat": "外注費",
   "title": "照明器具の交換工事（倉庫・機械室）",
   "amount": 136800,
   "due": "2026-09-30",
   "status": "起票",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-09-03",
   "approver": null,
   "orderedOn": null,
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-011-01",
   "kouji": "26-011",
   "related": null,
   "partner": "T-108",
   "cat": "材料費",
   "title": "ビル用マルチエアコン",
   "amount": 1355600,
   "due": "2026-08-25",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-08-10",
   "approver": "E07",
   "orderedOn": "2026-08-11",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-011-02",
   "kouji": "26-011",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "空調機据付・冷媒配管工事",
   "amount": 1152800,
   "due": "2026-09-30",
   "status": "承認済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-08-12",
   "approver": "E07",
   "orderedOn": "2026-08-13",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-011-03",
   "kouji": "26-011",
   "related": null,
   "partner": "T-110",
   "cat": "経費",
   "title": "養生材・揚重",
   "amount": 93800,
   "due": "2026-08-24",
   "status": "検収済",
   "overReason": null,
   "drafter": "E03",
   "draftedOn": "2026-08-12",
   "approver": "E07",
   "orderedOn": "2026-08-13",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-012-01",
   "kouji": "26-012",
   "related": null,
   "partner": "T-106",
   "cat": "材料費",
   "title": "給湯配管材・保温材",
   "amount": 590400,
   "due": "2026-10-02",
   "status": "承認済",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-08-27",
   "approver": "E07",
   "orderedOn": "2026-08-28",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-012-02",
   "kouji": "26-012",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "給湯配管の更新工事",
   "amount": 999200,
   "due": "2026-10-30",
   "status": "起票",
   "overReason": null,
   "drafter": "E04",
   "draftedOn": "2026-09-04",
   "approver": null,
   "orderedOn": null,
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-013-01",
   "kouji": "26-013",
   "related": null,
   "partner": "T-109",
   "cat": "材料費",
   "title": "屋内消火栓箱・ホース・ノズル",
   "amount": 1707700,
   "due": "2026-10-09",
   "status": "承認済",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-08-10",
   "approver": "E07",
   "orderedOn": "2026-08-12",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "26-013-02",
   "kouji": "26-013",
   "related": null,
   "partner": "T-111",
   "cat": "外注費",
   "title": "消火配管の更新工事",
   "amount": 2108600,
   "due": "2026-11-27",
   "status": "起票",
   "overReason": null,
   "drafter": "E06",
   "draftedOn": "2026-09-07",
   "approver": null,
   "orderedOn": null,
   "cancelReason": null,
   "note": ""
  }
 ],
 "inspections": [
  {
   "no": "26-001-01-K1",
   "order": "26-001-01",
   "date": "2026-07-08",
   "amount": 298500,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-001-02-K1",
   "order": "26-001-02",
   "date": "2026-07-22",
   "amount": 251900,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-001-03-K1",
   "order": "26-001-03",
   "date": "2026-07-10",
   "amount": 83800,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-002-01-K1",
   "order": "26-002-01",
   "date": "2026-06-10",
   "amount": 1257300,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-002-02-K1",
   "order": "26-002-02",
   "date": "2026-06-12",
   "amount": 786200,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-002-03-K1",
   "order": "26-002-03",
   "date": "2026-07-28",
   "amount": 1423500,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-002-04-K1",
   "order": "26-002-04",
   "date": "2026-07-15",
   "amount": 263500,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-002-05-K1",
   "order": "26-002-05",
   "date": "2026-07-24",
   "amount": 242600,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-003-01-K1",
   "order": "26-003-01",
   "date": "2026-06-26",
   "amount": 707100,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-003-03-K1",
   "order": "26-003-03",
   "date": "2026-07-10",
   "amount": 512400,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-003-03-K2",
   "order": "26-003-03",
   "date": "2026-08-05",
   "amount": 512400,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-003-04-K1",
   "order": "26-003-04",
   "date": "2026-07-03",
   "amount": 115900,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-003-05-K1",
   "order": "26-003-05",
   "date": "2026-08-04",
   "amount": 407800,
   "content": "納品",
   "status": "取消",
   "corrects": null,
   "cancelReason": "検収額の入力誤り（納品書の額と相違）",
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-003-05-K2",
   "order": "26-003-05",
   "date": "2026-08-04",
   "amount": 443800,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-004-01-K1",
   "order": "26-004-01",
   "date": "2026-06-19",
   "amount": 1984500,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-004-02-K1",
   "order": "26-004-02",
   "date": "2026-06-30",
   "amount": 1452300,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-004-02-K2",
   "order": "26-004-02",
   "date": "2026-07-31",
   "amount": 1323200,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-004-03-K1",
   "order": "26-004-03",
   "date": "2026-07-02",
   "amount": 1528600,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-004-04-K1",
   "order": "26-004-04",
   "date": "2026-06-30",
   "amount": 364700,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-004-05-K1",
   "order": "26-004-05",
   "date": "2026-08-20",
   "amount": 1544900,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-01-K1",
   "order": "26-005-01",
   "date": "2026-05-20",
   "amount": 8548500,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-02-K1",
   "order": "26-005-02",
   "date": "2026-05-15",
   "amount": 2068000,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-02-K2",
   "order": "26-005-02",
   "date": "2026-07-10",
   "amount": 1551000,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-02-K3",
   "order": "26-005-02",
   "date": "2026-08-18",
   "amount": 775500,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-03-K1",
   "order": "26-005-03",
   "date": "2026-05-29",
   "amount": 2388400,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-03-K2",
   "order": "26-005-03",
   "date": "2026-06-30",
   "amount": 1910700,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-03-K3",
   "order": "26-005-03",
   "date": "2026-07-31",
   "amount": 1910700,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-04-K1",
   "order": "26-005-04",
   "date": "2026-08-10",
   "amount": 1563500,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-05-K1",
   "order": "26-005-05",
   "date": "2026-08-31",
   "amount": 657300,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-005-07-K1",
   "order": "26-005-07",
   "date": "2026-08-27",
   "amount": 385300,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-006-01-K1",
   "order": "26-006-01",
   "date": "2026-06-18",
   "amount": 4695500,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-006-02-K1",
   "order": "26-006-02",
   "date": "2026-06-30",
   "amount": 1880200,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-006-02-K2",
   "order": "26-006-02",
   "date": "2026-07-28",
   "amount": 1578900,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-006-03-K1",
   "order": "26-006-03",
   "date": "2026-06-30",
   "amount": 499200,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-006-04-K1",
   "order": "26-006-04",
   "date": "2026-06-05",
   "amount": 1520700,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-006-05-K1",
   "order": "26-006-05",
   "date": "2026-05-29",
   "amount": 1184500,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-006-06-K1",
   "order": "26-006-06",
   "date": "2026-07-07",
   "amount": 235700,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-007-01-K1",
   "order": "26-007-01",
   "date": "2026-07-31",
   "amount": 882200,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-007-01-K2",
   "order": "26-007-01",
   "date": "2026-08-20",
   "amount": 588100,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-007-02-K1",
   "order": "26-007-02",
   "date": "2026-07-14",
   "amount": 1410800,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-007-02-K2",
   "order": "26-007-02",
   "date": "2026-08-19",
   "amount": -86400,
   "content": "納品",
   "status": "有効",
   "corrects": "26-007-02-K1",
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-007-02-K3",
   "order": "26-007-02",
   "date": "2026-08-28",
   "amount": 86400,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-007-04-K1",
   "order": "26-007-04",
   "date": "2026-07-20",
   "amount": 221000,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E04",
   "note": ""
  },
  {
   "no": "26-008-01-K1",
   "order": "26-008-01",
   "date": "2026-08-05",
   "amount": 1427600,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-008-02-K1",
   "order": "26-008-02",
   "date": "2026-08-31",
   "amount": 671600,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-008-03-K1",
   "order": "26-008-03",
   "date": "2026-08-07",
   "amount": 127900,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-008-04-K1",
   "order": "26-008-04",
   "date": "2026-08-24",
   "amount": 734100,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-009-01-K1",
   "order": "26-009-01",
   "date": "2026-07-22",
   "amount": 2712300,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-009-02-K1",
   "order": "26-009-02",
   "date": "2026-07-30",
   "amount": 2165500,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-009-03-K1",
   "order": "26-009-03",
   "date": "2026-07-31",
   "amount": 1045100,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-009-03-K2",
   "order": "26-009-03",
   "date": "2026-08-31",
   "amount": 1045100,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-009-04-K1",
   "order": "26-009-04",
   "date": "2026-07-31",
   "amount": 187300,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-009-06-K1",
   "order": "26-009-06",
   "date": "2026-08-12",
   "amount": 576900,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-009-07-K1",
   "order": "26-009-07",
   "date": "2026-08-26",
   "amount": 225600,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E05",
   "note": ""
  },
  {
   "no": "26-010-01-K1",
   "order": "26-010-01",
   "date": "2026-08-04",
   "amount": 905500,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-010-03-K1",
   "order": "26-010-03",
   "date": "2026-08-31",
   "amount": 534300,
   "content": "出来高",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-010-04-K1",
   "order": "26-010-04",
   "date": "2026-08-21",
   "amount": 117100,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E06",
   "note": ""
  },
  {
   "no": "26-011-01-K1",
   "order": "26-011-01",
   "date": "2026-08-25",
   "amount": 1355600,
   "content": "納品",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  },
  {
   "no": "26-011-03-K1",
   "order": "26-011-03",
   "date": "2026-08-24",
   "amount": 93800,
   "content": "完了",
   "status": "有効",
   "corrects": null,
   "cancelReason": null,
   "registrant": "E03",
   "note": ""
  }
 ],
 "invoices": [
  {
   "no": "R-0091",
   "order": "26-005-01",
   "partner": "T-108",
   "invoiceNo": "SS-2026-1142",
   "invoiceDate": "2026-05-31",
   "amount": 8548500,
   "receivedOn": "2026-06-02",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-06-04",
   "bookMonth": "2026-05",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0092",
   "order": "26-001-02",
   "partner": "T-113",
   "invoiceNo": "HH2607-760",
   "invoiceDate": "2026-07-24",
   "amount": 251900,
   "receivedOn": "2026-07-27",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-07-29",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0093",
   "order": "26-001-01",
   "partner": "T-108",
   "invoiceNo": "SS-2026-1479",
   "invoiceDate": "2026-07-31",
   "amount": 298500,
   "receivedOn": "2026-08-03",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-05",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0094",
   "order": "26-001-03",
   "partner": "T-110",
   "invoiceNo": "SG-41452",
   "invoiceDate": "2026-07-31",
   "amount": 83800,
   "receivedOn": "2026-08-03",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-05",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0095",
   "order": "26-003-03",
   "partner": "T-112",
   "invoiceNo": "OD-3548",
   "invoiceDate": "2026-07-31",
   "amount": 512400,
   "receivedOn": "2026-08-03",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-04",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0096",
   "order": "26-004-02",
   "partner": "T-114",
   "invoiceNo": "MY-2607-64",
   "invoiceDate": "2026-07-31",
   "amount": 2775500,
   "receivedOn": "2026-08-03",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-05",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0097",
   "order": "26-005-03",
   "partner": "T-111",
   "invoiceNo": "MS260721",
   "invoiceDate": "2026-07-31",
   "amount": 6209800,
   "receivedOn": "2026-08-03",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-05",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0098",
   "order": "26-007-01",
   "partner": "T-111",
   "invoiceNo": "MS260738",
   "invoiceDate": "2026-07-31",
   "amount": 882200,
   "receivedOn": "2026-08-03",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-05",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0099",
   "order": "26-009-01",
   "partner": "T-108",
   "invoiceNo": "SS-2026-1573",
   "invoiceDate": "2026-07-31",
   "amount": 2712300,
   "receivedOn": "2026-08-03",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-05",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0100",
   "order": "26-002-03",
   "partner": "T-111",
   "invoiceNo": "MS260725",
   "invoiceDate": "2026-07-31",
   "amount": 1481800,
   "receivedOn": "2026-08-04",
   "status": "差戻し",
   "related": null,
   "checker": null,
   "checkedOn": null,
   "bookMonth": null,
   "cancelReason": "発注額を超える追加分が含まれていたため返却。発注額での再発行を依頼",
   "note": ""
  },
  {
   "no": "R-0101",
   "order": "26-006-02",
   "partner": "T-112",
   "invoiceNo": "OD-3493",
   "invoiceDate": "2026-07-31",
   "amount": 3459100,
   "receivedOn": "2026-08-04",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-06",
   "bookMonth": "2026-07",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0102",
   "order": "26-003-01",
   "partner": "T-109",
   "invoiceNo": "GB2607-15",
   "invoiceDate": "2026-07-31",
   "amount": 707100,
   "receivedOn": "2026-08-10",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-12",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0103",
   "order": "26-008-01",
   "partner": "T-107",
   "invoiceNo": "KY21906",
   "invoiceDate": "2026-08-10",
   "amount": 1427600,
   "receivedOn": "2026-08-12",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-14",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0104",
   "order": "26-002-03",
   "partner": "T-111",
   "invoiceNo": "MS260725",
   "invoiceDate": "2026-08-17",
   "amount": 1423500,
   "receivedOn": "2026-08-18",
   "status": "確認済",
   "related": "R-0100",
   "checker": "E08",
   "checkedOn": "2026-08-19",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0105",
   "order": "26-004-05",
   "partner": "T-111",
   "invoiceNo": "MS260829",
   "invoiceDate": "2026-08-20",
   "amount": 1544900,
   "receivedOn": "2026-08-24",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-26",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0106",
   "order": "26-007-01",
   "partner": "T-111",
   "invoiceNo": "MS260813",
   "invoiceDate": "2026-08-20",
   "amount": 588100,
   "receivedOn": "2026-08-24",
   "status": "受付",
   "related": null,
   "checker": null,
   "checkedOn": null,
   "bookMonth": null,
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0107",
   "order": "26-009-06",
   "partner": "T-106",
   "invoiceNo": "AK-202608-255",
   "invoiceDate": "2026-08-20",
   "amount": 576900,
   "receivedOn": "2026-08-24",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-26",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0108",
   "order": "26-010-04",
   "partner": "T-110",
   "invoiceNo": "SG-48162",
   "invoiceDate": "2026-08-21",
   "amount": 117100,
   "receivedOn": "2026-08-24",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-26",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0109",
   "order": "26-005-04",
   "partner": "T-114",
   "invoiceNo": "MY-2608-28",
   "invoiceDate": "2026-08-25",
   "amount": 1563500,
   "receivedOn": "2026-08-27",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-08-31",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0110",
   "order": "26-007-01",
   "partner": "T-111",
   "invoiceNo": "MS260813",
   "invoiceDate": "2026-08-20",
   "amount": 588100,
   "receivedOn": "2026-08-27",
   "status": "受付",
   "related": null,
   "checker": null,
   "checkedOn": null,
   "bookMonth": null,
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0111",
   "order": "26-010-02",
   "partner": "T-107",
   "invoiceNo": "KY23502",
   "invoiceDate": "2026-08-25",
   "amount": 705500,
   "receivedOn": "2026-08-27",
   "status": "受付",
   "related": null,
   "checker": null,
   "checkedOn": null,
   "bookMonth": null,
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0112",
   "order": "26-005-02",
   "partner": "T-106",
   "invoiceNo": "AK-202608-424",
   "invoiceDate": "2026-08-25",
   "amount": 775500,
   "receivedOn": "2026-08-28",
   "status": "受付",
   "related": null,
   "checker": null,
   "checkedOn": null,
   "bookMonth": null,
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0113",
   "order": "26-003-03",
   "partner": "T-112",
   "invoiceNo": "OD-3402",
   "invoiceDate": "2026-08-31",
   "amount": 512400,
   "receivedOn": "2026-09-02",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-09-04",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  },
  {
   "no": "R-0114",
   "order": "26-011-01",
   "partner": "T-108",
   "invoiceNo": "SS-2026-1679",
   "invoiceDate": "2026-08-31",
   "amount": 1355600,
   "receivedOn": "2026-09-02",
   "status": "確認済",
   "related": null,
   "checker": "E08",
   "checkedOn": "2026-09-03",
   "bookMonth": "2026-08",
   "cancelReason": null,
   "note": ""
  }
 ],
 "revisions": [
  {
   "no": "26-009-Y1",
   "kouji": "26-009",
   "cat": "材料費",
   "before": 5486200,
   "after": 6128700,
   "reason": "受水槽の容量を施主の要望で増やしたため",
   "drafter": "E05",
   "draftedOn": "2026-07-21",
   "status": "承認済",
   "approver": "E02",
   "revisedOn": "2026-07-23",
   "cancelReason": null
  }
 ],
 "labor": [
  {
   "kouji": "26-001",
   "month": "2026-07",
   "hours": 27,
   "rate": 4650,
   "amount": 125550,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-002",
   "month": "2026-05",
   "hours": 14.5,
   "rate": 4650,
   "amount": 67425,
   "recorder": "E08",
   "recordedOn": "2026-05-31"
  },
  {
   "kouji": "26-002",
   "month": "2026-06",
   "hours": 67,
   "rate": 4650,
   "amount": 311550,
   "recorder": "E08",
   "recordedOn": "2026-06-30"
  },
  {
   "kouji": "26-002",
   "month": "2026-07",
   "hours": 64,
   "rate": 4650,
   "amount": 297600,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-003",
   "month": "2026-06",
   "hours": 29,
   "rate": 4650,
   "amount": 134850,
   "recorder": "E08",
   "recordedOn": "2026-06-30"
  },
  {
   "kouji": "26-003",
   "month": "2026-07",
   "hours": 48.5,
   "rate": 4650,
   "amount": 225525,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-003",
   "month": "2026-08",
   "hours": 12,
   "rate": 4650,
   "amount": 55800,
   "recorder": null,
   "recordedOn": null
  },
  {
   "kouji": "26-004",
   "month": "2026-05",
   "hours": 17.5,
   "rate": 4650,
   "amount": 81375,
   "recorder": "E08",
   "recordedOn": "2026-05-31"
  },
  {
   "kouji": "26-004",
   "month": "2026-06",
   "hours": 83,
   "rate": 4650,
   "amount": 385950,
   "recorder": "E08",
   "recordedOn": "2026-06-30"
  },
  {
   "kouji": "26-004",
   "month": "2026-07",
   "hours": 88,
   "rate": 4650,
   "amount": 409200,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-004",
   "month": "2026-08",
   "hours": 68.5,
   "rate": 4650,
   "amount": 318525,
   "recorder": null,
   "recordedOn": null
  },
  {
   "kouji": "26-005",
   "month": "2026-04",
   "hours": 36.5,
   "rate": 4650,
   "amount": 169725,
   "recorder": "E08",
   "recordedOn": "2026-04-30"
  },
  {
   "kouji": "26-005",
   "month": "2026-05",
   "hours": 106.5,
   "rate": 4650,
   "amount": 495225,
   "recorder": "E08",
   "recordedOn": "2026-05-31"
  },
  {
   "kouji": "26-005",
   "month": "2026-06",
   "hours": 104,
   "rate": 4650,
   "amount": 483600,
   "recorder": "E08",
   "recordedOn": "2026-06-30"
  },
  {
   "kouji": "26-005",
   "month": "2026-07",
   "hours": 104.5,
   "rate": 4650,
   "amount": 485925,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-005",
   "month": "2026-08",
   "hours": 98,
   "rate": 4650,
   "amount": 455700,
   "recorder": null,
   "recordedOn": null
  },
  {
   "kouji": "26-006",
   "month": "2026-04",
   "hours": 10.5,
   "rate": 4650,
   "amount": 48825,
   "recorder": "E08",
   "recordedOn": "2026-04-30"
  },
  {
   "kouji": "26-006",
   "month": "2026-05",
   "hours": 83.5,
   "rate": 4650,
   "amount": 388275,
   "recorder": "E08",
   "recordedOn": "2026-05-31"
  },
  {
   "kouji": "26-006",
   "month": "2026-06",
   "hours": 80,
   "rate": 4650,
   "amount": 372000,
   "recorder": "E08",
   "recordedOn": "2026-06-30"
  },
  {
   "kouji": "26-006",
   "month": "2026-07",
   "hours": 90.5,
   "rate": 4650,
   "amount": 420825,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-006",
   "month": "2026-08",
   "hours": 90.5,
   "rate": 4650,
   "amount": 420825,
   "recorder": null,
   "recordedOn": null
  },
  {
   "kouji": "26-007",
   "month": "2026-06",
   "hours": 18,
   "rate": 4650,
   "amount": 83700,
   "recorder": "E08",
   "recordedOn": "2026-06-30"
  },
  {
   "kouji": "26-007",
   "month": "2026-07",
   "hours": 57,
   "rate": 4650,
   "amount": 265050,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-007",
   "month": "2026-08",
   "hours": 60.5,
   "rate": 4650,
   "amount": 281325,
   "recorder": null,
   "recordedOn": null
  },
  {
   "kouji": "26-008",
   "month": "2026-07",
   "hours": 27,
   "rate": 4650,
   "amount": 125550,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-008",
   "month": "2026-08",
   "hours": 52.5,
   "rate": 4650,
   "amount": 244125,
   "recorder": null,
   "recordedOn": null
  },
  {
   "kouji": "26-009",
   "month": "2026-06",
   "hours": 7.5,
   "rate": 4650,
   "amount": 34875,
   "recorder": "E08",
   "recordedOn": "2026-06-30"
  },
  {
   "kouji": "26-009",
   "month": "2026-07",
   "hours": 82.5,
   "rate": 4650,
   "amount": 383625,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-009",
   "month": "2026-08",
   "hours": 82.5,
   "rate": 4650,
   "amount": 383625,
   "recorder": null,
   "recordedOn": null
  },
  {
   "kouji": "26-010",
   "month": "2026-07",
   "hours": 18,
   "rate": 4650,
   "amount": 83700,
   "recorder": "E08",
   "recordedOn": "2026-07-31"
  },
  {
   "kouji": "26-010",
   "month": "2026-08",
   "hours": 53.5,
   "rate": 4650,
   "amount": 248775,
   "recorder": null,
   "recordedOn": null
  },
  {
   "kouji": "26-011",
   "month": "2026-08",
   "hours": 25,
   "rate": 4650,
   "amount": 116250,
   "recorder": null,
   "recordedOn": null
  }
 ],
 "history": [
  {
   "at": "2026-04-01 09:23",
   "user": "島田",
   "role": "営業",
   "target": "26-001",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "事務所フロア空調機更新",
    "施主": "桐原ビル管理株式会社",
    "工事場所": "本町2丁目 桐原第二ビル",
    "工事種別": "空調",
    "営業担当": "島田",
    "工事担当": "久保",
    "見積金額": 1036800,
    "着工予定日": "2026-07-06",
    "完工予定日": "2026-07-24",
    "実行予算（当初）材料費": 324600,
    "実行予算（当初）外注費": 268400,
    "実行予算（当初）労務費": 143700,
    "実行予算（当初）経費": 94300
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-02 09:16",
   "user": "野口",
   "role": "営業",
   "target": "26-002",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "給湯設備更新",
    "施主": "医療法人 碧水会",
    "工事場所": "桜台1丁目 碧水会クリニック",
    "工事種別": "給排水",
    "営業担当": "野口",
    "工事担当": "早川",
    "見積金額": 6712000,
    "着工予定日": "2026-05-25",
    "完工予定日": "2026-07-31",
    "実行予算（当初）材料費": 2184600,
    "実行予算（当初）外注費": 1736400,
    "実行予算（当初）労務費": 790500,
    "実行予算（当初）経費": 312800
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-03 09:23",
   "user": "島田",
   "role": "営業",
   "target": "26-003",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "自動火災報知設備・誘導灯更新",
    "施主": "社会福祉法人 楓の会",
    "工事場所": "旭町3丁目 楓の杜ホーム",
    "工事種別": "消防",
    "営業担当": "島田",
    "工事担当": "中西",
    "見積金額": 4026000,
    "着工予定日": "2026-06-15",
    "完工予定日": "2026-08-07",
    "実行予算（当初）材料費": 1286400,
    "実行予算（当初）外注費": 1148700,
    "実行予算（当初）労務費": 511500,
    "実行予算（当初）経費": 146200
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-06 09:14",
   "user": "野口",
   "role": "営業",
   "target": "26-004",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "厨房排気ダクト改修",
    "施主": "株式会社丸越フーズ",
    "工事場所": "港町2丁目 丸越フーズ第一工場",
    "工事種別": "改修",
    "営業担当": "野口",
    "工事担当": "松浦",
    "見積金額": 12860000,
    "着工予定日": "2026-05-25",
    "完工予定日": "2026-08-28",
    "実行予算（当初）材料費": 3864200,
    "実行予算（当初）外注費": 5218600,
    "実行予算（当初）労務費": 1432200,
    "実行予算（当初）経費": 486500
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-06 09:33",
   "user": "島田",
   "role": "営業",
   "target": "26-005",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "空調設備更新（全館）",
    "施主": "桐原ビル管理株式会社",
    "工事場所": "本町2丁目 桐原第一ビル",
    "工事種別": "空調",
    "営業担当": "島田",
    "工事担当": "松浦",
    "見積金額": 49860000,
    "着工予定日": "2026-04-20",
    "完工予定日": "2026-10-30",
    "実行予算（当初）材料費": 18642300,
    "実行予算（当初）外注費": 14286500,
    "実行予算（当初）労務費": 3718600,
    "実行予算（当初）経費": 1462800
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-07 09:07",
   "user": "島田",
   "role": "営業",
   "target": "26-006",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "受変電設備更新",
    "施主": "株式会社朝陽不動産",
    "工事場所": "緑町4丁目 朝陽ビル",
    "工事種別": "電気",
    "営業担当": "島田",
    "工事担当": "中西",
    "見積金額": 19480000,
    "着工予定日": "2026-04-27",
    "完工予定日": "2026-08-31",
    "実行予算（当初）材料費": 7684300,
    "実行予算（当初）外注費": 5426800,
    "実行予算（当初）労務費": 2027400,
    "実行予算（当初）経費": 624600
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-10 09:03",
   "user": "島田",
   "role": "営業",
   "target": "26-005",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 47862000,
    "受注日": "2026-04-10"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-13 09:13",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "空調機（1期分）",
    "取引先": "白鷺空調機器株式会社",
    "費目": "材料費",
    "発注金額": 8548500,
    "納期": "2026-05-20"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-15 09:09",
   "user": "岩崎",
   "role": "購買",
   "target": "26-005-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-04-15"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-15 09:16",
   "user": "野口",
   "role": "営業",
   "target": "26-007",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "給排水衛生設備改修（病棟）",
    "施主": "医療法人 碧水会",
    "工事場所": "桜台1丁目 碧水会病院",
    "工事種別": "衛生",
    "営業担当": "野口",
    "工事担当": "久保",
    "見積金額": 9864000,
    "着工予定日": "2026-06-22",
    "完工予定日": "2026-10-09",
    "実行予算（当初）材料費": 3146800,
    "実行予算（当初）外注費": 3286400,
    "実行予算（当初）労務費": 1209000,
    "実行予算（当初）経費": 318600
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-16 09:08",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "冷媒配管材・ドレン配管材（分納）",
    "取引先": "葵管材株式会社",
    "費目": "材料費",
    "発注金額": 5170100,
    "納期": "2026-09-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-17 09:20",
   "user": "岩崎",
   "role": "購買",
   "target": "26-005-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-04-17"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-17 09:37",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "空調機据付・冷媒配管工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 9553700,
    "納期": "2026-10-23"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-17 10:01",
   "user": "島田",
   "role": "営業",
   "target": "26-006",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 18946000,
    "受注日": "2026-04-17"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-20 09:06",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-04-20"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-20 09:14",
   "user": "岩崎",
   "role": "購買",
   "target": "26-005-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-04-20"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-20 09:32",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "キュービクル式高圧受電設備",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 4695500,
    "納期": "2026-06-18"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-23 09:08",
   "user": "岩崎",
   "role": "購買",
   "target": "26-006-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-04-23"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-24 09:17",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "受変電設備の据付・結線工事",
    "取引先": "株式会社岡野電気工事",
    "費目": "外注費",
    "発注金額": 3759900,
    "納期": "2026-07-28"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-27 09:07",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-04-27"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-27 09:31",
   "user": "岩崎",
   "role": "購買",
   "target": "26-006-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-04-27"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-27 09:54",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "仮設電源・養生",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 499200,
    "納期": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-04-28 09:12",
   "user": "岩崎",
   "role": "購買",
   "target": "26-006-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-04-28"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-07 09:13",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "高圧ケーブル・端末処理材",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 1520700,
    "納期": "2026-06-05"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-07 09:25",
   "user": "三浦",
   "role": "経理",
   "target": "26-005 2026-04",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 36.5,
    "単価": 4650,
    "金額": 169725,
    "計上日": "2026-04-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-07 09:25",
   "user": "三浦",
   "role": "経理",
   "target": "26-006 2026-04",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 10.5,
    "単価": 4650,
    "金額": 48825,
    "計上日": "2026-04-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-08 09:16",
   "user": "野口",
   "role": "営業",
   "target": "26-002",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 6482000,
    "受注日": "2026-05-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-08 09:29",
   "user": "岩崎",
   "role": "購買",
   "target": "26-006-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-05-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-08 09:48",
   "user": "三浦",
   "role": "経理",
   "target": "2026-04",
   "op": "締め",
   "before": {
    "状態": "未締め"
   },
   "after": {
    "状態": "締め済",
    "回数": "第1回"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-11 09:05",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-05",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "機器基礎・架台工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 1184500,
    "納期": "2026-05-29"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-12 09:11",
   "user": "野口",
   "role": "営業",
   "target": "26-004",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 12386000,
    "受注日": "2026-05-12"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-12 09:38",
   "user": "岩崎",
   "role": "購買",
   "target": "26-006-05",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-05-12"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-12 09:46",
   "user": "野口",
   "role": "営業",
   "target": "26-008",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "非常用照明・幹線改修",
    "施主": "株式会社朝陽不動産",
    "工事場所": "緑町4丁目 朝陽第二ビル",
    "工事種別": "電気",
    "営業担当": "野口",
    "工事担当": "早川",
    "見積金額": 7564000,
    "着工予定日": "2026-07-13",
    "完工予定日": "2026-10-23",
    "実行予算（当初）材料費": 2468300,
    "実行予算（当初）外注費": 2284600,
    "実行予算（当初）労務費": 883500,
    "実行予算（当初）経費": 214300
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-15 09:17",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-02-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-05-15",
    "検収額": 2068000,
    "内容": "納品"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-18 09:05",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "業務用ガス給湯器",
    "取引先": "白鷺空調機器株式会社",
    "費目": "材料費",
    "発注金額": 1257300,
    "納期": "2026-06-10"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-18 09:31",
   "user": "島田",
   "role": "営業",
   "target": "26-009",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "給水ポンプ・受水槽更新",
    "施主": "株式会社丸越フーズ",
    "工事場所": "港町2丁目 丸越フーズ第二工場",
    "工事種別": "給排水",
    "営業担当": "島田",
    "工事担当": "早川",
    "見積金額": 16380000,
    "着工予定日": "2026-06-29",
    "完工予定日": "2026-10-16",
    "実行予算（当初）材料費": 5486200,
    "実行予算（当初）外注費": 4862400,
    "実行予算（当初）労務費": 1627500,
    "実行予算（当初）経費": 538700
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-19 09:06",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "給湯配管材・継手・バルブ",
    "取引先": "葵管材株式会社",
    "費目": "材料費",
    "発注金額": 786200,
    "納期": "2026-06-12"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-20 09:07",
   "user": "岩崎",
   "role": "購買",
   "target": "26-002-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-05-20"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-20 09:30",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "ダクト用鋼板・支持金物",
    "取引先": "株式会社杉本建材",
    "費目": "材料費",
    "発注金額": 1984500,
    "納期": "2026-06-19"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-20 09:40",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-05-20",
    "検収額": 8548500,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-21 09:05",
   "user": "岩崎",
   "role": "購買",
   "target": "26-002-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-05-21"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-22 09:08",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "給湯器据付・配管工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 1423500,
    "納期": "2026-07-28"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-22 09:26",
   "user": "岩崎",
   "role": "購買",
   "target": "26-004-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-05-22"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-22 09:41",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "排気ダクトの製作・吊り込み工事",
    "取引先": "有限会社丸山ダクト",
    "費目": "外注費",
    "発注金額": 3227300,
    "納期": "2026-08-21"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-25 09:03",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-05-25"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-25 09:19",
   "user": "岩崎",
   "role": "購買",
   "target": "26-002-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-05-25"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-25 09:33",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-05-25"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-25 09:57",
   "user": "岩崎",
   "role": "購買",
   "target": "26-004-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-05-25"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-27 09:23",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "排気ファン・排気フード",
    "取引先": "白鷺空調機器株式会社",
    "費目": "材料費",
    "発注金額": 1528600,
    "納期": "2026-07-02"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-29 09:21",
   "user": "岩崎",
   "role": "購買",
   "target": "26-004-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-05-29"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-29 09:28",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-05-29",
    "検収額": 2388400,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-05-29 09:35",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-05-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-05-29",
    "検収額": 1184500,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-01 09:21",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "仮設・養生・撤去品の処分",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 263500,
    "納期": "2026-07-15"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-01 09:27",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "仮設材・養生材",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 364700,
    "納期": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-01 09:53",
   "user": "島田",
   "role": "営業",
   "target": "26-010",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "照明設備LED化",
    "施主": "社会福祉法人 楓の会",
    "工事場所": "旭町3丁目 楓の杜ホーム東館",
    "工事種別": "電気",
    "営業担当": "島田",
    "工事担当": "中西",
    "見積金額": 6184000,
    "着工予定日": "2026-07-21",
    "完工予定日": "2026-09-30",
    "実行予算（当初）材料費": 2386500,
    "実行予算（当初）外注費": 1684200,
    "実行予算（当初）労務費": 697500,
    "実行予算（当初）経費": 168400
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-02 09:14",
   "user": "岩崎",
   "role": "購買",
   "target": "26-004-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-02"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-02 09:30",
   "user": "三浦",
   "role": "経理",
   "target": "R-0091",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-005-01",
    "請求書番号": "SS-2026-1142",
    "請求書の日付": "2026-05-31",
    "請求額": 8548500,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-03 09:12",
   "user": "岩崎",
   "role": "購買",
   "target": "26-002-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-03"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-03 09:18",
   "user": "島田",
   "role": "営業",
   "target": "26-003",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 3864000,
    "受注日": "2026-06-03"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-03 09:33",
   "user": "三浦",
   "role": "経理",
   "target": "26-002 2026-05",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 14.5,
    "単価": 4650,
    "金額": 67425,
    "計上日": "2026-05-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-03 09:33",
   "user": "三浦",
   "role": "経理",
   "target": "26-004 2026-05",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 17.5,
    "単価": 4650,
    "金額": 81375,
    "計上日": "2026-05-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-03 09:33",
   "user": "三浦",
   "role": "経理",
   "target": "26-005 2026-05",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 106.5,
    "単価": 4650,
    "金額": 495225,
    "計上日": "2026-05-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-03 09:33",
   "user": "三浦",
   "role": "経理",
   "target": "26-006 2026-05",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 83.5,
    "単価": 4650,
    "金額": 388275,
    "計上日": "2026-05-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-04 09:19",
   "user": "三浦",
   "role": "経理",
   "target": "R-0091",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-06-04",
    "計上月": "2026-05"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-05 09:04",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-05",
    "検収額": 1520700,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-05 09:29",
   "user": "野口",
   "role": "営業",
   "target": "26-007",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 9468000,
    "受注日": "2026-06-05"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-05 09:57",
   "user": "三浦",
   "role": "経理",
   "target": "2026-05",
   "op": "締め",
   "before": {
    "状態": "未締め"
   },
   "after": {
    "状態": "締め済",
    "回数": "第1回"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-08 09:22",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "自動火災報知設備の感知器・発信機・受信機",
    "取引先": "株式会社銀河防災用品",
    "費目": "材料費",
    "発注金額": 707100,
    "納期": "2026-06-26"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-08 09:44",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "誘導灯器具",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 420700,
    "納期": "2026-07-10"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-08 10:01",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-05",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "グリース阻集器・排水配管工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 1544900,
    "納期": "2026-08-20"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-10 09:07",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-05",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "給湯器の電源・制御配線工事",
    "取引先": "株式会社岡野電気工事",
    "費目": "外注費",
    "発注金額": 242600,
    "納期": "2026-07-24"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-10 09:21",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-10",
    "検収額": 1257300,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-10 09:28",
   "user": "岩崎",
   "role": "購買",
   "target": "26-003-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-10"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-10 09:53",
   "user": "岩崎",
   "role": "購買",
   "target": "26-003-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-10"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-10 10:16",
   "user": "岩崎",
   "role": "購買",
   "target": "26-004-05",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-10"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-11 09:16",
   "user": "岩崎",
   "role": "購買",
   "target": "26-002-05",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-11"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-12 09:14",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-02-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-12",
    "検収額": 786200,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-12 09:25",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "自動火災報知設備の配線・機器取付工事",
    "取引先": "株式会社岡野電気工事",
    "費目": "外注費",
    "発注金額": 1024800,
    "納期": "2026-08-05"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-12 09:38",
   "user": "島田",
   "role": "営業",
   "target": "26-009",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 15824000,
    "受注日": "2026-06-12"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-15 09:06",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-06-15"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-15 09:30",
   "user": "岩崎",
   "role": "購買",
   "target": "26-003-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-15"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-15 09:41",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "脚立・足場の損料",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 115900,
    "納期": "2026-07-03"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-16 09:22",
   "user": "岩崎",
   "role": "購買",
   "target": "26-003-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-16"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-16 09:50",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "給排水配管・衛生器具取付工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 2940600,
    "納期": "2026-10-02"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-17 09:03",
   "user": "岩崎",
   "role": "購買",
   "target": "26-003-02",
   "op": "取消",
   "before": {
    "状態": "承認済"
   },
   "after": {
    "状態": "取消"
   },
   "reason": "メーカーの型式変更で品番が合わないため。新しい型式で発注し直す",
   "related": ""
  },
  {
   "at": "2026-06-18 09:04",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-05",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "誘導灯器具（新型式）",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 443800,
    "納期": "2026-08-04"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-18 09:29",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-18",
    "検収額": 4695500,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-18 09:43",
   "user": "岩崎",
   "role": "購買",
   "target": "26-007-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-18"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-19 09:22",
   "user": "島田",
   "role": "営業",
   "target": "26-001",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 978500,
    "受注日": "2026-06-19"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-19 09:31",
   "user": "岩崎",
   "role": "購買",
   "target": "26-003-05",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-19"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-19 09:38",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-19",
    "検収額": 1984500,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-19 09:55",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "衛生器具・水栓",
    "取引先": "葵管材株式会社",
    "費目": "材料費",
    "発注金額": 1410800,
    "納期": "2026-07-14"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-22 09:22",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-06-22"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-22 09:34",
   "user": "岩崎",
   "role": "購買",
   "target": "26-007-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-22"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-22 09:52",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "換気扇・電気温水器",
    "取引先": "白鷺空調機器株式会社",
    "費目": "材料費",
    "発注金額": 1251500,
    "納期": "2026-07-24"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-22 10:06",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "加圧給水ポンプユニット",
    "取引先": "白鷺空調機器株式会社",
    "費目": "材料費",
    "発注金額": 2712300,
    "納期": "2026-07-22"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-22 10:34",
   "user": "島田",
   "role": "営業",
   "target": "26-011",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "空調機更新（2・3階）",
    "施主": "株式会社朝陽不動産",
    "工事場所": "緑町4丁目 朝陽第三ビル",
    "工事種別": "空調",
    "営業担当": "島田",
    "工事担当": "松浦",
    "見積金額": 4486000,
    "着工予定日": "2026-08-17",
    "完工予定日": "2026-10-02",
    "実行予算（当初）材料費": 1528600,
    "実行予算（当初）外注費": 1286500,
    "実行予算（当初）労務費": 418500,
    "実行予算（当初）経費": 126300
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-24 09:07",
   "user": "岩崎",
   "role": "購買",
   "target": "26-007-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-24"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-24 09:30",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "仮設間仕切り・養生",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 221000,
    "納期": "2026-07-20"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-24 09:36",
   "user": "岩崎",
   "role": "購買",
   "target": "26-009-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-24"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-24 09:44",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "受水槽（パネル式）",
    "取引先": "葵管材株式会社",
    "費目": "材料費",
    "発注金額": 2165500,
    "納期": "2026-07-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-25 09:07",
   "user": "岩崎",
   "role": "購買",
   "target": "26-007-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-25"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-26 09:17",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-26",
    "検収額": 707100,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-26 09:23",
   "user": "野口",
   "role": "営業",
   "target": "26-008",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 7238000,
    "受注日": "2026-06-26"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-26 09:40",
   "user": "岩崎",
   "role": "購買",
   "target": "26-009-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-26"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-26 10:01",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "受水槽組立・給水配管工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 3483600,
    "納期": "2026-10-09"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-29 09:17",
   "user": "久保",
   "role": "工事担当",
   "target": "26-001-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "パッケージエアコン（室内機・室外機）",
    "取引先": "白鷺空調機器株式会社",
    "費目": "材料費",
    "発注金額": 298500,
    "納期": "2026-07-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-29 09:40",
   "user": "久保",
   "role": "工事担当",
   "target": "26-001-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "空調機据付・冷媒配管の保温工事",
    "取引先": "株式会社星野保温",
    "費目": "外注費",
    "発注金額": 251900,
    "納期": "2026-07-22"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-29 10:04",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-06",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "接地材・端子類",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 235700,
    "納期": "2026-07-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-29 10:31",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-06-29"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-29 10:44",
   "user": "岩崎",
   "role": "購買",
   "target": "26-009-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-29"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-30 09:24",
   "user": "久保",
   "role": "工事担当",
   "target": "26-001-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "養生材・仮設材",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 83800,
    "納期": "2026-07-10"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-30 09:37",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-02-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-30",
    "検収額": 1452300,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-30 09:46",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-30",
    "検収額": 364700,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-30 10:02",
   "user": "岩崎",
   "role": "購買",
   "target": "26-006-06",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-30 10:28",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-02-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-30",
    "検収額": 1880200,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-06-30 10:47",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-30",
    "検収額": 499200,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-01 09:11",
   "user": "岩崎",
   "role": "購買",
   "target": "26-001-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-01"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-01 09:23",
   "user": "岩崎",
   "role": "購買",
   "target": "26-001-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-01"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-01 09:47",
   "user": "岩崎",
   "role": "購買",
   "target": "26-001-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-01"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-01 10:07",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "仮設給水・養生",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 374600,
    "納期": "2026-08-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-01 10:26",
   "user": "野口",
   "role": "営業",
   "target": "26-012",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "浴室給湯配管改修",
    "施主": "医療法人 碧水会",
    "工事場所": "桜台1丁目 碧水会ケアセンター",
    "工事種別": "給排水",
    "営業担当": "野口",
    "工事担当": "久保",
    "見積金額": 3286000,
    "着工予定日": "2026-10-05",
    "完工予定日": "2026-11-13",
    "実行予算（当初）材料費": 986400,
    "実行予算（当初）外注費": 1124800,
    "実行予算（当初）労務費": 418500,
    "実行予算（当初）経費": 96800
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-02 09:10",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-02",
    "検収額": 1528600,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-02 09:34",
   "user": "岩崎",
   "role": "購買",
   "target": "26-009-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-02"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-03 09:09",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-03",
    "検収額": 115900,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-03 09:22",
   "user": "三浦",
   "role": "経理",
   "target": "26-002 2026-06",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 67,
    "単価": 4650,
    "金額": 311550,
    "計上日": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-03 09:22",
   "user": "三浦",
   "role": "経理",
   "target": "26-003 2026-06",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 29,
    "単価": 4650,
    "金額": 134850,
    "計上日": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-03 09:22",
   "user": "三浦",
   "role": "経理",
   "target": "26-004 2026-06",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 83,
    "単価": 4650,
    "金額": 385950,
    "計上日": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-03 09:22",
   "user": "三浦",
   "role": "経理",
   "target": "26-005 2026-06",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 104,
    "単価": 4650,
    "金額": 483600,
    "計上日": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-03 09:22",
   "user": "三浦",
   "role": "経理",
   "target": "26-006 2026-06",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 80,
    "単価": 4650,
    "金額": 372000,
    "計上日": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-03 09:22",
   "user": "三浦",
   "role": "経理",
   "target": "26-007 2026-06",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 18,
    "単価": 4650,
    "金額": 83700,
    "計上日": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-03 09:22",
   "user": "三浦",
   "role": "経理",
   "target": "26-009 2026-06",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 7.5,
    "単価": 4650,
    "金額": 34875,
    "計上日": "2026-06-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-06 09:09",
   "user": "久保",
   "role": "工事担当",
   "target": "26-001",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-07-06"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-06 09:33",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-05",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "洗面水栓（追加分）",
    "取引先": "葵管材株式会社",
    "費目": "材料費",
    "発注金額": 248500,
    "納期": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-06 09:59",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "非常用照明器具",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 1427600,
    "納期": "2026-08-05"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-06 10:05",
   "user": "島田",
   "role": "営業",
   "target": "26-010",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 5946000,
    "受注日": "2026-07-06"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-06 10:11",
   "user": "三浦",
   "role": "経理",
   "target": "2026-06",
   "op": "締め",
   "before": {
    "状態": "未締め"
   },
   "after": {
    "状態": "締め済",
    "回数": "第1回"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-07 09:16",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-06-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-07",
    "検収額": 235700,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-07 09:26",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-05",
   "op": "取消",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "取消"
   },
   "reason": "26-007-02 に含まれている品目を重ねて起票したため",
   "related": ""
  },
  {
   "at": "2026-07-08 09:18",
   "user": "久保",
   "role": "工事担当",
   "target": "26-001-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-08",
    "検収額": 298500,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-08 09:34",
   "user": "岩崎",
   "role": "購買",
   "target": "26-008-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-09 09:04",
   "user": "野口",
   "role": "営業",
   "target": "26-013",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "屋内消火栓設備更新",
    "施主": "株式会社丸越フーズ",
    "工事場所": "港町2丁目 丸越フーズ物流センター",
    "工事種別": "消防",
    "営業担当": "野口",
    "工事担当": "中西",
    "見積金額": 8146000,
    "着工予定日": "2026-10-13",
    "完工予定日": "2026-12-18",
    "実行予算（当初）材料費": 2864300,
    "実行予算（当初）外注費": 2638400,
    "実行予算（当初）労務費": 790500,
    "実行予算（当初）経費": 246800
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-10 09:06",
   "user": "久保",
   "role": "工事担当",
   "target": "26-001-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-10",
    "検収額": 83800,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-10 09:16",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-10",
    "検収額": 512400,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-10 09:44",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-02-K2",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-10",
    "検収額": 1551000,
    "内容": "納品"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-10 10:09",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-07",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "据付・結線工事の減額（試験立会い1回分）",
    "取引先": "株式会社岡野電気工事",
    "費目": "外注費",
    "発注金額": -300800
   },
   "reason": "",
   "related": "26-006-02"
  },
  {
   "at": "2026-07-13 09:22",
   "user": "岩崎",
   "role": "購買",
   "target": "26-006-07",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-13",
    "元の発注の有効発注額": 3459100
   },
   "reason": "",
   "related": "26-006-02"
  },
  {
   "at": "2026-07-13 09:35",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-07-13"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-13 09:45",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "幹線張替え・器具取付工事",
    "取引先": "株式会社岡野電気工事",
    "費目": "外注費",
    "発注金額": 1918800,
    "納期": "2026-09-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-14 09:10",
   "user": "三浦",
   "role": "経理",
   "target": "2026-06",
   "op": "締め解除",
   "before": {
    "状態": "締め済"
   },
   "after": {
    "状態": "未締め"
   },
   "reason": "6月30日の外注の出来高の検収が未登録のため",
   "related": ""
  },
  {
   "at": "2026-07-14 10:30",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-03-K2",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-06-30",
    "検収額": 1910700,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-14 10:54",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-02-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-14",
    "検収額": 1410800,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-14 11:06",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "LED照明器具（居室）",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 1293600,
    "納期": "2026-08-28"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-15 09:09",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-15",
    "検収額": 263500,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-15 09:32",
   "user": "岩崎",
   "role": "購買",
   "target": "26-008-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-15"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-15 09:39",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-05",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "ポンプ制御盤の電気工事",
    "取引先": "株式会社岡野電気工事",
    "費目": "外注費",
    "発注金額": 968100,
    "納期": "2026-09-18"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-15 09:48",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "LED照明器具（共用部）",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 705500,
    "納期": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-15 10:08",
   "user": "三浦",
   "role": "経理",
   "target": "2026-06",
   "op": "締め",
   "before": {
    "状態": "未締め"
   },
   "after": {
    "状態": "締め済",
    "回数": "第2回"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-16 09:21",
   "user": "岩崎",
   "role": "購買",
   "target": "26-009-05",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-16"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-16 09:43",
   "user": "岩崎",
   "role": "購買",
   "target": "26-010-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-16"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-17 09:16",
   "user": "岩崎",
   "role": "購買",
   "target": "26-010-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-17"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-20 09:05",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "ダクト交換工事（範囲拡大分）",
    "取引先": "有限会社丸山ダクト",
    "費目": "外注費",
    "発注金額": 5211700,
    "納期": "2026-10-09"
   },
   "reason": "既設ダクトの劣化が想定より進んでおり、交換範囲が広がったため",
   "related": ""
  },
  {
   "at": "2026-07-20 09:16",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-20",
    "検収額": 221000,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-20 09:26",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "高所作業車の損料",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 127900,
    "納期": "2026-08-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-21 09:16",
   "user": "岩崎",
   "role": "購買",
   "target": "26-008-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-21"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-21 09:25",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-Y1",
   "op": "予算改定の起案",
   "before": {},
   "after": {
    "費目": "材料費",
    "改定前の額": 5486200,
    "改定後の額": 6128700
   },
   "reason": "受水槽の容量を施主の要望で増やしたため",
   "related": ""
  },
  {
   "at": "2026-07-21 09:44",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-07-21"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-21 09:54",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "照明器具の交換工事",
    "取引先": "株式会社岡野電気工事",
    "費目": "外注費",
    "発注金額": 1335800,
    "納期": "2026-09-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-21 10:19",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "高所作業台・養生材",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 117100,
    "納期": "2026-08-21"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-22 09:17",
   "user": "久保",
   "role": "工事担当",
   "target": "26-001-02-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-22",
    "検収額": 251900,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-22 09:35",
   "user": "岩崎",
   "role": "購買",
   "target": "26-005-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-22"
   },
   "reason": "既設ダクトの劣化が想定より進んでおり、交換範囲が広がったため",
   "related": ""
  },
  {
   "at": "2026-07-22 10:03",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-22",
    "検収額": 2712300,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-22 10:27",
   "user": "岩崎",
   "role": "購買",
   "target": "26-010-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-22"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-22 10:35",
   "user": "岩崎",
   "role": "購買",
   "target": "26-010-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-22"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-23 09:19",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-05",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "仮設・養生・揚重",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 657300,
    "納期": "2026-08-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-23 09:36",
   "user": "野口",
   "role": "営業",
   "target": "26-009-Y1",
   "op": "予算改定の承認",
   "before": {
    "状態": "起案"
   },
   "after": {
    "状態": "承認済",
    "改定日": "2026-07-23"
   },
   "reason": "受水槽の容量を施主の要望で増やしたため",
   "related": ""
  },
  {
   "at": "2026-07-24 09:02",
   "user": "久保",
   "role": "工事担当",
   "target": "26-001",
   "op": "状態を進める",
   "before": {
    "状態": "施工中"
   },
   "after": {
    "状態": "検収済",
    "施主検収日": "2026-07-24"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-24 09:24",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-05-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-24",
    "検収額": 242600,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-24 09:45",
   "user": "岩崎",
   "role": "購買",
   "target": "26-005-05",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-24"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-24 10:08",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-06",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "受水槽（パネル式）の容量変更分",
    "取引先": "葵管材株式会社",
    "費目": "材料費",
    "発注金額": 576900,
    "納期": "2026-08-12"
   },
   "reason": "",
   "related": "26-009-02"
  },
  {
   "at": "2026-07-27 09:04",
   "user": "三浦",
   "role": "経理",
   "target": "R-0092",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-001-02",
    "請求書番号": "HH2607-760",
    "請求書の日付": "2026-07-24",
    "請求額": 251900,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-27 09:24",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-06",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "空調用電線・制御ケーブル",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 3352800,
    "納期": "2026-09-18"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-27 09:32",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008-04",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "幹線ケーブル・配線器具",
    "取引先": "株式会社光陽電材",
    "費目": "材料費",
    "発注金額": 1223500,
    "納期": "2026-09-15"
   },
   "reason": "幹線ルートの変更でケーブルの長さが増えたため",
   "related": ""
  },
  {
   "at": "2026-07-27 09:52",
   "user": "岩崎",
   "role": "購買",
   "target": "26-009-06",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-27"
   },
   "reason": "",
   "related": "26-009-02"
  },
  {
   "at": "2026-07-28 09:14",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-28",
    "検収額": 1423500,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-28 09:25",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006-02-K2",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-28",
    "検収額": 1578900,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-29 09:16",
   "user": "三浦",
   "role": "経理",
   "target": "R-0092",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-07-29",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-29 09:22",
   "user": "岩崎",
   "role": "購買",
   "target": "26-005-06",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-29"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-29 09:42",
   "user": "岩崎",
   "role": "購買",
   "target": "26-008-04",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-07-29"
   },
   "reason": "幹線ルートの変更でケーブルの長さが増えたため",
   "related": ""
  },
  {
   "at": "2026-07-30 09:02",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-02-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-30",
    "検収額": 2165500,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-30 09:13",
   "user": "島田",
   "role": "営業",
   "target": "26-011",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 4318000,
    "受注日": "2026-07-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-31 09:09",
   "user": "三浦",
   "role": "経理",
   "target": "26-001",
   "op": "状態を進める",
   "before": {
    "状態": "検収済"
   },
   "after": {
    "状態": "請求済",
    "施主請求日": "2026-07-31",
    "請求額": 978500
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-31 09:29",
   "user": "早川",
   "role": "工事担当",
   "target": "26-002",
   "op": "状態を進める",
   "before": {
    "状態": "施工中"
   },
   "after": {
    "状態": "検収済",
    "施主検収日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-31 09:47",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-02-K2",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-31",
    "検収額": 1323200,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-31 10:01",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-31",
    "検収額": 882200,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-31 10:14",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-31",
    "検収額": 1045100,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-07-31 10:38",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-31",
    "検収額": 187300,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 09:24",
   "user": "三浦",
   "role": "経理",
   "target": "R-0093",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-001-01",
    "請求書番号": "SS-2026-1479",
    "請求書の日付": "2026-07-31",
    "請求額": 298500,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 09:34",
   "user": "三浦",
   "role": "経理",
   "target": "R-0094",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-001-03",
    "請求書番号": "SG-41452",
    "請求書の日付": "2026-07-31",
    "請求額": 83800,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 09:45",
   "user": "三浦",
   "role": "経理",
   "target": "R-0095",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-003-03",
    "請求書番号": "OD-3548",
    "請求書の日付": "2026-07-31",
    "請求額": 512400,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 09:57",
   "user": "三浦",
   "role": "経理",
   "target": "R-0096",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-004-02",
    "請求書番号": "MY-2607-64",
    "請求書の日付": "2026-07-31",
    "請求額": 2775500,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 10:14",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-07",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "防火ダンパー（変更契約分）",
    "取引先": "株式会社銀河防災用品",
    "費目": "材料費",
    "発注金額": 385300,
    "納期": "2026-08-27"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 10:22",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-03-K3",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-07-31",
    "検収額": 1910700,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 10:35",
   "user": "三浦",
   "role": "経理",
   "target": "R-0097",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-005-03",
    "請求書番号": "MS260721",
    "請求書の日付": "2026-07-31",
    "請求額": 6209800,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 10:48",
   "user": "三浦",
   "role": "経理",
   "target": "R-0098",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-007-01",
    "請求書番号": "MS260738",
    "請求書の日付": "2026-07-31",
    "請求額": 882200,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 10:56",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-07",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "給水配管材・弁類",
    "取引先": "葵管材株式会社",
    "費目": "材料費",
    "発注金額": 451200,
    "納期": "2026-09-11"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 11:08",
   "user": "三浦",
   "role": "経理",
   "target": "R-0099",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-009-01",
    "請求書番号": "SS-2026-1573",
    "請求書の日付": "2026-07-31",
    "請求額": 2712300,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 11:30",
   "user": "野口",
   "role": "営業",
   "target": "26-013",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 7862000,
    "受注日": "2026-08-03"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-03 11:52",
   "user": "島田",
   "role": "営業",
   "target": "26-014",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "中央監視設備更新",
    "施主": "桐原ビル管理株式会社",
    "工事場所": "本町2丁目 桐原第一ビル",
    "工事種別": "電気",
    "営業担当": "島田",
    "工事担当": "松浦",
    "見積金額": 22640000,
    "着工予定日": "2027-01-12",
    "完工予定日": "2027-03-19",
    "実行予算（当初）材料費": 8426300,
    "実行予算（当初）外注費": 7184600,
    "実行予算（当初）労務費": 1862300,
    "実行予算（当初）経費": 612400
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-04 09:16",
   "user": "三浦",
   "role": "経理",
   "target": "R-0100",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-002-03",
    "請求書番号": "MS260725",
    "請求書の日付": "2026-07-31",
    "請求額": 1481800,
    "判定": "検収額を超えている"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-04 09:23",
   "user": "三浦",
   "role": "経理",
   "target": "R-0100",
   "op": "差戻し",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "差戻し"
   },
   "reason": "発注額を超える追加分が含まれていたため返却。発注額での再発行を依頼",
   "related": ""
  },
  {
   "at": "2026-08-04 09:46",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-05-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-04",
    "検収額": 407800,
    "内容": "納品"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-04 10:14",
   "user": "三浦",
   "role": "経理",
   "target": "R-0095",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-04",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-04 10:30",
   "user": "岩崎",
   "role": "購買",
   "target": "26-005-07",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-08-04"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-04 10:54",
   "user": "三浦",
   "role": "経理",
   "target": "R-0101",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-006-02",
    "請求書番号": "OD-3493",
    "請求書の日付": "2026-07-31",
    "請求額": 3459100,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-04 11:17",
   "user": "岩崎",
   "role": "購買",
   "target": "26-009-07",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-08-04"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-04 11:43",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-04",
    "検収額": 905500,
    "内容": "納品"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 09:02",
   "user": "三浦",
   "role": "経理",
   "target": "R-0093",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-05",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 09:17",
   "user": "三浦",
   "role": "経理",
   "target": "R-0094",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-05",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 09:32",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-05-K1",
   "op": "取消",
   "before": {
    "状態": "有効"
   },
   "after": {
    "状態": "取消"
   },
   "reason": "検収額の入力誤り（納品書の額と相違）",
   "related": ""
  },
  {
   "at": "2026-08-05 09:46",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-05-K2",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-04",
    "検収額": 443800,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 10:03",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003-03-K2",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-05",
    "検収額": 512400,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 10:12",
   "user": "三浦",
   "role": "経理",
   "target": "R-0096",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-05",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 10:30",
   "user": "三浦",
   "role": "経理",
   "target": "R-0097",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-05",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 10:58",
   "user": "三浦",
   "role": "経理",
   "target": "R-0098",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-05",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:10",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-05",
    "検収額": 1427600,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:17",
   "user": "三浦",
   "role": "経理",
   "target": "R-0099",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-05",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-001 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 27,
    "単価": 4650,
    "金額": 125550,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-002 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 64,
    "単価": 4650,
    "金額": 297600,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-003 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 48.5,
    "単価": 4650,
    "金額": 225525,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-004 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 88,
    "単価": 4650,
    "金額": 409200,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-005 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 104.5,
    "単価": 4650,
    "金額": 485925,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-006 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 90.5,
    "単価": 4650,
    "金額": 420825,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-007 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 57,
    "単価": 4650,
    "金額": 265050,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-008 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 27,
    "単価": 4650,
    "金額": 125550,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-009 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 82.5,
    "単価": 4650,
    "金額": 383625,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-05 11:41",
   "user": "三浦",
   "role": "経理",
   "target": "26-010 2026-07",
   "op": "労務費の計上",
   "before": {},
   "after": {
    "時間": 18,
    "単価": 4650,
    "金額": 83700,
    "計上日": "2026-07-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-06 09:02",
   "user": "三浦",
   "role": "経理",
   "target": "26-005",
   "op": "変更",
   "before": {
    "受注金額": 47862000
   },
   "after": {
    "受注金額": 48316000
   },
   "reason": "変更契約（防火ダンパーの追加）を締結したため",
   "related": ""
  },
  {
   "at": "2026-08-06 09:17",
   "user": "三浦",
   "role": "経理",
   "target": "R-0101",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-06",
    "計上月": "2026-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-07 09:14",
   "user": "中西",
   "role": "工事担当",
   "target": "26-003",
   "op": "状態を進める",
   "before": {
    "状態": "施工中"
   },
   "after": {
    "状態": "検収済",
    "施主検収日": "2026-08-07"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-07 09:35",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-07",
    "検収額": 127900,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-07 09:47",
   "user": "三浦",
   "role": "経理",
   "target": "2026-07",
   "op": "締め",
   "before": {
    "状態": "未締め"
   },
   "after": {
    "状態": "締め済",
    "回数": "第1回"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-10 09:14",
   "user": "三浦",
   "role": "経理",
   "target": "R-0102",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-003-01",
    "請求書番号": "GB2607-15",
    "請求書の日付": "2026-07-31",
    "請求額": 707100,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-10 09:37",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-10",
    "検収額": 1563500,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-10 09:45",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-011-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "ビル用マルチエアコン",
    "取引先": "白鷺空調機器株式会社",
    "費目": "材料費",
    "発注金額": 1355600,
    "納期": "2026-08-25"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-10 10:02",
   "user": "中西",
   "role": "工事担当",
   "target": "26-013-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "屋内消火栓箱・ホース・ノズル",
    "取引先": "株式会社銀河防災用品",
    "費目": "材料費",
    "発注金額": 1707700,
    "納期": "2026-10-09"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-11 09:07",
   "user": "岩崎",
   "role": "購買",
   "target": "26-011-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-08-11"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-12 09:16",
   "user": "三浦",
   "role": "経理",
   "target": "R-0102",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-12",
    "計上月": "2026-08"
   },
   "reason": "過月分",
   "related": ""
  },
  {
   "at": "2026-08-12 09:37",
   "user": "三浦",
   "role": "経理",
   "target": "R-0103",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-008-01",
    "請求書番号": "KY21906",
    "請求書の日付": "2026-08-10",
    "請求額": 1427600,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-12 09:45",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-06-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-12",
    "検収額": 576900,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-12 09:51",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-011-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "空調機据付・冷媒配管工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 1152800,
    "納期": "2026-09-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-12 10:15",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-011-03",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "養生材・揚重",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 93800,
    "納期": "2026-08-24"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-12 10:41",
   "user": "岩崎",
   "role": "購買",
   "target": "26-013-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-08-12"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-13 09:04",
   "user": "岩崎",
   "role": "購買",
   "target": "26-011-02",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-08-13"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-13 09:30",
   "user": "岩崎",
   "role": "購買",
   "target": "26-011-03",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-08-13"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-14 09:20",
   "user": "三浦",
   "role": "経理",
   "target": "R-0103",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-14",
    "計上月": "2026-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-17 09:05",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-011",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-08-17"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-18 09:03",
   "user": "三浦",
   "role": "経理",
   "target": "R-0104",
   "op": "再受付",
   "before": {},
   "after": {
    "発注番号": "26-002-03",
    "請求書番号": "MS260725",
    "請求書の日付": "2026-08-17",
    "請求額": 1423500,
    "判定": "確定できる"
   },
   "reason": "",
   "related": "R-0100"
  },
  {
   "at": "2026-08-18 09:22",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-02-K3",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-18",
    "検収額": 775500,
    "内容": "納品"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-19 09:07",
   "user": "三浦",
   "role": "経理",
   "target": "R-0104",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-19",
    "計上月": "2026-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-19 09:22",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-08",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "撤去機器の運搬・処分",
    "取引先": "株式会社杉本建材",
    "費目": "経費",
    "発注金額": 85500,
    "納期": "2026-09-25"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-19 09:46",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-02-K2",
   "op": "訂正",
   "before": {},
   "after": {
    "検収日": "2026-08-19",
    "検収額": -86400,
    "内容": "納品",
    "発注の状態": "承認済"
   },
   "reason": "7月14日納品分のうち、型番違いの衛生器具を返品したため",
   "related": "26-007-02-K1"
  },
  {
   "at": "2026-08-20 09:12",
   "user": "三浦",
   "role": "経理",
   "target": "26-002",
   "op": "状態を進める",
   "before": {
    "状態": "検収済"
   },
   "after": {
    "状態": "請求済",
    "施主請求日": "2026-08-20",
    "請求額": 6482000
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-20 09:40",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004-05-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-20",
    "検収額": 1544900,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-20 10:04",
   "user": "岩崎",
   "role": "購買",
   "target": "26-005-08",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-08-20"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-20 10:26",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-01-K2",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-20",
    "検収額": 588100,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-21 09:14",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-21",
    "検収額": 117100,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-21 09:24",
   "user": "野口",
   "role": "営業",
   "target": "26-012",
   "op": "状態を進める",
   "before": {
    "状態": "見積中"
   },
   "after": {
    "状態": "受注",
    "受注金額": 3164000,
    "受注日": "2026-08-21"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-24 09:21",
   "user": "三浦",
   "role": "経理",
   "target": "R-0105",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-004-05",
    "請求書番号": "MS260829",
    "請求書の日付": "2026-08-20",
    "請求額": 1544900,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-24 09:47",
   "user": "三浦",
   "role": "経理",
   "target": "R-0106",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-007-01",
    "請求書番号": "MS260813",
    "請求書の日付": "2026-08-20",
    "請求額": 588100,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-24 10:09",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008-04-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-24",
    "検収額": 734100,
    "内容": "納品"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-24 10:36",
   "user": "三浦",
   "role": "経理",
   "target": "R-0107",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-009-06",
    "請求書番号": "AK-202608-255",
    "請求書の日付": "2026-08-20",
    "請求額": 576900,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-24 10:48",
   "user": "三浦",
   "role": "経理",
   "target": "R-0108",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-010-04",
    "請求書番号": "SG-48162",
    "請求書の日付": "2026-08-21",
    "請求額": 117100,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-24 11:14",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-011-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-24",
    "検収額": 93800,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-24 11:31",
   "user": "中西",
   "role": "工事担当",
   "target": "26-013",
   "op": "状態を進める",
   "before": {
    "状態": "受注"
   },
   "after": {
    "状態": "施工中",
    "着工日": "2026-08-24"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-25 09:11",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-011-01-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-25",
    "検収額": 1355600,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-25 09:37",
   "user": "三浦",
   "role": "経理",
   "target": "26-013",
   "op": "状態を戻す",
   "before": {
    "状態": "施工中",
    "着工日": "2026-08-24"
   },
   "after": {
    "状態": "受注",
    "着工日": null
   },
   "reason": "着工の登録を誤ったため。着工は10月の予定",
   "related": ""
  },
  {
   "at": "2026-08-26 09:13",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-004",
   "op": "状態を進める",
   "before": {
    "状態": "施工中"
   },
   "after": {
    "状態": "検収済",
    "施主検収日": "2026-08-26"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-26 09:28",
   "user": "三浦",
   "role": "経理",
   "target": "R-0105",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-26",
    "計上月": "2026-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-26 09:53",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-07-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-26",
    "検収額": 225600,
    "内容": "納品"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-26 10:19",
   "user": "三浦",
   "role": "経理",
   "target": "R-0107",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-26",
    "計上月": "2026-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-26 10:41",
   "user": "三浦",
   "role": "経理",
   "target": "R-0108",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-26",
    "計上月": "2026-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-27 09:24",
   "user": "岩崎",
   "role": "購買",
   "target": "26-004-02",
   "op": "打切",
   "before": {
    "状態": "承認済",
    "未検収残": 451800
   },
   "after": {
    "状態": "打切",
    "未検収残": 0
   },
   "reason": "残りの吊り込みは施主の設備更新に合わせて取りやめになったため",
   "related": ""
  },
  {
   "at": "2026-08-27 09:40",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-07-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-27",
    "検収額": 385300,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-27 10:03",
   "user": "三浦",
   "role": "経理",
   "target": "R-0109",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-005-04",
    "請求書番号": "MY-2608-28",
    "請求書の日付": "2026-08-25",
    "請求額": 1563500,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-27 10:28",
   "user": "三浦",
   "role": "経理",
   "target": "R-0110",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-007-01",
    "請求書番号": "MS260813",
    "請求書の日付": "2026-08-20",
    "請求額": 588100,
    "判定": "二重の疑い"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-27 10:37",
   "user": "三浦",
   "role": "経理",
   "target": "R-0111",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-010-02",
    "請求書番号": "KY23502",
    "請求書の日付": "2026-08-25",
    "請求額": 705500,
    "判定": "発注検収なし"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-27 10:57",
   "user": "久保",
   "role": "工事担当",
   "target": "26-012-01",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "給湯配管材・保温材",
    "取引先": "葵管材株式会社",
    "費目": "材料費",
    "発注金額": 590400,
    "納期": "2026-10-02"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-28 09:12",
   "user": "三浦",
   "role": "経理",
   "target": "26-003",
   "op": "状態を進める",
   "before": {
    "状態": "検収済"
   },
   "after": {
    "状態": "請求済",
    "施主請求日": "2026-08-28",
    "請求額": 3864000
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-28 09:21",
   "user": "三浦",
   "role": "経理",
   "target": "R-0112",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-005-02",
    "請求書番号": "AK-202608-424",
    "請求書の日付": "2026-08-25",
    "請求額": 775500,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-28 09:35",
   "user": "久保",
   "role": "工事担当",
   "target": "26-007-02-K3",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-28",
    "検収額": 86400,
    "内容": "納品",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-28 09:45",
   "user": "岩崎",
   "role": "購買",
   "target": "26-012-01",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-08-28"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-31 09:11",
   "user": "三浦",
   "role": "経理",
   "target": "R-0109",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-08-31",
    "計上月": "2026-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-31 09:24",
   "user": "中西",
   "role": "工事担当",
   "target": "26-006",
   "op": "状態を進める",
   "before": {
    "状態": "施工中"
   },
   "after": {
    "状態": "検収済",
    "施主検収日": "2026-08-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-08-31 09:41",
   "user": "野口",
   "role": "営業",
   "target": "26-015",
   "op": "登録",
   "before": {},
   "after": {
    "工事名": "厨房給排水改修",
    "施主": "社会福祉法人 楓の会",
    "工事場所": "旭町3丁目 楓の杜ホーム",
    "工事種別": "衛生",
    "営業担当": "野口",
    "見積金額": 1186000,
    "着工予定日": "2026-11-09",
    "完工予定日": "2026-11-20",
    "実行予算（当初）材料費": 0,
    "実行予算（当初）外注費": 0,
    "実行予算（当初）労務費": 0,
    "実行予算（当初）経費": 0
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-01 09:07",
   "user": "松浦",
   "role": "工事担当",
   "target": "26-005-05-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-31",
    "検収額": 657300,
    "内容": "完了",
    "発注の状態": "検収済"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-01 09:16",
   "user": "早川",
   "role": "工事担当",
   "target": "26-008-02-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-31",
    "検収額": 671600,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-01 09:23",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-05",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "天井点検口の設置工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 249200,
    "納期": "2026-09-25"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-01 09:47",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-03-K1",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-31",
    "検収額": 534300,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-02 09:07",
   "user": "三浦",
   "role": "経理",
   "target": "26-001",
   "op": "状態を進める",
   "before": {
    "状態": "請求済"
   },
   "after": {
    "状態": "完了",
    "入金日": "2026-08-31"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-02 09:31",
   "user": "三浦",
   "role": "経理",
   "target": "R-0113",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-003-03",
    "請求書番号": "OD-3402",
    "請求書の日付": "2026-08-31",
    "請求額": 512400,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-02 09:38",
   "user": "早川",
   "role": "工事担当",
   "target": "26-009-03-K2",
   "op": "登録",
   "before": {},
   "after": {
    "検収日": "2026-08-31",
    "検収額": 1045100,
    "内容": "出来高"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-02 09:44",
   "user": "三浦",
   "role": "経理",
   "target": "R-0114",
   "op": "登録",
   "before": {},
   "after": {
    "発注番号": "26-011-01",
    "請求書番号": "SS-2026-1679",
    "請求書の日付": "2026-08-31",
    "請求額": 1355600,
    "判定": "確定できる"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-03 09:20",
   "user": "中西",
   "role": "工事担当",
   "target": "26-010-06",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "照明器具の交換工事（倉庫・機械室）",
    "取引先": "株式会社岡野電気工事",
    "費目": "外注費",
    "発注金額": 136800,
    "納期": "2026-09-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-03 09:32",
   "user": "三浦",
   "role": "経理",
   "target": "R-0114",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-09-03",
    "計上月": "2026-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-04 09:24",
   "user": "三浦",
   "role": "経理",
   "target": "R-0113",
   "op": "確認",
   "before": {
    "状態": "受付"
   },
   "after": {
    "状態": "確認済",
    "確認日": "2026-09-04",
    "計上月": "2026-08"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-04 09:32",
   "user": "岩崎",
   "role": "購買",
   "target": "26-010-05",
   "op": "承認",
   "before": {
    "状態": "起票"
   },
   "after": {
    "状態": "承認済",
    "発注日": "2026-09-04"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-04 09:56",
   "user": "久保",
   "role": "工事担当",
   "target": "26-012-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "給湯配管の更新工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 999200,
    "納期": "2026-10-30"
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-04 10:11",
   "user": "野口",
   "role": "営業",
   "target": "26-015",
   "op": "変更",
   "before": {
    "受注金額": null
   },
   "after": {
    "受注金額": 1142000
   },
   "reason": "",
   "related": ""
  },
  {
   "at": "2026-09-07 09:03",
   "user": "岩崎",
   "role": "購買",
   "target": "26-010-06",
   "op": "修正依頼",
   "before": {},
   "after": {},
   "reason": "外注費の予算を超えます。予算超過の理由を入れて再提出してください",
   "related": ""
  },
  {
   "at": "2026-09-07 09:20",
   "user": "中西",
   "role": "工事担当",
   "target": "26-013-02",
   "op": "登録",
   "before": {},
   "after": {
    "件名": "消火配管の更新工事",
    "取引先": "有限会社村瀬設備",
    "費目": "外注費",
    "発注金額": 2108600,
    "納期": "2026-11-27"
   },
   "reason": "",
   "related": ""
  }
 ],
 "schema": {
  "kouji": {
   "name": "工事",
   "fields": [
    {
     "name": "工事番号",
     "type": "文字 26-001 の形（年度2桁-連番3桁）",
     "required": "○",
     "edit": "不可",
     "default": "自動採番",
     "key": "no"
    },
    {
     "name": "工事名",
     "type": "文字 40字まで",
     "required": "○",
     "edit": "見積中・受注で可",
     "default": "空",
     "key": "name"
    },
    {
     "name": "施主",
     "type": "取引先（区分=施主）",
     "required": "○",
     "edit": "見積中・受注で可",
     "default": "空",
     "key": "client"
    },
    {
     "name": "工事場所",
     "type": "文字",
     "required": "○",
     "edit": "見積中・受注で可",
     "default": "空",
     "key": "site"
    },
    {
     "name": "工事種別",
     "type": "空調／給排水／衛生／電気／消防／改修",
     "required": "○",
     "edit": "見積中・受注で可",
     "default": "空",
     "key": "kind"
    },
    {
     "name": "状態",
     "type": "6つ",
     "required": "○",
     "edit": "遷移のみ",
     "default": "見積中",
     "key": "status"
    },
    {
     "name": "営業担当",
     "type": "社員",
     "required": "○",
     "edit": "見積中・受注で可",
     "default": "操作者（営業のとき）",
     "key": "sales"
    },
    {
     "name": "工事担当",
     "type": "社員",
     "required": "受注時に○",
     "edit": "可",
     "default": "空",
     "key": "manager"
    },
    {
     "name": "見積金額",
     "type": "円（税抜）",
     "required": "○",
     "edit": "見積中・受注で可",
     "default": "空",
     "key": "estimate"
    },
    {
     "name": "受注金額",
     "type": "円（税抜）",
     "required": "受注時に○",
     "edit": "見積中は可。受注後は経理のみ可（理由必須）",
     "default": "見積金額",
     "key": "contract"
    },
    {
     "name": "実行予算（当初、費目別4つ）",
     "type": "円×4（材料費／外注費／労務費／経費）",
     "required": "受注時に○",
     "edit": "見積中は可。受注後は不可（予算改定で変える）",
     "default": "0",
     "key": "budget0"
    },
    {
     "name": "受注日",
     "type": "日付",
     "required": "受注時に○",
     "edit": "不可",
     "default": "空",
     "key": "contractOn"
    },
    {
     "name": "着工予定日",
     "type": "日付",
     "required": "○",
     "edit": "見積中・受注で可",
     "default": "空",
     "key": "planStart"
    },
    {
     "name": "完工予定日",
     "type": "日付（着工予定日以降）",
     "required": "○",
     "edit": "可",
     "default": "空",
     "key": "planEnd"
    },
    {
     "name": "着工日",
     "type": "日付",
     "required": "施工中で○",
     "edit": "不可",
     "default": "空",
     "key": "startOn"
    },
    {
     "name": "施主検収日",
     "type": "日付",
     "required": "検収済で○",
     "edit": "不可",
     "default": "空",
     "key": "clientInspectOn"
    },
    {
     "name": "施主請求日／請求額",
     "type": "日付／円（一括）",
     "required": "請求済で○",
     "edit": "不可",
     "default": "空",
     "keys": [
      "clientBillOn",
      "clientBillAmount"
     ]
    },
    {
     "name": "入金日",
     "type": "日付（一括）",
     "required": "完了で○",
     "edit": "不可",
     "default": "空",
     "key": "paidOn"
    },
    {
     "name": "備考",
     "type": "文字",
     "required": "",
     "edit": "可",
     "default": "空",
     "key": "note"
    }
   ],
   "notes": [
    "工事の登録と基本情報の編集は、同じ「基本情報」のダイアログで行う。操作できるのは営業のみ。扱う項目は 工事名、施主、工事場所、工事種別、営業担当、工事担当、見積金額、着工予定日、完工予定日、備考。見積中は受注金額と実行予算（当初）も扱う。見積中と受注では扱う項目を全部編集でき、施工中以後は 工事担当、完工予定日、備考 だけ編集できる。受注後の受注金額の変更は、経理が工事詳細の金額のまとめから理由を付けて行う。",
    "実行予算（当初）の合計は4費目の和で持たない（計算する）。"
   ],
   "computed": [
    "予算（今の値、費目ごとと合計）",
    "発注済",
    "発生原価",
    "計上額",
    "残",
    "消化率",
    "粗利（発生原価ベース）"
   ]
  },
  "orders": {
   "name": "発注",
   "fields": [
    {
     "name": "発注番号",
     "type": "文字 26-001-03 の形（工事番号-連番2桁）",
     "required": "○",
     "edit": "不可",
     "default": "自動採番",
     "key": "no"
    },
    {
     "name": "工事番号",
     "type": "工事（受注か施工中の物）",
     "required": "○",
     "edit": "不可",
     "default": "遷移元の工事",
     "key": "kouji"
    },
    {
     "name": "関連発注番号",
     "type": "発注（追加は元の通常の発注、減額は減らす対象の発注）",
     "required": "追加・減額のときに○",
     "edit": "不可",
     "default": "遷移元の発注",
     "key": "related"
    },
    {
     "name": "取引先",
     "type": "取引先（仕入先か外注先、取引中の物）",
     "required": "○",
     "edit": "起票中のみ可（追加・減額は元と同じで不可）",
     "default": "空",
     "key": "partner"
    },
    {
     "name": "費目",
     "type": "材料費／外注費／経費",
     "required": "○",
     "edit": "起票中のみ可（追加・減額は元と同じで不可）",
     "default": "空",
     "key": "cat"
    },
    {
     "name": "件名",
     "type": "文字 40字まで",
     "required": "○",
     "edit": "起票中のみ可",
     "default": "空",
     "key": "title"
    },
    {
     "name": "発注金額",
     "type": "円（税抜。通常と追加は1円以上、減額は負で元の未検収残まで）",
     "required": "○",
     "edit": "起票中のみ可",
     "default": "空",
     "key": "amount"
    },
    {
     "name": "納期",
     "type": "日付（起票日以降）",
     "required": "通常と追加で○",
     "edit": "承認済まで可",
     "default": "空",
     "key": "due"
    },
    {
     "name": "状態",
     "type": "起票／承認済／検収済／打切／取消",
     "required": "○",
     "edit": "遷移のみ",
     "default": "起票",
     "key": "status"
    },
    {
     "name": "予算超過の理由",
     "type": "文字",
     "required": "超過時に○（承認のときに判定し直す）",
     "edit": "起票中のみ可",
     "default": "空",
     "key": "overReason"
    },
    {
     "name": "起票者／起票日",
     "type": "社員（工事担当）／日付（起票した日）",
     "required": "○",
     "edit": "不可",
     "default": "操作者／操作した日",
     "keys": [
      "drafter",
      "draftedOn"
     ]
    },
    {
     "name": "承認者／発注日",
     "type": "社員（購買）／日付（承認した日）",
     "required": "承認時に○",
     "edit": "不可",
     "default": "空（起票中は空）",
     "keys": [
      "approver",
      "orderedOn"
     ]
    },
    {
     "name": "取消・打切の理由",
     "type": "文字",
     "required": "取消・打切のときに○",
     "edit": "不可",
     "default": "空",
     "key": "cancelReason"
    },
    {
     "name": "備考",
     "type": "文字",
     "required": "",
     "edit": "可",
     "default": "空",
     "key": "note"
    }
   ],
   "notes": [],
   "computed": [
    "区分（通常／追加／減額）",
    "有効発注額（通常と追加）",
    "発注検収の累計",
    "未検収残",
    "確認済の請求額",
    "修正依頼の文言（修正依頼の後に再提出していない物）"
   ]
  },
  "inspections": {
   "name": "発注検収",
   "fields": [
    {
     "name": "検収番号",
     "type": "文字 26-001-03-K1 の形（発注番号-K連番）",
     "required": "○",
     "edit": "不可",
     "default": "自動採番",
     "key": "no"
    },
    {
     "name": "発注番号",
     "type": "発注（承認済・検収済・打切の通常と追加の物）",
     "required": "○",
     "edit": "不可",
     "default": "選んだ発注",
     "key": "order"
    },
    {
     "name": "検収日",
     "type": "日付（未締めの月、発注日以後）",
     "required": "○",
     "edit": "不可",
     "default": "基準日",
     "key": "date"
    },
    {
     "name": "検収額",
     "type": "円（通常は1円以上で未検収残以下。訂正は負で、絶対値は訂正元の残りまで）",
     "required": "○",
     "edit": "不可",
     "default": "空",
     "key": "amount"
    },
    {
     "name": "内容",
     "type": "納品／出来高／完了",
     "required": "○",
     "edit": "不可",
     "default": "空（訂正は訂正元と同じ）",
     "key": "content"
    },
    {
     "name": "状態",
     "type": "有効／取消",
     "required": "○",
     "edit": "遷移のみ",
     "default": "有効",
     "key": "status"
    },
    {
     "name": "訂正元の検収番号",
     "type": "発注検収（締め済の月の物）",
     "required": "訂正のときに○",
     "edit": "不可",
     "default": "空",
     "key": "corrects"
    },
    {
     "name": "取消の理由",
     "type": "文字",
     "required": "取消のときに○",
     "edit": "不可",
     "default": "空",
     "key": "cancelReason"
    },
    {
     "name": "登録者",
     "type": "社員",
     "required": "○",
     "edit": "不可",
     "default": "操作者",
     "key": "registrant"
    },
    {
     "name": "備考",
     "type": "文字",
     "required": "",
     "edit": "可",
     "default": "空",
     "key": "note"
    }
   ],
   "notes": [
    "訂正（マイナス額）は、訂正元の検収番号が入った発注検収として登録する。額を直す操作は無く、取消と訂正で直す。"
   ],
   "computed": []
  },
  "invoices": {
   "name": "請求",
   "fields": [
    {
     "name": "受付番号",
     "type": "文字 R-0081 の形",
     "required": "○",
     "edit": "不可",
     "default": "自動採番",
     "key": "no"
    },
    {
     "name": "発注番号",
     "type": "発注（承認済・検収済・打切の通常と追加の物）",
     "required": "○",
     "edit": "受付のみ可",
     "default": "空",
     "key": "order"
    },
    {
     "name": "取引先",
     "type": "取引先",
     "required": "○",
     "edit": "不可",
     "default": "発注の取引先",
     "key": "partner"
    },
    {
     "name": "請求書番号",
     "type": "文字（仕入先・外注先が付けた番号）",
     "required": "○",
     "edit": "受付のみ可",
     "default": "空",
     "key": "invoiceNo"
    },
    {
     "name": "請求書の日付",
     "type": "日付",
     "required": "○",
     "edit": "受付のみ可",
     "default": "空",
     "key": "invoiceDate"
    },
    {
     "name": "請求額",
     "type": "円（税抜、1円以上）",
     "required": "○",
     "edit": "受付のみ可",
     "default": "空",
     "key": "amount"
    },
    {
     "name": "受付日",
     "type": "日付",
     "required": "○",
     "edit": "不可",
     "default": "操作した日",
     "key": "receivedOn"
    },
    {
     "name": "状態",
     "type": "受付／確認済／差戻し／取消",
     "required": "○",
     "edit": "遷移のみ",
     "default": "受付",
     "key": "status"
    },
    {
     "name": "関連する受付番号",
     "type": "請求（差戻しの物。再受付の元）",
     "required": "再受付のときに○",
     "edit": "不可",
     "default": "空",
     "key": "related"
    },
    {
     "name": "確認者／確認日",
     "type": "社員／日付（実際に確認した日）",
     "required": "確認時に○",
     "edit": "不可",
     "default": "操作者／操作した日",
     "keys": [
      "checker",
      "checkedOn"
     ]
    },
    {
     "name": "計上月",
     "type": "年月（未締めの月で、請求書の日付の月以後、確認日の月以前）",
     "required": "確認時に○",
     "edit": "不可",
     "default": "受付日の月（締め済なら未締めの最も早い月）",
     "key": "bookMonth"
    },
    {
     "name": "差戻し・取消の理由",
     "type": "文字",
     "required": "差戻し・取消のときに○",
     "edit": "不可",
     "default": "空",
     "key": "cancelReason"
    },
    {
     "name": "備考",
     "type": "文字",
     "required": "",
     "edit": "可",
     "default": "空",
     "key": "note"
    }
   ],
   "notes": [],
   "computed": [
    "判定（二重の疑い／発注検収なし／検収額を超えている／確定できる）",
    "過月分かどうか",
    "支払予定日",
    "支払期日経過かどうか"
   ]
  },
  "revisions": {
   "name": "予算改定",
   "fields": [
    {
     "name": "改定番号",
     "type": "文字 26-009-Y1 の形（工事番号-Y連番）",
     "required": "○",
     "edit": "不可",
     "default": "自動採番",
     "key": "no"
    },
    {
     "name": "工事番号",
     "type": "工事",
     "required": "○",
     "edit": "不可",
     "default": "遷移元の工事",
     "key": "kouji"
    },
    {
     "name": "費目",
     "type": "材料費／外注費／労務費／経費",
     "required": "○",
     "edit": "起案中のみ可",
     "default": "空",
     "key": "cat"
    },
    {
     "name": "改定前の額",
     "type": "円",
     "required": "○",
     "edit": "不可",
     "default": "その時点の予算（今の値）",
     "key": "before"
    },
    {
     "name": "改定後の額",
     "type": "円（0以上）",
     "required": "○",
     "edit": "起案中のみ可",
     "default": "空",
     "key": "after"
    },
    {
     "name": "理由",
     "type": "文字",
     "required": "○",
     "edit": "起案中のみ可",
     "default": "空",
     "key": "reason"
    },
    {
     "name": "起案者／起案日",
     "type": "社員（工事担当）／日付",
     "required": "○",
     "edit": "不可",
     "default": "操作者／基準日",
     "keys": [
      "drafter",
      "draftedOn"
     ]
    },
    {
     "name": "状態",
     "type": "起案／承認済／取消",
     "required": "○",
     "edit": "遷移のみ",
     "default": "起案",
     "key": "status"
    },
    {
     "name": "承認者／改定日",
     "type": "社員（営業）／日付（承認した日）",
     "required": "承認時に○",
     "edit": "不可",
     "default": "空",
     "keys": [
      "approver",
      "revisedOn"
     ]
    },
    {
     "name": "取消の理由",
     "type": "文字",
     "required": "取消のときに○",
     "edit": "不可",
     "default": "空",
     "key": "cancelReason"
    }
   ],
   "notes": [
    "改定者は起案者と承認者の2人を持つ。改定日から予算（今の値）に入る。当初の値は工事の項目に残り、変わらない。"
   ],
   "computed": []
  },
  "labor": {
   "name": "労務費の計上",
   "fields": [
    {
     "name": "工事",
     "type": "工事番号",
     "required": "○",
     "edit": "不可",
     "default": "対象の工事",
     "key": "kouji"
    },
    {
     "name": "月",
     "type": "年月 2026-08 の形",
     "required": "○",
     "edit": "不可",
     "default": "対象の月",
     "key": "month"
    },
    {
     "name": "時間",
     "type": "時間（0.5刻み、0以上）",
     "required": "○",
     "edit": "未締めの月は可",
     "default": "日報の集計",
     "key": "hours"
    },
    {
     "name": "単価",
     "type": "円／時間",
     "required": "○",
     "edit": "未締めの月は可",
     "default": "標準の時間単価",
     "key": "rate"
    },
    {
     "name": "金額",
     "type": "円（時間×単価、円未満切り捨て）",
     "required": "○",
     "edit": "不可",
     "default": "計算",
     "key": "amount"
    },
    {
     "name": "計上者",
     "type": "社員（経理）",
     "required": "計上時に○",
     "edit": "不可",
     "default": "操作者",
     "key": "recorder"
    },
    {
     "name": "計上日",
     "type": "日付（その月の中で未締めの月）",
     "required": "計上時に○",
     "edit": "未締めの月は可",
     "default": "その月の末日",
     "key": "recordedOn"
    }
   ],
   "notes": [
    "1工事1か月に1行。計上日が空の行は未計上（時間だけ日報の集計が入っている）。"
   ],
   "computed": []
  },
  "partners": {
   "name": "取引先",
   "fields": [
    {
     "name": "取引先コード",
     "type": "T-101 の形",
     "required": "",
     "edit": "",
     "default": "",
     "key": "code"
    },
    {
     "name": "名称",
     "type": "文字",
     "required": "",
     "edit": "",
     "default": "",
     "key": "name"
    },
    {
     "name": "区分",
     "type": "施主／仕入先／外注先",
     "required": "",
     "edit": "",
     "default": "",
     "key": "kind"
    },
    {
     "name": "担当者名",
     "type": "姓のみ",
     "required": "",
     "edit": "",
     "default": "",
     "key": "contact"
    },
    {
     "name": "支払条件",
     "type": "月末締め翌月末払い、など",
     "required": "",
     "edit": "",
     "default": "",
     "key": "terms"
    },
    {
     "name": "取引状態",
     "type": "取引中／停止",
     "required": "",
     "edit": "",
     "default": "",
     "key": "status"
    },
    {
     "name": "登録日",
     "type": "日付",
     "required": "",
     "edit": "",
     "default": "",
     "key": "registeredOn"
    },
    {
     "name": "備考",
     "type": "文字",
     "required": "",
     "edit": "",
     "default": "",
     "key": "note"
    }
   ],
   "notes": [
    "停止の取引先は発注で選べない。支払の実績は対象外。"
   ],
   "computed": [
    "発注済",
    "確認済で支払予定の額（支払期日経過の物を含む）",
    "次の支払予定日（確認済の請求のうち最も早い支払予定日。支払期日経過の物も含む）"
   ]
  },
  "history": {
   "name": "履歴",
   "columns": [
    "項目",
    "型",
    "内容"
   ],
   "fields": [
    {
     "key": "at",
     "name": "日時",
     "type": "日付と時刻 2026-09-08 14:05 の形",
     "content": "操作した日時"
    },
    {
     "key": "user",
     "name": "操作者",
     "type": "社員（姓）",
     "content": ""
    },
    {
     "key": "role",
     "name": "役割",
     "type": "営業／工事担当／購買／経理",
     "content": "操作したときの役割"
    },
    {
     "key": "target",
     "name": "対象の番号",
     "type": "工事番号、発注番号、検収番号、受付番号、改定番号、労務費（工事番号と月）、締めの月",
     "content": ""
    },
    {
     "key": "op",
     "name": "操作の種類",
     "type": "登録、変更、承認、修正依頼、再提出、状態を進める、状態を戻す、取消、打切、訂正、確認、差戻し、再受付、予算改定の起案、予算改定の承認、労務費の計上、締め、締め解除",
     "content": ""
    },
    {
     "key": "before",
     "name": "変更前",
     "type": "項目名と値の組",
     "content": "消した値と変えた値を含む"
    },
    {
     "key": "after",
     "name": "変更後",
     "type": "項目名と値の組",
     "content": "締めは「第2回」のように回数を含む"
    },
    {
     "key": "reason",
     "name": "理由",
     "type": "文字",
     "content": "取消、打切、訂正、差戻し、修正依頼（依頼の文言）、状態を戻す、受注後の受注金額の変更、締め解除、予算超過、予算改定では必須。過月分の確認は「過月分」と入る"
    },
    {
     "key": "related",
     "name": "関連する番号",
     "type": "番号",
     "content": "元の発注番号、訂正元の検収番号、再受付の元の受付番号、重複の正本の受付番号"
    }
   ],
   "notes": [
    "全ての登録・変更・承認・修正依頼・再提出・取消・打切・訂正・状態変更・計上・締めに1行残す。履歴は直せず、消せない。",
    "工事詳細、発注の詳細、請求の行、月次の締めに新しい順で出し、理由は折りたたまない。"
   ],
   "computed": []
  }
 },
 "transitions": {
  "columns": [
   {
    "key": "target",
    "name": "対象"
   },
   {
    "key": "op",
    "name": "操作"
   },
   {
    "key": "from",
    "name": "変更前の状態"
   },
   {
    "key": "to",
    "name": "変更後の状態"
   },
   {
    "key": "roles",
    "name": "権限"
   },
   {
    "key": "pre",
    "name": "前提"
   },
   {
    "key": "after",
    "name": "後始末"
   },
   {
    "key": "undo",
    "name": "取消の方法"
   }
  ],
  "rows": [
   {
    "target": "工事（進める）",
    "op": "登録する",
    "from": "なし",
    "to": "見積中",
    "roles": "営業",
    "pre": "工事名、施主、工事場所、工事種別、営業担当、見積金額、着工予定日、完工予定日が入っている",
    "after": "工事番号を採番する",
    "undo": "なし",
    "roleKeys": [
     "eigyo"
    ]
   },
   {
    "target": "工事（進める）",
    "op": "受注にする",
    "from": "見積中",
    "to": "受注",
    "roles": "営業",
    "pre": "受注金額（見積中に入れた値が初期値）、受注日、工事担当、実行予算（当初、4費目）が入っている",
    "after": "受注金額、受注日を記録する。実行予算（当初）を固定する",
    "undo": "受注から見積中に戻す",
    "roleKeys": [
     "eigyo"
    ]
   },
   {
    "target": "工事（進める）",
    "op": "着工する",
    "from": "受注",
    "to": "施工中",
    "roles": "工事担当",
    "pre": "着工日が受注日以後",
    "after": "着工日を記録する",
    "undo": "施工中から受注に戻す",
    "roleKeys": [
     "tanto"
    ]
   },
   {
    "target": "工事（進める）",
    "op": "施主検収を登録する",
    "from": "施工中",
    "to": "検収済",
    "roles": "工事担当",
    "pre": "施主検収日が着工日以後",
    "after": "施主検収日を記録する",
    "undo": "検収済から施工中に戻す",
    "roleKeys": [
     "tanto"
    ]
   },
   {
    "target": "工事（進める）",
    "op": "施主に請求する",
    "from": "検収済",
    "to": "請求済",
    "roles": "経理",
    "pre": "施主検収日がある。施主請求日が施主検収日以後",
    "after": "施主請求日、請求額（一括）を記録する",
    "undo": "請求済から検収済に戻す",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "工事（進める）",
    "op": "完了にする",
    "from": "請求済",
    "to": "完了",
    "roles": "経理",
    "pre": "入金日が施主請求日以後。その工事の通常と追加の発注が全て 検収済・取消・打切 のどれかで、発注ごとに有効な発注検収の累計と確認済の請求額の合計が一致している。起票のままの減額発注が無い。受付のままの請求が無い",
    "after": "入金日（一括）を記録する",
    "undo": "完了から請求済に戻す",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "工事（戻す）",
    "op": "状態を1つ戻す",
    "from": "完了",
    "to": "請求済",
    "roles": "経理",
    "pre": "なし",
    "after": "入金日を消す",
    "undo": "完了にする",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "工事（戻す）",
    "op": "状態を1つ戻す",
    "from": "請求済",
    "to": "検収済",
    "roles": "経理",
    "pre": "なし",
    "after": "施主請求日、請求額を消す",
    "undo": "施主に請求する",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "工事（戻す）",
    "op": "状態を1つ戻す",
    "from": "検収済",
    "to": "施工中",
    "roles": "経理",
    "pre": "なし",
    "after": "施主検収日を消す",
    "undo": "施主検収を登録する",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "工事（戻す）",
    "op": "状態を1つ戻す",
    "from": "施工中",
    "to": "受注",
    "roles": "経理",
    "pre": "その工事に、有効な発注検収、確認済の請求、計上済の労務費が無い",
    "after": "着工日を消す",
    "undo": "着工する",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "工事（戻す）",
    "op": "状態を1つ戻す",
    "from": "受注",
    "to": "見積中",
    "roles": "営業",
    "pre": "その工事に発注が1件も無い（起票のままと取消の物も数える）。取消以外の予算改定が無い",
    "after": "受注金額、受注日を消す。実行予算（当初）は値を残し、固定を外す",
    "undo": "受注にする",
    "roleKeys": [
     "eigyo"
    ]
   },
   {
    "target": "発注",
    "op": "起票する",
    "from": "なし",
    "to": "起票",
    "roles": "工事担当",
    "pre": "工事が受注か施工中。予算を超えるときは予算超過の理由",
    "after": "起票者、起票日＝操作した日。発注日は空",
    "undo": "取り消す（起票のまま）",
    "roleKeys": [
     "tanto"
    ]
   },
   {
    "target": "発注",
    "op": "追加発注を起票する",
    "from": "なし",
    "to": "起票",
    "roles": "工事担当",
    "pre": "元の発注が承認済か検収済の通常の発注。取引先と費目は元の発注と同じ。工事が受注か施工中。予算を超えるときは予算超過の理由",
    "after": "関連発注番号に元の発注番号を入れる",
    "undo": "取り消す（起票のまま）",
    "roleKeys": [
     "tanto"
    ]
   },
   {
    "target": "発注",
    "op": "減額発注を起票する",
    "from": "なし",
    "to": "起票",
    "roles": "工事担当",
    "pre": "元の発注が承認済（一部検収を含む）。金額は負で、絶対値は元の発注の未検収残まで。工事が受注か施工中",
    "after": "関連発注番号に減らす対象の発注番号を入れる",
    "undo": "取り消す（起票のまま）",
    "roleKeys": [
     "tanto"
    ]
   },
   {
    "target": "発注",
    "op": "修正依頼する",
    "from": "起票",
    "to": "起票",
    "roles": "購買",
    "pre": "なし",
    "after": "依頼の文言必須。状態は変えず、履歴に「修正依頼」と文言を残す",
    "undo": "再提出する",
    "roleKeys": [
     "kobai"
    ]
   },
   {
    "target": "発注",
    "op": "再提出する",
    "from": "起票",
    "to": "起票",
    "roles": "工事担当",
    "pre": "修正依頼を受けている",
    "after": "直した内容（予算超過の理由など）の変更前と変更後を履歴に残す",
    "undo": "なし",
    "roleKeys": [
     "tanto"
    ]
   },
   {
    "target": "発注",
    "op": "承認する",
    "from": "起票",
    "to": "承認済",
    "roles": "購買",
    "pre": "承認の時点の予算と発注済で予算超過を判定し直し、超過なら予算超過の理由が入っている（無ければ承認できず、修正依頼で戻す）。減額発注は絶対値が元の発注の未検収残以下",
    "after": "承認者、発注日＝承認した日。以後、発注金額、取引先、費目は変えない。減額発注は元の発注の有効発注額を下げ、元の発注の累計が有効発注額に達すれば元の発注は検収済に移る",
    "undo": "取り消す（承認済）。金額を変えるときは追加発注か減額発注",
    "roleKeys": [
     "kobai"
    ]
   },
   {
    "target": "発注",
    "op": "検収で達する",
    "from": "承認済",
    "to": "検収済",
    "roles": "自動",
    "pre": "通常と追加の発注で、発注検収の累計が有効発注額に達した",
    "after": "なし",
    "undo": "発注検収の取消か訂正で承認済に戻る",
    "roleKeys": []
   },
   {
    "target": "発注",
    "op": "検収の取消や訂正で戻る",
    "from": "検収済",
    "to": "承認済",
    "roles": "自動",
    "pre": "発注検収の取消か訂正で、累計が有効発注額を下回った",
    "after": "なし。打切の発注は打切のまま",
    "undo": "なし",
    "roleKeys": []
   },
   {
    "target": "発注",
    "op": "未検収残を打ち切る",
    "from": "承認済（一部検収）",
    "to": "打切",
    "roles": "購買",
    "pre": "発注検収の累計が0より大きく有効発注額より小さい。受付のままの請求が無い",
    "after": "理由必須。未検収残を0にする。検収済の額はそのまま残る",
    "undo": "なし",
    "roleKeys": [
     "kobai"
    ]
   },
   {
    "target": "発注",
    "op": "取り消す（起票のまま）",
    "from": "起票",
    "to": "取消",
    "roles": "工事担当",
    "pre": "なし",
    "after": "理由必須",
    "undo": "なし",
    "roleKeys": [
     "tanto"
    ]
   },
   {
    "target": "発注",
    "op": "取り消す（承認済）",
    "from": "承認済",
    "to": "取消",
    "roles": "購買",
    "pre": "有効な発注検収が無い。受付のままの請求と確認済の請求が無い",
    "after": "理由必須",
    "undo": "なし",
    "roleKeys": [
     "kobai"
    ]
   },
   {
    "target": "発注検収",
    "op": "登録する",
    "from": "なし",
    "to": "有効",
    "roles": "工事担当、購買",
    "pre": "発注が承認済（未検収残がある）。検収日が未締めの月で、発注日以後。検収額が1円以上で未検収残以下",
    "after": "発注の累計が増え、達したら発注が検収済になる",
    "undo": "検収日の月が未締めなら取り消す。締め済なら訂正（マイナス額）を登録する",
    "roleKeys": [
     "tanto",
     "kobai"
    ]
   },
   {
    "target": "発注検収",
    "op": "取り消す",
    "from": "有効",
    "to": "取消",
    "roles": "工事担当、購買",
    "pre": "発注が承認済・検収済・打切のどれか。検収日の月が未締め。取り消した後の累計が、その発注の確認済の請求額以上",
    "after": "理由必須。元の記録は消さない。累計が減り、検収済の発注は累計が有効発注額を下回ると承認済に戻る。打切の発注は打切のまま",
    "undo": "なし（正しい額で登録し直す）",
    "roleKeys": [
     "tanto",
     "kobai"
    ]
   },
   {
    "target": "発注検収",
    "op": "訂正する（マイナス額）",
    "from": "なし",
    "to": "有効",
    "roles": "工事担当、購買",
    "pre": "発注が承認済・検収済・打切のどれか。訂正元の検収日の月が締め済。検収日は未締めの月。額は負で、絶対値は訂正元の額（既にある訂正の分を引いた残り）まで。訂正後の累計が、その発注の確認済の請求額以上",
    "after": "訂正元の検収番号を持つ。締め済の月の数字は変えず、訂正は検収日の月に入る。検収済の発注は累計が有効発注額を下回ると承認済に戻る。打切の発注は打切のまま",
    "undo": "検収日の月が未締めなら取り消す",
    "roleKeys": [
     "tanto",
     "kobai"
    ]
   },
   {
    "target": "請求",
    "op": "受付する",
    "from": "なし",
    "to": "受付",
    "roles": "経理",
    "pre": "発注は 承認済・検収済・打切 の通常と追加の発注から選ぶ（起票、取消、減額発注は選べない）。日付の制限は無い",
    "after": "受付日＝操作した日。判定をすぐ出す",
    "undo": "取り消す、または差し戻す",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "請求",
    "op": "確認する",
    "from": "受付",
    "to": "確認済",
    "roles": "経理",
    "pre": "判定が「確定できる」。確認のダイアログで計上月を選ぶ（締め済の月は選べない）",
    "after": "確認者、確認日＝実際に確認した日（操作した日）、計上月。過月分ならその旨を履歴に残す",
    "undo": "なし",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "請求",
    "op": "差し戻す",
    "from": "受付",
    "to": "差戻し",
    "roles": "経理",
    "pre": "なし",
    "after": "理由必須（取引先へ返却したことと理由）",
    "undo": "修正版が届いたら再受付する",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "請求",
    "op": "再受付する",
    "from": "なし",
    "to": "受付",
    "roles": "経理",
    "pre": "元の請求が差戻し",
    "after": "関連する受付番号に元の受付番号",
    "undo": "取り消す、または差し戻す",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "請求",
    "op": "取り消す",
    "from": "受付",
    "to": "取消",
    "roles": "経理",
    "pre": "なし",
    "after": "理由必須。重複の解消のときは、履歴の関連する番号に正本の受付番号",
    "undo": "なし",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "予算改定",
    "op": "起案する",
    "from": "なし",
    "to": "起案",
    "roles": "工事担当",
    "pre": "工事が受注か施工中。同じ工事の同じ費目に、起案のままの改定が無い",
    "after": "改定前の額にその時点の予算（今の値）を入れる",
    "undo": "取り消す（起案のまま）",
    "roleKeys": [
     "tanto"
    ]
   },
   {
    "target": "予算改定",
    "op": "承認する",
    "from": "起案",
    "to": "承認済",
    "roles": "営業",
    "pre": "なし",
    "after": "承認者、改定日＝承認した日。改定日から予算（今の値）に入る",
    "undo": "新しい改定を起案する",
    "roleKeys": [
     "eigyo"
    ]
   },
   {
    "target": "予算改定",
    "op": "取り消す（起案のまま）",
    "from": "起案",
    "to": "取消",
    "roles": "工事担当、営業",
    "pre": "なし",
    "after": "理由必須",
    "undo": "なし",
    "roleKeys": [
     "tanto",
     "eigyo"
    ]
   },
   {
    "target": "労務費の計上",
    "op": "計上する",
    "from": "未計上",
    "to": "計上済",
    "roles": "経理",
    "pre": "計上日がその月の中の日付で、未締めの月",
    "after": "計上者、計上日。金額＝時間×単価（円未満切り捨て）",
    "undo": "未締めの月なら直す",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "労務費の計上",
    "op": "直す",
    "from": "計上済",
    "to": "計上済",
    "roles": "経理",
    "pre": "計上日の月が未締め",
    "after": "変更前と変更後を履歴に残す",
    "undo": "なし",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "月次の締め",
    "op": "締める",
    "from": "未締め",
    "to": "締め済",
    "roles": "経理",
    "pre": "その月の末日が基準日より前。前の月が締め済（4月は3月の繰越で満たす）。請求書の日付がその月以前で受付のままの請求が無い（差戻しと取消は止めない）。その月に施工中だった工事の労務費が全て計上済",
    "after": "締めた回数を履歴に残す。納期を過ぎて未検収の発注と起票のままの発注は警告に出すが止めない",
    "undo": "締め解除する",
    "roleKeys": [
     "keiri"
    ]
   },
   {
    "target": "月次の締め",
    "op": "締め解除する",
    "from": "締め済",
    "to": "未締め",
    "roles": "経理",
    "pre": "直近の締め済の月（後の月が締め済でない）。3月（繰越）は解除できない",
    "after": "理由必須",
    "undo": "もう一度締める（条件を判定し直す）",
    "roleKeys": [
     "keiri"
    ]
   }
  ],
  "notes": {
   "工事（戻す）": [
    "1回に1段だけ戻す。理由は必須。確認を出してから戻す。",
    "発注、発注検収、請求、予算改定は状態を戻さない。直しは取消、打切、訂正、修正依頼、差戻し、再受付で行い、元の記録は残す。"
   ],
   "発注": [
    "一部検収の間は「承認済（一部検収）」と表示する。",
    "取消と打切の後は編集できない。"
   ],
   "発注検収": [
    "締め済の月の発注検収は取り消せない。直すときは当月の日付で訂正（マイナス額）を登録する。"
   ],
   "請求": [
    "判定は 二重の疑い、発注検収なし、検収額を超えている、確定できる の順に見て、最初に当たった物を出す。"
   ]
  }
 },
 "permissions": {
  "columns": [
   {
    "key": "eigyo",
    "name": "営業"
   },
   {
    "key": "tanto",
    "name": "工事担当"
   },
   {
    "key": "kobai",
    "name": "購買"
   },
   {
    "key": "keiri",
    "name": "経理"
   }
  ],
  "rows": [
   {
    "op": "工事の登録・基本情報の編集（施工中以後は工事担当、完工予定日、備考だけ）",
    "eigyo": "○",
    "tanto": "×",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "受注金額の入力（見積中）",
    "eigyo": "○",
    "tanto": "×",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "受注金額の変更（受注後、理由必須）",
    "eigyo": "×",
    "tanto": "×",
    "kobai": "×",
    "keiri": "○"
   },
   {
    "op": "工事を受注に進める",
    "eigyo": "○",
    "tanto": "×",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "工事を受注から見積中に戻す",
    "eigyo": "○",
    "tanto": "×",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "着工・施主検収の登録",
    "eigyo": "×",
    "tanto": "○",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "施主請求・入金の登録",
    "eigyo": "×",
    "tanto": "×",
    "kobai": "×",
    "keiri": "○"
   },
   {
    "op": "工事の状態を1つ戻す（受注から見積中を除く）",
    "eigyo": "×",
    "tanto": "×",
    "kobai": "×",
    "keiri": "○"
   },
   {
    "op": "予算改定の起案",
    "eigyo": "×",
    "tanto": "○",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "予算改定の承認",
    "eigyo": "○",
    "tanto": "×",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "予算改定の取消（起案のまま）",
    "eigyo": "○",
    "tanto": "○",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "発注の起票・再提出（追加発注・減額発注を含む。工事が受注か施工中のとき）",
    "eigyo": "×",
    "tanto": "○",
    "kobai": "×",
    "keiri": "×"
   },
   {
    "op": "発注の承認・修正依頼",
    "eigyo": "×",
    "tanto": "×",
    "kobai": "○",
    "keiri": "×"
   },
   {
    "op": "発注の取消",
    "eigyo": "×",
    "tanto": "起票のままの物",
    "kobai": "承認済の物",
    "keiri": "×"
   },
   {
    "op": "未検収残の打切",
    "eigyo": "×",
    "tanto": "×",
    "kobai": "○",
    "keiri": "×"
   },
   {
    "op": "発注検収の登録・取消・訂正",
    "eigyo": "×",
    "tanto": "○",
    "kobai": "○",
    "keiri": "×"
   },
   {
    "op": "請求の受付・確認・差戻し・再受付・取消",
    "eigyo": "×",
    "tanto": "×",
    "kobai": "×",
    "keiri": "○"
   },
   {
    "op": "労務費の計上",
    "eigyo": "×",
    "tanto": "×",
    "kobai": "×",
    "keiri": "○"
   },
   {
    "op": "取引先の登録・編集",
    "eigyo": "施主のみ",
    "tanto": "×",
    "kobai": "仕入先・外注先",
    "keiri": "×"
   },
   {
    "op": "月次の締め・解除",
    "eigyo": "×",
    "tanto": "×",
    "kobai": "×",
    "keiri": "○"
   }
  ],
  "rules": [
   "操作の権限は役割の単位で決める。同じ役割なら誰が操作してもよい。",
   "起票と承認は別の役割にする。発注は工事担当が起票して購買が承認する。予算改定は工事担当が起案して営業が承認する。"
  ],
  "visibility": [
   {
    "items": [
     "受注金額",
     "粗利（発生原価ベース）"
    ],
    "roles": [
     "eigyo",
     "keiri"
    ]
   },
   {
    "items": [
     "支払条件",
     "確認済で支払予定の額",
     "支払予定日"
    ],
    "roles": [
     "kobai",
     "keiri"
    ]
   }
  ],
  "disabledMessages": [
   "承認は購買のみ",
   "発注の起票は工事担当のみ",
   "起票できるのは受注か施工中の工事だけ",
   "基本情報の編集は営業のみ",
   "請求の確認は経理のみ",
   "承認後は金額を変えられません。増やすときは追加発注、減らすときは減額発注を起票します",
   "発注検収が無いため確認できません"
  ]
 },
 "scenes": {
  "budgetOver": {
   "title": "予算を超えている工事",
   "kouji": "26-005",
   "order": "26-005-04",
   "cat": "外注費",
   "url": "app.html#/kouji/26-005?role=keiri&reset=1"
  },
  "closedMonth": {
   "title": "締めた月に入力しようとした",
   "order": "26-007-03",
   "date": "2026-07-15",
   "url": "app.html#/kenshu?hacchu=26-007-03&date=2026-07-15&role=tanto&reset=1"
  },
  "duplicate": {
   "title": "同じ発注に請求が2本",
   "order": "26-007-01",
   "invoices": [
    "R-0106",
    "R-0110"
   ],
   "url": "app.html#/seikyu?focus=R-0106&role=keiri&reset=1"
  },
  "noInspection": {
   "title": "検収していないのに請求",
   "order": "26-010-02",
   "invoice": "R-0111",
   "url": "app.html#/seikyu?focus=R-0111&role=keiri&reset=1"
  },
  "ipponmichi": {
   "title": "操作の流れ",
   "kouji": "26-011",
   "cat": "外注費",
   "url": "app.html#/hacchu/new?kouji=26-011&role=tanto&reset=1"
  }
 }
};
