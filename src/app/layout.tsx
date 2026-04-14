import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewBoost — AI 리뷰 분석기",
  description: "쿠팡·아마존 리뷰를 AI가 분석하여 감정, 키워드, 트렌드를 대시보드로 보여줍니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
