---
title: MCPを学ぶためのチュートリアル実装
date: '2026-03-11T13:31:06'
modified: '2026-03-11T13:31:06'
categories:
  - ai
  - coding
excerpt: >-
  MCPとはAIに外部接続を提供する仕組み。本記事ではNode.js、TypeScript、Zod、cheerioを使い、スクレイピングでサイトのメタ情報を取得するMCPサーバーをゼロから作るチュートリアルを紹介します。
eyecatch: /images/uploads/2026/03/11133030/mcp-tutorial.webp
---
# MCPを学ぶためのチュートリアル実装

`MCP`とは簡単に言えば、AIに外部接続（`googleカレンダー`や`Git Hub`、社内システムetc…）などに接続して、操作してもらうものになります。

カレンダーのような入れる予定が決まっているものなら、AIに操作だけしてもらうので、`model`による差はあまり発生せず、逆にレビューなどをしてもらうなら内容については`model`の性能差や、与える情報によっても差はでます。

簡単に言えば、外部接続による行動の流れを処理によって定めてあげて、<span class="marker">成果物がAIによる思考によって差が出るもの（文章など）はmodelの性能によって変わる</span>と思って頂ければOKです。

今回のチュートリアルで作成するのは、スクレイピングしたサイトのメタ情報を取得するので、<span class="marker">modelによる性能差は基本的に出ない</span>ものです。

## 説明の流れ

-   ローカルMCPの作成：使用言語・ライブラリ
-   コードの完成形
-   処理ごとの説明
-   実行方法

## ローカルMCPの作成：使用言語・ライブラリ

-   `Node.js` / `TypeScript`：型定義
-   `Zod`：型定義の強化＋AIの説明強化
-   `stdio.js`：MCPサーバー
-   `cheerio`：スクレイピングしたサイトからメタ情報を抽出するため

`MCP`を通してデータを取得するので、`TypeScript`だけではなく、<span class="marker">Zodによる取得したAPIデータが正しいかどうかの判断もできるようにすると良い</span>です。

また、Zodを利用してのdescribeによるデータの説明もAPIの精度を高めてくれます。

`stdio.js`は、標準入出力（stdio）を介して通信するための仕組みとなっており、ローカルでMCPを動かしたい場合に使用することができ、非常にシンプルな構成になっています。

`cheerio`は、AIが取得したHTMLデータをdom形式（ツリー構造）に変換してくれるので、メタデータをタグ名から抽出することが可能になります。

## コードの完成形

まずはコードの全体を確認して頂ければと思います。

`MCP`の使い方については`github`の`README.md`を確認して頂ければと思います。

`package.json`

```
{
  "name": "mcp_tutorial",
  "version": "1.0.0",
  "description": "Simple Scraper MCP Server",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "start": "node dist/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.26.0",
    "axios": "^1.13.5",
    "cheerio": "^1.2.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^25.3.0",
    "typescript": "^5.9.3"
  }
}
```

`tsconfig.json`

```
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
```

`index.ts`

```
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

// ─────────────────────────────────────────────
// 1.MCP サーバーの作成
// ─────────────────────────────────────────────

const server = new McpServer({
  name: "github-tutorial-mcp",
  version: "1.0.0",
});

/**
 * 2.ツール
 * 指定されたURLのウェブサイトから、タイトル、メタ情報、本文テキストを抽出
 * MCPサーバーを実行できる環境で、このツールを呼び出すことで、
 */

server.tool("fetch_web_content",
  "指定されたURLのウェブサイトから、タイトル、メタ情報、本文テキストを抽出します。",
  {
    url: z.string().url().describe("スクレイピング対象のURL"),
  },
  async ({url}) => {
    try {
      // サイトの取得 (User-Agentを設定して拒否を防ぐ)
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 10000, // 10秒でタイムアウト
      });

      // HTMLのパース
      const $ = cheerio.load(response.data);

      // 不要なタグを削除してクリーンアップ
      $("script, style, noscript, iframe, nav, footer, header").remove();

      const title = $("title").text().trim();
      const description = $('meta[name="description"]').attr("content") || "No description";
      
      // 本文の抽出（余計な空白を詰める）
      const bodyText = $("body")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000); // AIが扱いやすいよう5000文字程度に制限

      return {
        content: [
          {
            type: "text",
            text: `Title: ${title}\nDescription: ${description}\n\nContent:\n${bodyText}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `スクレイピングに失敗しました: ${errorMessage}`,
          },
        ],
      };
    }

  });
  
  // 3. サーバーの起動
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Simple Scraper MCP Server running on stdio");
```

## 3.処理ごとの説明

### MCP サーバーの作成

```
// ─────────────────────────────────────────────
// 1.MCP サーバーの作成
// ─────────────────────────────────────────────

const server = new McpServer({
  name: "github-tutorial-mcp",
  version: "1.0.0",
});
```

こちらはテンプレなので、名前はサービス名、バージョンは最近のものでお願いします。

### 外部接続の処理

2.ツールで記載されている`server.tool(…` の処理になりますが、これだけ見ると面倒そうに見えると思いますが、こちらもテンプレを覚えてしまえば簡単です。引数に必要な値を入れましょう。

下記のような構造です

```
server.tool(
機能名,
機能ができること,
4つ目の関数で使用するデータの設定,
AIに実行してもらう処理
)
```

上記のような形になります。

一番わかりにくいのは、引数の3つ目のデータの設定になるかと思いますが、ここの値がユーザーに連携してもらう数値などを定義するのが一般的だと思えばOKです。

逆に言えば、AIが正しく理解してくれないと、`MCP`が正しく実行されないリスクがあります。

そのため、`Zod`を使用して、データの詳細を説明することで、<span class="marker">AIに正しくデータを理解させています。</span>

もちろん、`Zod`による取得パラメーターの型の不一致なども、エラー調査に非常に役立ちます。

今回の処理では、スクレイピングのURLがユーザーから連携されることを期待した処理となっていることがわかると思います。

```
server.tool("fetch_web_content",
  "指定されたURLのウェブサイトから、タイトル、メタ情報、本文テキストを抽出します。",
  {
    url: z.string().url().describe("スクレイピング対象のURL"),
  },
```

そして、下記がAIが実行する処理になり、`url`には、AIがユーザーから連携されたデータを入れてくれます。

```
  async ({url}) => {
    try {
      // サイトの取得 (User-Agentを設定して拒否を防ぐ)
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 10000, // 10秒でタイムアウト
      });

      // HTMLのパース
      const $ = cheerio.load(response.data);

      // 不要なタグを削除してクリーンアップ
      $("script, style, noscript, iframe, nav, footer, header").remove();

      const title = $("title").text().trim();
      const description = $('meta[name="description"]').attr("content") || "No description";
      
      // 本文の抽出（余計な空白を詰める）
      const bodyText = $("body")
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000); // AIが扱いやすいよう5000文字程度に制限

      return {
        content: [
          {
            type: "text",
            text: `Title: ${title}\nDescription: ${description}\n\nContent:\n${bodyText}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `スクレイピングに失敗しました: ${errorMessage}`,
          },
        ],
      };
    }

  })
```

## サーバーの起動

```
  // 3. サーバーの起動
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Simple Scraper MCP Server running on stdio");
```

こちらも、テンプレになるので、コピペでOKです。

実行方法については、最初にも述べたした`github`の`README.md`をみて頂ければと思います。

難しい設定などは、ほぼないので気になった方は見てください！

## まとめ

`MCP`は、基本的には外部接続する時のツールを組み合わせていくだけです。

AIが手順を間違えないようにするために、機能について正しく説明しておくことが求められます。

また、プロンプトを読み込ませた場合は、`json`ファイルを作成しておき、読み込ませるようにすればOKです。

`github`のレビュー＋コメントを自動化などの機能なども作成しているので、興味があれば見てください。
