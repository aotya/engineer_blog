---
title: JavaScriptの配列操作メソッド
date: '2026-02-22T13:25:37'
modified: '2026-02-22T13:25:37'
categories:
  - js
  - coding
excerpt: >-
  動的ページでAPIにリクエストして取得したデータから、条件に合ったものの有無を調べたいケースは、実務でも度々あると思います。
  その場合は、jsの配列操作などが必要になりますが、慣れていないと意外とどのように対応すればいい […]
eyecatch: /images/uploads/2026/02/22131811/js_array.webp
---
動的ページでAPIにリクエストして取得したデータから、条件に合ったものの有無を調べたいケースは、実務でも度々あると思います。

その場合は、jsの配列操作などが必要になりますが、慣れていないと意外とどのように対応すればいいか手が止まることが多いです。

「できることは分かるけど…」といった感じで、面倒になりAIに丸投げしてしまう人も多いと思います。

AIに丸投げすることが悪いわけではないですが、合っているかどうか、最適かどうか判断するために、<span class="marker">配列操作の手法は正しく覚えておきましょう。</span>

## 主要な3つの手法

| メソッド | 返り値 | 直感的なイメージ | 使い時 |
| --- | --- | --- | --- |
| <span class="singleCode">includes</span> | <span class="singleCode">boolean</span> | 「これ、入ってる？」 | プリミティブな値（文字列や数値）を探す時 |
| <span class="singleCode">some</span> | <span class="singleCode">boolean</span> | 「条件に合うやつ、1人でもいる？」 | オブジェクトの配列で、存在確認だけしたい時 |
| <span class="singleCode">find</span> | 要素そのもの / <span class="singleCode">undefined</span> | 「条件に合うやつ、連れてきて」 | 存在確認した上で、その中身を後で使いたい時 |
| <span class="singleCode">every</span> | <span class="singleCode">boolean</span> | 全て条件に合っているか | オブジェクトの配列で、全てのアイテムが条件を満たしているか確認したい時 |

## 具体的な使い分けと例

Reactでよくある「ユーザーリスト」や「タグ」の操作を例に解説します。

### 1\. includes：単純な値のチェック

最も直感的です。引数には「探したい値そのもの」を入れます。

```
const tags = ['react', 'nextjs', 'typescript'];

// 「react」が含まれているか？
const hasReact = tags.includes('react'); // true
```

### 2\. some：条件に合うものが「1つでもあるか」

「特定のIDを持つユーザーがいるか？」など、<span class="marker">条件（関数）を使ってチェックしたい場合</span>に使います。

```
const users = [
  { id: 1, name: '田中', active: true },
  { id: 2, name: '佐藤', active: false }
];

// activeなユーザーが1人でもいるか？
const hasActiveUser = users.some(user => user.active); // true
```

### 3\. find：条件に合うものを「取り出す」

「存在するかどうか」だけでなく、<span class="marker">そのデータを使って何かをしたい（表示したい、別の関数に渡したい）時</span>に使います。

```
// IDが2のユーザー情報を取得したい
const user = users.find(user => user.id === 2); 

if (user) {
  console.log(user.name); // "佐藤"
}
```

<div class="cautionContainer"><span class="cautionLabel">注意</span><p></p><p>見つからないと <span class="code">undefined</span> を返すため、Reactで使う場合は <span class="code">user?.name</span> のように<strong>オプショナルチェイニング</strong>を組み合わせるのが定石です。</p></div>

### 4.every：全て条件に合致しているか

リストのアイテムがすべて条件と一致しているかどうかを判定する（<span class="marker">falseがあった時点で終了</span>）

```
const items = [
  { id: 1, text: '牛乳を買う', completed: true },
  { id: 2, text: '掃除をする', completed: true },
];

// すべて完了しているか？
const allCompleted = items.every(item => item.completed);
```

## 階層が２段、３段となっていく場合のアプローチ

### 1\. 入れ子のsomeで愚直に探す

階層が2段（例：部署 > ユーザー）くらいであれば、これが一番シンプルです。

```
const departments = [
  { name: "営業", users: [{ id: 1, name: "田中" }, { id: 2, name: "佐藤" }] },
  { name: "開発", users: [{ id: 3, name: "鈴木" }] }
];

// ID 3 のユーザーがいるかチェック
const hasUser3 = departments.some(dept => 
  dept.users.some(user => user.id === 3)
);
```

<div class="pointContainer"><span class="pointLabel">ポイント</span><p></p><p>外側の <span class="code">some</span> は、内側の <span class="code">some</span> が <span class="code">true</span> を返した瞬間にループを止めてくれるので、実は効率的です。</p></div>

### 2.flatMapで「平坦化」してから探す

「入れ子構造を考えるのが面倒！」という時に一番便利なのが `flatMap` です。多階層の配列を<span class="marker">1次元の平坦な配列に変換</span>してから、いつものように探します。

```
// 全ユーザーを一列の配列に並べ替えるイメージ
const allUsers = departments.flatMap(dept => dept.users);

// あとは普通の配列として扱える
const hasUser3 = allUsers.some(user => user.id === 3);
const user3 = allUsers.find(user => user.id === 3);
```

<div class="pointContainer"><span class="pointLabel">ポイント</span><p></p><p>「どこに何があるか」を気にせず、条件だけに集中できるので、Reactのコンポーネント内でもロジックがスッキリします。</p></div>

### 3\. 再帰関数を使う（階層が未知の場合）

フォルダ構造のように、「どこまで深く続くかわからない」場合は<span class="marker">再帰（自分自身を呼び出す関数）</span>を使います。

```
const treeData = {
  id: 1,
  children: [
    { id: 2, children: [{ id: 3, children: [] }] },
    { id: 4, children: [] }
  ]
};

const exists = (node, targetId) => {
  if (node.id === targetId) return true;
  if (node.children) {
    return node.children.some(child => exists(child, targetId));
  }
  return false;
};

console.log(exists(treeData, 3)); // true
```

### オプショナルチェイニングを忘れずに

深い階層を探すとき、途中のデータが `null` や `undefined` だとエラーで落ちてしまいます。

```
// dept.users が存在しないかもしれない場合
const hasUser = departments.some(dept => 
  dept.users?.some(user => user.id === 3)
);
```

### パフォーマンスの注意点

Reactの `Array.find` や `some` は、基本的に <span class="marker">データの数だけ時間がかかります。</span>数千〜数万件のデータから頻繁に検索を行う場合は、配列のままではなく <span class="marker">Map やSetに変換して保持する</span>ことを検討したほうが良いでしょう。
