import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration supporting environment variables and fallback placeholders
const rawSupabaseUrl = (import.meta as any)?.env?.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const rawSupabaseAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

/**
 * Returns a guaranteed valid HTTP/HTTPS URL so createClient never throws:
 * "Uncaught Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL."
 */
export function getSafeSupabaseUrl(url?: string): string {
  if (!url || typeof url !== 'string') return 'https://arierwpjaksxxnmvbqwn.supabase.co';
  const trimmed = url.trim();
  if (
    !trimmed || 
    trimmed === 'YOUR_SUPABASE_URL' || 
    trimmed === 'YOUR_SUPABASE_URL_HERE' ||
    trimmed === 'undefined' || 
    trimmed === 'null'
  ) {
    return 'https://arierwpjaksxxnmvbqwn.supabase.co';
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return trimmed;
      }
    } catch {
      return 'https://arierwpjaksxxnmvbqwn.supabase.co';
    }
  }
  if (/^[a-z0-9_-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }
  return 'https://arierwpjaksxxnmvbqwn.supabase.co';
}

export function getSafeSupabaseKey(key?: string): string {
  if (!key || typeof key !== 'string') return 'ap-southeast-1';
  const trimmed = key.trim();
  if (
    !trimmed || 
    trimmed === 'YOUR_SUPABASE_ANON_KEY' || 
    trimmed === 'undefined' || 
    trimmed === 'null'
  ) {
    return 'ap-southeast-1';
  }
  return trimmed;
}

export const supabaseUrl = getSafeSupabaseUrl(rawSupabaseUrl);
export const supabaseAnonKey = getSafeSupabaseKey(rawSupabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export {
  SUPABASE_PROJECT_REF,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  normalizeSupabaseUrl,
  getEffectiveSupabaseConfig,
} from './supabase';

export {
  orderFuel,
  requestSOS,
  placeSupabaseOrder,
  generateDeliveryOtp,
  subscribeToOrderStream,
  fetchAllOrders,
  updateOrderStatus,
  updateDriverLocation,
} from './services/supabase';

export default supabase;
