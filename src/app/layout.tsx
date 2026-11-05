import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import SmoothScroll from "@/components/animations/SmoothScroll";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Untuk Rifdah Nur Shafiyah — Dua Dekade Penuh Keanggunan (Kado dari Ryan)",
  description:
    "Selamat ulang tahun ke-20 untuk bidadariku, Rifdah Nur Shafiyah. Sebuah persembahan cinta, harapan, dan kenangan terindah dari Ryan.",
  keywords: ["birthday", "Rifdah", "love letter", "Ryan and Rifdah", "20th birthday"],
  openGraph: {
    title: "Untuk Rifdah Nur Shafiyah — Dua Dekade Penuh Keanggunan",
    description:
      "Sebuah persembahan cinta, harapan, dan kenangan terindah dari Ryan untuk Rifdah di usia ke-20.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${outfit.variable} antialiased`}
    >
      <body className="min-h-screen">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
