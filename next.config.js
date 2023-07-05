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
    DUNE_API_KEY: process.env.DUNE_API_KEY,
  },
};

module.exports = nextConfig;
