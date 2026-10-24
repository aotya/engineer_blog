---
title: Next.js で実現する View Transitions API 実装ガイド
date: '2026-03-11T13:05:38'
modified: '2026-03-11T13:11:41'
categories:
  - nextjs
  - coding
excerpt: >-
  Next.js 16とReact 19で実験的サポートされたView Transitions
  APIの実装方法を解説。next.config.tsの設定から、ViewTransitionコンポーネントを使った一覧・詳細ページの実装、CSSアニメーションの調整まで、コードサンプル付きでわかりやすく紹介します。
eyecatch: /images/uploads/2026/03/11130520/nextjs-view-transitions-api.webp
---
ブログの一覧ページにあるアイキャッチ画像のある記事から詳細ページに遷移する時に、記事一覧のアイキャッチ画像が詳細ページのアイキャッチ画像に移動するようなアニメーションを見たことがあると思います。

非常にモダンな動きをするので、実装してみたいと思うコーダーやフロントエンドエンジニアの方も多いのではないでしょうか？

実は、<span class="marker">View Transitions API</span> を使用すれば、簡単に実装することができます。

※ブラウザ依存の機能になるので、古いバージョンのブラウザなどではアニメーションが実行されず、普通に遷移することもあるので注意してください。

また、Next.jsの<span class="marker">View Transitions APIは実験的段階で、今後変更される可能性があります</span>が、あくまでも個人ブログといったバグが発生しても影響が少ないサイトで使用してください。

ここではNext.jsでの実装方法について説明していきたいと思います。

Next.js 16 では React 19 の機能が取り込まれ、ブラウザ標準の <span class="marker">View Transitions API</span> が実験的にサポートされています。

これを使うと、SPA（Single Page Application）のような滑らかなページ遷移アニメーションを、複雑なライブラリ（Framer Motionなど）を使わずに、<span class="marker">標準APIだけで実装</span>できます。

一覧ページから詳細ページに遷移することを想定した実装になります。方法は簡単で、コピペで大丈夫です。また、SSGでもSSRでも実装方法は同一です。

## 環境

-   Next.js: 16.1.6
-   React: 19.2.3
-   TypeScript: 5.x

## 実装方法

### 1\. next.config.ts の設定

まず、Next.js の設定ファイルで実験的機能を有効化します。

```
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
```

これにより、React の `ViewTransition` コンポーネントが利用可能になります。

### 2\. 一覧ページ（遷移元）の実装

一覧ページのカードコンポーネントで、遷移させたい要素（ここではサムネイル画像）を `<ViewTransition>` で囲みます。

重要なのは <span class="marker">name 属性</span> です。遷移元と遷移先で<span class="marker">一意かつ同じ名前</span>を指定することで、ブラウザが「この要素とあの要素は同じものだ」と認識し、自動的に補間アニメーションを行ってくれます。

```
import React, { ViewTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Cards({ data }) {
  return (
    <>
      {data.map((item) => (
        <Link href={`/blog/${item.id}`} key={item.id}>
          <ViewTransition name={`blog-image-${item.id}`}>
            <div className={styles.cardThumbnail}>
              <Image src={item.imagePath} alt={item.title} fill />
            </div>
          </ViewTransition>
        </Link>
      ))}
    </>
  );
}
```

### 3\. 詳細ページ（遷移先）の実装

詳細ページ側でも、対応する画像を同じ `name` を持つ `<ViewTransition>` で囲みます。遷移元と遷移先で<span class="marker">name の値を必ず一致させる</span>のがポイントです。

```
import React, { ViewTransition } from 'react';

export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <div className={styles.blogPage}>
      <section className={styles.thumbnailSection}>
        <h1>{project.title}</h1>

        <ViewTransition name={`blog-image-${project.id}`}>
          <div className={styles.imageContainer}>
            <Image
              src={project.imagePath}
              alt={project.title}
              fill
              className={styles.blogImage}
            />
          </div>
        </ViewTransition>
      </section>
    </div>
  );
}
```

## 4\. CSS でアニメーションを調整

最後に、グローバルCSSでトランジションの挙動を調整します。デフォルトでも動きますが、`animation-duration` や `animation-timing-function` をカスタマイズすると、より質感が高まります。

```
/* 遷移前の要素（Old）と遷移後の要素（New）のアニメーション設定 */
::view-transition-old(*),
::view-transition-new(*) {
  animation-duration: 0.35s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 要素の位置やサイズが変化する場合の補間設定 */
::view-transition-group(*) {
  animation-duration: 0.35s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 実装のポイントと注意点

### SSG / SSRでも動作する？

View Transitions API はブラウザの機能であり、Next.js の `Link` コンポーネントによるクライアントサイドナビゲーション時に発火するため、ページのレンダリング方式（SSG/SSR）には依存しません。

遷移先を事前に読み込むことでアニメーションが実行されます。<span class="marker">通常のaタグでは事前読み込みができないため、必ずLink コンポーネントで遷移するようにしてください。</span>

### ブラウザ対応状況

2026年現在、主要なモダンブラウザ（Chrome, Edge, Safari 18+）でサポートされていますが、Firefox など一部で未対応の場合があります。

未対応ブラウザでは単に通常のページ遷移になるだけ（プログレッシブ・エンハンスメント）なので、安心して導入できます。

### Experimental 機能

この機能は Next.js 16 / React 19 時点では <span class="marker">Experimental（実験的）</span> な機能です。API が変更される可能性があるため、プロダクション環境での利用はリスクを考慮した上で採用してください。

## まとめ

`next.config.ts` の設定と、`<ViewTransition>` コンポーネントで要素を囲むだけで、アプリのようなリッチな画面遷移が実現できました。

これまで複雑なライブラリが必要だった表現が、<span class="marker">標準機能だけで手軽に実装できる</span>のは大きな魅力です。

ぜひ試してみてください！
