import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  async rewrites() {
    return [
      {
        // Any request sent to /api/... gets proxied to Express in development
        source: "/api/downloads/:path*",
        destination: "http://localhost:5000/api/downloads/:path*", // Replace 5000 with your Express port
      },
    ];
  },
};

export default nextConfig;