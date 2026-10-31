import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Hardcoded Supabase Configuration Fallback Strings
 * Project Reference: arierwpjaksxxnmvbqwn
 * Cloud Region: ap-southeast-1
 */
export const SUPABASE_PROJECT_REF = 'arierwpjaksxxnmvbqwn';
export const SUPABASE_URL = 'https://arierwpjaksxxnmvbqwn.supabase.co';
export const SUPABASE_ANON_KEY = 'ap-southeast-1';

/**
 * Normalizes any provided URL or project reference into a full valid Supabase URL
 */
export function normalizeSupabaseUrl(input?: string): string {
  if (!input || typeof input !== 'string') return SUPABASE_URL;
  const trimmed = input.trim();
  if (!trimmed || trimmed === 'YOUR_SUPABASE_URL') return SUPABASE_URL;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (/^[a-z0-9_-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }
  return `https://${trimmed}`;
}

/**
 * Resolves the effective Supabase config using hardcoded fallback strings
 */
export function getEffectiveSupabaseConfig(): { url: string; key: string } {
  const meta = import.meta as unknown as { env?: Record<string, string> };
  const envUrl = meta.env?.VITE_SUPABASE_URL;
  const envKey = meta.env?.VITE_SUPABASE_ANON_KEY;

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

  const rawUrl = storedUrl || envUrl || SUPABASE_URL;
  const finalUrl = normalizeSupabaseUrl(rawUrl);

  const finalKey = (storedKey && storedKey !== 'YOUR_SUPABASE_ANON_KEY')
    ? storedKey
    : (envKey && envKey !== 'YOUR_SUPABASE_ANON_KEY' ? envKey : SUPABASE_ANON_KEY);

  return {
    url: finalUrl,
    key: finalKey,
  };
}

const config = getEffectiveSupabaseConfig();

/**
 * Main exportable Supabase client instance with hardcoded fallback configuration
 */
export const supabase: SupabaseClient = createClient(config.url, config.key);

export default supabase;
