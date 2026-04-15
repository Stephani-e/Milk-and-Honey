import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";

// This is your "Times New Roman" style alternative
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

// This is for clean buttons and labels
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Milk and Honey • RCCG Province 56",
  description: "Administrative Portal for Digital Ministry",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          className={`${lora.variable} ${inter.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col font-serif">
      {children}
      </body>
      </html>
  );
}