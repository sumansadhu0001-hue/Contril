import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabaseUrl = config.database.supabaseUrl;
// Use SUPABASE_SERVICE_ROLE_KEY for full admin permissions
const supabaseServiceKey = config.database.supabaseServiceKey || config.database.supabaseAnonKey;

if (!supabaseUrl) {
  console.warn('[Supabase Admin Error] SUPABASE_URL is not configured in backend.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
