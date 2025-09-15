const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd(), true);

process.env.NEXT_PUBLIC_ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;