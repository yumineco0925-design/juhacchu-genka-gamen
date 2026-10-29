架空の会社の資料です（自主制作）

# 設備工事会社の受発注と原価の画面設計（自主制作）

設備工事の会社で、工事ごとの発注、発注検収、請求の確認、労務費の計上、月次の締めを扱う業務画面の設計です。

会社名は青嶺設備工業株式会社（架空）で、工事名、取引先名も全て架空です。

## 自作した物

- 業務整理の文書7つ（聞き取りのメモ、帳票のサンプル、業務整理、画面の一覧と遷移、項目の定義、画面ごとの意図、道具とスプレッドシート版）
- 業務画面8枚を1ページで切り替えるアプリ（HTML、CSS、JavaScript）
- サンプルデータを作る Python と、そのデータを業務の決まりごとに照らして検査する Python
- 工事別の原価表の xlsx
- スプレッドシート版の例（Google Apps Script）
- 文書に載せた図（SVG 4枚）

設計から実装、検証まで AI（Claude Code）を使って進め、サンプルデータの生成と整合の検査は Python の道具で行いました。

実在する企業の業務、データ、資料は使っていません。

## どこから見るか

index.html を開き、先頭の「見る順番」のとおりに進めてください。

時間があれば、続けて「操作の流れ」を試してください。予算を超える発注から月次の締めまでを、役割を切り替えながら1件の工事で確かめられます。

## 開き方

- index.html をブラウザで直接開きます。サーバーは要りません。
- 外部への通信はしません。データは assets/data.js から読みます。
- 画面での変更はブラウザのタブの中にだけ残り、タブを閉じると最初の状態に戻ります。

## フォルダの構成

| パス | 中身 |
|---|---|
| index.html | 入口。見る順番、操作の流れ、例外の場面、設計の資料、作り方 |
| app.html | 業務画面。8画面を1ページで切り替える |
| assets/style.css | 業務画面の見た目 |
| assets/app.js | 状態、権限、決まりごとの判定、金額の計算、画面の切り替え |
| assets/data.js | サンプルデータ、項目の定義、状態遷移の定義、例外の場面の番号 |
| assets/screens/ | 画面ごとの処理 |
| docs/01_kikitori.html | 聞き取りのメモ |
| docs/02_chohyo.html | 帳票のサンプル（発注書、原価表） |
| docs/02_genka_sample.xlsx | 工事別の原価表 |
| docs/03_gyomu_seiri.html | 業務整理 |
| docs/04_gamen_ichiran.html | 画面の一覧と遷移、状態遷移の表 |
| docs/05_koumoku.html | 項目の定義 |
| docs/06_gamen_ito.html | 画面ごとの意図 |
| docs/07_dougu.html | 道具とスプレッドシート版（Python、Google Apps Script） |
| docs/docs.css | 文書の見た目 |
| docs/img/ | 文書に載せた図 |
| tools/make_data.py | assets/data.js を作る |
| tools/check_rules.py | assets/data.js を業務の決まりごとに照らして検査する |
| tools/make_xlsx.py | 原価表の xlsx を作る |
| tools/sheet/ | スプレッドシート版の例（Code.gs と、入れ方の README.md） |

## tools の使い方

Python 3 で動きます。make_xlsx.py だけ openpyxl が要ります。

```
pip install openpyxl
```

どのフォルダから実行しても、読み書きする場所は tools の1つ上のフォルダが基準です。下の例は、この README.md のあるフォルダで実行する形です。

サンプルデータ assets/data.js を作り直します。乱数の種は固定です。

```
python tools/make_data.py
```

assets/data.js を検査し、項目ごとに合格か不合格かと、該当の番号を出します。不合格が1件でもあれば終了コード1で終わります。

```
python tools/check_rules.py
```

工事ごと、費目ごとの予算、発注済、発生原価、計上額も出すときは --table を付けます。

```
python tools/check_rules.py --table
```

公開してはいけない語の一覧のファイルを --words で渡すと、site の全ファイルにその語が無いかも調べます。語そのものは出しません。

```
python tools/check_rules.py --words 一覧のファイル
```

assets/data.js から、原価表 docs/02_genka_sample.xlsx を作り直します。

```
python tools/make_xlsx.py
```

## スプレッドシート版

tools/sheet/Code.gs は、締め済の月に入る編集を止め、予算超過を一覧にする Google Apps Script の例です。スプレッドシートのメニューに「原価管理」が加わります。

入れ方とシートの構成は tools/sheet/README.md にあります。

## 断り

公開されている情報と一般的な商慣行をもとにした自主制作です。

実在する企業の業務、データ、資料は使っていません。

確認が要る事柄は、決めつけずに分けてあります。
