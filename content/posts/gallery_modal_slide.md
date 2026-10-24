---
title: 写真ギャラリーとスライド式モーダルウィンドウを連携させる方法
date: '2025-11-09T02:43:37'
modified: '2026-03-14T00:27:52'
categories:
  - js
  - coding
excerpt: >-
  Swiper v11で写真ギャラリーとモーダルスライダーを連携させる方法。ギャラリー側をloop:
  trueにした際の「インデックスのズレ」問題をdata属性で解決する実装を、CodePenデモとコード付きで解説します
eyecatch: /images/uploads/2025/11/09024328/gallery.webp
---
Webサイトで綺麗な写真を並べるギャラリーコンテンツを作成するケースは多いです。 ただ画像を並べるだけでなく、写真をクリックしたらモーダルウィンドウで拡大表示され、さらにそこでスライドショーとして他の画像も確認できる、といったリッチなUIが求められることも少なくありません。

本記事では、<strong>「ギャラリー自体もスライダー」であり、かつ「画像クリックで開くモーダルもスライダー」</strong>という、Swiperを2つ連動させる実装の備忘録です。

特にギャラリー側を<strong>ループ（loop: true）</strong>設定にすると、Swiperがスライドを複製（duplicate）するため、クリックした画像とモーダルで表示する画像のインデックスがずれやすい、という問題が起こりがちです。

今回の実装は、その「インデックスのずれ」をdata属性を使って解決する方法です。Swiperのバージョンは11を使用しています。同じ実装で悩む方の参考になれば幸いです。

## 実装の概要とポイント

まず、完成形（デモ）の前に、実装の主要なロジックを解説します。

<strong>HTML側:</strong>

ギャラリーの各画像（スライド）に、`data-index="0"`, `data-index="1"`のように、ユニークな番号（インデックス）をdata属性として付与します。

<strong>JavaScript側:</strong>

まず、ページの読み込み時に、data-indexを元に全画像のソース（src）を正しい順番で配列（imageSources）に格納しておきます。（※これがループ対策の肝です）

<strong class="marker">ギャラリーの画像がクリックされたら、その画像のdata-indexの値を取得します。</strong>

モーダルを開くと同時に、手順1で作成したimageSources配列を元に、モーダル用のSwiperスライドを動的に生成します。

モーダル用のSwiperを初期化（new Swiper(…)）する際、initialSlideオプションに手順2で取得したdata-indexの値を設定します。

### デモ（CodePen）

上記ロジックで実装したデモがこちらです。 ギャラリー自体が横スライド（ループあり）で、画像をクリックするとモーダルが起動し、クリックした画像からスライド（ループあり）が開始されます。\
※デザインは雑で確認しにくいかもしれません。

<p><iframe height="300" style="width: 100%;" scrolling="no" title="GALLERY+modal+swiper" src="https://codepen.io/aotya/embed/GgoXvgb?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true">See the Pen <a href="https://codepen.io/aotya/pen/GgoXvgb"> GALLERY+modal+swiper</a> by aotya (<a href="https://codepen.io/aotya">@aotya</a>) on <a href="https://codepen.io">CodePen</a>.</iframe></p>

## コードの詳細解説

CodePenのソースと合わせて、主要なロジックを解説します。

### 1\. 画像配列の作成（ループ対策）

Swiperの`loop: true`を有効にすると、スライドが複製されるため、`document.querySelectorAll`などで画像を取得するだけでは、順番が狂ったり、重複した画像を含んだ配列になってしまいます。

そこで、`loop: true`の影響を受けないよう、`data-index`属性を元にして、オリジナルの画像ソースだけを順番通りに配列へ格納します。

```
// 最初にすべての画像ソースを順番に取得して配列に保存
const imageSources = [];
const galleryItems = document.querySelectorAll('.gallery_item');

// data-indexの最大値を探して画像の総数を決定
const maxIndex = Array.from(galleryItems).reduce((max, item) => {
    const index = parseInt(item.dataset.index, 10);
    return index > max ? index : max;
}, -1);

// data-indexの0から最大値までループ
for (let i = 0; i <= maxIndex; i++) {
    // querySelectorは重複する要素があっても最初の一つだけを返す
    // これにより、Swiperが複製したスライド（duplicate）を無視できる
    const imageElement = document.querySelector(`.gallery_item[data-index="${i}"] img`);
    if (imageElement) {
        imageSources.push(imageElement.src);
    }
}
```

<strong class="marker">ポイントは、document.querySelector()を使っている点です。</strong>

loop: trueの場合、data-index="0"の要素はDOM上に複数存在しますが、querySelectorはHTMLの上から最初に合致した要素を1つだけ返すため、オリジナルの要素を確実に取得できます。

### 2\. 画像クリック時のモーダル表示

次に、クリックイベントの処理です。

```
const modalButtons = document.querySelectorAll('.modal_button');
const swiperWrapper = document.querySelector('.modal .swiper-wrapper');
let swiper; // モーダル用Swiperのインスタンスを保持する変数

modalButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    // 1. クリックされた画像のdata-indexを取得
    const slideIndex = parseInt(e.currentTarget.dataset.index, 10);

    // （スライドの中身を一旦クリアする処理...）
    swiperWrapper.innerHTML = '';

    // 2. 事前に作成した画像配列（imageSources）からスライドを動的に生成
    imageSources.forEach(src => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      // (img要素を作成して追加する処理...)
      swiperWrapper.appendChild(slide);
    });

    // 3. Swiperを初期化。initialSlideに取得したindexを指定
    swiper = new Swiper('.modal .swiper', {
      loop: true,
      initialSlide: slideIndex, // 押された画像からスタート
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    modal.classList.add('is-open');
  });
});
```

`initialSlide: slideIndex`とすることで、モーダルが開いた瞬間に、クリックされた画像が中央に表示されます。

### 応用：モーダルでの表示順を変更する

<strong class="marker">今回のデモでは、モーダルのスライド順はHTMLのdata-indexの昇順（0, 1, 2...）です。</strong>

もしこの順番を変更したい場合は、JavaScript側ではなく、HTML側のdata-indexの数値を変更するだけで対応できます。

例えば、data-index="0", data-index="2", data-index="1"の順に並べれば、モーダルもその順番でスライドします。 ただし、ギャラリーの見た目のレイアウト（CSS）とdata-indexの順序が大きく異なると、ユーザーに違和感を与える可能性があるため、設計に合わせて調整してください。

### 補足：ギャラリーがループしない（loop: false）場合のシンプルな実装

もし、\*\*ギャラリー側がループしない（loop: false）\*\*のであれば、わざわざdata-indexを使って事前に配列を作る必要はありません。 クリックされたインデックスをinitialSlideに渡すだけで、Swiperが自動で処理してくれます。

その場合のJavaScriptは以下のようになり、よりシンプルになります。 （※このコードはデモの「ギャラリー側Swiper」をloop: falseに設定した場合にのみ正しく動作します）

```
const modalButtons = document.querySelectorAll('.modal_button');
const modal = document.querySelector('.modal');
const closeButton = modal.querySelector('button');
const swiperWrapper = document.querySelector('.modal .swiper-wrapper');

let swiper;

modalButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    // すでにスライドがあればクリアする
    swiperWrapper.innerHTML = '';

    // すべての画像要素を直接取得
    const allImages = document.querySelectorAll('.gallery_item img');
    allImages.forEach(img => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');
      const image = document.createElement('img');
      image.src = img.src;
      slide.appendChild(image);
      swiperWrapper.appendChild(slide);
    });

    // Swiperを初期化（indexをそのままinitialSlideに使う）
    swiper = new Swiper('.swiper', {
      loop: true,
      initialSlide: index, // NodeListのindexをそのまま利用
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    modal.classList.add('is-open');
  });
});

// ... closeModalなどの処理 ...

// ギャラリー側は loop: false にする
const gallerySwiper = new Swiper('.swiper_gallery_columns', {
  slidesPerView: 'auto',
  loop: false, // ループしない
  spaceBetween: 20,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});
```

## まとめ

本記事では、ギャラリー（ループあり）とモーダル（ループあり）をSwiper v11で連携させる方法を紹介しました。

<strong class="marker">loop: trueによるスライドの複製問題を、data-index属性とquerySelectorの特性を使って回避する。</strong>

事前に正しい画像ソースの配列を用意し、モーダル表示時に動的にスライドを生成する。

initialSlideオプションにクリックされたdata-indexを渡す。

デモのソースは自由にコピーしてアレンジしていただいて構いません。 本記事で紹介したdata-indexを使う方法は、ギャラリーがループしない場合でも問題なく動作しますが、補足で紹介したシンプルな方法（loop: false用）を、ループありのギャラリーで使うとバグが発生するため、注意してください。
