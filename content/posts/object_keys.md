---
title: Object.keys()でオブジェクトのキーを配列で取得
date: '2025-11-01T01:31:57'
modified: '2025-11-02T02:24:55'
categories:
  - js
  - coding
excerpt: >-
  Reactなどでオブジェクトのキーだけを配列で使いたい時、`Object.keys()`が便利です。基本的な使い方から、ループ処理での活用法、キーの順序や注意点までを初心者にも分かりやすく解説します。
eyecatch: /images/uploads/2025/11/01013104/object_keys.webp
---
Reactなどで画面の実装をしていると、定数ファイルで設定しているオブジェクトのキーだけを使用したいことがあると思います。

キーだけの定数を作成することもできますが、一貫性を保つために、個別管理は避けたい…と言う場合は、対象のオブジェクトからキーだけを取り出して配列にすることも可能です。

## Object.keys() でキーだけを配列にする

`Object.keys()`、\*\*オブジェクトが持つプロパティの「キー」をすべて取得し、それらを要素とする配列を返す\*\*メソッドです。

とてもシンプルですが、非常に強力な機能です。

基本的な使い方としては、

```
Object.keys(対象のオブジェクト)
```

### Object.keys()の基本的な使い方

まずは、簡単なオブジェクトで試してみましょう。ここに、あるユーザーの情報を格納した`user`オブジェクトがあります。

```
const user = {
name: '山田 太郎',
age: 30,
prefecture: '東京都'
}
;// userオブジェクトのキーを取得する
const keys = Object.keys(user);
console.log(keys); // 結果: ['name', 'age', 'prefecture']
```

見ての通り、userオブジェクトのキーである`name`, `age`, `prefecture`が、新しい配列`keys`に格納されました。とても簡単ですね！

## Object.keys()の便利な活用例

`Object.keys()`は、ループ処理と組み合わせることで真価を発揮します。

### 例1: オブジェクトのキーと値をすべて出力する

`for...of`ループや`forEach`メソッドと組み合わせることで、オブジェクトの中身を一つずつ取り出して処理できます。

```
const fruits = {
apple: 150,
orange: 120,
grape: 200
};
const fruitKeys = Object.keys(fruits); // ['apple', 'orange', 'grape']
fruitKeys.forEach(key => {
// keyには 'apple', 'orange', 'grape' が順番に入る
const value = fruits[key]; // オブジェクトからキーを使って値を取得
console.log(`${key}の値段は${value}円です。`);
});
```

出力結果:\
appleの値段は150円です。\
orangeの値段は120円です。\
grapeの値段は200円です。

### 例2: オブジェクトのプロパティ数を調べる

返ってくるのが配列なので、`.length`プロパティを使えば、オブジェクトにいくつのキー（プロパティ）があるかを簡単に知ることができます。

```
const settings = {
  theme: 'dark',
  fontSize: 16,
  showNotifications: true
};

const settingCount = Object.keys(settings).length;

console.log(settingCount); // 結果: 3
```

## Object.keys()を使う上での注意点

とても便利な`Object.keys()`ですが、いくつか知っておくべき注意点があります。

### ① キーの順番は保証される（ES2015以降）

古い情報を見ると「`Object.keys()`が返す配列の順序は保証されない」と書かれていることがありますが、現在のJavaScript（ES2015以降）では、特定のルールに従ってキーの順序が保証されます。

<strong>・数値のように見えるキーは、数値の昇順で先に並べられます。</strong>\
<strong>・それ以外の文字列キーは、オブジェクトに追加された順番で並べられます。</strong>

```
const myObject = {
  '10': 'a',
  '1': 'b',
  'c': 'c',
  'b': 'd'
};

console.log(Object.keys(myObject));
// 結果: ['1', '10', 'c', 'b']
```

'1'と'10'が数値として扱われ、先に昇順でソートされているのが分かりますね。意図しない順序になる可能性があるので、この仕様は覚えておきましょう。

### ② enumerable（列挙可能）なプロパティのみが対象

オブジェクトのプロパティには、「列挙可能（enumerable）」という内部的な属性があります。`Object.keys()`は、この列挙可能なプロパティのキーだけを取得します。

通常、自分で作成したオブジェクトのプロパティはすべて列挙可能なので心配いりませんが、JavaScriptに組み込まれている一部のオブジェクト（例：`Array`の`length`プロパティなど）や、`Object.defineProperty()`で意図的に列挙不可能に設定したプロパティは取得できないので注意してください。

```
// 少し発展的な内容です
const obj = {};
Object.defineProperty(obj, 'invisibleKey', {
  value: '見えない値',
  enumerable: false // 列挙不可能に設定
});
obj.visibleKey = '見える値';

console.log(Object.keys(obj)); // 結果: ['visibleKey']
// 'invisibleKey'は取得できない
```

## まとめ

`Object.keys()`は、オブジェクトのキーを配列として手軽に取得できる、非常に実用的なメソッドです。\
`Object.keys()`は、オブジェクトのキーを配列として手軽に取得できる、非常に実用的なメソッドです。

<strong>・基本:</strong> `Object.keys(obj)`で、オブジェクトのキーが格納された配列を取得できる。

<strong>・活用:</strong> ループ処理と組み合わせて、オブジェクトの各要素を処理するのに便利。

<strong>・注意点:</strong> キーの順序にはルールがあること、列挙不可能なプロパティは取得できないことを覚えておこう。

オブジェクト操作の基本として、ぜひマスターしておきましょう！あなたのコーディングの幅がきっと広がるはずです。
