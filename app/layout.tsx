import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = localFont({
  src: [
    {
      path: "../public/fonts/CormorantGaramond-Italic-VariableFont_wght.ttf",
    },
  ],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "Orlume | The AI Website Builder",
  description: "Create stunning, production-ready websites in seconds with Orlume AI. From concept to code, let artificial intelligence build your interface.",
  keywords: ["AI website builder", "react", "nextjs", "web design", "frontend development"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
