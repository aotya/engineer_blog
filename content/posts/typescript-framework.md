---
title: TypeScriptの「フレームワーク系の型」まとめ
date: '2026-03-21T11:21:52'
modified: '2026-03-21T11:44:20'
categories:
  - typescript
  - coding
excerpt: >-
  「FCってなに？」「HTMLInputElementはどこで使う？」TypeScriptを学ぶ中で、Reactのフレームワーク系の型に戸惑った経験はありませんか？この記事では、実務でよく登場するFC・HTMLElement・ChangeEvent・Partialなど10種類の型を、使いどころとサンプルコードとともに丁寧に解説します。
eyecatch: /images/uploads/2026/03/21112137/ts_framework.webp
---
`string` や `number` は分かるのに、`FC` や `HTMLInputElement` などは「どこで使うの？」となったり、自動補完で出てきたから何も考えずにコーティングしたりしませんか？\
この記事では <span class="marker">Reactを使った実務でよく出てくる型</span> を、使いどころと一緒に整理しています。

## そもそも「フレームワーク系の型」って何？

### 自分で作る型 と 用意されている型

TypeScriptの型には大きく2種類あります。

```
// ① 自分で定義する型
type User = {
  name: string;
  age: number;
};

// ② Reactがあらかじめ用意してくれている型（＝フレームワーク系の型）
const handleChange = (e: ChangeEvent<HTMLInputElement>) => { ... };
```

`ChangeEvent` は自分で作ったわけではありません。Reactのライブラリの中にあらかじめ定義されていて、importして使える型です。これが「フレームワーク系の型」です。

### なぜ存在するのか

たとえば `onChange` のイベントオブジェクト `e` には、こんなプロパティがあります。

```
e.target.value    // 入力値
e.target.checked  // チェック状態
e.preventDefault() // デフォルト動作を止める
```

TypeScriptが `e` の中身を正しく認識するには、「`e` はこういう形のオブジェクトです」という型情報が必要です。それをReactが `ChangeEvent<HTMLInputElement>` として定義して提供してくれています。自分で一から書くのは大変なので、「使っていいよ」と渡してくれているイメージです。

### 自分で作る型との違い

|  | 自分で定義する型 | フレームワーク系の型 |
| --- | --- | --- |
| 例 | type User = { name: string } | FC, ChangeEvent, ReactNode |
| 誰が作る | 自分 | ReactやTypeScriptの開発チーム |
| どこにある | 自分のコード | ライブラリの中（importして使う） |
| なぜある | 独自のデータ構造を表すため | DOMやReactの仕組みを型で表すため |

つまり「フレームワーク系の型」とは、<span class="marker">ライブラリが提供してくれる既製品の型</span>です。自分で0から書かなくていいぶん、「どこで何を使うか」を覚えることがポイントになります。

## 1\. FC（FunctionComponent）

Reactのコンポーネントを定義するときに使う型です。

```
import { FC } from "react";

type Props = {
  name: string;
  age: number;
};

const UserCard: FC<Props> = ({ name, age }) => {
  return (
    <div>
      <p>{name}</p>
      <p>{age}歳</p>
    </div>
  );
};
```

`FC<Props>` の `<Props>` 部分でpropsの型を渡します。

### 最近の書き方

`FC` を省略してpropsに直接型を書くスタイルも主流になっています。

```
type Props = {
  name: string;
  age: number;
};

// FC省略版
const UserCard = ({ name, age }: Props) => {
  return (
    <div>
      <p>{name}</p>
      <p>{age}歳</p>
    </div>
  );
};
```

どちらでもOKですが、チームで統一することが大切です。

## 2\. HTML要素の型（HTMLElement系）

DOMに直接アクセスするとき（`useRef`など）に使います。

```
import { useRef } from "react";

const SearchInput = () => {
  // inputタグへの参照 → HTMLInputElement
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    inputRef.current?.focus(); // inputにフォーカスを当てる
  };

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="検索..." />
      <button onClick={handleFocus}>フォーカス</button>
    </div>
  );
};
```

### タグと型の対応表

| HTMLタグ | TypeScriptの型 |
| --- | --- |
| \<input> | HTMLInputElement |
| \<button> | HTMLButtonElement |
| \<div> | HTMLDivElement |
| \<form> | HTMLFormElement |
| \<select> | HTMLSelectElement |
| \<textarea> | HTMLTextAreaElement |
| \<a> | HTMLAnchorElement |
| \<img> | HTMLImageElement |

覚え方：`HTML` + タグ名（先頭大文字）+ `Element` と覚えるとスムーズです。

## 3\. イベント系の型（ChangeEvent / MouseEvent など）

`onChange` や `onClick` のイベントハンドラに使います。

### ChangeEvent（入力フォーム）

```
import { ChangeEvent, useState } from "react";

const Form = () => {
  const [text, setText] = useState("");

  // inputの変更イベント → ChangeEvent<HTMLInputElement>
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  return <input value={text} onChange={handleChange} />;
};
```

### MouseEvent（クリック）

```
import { MouseEvent } from "react";

const Button = () => {
  // ボタンのクリックイベント → MouseEvent<HTMLButtonElement>
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    console.log("クリック位置:", e.clientX, e.clientY);
  };

  return <button onClick={handleClick}>クリック</button>;
};
```

### FormEvent（フォーム送信）

```
import { FormEvent } from "react";

const LoginForm = () => {
  // フォームの送信イベント → FormEvent<HTMLFormElement>
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ページリロードを防ぐ
    console.log("送信！");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button type="submit">送信</button>
    </form>
  );
};
```

### イベント系の型まとめ

| 操作 | 型 |
| --- | --- |
| inputの変更 | ChangeEvent\<HTMLInputElement> |
| textareaの変更 | ChangeEvent\<HTMLTextAreaElement> |
| selectの変更 | ChangeEvent\<HTMLSelectElement> |
| クリック | MouseEvent\<HTMLButtonElement> |
| フォーム送信 | FormEvent\<HTMLFormElement> |
| キー入力 | KeyboardEvent\<HTMLInputElement> |

## 4\. ReactNode / ReactElement

コンポーネントの `children` を受け取るときに使います。

```
import { FC, ReactNode } from "react";

type Props = {
  children: ReactNode; // テキスト、コンポーネント、null など何でも受け取れる
  title: string;
};

const Card: FC<Props> = ({ children, title }) => {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
};

// 使い方
const App = () => (
  <Card title="プロフィール">
    <p>ここに何でも入れられる</p>
  </Card>
);
```

### ReactNode と ReactElement の違い

| 型 | 受け取れるもの |
| --- | --- |
| ReactNode | JSX、文字列、数値、null、undefined など何でも |
| ReactElement | JSXのみ（文字列や null は不可） |

基本は `ReactNode` を使えばOKです。

## 5\. CSSProperties

インラインスタイルの型です。

```
import { CSSProperties } from "react";

type Props = {
  color?: string;
  style?: CSSProperties; // style属性に渡せるオブジェクト
};

const Text = ({ color = "black", style }: Props) => {
  const baseStyle: CSSProperties = {
    color,
    fontSize: "16px",
    fontWeight: "bold",
  };

  return <p style={{ ...baseStyle, ...style }}>テキスト</p>;
};
```

`style={{ color: “red” }}` として渡すオブジェクトの型です。typoや不正なプロパティを防いでくれます。

## 6\. Dispatch / SetStateAction（useState の setter）

`useState` のsetter関数を別コンポーネントに渡すときに使います。

```
import { Dispatch, SetStateAction, FC } from "react";

type Props = {
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
};

const Counter: FC<Props> = ({ count, setCount }) => {
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount((prev) => prev - 1)}>-1</button>
    </div>
  );
};

// 親コンポーネント
const App = () => {
  const [count, setCount] = useState(0);

  return <Counter count={count} setCount={setCount} />;
};
```

## 7\. Record

オブジェクトのキーと値の型を指定したいときに使います。

```
// Record<キーの型, 値の型>

// 例1: 文字列キー → 数値
const scores: Record<string, number> = {
  Alice: 95,
  Bob: 80,
};

// 例2: ユニオン型でキーを制限する
type Status = "active" | "inactive" | "pending";

const statusLabels: Record<Status, string> = {
  active: "有効",
  inactive: "無効",
  pending: "保留中",
};
// ← "active", "inactive", "pending" の3つが揃っていないとエラー
```

## 8\. Partial / Required / Readonly

既存の型を変形させるユーティリティ型です。

```
type User = {
  id: number;
  name: string;
  email: string;
};

// Partial: すべてのプロパティをオプショナルに
type PartialUser = Partial<User>;
// → { id?: number; name?: string; email?: string }

// 更新処理でよく使う
const updateUser = (id: number, updates: Partial<User>) => {
  // updatesは一部のフィールドだけでいい
};

// Required: すべてのプロパティを必須に
type RequiredUser = Required<User>;

// Readonly: すべてのプロパティを読み取り専用に
const frozenUser: Readonly<User> = { id: 1, name: "田中", email: "tanaka@example.com" };
// frozenUser.name = "山田"; // エラー！
```

## 9\. NonNullable

`null` と `undefined` を除外する型です。

```
type MaybeString = string | null | undefined;

// NonNullable で null/undefined を除外
type DefinitelyString = NonNullable<MaybeString>; // string

// APIレスポンスが null かもしれないとき
const displayName = (name: string | null): NonNullable<string> => {
  return name ?? "名無し";
};
```

## 10\. ReturnType / Parameters

関数から型を取り出すときに使います。

```
const fetchUser = async (id: number) => {
  return { id, name: "田中", email: "tanaka@example.com" };
};

// ReturnType: 関数の戻り値の型を取得
type FetchUserReturn = Awaited<ReturnType<typeof fetchUser>>;
// → { id: number; name: string; email: string }

// Parameters: 関数の引数の型を取得
type FetchUserParams = Parameters<typeof fetchUser>;
// → [id: number]
```

既存の関数と同じ型を使い回したいときに便利です。

## まとめ

| 型 | 使いどころ |
| --- | --- |
| FC\<Props> | Reactコンポーネントの定義 |
| HTMLInputElement など | useRef でDOM要素を参照 |
| ChangeEvent\<T> | inputの onChange |
| MouseEvent\<T> | ボタンの onClick |
| FormEvent\<T> | フォームの onSubmit |
| ReactNode | children を受け取るとき |
| CSSProperties | インラインスタイルの型 |
| Dispatch\<SetStateAction\<T>> | stateのsetter関数を渡すとき |
| Record\<K, V> | キーと値を持つオブジェクトの型 |
| Partial\<T> | 更新処理など一部のフィールドだけ必要なとき |
| NonNullable\<T> | null/undefinedを除外したいとき |
| ReturnType\<T> | 関数の戻り値から型を取り出す |

最初から全部覚えようとしなくて大丈夫です。エラーが出たときに「この型ってなんだっけ？」と調べながら使っていくうちに、<span class="marker">自然と身についていきます</span>。
