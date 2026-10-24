---
title: 半角英数字が改行されない場合のCSS対応
date: '2024-11-19T13:42:03'
modified: '2025-11-02T02:33:54'
categories:
  - html_css
  - coding
excerpt: >-
  `white-space: normal`でも半角英数字の羅列がはみ出す問題。CSSの`overflow-wrap:
  anywhere`で解決できます。非推奨の`word-break: break-all`との違いや、レイアウト崩れを防ぐための注意点を解説します。
eyecatch: /images/uploads/2024/11/19134055/half_width_character.webp
---
white-space:normalやpre-wrapを設定しているのに、半角英数字の羅列になると、改行されずに、親のコンテナを突き破っていく…

なんてケースがあると思います。

その場合の対処としては、

```
word-break: break-all;
overflow-wrap: anywhere;
```

上記のCSSのどちらかを対象のpタグに設定するようにしましょう。

<p class="marker">基本的には、overflow-wrap: anywhere;の設定を推奨します。</p>

## word-break: break-all

<p class="marker">word-break: break-allでも改行されると思いますが、非推奨という扱いになっています。</p>

また、個人的な体験になりますが、スマホのデバイスによっては正常に改行されないケースもあったので、あまりオススメしません。

### まとめ

半角英数字の羅列を表示する可能性がある場合は、

```
overflow-wrap: anywhere;
```

の設定を忘れないようしましょう。

忘れると、親コンテンツを突き抜けて、デザインを大きく崩す原因となるので注意しましょう。
