require("./lib/env/envLoader");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.furucombo.app", "cryptologos.cc", "forum.popcorn.network"],
  },
  env: {
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_JWT: process.env.PINATA_JWT,
    IPFS_URL: process.env.IPFS_URL,
    NEXT_PUBLIC_ZERION_KEY: process.env.ZERION_KEY,
  },
  async rewrites() {
    return [
      {
        source: "/api/balancerProxy/:path*",
        destination: "https://api.balancer.fi/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
