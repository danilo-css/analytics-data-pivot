import type { Metadata } from "next";
import { Geist as FontSans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = localFont({
  src: "./assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Analytics Data Pivot (ADPivot) | AnalyticsData.Pro",
  description:
    "Analytics Data Pivot (ADPivot) is a powerful Data Analytics tool, allowing users to build pivot tables from Excel or Parquet files, powered by DuckDB-Wasm and Pyodide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "flex flex-col min-h-screen bg-background font-sans antialiased bg-black text-white",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
