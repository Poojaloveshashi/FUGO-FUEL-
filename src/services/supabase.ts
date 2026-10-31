import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseOrderPayload, SupabaseOrderRecord, OrderStreamCallback, StreamEventLog } from '../types';
import { 
  supabase as defaultSupabaseClient, 
  SUPABASE_URL, 
  SUPABASE_ANON_KEY, 
  normalizeSupabaseUrl, 
  getEffectiveSupabaseConfig 
} from '../supabase';

export { SUPABASE_URL, SUPABASE_ANON_KEY, normalizeSupabaseUrl };

const STORAGE_KEY_ORDERS = 'fugo_supabase_orders';
const STORAGE_KEY_CONFIG = 'fugo_supabase_config';
const EVENT_STREAM_UPDATE = 'fugo:supabase-order-stream';

export function getStoredSupabaseConfig() {
  const effective = getEffectiveSupabaseConfig();
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        url: normalizeSupabaseUrl(parsed.url || effective.url),
        key: parsed.key || effective.key,
      };
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
  const normalized = normalizeSupabaseUrl(url.trim());
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url: normalized, key: key.trim() }));
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const config = getStoredSupabaseConfig();
  if (clientInstance) {
    return clientInstance;
  }
  try {
    clientInstance = createClient(config.url, config.key);
    return clientInstance;
  } catch (e) {
    console.warn('Failed to create customized Supabase client, using default:', e);
    return defaultSupabaseClient;
  }
}

export function resetSupabaseClient() {
  clientInstance = null;
}

/**
 * Generate a 4-digit delivery security OTP (e.g., '4821')
 */
export function generateDeliveryOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Order Fuel helper: Inserts an order with status 'PENDING' and 4-digit OTP
 */
export async function orderFuel({
  fuelType = 'Diesel (BS-VI)',
  litres = 20,
  customerId = 'cust_123',
  deliveryLat = 17.4125,
  deliveryLng = 78.3364,
}: {
  fuelType?: string;
  litres?: number;
  customerId?: string;
  deliveryLat?: number;
  deliveryLng?: number;
}) {
  const otp = generateDeliveryOtp();
  return placeSupabaseOrder({
    customer_id: customerId,
    fuel_type: fuelType,
    litres: litres,
    delivery_lat: deliveryLat,
    delivery_lng: deliveryLng,
    status: 'PENDING',
    otp: otp,
  });
}

/**
 * Request SOS helper: Inserts an emergency breakdown/fuel order with status 'PENDING' and 4-digit OTP
 */
export async function requestSOS({
  sosType = 'Emergency SOS Breakdown',
  customerId = 'cust_sos_emergency',
  deliveryLat = 17.4125,
  deliveryLng = 78.3364,
  litres = 10,
}: {
  sosType?: string;
  customerId?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  litres?: number;
}) {
  const otp = generateDeliveryOtp();
  return placeSupabaseOrder({
    customer_id: customerId,
    fuel_type: sosType,
    litres: litres,
    delivery_lat: deliveryLat,
    delivery_lng: deliveryLng,
    status: 'PENDING',
    otp: otp,
  });
}

/**
 * Get all stored orders from local storage or cloud
 */
export function getLocalOrders(): SupabaseOrderRecord[] {
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
  const defaultSample: SupabaseOrderRecord = {
    id: 'ord_fugo_live1',
    created_at: new Date().toISOString(),
    customer_id: 'cust_123',
    fuel_type: 'Clean Diesel (BS-VI)',
    litres: 50,
    delivery_lat: 17.4125,
    delivery_lng: 78.3364,
    driver_lat: 17.4290,
    driver_lng: 78.3506,
    driver_speed_kmh: 42,
    status: 'DISPATCHED',
    otp: '4821',
    source: 'supabase_cloud',
    last_updated_at: new Date().toISOString(),
  };
  return [defaultSample];
}

export function getLocalOrderById(orderId: string): SupabaseOrderRecord | null {
  const orders = getLocalOrders();
  return orders.find(o => o.id === orderId) || null;
}

function saveLocalOrder(record: SupabaseOrderRecord) {
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

/**
 * Place Order to Supabase `orders` table matching:
 * await Supabase.instance.client.from('orders').insert({
 *   'customer_id': 'cust_123',
 *   'fuel_type': 'Diesel',
 *   'litres': 100,
 *   'delivery_lat': 17.4125,
 *   'delivery_lng': 78.3364,
 *   'status': 'PENDING',
 *   'otp': '4821',
 * });
 */
export async function placeSupabaseOrder(
  payload: SupabaseOrderPayload
): Promise<{ success: boolean; data: SupabaseOrderRecord; error?: string; cloudSynced: boolean }> {
  const client = getSupabaseClient();
  const id = `ord_${Math.random().toString(36).substring(2, 9)}`;
  const createdAt = new Date().toISOString();

  // Initial driver origin: offset slightly from delivery destination (~2.2 km away)
  const initialDriverLat = payload.driver_lat ?? (payload.delivery_lat + 0.0165);
  const initialDriverLng = payload.driver_lng ?? (payload.delivery_lng + 0.0142);

  const record: SupabaseOrderRecord = {
    id,
    created_at: createdAt,
    customer_id: payload.customer_id,
    fuel_type: payload.fuel_type,
    litres: payload.litres,
    delivery_lat: payload.delivery_lat,
    delivery_lng: payload.delivery_lng,
    driver_lat: initialDriverLat,
    driver_lng: initialDriverLng,
    driver_speed_kmh: payload.driver_speed_kmh ?? 38,
    status: payload.status,
    otp: payload.otp,
    source: client ? 'supabase_cloud' : 'local_storage',
    last_updated_at: createdAt,
  };

  // Always save locally for instant offline tracking and fast UI updates
  saveLocalOrder(record);
  broadcastLocalOrderUpdate(record, {
    id: `ev_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    type: 'CONNECTED',
    status: record.status,
    driver_lat: record.driver_lat,
    driver_lng: record.driver_lng,
    speed_kmh: record.driver_speed_kmh,
    message: `Order ${record.id} placed: ${record.fuel_type} ${record.litres}L`,
    raw: record,
  });

  if (!client) {
    console.info('Supabase client not configured with URL/Key; order saved to local storage.', record);
    return {
      success: true,
      data: record,
      cloudSynced: false,
      error: 'Supabase URL/Key not configured. Saved to local database.',
    };
  }

  try {
    // Exact schema specified by user with driver coordinates
    const insertPayload: Record<string, any> = {
      customer_id: payload.customer_id,
      fuel_type: payload.fuel_type,
      litres: payload.litres,
      delivery_lat: payload.delivery_lat,
      delivery_lng: payload.delivery_lng,
      status: payload.status,
      otp: payload.otp,
    };
    if (record.driver_lat !== undefined) insertPayload.driver_lat = record.driver_lat;
    if (record.driver_lng !== undefined) insertPayload.driver_lng = record.driver_lng;
    if (record.driver_speed_kmh !== undefined) insertPayload.driver_speed_kmh = record.driver_speed_kmh;

    const { data, error } = await client
      .from('orders')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.warn('Supabase remote insert warning:', error.message);
      return {
        success: true,
        data: record,
        cloudSynced: false,
        error: error.message,
      };
    }

    const cloudRecord: SupabaseOrderRecord = {
      id: data?.id ? String(data.id) : record.id,
      created_at: data?.created_at || createdAt,
      customer_id: data?.customer_id || payload.customer_id,
      fuel_type: data?.fuel_type || payload.fuel_type,
      litres: data?.litres ?? payload.litres,
      delivery_lat: data?.delivery_lat ?? payload.delivery_lat,
      delivery_lng: data?.delivery_lng ?? payload.delivery_lng,
      driver_lat: data?.driver_lat ?? record.driver_lat,
      driver_lng: data?.driver_lng ?? record.driver_lng,
      driver_speed_kmh: data?.driver_speed_kmh ?? record.driver_speed_kmh,
      status: data?.status || payload.status,
      otp: data?.otp || payload.otp,
      source: 'supabase_cloud',
      last_updated_at: data?.last_updated_at || createdAt,
    };

    saveLocalOrder(cloudRecord);
    broadcastLocalOrderUpdate(cloudRecord);
    return {
      success: true,
      data: cloudRecord,
      cloudSynced: true,
    };
  } catch (err: any) {
    console.warn('Supabase network error during placeOrder:', err);
    return {
      success: true,
      data: record,
      cloudSynced: false,
      error: err?.message || 'Network exception connecting to Supabase',
    };
  }
}

/**
 * Fetch orders from Supabase table or local database
 */
export async function fetchAllOrders(): Promise<{ orders: SupabaseOrderRecord[]; isCloud: boolean }> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        const formatted: SupabaseOrderRecord[] = data.map((item: any) => ({
          id: String(item.id || item.order_id || Math.random().toString(36).substring(2, 8)),
          created_at: item.created_at || new Date().toISOString(),
          customer_id: item.customer_id || 'cust_123',
          fuel_type: item.fuel_type || 'Diesel',
          litres: Number(item.litres || 100),
          delivery_lat: Number(item.delivery_lat || 17.4125),
          delivery_lng: Number(item.delivery_lng || 78.3364),
          driver_lat: item.driver_lat !== undefined ? Number(item.driver_lat) : 17.4290,
          driver_lng: item.driver_lng !== undefined ? Number(item.driver_lng) : 78.3506,
          driver_speed_kmh: item.driver_speed_kmh !== undefined ? Number(item.driver_speed_kmh) : 38,
          status: item.status || 'PENDING',
          otp: item.otp || '4821',
          source: 'supabase_cloud',
          last_updated_at: item.last_updated_at || item.created_at,
        }));
        return { orders: formatted, isCloud: true };
      }
    } catch (e) {
      console.warn('Failed to fetch from remote Supabase', e);
    }
  }

  return { orders: getLocalOrders(), isCloud: false };
}

/**
 * Update order status (PENDING -> DISPATCHED -> DELIVERED)
 */
export async function updateOrderStatus(orderId: string, newStatus: 'PENDING' | 'DISPATCHED' | 'DELIVERED') {
  let updatedRecord: SupabaseOrderRecord | null = null;
  try {
    const orders = getLocalOrders();
    const updated = orders.map(o => {
      if (o.id === orderId) {
        updatedRecord = { ...o, status: newStatus, last_updated_at: new Date().toISOString() };
        return updatedRecord;
      }
      return o;
    });
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local update failed', e);
  }

  if (updatedRecord) {
    broadcastLocalOrderUpdate(updatedRecord, {
      id: `ev_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'STATUS_CHANGE',
      status: newStatus,
      driver_lat: updatedRecord.driver_lat,
      driver_lng: updatedRecord.driver_lng,
      message: `Order ${orderId} status changed to ${newStatus}`,
      raw: updatedRecord,
    });
  }

  // Update cloud if available
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('orders').update({ 
        status: newStatus,
        last_updated_at: new Date().toISOString()
      }).eq('id', orderId);
    } catch (e) {
      console.warn('Cloud status update failed', e);
    }
  }
}

/**
 * Update driver location (driver_lat, driver_lng, driver_speed_kmh)
 */
export async function updateDriverLocation(
  orderId: string, 
  lat: number, 
  lng: number, 
  speedKmh: number = 40
) {
  let updatedRecord: SupabaseOrderRecord | null = null;
  try {
    const orders = getLocalOrders();
    const updated = orders.map(o => {
      if (o.id === orderId) {
        updatedRecord = {
          ...o,
          driver_lat: Number(lat.toFixed(6)),
          driver_lng: Number(lng.toFixed(6)),
          driver_speed_kmh: Math.round(speedKmh),
          last_updated_at: new Date().toISOString(),
        };
        return updatedRecord;
      }
      return o;
    });
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local driver update failed', e);
  }

  if (updatedRecord) {
    broadcastLocalOrderUpdate(updatedRecord, {
      id: `ev_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'LOCATION_UPDATE',
      driver_lat: lat,
      driver_lng: lng,
      speed_kmh: speedKmh,
      status: updatedRecord.status,
      message: `Driver Location: ${lat.toFixed(4)}, ${lng.toFixed(4)} (${Math.round(speedKmh)} km/h)`,
      raw: updatedRecord,
    });
  }

  // Update cloud if available
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('orders').update({
        driver_lat: Number(lat.toFixed(6)),
        driver_lng: Number(lng.toFixed(6)),
        driver_speed_kmh: Math.round(speedKmh),
        last_updated_at: new Date().toISOString(),
      }).eq('id', orderId);
    } catch (e) {
      // Ignore schema column misses in external client
    }
  }
}

/**
 * Realtime Order & Driver Location Streaming
 * Matches user's Flutter / Dart pattern:
 * 
 * Supabase.instance.client
 *     .from('orders')
 *     .stream(primaryKey: ['id'])
 *     .eq('id', activeOrderId)
 *     .listen((List<Map<String, dynamic>> data) {
 *       if (data.isNotEmpty) {
 *         final order = data.first;
 *         print('Current Status: ${order['status']}');
 *         print('Driver Location: ${order['driver_lat']}, ${order['driver_lng']}');
 *       }
 *     });
 */
export function subscribeToOrderStream(
  orderId: string,
  onData: OrderStreamCallback,
  options?: {
    simulateProgress?: boolean;
    speedMultiplier?: number;
  }
): () => void {
  let isSubscribed = true;
  const speed = options?.speedMultiplier || 1;
  const simulate = options?.simulateProgress !== false;

  // 1. Initial snapshot emit
  const initialOrder = getLocalOrderById(orderId);
  if (initialOrder) {
    console.log('[Supabase Stream Initial] Current Status:', initialOrder.status);
    console.log('[Supabase Stream Initial] Driver Location:', initialOrder.driver_lat, initialOrder.driver_lng);
    onData(initialOrder, {
      id: `ev_init_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'CONNECTED',
      status: initialOrder.status,
      driver_lat: initialOrder.driver_lat,
      driver_lng: initialOrder.driver_lng,
      speed_kmh: initialOrder.driver_speed_kmh,
      message: `Stream active for order ${orderId}`,
      raw: initialOrder,
    });
  }

  // 2. Listen to in-memory / local window broadcast updates
  const handleLocalEvent = (e: Event) => {
    if (!isSubscribed) return;
    const custom = e as CustomEvent<{ order: SupabaseOrderRecord; event?: StreamEventLog }>;
    if (custom.detail?.order?.id === orderId) {
      const order = custom.detail.order;
      console.log(`[Supabase Stream] Current Status: ${order.status}`);
      console.log(`[Supabase Stream] Driver Location: ${order.driver_lat}, ${order.driver_lng}`);
      onData(order, custom.detail.event);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener(EVENT_STREAM_UPDATE, handleLocalEvent);
  }

  // 3. Supabase Cloud Realtime Channel (if client is configured)
  const client = getSupabaseClient();
  let channel: any = null;
  if (client) {
    try {
      channel = client
        .channel(`order-stream-${orderId}`)
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
              console.log(`[Supabase Cloud Stream] Current Status: ${updated.status}`);
              console.log(`[Supabase Cloud Stream] Driver Location: ${updated.driver_lat}, ${updated.driver_lng}`);
              saveLocalOrder(updated);
              onData(updated, {
                id: `ev_cloud_${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                type: 'SYNC',
                status: updated.status,
                driver_lat: updated.driver_lat,
                driver_lng: updated.driver_lng,
                speed_kmh: updated.driver_speed_kmh,
                message: `Cloud Postgres push: ${updated.status}`,
                raw: payload,
              });
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel subscription error:', e);
    }
  }

  // 4. GPS Route Interpolation Simulator (advances driver marker realistically toward destination)
  let simTimer: NodeJS.Timeout | null = null;
  if (simulate) {
    let step = 0;
    const totalSteps = 24;

    simTimer = setInterval(() => {
      if (!isSubscribed) return;
      const current = getLocalOrderById(orderId);
      if (!current || current.status === 'DELIVERED') {
        return;
      }

      // If pending, change to dispatched after step 2
      if (current.status === 'PENDING' && step >= 2) {
        updateOrderStatus(orderId, 'DISPATCHED');
        return;
      }

      if (current.status === 'DISPATCHED') {
        step++;
        const targetLat = current.delivery_lat || 17.4125;
        const targetLng = current.delivery_lng || 78.3364;
        const startLat = targetLat + 0.0165;
        const startLng = targetLng + 0.0142;

        const fraction = Math.min(step / totalSteps, 1);
        // Add subtle road curvature
        const curveLat = Math.sin(fraction * Math.PI) * 0.0025;
        const curveLng = Math.cos(fraction * Math.PI) * 0.0018;

        const nextLat = startLat + (targetLat - startLat) * fraction + curveLat;
        const nextLng = startLng + (targetLng - startLng) * fraction + curveLng;
        const speedKmh = fraction >= 0.95 ? 12 : Math.round(35 + Math.sin(step) * 10);

        updateDriverLocation(orderId, nextLat, nextLng, speedKmh);

        if (fraction >= 1) {
          updateOrderStatus(orderId, 'DELIVERED');
        }
      }
    }, Math.max(1000, 2400 / speed));
  }

  // Return unsubscribe cleanup function
  return () => {
    isSubscribed = false;
    if (simTimer) clearInterval(simTimer);
    if (typeof window !== 'undefined') {
      window.removeEventListener(EVENT_STREAM_UPDATE, handleLocalEvent);
    }
    if (channel && client) {
      client.removeChannel(channel);
    }
  };
}
