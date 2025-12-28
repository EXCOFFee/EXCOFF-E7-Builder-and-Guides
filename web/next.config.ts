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

const nextConfig: NextConfig = {
  // Image optimization - allow external images with high quality
  images: {
    unoptimized: false,
    // Define image sizes for responsive loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.hostingersite.com',
      },
      {
        protocol: 'https',
        hostname: 'moccasin-sparrow-217730.hostingersite.com',
      },
      {
        protocol: 'https',
        hostname: 'epic7.gg.onstatic.com',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Trailing slash for compatibility
  trailingSlash: true,
};

export default nextConfig;
