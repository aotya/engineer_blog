import type { Metadata } from "next";
import "./globals.css";
import "./blog.scss";
import { Inter } from "next/font/google";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

// Apply the Inter font
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Lv1 Up! Front End Engineer Blog",
  description: "コーダー・フロントエンドのLVを1UPさせる情報を発信していきます",
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
      <head>
        <meta name="google-site-verification" content="RKrYEEIk-TwjFdCqtmn6lgokbn5FTV8Z_6CkWsfjM-s" />
      </head>
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}