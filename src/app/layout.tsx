import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QA Roadmap — курси з тестування ПЗ та автоматизації QA",
  description:
    "Покрокові курси для тих, хто хоче побудувати кар'єру в QA — від основ ручного тестування до автоматизації на Selenium і Playwright.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-zinc-950 antialiased">{children}</body>
    </html>
  );
}
