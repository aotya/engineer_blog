---
title: Reactで複数のコンテンツを同期スクロールさせる方法
date: '2026-05-22T12:13:59'
modified: '2026-05-22T12:13:59'
categories:
  - react
  - coding
excerpt: >-
  Reactで複数の要素のスクロールを同期させる方法を解説します。相互スクロールによるフィードバックループ（無限ループ）を防ぎ、遅延なくスムーズに位置を同期するカスタムフックの実装手順から、スマホでのUXを劇的に向上させるCSSの設定までステップごとに分かりやすく紹介します。
eyecatch: /images/uploads/2026/05/22121339/synchronous-scrolling-scaled.webp
---
二つのコンテンツを同期させてスクロールさせたい（表などで）ケースがあると思います。

遅延を最小限に抑えて、スムーズにスクロールさせようとすると意外と難しいものです。

この処理の最大のポイントは、<strong><span class="marker">無限ループ（フィードバックループ）を防ぎつつ、遅延なく滑らかに同期させている点</span></strong>です。

この処理の流れをステップごとに分かりやすく解説していきたいと思います。

## 同期スクロールのデモ

あなたが実装したい同期スクロールとデモが一致しているか確認してください。

<p><iframe src="https://codesandbox.io/embed/khvd82?view=preview" style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;" title="react-resizable" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe></p>

## 主要なコード

詳しい説明の前に、同期スクロールさせるための処理を一旦お見せします。

```
// スクロール同期のカスタムフック
const useScrollSync = () => {
  const headerContainerRef = useRef<HTMLDListElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // ユーザーが操作中のスクロール元インデックスを記録する
  // 同期によって発火した他要素のスクロールイベントは、スクロール元と異なるインデックスになるため無視できる
  const scrollingSourceRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = (scrolledIndex: number) => {
    // アクティブなスクロール元が存在し、かつ今回のイベントが別の要素から来た場合は無視（同期によるフィードバックループ防止）
    if (scrollingSourceRef.current !== null && scrollingSourceRef.current !== scrolledIndex) {
      return;
    }

    scrollingSourceRef.current = scrolledIndex;

    // スクロール元の scrollLeft を、他の要素へ即座に反映する
    // (requestAnimationFrame を介すると同期先が1フレーム遅延し、視覚的なズレ・かくつきの原因になるため同一フレームで適用する)
    const scrollRefs = [headerContainerRef, mainContainerRef];
    const source = scrollRefs[scrolledIndex].current;
    if (source) {
      const scrollLeft = source.scrollLeft;
      scrollRefs.forEach((ref, index) => {
        if (index !== scrolledIndex && ref.current && ref.current.scrollLeft !== scrollLeft) {
          ref.current.scrollLeft = scrollLeft;
        }
      });
    }

    // スクロールが止まったら一定時間後にスクロール元をリセット
    // (慣性スクロールが続く間も含めて、安全側にやや長めに設定)
    if (scrollEndTimerRef.current !== null) {
      clearTimeout(scrollEndTimerRef.current);
    }
    scrollEndTimerRef.current = setTimeout(() => {
      scrollingSourceRef.current = null;
      scrollEndTimerRef.current = null;
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current !== null) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);

  return { headerContainerRef, mainContainerRef, handleScroll };
};
```

| インデックス | ref | UI要素 |
| --- | --- | --- |
| 0 | headerContainerRef | ヘッダー |
| 1 | mainContainerRef | メインコンテンツ |

各ブロックに `ref` と `onScroll` を付与して連携させます。

<strong>使い方（コンポーネント側）</strong>

* * *

```
// JSX側
<dl 
  className="headerContainer"
  ref={headerContainerRef}
  onScroll={() => handleScroll(0)}
>
  {/* 中略 */}
</dl>

<div 
  className="mainContainer"
  ref={mainContainerRef}
  onScroll={() => handleScroll(1)}
>
  {/* 中略 */}
</div>
```

### 処理の流れ

-   ・1.ユーザーが片方をスクロールする。
-   ・2.スクロール元として記録し、他方からの自動スクロールイベントをシャットアウトする。
-   ・3.スクロール位置をもう片方の要素にコピーする。
-   ・4.スクロールが止まって150ms経ったら、ロックを解除する。

## 実装の詳細説明

ステップごとに説明していきます。

### ステップ1：必要な要素と状態の準備

```
const headerContainerRef = useRef<HTMLDListElement>(null);
const mainContainerRef = useRef<HTMLDivElement>(null);

const scrollingSourceRef = useRef<number | null>(null);
const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

ここでは、DOM（HTML要素）や状態を保持するための箱（`useRef`）を4つ準備しています。

1\. <strong>`headerContainerRef`</strong> / <strong>`mainContainerRef`</strong>\
スクロールを同期させたい2つのHTML要素に直接アクセスするための「参照（Ref）」です。

2\. <strong>`scrollingSourceRef`</strong>\
今、ユーザーがどちらの要素を操作しているか（0: ヘッダー、1: メイン）を記憶する箱です。プログラムによるスクロールの無限ループを防ぐためのキーパーソンです。

3\. <strong>`scrollEndTimerRef`</strong>\
スクロールが完全に止まったことを判定するための、タイマーのIDを記憶する箱です。

### ステップ2：無限ループ（フィードバックループ）の防止

ここからは `handleScroll` 関数の中身です。各コンテナの `onScroll` イベントで呼び出されます。

```
if (scrollingSourceRef.current !== null && scrollingSourceRef.current !== scrolledIndex) {
  return;
}

scrollingSourceRef.current = scrolledIndex;
```

ここでは、<strong><span class="marker">「プログラムによって自動で発生したスクロールイベント」を無視する</span></strong>処理を行っています。

例えば、ユーザーがメイン領域（インデックス `1`）をスクロールしたとします。

1\. `scrollingSourceRef` に `1` が記録されます。\
2\. この後、プログラムがヘッダー（インデックス `0`）を自動でスクロールさせます（ステップ3の処理）。\
3\. ヘッダーが動くことで、ヘッダーのスクロールイベントが発火し、`handleScroll(0)` が呼ばれます。\
4\. この時、`scrollingSourceRef` は `1` なのに、呼ばれた引数は `0` なので、最初の `if` 文に引っかかり、<strong><span class="marker">何もせずに処理を終了</span></strong>します。

これによって「お互いにスクロールさせ合う」無限ループをピタッと止めています。

### ステップ3：スクロール位置の同期（即時反映）

```
const scrollRefs = [headerContainerRef, mainContainerRef];
const source = scrollRefs[scrolledIndex].current;
if (source) {
  const scrollLeft = source.scrollLeft;
  scrollRefs.forEach((ref, index) => {
    // 自分以外の要素で、スクロール位置がずれている場合のみ反映
    if (index !== scrolledIndex && ref.current && ref.current.scrollLeft !== scrollLeft) {
      ref.current.scrollLeft = scrollLeft;
    }
  });
}
```

ユーザーが動かした要素（`source`）の現在の横スクロール位置（`scrollLeft`）を取得し、<strong><span class="marker">もう一方の要素のスクロール位置に強制的に上書き</span></strong>しています。

コメントにもある通り、`requestAnimationFrame` や `setState` などを挟まず、ここで直接DOMを書き換える（即座に反映する）ことで、画面がカクついたり、少し遅れてついてくるような視覚的なズレを防いでいます。

### ステップ4：スクロール終了の検知とリセット

```
if (scrollEndTimerRef.current !== null) {
  clearTimeout(scrollEndTimerRef.current);
}
scrollEndTimerRef.current = setTimeout(() => {
  scrollingSourceRef.current = null;
  scrollEndTimerRef.current = null;
}, 150);
```

スクロール中は `handleScroll` が連続で何度も呼ばれます。\
呼ばれるたびに過去のタイマーをキャンセル（`clearTimeout`）し、新たに150ミリ秒後のタイマーをセットし直します。

ユーザーが指やマウスを離して**スクロールが完全に止まり、150ミリ秒経過して初めてタイマーが実行**され、`scrollingSourceRef` が `null` にリセットされます。\
これで、「誰もスクロールしていない状態」に戻り、次にどちらの要素を操作しても正しく反応できるようになります。

### クリーンアップ

```

  //クリーンアップ作業(処理中に遷移するとコンソールエラーを起こす可能性があるため)
  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current !== null) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);
```

スクロールをしている「真っ最中」に、ユーザーが別のページへのリンクをクリックしたと想像してください。

1\. ユーザーが猛烈にスクロールする。\
2\. スクロール終了を検知するための「150ミリ秒後のタイマー（`setTimeout`）」がセットされる。\
3\. <strong>タイマーが実行される直前に、ユーザーが別ページへ移動し、このコンポーネントが画面から消滅する（破棄される）。</strong>\
4\. 150ミリ秒経過し、タイマーの中身が実行される。\
5\. しかし、<strong>すでに画面には要素が存在しないため、メモリリークの警告や思わぬエラーが発生する可能性があります。</strong>

```
useEffect(() => {
  // ① ここは「コンポーネントが画面に表示された時（入居）」に実行される

  return () => {
    // ② ここは「コンポーネントが画面から消える時（退去）」に実行される
  };
}, []); // ③ 空の配列（[]）は「最初と最後だけやってね」という合図
```

### （おまけ）スクロール体験をさらに向上させるCSS

ロジックだけでなく、CSS側でも以下のプロパティを指定することで、スマホ（特にiOS）での操作感が劇的に改善します。

```
.scroll-container {
  overscroll-behavior-x: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x;
}
```

<table><thead><tr><th>プロパティ</th><th>役割・効果</th></tr></thead><tbody><tr><td>overscroll-behavior-x: none</td><td>横端までスクロールした時のバウンス（ゴムバンド効果）を防ぎ、画面全体が横揺れするのを防ぐ。</td></tr><tr><td>-webkit-overflow-scrolling: touch</td><td>古いiOS Safari等で、指を離した後も滑らかに進む「慣性スクロール」を有効にする。</td></tr><tr><td>touch-action: pan-x</td><td>「この要素は横スワイプだけ許可する（縦スクロールは親ページに任せる）」と明示し、斜めスワイプ時の引っ掛かりをなくす。<br>縦スクロールできないので使用は注意</td></tr></tbody></table>
