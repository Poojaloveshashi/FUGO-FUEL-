import { 
  supabase, 
  supabaseUrl, 
  supabaseAnonKey, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY,
  DEFAULT_FALLBACK_URL,
  DEFAULT_FALLBACK_KEY,
  HARDCODED_SUPABASE_URL,
  HARDCODED_SUPABASE_KEY,
  SUPABASE_PROJECT_REF,
  normalizeSupabaseUrl, 
  getEffectiveSupabaseConfig,
  isSupabaseConfigured,
  isValidSupabaseUrl,
  isValidSupabaseKey
} from './supabase';

export {
  supabase,
  supabaseUrl,
  supabaseAnonKey,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY,
  DEFAULT_FALLBACK_URL,
  DEFAULT_FALLBACK_KEY,
  HARDCODED_SUPABASE_URL,
  HARDCODED_SUPABASE_KEY,
  SUPABASE_PROJECT_REF,
  normalizeSupabaseUrl,
  getEffectiveSupabaseConfig,
  isSupabaseConfigured,
  isValidSupabaseUrl,
  isValidSupabaseKey,
};

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
