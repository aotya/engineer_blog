import type { Metadata } from "next";
import "./globals.css";
import "./blog.scss";
import { Inter } from "next/font/google";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

// Apply the Inter font
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.front-end-engineer-blog.com"),
  icons: {
    icon: "/favicon.png",
  },
  title: {
    default: "Lv1 Up! Front End Engineer Blog",
    template: "%s | Lv1 Up! Front End Engineer Blog",
  },
  description: "コーダー・フロントエンドのLVを1UPさせる情報を発信していきます",
  openGraph: {
    title: "Lv1 Up! Front End Engineer Blog",
    description: "コーダー・フロントエンドのLVを1UPさせる情報を発信していきます",
    url: "https://www.front-end-engineer-blog.com",
    siteName: "Lv1 Up! Front End Engineer Blog",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lv1 Up! Front End Engineer Blog",
    description: "コーダー・フロントエンドのLVを1UPさせる情報を発信していきます",
  },
  alternates: {
    canonical: "/",
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