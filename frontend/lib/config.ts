export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 30000,
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'FHG AI Email Bot',
    version: '1.0.0',
  },
  auth: {
    jwtStorageKey: process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'fhg_auth_token',
    tokenExpiryBuffer: 5 * 60 * 1000, // 5 minutes
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    debugMode: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
  },
} as const;

export type Config = typeof config;
