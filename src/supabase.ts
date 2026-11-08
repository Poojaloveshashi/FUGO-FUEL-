import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project configuration (using valid client-side publishable key)
export const DEFAULT_SUPABASE_URL = 'https://arierwpjaksxxnmvbqwn.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable__c-Q3k0ibuQMt3_mtYpRNw_Se-8kFbS';

export const SUPABASE_PROJECT_REF = 'arierwpjaksxxnmvbqwn';
export const DEFAULT_FALLBACK_URL = DEFAULT_SUPABASE_URL;
export const DEFAULT_FALLBACK_KEY = DEFAULT_SUPABASE_KEY;

export const HARDCODED_SUPABASE_URL = DEFAULT_SUPABASE_URL;
export const HARDCODED_SUPABASE_KEY = DEFAULT_SUPABASE_KEY;

/**
 * Validates that a Supabase URL starts with https:// and is not a placeholder
 */
export function isValidSupabaseUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (!u.startsWith('https://')) return false;
  if (
    u.includes('YOUR_ACTUAL_PROJECT_REF') || 
    u.includes('YOUR_SUPABASE_URL') || 
    u.includes('your-project-id')
  ) {
    return false;
  }
  return true;
}

/**
 * Validates that a Supabase key is a valid client-side key (sb_publishable_ or anon JWT eyJ...)
 * Note: Secret keys (sb_secret_...) are strictly rejected by Supabase in browser environments.
 */
export function isValidSupabaseKey(key?: string | null): boolean {
  if (!key || typeof key !== 'string') return false;
  const k = key.trim();
  if (
    k === 'ap-southeast-1' || 
    k === 'YOUR_ACTUAL_ANON_KEY' || 
    k === 'YOUR_SUPABASE_ANON_KEY' ||
    k.startsWith('sb_secret_') ||
    k === 'undefined' ||
    k === 'null'
  ) {
    return false;
  }
  return k.startsWith('sb_publishable_') || k.startsWith('eyJ');
}

// Clean stored config if it contains invalid values, legacy keys, or forbidden sb_secret_ keys
if (typeof localStorage !== 'undefined') {
  try {
    const raw = localStorage.getItem('fugo_supabase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        !isValidSupabaseUrl(parsed.url) || 
        !isValidSupabaseKey(parsed.key) || 
        parsed.key?.startsWith('sb_secret_') ||
        parsed.key === 'sb_publishable_7Eo4cNMUzMwFMmHd5ZiQlA_pyygJ0uM'
      ) {
        localStorage.removeItem('fugo_supabase_config');
      }
    }
  } catch {
    // ignore
  }
}

const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY;

let storedConfigUrl: string | undefined;
let storedConfigKey: string | undefined;

if (typeof localStorage !== 'undefined') {
  try {
    const raw = localStorage.getItem('fugo_supabase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidSupabaseUrl(parsed.url) && isValidSupabaseKey(parsed.key)) {
        storedConfigUrl = parsed.url;
        storedConfigKey = parsed.key;
      }
    }
  } catch {
    // ignore
  }
}

// Priority: Valid stored config -> Valid env var -> Project default publishable key
export const supabaseUrl = (storedConfigUrl && isValidSupabaseUrl(storedConfigUrl))
  ? storedConfigUrl
  : (envUrl && isValidSupabaseUrl(envUrl))
  ? envUrl
  : DEFAULT_SUPABASE_URL;

export const supabaseAnonKey = (storedConfigKey && isValidSupabaseKey(storedConfigKey))
  ? storedConfigKey
  : (envKey && isValidSupabaseKey(envKey))
  ? envKey
  : DEFAULT_SUPABASE_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export function normalizeSupabaseUrl(input?: string): string {
  if (!input || typeof input !== 'string') return DEFAULT_SUPABASE_URL;
  const trimmed = input.trim();
  if (trimmed.startsWith('https://')) return trimmed;
  if (/^[a-z0-9_-]+$/i.test(trimmed)) return `https://${trimmed}.supabase.co`;
  return DEFAULT_SUPABASE_URL;
}

export function isSupabaseConfigured(): boolean {
  return isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseAnonKey);
}

export function getEffectiveSupabaseConfig(): { url: string; key: string } {
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
  };
}

export default supabase;
