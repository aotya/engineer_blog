import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

export const metadata: Metadata = {
  title: "Lv1 Start ! Front End Engineer Blog",
  description: "コーダ・フロントエンドエンジニア向けの情報発信をしています",
  alternates: {
    canonical: "https://www.front-end-engineer-blog.com/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <meta name="google-site-verification" content="RKrYEEIk-TwjFdCqtmn6lgokbn5FTV8Z_6CkWsfjM-s" />
      <body>
        <Header />
        {children}
        <Footer />

      </body>
    </html>
  );
}
