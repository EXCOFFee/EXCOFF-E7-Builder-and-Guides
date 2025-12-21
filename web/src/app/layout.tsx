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
  metadataBase: new URL('https://excoff-e7-orbis-helper.vercel.app'),
  title: {
    default: 'E7 Orbis Helper - Builds & Guides',
    template: '%s | E7 Orbis Helper',
  },
  description: 'Descubre y publica tus builds de personajes y crea guías del juego para la comunidad de Epic Seven. Encuentra las mejores builds, artefactos y equipos.',
  keywords: [
    'Epic Seven', 'E7', 'builds', 'guides', 'wiki', 'heroes', 'artifacts',
    'EXCOFF', 'Epic 7', 'gacha', 'tier list', 'equipment', 'sets',
    'PvP', 'PvE', 'RTA', 'Arena', 'Guild War'
  ],
  authors: [{ name: 'E7 Orbis Helper Community' }],
  creator: 'E7 Orbis Helper',
  publisher: 'E7 Orbis Helper',
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
  openGraph: {
    title: 'E7 Orbis Helper - Builds & Guides',
    description: 'Descubre y publica tus builds de personajes y crea guías para la comunidad de Epic Seven.',
    siteName: 'E7 Orbis Helper',
    locale: 'es_ES',
    type: 'website',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'E7 Orbis Helper - Builds & Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E7 Orbis Helper - Builds & Guides',
    description: 'Builds y guías para la comunidad de Epic Seven',
    images: ['/images/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual code when available
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
        className={`${inter.variable} ${cinzel.variable} font-sans antialiased bg-void-glow text-slate-200 min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
          <footer className="border-t border-e7-gold/10 glass-panel py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p className="mb-3 text-slate-400">
                Hero &amp; Artifact data powered by{' '}
                <a
                  href="https://github.com/fribbels/Fribbels-Epic-7-Optimizer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-e7-gold hover:text-e7-text-gold transition-colors underline decoration-e7-gold/30 hover:decoration-e7-gold"
                >
                  Fribbels Epic 7 Optimizer
                </a>
                {' | '}
                <a
                  href="/credits"
                  className="text-e7-gold hover:text-e7-text-gold transition-colors underline decoration-e7-gold/30 hover:decoration-e7-gold"
                >
                  Credits
                </a>
              </p>
              <p className="text-xs text-slate-500">
                Epic Seven © Smilegate &amp; Super Creative. This site is not affiliated with the game developers.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
