---
title: PlaywrightでVisual Regression Testingを導入する方法
date: '2024-11-09T12:32:02'
modified: '2025-11-02T02:32:06'
categories:
  - playwright
  - test-tool
excerpt: >-
  PlaywrightでVisual Regression Testingを始めたい人へ。`npm
  init`での環境構築、`toHaveScreenshot`でのテスト作成、`npx playwright
  test`での差分比較、レポートの見方まで。VRT導入の最初の一歩を分かりやすく解説します。
eyecatch: /images/uploads/2024/11/09123138/playwright-1.webp
---
このページでは、

<strong>・Playwrightの環境構築</strong>\
<strong>・Visual Regression Testingの作成方法(簡単なサンプル)</strong>\
<strong>・テストの実行方法</strong>

上記を説明していきます。

Playwrightがどういったものか、Visual Regression Testingとは何かという話はしないのでご注意ください。

<p class="marker">PlaywrightでVisual Regression Testingを導入してみたいけど、どうすればいいのかわ分からない人に向けた、環境構築＋簡単なテスト導入かのスタートになります。</p>

是非、記事を見ながら実践してみてください。

最初は、少しとっつきにくいかもしれませんが、簡単に慣れることができると思いますよ！

## 環境構築：Playwrightのインストール

```
npm init playwright@latest
```

上記のコマンドで、playwrightの最新をダウンロードできます。

playwrightのテストを作成していきたいディレクトリで実行しましょう。

基本的には、全てデフォルトの設定でOKなので、enterを押し続けて貰って大丈夫です。

<p><img loading="lazy" decoding="async" src="/images/uploads/2024/11/09132715/playwright_install.webp" alt="" width="554" height="430" class="alignnone size-full wp-image-38"></p>

上記のようなファイル構成になっていればOKです。

### テストを実行してみよう

実際に動かしながらの方がわかりやすいと思いますので、早速スクリーンショットを撮って、比較してみましょう！

差分を出した方がわかりやすいので、ルートディレクトリにindex.htmlを作成して、適当にテキストが表示されるようにしましょう

```
<div>
<p>テスト</p>
</div>
```

↑このようにテキストがあればOKです。

そのあとは、GO LiveといったVSCodeのプラグインで、ローカルホストを立ち上げて、画面を表示させてましょう。

<p class="marker">スクリーンショットの処理の記載は、</p>

```
/tests/example.spec.ts
```

上記のファイルが自動で作成されているはずなので、下記をコピペして上書きしましょう。

```
import { test, expect } from '@playwright/test';

test('React Visual Regression Test', async ({ page }) => {
	// go to localhost:3000
	await page.goto('[http://localhost:3000](http://localhost:3000/)');
	// Expects have screenshot
	await expect(page).toHaveScreenshot();
});
```

準備は、これで完了です。

あとは、コマンドを実行するだけです。

### コマンド実行

```
npx playwright test --update-snapshots
```

上記を実行すると、

```
tests/example.spec.ts-snapshots
```

上記のディレクトリが作成されて、スクリーンショットが保存されます。

<p class="marker">これが、スクリーンショットで比較する基準になります。</p>

デフォルトだと、chrom、firefox、webkitの３種類の画像が作成されます。

おそらくほとんどの人が、PCならchrome、SPなら色々…といった感じだと思います。

ここの設定は、

**playwright.config.ts**

でやっているので、不要なデバイスはコメントアウトし、テストしたいブラウザのコメントアウトを解除しましょう。

SPならiPhoneもあるので、必要に応じてコメントアウトするかしないか決めてください。

### 実際の画面と比較する

```
npx playwright test
```

上記を実行すると、先ほど

```
npx playwright test --update-snapshots
```

で保存した画像と比較してくれます。

<p class="marker">差分が発生した場合は、ブラウザが立ち上がり、差分を確認できます。</p>

<p class="marker">ここでは、index.htmlを適当に変更しておきましょう。</p>

そうすると下記のように差分がわかります。

<p><img loading="lazy" decoding="async" src="/images/uploads/2024/11/09132913/playwright_diff.webp" alt="" width="1947" height="1252" class="alignnone size-full wp-image-40" srcset="/images/uploads/2024/11/09132913/playwright_diff.webp 1947w, /images/uploads/2024/11/09132913/playwright_diff-768x494.webp 768w, /images/uploads/2024/11/09132913/playwright_diff-1536x988.webp 1536w" sizes="auto, (max-width: 1947px) 100vw, 1947px"></p>

ここでは、テキストを増やした箇所が、差分としてオレンジ色になっています。

Diffは差分（画像の差分がオレンジ）。

Actualは、既存の状態。Expectedが基準となっている画像。

Side by sideが二つの画像を横並び。

Sliderはスライドバーで差分を確認できます。

実際に、いじってみるとわかりやすいです。

なお、テストが成功した場合はアプリが立ち上がらず、成功の通知のみになります。

その場合は、

```
npx playwright show-report  --port=9333
```

上記のコマンドレポートを確認できます。

※—port=9333はポート番号が被らないようにするためです。

## ファイル名やテスト名でテストを実行

```
npx playwright test
```

上記のコマンドだと、testディレクト配下のテストを全て実行します。それだと不便だと思いますので、ファイル名の指定方法、また一つのファイルに複数のテストを記載する場合の個別実行の方法をお教えします。

### 特定のテストのみ実行する

コマンドは簡単で、

```
npx playwright test　ファイル名.spect.ts  
```

上記でOKです。

テスト名でテストがしたい場合は、

```
npx playwright test --grep "テスト名"
```

上記になります。テスト名の被りが怖い場合は、ファイル名と組み合わせることも可能です。

上記以外にも、テストにタグなどを入れて、それをgrepして実行したりもできるので、公式サイトなど参考に調べてみてください！

### まとめ

ここまでで一旦は、Playwrightのチュートリアルは終了です。

一方でテストを実行することは自体は、非常に簡単であることは分かったと思います。

より詳しいテストの作成方法や、より実践的なテストの方法については別途他の記事で説明してくので、興味がありましたら読んでみてください。

特にテストを作成する場合は、VSCodeのプラグインのインストールがほぼ必須です。

そのため、是非使い方を学びましょう。

※記事を作成次第連携していきますので、少々お待ちください。
