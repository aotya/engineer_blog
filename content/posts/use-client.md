---
title: 【Next.js】’use client’の役割と挙動
date: '2026-07-13T03:13:41'
modified: '2026-07-13T03:13:41'
categories:
  - nextjs
  - coding
excerpt: >-
  Next.jsの’use
  client’は本当にSPA化する機能なのか？実はサーバー側で先にHTMLを生成し、後からJavaScriptを注入する「ハイドレーション」という仕組みで動いています。SSG/SSRで挙動が変わらない理由、ビルドエラーを防ぐための正しい配置方法まで分かりやすく解説します
eyecatch: /images/uploads/2026/07/13031313/use_client.webp
---
ユーザーの操作に応じて画面を更新したり、APIを呼び出したりする場合は、`‘use client’` で対応することになりますが、Next.js側でどのように対応しているのかを説明したいと思います。

特にSSGなどでは、正しく`‘use client’` を使用しないとビルドエラーにもなりますし、一方で理解不足で使用するとSSG/SSRのメリットを失うこともあるので注意が必要です。

## ‘use client’ も最初は「サーバーでHTML化」されている

`‘use client’` を使用すると、動的な動きができるようになることから、SPAと同じような挙動になるため、jsで画面が作成されると思うかもしれません。しかし、実際はSSG/SSRでもサーバーからHTML化されてファイルが送信されてきます（SSGなら事前生成されたファイルが）。

純粋なReactで作った従来のSPAは、サーバーからは空っぽに近いHTMLと大量のJavaScriptが送られてきて、ブラウザ側でイチから画面を組み立てます。そのため、初期ロード時は画面が真っ白になったり、ローディングスピナーが出たりします（詳しくは後述の比較表を参照）。

## 「ハイドレーション」の仕組み

裏側では、以下のようなステップが踏まれています。

1\. **サーバー側で完全なHTMLを作る**\
Next.jsは、Server Componentだけでなく、Client Componentも一緒に実行して、画面全体の見た目が完成した静的HTMLを作ります（この時点ではボタンを押しても動きません）。

2\. **ブラウザへHTMLを最速で届ける**\
ユーザーがアクセスすると、完成済みのHTMLが送られます。JavaScriptの実行を待たずに画面が表示されるため、ユーザー体験が向上し、クローラーも正しくコンテンツを読み取れます。

3\. <strong>後からJavaScriptを注入する（ハイドレーション）</strong>\
画面が表示された直後、ブラウザが裏側で `‘use client’` 用のJavaScriptをダウンロードします。そして、表示されている静的なHTMLに「クリックイベント（`onClick`）」や「状態管理（`useState`）」を後付けで結びつけます。

乾いたHTMLに、後からJSの水分を行き渡らせて生き返らせる。この処理を<span class="marker">ハイドレーション（Hydration）</span>と呼びます。

## 比較表：何がどう違うのか？

| 特徴 | Server Component (デフォルト) | Client Component (‘use client’) | 従来のSPA (純粋なReact) |
| --- | --- | --- | --- |
| 初回のHTML生成 | サーバーで行う | サーバーで行う | ブラウザで行う（初期ロードは空に近いHTML） |
| JSの送信 | クライアント実行用のJSは送られない | クライアント側で必要なJSだけ送られる | アプリ全体のJSが送られる |
| Hooks / イベント | ❌ 使えない | ✅ 使える (useState, onClick等) | ✅ 使える |

## どんな時にビルドエラーになるのか

`‘use client’` の付け忘れは、以下のようなケースでビルドエラー（またはランタイムエラー）を引き起こします。

**Server Component内で`useState`や`onClick`などを使ってしまう**\
Server Componentはサーバー上でのみ実行されるため、ブラウザ側の状態管理やイベントハンドラを持てません。

<strong>`‘use client’` の付いていないファイルから`window`や`document`などのブラウザAPIを直接呼び出す</strong>\
サーバー環境には`window`が存在しないため、ビルド時または実行時にエラーになります。

```
// ❌ NG: 'use client' がないのに useState を使用（ビルドエラー）
export default function Counter() {
  const [count, setCount] = useState(0) // Error: useState is not supported in Server Components
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

```
// ✅ OK: 'use client' を宣言してからブラウザ機能を使う
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## SSGでもSSRでも、ハイドレーションの原則は同じ

「じゃあ、SSG（静的サイト生成）とSSR（サーバーサイドレンダリング）で、`‘use client’` の挙動は変わるの？」という疑問が湧くかもしれません。

結論から言うと、<span class="marker">SSGでもSSRでも「見た目（HTML）が先、脳みそ（JS）が後」というハイドレーションの流れは全く同じ</span>です。

唯一の違いは、「いつそのHTMLを作るか」というタイミングだけです。

-   ・**SSGの場合**：`next build` を実行した時（ビルド時）にHTMLを作っておく。いわば「作り置きのお弁当」。
-   ・**SSRの場合**：ユーザーがアクセスした時（リクエスト時）に最新データでHTMLを作る。いわば「注文を受けてから作る料理」。

どちらの手法であっても、「Next.jsのサーバー側で一度コンポーネントを実行し、完全なHTMLを作ってからブラウザに渡す」という大原則は揺らぎません。

## ‘use client’ はどこに配置すべきか

`‘use client’` を宣言したからといって、その部分が従来のSPAのように初期ロードで遅延したり、SEOに悪影響を与えたりすることはありません。Next.jsがよしなに事前レンダリングしてくれています。

とはいえ、アプリ全体を `‘use client’` にしてしまうと、送信されるJavaScriptの量が増え、パフォーマンス低下に繋がります。

```
// ❌ Bad: ページ全体をクライアント化してしまう
'use client'

export default function Page() {
  return (
    <div>
      <StaticHeader />
      <StaticFooter />
      <LikeButton /> {/* 本当に動的なのはここだけ */}
    </div>
  )
}
```

```
// ✅ Good: 動的な部分だけを末端コンポーネントとして切り出す
export default function Page() {
  return (
    <div>
      <StaticHeader />
      <StaticFooter />
      <LikeButton /> {/* このファイルの先頭だけに 'use client' を書く */}
    </div>
  )
}
```

「ユーザーの操作を受け付ける場所」や「状態を持つ場所」の末端（Leaf）にだけ、ピンポイントで`‘use client’` を配置する。

これが、Next.jsのパフォーマンスを最大限に引き出すためのベストプラクティスです。

## まとめ

-   ・`‘use client’` を付けても、初回のHTMLは必ずサーバー側で生成される（SPAとは違う）
-   ・表示後にJSが注入されてインタラクティブになる処理を「ハイドレーション」と呼ぶ
-   ・SSG/SSRの違いは「HTMLを作るタイミング」だけで、ハイドレーションの流れ自体は同じ
-   ・Server Component内で`useState`やブラウザAPIを使うとビルドエラーになる
-   ・`‘use client’` はコンポーネントツリーの末端に、必要な箇所だけピンポイントで配置するのがベストプラクティス
