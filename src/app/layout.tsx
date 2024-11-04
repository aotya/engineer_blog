import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "Lv1 Start ! Front End Engineer Blog",
  description: "コーダ・フロントエンドエンジニア向けの情報発信をしています",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={noto.className}>
        <Header />
        {children}
        <Footer />

      </body>
    </html>
  );
}
