import type { NextConfig } from 'next';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadDotEnv(): Record<string, string> {
  try {
    const content = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    const env: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
        }
      }
    }
    return env;
  } catch {
    return {};
  }
}

const dotEnv = loadDotEnv();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      dotEnv.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || '[REDACTED]',
    NEXT_PUBLIC_MAGIC_LINK_EXPIRY_MINUTES:
      dotEnv.NEXT_PUBLIC_MAGIC_LINK_EXPIRY_MINUTES ||
      process.env.NEXT_PUBLIC_MAGIC_LINK_EXPIRY_MINUTES ||
      '15',
  },
};

export default nextConfig;
