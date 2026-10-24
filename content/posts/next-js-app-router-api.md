---
title: Next.js App RouterでのAPI設計
date: '2026-05-03T04:16:20'
modified: '2026-05-09T01:00:24'
categories:
  - nextjs
  - coding
excerpt: >-
  Next.js App Routerでデータ取得・更新・外部APIをどこに書くか迷う方向け。GETはServer Component、更新はServer
  Actions、WebhookはRoute Handlersと役割分担するベタープラクティスを、ディレクトリ例つきで整理します。
eyecatch: /images/uploads/2026/05/03041501/next-js-app-router-api.webp
---
Next.jsでApp Router（`app/` ディレクトリ）を使い始めた時、多くの人が直面する悩みが「APIやデータフェッチの処理をどこに、どうやって書くべきか？」という問題です。

-   ・「全部 app/api/ の下に route.ts を作るべき？」
-   ・「標準機能の Server Actions（action.ts）で全部済ませていいの？」
-   ・「コンポーネントと同じファイルに書くのはアリ？」

この記事では、実務でよく採用される<span class="marker">「GET（データ取得）」と「POST（データ更新）」を明確に分けたディレクトリ構成・ファイル分割のベタープラクティス</span>をご紹介します。

<div class="pointContainer"><span class="pointLabel">環境</span><p></p><p>Next.js 15を対象にした記事になります。14以前からの移行は<a href="https://nextjs.org/docs/app/building-your-application/upgrading/version-15" class="link" target="_blank">公式の移行ガイド（codemod付き）</a>を参照してください。</p></div>

* * *

## 結論：役割と影響範囲で「書き場所」を変える

App Routerにおける最も自然でメンテナンスしやすい設計方針は以下の通りです。

| ユースケース | 実装場所 |
| --- | --- |
| そのページでしか使わないデータ取得（GET） | page.tsx（Server Component）に直接書く |
| 複数ページで使い回すデータ取得（GET） | queries.ts などの共通ファイルに切り出して再利用する |
| ボタン操作などで発生するデータ更新（POST/PUT/DELETE） | 同じ階層に action.ts（Server Actions）を作って切り出す |
| 外部サービスから呼ばれるエンドポイント | app/api/…/route.ts（Route Handlers）を使う |

それぞれについて、具体的なコードと合わせて解説します。

## パターン1：そのページ専用のデータ取得（GET）

「ページを開いた時に表示するデータを取得したい」場合、その処理が他のページで使い回されないのであれば、無理に別ファイル（`api/get-user.ts` など）に切り出さず、`page.tsx` の中に直接書いてしまうのがベストです。

### Server Component とは？

App Routerでは、ファイルの先頭に `‘use client’` と書かない限り、コンポーネントは自動的に<span class="marker">サーバー側で実行される Server Component</span> として扱われます。

Server Component は通常のReactコンポーネントと書き方はほぼ同じですが、実行環境がブラウザではなくサーバーになります。最大の特徴は、コンポーネント関数を `async` にしてそのまま `await` でデータ取得できる点です。`useEffect` や `useState` を使った回りくどいフェッチ処理が不要になります。

また、データ取得のロジックがサーバー上にとどまるため、APIキーや接続文字列などの機密情報がブラウザに露出しません。さらに、サーバーで完成したHTMLを返すので初期表示が速く、コンポーネント自体のJavaScriptもブラウザに送られないためバンドルサイズの削減にも貢献します。

一方、`‘use client’` を先頭に付けたコンポーネントはブラウザ上で動く Client Component になります。`onClick` などのイベントハンドラや `useState` / `useEffect` が使えますが、直接DBにアクセスしたりサーバー専用のAPIを呼ぶことはできません。

|  | Server Component | Client Component |
| --- | --- | --- |
| 宣言方法 | 何も書かない（デフォルト） | 先頭に ‘use client’ を追加 |
| 実行場所 | サーバー | ブラウザ |
| async/await | そのまま使える | 使えない（useEffect経由） |
| イベントハンドラ | 使えない | 使える |
| useState / useEffect | 使えない | 使える |
| DB・シークレットへの直接アクセス | できる | できない |

### なぜ page.tsx に直接書くのか？

Server Component はコンポーネントの中に `async` 関数を直接定義してデータを取得できます。その処理が他のページで使い回されないのであれば、別ファイルに切り出す必要はありません。

-   ・認知負荷が低い：page.tsx を上から下へ読むだけで「どんなデータを取得して、どう画面を作っているか」が把握できます
-   ・不要なファイル分割を防げる：「念のため」とファイルを分けると、プロジェクトが肥大化した時に可読性が下がります

### 実装例

```
// app/posts/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'

// ① 直接このファイル内でデータ取得処理を定義する
async function getPost(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ② Next.js 15では params が Promise になったため、await して取り出す
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)

  return (
    <main>
      <h1>{post.title}</h1>
      <article>{post.content}</article>
      {/* 編集コンポーネントなどはClient Componentとして呼び出す */}
    </main>
  )
}
```

<div class="pointContainer"><span class="pointLabel">ポイント</span><p></p><p><strong>YAGNI原則</strong><br>この getPost がサイドバーや他の画面でも必要になったタイミングで初めて、queries.ts などの別ファイルに切り出せばOKです。YAGNI（You Aren’t Gonna Need It）とは「今必要でないものは作らない」という設計原則で、過剰な先読み設計を防ぎ、コードをシンプルに保ちます。</p></div>

<div class="cautionContainer"><span class="cautionLabel">注意</span><p></p><p><strong>Next.js 15での params の変更点</strong><br>Next.js 15から params（および searchParams）は Promise になりました。await params してから値を取り出す必要があります。v14以前の params.id のような同期アクセスは非推奨となり、将来のバージョンではエラーになります。</p></div>

## パターン2：ユーザー操作によるデータ更新（POST）

「保存ボタンを押した」「自動保存が走った」など、クライアント側（ブラウザ側）での操作をトリガーにしてデータベースを更新したい場合は、Server Actions（`action.ts`）を使います。

管理方法としては、対象となるページ（機能）のディレクトリ内に `action.ts` を配置する <span class="marker">Colocation（コロケーション）</span> パターンが王道です。「関連するファイルをできるだけ近い場所に置く」というこの考え方により、「どのアクションがどの画面に対応するか」を直感的に把握しやすくなります。

### 実装例

```
// app/posts/[id]/action.ts
'use server' // ← これがServer Actionsの目印

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePost(
  postId: string,
  content: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('posts')
    .update({
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  // Next.jsのキャッシュを無効化し、次のアクセス時に最新データを取得させる
  revalidatePath(`/posts/${postId}`)

  return { success: true }
}
```

これをクライアントコンポーネントから呼び出します。`fetch` を使わず、ただの関数としてインポートするのがポイントです。

```
// app/posts/[id]/form.tsx
'use client'

import { updatePost } from './action'

export default function EditForm({ postId }: { postId: string }) {
  const handleSave = async (content: string) => {
    // APIのエンドポイントを指定するのではなく、直接関数を実行
    const result = await updatePost(postId, content)
    if (result?.error) {
      alert('保存に失敗しました')
    }
  }

  return <button onClick={() => handleSave('新しいコンテンツ')}>保存</button>
}
```

### Server Actions のメリット

-   ・型がフルスタックで繋がる：updatePost の引数や戻り値の型が、エディタ上（クライアント側）でそのまま効きます
-   ・revalidatePath が強力：データ更新直後にキャッシュを無効化し、次のアクセス時に最新データを取得させられます

## よくある疑問：「全部 Server Actions じゃダメなの？」

「Server Actionsは関数で呼べて型も付くし便利！じゃあ、データ取得（GET）も全部 Server Actions にしちゃえば良くない？」と思うかもしれません。

しかし、これはアンチパターンです。理由は以下の通りです。

**裏側がすべて POST 通信になる**\
Server Actionsは実行時に必ず POST リクエストとして送信されます。データ取得（GET）のセマンティクスに反するだけでなく、将来的にブラウザやCDNレベルでのキャッシュ制御をしたい場合に恩恵を受けづらくなります。

**SSRの強みが消える**\
クライアント側で `useEffect` などを使いServer Actions経由でデータを取得すると、昔ながらのSPAのように「空の画面が表示される → ローディング → データ表示」という遅い体験になってしまいます。

## パターン3：外部サービス向けのエンドポイント（Route Handlers）

WebhookやサードパーティAPIからのコールバック、あるいはモバイルアプリへのAPI提供など、外部から直接HTTPリクエストを受け取る必要がある場合は Route Handlers（`route.ts`）を使います。

```
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature') ?? ''

  // 署名検証などの処理...

  return NextResponse.json({ received: true })
}
```

逆に言えば、「Next.jsアプリの画面（Reactコンポーネント）から呼び出すため」だけにわざわざ Route Handlers を作る必要はありません。自身のUI向けデータ連携には、これまで紹介した Server Component や Server Actions を使いましょう。

## まとめ

| 操作 | 実装方法 |
| --- | --- |
| データ取得（GET） | Server Componentで。ページ固有なら page.tsx に直接書いてOK |
| データ更新（POST） | Server Actionsで。機能ごとのディレクトリに action.ts を置いて整理 |
| 外部向けエンドポイント | Route Handlersで。app/api/ 配下に route.ts を作成 |

### 全体のディレクトリ構成例

ここまで紹介したパターンをすべて組み合わせると、ディレクトリ構成は以下のようになります。

```
app/
├── posts/
│   ├── page.tsx          # 一覧ページ（Server Component）。データ取得を直接記述
│   └── [id]/
│       ├── page.tsx      # 詳細ページ（Server Component）。データ取得を直接記述
│       ├── action.ts     # データ更新（Server Actions）
│       └── form.tsx      # フォームUI（Client Component）
│
├── api/
│   └── webhooks/
│       └── stripe/
│           └── route.ts  # 外部サービス向けエンドポイント（Route Handlers）
│
└── lib/
    └── queries.ts        # 複数ページで使い回すデータ取得関数をまとめる
```

「取得はServer Component、更新はServer Actions」という役割分担を意識するだけで、Next.jsのパフォーマンスの恩恵を最大限に引き出しつつ、シンプルなディレクトリ構成を維持できます。App Routerのパラダイムに素直に乗ることが、長期的なメンテナンス性向上への近道です。

<div class="cautionContainer"><span class="cautionLabel">注意</span><p></p><p>この記事で紹介した構成はあくまでベタープラクティスの一つです。プロジェクトの規模・チーム構成・要件によって最適な設計は異なります。「なぜこの構成を選んだか」を説明できる状態を保ちつつ、状況に応じて柔軟に判断してください。</p></div>
