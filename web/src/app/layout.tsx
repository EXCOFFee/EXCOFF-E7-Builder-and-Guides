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
          <footer className="border-t border-white/10 bg-e7-dark/50 py-6 mt-8">
            <div className="container mx-auto px-4 text-center text-sm text-gray-400">
              <p className="mb-2">
                Hero &amp; Artifact data powered by{' '}
                <a
                  href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-e7-gold hover:text-e7-gold/80 underline"
                >
                  Fribbels Epic 7 Optimizer
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Epic Seven © Smilegate &amp; Super Creative. This site is not affiliated with the game developers.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
