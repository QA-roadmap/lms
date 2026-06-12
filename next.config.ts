import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-syntax-highlighter"],
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
