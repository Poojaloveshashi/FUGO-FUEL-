/**
 * Re-export of Supabase client and constants for src/supabaseClient.ts
 */
export {
  supabase,
  SUPABASE_PROJECT_REF,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  normalizeSupabaseUrl,
  getEffectiveSupabaseConfig,
} from './supabase';

import { supabase } from './supabase';
export default supabase;
