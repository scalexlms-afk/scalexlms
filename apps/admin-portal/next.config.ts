import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@scalex/ui", "@scalex/db"],
};

export default nextConfig;
