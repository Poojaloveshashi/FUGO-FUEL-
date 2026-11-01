import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fallback project configuration
export const SUPABASE_PROJECT_REF = 'arierwpjaksxxnmvbqwn';
export const DEFAULT_FALLBACK_URL = 'https://arierwpjaksxxnmvbqwn.supabase.co';
export const DEFAULT_FALLBACK_KEY = 'ap-southeast-1';

/**
 * Normalizes and validates any URL or project ID into a valid HTTP/HTTPS URL
 */
export function normalizeSupabaseUrl(input?: string): string {
  if (!input || typeof input !== 'string') return DEFAULT_FALLBACK_URL;
  const trimmed = input.trim();
  if (
    !trimmed || 
    trimmed === 'YOUR_SUPABASE_URL' || 
    trimmed === 'undefined' || 
    trimmed === 'null' ||
    trimmed === 'YOUR_SUPABASE_URL_HERE'
  ) {
    return DEFAULT_FALLBACK_URL;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return trimmed;
      }
    } catch {
      return DEFAULT_FALLBACK_URL;
    }
  }
  if (/^[a-z0-9_-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }
  return DEFAULT_FALLBACK_URL;
}

/**
 * Normalizes and validates anon key
 */
export function normalizeSupabaseKey(input?: string): string {
  if (!input || typeof input !== 'string') return DEFAULT_FALLBACK_KEY;
  const trimmed = input.trim();
  if (
    !trimmed || 
    trimmed === 'YOUR_SUPABASE_ANON_KEY' || 
    trimmed === 'undefined' || 
    trimmed === 'null'
  ) {
    return DEFAULT_FALLBACK_KEY;
  }
  return trimmed;
}

// Safely determine initial URL and Key from environment or defaults
const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = normalizeSupabaseUrl(envUrl);
const supabaseAnonKey = normalizeSupabaseKey(envKey);

/**
 * Create Supabase client safely with catch fallback to ensure the app never crashes
 */
function createSafeSupabaseClient(url: string, key: string): SupabaseClient {
  try {
    return createClient(url, key);
  } catch (err) {
    console.warn('[Supabase] Warning: initial client initialization with configured URL failed, falling back to safe URL:', err);
    try {
      return createClient(DEFAULT_FALLBACK_URL, DEFAULT_FALLBACK_KEY);
    } catch (fallbackErr) {
      console.error('[Supabase] Critical error initializing fallback client:', fallbackErr);
      return createClient('https://your-project-id.supabase.co', 'ap-southeast-1');
    }
  }
}

export const supabase: SupabaseClient = createSafeSupabaseClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
export { supabaseUrl, supabaseAnonKey };

/**
 * Resolves the effective Supabase config using stored localStorage or environment fallback strings
 */
export function getEffectiveSupabaseConfig(): { url: string; key: string } {
  let storedUrl = '';
  let storedKey = '';

  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('fugo_supabase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        storedUrl = parsed.url || '';
        storedKey = parsed.key || '';
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  const rawUrl = storedUrl || envUrl;
  const finalUrl = normalizeSupabaseUrl(rawUrl);

  const rawKey = storedKey || envKey;
  const finalKey = normalizeSupabaseKey(rawKey);

  return {
    url: finalUrl,
    key: finalKey,
  };
}

export default supabase;

