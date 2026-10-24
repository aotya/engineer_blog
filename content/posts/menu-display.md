---
title: トップからスクロールしたら追従メニューを表示させる
date: '2024-12-08T03:52:23'
modified: '2025-11-02T02:35:41'
categories:
  - js
  - coding
excerpt: >-
  JSの`getBoundingClientRect`を使い、特定の位置までスクロールしたら追従メニューを表示する方法を解説。`scroll`イベントでターゲット要素の位置を監視し、CSSの`bottom`と`transition`でスライドアニメーションさせます。コピペOKなデモ付き。
eyecatch: /images/uploads/2024/12/08035207/menu-display.webp
---
ヘッダーメニューやフッターメニューを追従させたいが、トップから特定の位置までスクロールさせてから表示させたいケースもあると思います。

このページでは、

<strong>・トップから特定の位置までスクロールしたらメニューを表示させる</strong>\
<strong>・特定位置よりも前に戻ったらメニューを非表示にさせる</strong>

上記の方法を説明させて頂きたいと思います。

## デモで確認

まずは、あなたの実装イメージと齟齬がないか確認してみてください。

<p><iframe height="300" style="width: 100%;" scrolling="no" title="Untitled" src="https://codepen.io/aotya/embed/mybPrWd?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"><br /> See the Pen <a href="https://codepen.io/aotya/pen/mybPrWd"><br /> Untitled</a> by aotya (<a href="https://codepen.io/aotya">@aotya</a>)<br /> on <a href="https://codepen.io">CodePen</a>.<br /></iframe></p>

デモでは、フッターですが、ヘッダーメニューでも、その他の追従コンテンツにも流用できます。

時間がない人は内容の説明を飛ばして、コピペでもOKです。

ただし、それほど難しい内容ではないので、軽く目を通して頂けると嬉しいです！

### 実装内容

実装内容は、シンプルで

<strong>・特定のclassが表示された時点で、メニューを表示させる</strong>\
<strong>・特定のclassが表示されるよりも上にスクロールしたらメニューを非表示にする</strong>

これだけです。

上記を達成するために、jsでclassの位置を取得し、その位置よりもスクロール位置よりも高いか低いか監視し、styleを変更しています。

```
document.addEventListener("DOMContentLoaded", () => {
  const targetElement = document.querySelector(".target");
  const footerMenu = document.querySelector(".footer-menu");

  const handleScroll = () => {
    const targetPosition = targetElement.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (targetPosition <= windowHeight) {
      footerMenu.style.bottom = "0px";
    } else {
      footerMenu.style.bottom = "-100px";
    }
  };

  window.addEventListener("scroll", handleScroll);
});
```

### アニメーションする場合

デモの場合は、下から上にスライドさせているので、bottomで位置を調整しています。

cssの設定は下記となっています。

```
.footer-menu {
  position: fixed;
  left: 0;
  width: 100%;
  background: #333;
  color: white;
  display: block;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);
  transition: .3s;//アニメーションで必要
  bottom: -100px;//アニメーションで必要
}
```

スライドが不要なら、display:blockとdisplay:noneの切り替えでもOKです。

### まとめ

特定のclassやidの位置の取得したり、現在のスクロール位置をスクロールする方法は、他のアニメーションなどでも使用することが多いので、覚えておくと良いでしょう。
