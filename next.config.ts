import type { NextConfig } from "next";

// Side-effect import with relative path ensures validation runs on boot without lint errors
import "./src/utils/env"; // Adjust to "./utils/env" if not using a src/ directory

const nextConfig: NextConfig = {
    reactCompiler: true,
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;