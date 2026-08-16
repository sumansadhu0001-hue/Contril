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

  // AI Models Routing Config
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    defaultModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    fallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash',
    reasoningModel: process.env.GEMINI_REASONING_MODEL || 'gemini-3.1-pro-preview',
    embeddingModel: 'text-embedding-004',
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
