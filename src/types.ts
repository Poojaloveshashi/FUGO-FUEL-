export interface UserLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  houseNumber?: string;
  landmark?: string;
  tag?: 'Home' | 'Work' | 'Other';
  isLiveLocation?: boolean;
}

export type Screen = 'login' | 'home' | 'fuel' | 'parts' | 'services' | 'checkout' | 'tracking' | 'settings' | 'notifications' | 'orders' | 'addresses' | 'profile' | 'language' | 'darkMode' | 'payments' | 'fuelPrices' | 'analytics' | 'appointment' | 'appointment_tracking';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  mrp?: number;
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

export type ServiceType = 'FUEL' | 'PARTS' | 'REPAIR' | 'SERVICE' | 'MAINTENANCE';

export interface SupabaseOrderPayload {
  id?: string;
  service_type: ServiceType | string;
  status: 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'pending' | 'completed' | string;
  handshake_otp?: string;
  otp?: string;
  payment_status?: 'PAID' | 'UNPAID' | string;
  customer_location?: string;
  address?: string;
  total_amount?: number;
  price?: number;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  fuel_type?: string;
  litres?: number;
  description?: string;
  repair_service?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  lat?: number;
  lng?: number;
  driver_lat?: number;
  driver_lng?: number;
  driver_speed_kmh?: number;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_vehicle?: string;
  vehicle_name?: string;
  vehicle_plate?: string;
  eta_minutes?: number;
  last_updated_at?: string;
  parent_order_id?: string;
  payment_method?: 'COD' | 'UPI' | string;
  delivery_fee?: number;
  gst_amount?: number;
  job_kind?: 'VEHICLE_PICKUP' | 'VEHICLE_RETURN' | string;
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
  | 'cod'
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
  rrn?: string; // Optional (fake codes removed)
  authCode?: string; // Optional (fake codes removed)
  paidAt: string;
  status: 'PAID' | 'PENDING_ON_DELIVERY' | 'PAY_ON_DELIVERY';
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
  service_type: ServiceType | string;
  items: { product: Product; quantity: number }[];
  status: 'pending' | 'processing' | 'dispatched' | 'in_transit' | 'nearby' | 'delivered' | 'completed' | string;
  total: number;
  total_amount: number;
  price?: number;
  deliveryFee: number;
  distance: number;
  deliveryAddress: string;
  address?: string;
  customer_location?: string;
  estimatedTime: number; // in minutes
  createdAt: number;
  // Supabase specific fields
  customer_id: string;
  customer_phone?: string;
  description?: string;
  fuel_type: string;
  litres: number;
  delivery_lat: number;
  delivery_lng: number;
  driver_lat?: number;
  driver_lng?: number;
  driver_speed_kmh?: number;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_vehicle?: string;
  vehicle_name?: string;
  vehicle_plate?: string;
  eta_minutes?: number;
  otp: string;
  handshake_otp: string;
  payment_status: 'PAID' | 'UNPAID' | string;
  supabase_status: 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | string;
  synced_to_supabase: boolean;
  last_updated_at?: string;
  payment?: PaymentTransactionInfo;
  parent_order_id?: string;
  payment_method?: 'COD' | 'UPI' | string;
  job_kind?: 'VEHICLE_PICKUP' | 'VEHICLE_RETURN' | string;
}

export interface CompanionSyncEvent {
  sourceAppId: string;
  targetAppId: string;
  type: 'ORDER_PLACED' | 'ORDER_ACCEPTED' | 'LOCATION_UPDATE' | 'STATUS_CHANGE' | 'OTP_VERIFIED' | 'PING' | 'PONG';
  orderId?: string;
  data?: any;
  timestamp: number;
}



