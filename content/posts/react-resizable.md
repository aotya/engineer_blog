---
title: react-resizableの使い方とデモ
date: '2026-02-11T04:45:15'
modified: '2026-02-11T04:45:15'
categories:
  - react
  - coding
excerpt: >-
  react-resizableの使い方やデモについて余り情報がなかったので、簡単な使い方の説明とデモを用意しました。
  複数のパターンを用意しましたので、ソースを見て、カスタマイズしてみてください！ デモ デモを見せてくれ […]
eyecatch: /images/uploads/2026/02/11043612/react-resizable.webp
---
react-resizableの使い方やデモについて余り情報がなかったので、簡単な使い方の説明とデモを用意しました。

複数のパターンを用意しましたので、ソースを見て、カスタマイズしてみてください！

## デモ

デモを見せてくれれば良いと思う人もいると思いますので、下記を参考にしてみてください。

<p><iframe src="https://codesandbox.io/embed/7m84cq?view=preview" style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;" title="react-resizable" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe></p>

ソース

```
import React, { useState } from "react";
import { Resizable, ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  section: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#333",
  },
  box: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #333",
    borderRadius: "8px",
    overflow: "hidden",
  },
};

function App() {
  const [size1, setSize1] = useState({ width: 200, height: 150 });
  const [size2, setSize2] = useState({ width: 200, height: 200 });

  return (
    <div style={styles.container}>
      <h1>react-resizable デモ</h1>

      {/* 1. 基本的な ResizableBox */}
      <div style={styles.section}>
        <h2 style={styles.title}>1. 基本的な ResizableBox</h2>
        <ResizableBox
          width={200}
          height={150}
          minConstraints={[100, 80]}
          maxConstraints={[400, 300]}
        >
          <div
            style={{
              ...styles.box,
              width: "100%",
              height: "100%",
              background: "#4CAF50",
              color: "white",
            }}
          >
            右下をドラッグ
          </div>
        </ResizableBox>
      </div>

      {/* 2. Resizable コンポーネント（状態管理あり） */}
      <div style={styles.section}>
        <h2 style={styles.title}>2. Resizable（サイズ表示付き）</h2>
        <Resizable
          width={size1.width}
          height={size1.height}
          onResize={(e, { size }) => setSize1(size)}
          minConstraints={[100, 80]}
          maxConstraints={[500, 400]}
        >
          <div
            style={{
              ...styles.box,
              width: size1.width,
              height: size1.height,
              background: "#2196F3",
              color: "white",
              flexDirection: "column",
            }}
          >
            <div>リサイズ可能</div>
            <div style={{ fontSize: "12px", marginTop: "8px" }}>
              {size1.width} x {size1.height}
            </div>
          </div>
        </Resizable>
      </div>

      {/* 3. アスペクト比固定 */}
      <div style={styles.section}>
        <h2 style={styles.title}>3. アスペクト比固定（1:1）</h2>
        <Resizable
          width={size2.width}
          height={size2.height}
          onResize={(e, { size }) => {
            const newSize = Math.max(size.width, size.height);
            setSize2({ width: newSize, height: newSize });
          }}
          minConstraints={[100, 100]}
          maxConstraints={[300, 300]}
        >
          <div
            style={{
              ...styles.box,
              width: size2.width,
              height: size2.height,
              background: "#FF9800",
              color: "white",
            }}
          >
            正方形を維持
          </div>
        </Resizable>
      </div>

      {/* 4. 横方向のみリサイズ */}
      <div style={styles.section}>
        <h2 style={styles.title}>4. 横方向のみリサイズ（axis="x"）</h2>
        <ResizableBox
          width={200}
          height={100}
          axis="x"
          minConstraints={[100, 100]}
          maxConstraints={[400, 100]}
        >
          <div
            style={{
              ...styles.box,
              width: "100%",
              height: "100%",
              background: "#9C27B0",
              color: "white",
            }}
          >
            ← 横のみ →
          </div>
        </ResizableBox>
      </div>

      {/* 5. 縦方向のみリサイズ（追加） */}
      <div style={styles.section}>
        <h2 style={styles.title}>5. 縦方向のみリサイズ（axis="y"）</h2>
        <ResizableBox
          width={200}
          height={100}
          axis="y"
          minConstraints={[200, 50]}
          maxConstraints={[200, 250]}
        >
          <div
            style={{
              ...styles.box,
              width: "100%",
              height: "100%",
              background: "#607D8B",
              color: "white",
              flexDirection: "column",
            }}
          >
            <div>↑</div>
            <div>縦のみ</div>
            <div>↓</div>
          </div>
        </ResizableBox>
      </div>

      {/* 6. 複数のハンドル */}
      <div style={styles.section}>
        <h2 style={styles.title}>6. 複数のリサイズハンドル</h2>
        <ResizableBox
          width={200}
          height={150}
          minConstraints={[100, 80]}
          maxConstraints={[400, 300]}
          resizeHandles={["se", "sw", "ne", "nw", "e", "w", "n", "s"]}
        >
          <div
            style={{
              ...styles.box,
              width: "100%",
              height: "100%",
              background: "#E91E63",
              color: "white",
            }}
          >
            全方向リサイズ
          </div>
        </ResizableBox>
      </div>

      {/* 7. カスタムハンドル */}
      <div style={styles.section}>
        <h2 style={styles.title}>7. カスタムハンドル</h2>
        <ResizableBox
          width={200}
          height={150}
          minConstraints={[100, 80]}
          maxConstraints={[400, 300]}
          handle={
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "20px",
                height: "20px",
                background: "#333",
                cursor: "se-resize",
                borderRadius: "4px 0 0 0",
              }}
            />
          }
        >
          <div
            style={{
              ...styles.box,
              width: "100%",
              height: "100%",
              background: "#00BCD4",
              color: "white",
            }}
          >
            カスタムハンドル
          </div>
        </ResizableBox>
      </div>
    </div>
  );
}

export default App;
```

### コンポーネントの種類

自分でサイズを変更させるか、自動的に変更させるかで二つ選択することができます。

**Resizable**

サイズの状態管理を自分で行う必要があり。

```
// 自分で state を管理
const [size, setSize] = useState({ width: 200, height: 200 });

<Resizable width={size.width} height={size.height} onResize={...}>
<div style={{ width: size.width, height: size.height }}>...</div>
</Resizable>
```

**ResizableBox**\
内部で状態管理してくれるので簡単に使える。

```
// state 管理不要
<ResizableBox width={200} height={200}>
  <div style={{ width: '100%', height: '100%' }}>...</div>
</ResizableBox>
```

### プロパティ一覧

**基本プロパティ**

| プロパティ | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| <code>width</code> | <code>number</code> | **必須** | 要素の幅（ピクセル） |
| <code>height</code> | <code>number</code> | **必須** | 要素の高さ（ピクセル） |
| <code>className</code> | <code>string</code> | <code>''</code> | 追加するCSSクラス名 |
| <code>style</code> | <code>object</code> | <code>{}</code> | インラインスタイル |
| <code>draggableOpts</code> | <code>object</code> | <code>{}</code> | 内部の react-draggable に渡すオプション |

**リサイズ制御プロパティ**

| プロパティ | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| <code>minConstraints</code> | <code>[number, number]</code> | <code>[20, 20]</code> | 最小サイズ \[幅, 高さ\] |
| <code>maxConstraints</code> | <code>[number, number]</code> | <code>[Infinity, Infinity]</code> | 最大サイズ \[幅, 高さ\] |
| <code>lockAspectRatio</code> | <code>boolean</code> | <code>false</code> | アスペクト比を固定するか |

**HandleAxis の値**

<div class="blogList">'n' = 北（上）<br>'s' = 南（下）<br>'e' = 東（右）<br>'w' = 西（左）<br>'ne' = 北東（右上）<br>'nw' = 北西（左上）<br>'se' = 南東（右下）← デフォルト<br>'sw' = 南西（左下）</div>

<p>視覚的に表すと：<br><img loading="lazy" decoding="async" src="/images/uploads/2026/02/11043816/image1.png" alt="" width="501" height="345" class="alignnone size-full wp-image-154"></p>

### コールバック関数

**onResize**

リサイズ中に連続して呼ばれる

```
onResize: (
  event: SyntheticEvent,
  data: ResizeCallbackData
) => void
```

**onResizeStart**\
リサイズ開始時に1回呼ばれる

```
onResizeStart: (
  event: SyntheticEvent,
  data: ResizeCallbackData
) => void
```

**onResizeStop**\
リサイズ終了時に1回呼ばれる

```
onResizeStop: (
  event: SyntheticEvent,
  data: ResizeCallbackData
) => void
```

**型定義**\
ResizeCallbackData

```
type ResizeCallbackData = {
  node: HTMLElement;      // リサイズされているDOM要素
  size: {
    width: number;        // 新しい幅
    height: number;       // 新しい高さ
  };
  handle: HandleAxis;     // どのハンドルでリサイズしているか
};
```

HandleAxis

```
type HandleAxis = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
```

## まとめ

| 用途 | 使用するプロパティ |
| --- | --- |
| サイズ制限したい | <code>minConstraints</code>, <code>maxConstraints</code> |
| 一方向だけリサイズ | <code>axis="x"</code> または <code>axis="y"</code> |
| 複数方向からリサイズ | <code>resizeHandles={['se', 'sw', 'n', ...]}</code> |
| アスペクト比固定 | <code>lockAspectRatio={true}</code> または <code>onResize</code> で計算 |
| 見た目をカスタマイズ | <code>handle={&lt;CustomElement /&gt;}</code> |
| 拡大縮小された親内で使用 | <code>transformScale={スケール値}</code> |
| リサイズイベントを取得 | <code>onResizeStart</code>, <code>onResize</code>, <code>onResizeStop</code> |
