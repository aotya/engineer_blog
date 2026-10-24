---
title: useStateでオブジェクトを更新する正しい方法
date: '2025-11-15T02:04:30'
modified: '2025-11-15T02:04:30'
categories:
  - react
  - coding
excerpt: >-
  ReactのuseStateでオブジェクトを更新する際、入力項目以外が消える問題の解決策を解説。フォームデータなどを正しく管理するため、スプレッド構文（…）を使って安全にstateをマージ（結合）する具体的な方法を紹介します。
eyecatch: /images/uploads/2025/11/15020401/useState_object.png
---
Reactでフォームを作成する際、名前、電話番号、メールアドレスなどを一つのオブジェクトとして`useState`で管理したいケースは多いと思います。

しかし、Reactを学び始めたばかりの頃は、オブジェクトの更新方法が分からず、「入力した項目以外が消えてしまった！」という問題に直面しがちです。

この記事では、`useState`で複数のデータ（キーと値）を持つオブジェクトを正しく更新する方法について、サンプルコードを交えて解説します。

## 実装方法

覚えてしまえば簡単です。まずは`useState`でオブジェクトを初期化し、それに対応する更新関数を見ていきましょう。

### 1\. useStateでオブジェクトを初期化する

まず、フォームの各入力値を管理するためのstateを定義します。

```
import React, { useState } from 'react';

// ... コンポーネント内 ...

const [formValues, setFormValues] = useState({
name: '', // 名前
tel: '', // 電話番号
mail: '', // メールアドレス
});
```

### 2\. オブジェクトを更新するhandleChange関数

次に、`input`要素の変更イベントを処理する関数`handleChange`を定義します。

```
const handleChange = (e) => {
// e.targetからname属性とvalue（入力値）を取得
const { name, value } = e.target;

// 関数型更新を使い、以前の値を安全に展開・上書きする
setFormValues(prevValues => ({
...prevValues, // 1. 以前のオブジェクトの全プロパティをコピー
[name]: value,  // 2. 該当するキー（[name]）の値だけを新しい値で上書き
}));
};
```

## 実装の補足説明

この実装には2つの重要なポイントがあります。これらを理解することで、Reactの状態管理をより深く理解できます。

### ポイント1：inputのname属性とstateのキー名を一致させる

`handleChange`関数が正しく動作するためには、JSX（HTML）側の`input`タグに指定する`name`属性の値と、`useState`で定義したオブジェクトの**キー名（`name`, `tel`, `mail`）を一致させる**必要があります。

```

<input
  type="text"
  name="name"
  value={formValues.name}
  onChange={handleChange}
/>

<input
  type="tel"
  name="tel"
  value={formValues.tel}
  onChange={handleChange}
/>
```

`handleChange`関数内の `const { name, value } = e.target;` は、以下を意味しています。

・**value**: ユーザーが入力した<strong>「値」</strong>そのものです。（例: "山田太郎" や "0801234..."）\
・**name**: JSX側で指定した <strong>`name`属性の値</strong> です。（例: "name" や "tel"）

そして、`[name]: value` の部分（計算されたプロパティ名）が、`name`属性が "tel" ならば `tel: (入力値)` のように動的にキーを決定し、オブジェクトを更新しています。

### ポイント2：スプレッド構文...prevValuesが不可欠な理由

Reactのstate（`useState`）を更新する際、**Reactは「新しい状態（オブジェクト）」が渡されることを期待しています**。元のオブジェクトを直接変更（破壊的変更）してはいけません。

`handleChange`関数で最も重要なのがこの部分です。

```
setFormValues(prevValues => ({
...prevValues, // 1. まず、古いデータをすべてコピー
[name]: value // 2. 次に、変更したいキーのデータだけ上書き
}));
```

`...prevValues` は、「`prevValues`（前の状態のオブジェクト）が持っている全てのプロパティを、そっくりそのまま新しいオブジェクト`{}`の中にコピーする」という意味（スプレッド構文）です。

### もし...prevValuesを忘れると？

もしスプレッド構文を忘れて、以下のように書いてしまったとします。

```
// 間違った例（他のデータが消える）
setFormValues(prevValues => ({
[name]: value
}));
```

この場合、例えば「電話番号」に "080" と入力すると、`handleChange`が実行され、`setFormValues`には `{ tel: '080' }` という**新しいオブジェクトだけ**が渡されます。

その結果、**state全体が `{ tel: '080' }` に置き換わってしまい、`name` や `mail` プロパティが消滅してしまいます**。これが「入力した項目以外が消える」問題の原因です。

`...prevValues`は、<strong>「変更しない他のデータを失わないために、まず古い状態を丸ごとコピーする」</strong> という非常に重要な役割を果たしているのです。
