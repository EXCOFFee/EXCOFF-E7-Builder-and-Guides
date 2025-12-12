import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Image Optimization for external images
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },

  // Enable static exports for pages that can be static
  // Note: Dynamic routes like [slug] will work with ISR on Vercel

  // Trailing slash for compatibility
  trailingSlash: true,
};

export default nextConfig;
