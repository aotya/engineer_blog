---
title: フロントエンドのci/cd：GitHub Actionsの簡単な自動テスト手法
date: '2026-06-20T13:31:09'
modified: '2026-06-20T13:31:09'
categories:
  - coding
  - test
excerpt: >-
  GitHub
  Actionsを使ったフロントエンドのCI/CD設定方法を解説します。Lint・型チェック・ユニットテスト・ビルドの4つの自動テストをyamlファイル1つで構築する手順と、複数Node.jsバージョン対応・手動実行・タイムアウト設定などの実践的な設定集も紹介します。
eyecatch: /images/uploads/2026/06/20133041/github_actions.webp
---
GitHub Actionsによってgithubで自動テストをするための、手法を簡単に説明したいと思います。

この記事で実行するテストとしては下記になります。

| ジョブ名 | 内容 |
| --- | --- |
| Lint | ESLint によるコード品質チェック |
| TypeCheck | TypeScript の型エラーチェック |
| Test | Vitest などによるユニットテスト |
| Build | Next.js のプロダクションビルド |

ジョブ名と内容を見れば、具体的にどのようなことをしているかは、分かると思います。

この4つは<span class="marker">最低限実行したいテスト</span>とされていますので、これからフロントエンドでテストを取り入れたい人は、この4つは入れるようにしましょう（Vitestなどによるユニットテストが難しいなら、せめてLintや型チェック、そしてビルドは対応しましょう）。

### GitHub Actionsを設定するためのファイル作成

ルートディレクトリから

`.github > workflows > ci.yml`

といったディレクトリ構成で`ci.yml`ファイルを作成してください。

githubは、このディレクトリ構成の`ci.yml`を見てciの設定を反映させます。

記載方法としては、

```
# main ブランチ向けの品質チェック（lint / 型 / テスト / ビルド）
name: CI

# main への push と、main をターゲットにした PR で実行
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# 各ジョブは並列実行（依存関係なし）
jobs:
  # ESLint などの静的解析
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm # package-lock.json を元に npm キャッシュ
      - run: npm ci
      - run: npm run lint

  # TypeScript の型チェック（tsc --noEmit 等）
  typecheck:
    name: TypeCheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run typecheck

  # ユニットテスト（CI 用スクリプト）
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:ci

  # 本番ビルドが通ることを確認
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
```

基本的に上記のテンプレートをコピペする方法で大丈夫です。

項目によって変える点としては

```
npm run lint
npm run typecheck
npm run test:ci
npm run build
```

上記のテスト実行のためのscriptになります。

こちらは、`package.json`に設定したコマンドを実行しているだけです。

なお、`test:ci` は `vitest run` を実行するコマンドです。通常の `test`（`vitest`）はファイル変更を監視するウォッチモードで起動するため、CI環境では終了せず処理が止まってしまいます。`vitest run` はウォッチモードを使わず一度だけテストを実行して終了するため、CI用のコマンドとして別途定義しています。

試してみたい人は、個人的に作成したフロントエンド用のテストを試すためのプロジェクトを用意しています。CIテスト以外にも、Vitestのユニットテストなども含まれているので、興味があれば確認してみてください。

## プロジェクトでよく使われる設定集

### 複数の Node.js バージョンで動作確認

```
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm run test:ci
```

### PR にコメントでテスト結果を通知する

```
- name: Comment on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '❌ CI が失敗しました。ログを確認してください。'
      })
```

### GitHub の Actions タブから手動でボタン実行できるようにする

```
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:  # これを追加するだけ
```

### あるジョブが失敗しても他のジョブの結果も確認したい

```
jobs:
  lint:
    continue-on-error: true  # 失敗しても後続ジョブを止めない
    ...
```

### ジョブが終わらない場合に自動でキャンセル（デフォルトは360分）

```
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10  # 10分で強制終了
    ...
```

## GitHub Actionsの自動テストは最後の防波堤

GitHub Actionsの自動テストによる確認は<span class="marker">最終確認の箇所</span>であり、ローカル環境でのテスト実施忘れを防ぐためのものです。

そのため、基本的には<span class="marker">ローカル環境でテストを完璧にしておくことが推奨</span>されます。

`Lefthook`や`husky`などを使用して、`git commit`、もしくは`git push`などに合わせて、テストを実行するようにしましょう。
