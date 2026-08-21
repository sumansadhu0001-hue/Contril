import 'dotenv/config';

// Contril AI OS - Central Configuration & System Constants
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appName: 'Contril AI OS',
  apiVersion: 'v1',

  // Database & Auth (Supabase PostgreSQL + pgvector)
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/contril_db',
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    maxPoolSize: 20,
    idleTimeoutMs: 30000,
  },

  // Cache & Queue (Redis + BullMQ)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  // AI Models Routing Config (Server-Authoritative NVIDIA Cloud Inference)
  ai: {
    provider: process.env.AI_PROVIDER || 'nvidia',
    nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
    nvidiaBaseUrl: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    defaultModel: process.env.AI_MODEL || 'meta/llama-3.1-8b-instruct',
    fallbackModel: process.env.AI_FALLBACK_MODEL || 'meta/llama-3.2-3b-instruct',
    temperature: 0.6,
    maxTokens: 1024,
    vectorDimensions: 768,
  },

  // Security & Rate Limiting
  security: {
    jwtSecret: process.env.JWT_SECRET || 'contril-ai-os-super-secret-jwt-key-2026',
    tokenExpiryHours: 24,
    refreshTokenExpiryDays: 30,
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 1000,
    encryptionAlgorithm: 'aes-256-gcm',
  },

  // Feature Flags Default State
  featureFlags: {
    enableAutonomousEngine: true,
    enableDeepResearch: true,
    enableZeroKnowledgeEnclave: true,
    enableLiveThinkingTicker: true,
    enableVectorSearch: true,
  }
};
