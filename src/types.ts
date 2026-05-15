export interface UserLocation {
  id: string;
  name: string;
  address: string;
  city: string;
}

export type Screen = 'login' | 'home' | 'fuel' | 'parts' | 'services' | 'checkout' | 'tracking' | 'settings' | 'notifications';

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  category: 'fuel' | 'parts' | 'service';
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
}
