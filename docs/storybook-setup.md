# Storybook + Chromatic セットアップまとめ

既存の Next.js 16 ブログに Storybook を同居させ、Chromatic で運営者限定に公開するためのセットアップ記録と運用手順です。

## 構成概要

- Next.js 16.1 / React 19.2 / Tailwind CSS v4 / Sass
- Storybook 10.5（フレームワーク: **`@storybook/nextjs-vite`（Vite版）**）
- 公開先: **Chromatic**（GitHub 権限と同期したアクセス制限で運営者限定公開・無料プランで可）

> Vite版を採用: Storybook init の自動検出どおり Vite版（`@storybook/nextjs-vite`）を使用。ビルド（`build-storybook`）・開発サーバー（`storybook dev`）ともに本プロジェクトで正常動作を確認済み。
>
> 補足: Next.js 16 + Vite の dev モードでは、`next/navigation` を使うコンポーネントで pre-bundle 起因の不具合報告があります（[storybook#34688](https://github.com/storybookjs/storybook/issues/34688)）。現状のサンプル（TopCard）は `next/link` / `next/image` のみ利用のため影響はありません。今後 `next/navigation`（`useRouter` など）を使うコンポーネントで問題が出た場合は、`.storybook/main.ts` の `viteFinal` で `optimizeDeps.include` に `next/navigation` を追加するワークアラウンドを検討してください。安定性を最優先する場合は Webpack版（`@storybook/nextjs`）への切り替えも可能です。

## 実施した対応

### 1. Storybook の初期化

- `npx storybook@latest init` を実行し、`.storybook/` と各種依存・スクリプトを生成（フレームワークは Vite版 `@storybook/nextjs-vite` が自動検出）。
- init が同梱する Vitest/Playwright 連携は本用途（カタログ公開）では不要なため削除して構成を軽量化。
  - 使用: `@storybook/nextjs-vite`, `vite`
  - 削除: `@storybook/addon-vitest`, `vitest`, `playwright`, `@vitest/browser-playwright`, `@vitest/coverage-v8`, および `vitest.config.ts`
- 自動生成のサンプル `src/stories/` を削除。

### 2. 設定ファイル

- `.storybook/main.ts`
  - `framework: '@storybook/nextjs-vite'`
  - `stories: ['../src/**/*.stories.@(ts|tsx)']`
  - `staticDirs: ['../public']`（`/logo.svg` など public 配下の静的ファイル参照用）
  - addons: `@chromatic-com/storybook`, `@storybook/addon-a11y`, `@storybook/addon-docs`
- `.storybook/preview.tsx`
  - `../src/app/globals.css`（Tailwind v4）と `../src/app/blog.scss` を読み込み、全 Story にグローバルスタイルを適用。
- パスエイリアス `@/*` と Tailwind v4（`postcss.config.mjs`）・SCSS は `@storybook/nextjs-vite` が自動解決するため追加設定は不要。

### 3. サンプル Story

- 対象: `src/components/elements/TopCard.tsx`
- 追加ファイル: `src/components/elements/TopCard.stories.tsx`
  - `TopCard` は `<li>` を返すため、`decorators` で `<ul className={styles.articleListContainer}>` にラップ。
  - `PostEdge` 型のモックデータを生成。`getChildCategory` がカテゴリの `uri` のスラッシュ数で判定するため、`uri` を適切に設定。
  - サムネイルはリモート画像プレースホルダ（`https://placehold.co/...`）を使用。`@storybook/nextjs-vite` の `next/image` は最適化オフで表示可能。
  - Controls を効かせるため `title` / `categoryName` / `date` / `imageUrl` を argTypes に分解し、`render` 内で `PostEdge` を組み立て。
  - ストーリー: `Default` と `LongTitle` の 2 種。

### 4. スクリプト・依存

`package.json` に追加:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic"
  }
}
```

- `chromatic` を devDependency に追加。
- `.gitignore` には `storybook-static` と `*storybook.log` を追記済み（init 時に自動追記）。

### 5. 動作確認

- `npm run build-storybook` 成功（`storybook-static/` を出力）。
- `npm run storybook` 起動確認（`http://localhost:6006/`、Tailwind/SCSS 適用済み、エラーなし）。

## ローカルでの利用

```bash
# 開発サーバー起動（http://localhost:6006）
npm run storybook

# 静的ビルド（storybook-static/ に出力）
npm run build-storybook
```

## Chromatic デプロイ手順（運営者限定公開）

### 前提

- Chromatic は Storybook メンテナ公式のホスティングサービス。
- **無料プラン**でホスティング・アクセス制限が利用可能（クレジットカード登録不要）。
- 課金対象は主にビジュアルテストの「スナップショット」。単に公開・閲覧する用途ではほぼ消費しない。

### 手順

1. [chromatic.com](https://www.chromatic.com) に **GitHub アカウント**でサインインする。
2. 対象リポジトリを選択して新規プロジェクトを作成し、**`project-token`** を取得する。
3. 初回公開（ローカルから）:

   ```bash
   npx chromatic --project-token=<取得したtoken>
   ```

   環境変数 `CHROMATIC_PROJECT_TOKEN` を設定していれば以下だけで実行可能:

   ```bash
   npm run chromatic
   ```

4. **アクセス制限（運営者限定）**:
   - Chromatic はリポジトリの権限と自動同期する。
   - プロジェクト設定の `Manage > Collaborators / Access` で Storybook を **Restricted（collaborator のみ閲覧可）** に設定すると、リポジトリにアクセス権のある運営者だけが閲覧できる。
   - 外部メンバーはメール招待でも追加可能。
5. **自動公開（任意）**:
   - GitHub Actions に Chromatic のワークフローを追加。
   - リポジトリの Secrets に `CHROMATIC_PROJECT_TOKEN` を登録すると、push ごとに自動デプロイされる。

   ワークフロー例（`.github/workflows/chromatic.yml`）:

   ```yaml
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

### 補足: Vercel を使わない理由

- Storybook のビルド成果物（`storybook-static`）は純粋な静的ファイルのため、Next.js の middleware（Basic 認証など）は効かない。
- Vercel で「運営者限定」を実現するには有料プラン（Deployment Protection）が必要。
- Chromatic なら無料でアクセス制限が実現できるため、本要件では Chromatic を採用。
