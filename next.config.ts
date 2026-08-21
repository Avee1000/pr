import type { NextConfig } from "next";
import "./src/utils/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pdfkit"],

  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/v1",
          destination: "http://127.0.0.1:8000/api/v1",
        },
        {
          source: "/api/v1/:path*",
          destination: "http://127.0.0.1:8000/api/v1/:path*",
        },
        {
          source: "/api/v2",
          destination: "http://127.0.0.1:8000/api/v2",
        },
        {
          source: "/api/v2/:path*",
          destination: "http://127.0.0.1:8000/api/v2/:path*",
        },
      ];
    }
    return [];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fdskrduaeipkvxxkdzwx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;