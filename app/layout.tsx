import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Enterprise Agent Work Graph",
  description: "A shared data plane and control plane for enterprise AI agents."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
