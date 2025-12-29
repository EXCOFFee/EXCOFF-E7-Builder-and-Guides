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
    default: 'EXCOFF E7 Hub - Epic Seven Builds, Guides & Hero Wiki',
    template: '%s | EXCOFF E7 Hub',
  },
  description: 'EXCOFF E7 Hub - Your ultimate Epic Seven (E7) resource hub. Discover hero builds, guides, tier lists, and equipment recommendations. Community-driven E7 builds for PvP, RTA, Arena & Guild War.',
  keywords: [
    'Epic Seven', 'E7', 'Epic7', 'Epic 7', 'EpicSeven', 'EXCOFF', 'excoffe7',
    'builds', 'guides', 'wiki', 'heroes', 'artifacts', 'equipment',
    'tier list', 'sets', 'PvP', 'PvE', 'RTA', 'Arena', 'Guild War',
    'gacha', 'mobile game', 'hero builds', 'best builds', 'meta builds',
    'E7 builds', 'E7 guides', 'E7 tier list', 'E7 wiki', 'E7 heroes'
  ],
  authors: [{ name: 'EXCOFF E7 Hub Community' }],
  creator: 'EXCOFF E7 Hub',
  publisher: 'EXCOFF E7 Hub',
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
    title: 'EXCOFF E7 Hub - Epic Seven Builds, Guides & Hero Wiki',
    description: 'Your ultimate Epic Seven (E7) resource hub. Hero builds, guides, tier lists & equipment for PvP, RTA, Arena & Guild War.',
    siteName: 'EXCOFF E7 Hub',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EXCOFF E7 Hub - Epic Seven Builds & Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EXCOFF E7 Hub - Epic Seven Builds, Guides & Hero Wiki',
    description: 'Your ultimate Epic Seven (E7) resource hub. Hero builds, guides & tier lists.',
    images: ['/images/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual code when available
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/en',
      'es': '/es',
      'ko': '/ko',
      'ja': '/ja',
      'zh': '/zh',
      'pt': '/pt',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data for SEO
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EXCOFF E7 Hub',
    alternateName: ['Epic Seven Hub', 'E7 Hub', 'excoffe7', 'Epic Seven Builds'],
    url: 'https://excoff-e7-orbis-helper.vercel.app',
    description: 'Your ultimate Epic Seven (E7) resource hub. Hero builds, guides, tier lists & equipment recommendations.',
    inLanguage: ['en', 'es', 'ko', 'ja', 'zh', 'pt'],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://excoff-e7-orbis-helper.vercel.app/heroes?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EXCOFF E7 Hub',
    url: 'https://excoff-e7-orbis-helper.vercel.app',
    logo: 'https://excoff-e7-orbis-helper.vercel.app/images/icon_menu_orbis.png',
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/images/icon_menu_orbis.png" />
        <link rel="apple-touch-icon" href="/images/icon_menu_orbis.png" />
        <meta name="theme-color" content="#c8aa6e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
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
