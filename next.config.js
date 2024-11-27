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
    DUNE_API_KEY: process.env.DUNE_API_KEY,
    ENSO_API_KEY: process.env.ENSO_API_KEY,
    DEFILLAMA_API_KEY: process.env.DEFILLAMA_API_KEY,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK,
    FLASHBOTS_RPC_URL: process.env.FLASHBOTS_RPC_URL,
    MAINNET_RPC_URL: process.env.MAINNET_RPC_URL,
    VCX_RECIPIENT: process.env.VCX_RECIPIENT,
    BOT_PRIVATE_KEY: process.env.BOT_PRIVATE_KEY,
    MIN_AMOUNT: process.env.MIN_AMOUNT,
    WATCH_LIST: process.env.WATCH_LIST,
    ZK_FETCH_APP_ID: process.env.ZK_FETCH_APP_ID,
    ZK_FETCH_SECRET: process.env.ZK_FETCH_SECRET,
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
