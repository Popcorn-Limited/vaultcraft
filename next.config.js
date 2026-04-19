require("./lib/env/envLoader");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.furucombo.app", "cryptologos.cc", "forum.vaultcraft.io"],
  },
  // Next.js inlines vars listed here into the CLIENT-side JS bundle at build
  // time. Only keep values that client code legitimately needs. Server-only
  // code (API routes, server components) reads process.env directly at
  // runtime and does NOT need an entry here.
  env: {
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    IPFS_URL: process.env.IPFS_URL,
    ENSO_API_KEY: process.env.ENSO_API_KEY,
    DEFILLAMA_API_KEY: process.env.DEFILLAMA_API_KEY,
    DEBANK_API_KEY: process.env.DEBANK_API_KEY,
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'X-Requested-With, Content-Type, Authorization',
        },
      ]
    }
    ]
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
