---
title: 「もっと見る」ボタンとコンテンツの表示と非表示をjsで制御する
date: '2024-11-04T00:55:31'
modified: '2025-11-02T02:27:11'
categories:
  - js
  - coding
excerpt: >-
  JavaScriptで「もっと見る」ボタンを実装する方法を解説。JSが苦手な方でもコピペでOKです。テキストの省略を判定してボタンを表示する方法から、クリックで全文表示と「閉じる」に切り替えるロジック、max-heightを使ったアニメーションまで紹介。
eyecatch: /images/uploads/2024/11/04005522/more-button.png
---
「もっと見る」ボタンの押下で、隠しているコンテンツを表示させる実装をしたい人向けの説明記事になります。

jsを使用するので、苦手な人や、急いでいる人向けに、コピペでも対応できるようにしているので、参考にして頂けると嬉しいです。

## デモで完成を確認

下記のような実装をしたい人向けになるので、デモで動作の確認をお願いします。

<p><iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/aotya/embed/WNqaRRG?default-tab=js" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"><br /> See the Pen <a href="https://codepen.io/aotya/pen/WNqaRRG"><br /> Untitled</a> by aotya (<a href="https://codepen.io/aotya">@aotya</a>)<br /> on <a href="https://codepen.io">CodePen</a>.<br /></iframe></p>

## 実装の流れ

1.テキストが３行以上になったら、テキストの文末を「・・・」とする。\
2.「・・・」となっていた場合に限り、「もっと見る」ボタンを表示させる。\
3.「もっと見る」ボタンを押下したら、テキストが全て表示される\
4.全て表示されている状態になったら、「閉じる」ボタンに変わり、押下すると３行に戻る。

上記の実装を説明させていただきます。

## 実装

まずは、テキストが「・・・」になっているか確認にし、ボタンを表示させるか決めましょう。

処理としては下記になります

<p class="red">注意点）：「・・・」になることが決まっていて、高さも固定なら飛ばしてOK。</p>

<p class="red">※その場合は、絶対にボタンが表示されるため</p>

```

document.addEventListener("DOMContentLoaded", function() {
	let textContainer = document.getElementById('description');
	
	if (textContainer && textContainer.scrollHeight > textContainer.clientHeight) {
	  // テキストがコンテナの高さを超えていれば、ボタンを表示
	  let moreButton = document.getElementById('more-button');
	  if (moreButton) {
	    moreButton.style.display = 'flex';
	  }
	}
});
```

jsが苦手な人が理解しておく部分としては、<span class="marker">scrollHeightで対象のテキストの全体の高さ（overflowで隠れている部分も含む）とclientHeight（overflowで隠れている部分を含まない）を比較</span>して、一致せず、scrollHeightの値が大きければ、「・・・」に省略されていると判断します。

if分では、display:noneとしている「もっと見る」ボタンを、「flex」に変えています（none以外ならOK。デザインに合わせて、blockやflexに変えてください）。

### もっと見るボタンを押下時の処理

```

  // もっと見る
  function toggleText() {
    let textContainer = document.getElementById('description');
    let moreButton = document.getElementById('more-button');
    if (textContainer && moreButton) {
      //閉じる（テキストを省略状態にする）
      if (textContainer.style.maxHeight && textContainer.style.maxHeight !== '0px') {
        // textContainer.style.maxHeightが0pxではない＝省略されていないです。
        textContainer.style.maxHeight = null;
        moreButton.innerText = 'もっと見る';
        setTimeout(() => {
        textContainer.style.display = "-webkit-box"
        }, 200);
      //もっと見るボタン押下時(省略部分を見る)（
      } else {
        textContainer.style.maxHeight = textContainer.scrollHeight + 'px';
        moreButton.innerText = '閉じる';
        textContainer.style.display = "block" 
        
      }
    }
  }
```

よく分からない人は、とりあえずコピペでもOKです。

ただし、

```
let textContainer = document.getElementById('description');
 let moreButton = document.getElementById('more-button');
```

<strong class="marker">descriptionは、省略したいテキストを囲っているタグにidとしてコーディングし、more-button、は「もっと見る」ボタンにidとしてコーディングしてください。</strong>

また、コメントにあるように、<span class="marker">上記ではもっと見る押下した後戻す処理もあります。</span>

もし「もっと見る」押下後に戻すことがないのなら、条件式は不要で、else内の処理だけでOKです。具体的には、

```

  // もっと見る
  function toggleText() {
    let textContainer = document.getElementById('description');
    let moreButton = document.getElementById('more-button');
    if (textContainer && moreButton) {
        textContainer.style.maxHeight = textContainer.scrollHeight + 'px';
        textContainer.style.display = "block" 
    }
  }
```

上記のみになります。

html側のボタンは

```
<button id="more-button" class="more-button-style" onclick="toggleText()">もっと見る</button> 
```

上記のようにすれば、toggleText()が発火します。

## スライドでアニメーションする

スライドさせる場合は、もっと見るを適用させるタグに

```

    transition: .3s;
    max-height: 0; //close状態の高さを設定
    overflow: hidden;
```

上記を追加しましょう。

<strong class="marker">事前にmax-heightを入れないと、displayの切り替えのみになるので、アニメーションにならないです。</strong>

### jsの説明

やっていることは意外とシンプルです

```

      if (textContainer.style.maxHeight && textContainer.style.maxHeight !== '0px') {
        // textContainer.style.maxHeightが0pxではない＝省略されていないです。
        textContainer.style.maxHeight = null;
        moreButton.innerText = 'もっと見る';
        setTimeout(() => {
        textContainer.style.display = "-webkit-box"
        }, 200);
      //もっと見るボタン押下時(省略部分を見る)（
      } else {
        textContainer.style.maxHeight = textContainer.scrollHeight + 'px';
        moreButton.innerText = '閉じる';
        textContainer.style.display = "block" 
        
      }
```

ポイントととなる点をピックアップして説明していきます。

```
textContainer.style.maxHeight && textContainer.style.maxHeight !== '0px'
```

上記の設定は、textContainer.style.maxHeighが0pxじゃなければ、省略されていないので、閉じるボタンを押下したと判断されます。

では、textContainer.style.maxHeightをどこで設定しているかと言ったら、

```
textContainer.style.maxHeight = textContainer.scrollHeight + 'px';
```

上記になります。

textContainer.scrollHeightで、省略されているテキストを含めた高さを設定し、スタイルを反映させています。この処理、テキストを全てを見せています。

もっと見ると、閉じるの切り替えは、この条件だけ判断しています。

簡単に言えば、省略せずにテキストを表示時の最大の高さを取得し、max-heightとしてスタイルを当てているだけです。そして、すでにスタイルが当たっていたら、max-heightの値をnullにして、displayの"-webkit-box"に戻し、ボタンのテキストを変えるだけです。

よく分からなかったら、とりあえずコピペし、必要に応じて、アレンジしてください。
