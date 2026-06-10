/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { 
    unoptimized: true 
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure Turbopack (default in Next.js 16)
  turbopack: {
    // Turbopack optimizations for development
  },
};

module.exports = nextConfig;