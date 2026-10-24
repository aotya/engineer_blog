---
title: ローカルストレージに保存する方法
date: '2024-11-04T05:04:19'
modified: '2025-11-02T02:29:48'
categories:
  - js
  - coding
excerpt: >-
  JavaScriptの`localStorage`は文字列しか保存できません。この記事では、`setItem`の基本に加え、数値やオブジェクトを`JSON.stringify`/`JSON.parse`で正しく保存・復元する方法を解説。開発ツールでの確認方法や注意点も紹介します。
eyecatch: /images/uploads/2024/11/03122031/localStorage.png
---
ローカルストレージにjsで保存する方法としては、

```
localStorage.setItem("value", "tesuto"); //ローカルストレージにセットする方法
localStorage.getItem("value") //ローカルストレージから取得する方法
localStorage.removeItem("value"); //ローカルストレージから削除する方法
ocalStorage.clear(); //ローカルストレージの全てを削除
```

\
上記がシンプルな使い方になります。

<p class="marker">注意点としては、上記の方法だと文字列しか保存できない点です。</p>

そのため、<span class="marker">数値などを保存したい場合</span>は、取得した文字列を型変換させる必要があります。例えばですが、

```
// 数値を文字列として保存
localStorage.setItem('age', 30);

// 取得して数値に変換
const savedAge = parseInt(localStorage.getItem('age'), 10);
console.log(savedAge);  // 30
console.log(typeof savedAge);  // "number" （数値として利用できる）
```

上記のような方法となります。

また、<span class="marker">オブジェクトして保存したい場合</span>は、

```
// オブジェクトをlocalStorageに保存
const user = { name: "John", age: 30 };  // ageは数値
localStorage.setItem('user', JSON.stringify(user));

// localStorageからデータを取得
const savedUser = JSON.parse(localStorage.getItem('user'));

// 確認
console.log(typeof savedUser.age);  // "number" （数値として復元される）
console.log(savedUser.age);  // 30
```

JSON.stringifyで文字列化した後に、ローカルストレージからデータを取得する際に、JSON.parseすることで、元のデータ型にすることがきます。

オブジェクトをローカルストレージに保存する場合は、上記の方法で実装してください。

<div class="cautionContainer"><span class="cautionLabel">注意</span><p></p><p>ローカルストレージに保存を考慮する時に注意するべきことは、保存するデータが外部に漏れても問題ない情報かどうかです。</p><p>ローカルストレージに保存したデータは、ユーザーが削除するか、削除の処理を記載していないと残り続けます。その点を考慮して、ローカルストレージに保存するようにしてください。</p><p></p></div>

## 開発者ツールでローカルストレージに保存されたか確認できる

ローカルストレージが保存されているかどうか確認したい場合は、開発者ツールで確認するのが簡単です。\
方法としては、

<p><img loading="lazy" decoding="async" src="/images/uploads/2024/11/09123233/localstorage-1.png" alt="" width="1131" height="834" class="alignnone size-full wp-image-36" srcset="/images/uploads/2024/11/09123233/localstorage-1.png 1131w, /images/uploads/2024/11/09123233/localstorage-1-768x566.png 768w" sizes="auto, (max-width: 1131px) 100vw, 1131px"></p>

上記のように、Application→Local Storageを選択していただければ、OKです。\
もし、ローカルストレージに保存された、表示されます。
