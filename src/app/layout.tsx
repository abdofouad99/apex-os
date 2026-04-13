import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "APEX - Agency OS",
  description: "AI Marketing Operating System",
};

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="font-cairo min-h-full flex bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex w-full min-h-screen">
            {/* Sidebar on the right */}
            <Sidebar />

            {/* Main Content Area: Margin on right to accommodate fixed 72-width sidebar */}
            <div className="flex-1 flex flex-col pr-72 transition-all">
              <Header />
              <main className="flex-1 p-6 overflow-x-hidden">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
