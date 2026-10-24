---
title: JavaScriptのDOM操作の基礎（初心者向け）
date: '2025-11-15T01:25:26'
modified: '2025-11-15T01:25:26'
categories:
  - js
  - coding
excerpt: >-
  「DOM操作」を何となく使っていませんか？本記事では、JSによるDOM操作の基本を、フロントエンドエンジニア向けに改めて解説します。HTMLが「ツリー構造」に変換される仕組みから、querySelectorやremoveを使った具体的な操作方法まで、基礎をしっかりまとめます。
eyecatch: /images/uploads/2025/11/15012515/dom_basic.webp
---
フロントエンドエンジニアとして働いていると、当たり前のようにJacaScriptでDOMを操作し、指定したIDの要素にclassを付与/削除したり、テキストを動的に変更したりしていると思います。

筆者である私もフロントエンドエンジニアとしてJavaScriptを頻繁に使用しているのですが、何となくJacaScriptで実装しているなと感じたので、改めてDOM操作でHTMLをどのように組み替えているのかまとめようと思います。

やりたいことがあればAIで調べれば良い時代になっていますが、具体的に何をしているの分からないと、JacaScriptでどこまでできるのか、どのようなバグが発生するかのリスクも分からないです。

改めて基本をまとめてみましたので、興味がある人は読み進めてみてください。

## DOMとは何か？

正式な呼び方は、「Document Object Model」で、略してDOMです。

<strong class="marker">具体的には、VsCodeといったエディタで実装したHTMLファイルをブラウザで表示する場合、下記のように構造化されたデータ（ツリー構造）に変換されます。その構造をDOMと呼ぶのです。</strong>

HMTL（例）

```
<body>
	<h1>タイトル</h1>
		<p>これは段落です。</p>
	<div>
		<h2>小見出し</h2>
		<p>中身のテキスト</p>
	</div>
</body>
```

↓ブラウザで表示する時にツリー構造（DOM）に変換

```
Document
└── html
    ├── head
    └── body
        ├── h1
        │    └── #text("タイトル")
        ├── p
        │    └── #text("これは段落です。")
        └── div
             ├── h2
             │    └── #text("小見出し")
             └── p
                  └── #text("中身のテキスト")
```

上記がDOMツリーと呼ばれるものになります。

要素単位にどのように呼ばれるかというと

・<strong>ノード（Node）</strong>：DOMツリーの一つ一つの点。タグも、テキストも全部がノード。\
・<strong>親と子（Parent & Child）</strong>：ツリー状なので、要素同士の関係性は「親子」で表せます。\
・<strong>兄弟（Sibling）</strong>：同じ親を持つノード同士。

となります。

JavaScriptで実装した経験のある人だと、見慣れた用語もあると思いますし、実際に親子関係を指定して操作することもありますが、上記のような構造が元になっています。

## ツリー構造をイメージすることで可能なことがイメージできる

下記のような処理があるとします。

```
//空のHタグ削除処理
export const deleteNoTextHtag = (content: Document): Document => {
  content.querySelectorAll('h2').forEach((heading) => {
      heading.remove();
  });
  return content;
};
```

上記のようにh2タグを全て削除する処理ですが、下記のようにイメージすればわかりやすいと思います。

```
Document
└── html
    ├── head
    └── body
        ├── h1
        │    └── #text("タイトル")
        ├── p
        │    └── #text("これは段落です。")
        └── div
             ├── h2 // ←削除
             │    └── #text("小見出し")
             └── p
             │   └── #text("中身のテキスト")
             ├── h2 // ←削除
             │    └── #text("小見出し")
             └── p
                  └── #text("中身のテキスト")
```

h2タグの箇所を全て抽出して削除するだけなので、divの中身はpタグのみとなります。

初心者の方の中には、HTMLをエディター上の文字列や文章のように理解してしまい方もおり、どのように対象を検索して、その対象に修正や削除、または新たに子要素を作成するのかイメージがつかない中でDOM操作をしている方も意外といます。

<strong class="marker">しかし、ツリー構造にしてみると、意外と単純な行為をしているとうことが分かると思います。</strong>

### よく使うDOM操作メソッド

Domの操作としては、下記が使いやすいので、「こういった操作」ができると覚えておきましょう（関数名は調べれば出てきますので暗記不要です）。

**document.querySelector**：CSSセレクタに一致する最初の要素を取得\
例):`document.querySelector('.title')`

**document.querySelectorAll**：セレクタに一致する全ての要素を取ってくる（NodeList）\
例):`document.querySelectorAll('p')`

**element.textContent**：要素のテキストの取得・設定\
例):`heading.textContent = '新しい文字'`

**element.innerHTML**：HTMLごと内容を操作\
例):`div.innerHTML = '<strong>強調</strong>'`

<strong>element.remove()</strong>：DOMツリーからその要素を削除\
例):`paragraph.remove()`

**document.createElement**：新しい要素を作る\
例):`const newP = document.createElement('p')`

## まとめ

・DOMは、ブラウザがHTMLを理解するために構造化した「木（ツリー）」です\
・各要素やテキストはノード（Node）として扱われます\
・<strong>`document`</strong>を通じてJavaScriptからアクセス可能で、正確・安全に操作できます\
・HTMLを文字列のまま扱うより、DOMを通じて操作するほうが、構造を保ちつつ柔軟に処理できます

まずは、ブラウザの開発者ツール（F12キー）でDOM構造を確認したり、簡単なJavaScriptでDOM操作を試してみると理解が進みやすいですよ！
