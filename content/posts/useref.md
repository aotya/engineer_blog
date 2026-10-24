---
title: useRef使い方とuseStateとの使い分け
date: '2026-06-15T14:01:54'
modified: '2026-06-15T14:01:54'
categories:
  - react
  - coding
excerpt: useRefについての使い方とuseStateの使い分けについて説明しています。
eyecatch: /images/uploads/2026/06/15140145/useref.webp
---
ReactでのアニメーションやDOM操作でお世話になる`useRef`。しかし、コピペやAI任せの「バイブスコーディング」で対応してしまっているせいで、その本質をイマイチ把握しきれていないエンジニアも意外と多いのではないでしょうか？\
本記事では、動的に要素を操作する際の`useRef`の役割と、簡易アニメーション実装時における`useState`との使い分けについて分かりやすく解説します。

## useStateとuseRefの違い

`useState`と`useRef`の最大の違いは、「<span class="marker">値の更新によって再レンダリングが発生するかどうか</span>」です。\
`useRef`を使うのは、主に「再レンダリングを起こさずに値を保持したい場合」や「DOM要素に直接アクセスしたい場合」です。パフォーマンスを最適化する上でも、この「再レンダリングを回避できる」という特性の理解が欠かせません。\
簡単に違いをまとめましたので、下記を参考にしてみてください。

| 観点 | useState | useRef |
| --- | --- | --- |
| 再レンダリング | 値が変わると走る | 値が変わっても走らない |
| 更新方法 | setState() 経由 | .current = 値 で直接代入 |
| 反映タイミング | 次のレンダー後（非同期的） | 即座に反映 |
| DOM参照 | 不可 | 可能 |
| 返り値の形 | \[値, setter\] の配列 | { current: 値 } オブジェクト |
| 主な用途 | カウンター、フォーム入力値、トグルのon/off、ローディング状態 | タイマーID、DOM要素への参照、前回値の記憶、フラグ管理、アニメーション制御 |

## 基本の使い方

### useState（画面の更新を伴う状態管理）

```

import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0); // [現在の値, 更新関数]

  return (
    <button onClick={() => setCount(count + 1)}>
      クリック数: {count}
    </button>
  );
}
```

### useRef（DOMへのアクセスと値の保持）

DOM要素へのアクセスは、アニメーションだけでなく、モーダル開閉時のフォーカス移動など、アクセシビリティ（A11y）を意識した実装にも必須のテクニックです。

```

import { useRef } from 'react';

function FocusInput() {
  const inputRef = useRef(null); // { current: null }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>
        フォーカス
      </button>
    </>
  );
}
```

### 使い分けの判断フロー

| ケース | 使うべきフック | 例 |
| --- | --- | --- |
| 値が変わったときに画面を更新したい | useState | カウンター、入力値、ローディング状態 |
| DOM要素に直接アクセスしたい | useRef | フォーカス、スクロール、canvas、動画制御 |
| GSAPなど命令型ライブラリでアニメーションを制御したい | useRef | 要素の取得 → gsap.to(ref.current, {…}) |
| Framer Motionでアニメーションを制御したい | どちらでもない | motion.div にpropsを渡すだけ、refは基本不要 |
| 再レンダリングをまたいで値を保持したいが画面更新は不要 | useRef | タイマーID、フラグ、前回値の記憶 |

## アニメーション制御における留意点

アニメーションは`useRef`のわかりやすいユースケースのひとつですが、**採用するライブラリによってアプローチが異なります**。

| ライブラリ | useRefの必要性 | 理由 |
| --- | --- | --- |
| GSAP / anime.js | 必要 | DOM要素を直接操作するため ref で取得する |
| Framer Motion | ほぼ不要 | motion.div にpropsを渡すだけで動く |
| CSSトランジションのみ | 不要 | クラスの付け外しを useState で管理できる |

**GSAPでの例**

```

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

function FadeIn() {
  const boxRef = useRef(null);

  useEffect(() => {
    gsap.to(boxRef.current, { opacity: 1, duration: 1 });
  }, []);

  return <div ref={boxRef} style={{ opacity: 0 }}>フェードイン</div>;
}
```

### よくあるアンチパターン

<strong>❌ UIに反映したい値をrefに入れてしまう</strong>

```

// refを更新しても画面が更新されない
const countRef = useRef(0);
const handleClick = () => {
  countRef.current++; // ← 画面は変わらない！
};

// ✅ UIに反映したいならstateを使う
const [count, setCount] = useState(0);
const handleClick = () => setCount(c => c + 1);
```

<strong>❌ レンダリング中に ref.current を読み書きする</strong>

`ref.current`の操作は、イベントハンドラや`useEffect`の中で行うのが原則です。<span class="marker">JSX内（レンダリング中）での読み書きは予期しない動作を引き起こす可能性があります。</span>

### 実践サンプル：タイマーの制御

stateとrefを組み合わせた典型例です。表示する秒数はstate、タイマーIDはrefで管理します。

```

function Stopwatch() {
  const [time, setTime] = useState(0);   // 画面に表示するのでstate
  const timerRef = useRef(null);          // IDは画面に出さないのでref

  const start = () => {
    timerRef.current = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current);
  };

  return (
    <>
      <p>{time}秒</p>
      <button onClick={start}>スタート</button>
      <button onClick={stop}>ストップ</button>
    </>
  );
}
```

### まとめ

判断の基準はシンプルです。<span class="marker">「この値が変わったとき、画面を更新する必要があるか？」</span>という問いに答えるだけです。

Yesなら`useState`、Noなら`useRef`。

DOMへのアクセスやGSAPなどを使ったアニメーション制御が必要なときも`useRef`の出番です。
