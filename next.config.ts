import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],

    // Allow all external images as unoptimized fallback during development
    dangerouslyAllowSVG: true,
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  allowedDevOrigins: ['192.168.62.169', 'localhost:3000'],
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://codebegunbackend-4.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
