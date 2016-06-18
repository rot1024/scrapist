# Scrapist

cheerio-httpcli をベースとした、Node.js の Web スクレイピングモジュール

単体ページだけでなく、その子ページや兄弟ページなど、複数ページに渡るスクレイピングを、簡潔な記述で行うことができます。

- 簡潔な記述で、木構造の複数ページをまとめてスクレイピング
- サーバーの負担を考慮して、同時リクエスト数やリクエスト間の時間を設定可能
- スクレイピングに失敗した場合の、再試行回数や再試行までの時間を設定可能
- 好きなスクレイピングモジュールでも利用可能

※ Node.js v4 以上のみ対応

## 使い方

### インストール

```sh
npm install scrapist --save
```

### 使い方

スクレイピングしたいWebサイトに合わせて、スクレイピング方法を以下のように記述します。

```js
const Scrapist = require("scrapist").Scrapist;

const scrapist = new Scrapist({

  // 最初に取得するページのURL（例）
  rootUrl: "https://github.com",

  pages: [
    // 最初に取得するページに適用する関数
    {
      resToData(result) {
        // 取得内容から必要なデータを返します。
        // cheerio-httpcli と同じようにスクレイピングできます。
        return { link: result.$("a").text() };
      },
      resToChildren(result) {
        // 子ページのURLの配列を返します。
        // 子ページには、pagesの2番目の関数が適用されます。
        return [ /* 子ページのURL */ ];
      },
      resToSiblings(result) {
        // 新たに取得する必要がある兄弟ページのURLの配列を返します。
        return [ /* 兄弟ページのURL */ ];
      }
    },

    // 子ページに適用する関数
    {
      resToData() { return { /* ... */ }; },
      resToChildren() { return [ /* ... */ ]; }
    }

    // 孫ページに適用する関数

    // ...
  ]

});
```

スクレイピングを開始するには、 `scrape` メソッドをコールします。
全ページのスクレイピングが完了すると、全ページのスクレイピング結果がまとめて Promise に渡されます。

```js
scrapist.scrape().then(result => {
  // ...
});
```

## CLI

npm で `-g` をつけてインストールすると、ターミナルで `scrapist` コマンドからスクレイピングが利用可能になります。

- `--scheme`: [必須] `scheme` のファイルパス。
- `--config`: `config` のファイルパス。
- `--param`: `scrape` メソッドの `param` に相当する値を指定できます。
- `--output` : JSON形式の結果の出力先ファイルパス。省略すると結果を標準出力へ流します。

※ `--scheme` と `--config` では、 `module.exports = { ... };` のように記述されたjsファイルを指定できます。

例:

```sh
scrapist --scheme google.js --output result.json
```

## API

以下のようにインポートできます。

```js
var Scrapist = require("scrapist").Scrapist;
import Scrapist from "scrapist";
```

### new Scrapist(scheme[, config])

ページ構造の記述や設定を保持するクラス。`scheme` と `config` の詳細は下記を参照して下さい。

#### scrape([param], [config])

スクレイピングを実行します。`scheme` によっては `param` の指定が必要です。
`config` を指定すると、`Scrapist` のコンストラクタで指定した `config` を上書きすることができます
（`scrapist` の `config` にマージされます）。

---

### scheme

スクレイピングしたいWebサイトの構造に関する記述です。以下のキーを持つオブジェクトです。

#### rootUrl : string|function(any) => string [必須]

一番最初に取得するページのURLを `string` で指定します。
`function` を設定することもでき、`scrape` メソッドに渡された引数から、最初に取得するURLを返す関数として、スクレイピング前にコールされます。

#### pages : array<object> [必須]

以下のオブジェクトからなる、ページのスクレイピング方法を記述する配列。

配列のインデックスは、ページの深さと対応します。
すなわち、一番最初に取得するページまたはその兄弟ページに対しては、1番目のオブジェクト内の関数等が適用されます。
その子ページに対しては2番目が、孫ページには3番目が…、という具合に適用されます。

```js
{
  resToData(result) {
    // result は { err, $, res, body } です（cheerio-httpcli の fetch の結果をそのまま渡してるだけ）
  },
  resToChildren(result) {

  },
  resToSiblings(result) {

  },
  siblingsIndex: 1
}
```

いずれも省略可能です。

- **resToData**: 取得結果から取得したいデータを返す関数。
- **resToChildren**: そのページから取得すべき子ページのURLの配列を返す関数。
- **resToSiblings**: そのページから更に取得すべき兄弟ページのURLの配列を返す関数。
- **siblingsIndex**: どの兄弟ページまで `resToSiblings` を呼び出すか、兄弟ページのインデックスで指定します。適切に指定されていないと、兄弟ページを取得する際に同時リクエストが効きません。`-1` が指定されているか `resToSiblings` が省略されている場合は無視されます。

#### after : function

全スクレイピング完了後に呼ばれるコールバック。以下の様な構造のデータが引数に渡されます。
これを基に、最終的に渡したいオブジェクトに加工して return することができます。
省略された場合、以下の様な構造の結果がそのまま渡されます。

```js
[
  {
    page: {
      data: { /* resToDataの結果 */ }
    },
    children: [
      {
        page: { data: { /* resToDataの結果 */ } },
        children: [ /* ... */ ],
        siblings: [ /* resToSiblingsの結果 */ ]
      },
      // ...
    ],
    siblings: [ /* resToSiblingsの結果 */ ]
  },
  // ...
]
```

---

### config

以下のキーを持つオブジェクトです。

#### concurrency : number

サーバーへのリクエストを同時にいくつまで並列して実行可能か指定します。デフォルト: `1`

値を上げるとスクレイピングを高速化できますが、サーバーに負荷をかけ過ぎないようにご注意下さい。

#### interval : number

1ページ取得する前に、何ミリ秒待つかを指定します。デフォルト: `1000`

値を下げるとスクレイピングを高速化できますが、サーバーに負荷をかけ過ぎないようにご注意下さい。

#### trial : number

取得エラーが発生した場合の、再試行回数。デフォルト: `1`

#### trialInterval : number|function(number) => number

取得エラーが発生した場合の、次の再試行まで待つミリ秒数。デフォルト: `1000`

関数を指定することもでき、その場合は、再試行回数を引数に、再試行までのミリ秒数を返す関数となります。

#### beforeFetch : function(url, page, siblings)

1つのページを取得する直前に呼ばれるコールバック。

#### onFetch : function(data, url, page, siblings)

1つのページを取得し、 `resToData` に通されたあとに呼ばれるコールバック。
結果をまとめてではなく随時保存したり、進捗を表示するなどの用途にお使いいただけます。

#### onError : function(err) => bool

取得中にエラーが発生した場合に呼ばれます。
`true` を返すと、設定内容に従ってスクレイピングの再試行を試みます。
それ以外の場合はそのまま `err` を throw します。

cheerio-httpcli を使う場合、デフォルトで設定されていますので、通常設定の必要はありません。

#### fetch : function(url) => Promise

デフォルトではサーバーへのリクエストおよびその結果を返すモジュールとして cheerio-httpcli を使用しますが、
他のモジュールや自作の関数を使いたい場合など、通常の動作を上書きしたい場合に指定して下さい。
この場合、再試行機能が有効になるよう `onError` も同時に指定して下さい。

Promise　の `resolve` に渡されたものがそのまま `resToData` `resToChildren` `resToSiblings` に渡される引数となります。
また、Promise の `reject` に渡されたものがそのまま `config` の `onError` に渡される引数となります。
