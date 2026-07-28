import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ระบบนิเทศการสอนออนไลน์",
  description: "Instructional Supervision System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col md:flex-row`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
