import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      root: path.join(__dirname, "../.."),
    },
  },
};

export default nextConfig;
