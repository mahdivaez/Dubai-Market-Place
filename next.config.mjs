/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'instagram.com', 'scontent.cdninstagram.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'instagram.com',
      }
    ],
  },
  // Experimental features to help with hydration
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Suppress hydration warnings for known browser extension issues
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
  // Serve static files from public directory
  async rewrites() {
    return [
      {
        source: '/agents/:path*',
        destination: '/agents/:path*',
      },
    ]
  },
}

export default nextConfig