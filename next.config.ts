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
};

export default nextConfig;