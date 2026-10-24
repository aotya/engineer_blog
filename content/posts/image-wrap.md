---
title: 画像をwrapした親要素との余白を埋める方法
date: '2025-10-25T01:02:03'
modified: '2025-11-02T02:45:05'
categories:
  - html_css
  - coding
excerpt: >-
  `img`タグを`div`で囲んだ時にできる「謎の余白」。原因は`img`がインライン要素（`baseline`）だからです。CSSの`display:
  block;`または`vertical-align`で隙間を消す簡単な解決策を解説します。
eyecatch: /images/uploads/2025/10/25010151/html_image_wrap.webp
---
imgタグをdivタグでwrapした時などに、divタグとimgタグで何故か要素の大きさが異なり、余計な余白が発生してしまうことがあると思います。

初心者にありがちなミスになるのですが、コーダーの経験が合っても、意外と忘れることがあるので、簡単に解決策をメモとして残しておきたいと思います。

## 余白のズレの解決策

先に結論を言うと、imgにdisplay: block; か\`vertical-alignを指定すれば余白を消すことができます。

```
<div class="wrap">
　<img decoding="async" src="sample.jpg" alt="">
</div>
```

```
.wrap img {
　display: block;        /* 余白をなくす一番手軽な方法 /
/ vertical-align: top; でも OK */
}
```

imgタグはデフォルトでインライン要素として扱われるため、ブロック要素でdivタグをwrapすると、行の「ベースライン」との間に隙間ができることが原因です。

そのため、インライン要素のimgをブロック要素にするか、vertical-alignでベースラインを合わせてあげれば余白は消えます。
