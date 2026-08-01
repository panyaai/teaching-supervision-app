import type { Metadata } from "next";
import { Mali } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";

const mali = Mali({ 
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "ระบบนิเทศการสอนออนไลน์",
  description: "ระบบนิเทศการสอนออนไลน์สำหรับโรงเรียน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mali.className} bg-slate-50 min-h-screen flex flex-col md:flex-row`}>
        <AuthProvider>
          <div className="print:hidden h-full">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col min-h-screen w-full">
            <div className="print:hidden">
              <Header />
            </div>
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden print:p-0 print:m-0">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
