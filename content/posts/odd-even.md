---
title: CSSで偶数要素と奇数要素で別々のスタイルを設定する
date: '2025-10-25T02:02:04'
modified: '2025-11-02T02:48:56'
categories:
  - html_css
  - coding
excerpt: >-
  CSSで`li`などの偶数・奇数番目だけスタイルを変える方法。`:nth-child(odd)`と`:nth-child(even)`の基本的な使い方を解説。さらに`3n`（3の倍数）や`n+4`（4番目以降）など数式を使った応用的な指定方法も紹介します。
eyecatch: /images/uploads/2025/10/25020155/odd-even.webp
---
CSSでliといった要素に対して、偶数番目と奇数番目でスタイルを変えるには:nth-child()という擬似クラスを使用します。

<strong class="marker">具体的には、奇数番目の要素には:nth-child(odd)を、偶数番目の要素には:nth-child(even)を指定するのが一番簡単です。</strong>

## コード例

以下は、リストの奇数番目の背景色を薄い灰色に、偶数番目の背景色をオレンジ色にする場合の例です。

```
<ul>
<li>Item 1</li>
<li>Item 2</li>
<li>Item 3</li>
<li>Item 4</li>
<li>Item 5</li>
<li>Item 6</li>
</ul>
```

```
li:nth-child(odd) {
  background-color: lightgrey;
}

li:nth-child(even) {
  background-color: orange;
}
```

## 別の指定方法

キーワードのoddとevenの代わりに、数式を使って指定することもできます。

・奇数:i:nth-child(2n+1)\
・偶数:li:nth-child(2n)

<strong class="marker">この数式では、nが0から始まる整数を表します。例えば、2n+1は1、3、5...となり奇数番目の要素を選択します。同様に、2nは2、4、6...となり偶数番目の要素を選択します。</strong>

こちらの方法は、シンプルな偶数、奇数以外にも下記のような間隔の指定もできます。

### 1.3つおきにスタイルを適用する

```
/* 3の倍数の要素を選択 */
li:nth-child(3n) {
background-color: lightblue;
}
```

### 2.3つおきに、ただし1番目から始める

```
/* (3 * 0 + 1), (3 * 1 + 1), (3 * 2 + 1), ... */
li:nth-child(3n+1) {
background-color: lightgreen;
}
```

### 3.最初の3つの要素だけに適用する

```
/* 3番目までの要素を選択 */
li:nth-child(-n+3) {
font-weight: bold;
}
```

### 4\. 4番目以降のすべての要素に適用する

```
/* 4番目以降の要素をすべて選択 */
li:nth-child(n+4) {
color: grey;
}
```

jsなどで動的にclassなどをつけるよりも簡単に対応できるので、規則性があるのでしたらcssのみで対応するようにしましょう！
