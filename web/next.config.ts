import type { NextConfig } from "next";

// Security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
];

// Cache headers for static assets (1 year)
const cacheHeaders = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable'
  },
];

const nextConfig: NextConfig = {
  // Optimización de imágenes. El plan Hobby de Vercel tiene una cuota mensual de
  // transformaciones compartida por todo el equipo, por eso:
  // - solo se optimizan las imágenes pesadas (retratos, artefactos, imágenes de guías);
  //   los íconos chicos usan `unoptimized`
  // - cada transformación se cachea 31 días, un solo formato y una sola calidad
  // - DISABLE_IMAGE_OPTIMIZATION=1 en Vercel la apaga sin tocar código si se agota la cuota
  images: {
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === '1',
    minimumCacheTTL: 2678400,
    formats: ['image/webp'],
    qualities: [75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Pocos anchos: cada ancho distinto es una transformación más por imagen. Así un retrato
    // tiene como máximo 64/128/256/384/640 y un artefacto 64/128/256 (~2.800/mes en el peor caso).
    imageSizes: [64, 128, 256, 384],
    // Rutas acotadas: un dominio abierto permitiría gastar la cuota con imágenes ajenas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/CeciliaBot/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/fribbels/**',
      },
      {
        protocol: 'https',
        hostname: 'epic7db.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'moccasin-sparrow-217730.hostingersite.com',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'moccasin-sparrow-217730.hostingersite.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'epic7.gg.onstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'image.onstove.com',
      },
      {
        protocol: 'https',
        hostname: 'd2x8kymwjom7h7.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },

  // Enable gzip/brotli compression
  compress: true,

  // Optimize for production
  poweredByHeader: false,

  // Security and cache headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Cache static assets for 1 year
      {
        source: '/images/:path*',
        headers: cacheHeaders,
      },
      {
        source: '/fonts/:path*',
        headers: cacheHeaders,
      },
      // /_next/static ya lo cachea Next.js como immutable; un header propio rompe el modo dev
    ];
  },

  // Trailing slash for compatibility
  trailingSlash: true,

  // Rewrite API images to avoid CORS issues in html2canvas
  async rewrites() {
    return [
      {
        source: '/api-images/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://moccasin-sparrow-217730.hostingersite.com'}/:path*`,
      },
    ];
  },
};

export default nextConfig;

