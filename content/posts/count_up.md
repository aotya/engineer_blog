---
title: 任意の秒数で指定の数値までカウントアップさせる簡単実装
date: '2025-11-09T02:09:06'
modified: '2025-11-09T02:09:06'
categories:
  - js
  - coding
excerpt: >-
  Webサイトで実績数値を動的に見せる「カウントアップ」アニメーションの簡単な実装方法を解説します。スクロールして要素が画面に表示されたタイミングを「Intersection
  Observer」で検知し、カウントを開始。指定した時間（秒数）で目標値まで到達させる方法と、一定間隔で1ずつ増やす方法の、2パターンのJavaScriptコードを紹介しています。
eyecatch: /images/uploads/2025/11/09020827/count_up.webp
---
Webサイトで、サービスの実績数や統計データなどが、画面に表示された瞬間にアニメーションしながら増えていくエフェクトを見たことはありませんか？

これは「カウントアップ」と呼ばれるテクニックで、ユーザーの視線が要素に到達したタイミングでアニメーションを開始することで、注目を集め、データを印象的に見せる効果があります。

ここで説明するカウントアップのデモとしては下記になります。

<p><iframe height="300" style="width: 100%;" scrolling="no" title="count-up" src="https://codepen.io/aotya/embed/raBojdO?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true"><br /> See the Pen <a href="https://codepen.io/aotya/pen/raBojdO"><br /> count-up</a> by aotya (<a href="https://codepen.io/aotya">@aotya</a>)<br /> on <a href="https://codepen.io">CodePen</a>.<br /></iframe></p>

<strong class="marker">スクロールをしていき、画面にカウントアップしていく要素が表示されたら、カウントアップをスタートする仕組みになっています。</strong>

今回は二つの手法を用意しており、

<strong>・１単位ずつ増やしていく手法</strong>

<strong>・MAXになる秒数を指定してカウントアップしていく手法</strong>

おそらく、後者の方が利便性があると思いますが、前者のケースが必要な場合も稀にあると思うので、どちらも説明します。

JavaScriptの仕組みがわかる人は、デモのソースを見ていただければ分かると思いますが、仕組みを含めて理解したい人は以降の説明も確認して頂けると幸いです。

## カウントアップ実装

### 実装のポイント

カウントアップの実装では、大きく分けて2つの技術で成り立っています。\
<strong>1.Intersection Observer (交差監視API)</strong>\
・「要素が画面（ビューポート）に入ったか？」を監視するための仕組み。\
・これを使うことで、従来難しかった「スクロールして要素が見えた瞬間」を簡単に検知できる。

**2.カウントアップのロジック**\
・指定されたターゲットの数値まで、数字を徐々に増やしていく処理です。\
・今回は「指定時間で完了させる方法」と「1ずつじわじわ増やす方法」の2パターンを実装します

### 1\. HTMLの準備

まずは、カウントアップさせたい数値の要素をHTMLで用意します。 ポイントは、JavaScript側でアニメーションを制御するために、`data-*属性`に必要な情報を埋め込んでおくことです。

```
<!-- パターン1: 時間指定で完了 -->
<div 
  class="counter"
  data-type="duration" 
  data-target="30000" 
  data-duration="2000"
>
  0
</div>

<!-- パターン2: 1ずつ増加 -->
<div 
  class="counter"
  data-type="incremental" 
  data-target="10000" 
  data-interval="1"
>
  0
</div>
```

・`class="counter"`: JavaScriptで監視対象とするための目印です。\
・`data-type`: カウントアップの種類を決めます（`duration` = 時間指定, `incremental` = 1ずつ増加）。\
・`data-target`: 最終的な目標値です。\
・`data-duration`: パターン1（時間指定）の場合、何ミリ秒で完了させるか。\
・`data-interval`: パターン2（1ずつ増加）の場合、何ミリ秒ごとに1増やすか。

ここで注意点ですが、初期値の０はデモなので0にしているだけで、10000にしようが、0からスタートになるので、初期値は何でもOKです。

<strong class="marker">SEOを考慮すると、最終的な数値に設定しておくことをお勧めします。</strong>

googleのbotがサイトを確認する際は、初期値が読み取られてしまう可能性があるからです。

<strong class="marker">0として読み取られると、実態の数値と異なってしまい、嘘の数値をついていると判断される可能性もあるので注意が必要です。</strong>

### 2\. CSSで初期状態を設定

スクロールして表示された瞬間に「フワッ」と表示されるように、最初は非表示（透明）にしておきます。

```
/* Intersection Observer用の初期非表示スタイル */
.counter {
  opacity: 0; /* 最初は透明 */
  transition: opacity 0.5s ease-in-out; /* 0.5秒かけてフワッと表示 */
}

/* JavaScriptによってこのクラスが付与されると表示される */
.counter.visible {
  opacity: 1; /* 表示状態 */
}
```

### 3\. JavaScriptでロジックを実装

ここがメインの処理です。コード全体は、`DOMContentLoaded`イベント（HTMLの読み込みが完了した時点）で実行されるようにします。

```
document.addEventListener("DOMContentLoaded", () => {

  // --- カウントアップ関数（パターン1：時間指定） ---
  const countUpDuration = (element, duration) => {
    const target = +element.getAttribute("data-target");
    let current = 0;
    // 1フレームあたりの増加量 (durationを60fps(約16.6ms)で割るイメージ)
    const increment = Math.ceil(target / (duration / 16));
    
    const updateCounter = () => {
      current += increment;
      if (current < target) {
        element.textContent = current.toLocaleString(); // カンマ区切りで表示
        requestAnimationFrame(updateCounter); // 次のフレームで自身を再度呼び出す
      } else {
        // 最終値は正確なターゲット値にする
        element.textContent = target.toLocaleString();
      }
    };
    updateCounter(); // アニメーション開始
  };

  // --- カウントアップ関数（パターン2：1ずつ増加） ---
  const countUpIncremental = (element, interval) => {
    const target = +element.getAttribute("data-target");
    let current = 0;
    
    const timer = setInterval(() => {
      current++;
      if (current <= target) {
        element.textContent = current.toLocaleString(); // カンマ区切りで表示
      } else {
        // ターゲット値になったら停止
        element.textContent = target.toLocaleString();
        clearInterval(timer);
      }
    }, interval); // 指定された間隔で実行
  };

  // --- Intersection Observerの設定 ---
  const observer = new IntersectionObserver(
    (entries, observer) => {
      // 監視対象（entries）をループ処理
      entries.forEach((entry) => {
        
        // entry.isIntersecting が true なら画面内に入ったということ
        if (entry.isIntersecting) {
          const counter = entry.target; // 画面に入った要素
          
          // .visibleクラスがまだなければ処理を実行（一度だけ実行するため）
          if (!counter.classList.contains("visible")) {
            counter.classList.add("visible"); // CSSの .visible を追加して表示
            
            const type = counter.getAttribute("data-type");

            // HTMLの data-type に応じて処理を分岐
            if (type === "duration") {
              const duration = +counter.getAttribute("data-duration") || 2000;
              countUpDuration(counter, duration);
            } else if (type === "incremental") {
              const interval = +counter.getAttribute("data-interval") || 10;
              countUpIncremental(counter, interval);
            }
          }
          
          // 処理が終わったら、この要素の監視を解除する
          observer.unobserve(counter);
        }
      });
    },
    { 
      threshold: 0.5 // 要素が50%見えたら発火
    }
  );

  // --- 監視の開始 ---
  // class="counter" を持つすべての要素を取得
  const counters = document.querySelectorAll(".counter");
  // すべての要素を Intersection Observer で監視開始
  counters.forEach((counter) => observer.observe(counter));
});
```

## JavaScriptのポイント解説

<strong>Intersection Observerというライブラリによって、要素が画面に表示されたらclassを付与してフワッと表示＋カウントアップの関数を実行させる流れになります。</strong>

ここでは、<strong>Intersection Observerの詳細は飛ばしますが、</strong>ブラウザの表示領域（専門用語で「ビューポート」と言います）に**入ったか・出たか**を自動的に監視し、その瞬間を教えてくれる便利な仕組み（API）だといる理解でOKです。

それでは、実装内容の詳しく説明していきます。

<strong class="marker">テキストのみを追っても分かりにくいと思うので、デモのコメントを見ながら何となく処理の流れを理解し、更に詳しく知りたい場合に読んでみてください。</strong>

実装するだけならデモをコピペし、あとはソースのコメントを見てカスタマイズすれば大抵は大丈夫だと思います。

1\. **Intersection Observerの初期化**\
・`new IntersectionObserver(コールバック関数, オプション)` で監視インスタンスを作成します。\
・**コールバック関数**: 監視対象が画面に出入りしたときに実行される処理です。\
・<strong>オプション (`{ threshold: 0.5 }`)</strong>: 要素がどれくらい見えたらコールバックを実行するか指定します。`0.5`は「要素が50%見えた瞬間」を意味します。\
2\. **監視の開始**\
・`document.querySelectorAll(".counter")` で対象要素をすべて取得し、`forEach` で `observer.observe(element)` を呼び出すことで監視が始まります。\
3\. <strong>発火時の処理（コールバック関数内）</strong>\
・引数の `entries` には、状態が変化した要素の情報が配列で入っています。\
・`entry.isIntersecting` が `true` の場合、要素が画面内に入ったことを示します。\
・`counter.classList.add("visible")` でCSSを適用し、要素を「フワッ」と表示させます。\
・`data-type` を見て、2種類のカウントアップ関数のどちらかを呼び出します。\
・`observer.unobserve(counter)` で監視を解除します。これをしないと、画面を出たり入ったりするたびにカウントアップが再実行されてしまいます。\
4\. **カウントアップ関数**\
・<strong>`countUpDuration` (時間指定)</strong>: `requestAnimationFrame` を使っています。これはブラウザの描画タイミングに合わせて関数を実行する仕組みで、滑らかなアニメーションに適しています。指定時間内に終わるよう、1フレームあたりの増加量を計算して足し込んでいます。\
・<strong>`countUpIncremental` (1ずつ増加)</strong>: `setInterval` を使い、指定された間隔（ミリ秒）ごとに数値を「1」ずつ増やしています。目標値に達したら `clearInterval` でタイマーを停止します。\
・<strong>`toLocaleString()`</strong>: `element.textContent = current.toLocaleString()` とすることで、数値を自動的に「30,000」のようにカンマ区切りにしてくれる便利なメソッドです。

## まとめ

Intersection Observer API を使うことで、スクロール位置を複雑に計算しなくても、「要素が見えたら発火」という処理が驚くほど簡単に実装できます。

実績紹介や統計データなど、数値を印象的に見せたい場面でぜひ活用してみてください
