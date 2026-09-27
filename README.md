# 株式会社 吉源商事 ホームページ

HTML、CSS、JavaScript の静的サイトです。GitHub Pages ではリポジトリの `main` ブランチのルートを公開します。PHP やビルド処理は必要ありません。

## 現行ページ

| ファイル | 内容 |
| --- | --- |
| `index.html` | トップ |
| `company.html` | 企業情報 |
| `products.html` | 取扱商品 |
| `facilities.html` | 設備・実例 |
| `contact.html` | 連絡先・アクセス |

## 管理するファイル

- `data/i18n.json`: 文章と各一覧の項目。同じ項目の中に日本語 (`ja`)、中国語 (`zh`)、英語 (`en`) を並べて管理します。言語によらない `id`、画像との対応名、リンクなどは共通値として1つだけ指定します。取扱商品の分類名と並び順は `products.groups`、各分類に含める商品は `itemIds` で管理します。分類目次のリンクを押すと、その分類IDに対応する商品だけを表示します。
- `data/site.json`: スライド画像と間隔、商品・設備の画像、各ページの背景、Google Map の検索住所。画像パスはサイトのルートからの相対パスです。
- `images/`: 画像ファイル。新しい商品写真は `images/photos/items/<品目>/`、設備・事業写真は `images/photos/services/` に置けます。使用するパスは `site.json` に指定します。
- `css/style.css`: デザイン。
- `js/i18n.js`: 2つの JSON を読み込み、文章・カード・画像・地図を表示します。
- `js/main.js`: ナビゲーション、スライダー、canvas、アニメーション。
- `tools/check-content.js`: JSON の項目IDと画像パスの検証。

## データの流れ

ブラウザが HTML を開くと `js/i18n.js` が `data/site.json` と `data/i18n.json` を取得します。`i18n.json` の各項目から選択言語 (`ja`、`zh`、`en`) の文章を取り出し、`site.json` の画像パスとは共通の `id` で対応付けて画面に表示します。その後 `js/main.js` がスライダーとアニメーションを開始します。言語ボタンを押すと、同じ項目から選択言語の文章を取り出して一覧を再描画します。

設備・実例ページでは `facilities.cases` の各項目を独立した `section` として生成します。上部の実例カードは各項目の `id` を使って、対応する詳細セクションへリンクします。各分類内の内容は `details` 配列で管理するため、同じ分類へ複数の内容を追加できます。

内容を編集したら、リポジトリのルートで `node tools/check-content.js` を実行してください。表示確認にはローカルの HTTP サーバーを使います。`file://` で直接開くと JSON の取得がブラウザに拒否されます。
