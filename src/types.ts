export interface UserLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
}

export type Screen = 'login' | 'home' | 'fuel' | 'parts' | 'services' | 'checkout' | 'tracking' | 'settings' | 'notifications' | 'orders' | 'addresses' | 'profile' | 'language' | 'darkMode' | 'payments' | 'fuelPrices' | 'analytics' | 'appointment' | 'appointment_tracking' | 'supabase_orders' | 'central_system';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  exchangeDiscount?: number;
  unit: string;
  image: string;
  description: string;
  category: 'fuel' | 'parts' | 'service';
  vehicleType?: string;
  vehicleCategory?: 'Cars (4-Wheelers)' | 'Bikes (2-Wheelers)' | 'Commercial/Cargo' | 'Electric Vehicles' | string;
  subsystem?: string;
  replacementType?: 'Fast-Moving' | 'Critical';
  stockQty?: number;
  warranty?: string;
}

export interface SupabaseOrderPayload {
  customer_id: string;
  fuel_type: string;
  litres: number;
  delivery_lat: number;
  delivery_lng: number;
  driver_lat?: number;
  driver_lng?: number;
  driver_speed_kmh?: number;
  status: 'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  otp: string;
  last_updated_at?: string;
}

export interface SupabaseOrderRecord extends SupabaseOrderPayload {
  id: string;
  created_at: string;
  source?: 'supabase_cloud' | 'local_storage';
}

export interface StreamEventLog {
  id: string;
  timestamp: string;
  type: 'STATUS_CHANGE' | 'LOCATION_UPDATE' | 'CONNECTED' | 'SYNC';
  status?: string;
  driver_lat?: number;
  driver_lng?: number;
  speed_kmh?: number;
  message: string;
  raw?: any;
}

export type OrderStreamCallback = (data: SupabaseOrderRecord, event?: StreamEventLog) => void;

export type PaymentMethodCategory = 
  | 'upi' 
  | 'card' 
  | 'netbanking' 
  | 'wallet' 
  | 'fleet_card' 
  | 'pay_later' 
  | 'pod';

export interface PaymentTransactionInfo {
  method: PaymentMethodCategory;
  methodTitle: string;
  transactionId: string;
  rrn: string; // Retrieval Reference Number (Bank RRN)
  authCode: string;
  paidAt: string;
  status: 'PAID' | 'PENDING_ON_DELIVERY';
  amount: number;
  subtotal: number;
  deliveryFee: number;
  gstAmount: number;
  invoiceNumber: string;
  // Option-specific metadata
  cardLast4?: string;
  cardBrand?: string;
  upiVpa?: string;
  upiApp?: string;
  bankName?: string;
  walletName?: string;
  fleetProvider?: string;
  fleetCardNumber?: string;
  fleetVehicleReg?: string;
  fleetOdometer?: string;
  payLaterProvider?: string;
  podType?: 'cash' | 'card_pos' | 'qr_pos';
  changeRequiredFor?: number;
}

export interface Order {
  id: string;
  items: { product: Product; quantity: number }[];
  status: 'processing' | 'dispatched' | 'nearby' | 'delivered';
  total: number;
  deliveryFee: number;
  distance: number;
  deliveryAddress: string;
  estimatedTime: number; // in minutes
  createdAt: number;
  // Supabase specific fields
  customer_id: string;
  fuel_type: string;
  litres: number;
  delivery_lat: number;
  delivery_lng: number;
  driver_lat?: number;
  driver_lng?: number;
  driver_speed_kmh?: number;
  otp: string;
  supabase_status: 'PENDING' | 'DISPATCHED' | 'DELIVERED';
  synced_to_supabase: boolean;
  last_updated_at?: string;
  payment?: PaymentTransactionInfo;
}

export interface CompanionSyncEvent {
  sourceAppId: string;
  targetAppId: string;
  type: 'ORDER_PLACED' | 'ORDER_ACCEPTED' | 'LOCATION_UPDATE' | 'STATUS_CHANGE' | 'OTP_VERIFIED' | 'PING' | 'PONG';
  orderId?: string;
  data?: any;
  timestamp: number;
}



