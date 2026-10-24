---
title: React の cache 関数：SSG・SSR・ISR での使い方と注意点
date: '2026-03-14T00:23:22'
modified: '2026-03-14T00:23:22'
categories:
  - nextjs
  - coding
excerpt: Next.jsで使うReactのcache関数を徹底解説！fetchキャッシュとの違いや、SSG・SSR・ISRでの動作の仕組みをやさしくまとめました。
eyecatch: /images/uploads/2026/03/14002302/cache.webp
---
React 19から使用できるようになった、`cache`の使用方法を備忘も兼ねてまとめてみました。

`fetch` のキャッシュ設定とは何が違うのか、SSG・SSR・ISR それぞれでどう動くのかを整理しているので、気になる方は目を通してみてください。

## React cache とは

`cache` は React 19 で安定版になった、<span class="marker">同一レンダーリクエスト内で関数の結果をメモ化する</span>仕組みです。

同じ引数で同じ関数が複数回呼ばれた場合、2回目以降は実際の処理を実行せず最初の結果を返します。

```
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});
```

上記のように関数を `cache()` でラップするだけで使えます。

これによって、例えばメインコンテンツとヘッダーなどで同一の通信を実行する関数を実行しても1回で済ませることができます。

そのため、通信量を抑えたり、ビルドの時間を短縮させることができます。

## Next.js fetch のキャッシュとの違い

混同しやすいので先に整理します。

-   ・**fetchのcache: force-cache**：Next.js の Data Cache（リクエスト間をまたいで永続化される）
-   ・<strong>React cache()</strong>：同一レンダー内のみ有効なメモ化（リクエストをまたがない）

また、`fetch` の Data Cache は <span class="marker">GET リクエストが主な対象</span>です。GraphQL のような POST リクエストには効きません。

POST リクエストのキャッシュには `React cache()` が正しい選択肢になります。

## 使い方の基本

### 複数のコンポーネントから同じデータを取得する場合

同じページ内の `generateMetadata` とページコンポーネントが同じデータを取得するケースが典型例です。

```
import { cache } from 'react';

export const getArticle = cache(async (slug: string) => {
  const res = await fetch(`https://example.com/api/articles/${slug}`, {
    method: 'POST',
    body: JSON.stringify({ slug }),
  });
  return res.json();
});
```

```
// page.tsx

export async function generateMetadata({ params }) {
  const data = await getArticle(params.slug); // 1回目：実際に fetch が走る
  return { title: data.title };
}

export default async function Page({ params }) {
  const data = await getArticle(params.slug); // 2回目：cache が返す（fetch は走らない）
  return <article>{data.content}</article>;
}
```

`cache` がなければpage.tsxで同じデータを2回 fetch で取得することになります。

## SSG・SSR・ISR での動作の違い

### SSG（ビルド時の静的生成）

`generateStaticParams` を定義したページは `next build` 実行時に静的 HTML として生成されます。

```
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const data = await getArticle(params.slug); // cache 1回目
  return { title: data.title };
}

export default async function Page({ params }) {
  const data = await getArticle(params.slug); // cache 2回目（fetch 不要）
  return <article>{data.content}</article>;
}
```

SSGは静的画面になるので、恩恵を受けるのはビルド時のみになります。

-   **メリット**：1ページのビルド中に同じ関数を複数回呼んでも fetch は1回で済む
-   **注意点**：ページをまたいだキャッシュは効かない。記事A と記事B のビルドは別々の実行コンテキストなので、それぞれ fetch が走る

### SSR（リクエストごとのサーバーサイドレンダリング）

`generateStaticParams` なし、または `export const dynamic = ‘force-dynamic’` を指定したページはリクエストのたびにサーバーでレンダーされます。

```
export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
  const data = await getUser(params.id);
  return <div>{data.name}</div>;
}
```

SSRはSSGと異なり、遷移の度にリクエストが実行されるので、SSGよりもキャッシュの恩恵を受けることができます。

-   **メリット**：同一リクエスト内で複数コンポーネントが同じデータを使う場合に fetch を削減できる。ユーザー認証情報など、リクエストごとに変わるデータにも安全に使える
-   **注意点**：リクエストをまたいだキャッシュは効かない。ユーザーAとユーザーBのリクエストで同じ関数を呼んでも、それぞれ別の fetch が走る

<div class="cautionContainer"><span class="cautionLabel">注意点</span><p></p><p>React cache の有効範囲は「同一レンダーリクエスト内のみ」になります。もし、頻繁に更新されないならSSGにする、またはキャッシュの永続があるfetchのキャッシュを利用することも検討しましょう</p></div>

### ISR（増分静的再生成）

`revalidate` を設定したページは、指定した秒数が経過すると次のリクエスト時にバックグラウンドで再生成されます。

```
export const revalidate = 60; // 60秒ごとに再生成

export async function generateMetadata({ params }) {
  const data = await getArticle(params.slug); // cache 1回目
  return { title: data.title };
}

export default async function Page({ params }) {
  const data = await getArticle(params.slug); // cache 2回目（fetch 不要）
  return <article>{data.content}</article>;
}
```

ISR の再生成は内部的には SSR と同じ仕組みで動くため、`cache` の有効範囲は <span class="marker">1回の再生成処理内のみ</span>です。

-   **メリット**：再生成中に複数箇所で同じデータを取得しても fetch を削減できる
-   **注意点**：再生成のたびに cache はリセットされる。前回の再生成で取得したデータは引き継がれない

## cache を使うべき場面

-   ・同一ページの `generateMetadata` とページ本体で同じ fetch をしている
-   ・複数の Server Components が同じデータを参照している
-   ・POST リクエストで取得したデータを使い回したい

## cache を使っても意味がない場面

-   ・その関数を同一レンダー内で1箇所からしか呼ばない
-   ・GET リクエストで `fetch` の Data Cache（`force-cache`）で十分な場合

## まとめ

各レンダリング戦略における `cache` の位置づけをまとめると以下になります。

-   **SSG**：1ページのビルド内で同じ関数の重複 fetch を防ぐ
-   **SSR**：1リクエスト内で同じ関数の重複 fetch を防ぐ
-   **ISR**：1回の再生成処理内で同じ関数の重複 fetch を防ぐ

「同一リクエスト内でデータを使い回したい」という場面にピンポイントで効く仕組みなので、用途を理解した上でうまく活用してください。

<div class="cautionContainer"><span class="cautionLabel">注意点</span><p></p><p>React cache の有効範囲は「同一レンダーリクエスト内のみ」です。ページをまたいだり、リクエストをまたいだりしてキャッシュが効くわけではありません。</p></div>
