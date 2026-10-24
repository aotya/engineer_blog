# 記事の書き方（Markdown）

記事は WordPress ではなく、このリポジトリの Markdown ファイルで管理しています。`main` にマージすると Vercel のビルドで静的ページとして生成されます。

## ファイル構成

| パス | 内容 |
|---|---|
| `content/posts/<slug>.md` | 記事本体。ファイル名がスラッグ（URL）になる |
| `content/categories.json` | カテゴリ一覧（`id` / `slug` / `name` / `parent`）。並び順はヘッダー・フッターの表示順 |
| `public/images/uploads/` | 記事内の画像・アイキャッチ |

記事の URL は `/{カテゴリ}/{スラッグ}` です。`categories` に指定したすべてのカテゴリで URL が生成され、canonical と sitemap は先頭のカテゴリを使います。

## frontmatter

```md
---
title: 記事タイトル
date: '2026-10-24T10:00:00'
modified: '2026-10-24T10:00:00'
categories:
  - nextjs   # 子カテゴリ（先頭がcanonical）
  - coding   # 親カテゴリ
excerpt: meta description に使われる説明文
eyecatch: /images/uploads/2026/10/sample.webp
draft: true  # 公開しない場合のみ指定
---
```

- `date` は必ずクォートで囲む（囲まないと日付型として読み込まれる）
- 一覧は `date` の新しい順に並ぶ

## 本文の記法

| 書き方 | 表示 |
|---|---|
| `## 見出し` / `### 見出し` | 目次（TOC）にも反映される |
| `` `code` `` | `<span class="code">` |
| `- リスト` | `<ul class="blogList">` |
| `[テキスト](https://...)` | `<a class="link">`（外部リンクは別タブ） |
| ```` ``` ```` で囲む | コードブロック（highlight.js で自動ハイライト） |
| `**太字**` | `<strong>`（前後が記号「」などの場合は `<strong>` タグで書く） |

マーカーや注意書きなど、Markdown にない装飾は HTML をそのまま書けます。

```html
<span class="marker">マーカー</span>

<div class="pointContainer"><span class="pointLabel">ポイント</span>本文</div>

<div class="cautionContainer"><span class="cautionLabel">注意</span>本文</div>
```

HTML のブロック（`<div>` など）の中に空行を入れると、そこで HTML が途切れて Markdown として解釈されるので注意してください。

## WordPress からの移行スクリプト

移行時に使用したスクリプトです（通常の記事執筆では不要）。

| コマンド | 内容 |
|---|---|
| `node scripts/wp-backup.mjs` | WordPress から記事・カテゴリ・画像を `wp-backup/` にバックアップし、URL 一覧（`urls.csv`）を出力 |
| `node scripts/wp-to-md.mjs` | `wp-backup/` を `content/` の Markdown に変換し、画像を `public/images/uploads/` にコピー |
| `node scripts/verify-md.mts` | 変換後の表示が WordPress 時代と一致するか検証 |
| `node scripts/check-urls.mjs <URL>` | 移行前の全 URL が指定環境で 200 を返すか確認（例: Vercel のプレビュー URL） |
