require("./lib/env/envLoader");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.furucombo.app", "cryptologos.cc", "forum.vaultcraft.io"],
  },
  env: {
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    IPFS_URL: process.env.IPFS_URL,
    DUNE_API_KEY:process.env.DUNE_API_KEY,
    ENSO_API_KEY:process.env.ENSO_API_KEY,
    MASA_CLIENT_ID:process.env.MASA_CLIENT_ID,
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
