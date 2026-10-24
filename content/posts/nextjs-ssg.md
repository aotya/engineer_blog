---
title: 【Next.js】App Routerにおける SSGの実装方法
date: '2026-07-13T03:15:04'
modified: '2026-07-13T03:15:04'
categories:
  - nextjs
  - coding
excerpt: Next.js App RouterでSSG（静的サイト生成）を行う際、動的セグメントの実装をパターン別に説明しています
eyecatch: /images/uploads/2026/07/13031430/nextjs-ssg.webp
---
Next.js App RouterでSSG（静的サイト生成）を行う際、動的セグメント（`[slug]` や `[page]`）ごとに `generateStaticParams` を実装する必要があります。

このとき、URL構造がシンプルか複雑かによって実装パターンが変わってきます。この記事では、よく遭遇する3つのパターンを整理します。

## 前提条件

-   ・**Next.js 15以降**を前提とします。`params: Promise<{…}>` のようにPromiseでラップされているのは、Next.js 15でparamsが非同期化された仕様に対応するためです。Next.js 14以前を使っている場合は `params: { slug: string }` のように同期的な型になります。
-   ・`blogCategory`、`fetchBlogListPage`、`fetchBlogListByCategory`、`fetchPopularArticles`、`PAGINATION_PER_PAGE` などはサンプルのために用意した仮の定義です。実際にはカテゴリー一覧を返すオブジェクトや、記事一覧をページ単位で取得するAPIクライアント関数などに置き換えて読んでください。
-   ・この記事で紹介する `dynamicParams = true` によるオンデマンド生成は、サーバーが稼働している環境（VercelやNode.jsサーバーでのホスティングなど）を前提としています。`next.config.js` で `output: ‘export’` を指定した完全静的エクスポートを使う場合、`dynamicParams` によるオンデマンド生成はできず、事前生成しなかったパスはビルド後にアクセスすると404になります。静的エクスポート運用を検討している場合は、この記事の「応用」部分は適用できない点にご注意ください。

## パターン1：動的パラメーターが1つ、分岐なし

最もシンプルなケースです。`[slug]` という1つの動的パラメーターに対して、生成元のデータソースが1種類しかなく、分岐処理が不要な場合です。

```
type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const categories = Object.keys(blogCategory);

  return categories.map((slug) => ({ slug }));
}
```

**ポイント**

-   ・データソース（ここでは `blogCategory` のキー）が1つだけなので、単純に `map` して `{ slug }` の配列を返すだけで完結します。
-   ・分岐がないため、可読性・保守性ともに高く、迷ったらまずこの形を目指すのが良いでしょう。

## パターン2：/slug/ は1つの動的パラメーターだが、生成元が複数種類ある（分岐あり）

URLの形自体は `[slug]` の1階層のみですが、「カテゴリー一覧ページのslug」と「記事詳細ページのslug」のように、**異なる種類のリソースが同じ動的パラメーターの中に混在する**ケースです。

```
type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  // 1. カテゴリー一覧由来のslug
  const categorySlugs = Object.keys(blogCategory).map((slug) => ({ slug }));

  // 2. 記事一覧由来のslug（ページネーションを全件取得してから記事IDに変換）
  const firstPage = await fetchBlogListPage(1);
  const totalPages = Math.ceil(firstPage.c / PAGINATION_PER_PAGE);
  const remainingPageNumbers = Array.from(
    { length: Math.max(0, totalPages - 1) },
    (_, i) => i + 2
  );
  const remainingPages =
    remainingPageNumbers.length > 0
      ? await Promise.all(remainingPageNumbers.map((page) => fetchBlogListPage(page)))
      : [];
  const allPages = [firstPage, ...remainingPages];
  const articleSlugs = allPages
    .flatMap((page) => page.l)
    .map((article) => ({ slug: `p_${article.wp_article_id}` }));

  // 3. 2種類のslugを結合して返す
  return [...categorySlugs, ...articleSlugs];
}
```

**ポイント**

-   ・型（`Props`）としては `slug: string` の1つだけですが、**中身の生成ロジックは2系統**に分かれます。
    -   ・カテゴリー由来：`Object.keys()` で同期的に取得できるので単純な `map`。
    -   ・記事由来：ページネーションAPIをすべて叩いて全記事を取得し、`p_${記事ID}` のような接頭辞付きslugに変換。
-   ・記事一覧は1ページ目を先に取得して総ページ数を計算し、2ページ目以降は `Promise.all` で並列取得しています。件数が多い場合はAPI側のレート制限に注意が必要です（具体的な対策は後述）。
-   ・最後に `flatMap` でページごとの配列をフラット化してから `map` で必要な形に変換し、`categorySlugs` と `articleSlugs` を配列展開でマージしています。
-   ・アプリ側のルーティング（`page.tsx` 内など）では、`slug` が `p_` から始まるかどうかで「記事詳細」か「カテゴリー一覧」かを判定する分岐処理が別途必要になります。

### 応用：dynamicParams による部分事前生成

パターン2のように記事一覧を全件取得してビルド時に静的化しようとすると、記事数が多いサイトではビルド時間が非常に長くなることがあります。その場合、<span class="marker">アクセスの多い記事だけを事前生成し、残りはリクエスト時にオンデマンドで生成する</span>という設計がよく使われます。

```
export async function generateStaticParams() {
  const categorySlugs = Object.keys(blogCategory).map((slug) => ({ slug }));

  // 全件ではなく、人気記事や新着記事だけを事前生成する
  const popularArticles = await fetchPopularArticles({ limit: 100 });
  const articleSlugs = popularArticles.map((article) => ({
    slug: `p_${article.wp_article_id}`,
  }));

  return [...categorySlugs, ...articleSlugs];
}

// 事前生成していない記事はリクエスト時にサーバー側で生成し、以降はキャッシュされる
export const dynamicParams = true;
```

-   ・`generateStaticParams` で返さなかった `slug` にアクセスがあった場合、`dynamicParams: true`（デフォルト）ならサーバー稼働環境では404にはせず、初回アクセス時にサーバー側で生成してキャッシュしてくれます（前提条件に記載の通り、`output: ‘export’` の完全静的エクスポートでは機能しません）。逆にビルド後に増えるはずのないURL構成であれば `dynamicParams = false` を指定して404にする、という制御もできます。
-   ・カテゴリーは件数が少なく変化も少ないため全件事前生成し、記事は件数が多く増え続けるため一部だけ事前生成する、というように**データソースの性質に応じて事前生成の範囲を変える**のがポイントです。
-   ・パターン3（カテゴリー×ページ）でも同様に、各カテゴリーの先頭数ページだけ事前生成し、それ以降のページは `dynamicParams = true` に任せる、という使い方が可能です。

## パターン3：動的パラメーターが2つ（/slug/page/count）

`[slug]/[page]` のように、**階層をまたいで複数の動的パラメーターが存在する**ケースです。カテゴリーごとのページネーション一覧などが典型例です。

```
type Props = {
  params: Promise<{
    page: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const paramsArrays = await Promise.all(
    Object.keys(blogCategory).map(async (slug) => {
      const { c: totalCount } = await fetchBlogListByCategory(slug, 1);
      const totalPages = Math.ceil(totalCount / PAGINATION_PER_PAGE);

      const categoryParams: { slug: string; page: string }[] = [];
      for (let p = 2; p <= totalPages; p++) {
        categoryParams.push({ slug, page: String(p) });
      }
      return categoryParams;
    })
  );

  return paramsArrays.flat();
}
```

**ポイント**

-   ・`Props` の `params` に `slug` と `page` の2つが入っているのが、パターン1・2との大きな違いです。
-   ・外側のループは「カテゴリーごと」、内側のループは「そのカテゴリーの2ページ目以降」という**二重構造**になっています。
    -   ・`Object.keys(blogCategory).map(async (slug) => …)` でカテゴリーを1つずつ処理。
    -   ・各カテゴリーで総件数を取得し、`for` ループで `page` ごとの `{ slug, page }` を組み立てる。
-   ・カテゴリーごとの処理は互いに独立しているため、`Promise.all` で並列化し、`await` してから最後に `flat()` で二次元配列を一次元化しています。カテゴリー数が多い場合は同時リクエスト数が跳ね上がるため、次の「レート制限対策」も参考にしてください。
-   ・1ページ目は多くの場合カテゴリーページ自体（`[slug]` のみのルート）でカバーされるため、`p = 2` からループを開始している点も実務上のポイントです（1ページ目を含めるかどうかはルーティング設計に依存します）。

### レート制限対策について

パターン2・3のように `Promise.all` で多数のAPIリクエストを一気に並列実行すると、APIサーバー側のレート制限に引っかかることがあります。代表的な緩和策は以下の通りです。

-   ・**同時実行数を制限する**：`p-limit` や `p-queue` などのライブラリを使い、「常に最大5件まで並列」のように上限を設けて `Promise.all` を実行する。
-   ・**逐次実行に切り替える**：件数がそれほど多くない場合は、`Promise.all` の代わりに `for…of` ループの中で `await` する形にして、確実にリクエスト間隔を空ける。
-   ・**リトライ処理を入れる**：429（Too Many Requests）などのレスポンスを受け取った場合に、指数バックオフで再試行するロジックを挟む。

いずれの方法もビルド時間とのトレードオフになるため、記事数やAPI側の制限値を見ながら調整するのがおすすめです。

### 応用：親子で generateStaticParams を分担する

パターン3では「カテゴリー」と「ページ番号」を1つの関数の中で二重ループにして結合していましたが、ルートが `[category]/[page]/page.tsx` のように**親子関係になっている場合**は、Next.js側の仕組みを使って分担できます。

```
// app/[category]/page.tsx（親）
export async function generateStaticParams() {
  return Object.keys(blogCategory).map((slug) => ({ slug }));
}
```

```
// app/[category]/[page]/page.tsx（子）
// 引数の params は、親の generateStaticParams が返した配列の要素が
// 1件ずつ渡ってくる（つまり { slug: string } は親の返り値の型と対応している）
export async function generateStaticParams({
  params,
}: {
  params: { slug: string };
}) {
  const { c: totalCount } = await fetchBlogListByCategory(params.slug, 1);
  const totalPages = Math.ceil(totalCount / PAGINATION_PER_PAGE);

  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}
```

<span class="marker">Next.jsが親子の組み合わせを自動的に掛け合わせてくれる</span>ため、パターン3のように自前で外側・内側の二重ループを書く必要がなくなります。子セグメントの `generateStaticParams` は、親（`[category]/page.tsx`）が返した `slug` を1件ずつ受け取り、そのカテゴリーの総ページ数だけ計算すればよくなります。

ただし、親子でそれぞれAPIを叩くことになるため、カテゴリー数が多い場合はリクエスト回数が増える点がトレードオフです。

**自前で二重ループを書く（パターン3本体） vs 親子で分担する（応用）の比較**

| 観点 | 自前の二重ループ | 親子分担 |
| --- | --- | --- |
| コードの見通し | 1関数に処理が集約されるが、ネストが深くなりがち | 各ファイルの責務が分かれ、個々はシンプル |
| APIリクエスト回数 | 比較的少なく抑えやすい（まとめて設計しやすい） | 親と子で別々に叩くため増えやすい |
| 適したケース | ルートが実際にはディレクトリとして分かれていない、または1箇所で完結させたい場合 | \[category\]/\[page\]/page.tsx のように物理的に親子ディレクトリが分かれている場合 |

「URLの階層が実際にディレクトリとして分かれているか」「1つの関数で完結させたいか」で、どちらが適しているか判断すると良いでしょう。

## 3パターンの比較

| パターン | 動的パラメーター数 | データソース | 特徴 |
| --- | --- | --- | --- |
| 1 | 1つ（slug） | 1種類 | 単純な map のみ、分岐なし |
| 2 | 1つ（slug） | 2種類以上 | 生成元ごとにロジックを分け、最後に配列を結合 |
| 3 | 2つ（slug, page） | カテゴリー × ページ | 二重ループ（Promise.all + for）で全組み合わせを網羅 |

## まとめ

**設計判断の指針**

-   ・パラメーターが1つでも「値の生成元が複数ある」場合はパターン2のように分岐・結合の設計が必要になります。
-   ・パラメーターが2つ以上ある場合は、パターン3のように「外側のキー（カテゴリー）ごとに内側の値（ページ番号）を展開する」という二重構造で考えると整理しやすいです。
-   ・ルートが実際にディレクトリとして親子関係にある場合は、自前で二重ループを書くよりも「親子で `generateStaticParams` を分担する」応用パターンの方がコードがシンプルになることがあります。リクエスト回数とのトレードオフで選びましょう。
-   ・<span class="marker">output: ‘export’ による完全静的エクスポートを使う場合は dynamicParams によるオンデマンド生成が使えない</span>ため、事前生成の範囲設計がより重要になります。

**パフォーマンス上の注意**

-   ・記事のように件数が多くビルド時間が問題になるデータソースは、「主要なものだけ事前生成し、残りは `dynamicParams = true` でオンデマンド生成に任せる」応用パターン（パターン2）でビルド時間とキャッシュヒット率のバランスを取れます。
-   ・外部APIへのアクセスは可能な限り `Promise.all` でまとめて並列化することで、ビルド時間の短縮につながります。ただし同時実行数が多すぎるとAPI側のレート制限に引っかかるため、`p-limit` などによる同時実行数の制御やリトライ処理も検討しましょう。
