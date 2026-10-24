---
title: splideで自動スクロールでループさせる実装方法
date: '2024-11-30T05:55:28'
modified: '2025-11-02T02:34:43'
categories:
  - js
  - coding
excerpt: >-
  Splide.jsで自動スクロール（ループ）を実装する方法。`autoplay`を使った「一定間隔」のデモと、拡張機能を使った「常時スクロール」のデモをコピペで解説。それぞれのJS設定の違いや、Swiperとの比較も紹介します。
eyecatch: /images/uploads/2024/11/30055455/slider.webp
---
この記事ではsplideでループ状態で、自動的にスクロールさせる実装方法をお伝えしていきます。

<p class="marker">まずは下記のデモを確認して、実装のイメージと合っているかどうか確認してみてください。</p>

## 自動スクロールのデモ確認

デモは、二つ用意しましたので、イメージに合うのを選択してみてください。

デモ①：一定間隔ごとに自動スクロール

<p><iframe height="300" style="width: 100%;" scrolling="no" title="splide-infinite2" src="https://codepen.io/aotya/embed/azozLRG?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"><br /> See the Pen <a href="https://codepen.io/aotya/pen/azozLRG"><br /> splide-infinite2</a> by aotya (<a href="https://codepen.io/aotya">@aotya</a>)<br /> on <a href="https://codepen.io">CodePen</a>.<br /></iframe></p>

デモ②：常に自動スクロール

<p><iframe height="300" style="width: 100%;" scrolling="no" title="splide infinite" src="https://codepen.io/aotya/embed/gbYbRXw?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"><br /> See the Pen <a href="https://codepen.io/aotya/pen/gbYbRXw"><br /> splide infinite</a> by aotya (<a href="https://codepen.io/aotya">@aotya</a>)<br /> on <a href="https://codepen.io">CodePen</a>.<br /></iframe></p>

時間がない人は、上記デモのソースをコピしていただいて、後は適時カスタマイズしてもらってOKです。

どちらも難しいという訳ではないですが、ある程度理解していないとカスタマイズできなかったり、複数のスライダーを扱う時に、エラーを起こすこともあるので注意してください（この記事を参考にしているということは、splideに詳しい訳ではないと思いますし）。

個人的には、流し読みでもいいので、この記事を最後まで読み、実装の詳細を理解して頂けると嬉しいです笑

### HTML側のsplideの基本構造

公式サイトにも掲載されていますが、

```

<section id="image-carousel" class="splide" aria-label="お気に入りの写真">
  <div class="splide__track">
	<ul class="splide__list">
		<li class="splide__slide">
			<img decoding="async" src="image01.jpg" alt="">
		</li>
		<li class="splide__slide">
			<img decoding="async" src="image02.jpg" alt="">
		</li>
		<li class="splide__slide">
			<img decoding="async" src="image03.jpg" alt="">
		</li>
	</ul>
  </div>
</section>
```

上記が基本の構成になります。

「splide」の接頭文字がついてるclassが必須になります。idのimage-carouselなどは不要になります。

<p class="marker">暗記するようなものでもないので、公式ページや本サイトをブックマークしてもいいですし、&nbsp;clipyなどにも保存してしまってもいいと思います。</p>

コピペで済ませるようにしましょう。

デモの構成も基本構成と同じで、liのアイテムを増やしたのと、スタイルを当てて、スライドさせるコンテンツのデザインを整えているだけです。

### cdnとcssファイルとjsファイルを読み込むのを忘れない

<p class="marker">初心者から経験者まで、意外と忘れたり、読み込ませる場所が違ったりして動かなくなるので注意しましょう（経験者の方だと真っ先に疑う箇所になりますが）笑</p>

基礎的ですが、cssを読み込ませた後に、jsを読み込ませましょう。

<p class="marker">cssはheadタグに、jsはbodyタグの最後に読み込ませればOKです。</p>

一応ソースを貼りますが、最新のバーションにすることをオススメします。

＜CSS＞

```
<link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css"
    />
```

```
<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"></script>
```

上記の二つでOKなのですが、②のゆっくりと常に自動スクロールさせる実装をする場合は、下記のjsの読み込みも必要です。

```
<script src="https://cdn.jsdelivr.net/npm/@splidejs/splide-extension-auto-scroll@0.5.3/dist/js/splide-extension-auto-scroll.min.js"></script>
```

splide側が用意しているファイルになります。①の一定間隔ごとにスライドさせたいのなら不要になります。

## ①のスライダー：JS設定（一定間隔ごとにスライドさせるタイプ）

```
const option = {
        type: 'loop',        // ループなし
        perPage: 3,           // 表示されるスライド数
        perMove: 1,           // スライドごとの移動数
        gap: '20px',          // スライド間のスペース
        focus: 'center',      // 現在のスライドを中央に配置
        snap: false,           // スライド移動をスナップ
        pagination: false,    // ページネーション無効
        autoplay: true,      // 自動スクロール無効
        interval: 1000,　　　// 自動スクロール間隔
        drag:'free', // ドラッグ挙動
} 
const splide = new Splide(".splide", option);
splide.mount();
```

<p class="marker">オプションの設定内容については、ソースにコメントをつけているので確認してみてください。</p>

公式サイトにも詳細が載っています。

splideに関わりませんが、ライブラリは、どのようなオプションがあるのか把握するのが大変です。

一方で設定方法自体はシンプルで、特に深く考える必要がないのがメリットです。

念の為の補足ですが、

```
const splide = new Splide(".splide", option);
splide.mount();
```

ここで、splideをsplideクラスに表示させる設定をしています。ここを忘れたりすると何をやっても表示されないので注意してくださいね。

設定だけして何もしていない状態になるので。

## ②のスライダー：JS設定（常にスクロールさせ続ける）

```
const options = {
  type: "loop", // ループさせる
  arrows: false, // 矢印ボタンを非表示
  pagination: false, // ページネーションを非表示
  drag: "free", // フリードラッグモード
  gap: 0, // スライド間の余白
  perPage: 4, // 表示するスライドの枚数
  autoScroll: {
    speed: 0.5, // スクロール速度
    pauseOnHover: false, // カーソルが乗ってもスクロールを停止させない
  },
};
const splide = new Splide(".splide", options);
splide.mount(window.splide.Extensions);
```

上記がデモの設定になります。

オプションの設定については、コメントにあるのでより詳しく知りたい人は、やはり公式サイトを参照してください。

注意する点としては、

```
splide.mount(window.splide.Extensions);
```

上記になります。逆に言えば、ここ以外は①のスライダーと大きく変わる点はないです。

オプションに色々設定していますが、細かい調整が不要なら、loopだけ設定し、

```
const splide = new Splide(".splide", options);
splide.mount(window.splide.Extensions);
```

でもOKです。

<p class="marker">補足としては、window.splide.Extensionsをsplide.mountの引数にすることで、常にスライダーがゆっくりと動きます。</p>

逆に言えば、optionで自動スクロール設定をfalseにしてwindow.splide.Extensionsを設定している限り、自動的にスクロールさせれ続けるので注意してくださいね。

### swiperとsplideならどちらが良いか

splideの説明は以上になりますが、splide以外にもswiperやslickなどでも実装は可能です。

<p class="marker">個人的には、今回の自動スクロールによるループに関しては、splideがオススメです。</p>

swiperの場合ですと、逆に方向にドラッグしたりすると、なぜか一時的に逆方向に自動スクロールを始めたりと、挙動が怪しい点があるからです。

<p>＜swiperのデモ＞<br><iframe height="300" style="width: 100%;" scrolling="no" title="swiper infinite" src="https://codepen.io/aotya/embed/EaYaXxp?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"><br /> See the Pen <a href="https://codepen.io/aotya/pen/EaYaXxp"><br /> swiper infinite</a> by aotya (<a href="https://codepen.io/aotya">@aotya</a>)<br /> on <a href="https://codepen.io">CodePen</a>.<br /></iframe></p>

もしかしたら、上記よりも、もっと上手い実装方法があるかもしれませんが...

slickは、私があまり使用しないので分からないです。

一つのライブラリに絞った方が管理はしやすいですが、得意・不得意もあるので、ある程度柔軟に対応することをオススメします。

もちろん、デザインや挙動を変更するといった点も含めてです。
