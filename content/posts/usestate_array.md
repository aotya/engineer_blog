---
title: useStateで配列を更新する方法
date: '2025-11-15T14:15:46'
modified: '2025-11-15T14:15:46'
categories:
  - react
  - coding
excerpt: >-
  ReactのuseStateで配列を更新する方法を解説。pushやspliceを使わず、スプレッド構文、map、filterでイミュータブル（不変）に追加・更新・削除するテクニックを紹介します。
eyecatch: /images/uploads/2025/11/15141525/useState_array.webp
---
Reactの`useState`で配列（Array）を管理する場合、オブジェクトの時と同様に\*\*「元の配列を直接変更せず、新しい配列を作って上書きする」\*\*ことが原則です。

そのため、`push()` や `splice()` といったメソッドは、元の配列を直接書き換えてしまう（破壊的変更）ため、Reactの状態更新では**使いません**。

代わりに、スプレッド構文(`...`)や `filter()`, `map()` といった<strong>「新しい配列を返す」</strong>メソッドを使います。

## 説明の流れ

この記事では、配列の操作で頻繁に使われる、以下の4つのパターンについてサンプルコードを紹介します。

<strong>・新しい要素を最後に追加 (<code>push</code> の代わりに)</strong>\
<strong>・配列の特定の項目を更新 (<code>map</code> を使用)</strong>\
<strong>・指定した順番（インデックス）に要素を挿入 (<code>splice</code> の代わりに)</strong>\
<strong>・配列から特定の項目を削除 (<code>filter</code> を使用)</strong>

### 1\. 配列の末尾に要素を追加する（push の代替）

`push` の代わりに、**スプレッド構文**を使って新しい配列を作ります。これが最も一般的です。

```
const [items, setItems] = useState(['りんご', 'みかん']);

const addItem = () => {
// 元の配列(...items)を展開し、末尾に新しい要素を追加した「新しい配列」を作る
setItems([...items, 'バナナ']);
};

// 実行後のitems: ['りんご', 'みかん', 'バナナ']
```

### 2\. 配列内の特定の項目を更新する (map)

配列の中の特定のオブジェクトだけを更新したい場合は、<strong>`map()`</strong> メソッドを使います。`map()` も**新しい配列を返す**メソッドです。

```
const [tasks, setTasks] = useState([
{ id: 1, text: '牛乳を買う', done: false },
{ id: 2, text: '掃除をする', done: false },
]);

const toggleTask = (idToUpdate) => {
setTasks(
tasks.map(task => {
// 更新したいidと一致した場合
if (task.id === idToUpdate) {
// taskオブジェクトを展開し、doneプロパティだけを上書きした「新しいオブジェクト」を返す
return { ...task, done: !task.done };
} else {
// それ以外の要素は、そのまま返す
return task;
}
})
);
};

// toggleTask(2) を実行後のtasks:
// [
//   { id: 1, text: '牛乳を買う', done: false },
//   { id: 2, text: '掃除をする', done: true } // ← ここが更新された
// ]
```

### 3\. 配列の特定の位置に要素を挿入する (splice の代替)

破壊的変更を行う `splice()` の代わりに、`slice()` とスプレッド構文を組み合わせて、配列の途中に要素を挿入します。

例えば `['A', 'B', 'D']` という配列の2番目（インデックス `1` の位置）に `C` を追加して、 `['A', 'C', 'B', 'D']` にしたい場合の例です。

```
const [items, setItems] = useState(['A', 'B', 'D']);
const newItem = 'C'; // 追加したい新しい要素
const targetIndex = 1; // 2番目（インデックス1）に追加

const insertItem = () => {
setItems([
...items.slice(0, targetIndex), // 1. 挿入位置より「前」をコピー
newItem,                         // 2. 新しい要素を追加
...items.slice(targetIndex)    // 3. 挿入位置「以降」をコピー
]);
};

// --- 処理の流れ ---
// items.slice(0, 1) は ['A'] を返す
// newItem は 'C'
// items.slice(1) は ['B', 'D'] を返す
//
// これらを ... で展開して新しい配列 [] に入れると:
// ['A', 'C', 'B', 'D'] になる
```

この方法は、元の配列を `slice` で2つの部分（挿入位置の前と、挿入位置以降）に分割します。

それらをスプレッド構文 `...` で展開し、間に新しい要素を挟みます。

結果として、元の配列（`items`）を一切変更せず、**完全に新しい配列**を作ることができます。

（※もし「2番目の後（インデックス `2` の位置）」に追加したい場合は、`slice(0, 2)` と `slice(2)` になります。）

### 4\. 配列から特定の項目を削除する (filter)

特定の項目を削除するには、<strong>`filter()`</strong> メソッドを使います。`filter()` は、条件に合う（trueになった）要素だけを集めた**新しい配列を返す**ので、Reactと非常に相性が良いです。

```
const [users, setUsers] = useState([
{ id: 1, name: '佐藤' },
{ id: 2, name: '鈴木' },
{ id: 3, name: '高橋' },
]);

const deleteUser = (idToDelete) => {
// 削除したいidと一致しない( !== )ユーザーだけを集めて、新しい配列を作る
setUsers(users.filter(user => user.id !== idToDelete));
};

// deleteUser(2) を実行後のusers:
// [ { id: 1, name: '佐藤' }, { id: 3, name: '高橋' } ]
```

## まとめ

`useState`での配列の更新は、<strong>「スプレッド構文や`filter`, `map`などを使って、事前に加工した『新しい配列』を作り、それで状態を丸ごと上書きする」</strong>のが基本です。

どの操作も、<strong>イミュータビリティ（不変性）</strong>、つまり<strong>「元のデータを壊さずに、コピーを元に新しいデータを作る」</strong>というReactの基本ルールに従っているのがポイントです。
