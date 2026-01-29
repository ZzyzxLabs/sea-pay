import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@seapay/deeplink", "@seapay/alchemy-erc4337"],
};

export default nextConfig;
