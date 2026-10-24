---
title: cssのカスタマイズでmacとwindowsのスクロールバーを同じデザインにする方法
date: '2024-11-04T05:07:45'
modified: '2025-11-02T02:30:58'
categories:
  - html_css
  - coding
excerpt: >-
  MacとWindowsのスクロールバーデザインの違いが気になる方へ。CSSの`-webkit-scrollbar`で、Mac風のスタイリッシュなデザインに統一する方法を解説。コピペOKのデモ付きで、`thumb`（つまみ）や幅の調整方法も紹介します。
eyecatch: /images/uploads/2024/11/04050735/scroll-bar.webp
---
macのスクロールバーとwindowsのスクロールバーを同じデザインにするには、cssで対応するのが一番簡単です。

macのスクロールバーのデザインをベースにしたdemoを用意しているので、何も考えずにコピペで対応したい人は、demoをコピペして、調整して頂ければOKです。

ただし、難しいことをしているわけではないので、調整を手探りで終わらせたないためにも、簡単に説明も目を通して頂けると幸いです。

## カスタムスクロールバーの作成方法

macのスクロールバーをベースとしたスクロールバーのデモ

<p><iframe height="300" style="width: 100%;" scrolling="no" title="custom-scroll" src="https://codepen.io/aotya/embed/ZEdewjR?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"><br /> See the Pen <a href="https://codepen.io/aotya/pen/ZEdewjR"><br /> custom-scroll</a> by aotya (<a href="https://codepen.io/aotya">@aotya</a>)<br /> on <a href="https://codepen.io">CodePen</a>.<br /></iframe></p>

macでデモを見ると、本当にスクロールバーがカスタマイズされているのか分からないかもしれません（macnのスクロールバーのデザインを真似ているため）。

デモのデザインを変えたい場合は、cssで調整することができます。

<div class="pointContainer"><span class="pointLabel">Mac開発時に注意すること</span><p></p><p>Macのデフォルトの設定だと、スクロールバーが常に表示されるのではなく、スクロールしている時のみの表示になっていると思います。<span class="marker">常にスクロールバーが表示される設定の時だけデザインが崩れるケース</span>もあるので、フロント側の実装をする場合は、常にスクロールバーを表示させる設定にするようにしましょう！</p><p></p></div>

### CSSによる調整

使用するCSSのスタイルとは下記になります

```
.scroll-container {
    max-width: 680px;
    height: 400px;
    margin: 0 auto;
    overflow: auto;
    padding: 0 8px 0 20px;
}
.scroll-container::-webkit-scrollbar {
    width: 12px;
}

.scroll-container::-webkit-scrollbar-corner {
    display: none;
}
.scroll-container::-webkit-scrollbar-thumb {
    background: #b3b3b3;
    border-radius: 100px;
    border: solid transparent;
    background-clip: content-box;
}
```

scroll-containerは、デモで使用している親要素のdivに付与しているclassになります。

スクロールバーのデザインを変えたい場合は、webkitにより設定していきます。

### スクロールバーの全体の幅や高さ

```
::-webkit-scrollbar {
    width: 12px; /* 縦スクロールバーの幅 */
    height: 12px; /* 横スクロールバーの高さ */
}
```

\-webkit-scrollbarは、カスタムスクロールバーの全体的なコンテナを定義します。スクロールバーの全体の幅や高さを設定することができます。

また、この幅によって次に説明する「つまみ」の大きさも変わるので、慎重に調整しましょう。

### スクロールバーの「つまみ」

```
::-webkit-scrollbar-thumb {
    background: #b3b3b3;
    border-radius: 100px;
    border: solid transparent;
    background-clip: content-box;
}
```

\-webkit-scrollbar-thumbは、スクロールバーの「つまみ」と呼ばれる部分をスタイリングします。ユーザーがスクロールする際に操作する部分です。

### 縦と横のスクロールバーが交差する部分

```
::-webkit-scrollbar-corner {
    background-color: #f1f1f1; /* コーナーの背景色 */
}
```

\-webkit-scrollbar-cornerは、縦と横のスクロールバーが交差する部分（コーナー）をスタイリングします。通常、この部分はスクロールバーの下部に位置し、デフォルトでは透明になっています。

demoでは縦スクロールのみなので、display:noneとしています。わざわざ設定しなくても問題ないのですが、念のためです。\
縦と横の両方でスクロールさせる場合は、設定を考慮しましょう。

### まとめ

デザイナーも、フロントエンドエンジニアも基本的にMacを使用していることが多いです。そのため、Macのスクロールバーを前提にデザインし、実装してしまうことが多いです。

しかし、一般的なユーザーはPCだとWindowsを使用していることが多いです。そうなると、デフォルトのグレーなスクロールバーによって、多くのユーザーがデザインにマッチしていないスクロールバーに対して違和感を感じることになります。

そうならないようにするためにも、MacとWindowsのスクロールバーを同じデザインになるようにしましょう！
