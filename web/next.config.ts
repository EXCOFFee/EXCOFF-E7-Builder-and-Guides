import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',

  // Base path for GitHub Pages (repo name)
  basePath: '/EXCOFF-E7-Builder-and-Guides',

  // Asset prefix for static files
  assetPrefix: '/EXCOFF-E7-Builder-and-Guides/',

  // Disable Image Optimization (not supported in static export)
  images: {
    unoptimized: true,
  },

  // Trailing slash for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
