# 株式会社 吉源商事 ホームページ

HTML、CSS、JavaScript の静的サイトです。GitHub Pages ではリポジトリの `main` ブランチのルートを公開します。PHP やビルド処理は必要ありません。

## 現行ページ

| ファイル | 内容 |
| --- | --- |
| `index.html` | トップ |
| `company.html` | 企業情報 |
| `products.html` | 取扱商品 |
| `facilities.html` | 設備・実例 |
| `gallery.html` | 写真 |
| `contact.html` | 連絡先・アクセス |

## 管理するファイル

- `data/i18n.json`: 日本語 (`ja`)、中国語 (`zh`)、英語 (`en`) の文章と各一覧の項目。各項目の `id` は3言語で共通にします。
- `data/site.json`: スライド画像と間隔、商品・設備・ギャラリーの画像、各ページの背景、Google Map の検索住所。画像パスはサイトのルートからの相対パスです。
- `images/`: 画像ファイル。新しい商品写真は `images/photos/items/<品目>/`、設備・事業写真は `images/photos/services/` に置けます。使用するパスは `site.json` に指定します。
- `css/style.css`: デザイン。
- `js/i18n.js`: 2つの JSON を読み込み、文章・カード・画像・地図を表示します。
- `js/main.js`: ナビゲーション、スライダー、canvas、アニメーション。
- `tools/check-content.js`: JSON の項目IDと画像パスの検証。
- `archive/legacy/`: 旧デザインの参照用ファイル。現行サイトでは使用しません。

`business.html` と旧 `items/`・`services/` のURLは、現行ページへの転送を残しています。

## データの流れ

ブラウザが HTML を開くと `js/i18n.js` が `data/site.json` と `data/i18n.json` を取得します。`site.json` の画像パスと、選択言語の `i18n.json` の文章を `id` で対応付けて画面に表示します。その後 `js/main.js` がスライダーとアニメーションを開始します。言語ボタンを押すと、選択言語の文章と一覧を再描画します。

内容を編集したら、リポジトリのルートで `node tools/check-content.js` を実行してください。表示確認にはローカルの HTTP サーバーを使います。`file://` で直接開くと JSON の取得がブラウザに拒否されます。
