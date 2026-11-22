import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["latin", "arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "هستی — دستیار هوش‌مصنوعی خصوصی",
  description:
    "دستیار هوش‌مصنوعی خصوصی و روی‌سرور. همه چیز در شبکه محلی، در خانه شما.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen bg-[#070a13] font-vazir text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
