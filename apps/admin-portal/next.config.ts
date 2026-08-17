import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@scalex/ui", "@scalex/db"],
  turbopack: {
    // Monorepo root — avoids picking up stray lockfiles outside the repo.
    root: path.join(__dirname, "../.."),
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
