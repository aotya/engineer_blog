---
title: Googleの新フレームワーク「ADK」導入ガイド：Hello Worldから専門エージェント作成まで
date: '2026-02-11T05:58:14'
modified: '2026-02-14T00:56:22'
categories:
  - ai
  - coding
excerpt: >-
  Googleの最新フレームワーク「ADK（Agent Development Kit）」の導入ガイド。Python環境の構築からGemini
  APIの連携、Hello Worldの実行、さらに専門的なAIエージェントを作成するためのプロンプト設計までをステップバイステップで詳しく解説します。
eyecatch: /images/uploads/2026/02/11055755/adk-tutorial.webp
---
Googleが公開した<span class="marker">ADK（Agent Development Kit）</span>は、Geminiを活用したAIエージェントを効率的に開発するためのフレームワークです。

この記事では、ADKの導入方法から「Hello World」の実行、そして特定タスクに特化させるためのプロンプト設計（Instruction）のサンプルまでをステップバイステップで解説します。

## 0\. 事前準備：環境の確認

ADKは最新の機能を利用するため、`Python 3.10` 以上 が必須です。

ターミナルで以下のコマンドを実行し、バージョンを確認してください。

```
python3 --version
```

<div class="pointContainer"><span class="pointLabel">判定</span><p></p><p>3.10.x 以上であれば問題ありません。もし 3.9 以下の場合は、Python公式サイトから最新版をインストールしてください。</p></div>

## 1\. APIキーの作成

Geminiを利用するために、APIキーを取得します。

[Google AI Studio](https://aistudio.google.com/)

上記にアクセスして「Create API key」ボタンを押下してキーを作成します（無料枠で利用可能です）。

キーをコピーしておいてください。

<div class="pointContainer"><span class="pointLabel">TIPS</span><p></p><p>環境変数名を <span class="code">GOOGLE_API_KEY</span> としておくと、ADKが自動的に読み取ってくれるため、コード内での認証記述を省略できてスマートです。</p></div>

## 2\. プロジェクト作成と仮想環境の構築

Pythonプロジェクトでは、PC全体の環境を汚さないために「仮想環境（venv）」を作るのが一般的です。JSでいう `npm init` や `node_modules` の作成に相当します。

```
# 1. プロジェクト用のフォルダを作成して移動
mkdir my_adk_project
cd my_adk_project

# 2. 仮想環境（.venv）を作成
python3 -m venv .venv

# 3. 仮想環境を有効化（アクティベート）
# Mac / Linux の場合
source .venv/bin/activate
# Windows (PowerShell) の場合
.venv\Scripts\Activate.ps1
```

※ 有効化されると、ターミナルの先頭に `(.venv)` と表示されます。

## 3\. ADKのインストールと雛形作成

次に、ADK本体のインストールと、ボイラープレート（テンプレートファイル）の生成を行います。

```
# ADKのインストール
pip install google-adk

# エージェントの雛形作成 (ここでは 'my_agent' という名前で作成)
adk create my_agent
```

実行中に以下の入力を求められる場合があります：

-   `Choose a model`: 提案されたモデル（`gemini-2.0-flash` など）を選択します。
-   `API Key`: 先ほど取得したAPIキーを入力します。これにより、自動的に `.env` ファイルが作成されます。

## 4\. 起動と動作確認（Hello World）

作成されたディレクトリへ移動し、エージェントを起動してみましょう。

```
cd my_agent
adk run agent.py
```

<div class="pointContainer"><span class="pointLabel">ゴール</span><p></p><p>ターミナルに <span class="code">User:</span> という入力待ち画面が出れば成功です。<br>「こんにちは」と打って、AIから返事が返ってくることを確認してください。</p></div>

## 5\. 専門エージェントへのカスタマイズ

ADKの肝は、`agent.py` 内の `Agent` クラスの設定です。特に `instruction` を作り込むことで、特定の専門性を持たせることができます。

### パラメータの役割

-   `name` / `description`: ログの識別や、マルチエージェント構成時に「どの方針でどのおエージェントに振るか」を判断するために使われます。
-   `instruction`: エージェントへの具体的な命令書です。役割、回答ルール、トーン、禁止事項を詳しく書くほど精度が上がります。

### サンプル1：シニアPythonレビュアー

コードの品質管理に特化したエージェントの例です。

```
from google.adk.agents.llm_agent import Agent

python_reviewer_agent = Agent(
    model='gemini-2.0-flash',
    name='python_code_reviewer',
    description='Pythonコードをレビューし、バグ指摘やPEP8準拠の修正案を提示する。',
    instruction="""
あなたは熟練したシニアPythonエンジニアです。以下のガイドラインに従ってレビューしてください。

1. **役割**: 論理的誤り、セキュリティリスク、パフォーマンスのボトルネックを特定する。
2. **回答フォーマット**: 
   - 問題点の要約
   - 修正コード（必ず型ヒントを追加すること）
   - 初心者向けの解説
3. **制約**: 常にPEP 8に準拠し、批判的にならず教育的なトーンを維持すること。
"""
)
```

### サンプル2：問い合わせ解析（JSON構造化出力）

ユーザーの入力を解析して、システムが処理しやすいJSON形式で返す例です。

```
from google.adk.agents.llm_agent import Agent

inquiry_analyzer_agent = Agent(
    model='gemini-2.0-flash',
    name='inquiry_analyzer',
    description='問い合わせ文をカテゴリ分類・優先度付けしてJSONで返す。',
    instruction="""
あなたは問い合わせ解析AIです。入力を解析し、以下のJSON形式のみを出力してください。

### 出力ルール
1. フォーマットは純粋なJSONのみ。Markdown（```json）は含めない。
2. JSON以外の挨拶や解説は一切出力しない。

### JSONスキーマ
{
  "category": "[不具合報告, 機能要望, その他]",
  "priority": "[High, Medium, Low]",
  "summary": "30文字以内の要約"
}
"""
)
```

## まとめ

Google ADKを使うことで、APIの複雑な呼び出しを意識することなく、エージェントの「役割（プロンプト）」の設計に集中できるようになります。

まずは1つの専門エージェントから始め、慣れてきたら複数のエージェントを組み合わせた「マルチエージェントシステム」の構築にもチャレンジしてみてください！

## 参考リンク

-   [Google AI Studio](https://aistudio.google.com/)
-   [Google Cloud Blog: Build multi-agentic systems](https://cloud.google.com/blog/products/ai-machine-learning/build-multi-agentic-systems-with-google-adk)
