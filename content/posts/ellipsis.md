---
title: cssによる「・・・」省略の２つの方法と注意点
date: '2024-11-03T14:01:51'
modified: '2025-11-02T02:26:24'
categories:
  - html_css
  - coding
excerpt: >-
  CSSでテキストを「…」と省略する方法を解説。1行のみ対応の`text-overflow:
  ellipsis;`と、複数行に対応できる`-webkit-line-clamp:
  2;`の使い方をデモ付きで紹介。それぞれの使い分けや、うまく表示されない時の注意点もまとめました。
eyecatch: /images/uploads/2024/11/03140139/ellipsis.png
---
HTML/CSSでテキストを折り返さずに「・・・」で省略する方法としては、主に二つあります。

方法としては、

①

```
overflow: hidden;
white-space: nowrap;
text-overflow: ellipsis;
```

②

```
overflow: hidden;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
```

上記になります。\
<strong class="marker">使い分けの方法としは、①の方法は１行のみの対応になるので、２行以上になる場合は②の方法でOKです。</strong>

１行でも②の方法でOKなのですが、シンプルなのは①になるので、お好み合わせて使用してください。

下記のリンクからcodepenでコーディングしたデモを確認できます。

[→「・・・」のデモ](https://codepen.io/aotya/pen/jOjvdOj)

## 先頭に余計な余白がないかを確認する

②の方法を試すと、テキストが「・・・」になるケースがあります。その場合は、テキストの余白に余計な余白が大量になるケースが多いです。

コードの１行が長くなり過ぎてしまうのを防ぐために改行で整えたりすると、余計な余白が発生するケースがあるので注意しましょう。

※特にWPのエディターなどは余計な改行タグや余白が発生しやすいです。

### \-webkit-box-orient: vertical　が適用されないことがある

基本的に問題ないのですが、何故かcssファイルに記述した「-webkit-box-orient: vertical;」が適用されないことがあります。

この場合は、開発者ツールで確認しても、「-webkit-box-orient: vertical;」のみが適用されていないことがわかります。

その場合は、対象のpタグのstyleに「-webkit-box-orient: vertical;」だけ直接記述してみてください

「もっと見る」を選択したい場合は

もっと見るで省略した箇所を表示させたいと思っている方は、下記に別途記事を作成していますので、参考にしてみてください。

基本的に難しくないですし、ソースのコピペでOKです。
