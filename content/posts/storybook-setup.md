---
title: Next.jsのStoryBookのセットアップ方法
date: '2026-08-01T12:04:35'
modified: '2026-08-01T12:04:48'
categories:
  - nextjs
  - coding
excerpt: >-
  既存のNext.jsブログにStorybookを導入し、Chromaticで運営者限定に公開する手順を解説。インストールからpreview.ts/main.tsの設定、コンポーネントのStory作成例、アクセス制限の設定まで初心者向けにステップごとに紹介します。
eyecatch: /images/uploads/2026/08/01120410/storybook_setup.webp
---
既存の Next.js ブログに Storybook を導入し、Chromatic で運営者限定に公開するまでの手順を、初心者の方でも迷わず進められるようにステップごとに解説します。

## Storybook とは？なぜ導入するの？

Storybook は、UI コンポーネントを Next.js アプリ本体を起動せずに、単体で表示・確認できる「コンポーネントカタログ」を作るためのツールです。

-   ・ボタンやカードなど、一つのコンポーネントだけを様々な状態（Props の値）で見比べられる
-   ・デザイナーやチームメンバーに、実装済みのコンポーネントを共有しやすくなる
-   ・Controls という GUI で Props の値を変更しながら見た目を確認できる

今回は、これを**Chromatic**というサービスにデプロイし、リポジトリの権限を持つ人（運営者）だけが<span class="marker">見られるカタログサイトとして公開する</span>ところまで進めます。

## 今回の前提環境

下記のフレームワーク・バージョンで環境構築をしています。

| 項目 | 内容 |
| --- | --- |
| フレームワーク | Next.js 16.1 |
| UI ライブラリ | React 19.2 |
| スタイリング | Tailwind CSS v4 ＋ Sass（SCSS Modules） |
| Storybook | 10.5（@storybook/nextjs-vite = Vite 版） |
| 公開先 | Chromatic（無料プランでアクセス制限が可能） |

* * *

## Step 1: Storybook をインストール（初期化）する

プロジェクトのルートディレクトリで、以下のコマンドを実行します。

```
npx storybook@latest init
```

これを実行すると、次のことが自動で行われます。

-   ・使用中のフレームワーク（Next.js）を自動検出し、必要なパッケージ（`storybook`, `@storybook/nextjs-vite` など）を`package.json`に追加
-   ・`.storybook/`ディレクトリと設定ファイルの生成
-   ・動作確認用のサンプル Story（`src/stories/`配下）の生成
-   ・`package.json`に`storybook` / `build-storybook`スクリプトの追加

```
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

初期化直後は、テスト連携用の`@storybook/addon-vitest`や`playwright`なども一緒にインストールされる場合があります（ターミナルでインストールする確認されます）。今回のように「コンポーネントカタログとして公開する」用途だけであれば、Noを選択してもいいですが、面倒なら一旦全てYesにしてもOKです。

それほど、ファイルが重いわけでもないので、気にしなくてOKです。

## Step 2: 生成されたディレクトリ構成を確認する

初期化が終わると、プロジェクトの構成は次のようになります。

```
blog/
├── .storybook/
│   ├── main.ts        ← Storybook全体の設定（addon、対象ファイルなど）
│   └── preview.tsx    ← 全Story共通の設定（グローバルCSSの読み込みなど）
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   └── blog.css
│   ├── components/
│   │   └── elements/
│   │       ├── Card.tsx
│   │       └── Card.stories.tsx   ← ここにサンプルStoryを作成する
│   └── stories/        ← 自動生成されたサンプル（不要なら削除可）
└── package.json
```

※srcファイルに配置しているcssファイルと、`Card.tsx`は今回storybookのカタログで表示させるためのコンポーネントになります。

※ボタンでも何でもOKです。storybookで管理したいコンポーネントファイルを適当に作成しておいてください（作成せずに、`stories.tsx`だけでもOK）。

ポイントは以下の2点です。

-   ・設定ファイルは`.storybook/`にまとまっている
-   ・Story ファイル（`*.stories.tsx`）は、対象コンポーネントと**同じディレクトリに置く**のがおすすめです。コンポーネントの隣にあることで、後から見つけやすくなります。
-   ・`stories/`は自動サンプルになるので不要なら削除してください

※ストーリーブック全体の設定をする`main.ts`などは次のステップで紹介します。

## Step 3: 既存プロジェクトの設定を Storybook に読み込ませる

Storybook はアプリ本体とは別のミニ環境で動くため、既存プロジェクトの CSS やパスエイリアスを明示的に読み込ませる必要があります。

### 3-1. グローバル CSS を読み込む（.storybook/preview.tsx）

Tailwind CSS や CSS の変数など、ページ全体に効かせているスタイルを、すべての Story に反映させる設定です。

```
// .storybook/preview.tsx
import '../src/app/globals.css';
import '../src/app/blog.css';
import type { Preview } from '@storybook/nextjs-vite';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;
```

`css`を先頭で`import`するだけで、すべての Story に本体と同じスタイルが適用されます。

### 3-2. Storybook の対象ファイル・addonを設定する（.storybook/main.ts）

```
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
};

export default config;
```

-   ・`stories`: どこにある`*.stories.tsx`を Storybook の対象にするかを指定（今回の例は`src`配下でソースを管理しているケースを想定した記述になっています）
-   ・`staticDirs`: `/logo.svg`のような`public`配下の静的ファイルを Story 内で参照できるようにする設定

## Step 4: 既存コンポーネントのサンプル Story を作成する

今回は、記事一覧に使われているカード型コンポーネント`TopCard`を例に Story を作ります。

下記については、あくまでもサンプルになります。サンプルを参考にして、storybookのカタログに表示させるコンポーネントを作成してみてください。

```
// src/components/elements/TopCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import TopCard from './TopCard';
import topStyles from '../page/Top.module.scss';
import type { PostEdge } from '../../../lib/helpers/apiType';

type TopCardArgs = {
  title: string;
  categoryName: string;
  date: string;
  imageUrl: string;
};

// TopCardが受け取るPostEdge型のダミーデータを組み立てるヘルパー
const buildItem = ({ title, categoryName, date, imageUrl }: TopCardArgs): PostEdge => ({
  cursor: 'cursor-1',
  node: {
    id: '1',
    postId: '1',
    slug: 'sample-post',
    title,
    date,
    content: '',
    categories: {
      nodes: [{ name: categoryName, slug: 'react', uri: '/coding/react/' }],
    },
    featuredImage: {
      node: { sourceUrl: imageUrl },
    },
  },
});

const meta: Meta<TopCardArgs> = {
  title: 'Elements/TopCard',
  component: TopCard,
  parameters: {
    layout: 'padded',
  },
  // TopCardは<li>を返すため、<ul>でラップしてあげる
  decorators: [
    (Story) => (
      <ul className={topStyles.articleListContainer} style={{ maxWidth: 360 }}>
        <Story />
      </ul>
    ),
  ],
  // ここで指定した項目がStorybook画面のControlsパネルに表示される
  argTypes: {
    title: { control: 'text', description: '記事タイトル' },
    categoryName: { control: 'text', description: 'カテゴリ名' },
    date: { control: 'date', description: '投稿日' },
    imageUrl: { control: 'text', description: 'サムネイル画像URL' },
  },
  render: (args) => <TopCard item={buildItem(args)} />,
};

export default meta;

type Story = StoryObj<TopCardArgs>;

export const Default: Story = {
  args: {
    title: 'Next.js 16 で Storybook を導入する',
    categoryName: 'React',
    date: '2026-07-16',
    imageUrl: 'https://placehold.co/600x400?text=Blog',
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Tailwind CSS v4 と SCSS Modules を併用しながらコンポーネントカタログを整備する方法',
    categoryName: 'Frontend',
    date: '2026-07-01',
    imageUrl: 'https://placehold.co/600x400?text=Long+Title',
  },
};
```

作成のポイントを整理します。

-   ・`argTypes`: `title` / `categoryName` / `date` / `imageUrl`のように、Controls パネルで動かしたい値を分解して定義すると、Storybook 画面上で GUI から値を変えられるようになります
-   ・`decorators`: 親要素が必要なケースで使用します。サンプルでは、`<li>`タグを返す仕様なので、そのままだと本来のレイアウトになりません。親の`<ul>`でラップする`decorators`を使うことで、実際の見た目に近い状態で確認できます
-   ・**複数の Story**（`Default` / `LongTitle`）: タイトルが長い場合など、異なるパターンを複数の Story として用意しておくと、レイアウト崩れのチェックにも役立ちます

サムネイル画像は、実在する画像がなくても`https://placehold.co/…`のようなプレースホルダー画像サービスを使うと手軽に確認できます。

## Step 5: 動作確認する

ここまで設定できたら、実際に起動して確認しましょう。

```
# 開発サーバーを起動（http://localhost:6006 で確認）
npm run storybook

# 静的ファイルとしてビルド（storybook-static/ に出力される）
npm run build-storybook
```

`npm run storybook`を実行し、ブラウザで`http://localhost:6006`を開くと、左側のサイドバーに`Elements/TopCard`が表示され、`Default`と`LongTitle`の2つの Story を選んで確認できます。

## Step 6: Chromatic にデプロイして運営者限定で公開する

最後に、作成したカタログをインターネット上に公開します。今回は無料でアクセス制限まで設定できる**Chromatic**を使います。

### 6-1. Chromatic にサインインしてプロジェクトを作成

-   1\. [chromatic.com](https://www.chromatic.com)に**GitHub アカウント**でサインインする
-   2\. 対象リポジトリを選んで新規プロジェクトを作成し、`project-token`を取得する

installしていないなら下記を実行してください。

※基本的にChromaticの設定は指示が表示されます。そのため、7-1と7-2は飛ばしてもOKです。

```
npm install --save-dev chromatic
```

### 6-2. ローカルから初回公開する

```
npx chromatic --project-token=<取得したtoken>
```

`package.json`に以下を追加しておくと、環境変数`CHROMATIC_PROJECT_TOKEN`を設定した状態で`npm run chromatic`だけで公開できます。

```
{
  "scripts": {
    "chromatic": "chromatic"
  }
}
```

### 6-3. 運営者限定に設定する

Chromatic はリポジトリの GitHub 権限と自動で同期します。プロジェクト設定の`Manage > Collaborators / Access`から Storybook を`Restricted`（コラボレーターのみ閲覧可）に設定すると、リポジトリへのアクセス権を持つ<span class="marker">運営者だけが閲覧できるようになります</span>。外部メンバーへはメール招待で追加も可能です。

### 6-4.（任意）GitHub Actions で自動公開する

`push`するたびに自動でデプロイされるようにしたい場合は、以下のようなワークフローを追加します。

```
# .github/workflows/chromatic.yml
name: Chromatic

on: push

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

リポジトリの Secrets に`CHROMATIC_PROJECT_TOKEN`を登録しておくのを忘れないようにしましょう。

* * *

## 補足: 色などの動的なスタイルをどう扱うか

Story で状態ごとの見た目を並べていると、「Props の値に応じて色を変えたい」場面が出てきます。このとき「CSS ファイルのクラス」「Tailwind」「`style`で直接指定」のどれを使うべきか迷いますが、<span class="marker">値のパターンが有限か無限か</span>で判断すると整理しやすいです。

-   ・**パターンが有限なら、クラスを事前に全部用意する**: `status`が`draft` / `published`のように取りうる値が決まっているなら、`.cardDraft`のようなクラスを CSS 側に用意しておき、JS 側は条件分岐で「どのクラスを当てるか」だけを決めます。色そのものの値は CSS ファイルに閉じたままになり、スタイルを CSS ファイルに集約する方針とも合致します。
-   ・**本当に無限に変わる値は CSS 変数で渡す**: ユーザーが自由にテーマカラーを設定できるなど、事前にクラスを列挙できない場合は、CSS 変数（カスタムプロパティ）の値だけを`style`で渡します。「見た目のルール」は CSS ファイル側に残るため、`style`にプロパティをベタ書きするのとは区別できます。

```
// 値（CSS変数）だけをJSから渡す
<div className={styles.card} style={{ '--card-accent': accentColor } as React.CSSProperties}>
```

```
// 実際のプロパティ適用はCSSファイル側に書く
.card {
  border-color: var(--card-accent, var(--app-border));
}
```

| 状況 | 推奨アプローチ |
| --- | --- |
| 色のパターンが数種類（ステータス別など） | CSS 側に全パターンのクラスを定義し、JS で条件分岐してクラス名を切り替える |
| 色が理論上無限（ユーザー指定・API 任意値など） | CSS 変数の値だけを style で渡し、プロパティ適用は CSS ファイル側に書く |

* * *

## まとめ

| Step | 内容 |
| --- | --- |
| 1 | npx storybook@latest init で初期化 |
| 2 | .storybook/ と \*.stories.tsx の配置を確認 |
| 3 | preview.tsx / main.ts で既存の CSS 設定を読み込む |
| 4 | 不要なテスト連携パッケージを削除（任意） |
| 5 | 既存コンポーネントに .stories.tsx を作成 |
| 6 | npm run storybook / npm run build-storybook で確認 |
| 7 | Chromatic にデプロイし、アクセス制限をかけて公開 |

Storybook を使うと、コンポーネント単位で見た目や Props の挙動を素早く確認できるようになり、デザインレビューやチーム内共有もぐっとやりやすくなります。

まずは 1 つのコンポーネントから Story を作ってみて、慣れてきたらボタンやタグなどの小さな UI パーツにも広げていくのがおすすめです。
