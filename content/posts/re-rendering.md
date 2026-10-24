---
title: Reactで余計な再レンダリングを防ぐ方法（useCallback / React.memo）
date: '2025-11-22T14:08:51'
modified: '2025-11-22T14:09:14'
categories:
  - react
  - coding
excerpt: >-
  Reactのパフォーマンス改善に欠かせない「余計な再レンダリングを防ぐ方法」を解説。useCallbackとReact.memoの正しい使い分けや、セットで実装すべき理由をコード例付きで紹介します。
eyecatch: /images/uploads/2025/11/22140828/rendering.webp
---
Reactの実装でエンジニアが意識すべき点の一つに、 「余計な再レンダリングを防ぐ」 というパフォーマンスチューニングがあります。 再レンダリングが頻発すると画面の描画負荷（メインスレッドのブロック）が高まり、ユーザーの操作性を損なう原因になるため、レンダリングは必要最低限に抑えるのが理想です。

## 余計な再レンダリングが発生する理由

Reactは「状態（State）が変化した時」に画面（DOM）を更新します。動的なUIを作る上でレンダリング自体は必須ですが、<strong class="marker">問題なのは「変更が必要ない箇所まで巻き添えで再レンダリングされる」ケースです。</strong>

特に多いのが以下のパターンです。

<strong>・親コンポーネントが再レンダリングされると、子コンポーネントも無条件で再レンダリングされる</strong>

<strong>・値（Props）の実質的な中身は変わっていないのに、「新しいデータ」として検知されてしまう</strong>

逆に言えば、この「巻き添え」と「誤検知」を防げば、レンダリングコストを大幅に削減できます。

### useCallbackとReact.memoが基本セット

この問題を解決するための代表的なフック・関数が **useCallback** と **React.memo** です。

<strong>・React.memo</strong>：コンポーネントをメモ化する。渡されたPropsに変更がなければ、親が再レンダリングされても、このコンポーネントは再レンダリングしない。

<strong>・useCallback</strong>：関数定義をメモ化する。依存配列が変わらない限り、再レンダリング前と同じ関数（同じ参照）を使い回す。

<strong class="marker">重要なのは、これらは「セットで使う」ケースが多いということです。</strong>

### なぜセットで使う必要があるのか？

<strong class="marker">Reactの仕組み上、コンポーネント内で定義した関数は、再レンダリングのたびに作り直され、新しいメモリ番地（参照）」が割り当てられます。</strong>

もし `React.memo` だけを使っていても、Propsとして渡される関数が毎回「別人（新しい参照）」になってしまうため、Propsが変更されたとみなされ、再レンダリングを防げません。

<strong>【処理の流れイメージ】</strong>\
1.`setTitle('新しいタイトル')` を実行（State更新）

2.親コンポーネントが再レンダリング開始

3.useCallback → 関数（`handleTitleChange`）は再作成されず、前回のものを維持

4.React.memo → 子コンポーネントは「Props（関数）が変わっていない」と判断

5.結果： 関係のない子コンポーネントの再レンダリングがスキップされる

## 具体的な使い分けパターン

基本はセットですが、Propsの中身によって使い分けます。

### 1\. 関数をPropsとして渡す場合 → 両方必要

```
// 親コンポーネント
// 関数をuseCallbackでラップして、参照を固定する
const handleClick = useCallback(() => {
  console.log("Clicked");
}, []); 

return <Child onClick={handleClick} />;

// 子コンポーネント
// React.memoでPropsの変更を監視する
const Child = memo(({ onClick }) => {
  console.log("Child Rendered");
  return <button onClick={onClick}>Click me</button>;
});
```

\
ここで `useCallback`を忘れると、`handleClick`が毎回作り直されるため、`Child` の `React.memo` は意味をなさなくなります。

### 2\. 関数以外のオブジェクト・配列を渡す場合 → useMemo + React.memo

関数と同様に、オブジェクトや配列も毎回新しい参照として生成されるため、useMemo で値を固定する必要があります。

```
// 親コンポーネント
const data = useMemo(() => ({ name: 'test' }), []); // 値自体をメモ化
return <Child data={data} />;

// 子コンポーネント
const Child = memo(({ data }) => {});
```

### 実装デモ（State管理とメモ化）

以下は、記事投稿画面を想定した「両方セット」の実装例です。

```
// 親（BlogPage）
// ハンドラー関数をuseCallbackでメモ化
const handleTitleChange = useCallback((newTitle: string) => {
  setTitle(newTitle);
}, []);

const handleFileChange = useCallback((file: File | null) => {
  setSelectedFile(file);
}, []);

return (
  <>
    {/* 各子コンポーネントにメモ化した関数を渡す */}
    <ArticleSettings 
      title={title}
      onChangeTitle={handleTitleChange}
      onChangeFile={handleFileChange}
    />
    <ArticlePage 
      content={htmlContent}
      onChangeContent={setHtmlContent} 
    />
  </>
);

// 子（ArticleSettings）
// React.memoでラップして、Propsが変わらない限り再レンダリングを防ぐ
const ArticleSettings = memo(({ title, onChangeTitle, onChangeFile }) => {
  // ...実装
});
```

## まとめ

動的な更新が多いアプリケーションでは、`useCallback` と `React.memo` を組み合わせたチューニングが重要になります。

ただし、以下の点には注意が必要です。

<strong>・コードが複雑になる：ボイラープレート（定型コード）が増え、可読性が下がる可能性があります。</strong>

<strong>・早すぎる最適化は避ける：小規模なアプリや、再レンダリングされても一瞬で終わるような軽いコンポーネントであれば、無理にメモ化する必要はありません。</strong>

<strong class="marker">まずは機能を実装し、「動作が重い」「プロファイラで無駄なレンダリングを確認した」という段階で導入することをおすすめします。</strong>
