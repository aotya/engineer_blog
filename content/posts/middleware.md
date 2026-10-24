---
title: Next.jsでログイン画面かTOPに遷移させるかの判定方法（middleware.ts）
date: '2025-10-25T00:46:52'
modified: '2025-11-02T02:40:02'
categories:
  - nextjs
  - coding
excerpt: >-
  Next.jsの認証リダイレクトで画面がチラつく問題をMiddlewareで解決。`middleware.ts`を使い、ページ表示前にサーバー側でセッションを判定。ログイン/未ログインでシームレスに振り分ける方法を解説。UX向上とロジックの一元管理に。
eyecatch: /images/uploads/2025/10/25004627/middleware.webp
---
Next.jsでの開発で、多くの人が最初に悩むポイントの一つが「認証」です。特に、サイトに訪れたユーザーを「ログイン済み」か「未ログイン」かによって、TOPページとログインページのどちらに振り分けるか、というロジックは必須の実装と言えるでしょう。

一度ログインしたユーザーは、セッションが有効な間はログイン画面をスキップしてTOPページに直接アクセスさせたいですよね。

Next.jsに慣れていないと、クライアント側（ブラウザ）でCookieなどのセッション情報をチェックして、なければログインページにリダイレクトする、という実装を考えがちです。

この方法も間違いではありませんが、一瞬TOPページが表示されてからログインページに遷移するため、画面がチラついてしまい、ユーザー体験（UX）を損なう可能性があります。

Next.jsのmiddlewareなら解決できます。

<strong class="marker">middlewareを使えば、リクエストがページに到達する前のサーバー側でユーザーの状態を判定し、表示するページを振り分けることが可能です。</strong>

この記事では、middleware.tsを使って認証状態に応じたリダイレクト処理を実装する方法を解説します。

## Middlewareによる認証システムの実装

Next.jsのMiddlewareは、リクエストが完了する前にコードを実行するための機能です。これを利用して、特定のリクエストに対して認証チェックを行い、条件に応じてリダイレクトさせることができます。

### 1. middleware.ts ファイルの作成

まず、プロジェクトのルート階層にmiddleware.tsファイルを作成します。（srcディレクトリがある場合はsrcディレクトリの直下です）\
下記のソースのコメントに詳細を記載しているので、確認しながら、あなたの実装に合ったような修正をお願いします。

```
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middlewareを実行するパスを指定
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};

/*
 * 下記に一致するパスを除く、すべてのリクエストでMiddlewareを実行する
 */

// 認証が不要な公開ページのリスト
const publicRoutes = ['/login', '/register', '/forgot-password'];

// 認証後のデフォルトリダイレクト先
const HOME_URL = '/dashboard';

// Middlewareのメインロジック
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. セッション情報の取得
  const sessionToken = request.cookies.get('session-token')?.value;
  // このトークンが有効かどうかの検証をここで行うのが理想
  const isLoggedIn = !!sessionToken;

  // 2. アクセスしようとしているパスが公開ページかどうかを判定
  const isPublicRoute = publicRoutes.includes(pathname);

  // 3. 未ログイン状態で、かつ保護されたページにアクセスしようとした場合
  if (!isLoggedIn && !isPublicRoute) {
    // 元のURLをクエリパラメータに付けてログインページへリダイレクト
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. ログイン済み状態で、公開ページ（ログインページなど）にアクセスしようとした場合
  if (isLoggedIn && isPublicRoute) {
    // ホームページ（ダッシュボードなど）へリダイレクト
    return NextResponse.redirect(new URL(HOME_URL, request.url));
  }

  // 5. 上記のいずれにも当てはまらない場合は、リクエストをそのまま通す
  return NextResponse.next();
}
```

### 3\. 環境に応じた設定の追加

<strong>本番環境とテスト環境で異なる動作が必要な場合：</strong>

```
// 環境変数を使用した設定例const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// 開発環境では認証チェックをスキップする場合if (isDevelopment && process.env.SKIP_AUTH === 'true') {
  return NextResponse.next();
}
```

envに本番・ステージング・開発環境などの設定をし、条件分岐で動作を変更すれば、開発環境による認証を回避することができます。

## セキュリティ考慮事項

cookiesに保存したセッショントークンの判定のみで不安な場合は、内部APIでセッショントークンが有効化判定するのも良いでしょう。

高いセキュリティが必要なサービスかどうかで、実装するか考慮してください

（例: \`/api/auth/verify\`）を作成し、\`fetch\`で呼び出すのが一般的です。

```
// より安全なセッション検証の例（API経由）
async function isValidSession(req: NextRequest): Promise<boolean> {
  const sessionToken = req.cookies.get('session-token')?.value;
  if (!sessionToken) return false;

  try {
    // 内部APIにセッショントークンを送り、有効性を確認
    // Next.js 13以降では、リクエスト元のURLをベースに絶対パスを生成できる
    const verifyUrl = new URL('/api/auth/verify', req.url);
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Cookieをサーバーサイドのfetchで送信する場合、手動で付与する必要がある
        'Cookie': `session-token=${sessionToken}`,
      },
    });

    return response.ok; // APIが2xxステータスを返せば有効とみなす
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

// middleware.ts 内での呼び出し例
// const isLoggedIn = await isValidSession(request);
```

## middleware.tsを使用する主なメリットとまとめ

middleware.tsで認証ロジックを集約することによって、TOP画面とログイン画面のリダイレクト処理などを、ページのレンタリング前に実行することができます。\
具体的なメリットとしては下記になります

・**一元管理**: 認証ロジックを1つのファイルに集約できる\
・**優れたUX**: ページがレンダリングされる前にリダイレクトするため、画面のチラつきが発生しない\
・**高速動作**: Edge Runtime で実行されるためパフォーマンスが良い\
・**サーバーサイド処理**: クライアントサイドでの認証チェックより安全\
・**SEO対応**: 適切なHTTPステータスコードでのリダイレクト

小規模ならページでしたら、ログイン画面かTOPページで認証してしまった方が楽な場合もありますが、画面が増えるために認証の処理を全ての画面のファイルに記載する必要が出てきます。\
処理が散らばってしまわないようにするためにも、リダイレクトなどの対応は、 middleware.tsに記載するようにしましょう。
