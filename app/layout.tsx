import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "校味 · 校园美食点评推荐",
  description: "校园美食点评、反馈与打卡。发现食堂新菜，看看今天吃什么。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
