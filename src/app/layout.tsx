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
  title: "Dua Dekade Penuh Keanggunan — HBD Rifdah",
  description:
    "Selamat ulang tahun ke-20, Rifdah Nur Shafiyah. Sebuah surat cinta digital yang merayakan dua dekade keanggunanmu.",
  keywords: ["birthday", "tribute", "Rifdah", "love letter"],
  openGraph: {
    title: "Dua Dekade Penuh Keanggunan — HBD Rifdah",
    description:
      "Sebuah surat cinta digital yang merayakan dua dekade keanggunan Rifdah Nur Shafiyah.",
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
