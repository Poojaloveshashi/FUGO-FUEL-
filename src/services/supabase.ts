import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseOrderPayload, SupabaseOrderRecord, OrderStreamCallback, StreamEventLog } from '../types';
import { 
  supabase as defaultSupabaseClient, 
  supabaseUrl,
  supabaseAnonKey,
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY,
  normalizeSupabaseUrl, 
  getEffectiveSupabaseConfig,
  isSupabaseConfigured,
  isValidSupabaseUrl,
  isValidSupabaseKey
} from '../supabase';
import { companionSync } from './companionSync';

export { 
  supabaseUrl, 
  supabaseAnonKey, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  DEFAULT_SUPABASE_URL, 
  DEFAULT_SUPABASE_KEY, 
  normalizeSupabaseUrl, 
  companionSync, 
  isSupabaseConfigured 
};

const STORAGE_KEY_ORDERS = 'fugo_supabase_orders';
const STORAGE_KEY_CONFIG = 'fugo_supabase_config';
const EVENT_STREAM_UPDATE = 'fugo:supabase-order-stream';

/**
 * Returns customer_id = 'cust_' + the last 10 digits of the phone.
 * If phone is not provided, uses persistent anonymous device identifier so nobody shares an ID.
 */
export function getCustomerIdFromPhone(phone?: string | null): string {
  if (!phone) {
    let anonId = '';
    try {
      anonId = localStorage.getItem('fugo_anon_cust_id') || '';
      if (!anonId) {
        anonId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        localStorage.setItem('fugo_anon_cust_id', anonId);
      }
    } catch {
      anonId = Date.now().toString().slice(-10);
    }
    return `cust_${anonId}`;
  }
  const digits = phone.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return `cust_${last10.padStart(10, '0')}`;
}

export function getStoredSupabaseConfig() {
  const effective = getEffectiveSupabaseConfig();
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (isValidSupabaseUrl(parsed.url) && isValidSupabaseKey(parsed.key)) {
        return {
          url: parsed.url,
          key: parsed.key,
        };
      } else {
        localStorage.removeItem(STORAGE_KEY_CONFIG);
      }
    }
  } catch (e) {
    console.warn('Could not read stored Supabase config', e);
  }
  return {
    url: effective.url,
    key: effective.key,
  };
}

export function saveStoredSupabaseConfig(url: string, key: string) {
  if (isValidSupabaseUrl(url) && isValidSupabaseKey(key)) {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url: url.trim(), key: key.trim() }));
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  return defaultSupabaseClient;
}

export function resetSupabaseClient() {
  clientInstance = null;
}

/**
 * Generate a random 4-digit code (e.g. 1000-9999) for handshake OTP
 */
export function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

import { FUEL_SALES_ENABLED, FUEL_COMING_SOON_MESSAGE } from '../config/fuelConfig';

/**
 * Order Fuel helper: Inserts a record into the 'orders' table with status 'PENDING'.
 * While FUEL_SALES_ENABLED is false, fuel orders are blocked.
 */
export async function orderFuel({
  fuelType = 'Clean Diesel (BS-VI)',
  litres = 20,
  customerId,
  customerPhone,
  deliveryLat = 17.4125,
  deliveryLng = 78.3364,
  address = 'DLF Cyber City, Gachibowli, Hyderabad',
  totalAmount = 1980,
  paymentStatus = 'UNPAID',
}: {
  fuelType?: string;
  litres?: number;
  customerId?: string;
  customerPhone?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  address?: string;
  totalAmount?: number;
  paymentStatus?: 'PAID' | 'UNPAID';
}) {
  if (!FUEL_SALES_ENABLED) {
    throw new Error(FUEL_COMING_SOON_MESSAGE);
  }
  const otp = generateDeliveryOtp();
  const effectiveCustomerId = customerId || getCustomerIdFromPhone(customerPhone);
  return placeSupabaseOrder({
    service_type: 'FUEL',
    customer_id: effectiveCustomerId,
    customer_phone: customerPhone,
    fuel_type: fuelType,
    litres: litres,
    delivery_lat: deliveryLat,
    delivery_lng: deliveryLng,
    customer_location: `${deliveryLat}, ${deliveryLng}`,
    address: address,
    total_amount: totalAmount,
    price: totalAmount,
    status: 'PENDING',
    handshake_otp: otp,
    otp: otp,
    payment_status: paymentStatus,
  });
}

/**
 * Request SOS / Service helper: Inserts an emergency breakdown/service order with status 'PENDING'.
 * Sends service_type 'FUEL', address, price, and customer_phone.
 * Stops sending driver_lat, driver_lng, driver_speed_kmh.
 */
export async function requestSOS({
  sosType = 'Emergency Roadside SOS',
  customerId,
  customerPhone,
  deliveryLat = 17.4125,
  deliveryLng = 78.3364,
  address = 'EMERGENCY SOS: DLF Cyber City, Gachibowli',
  litres = 10,
  totalAmount = 450,
}: {
  sosType?: string;
  customerId?: string;
  customerPhone?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  address?: string;
  litres?: number;
  totalAmount?: number;
}) {
  const otp = generateDeliveryOtp();
  const effectiveCustomerId = customerId || getCustomerIdFromPhone(customerPhone);
  return placeSupabaseOrder({
    service_type: 'REPAIR',
    customer_id: effectiveCustomerId,
    customer_phone: customerPhone,
    fuel_type: sosType,
    litres: litres,
    delivery_lat: deliveryLat,
    delivery_lng: deliveryLng,
    customer_location: `${deliveryLat}, ${deliveryLng}`,
    address: address,
    total_amount: totalAmount,
    price: totalAmount,
    status: 'PENDING',
    handshake_otp: otp,
    otp: otp,
    payment_status: 'UNPAID',
  });
}

/**
 * Get all stored orders from local storage
 */
export function getLocalOrders(): SupabaseOrderRecord[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local orders', e);
  }
  return [];
}

export function getLocalOrderById(orderId: string): SupabaseOrderRecord | null {
  const orders = getLocalOrders();
  return orders.find(o => o.id === orderId) || null;
}

function saveLocalOrder(record: SupabaseOrderRecord) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  try {
    const current = getLocalOrders();
    const updated = [record, ...current.filter(o => o.id !== record.id)];
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save local order', e);
  }
}

function broadcastLocalOrderUpdate(order: SupabaseOrderRecord, event?: StreamEventLog) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_STREAM_UPDATE, { detail: { order, event } }));
  }
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface AppSettings {
  merchant_vpa: string;
  merchant_name: string;
  gstin: string;
  transport_fee: number;
}

let cachedSettings: AppSettings | null = null;

/**
 * Reads business details from public.app_settings in Supabase.
 * If merchant_vpa is empty, UPI at the door is hidden.
 */
export async function fetchAppSettings(forceRefresh = false): Promise<AppSettings> {
  if (cachedSettings && !forceRefresh) return cachedSettings;

  const defaults: AppSettings = {
    merchant_vpa: '',
    merchant_name: '',
    gstin: '',
    transport_fee: 100,
  };

  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) return defaults;

  try {
    const { data, error } = await client
      .from('app_settings')
      .select('key, value');

    if (!error && data && Array.isArray(data)) {
      const map: Record<string, string> = {};
      data.forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value;
      });

      cachedSettings = {
        merchant_vpa: (map['merchant_vpa'] || '').trim(),
        merchant_name: (map['merchant_name'] || '').trim() || 'Fugo',
        gstin: (map['gstin'] || '').trim(),
        transport_fee: Number(map['transport_fee'] || 0),
      };
      return cachedSettings;
    }
  } catch (err) {
    console.warn('Could not load app_settings from Supabase:', err);
  }

  return defaults;
}

/**
 * Fetches the delivery OTP using the fugo_get_my_otp RPC function if local copy is missing.
 */
export async function fetchMyOtp(orderId: string, customerId: string): Promise<string | null> {
  const local = getLocalOrderById(orderId);
  if (local?.otp && local.otp !== 'null' && local.otp !== 'undefined') {
    return local.otp;
  }

  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await client.rpc('fugo_get_my_otp', {
      p_order_id: orderId,
      p_customer_id: customerId,
    });

    if (!error && data) {
      const code = String(data).trim();
      if (code) {
        if (local) {
          saveLocalOrder({ ...local, otp: code, handshake_otp: code });
        }
        return code;
      }
    }
  } catch (err) {
    console.warn('fugo_get_my_otp RPC error:', err);
  }
  return null;
}

let knownOrderColumns: Set<string> | null = null;

/**
 * Detects available columns in public.orders to prevent PGRST204 errors when inserting.
 */
export async function detectOrderColumns(client: SupabaseClient): Promise<Set<string> | null> {
  if (knownOrderColumns) return knownOrderColumns;
  try {
    const { data, error } = await client.from('orders').select('*').limit(1);
    if (!error && data && data.length > 0) {
      knownOrderColumns = new Set(Object.keys(data[0]));
      return knownOrderColumns;
    }
  } catch (e) {
    console.warn('Could not inspect orders columns', e);
  }
  return null;
}

/**
 * Inserts a record into the 'orders' table.
 * Sends payment_method ("COD" or "UPI"), total_amount, delivery_fee, gst_amount.
 * Never sends payment_status, paid_at or collected_by.
 * Keeps otp in the local order so customer can view it on tracking screen.
 */
export async function placeSupabaseOrder(
  payload: SupabaseOrderPayload
): Promise<{ success: boolean; data: SupabaseOrderRecord; error?: string; cloudSynced: boolean }> {
  const client = getSupabaseClient();
  const id = payload.id || generateUuid();
  const createdAt = new Date().toISOString();
  const handshakeOtp = payload.handshake_otp || payload.otp || generateDeliveryOtp();
  const totalAmount = payload.total_amount ?? payload.price ?? 0;
  const price = payload.price ?? payload.total_amount ?? 0;
  const deliveryFee = payload.delivery_fee ?? 25;
  const gstAmount = payload.gst_amount ?? Math.round(Number(totalAmount) * 0.18);
  const paymentMethod = payload.payment_method === 'UPI' ? 'UPI' : 'COD';

  if (!FUEL_SALES_ENABLED && payload.service_type === 'FUEL') {
    const blockedRecord: SupabaseOrderRecord = {
      id,
      created_at: createdAt,
      service_type: 'FUEL',
      status: 'PENDING',
      handshake_otp: '',
      otp: '',
      payment_status: 'PENDING',
      payment_method: paymentMethod,
      customer_location: '',
      address: payload.address || '',
      total_amount: totalAmount,
      price,
      delivery_fee: deliveryFee,
      gst_amount: gstAmount,
      customer_id: payload.customer_id || '',
      customer_name: payload.customer_name || '',
      customer_phone: payload.customer_phone,
      source: 'local_storage',
      last_updated_at: createdAt,
    };
    return {
      success: false,
      data: blockedRecord,
      cloudSynced: false,
      error: 'Fuel delivery is coming soon. We are completing the licences and safety approvals needed to sell and deliver fuel.',
    };
  }

  const record: SupabaseOrderRecord = {
    id,
    created_at: createdAt,
    service_type: payload.service_type || 'REPAIR',
    status: (payload.status as any) || 'PENDING',
    handshake_otp: handshakeOtp,
    otp: handshakeOtp,
    payment_status: 'PENDING',
    payment_method: paymentMethod,
    customer_location: payload.customer_location || `${payload.delivery_lat ?? payload.lat ?? 17.4125}, ${payload.delivery_lng ?? payload.lng ?? 78.3364}`,
    address: payload.address || 'DLF Cyber City, Gachibowli, Hyderabad',
    total_amount: totalAmount,
    price: price,
    delivery_fee: deliveryFee,
    gst_amount: gstAmount,
    customer_id: payload.customer_id || getCustomerIdFromPhone(payload.customer_phone),
    customer_name: payload.customer_name || 'Fugo Customer',
    customer_phone: payload.customer_phone,
    fuel_type: payload.fuel_type || 'Fuel',
    litres: payload.litres ?? 0,
    description: payload.description,
    delivery_lat: payload.delivery_lat ?? payload.lat ?? 17.4125,
    delivery_lng: payload.delivery_lng ?? payload.lng ?? 78.3364,
    source: isSupabaseConfigured() && client ? 'supabase_cloud' : 'local_storage',
    last_updated_at: createdAt,
    parent_order_id: payload.parent_order_id,
  };

  try {
    const repairService = [record.description, record.address].filter(Boolean).join(' | ') || 'Service Order';

    // Must never send payment_status, paid_at or collected_by
    const insertPayload: Record<string, any> = {
      customer_id: record.customer_id,
      customer_name: record.customer_name || 'Fugo Customer',
      customer_phone: record.customer_phone || '',
      service_type: record.service_type || 'FUEL',
      fuel_type: record.fuel_type,
      litres: Number(record.litres ?? 0),
      amount: Number(record.litres ?? 0),
      address: record.address,
      description: record.description,
      repair_service: repairService,
      lat: Number(record.delivery_lat ?? 17.4125),
      lng: Number(record.delivery_lng ?? 78.3364),
      delivery_lat: Number(record.delivery_lat ?? 17.4125),
      delivery_lng: Number(record.delivery_lng ?? 78.3364),
      status: record.status || 'PENDING',
      otp: String(handshakeOtp),
      price: Number(price),
      total_amount: Number(totalAmount),
      payment_method: paymentMethod,
      delivery_fee: Number(deliveryFee),
      gst_amount: Number(gstAmount),
    };

    if (record.id) {
      insertPayload.id = record.id;
    }

    // Ensure all payload values are valid JSON (strip undefined)
    const cleanPayload: Record<string, any> = {};
    for (const [key, value] of Object.entries(insertPayload)) {
      if (value !== undefined) {
        cleanPayload[key] = value;
      }
    }

    const targetClient = client || defaultSupabaseClient;

    // Proactively drop columns that are not in the database schema
    const detectedCols = await detectOrderColumns(targetClient);
    if (detectedCols && detectedCols.size > 0) {
      for (const key of Object.keys(cleanPayload)) {
        if (!detectedCols.has(key)) {
          delete cleanPayload[key];
        }
      }
      // If table requires valid UUID for id, strip non-UUID IDs
      if (cleanPayload.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanPayload.id)) {
        delete cleanPayload.id;
      }
    }

    let data: any = null;
    let error: any = null;

    // Retry loop handling schema cache differences (PGRST204 missing columns, 22P02 uuid format, 23502 not-null)
    let attempts = 0;
    while (attempts < 25) {
      attempts++;
      const res = await targetClient
        .from('orders')
        .insert(cleanPayload)
        .select()
        .single();
      data = res.data;
      error = res.error;

      if (!error) {
        break;
      }

      // If a column is missing in schema cache before migration is run, drop the missing column and retry
      if (error.code === 'PGRST204') {
        const match = error.message?.match(/Could not find the '([^']+)' column/);
        if (match && match[1]) {
          const missingCol = match[1];
          if (missingCol in cleanPayload) {
            delete cleanPayload[missingCol];
            if (knownOrderColumns) knownOrderColumns.delete(missingCol);
            continue;
          }
        }
      }

      // If ID format error (e.g. 22P02 invalid input syntax for type uuid when REQ-... is sent), retry with UUID
      if (error.code === '22P02' || error.message?.includes('uuid')) {
        const fallbackUuid = generateUuid();
        if (cleanPayload.id !== fallbackUuid) {
          cleanPayload.id = fallbackUuid;
          continue;
        } else {
          delete cleanPayload.id;
          continue;
        }
      }

      // If NOT NULL constraint error on legacy schema (e.g. column "otp" cannot be null)
      if (error.code === '23502') {
        const notNullMatch = error.message?.match(/null value in column "([^"]+)"/);
        if (notNullMatch && notNullMatch[1]) {
          const col = notNullMatch[1];
          if (col === 'otp') {
            cleanPayload.otp = String(handshakeOtp || '1234');
            continue;
          }
          if (['total_amount', 'price', 'litres', 'amount'].includes(col)) {
            cleanPayload[col] = 0;
            continue;
          }
        }
      }

      // If unhandled or repeat error, break loop
      break;
    }

    if (error) {
      console.error('Fetch error:', error, supabaseUrl);
      return {
        success: false,
        data: record,
        cloudSynced: false,
        error: error.message,
      };
    }

    // The server trigger moves otp to order_otps table and zeroes it in public.orders.
    // Keep the generated code in local order record so customer can view it on tracking screen.
    const cloudRecord: SupabaseOrderRecord = {
      ...record,
      id: String(data?.id || cleanPayload.id || record.id),
      created_at: data?.created_at || createdAt,
      otp: handshakeOtp,
      handshake_otp: handshakeOtp,
      payment_method: paymentMethod,
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      gst_amount: gstAmount,
      source: 'supabase_cloud',
    };

    saveLocalOrder(cloudRecord);
    companionSync.notifyOrderPlaced(cloudRecord);
    broadcastLocalOrderUpdate(cloudRecord, {
      id: `ev_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CONNECTED',
      status: cloudRecord.status,
      message: `Order ${cloudRecord.id} successfully placed in Supabase cloud`,
      raw: cloudRecord,
    });

    return {
      success: true,
      data: cloudRecord,
      cloudSynced: true,
    };
  } catch (err: any) {
    console.error('Fetch error:', err, supabaseUrl);
    return {
      success: false,
      data: record,
      cloudSynced: false,
      error: err?.message || 'Network exception connecting to Supabase',
    };
  }
}

/**
 * Fetch orders from Supabase table: strictly filtered by the current customer_id's orders
 */
export async function fetchAllOrders(customerId?: string): Promise<{ orders: SupabaseOrderRecord[]; isCloud: boolean }> {
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      let query = client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (!error && data) {
        const formatted: SupabaseOrderRecord[] = data.map((item: any) => {
          const localMatch = getLocalOrderById(String(item.id || item.order_id));
          return {
            id: String(item.id || item.order_id),
            created_at: item.created_at || new Date().toISOString(),
            service_type: item.service_type || 'FUEL',
            job_kind: item.job_kind,
            customer_id: item.customer_id,
            customer_name: item.customer_name,
            customer_phone: item.customer_phone,
            fuel_type: item.fuel_type || 'Fuel',
            litres: Number(item.litres ?? item.amount ?? 0),
            description: item.description || item.repair_service,
            delivery_lat: Number(item.delivery_lat || item.lat || 17.4125),
            delivery_lng: Number(item.delivery_lng || item.lng || 78.3364),
            customer_location: item.customer_location || `${item.delivery_lat || 17.4125}, ${item.delivery_lng || 78.3364}`,
            address: item.address || item.delivery_address || item.repair_service || 'Hyderabad',
            total_amount: Number(item.total_amount || item.price || item.amount || 0),
            price: Number(item.price || item.total_amount || 0),
            delivery_fee: Number(item.delivery_fee || 25),
            gst_amount: Number(item.gst_amount || 0),
            payment_method: item.payment_method || 'COD',
            payment_status: item.payment_status || 'PENDING',
            driver_lat: item.driver_lat !== null && item.driver_lat !== undefined ? Number(item.driver_lat) : undefined,
            driver_lng: item.driver_lng !== null && item.driver_lng !== undefined ? Number(item.driver_lng) : undefined,
            driver_speed_kmh: item.driver_speed_kmh !== null && item.driver_speed_kmh !== undefined ? Number(item.driver_speed_kmh) : undefined,
            driver_name: item.driver_name,
            driver_phone: item.driver_phone,
            driver_vehicle: item.driver_vehicle,
            eta_minutes: item.eta_minutes,
            status: item.status || 'PENDING',
            handshake_otp: localMatch?.otp || item.otp || item.handshake_otp || '',
            otp: localMatch?.otp || item.otp || '',
            source: 'supabase_cloud',
            last_updated_at: item.last_updated_at || item.created_at,
            parent_order_id: item.parent_order_id,
          };
        });
        return { orders: formatted, isCloud: true };
      }
    } catch (e) {
      console.warn('Failed to fetch from remote Supabase', e);
    }
  }

  const local = getLocalOrders();
  const filtered = customerId ? local.filter(o => o.customer_id === customerId) : local;
  return { orders: filtered, isCloud: false };
}

/**
 * Cancel an order: Customer app is only allowed to cancel a PENDING order.
 * Writing any other status or updating driver details is strictly forbidden.
 */
export async function cancelPendingOrder(orderId: string): Promise<boolean> {
  const client = getSupabaseClient();
  let success = false;
  if (client && isSupabaseConfigured()) {
    try {
      const { error } = await client
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', orderId)
        .in('status', ['PENDING', 'pending']);
      if (!error) success = true;
    } catch (e) {
      console.warn('Supabase cancelPendingOrder error', e);
    }
  }

  // Update local copy
  const orders = getLocalOrders();
  const updated = orders.map(o => {
    if (o.id === orderId && (o.status === 'PENDING' || o.status === 'pending')) {
      return { ...o, status: 'CANCELLED' as any, last_updated_at: new Date().toISOString() };
    }
    return o;
  });
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
  return success;
}

/**
 * Update order status wrapper:
 * This app must NEVER write status (cancelling a PENDING order is the ONLY allowed status write).
 */
export async function updateOrderStatus(orderId: string, newStatus: string) {
  if (newStatus !== 'CANCELLED') {
    console.warn(`[Supabase] Customer app blocked from writing status '${newStatus}'. Driver app owns status transitions.`);
    return;
  }
  await cancelPendingOrder(orderId);
}

/**
 * Customer app MUST NEVER write driver coordinates to Supabase!
 * The driver companion app writes driver_lat, driver_lng, and driver_speed_kmh.
 */
export async function updateDriverLocation(
  _orderId: string, 
  _lat: number, 
  _lng: number, 
  _speedKmh: number = 40
) {
  console.warn('[Supabase] Customer app blocked from updating driver location. Driver app writes coordinates.');
}

/**
 * Realtime Order Tracking Subscriber
 * Uses supabase.channel('order-tracking') filtered by id = current_order_id.
 * NO automatic timers, NO automatic status transitions.
 */
export function subscribeToOrderStream(
  orderId: string,
  onData: OrderStreamCallback
): () => void {
  let isSubscribed = true;

  // 1. Initial snapshot emit from local database
  const initialOrder = getLocalOrderById(orderId);
  if (initialOrder) {
    onData(initialOrder, {
      id: `ev_init_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CONNECTED',
      status: initialOrder.status,
      driver_lat: initialOrder.driver_lat,
      driver_lng: initialOrder.driver_lng,
      message: `Connected to realtime order-tracking for ${orderId}`,
      raw: initialOrder,
    });
  }

  // 2. Local window event listener (cross-component sync)
  const handleLocalEvent = (e: Event) => {
    if (!isSubscribed) return;
    const custom = e as CustomEvent<{ order: SupabaseOrderRecord; event?: StreamEventLog }>;
    if (custom.detail?.order?.id === orderId) {
      onData(custom.detail.order, custom.detail.event);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_STREAM_UPDATE, handleLocalEvent);
  }

  // 3. Companion App live sync listener
  const unsubscribeCompanion = companionSync.subscribe((msg) => {
    if (!isSubscribed) return;
    if (msg.orderId === orderId || msg.order?.id === orderId) {
      const existing = getLocalOrderById(orderId);
      if (existing) {
        const updated: SupabaseOrderRecord = {
          ...existing,
          ...(msg.status ? { status: msg.status as any } : {}),
          ...(msg.driver_lat !== undefined ? { driver_lat: msg.driver_lat } : {}),
          ...(msg.driver_lng !== undefined ? { driver_lng: msg.driver_lng } : {}),
          ...(msg.speed_kmh !== undefined ? { driver_speed_kmh: msg.speed_kmh } : {}),
          last_updated_at: new Date().toISOString(),
        };
        saveLocalOrder(updated);
        onData(updated, {
          id: `ev_comp_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'STATUS_CHANGE',
          status: updated.status,
          driver_lat: updated.driver_lat,
          driver_lng: updated.driver_lng,
          speed_kmh: updated.driver_speed_kmh,
          message: msg.message || `Companion App updated status: ${updated.status}`,
          raw: msg,
        });
      }
    }
  });

  // 4. Supabase Cloud Realtime Channel: supabase.channel('order-tracking')
  const client = getSupabaseClient();
  let channel: any = null;
  if (client) {
    try {
      channel = client
        .channel('order-tracking')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`,
          },
          (payload: any) => {
            if (!isSubscribed) return;
            const updated = payload.new as SupabaseOrderRecord;
            if (updated) {
              saveLocalOrder(updated);
              onData(updated, {
                id: `ev_cloud_${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'STATUS_CHANGE',
                status: updated.status,
                driver_lat: updated.driver_lat,
                driver_lng: updated.driver_lng,
                speed_kmh: updated.driver_speed_kmh,
                message: `Supabase channel('order-tracking'): status is ${updated.status}`,
                raw: payload,
              });
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel order-tracking error:', e);
    }
  }

  // Cleanup: purely unbinds listeners, NO fake timer loops
  return () => {
    isSubscribed = false;
    unsubscribeCompanion();
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_STREAM_UPDATE, handleLocalEvent);
    }
    if (channel && client) {
      client.removeChannel(channel);
    }
  };
}
