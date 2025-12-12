import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "E7 EXCOFF Builder & Guides",
  description: "Descubre y publica tus builds de personajes y crea guías del juego para la comunidad de Epic Seven.",
  keywords: ["Epic Seven", "E7", "builds", "guides", "wiki", "heroes", "artifacts", "EXCOFF"],
  authors: [{ name: "E7 EXCOFF" }],
  openGraph: {
    title: "E7 EXCOFF Builder & Guides",
    description: "Descubre y publica tus builds de personajes y crea guías para la comunidad.",
    siteName: "E7 EXCOFF",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cinzel.variable} font-sans antialiased bg-e7-void text-white min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
