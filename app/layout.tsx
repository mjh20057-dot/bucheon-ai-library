import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "부천 AI 도서관",
  description: "자연어로 책을 찾고 도서관별 소장·대출 가능 여부를 확인하는 AI 도서검색 서비스",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
