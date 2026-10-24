---
title: 指定したclassを持つ要素を全て取得し、対象の要素に変更を加える方法
date: '2024-12-13T00:58:07'
modified: '2025-11-02T02:36:22'
categories:
  - js
  - coding
excerpt: >-
  JavaScriptの`querySelectorAll`と`forEach`を使い、同じclassを持つ複数要素にまとめて`classList.add`する方法を解説。`DOMContentLoaded`の必要性や、初心者が陥りがちな「配列」処理の注意点も紹介。
eyecatch: /images/uploads/2024/12/13005727/queryselectorall.webp
---
idではなく、classを指定して、そのclassを持つHTML要素全てに何らかの対応・・・例えば、追加のstyleやclassを付与したいケースもあると思います。

そのサンプルと説明をしていきたいと思います。

## サンプルコード

```
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.targetClass');

   items.forEach(item => {
	   item.classList.add('.addClass');
   });

});
```

### サンプルコードの説明

基本的には、サンプルのコピペでOkです。

ただし、DOMContentLoadedが、htmlを全て読み込んだ後に、処理を実行させることぐらいは知っていた方がいいかもしれません。

classを取得するタイミングなどに関わりますので。

<p class="marker">そして、サンプルコードは、ページにある.targetClassの要素を配列として全てを取得します。</p>

そして、forEachによって取得した配列全てを一つ一つ実行する中で、addClassを追加しています。

### カスタマイズ

<p class="marker">targetClassを、あなたが変更したい要素が持つclassに変更し、forEachの中で変更したい処理を記載すればOKです。</p>

サンプルでは、classList.addでclassを追加しているだけです。

### 間違いやすい点

初心者だと、配列で取得していることを忘れてしまうことが多い点です。

forEachで配列の全てを実行することを忘れないようにしましょう。
