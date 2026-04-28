/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for standalone Docker production builds
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "soilintelligence.lt" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  // In production the API is on a different domain — rewrites only help in dev
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
