import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import JsonLd from "@/components/JsonLd";
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
  metadataBase: new URL('https://orlume.site'),
  title: {
    default: "Orlume | The AI Website Builder",
    template: "%s | Orlume"
  },
  icons: {
    icon: '/favicon.png',
  },
  description: "Create stunning, production-ready websites in seconds with Orlume AI. From concept to code, let artificial intelligence build your interface.",
  keywords: ["AI website builder", "react", "nextjs", "web design", "frontend development"],
  openGraph: {
    title: "Orlume | The AI Website Builder",
    description: "Create stunning, production-ready websites in seconds with Orlume AI. From concept to code, let artificial intelligence build your interface.",
    url: 'https://orlume.site',
    siteName: 'Orlume',
    images: [
      {
        url: '/logo.webp', // Using logo as primary image for now
        width: 800,
        height: 600,
        alt: 'Orlume Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Orlume | The AI Website Builder",
    description: "Create stunning, production-ready websites in seconds with Orlume AI.",
    images: ['/logo.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
        <JsonLd />
        {children}
      </body>
    </html>
  );
}
