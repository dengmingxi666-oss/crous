import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CROUS · 食物法庭",
  description: "大学生的校园食堂点评推荐工具。发现新菜，留下证词，让下一顿夯爆了。",
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
