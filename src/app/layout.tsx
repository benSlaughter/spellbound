import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SpellBound 🌟 — Magical Learning Garden",
  description:
    "A fun, colourful learning app for spelling and maths — grow your knowledge garden!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col md:flex-row bg-garden-bg font-sans">
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 pt-[60px] md:pt-0">
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
