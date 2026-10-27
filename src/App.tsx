/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Product, Order, UserLocation } from './types';
import Login from './components/Screens/Login';
import Home from './components/Screens/Home';
import FuelBooking from './components/Screens/FuelBooking';
import Store from './components/Screens/Store';
import Checkout from './components/Screens/Checkout';
import Tracking from './components/Screens/Tracking';
import Settings from './components/Screens/Settings';
import Notifications from './components/Screens/Notifications';
import OrderHistory from './components/Screens/OrderHistory';
import SavedAddresses from './components/Screens/SavedAddresses';
import PersonalInfo from './components/Screens/PersonalInfo';
import Language from './components/Screens/Language';
import DarkMode from './components/Screens/DarkMode';
import PaymentMethods from './components/Screens/PaymentMethods';
import Services from './components/Screens/Services';
import FuelPrices from './components/Screens/FuelPrices';
import ServiceAnalytics from './components/Screens/ServiceAnalytics';
import AppointmentBooking from './components/Screens/AppointmentBooking';
import RepairTracking from './components/Screens/RepairTracking';

// Sample data for initial population
import SupabaseOrders from './components/Screens/SupabaseOrders';
import { placeSupabaseOrder, generateDeliveryOtp, updateOrderStatus } from './services/supabase';

// Sample data for initial population
const FUEL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Premium Petrol (95 Octane)', price: 109.66, unit: 'L', description: '95 Octane high-performance fuel with cleaning additives', image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
  { id: 'd1', name: 'Clean Diesel (BS-VI)', price: 97.82, unit: 'L', description: 'Ultra-low sulfur refined high-speed diesel', image: 'https://images.unsplash.com/photo-1610492410313-094038a83a0a?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
  { id: 'cng1', name: 'Compressed Natural Gas (CNG)', price: 92.50, unit: 'kg', description: '200 bar compressed eco-green natural gas mobile dispatch', image: 'https://images.unsplash.com/photo-1545644161-591605335805?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
  { id: 'ev1', name: 'EV Fast Charging (Emergency Van)', price: 18.50, unit: 'kWh', description: 'Mobile DC Fast Charger 30kW CCS2 delivery to your breakdown spot', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
];

import { SPARE_PARTS_MASTER_CATALOG } from './data/sparePartsCatalog';

const PARTS: Product[] = SPARE_PARTS_MASTER_CATALOG;


const SERVICES: Product[] = [
  { id: 'jumpstart', name: 'Battery Jumpstart', price: 300, unit: 'service', description: 'On-site battery jumpstart service', image: 'https://images.unsplash.com/photo-1615906659123-23d3408667be?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'puncture', name: 'Tire Puncture Fix', price: 150, unit: 'service', description: 'Quick repair for punctured tires', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'wash', name: 'Express Waterless Wash', price: 500, unit: 'service', description: 'Eco-friendly waterless cleaning', image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=400', category: 'service' },
];

const HYDERABAD_LOCATIONS: UserLocation[] = [
  { id: 'h3', name: 'Gachibowli', address: 'DLF Cyber City, Gachibowli', city: 'Hyderabad', lat: 17.4125, lng: 78.3364 },
  { id: 'h1', name: 'Banjara Hills', address: 'Road No. 1, Banjara Hills', city: 'Hyderabad', lat: 17.4156, lng: 78.4357 },
  { id: 'h2', name: 'Jubilee Hills', address: 'Road No. 36, Jubilee Hills', city: 'Hyderabad', lat: 17.4319, lng: 78.4073 },
  { id: 'h4', name: 'Hitech City', address: 'Mindspace IT Park, Hitech City', city: 'Hyderabad', lat: 17.4435, lng: 78.3772 },
  { id: 'b1', name: 'MG Road', address: 'No 42, 2nd Cross, MG Road', city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation>(HYDERABAD_LOCATIONS[0]);

  // Authentication persistence simulation
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fugo_user');
      if (savedUser && savedUser !== 'undefined') {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.phone) {
          setUser(parsed);
          setCurrentScreen('home');
        }
      }
    } catch (e) {
      console.error('Failed to load user', e);
      localStorage.removeItem('fugo_user');
    }
  }, []);

  const handleLogin = (phone: string) => {
    const newUser = { phone };
    setUser(newUser);
    localStorage.setItem('fugo_user', JSON.stringify(newUser));
    setCurrentScreen('home');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fugo_user');
    setCurrentScreen('login');
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
  };

  const placeOrder = async (address: string, fee: number, dist: number) => {
    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) + fee;
    
    // Extract fuel parameters or defaults to match schema:
    // fuel_type: 'Diesel', litres: 100, delivery_lat: 17.4125, delivery_lng: 78.3364, status: 'PENDING', otp: '4821'
    const fuelItem = cart.find(item => item.product.category === 'fuel');
    const fuelType = fuelItem ? fuelItem.product.name : 'Diesel';
    const litres = fuelItem ? fuelItem.quantity : 100;
    const customerId = user?.phone ? `cust_${user.phone}` : 'cust_123';
    const deliveryLat = selectedLocation.lat ?? 17.4125;
    const deliveryLng = selectedLocation.lng ?? 78.3364;
    const otp = generateDeliveryOtp();

    // Call Supabase placeOrder
    const supabaseRes = await placeSupabaseOrder({
      customer_id: customerId,
      fuel_type: fuelType,
      litres: litres,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      status: 'PENDING',
      otp: otp,
    });

    const newOrder: Order = {
      id: supabaseRes.data.id || `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: [...cart],
      status: 'processing',
      total,
      deliveryFee: fee,
      distance: dist,
      deliveryAddress: address,
      estimatedTime: 15,
      createdAt: Date.now(),
      customer_id: customerId,
      fuel_type: fuelType,
      litres: litres,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      driver_lat: supabaseRes.data.driver_lat,
      driver_lng: supabaseRes.data.driver_lng,
      driver_speed_kmh: supabaseRes.data.driver_speed_kmh,
      otp: otp,
      supabase_status: 'PENDING',
      synced_to_supabase: supabaseRes.cloudSynced,
    };
    setActiveOrder(newOrder);
    setCart([]);
    setCurrentScreen('tracking');
  };


  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'home':
        return <Home onNavigate={setCurrentScreen} userPhone={user?.phone || ''} selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} locations={HYDERABAD_LOCATIONS} cartCount={cart.length} />;
      case 'fuel':
        return <FuelBooking products={FUEL_PRODUCTS} onBack={() => setCurrentScreen('home')} onAddToCart={addToCart} onGoToCheckout={() => setCurrentScreen('checkout')} location={selectedLocation} />;
      case 'parts':
        return <Store title="Vehicle Parts" products={PARTS} onBack={() => setCurrentScreen('home')} onAddToCart={addToCart} onGoToCheckout={() => setCurrentScreen('checkout')} />;
      case 'services':
        return <Services products={SERVICES} onBack={() => setCurrentScreen('home')} onAddToCart={addToCart} onGoToCheckout={() => setCurrentScreen('checkout')} onBookAppointment={() => setCurrentScreen('appointment')} />;
      case 'checkout':
        return <Checkout cart={cart} onBack={() => setCurrentScreen('home')} onPlaceOrder={placeOrder} location={selectedLocation} />;
      case 'tracking':
        return <Tracking order={activeOrder} onBack={() => setCurrentScreen('home')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentScreen('home')} userPhone={user?.phone || ''} onLogout={logout} onNavigate={setCurrentScreen} />;
      case 'notifications':
        return <Notifications onBack={() => setCurrentScreen('home')} />;
      case 'orders':
        return <OrderHistory onBack={() => setCurrentScreen('settings')} />;
      case 'addresses':
        return <SavedAddresses onBack={() => setCurrentScreen('settings')} locations={HYDERABAD_LOCATIONS} />;
      case 'profile':
        return <PersonalInfo onBack={() => setCurrentScreen('settings')} userPhone={user?.phone || ''} />;
      case 'language':
        return <Language onBack={() => setCurrentScreen('settings')} />;
      case 'darkMode':
        return <DarkMode onBack={() => setCurrentScreen('settings')} />;
      case 'payments':
        return <PaymentMethods onBack={() => setCurrentScreen('settings')} />;
      case 'fuelPrices':
        return <FuelPrices onBack={() => setCurrentScreen('home')} onNavigate={setCurrentScreen} onAddToCart={addToCart} />;
      case 'analytics':
        return <ServiceAnalytics onBack={() => setCurrentScreen('home')} onNavigate={setCurrentScreen} />;
      case 'appointment':
        return <AppointmentBooking onBack={() => setCurrentScreen('home')} onBook={() => setCurrentScreen('appointment_tracking')} />;
      case 'appointment_tracking':
        return <RepairTracking onBack={() => setCurrentScreen('home')} />;
      case 'supabase_orders':
        return (
          <SupabaseOrders 
            onBack={() => setCurrentScreen('home')} 
            onTrackOrder={(record) => {
              const convertedOrder: Order = {
                id: record.id,
                items: [
                  {
                    product: {
                      id: 'fuel_stream',
                      name: record.fuel_type,
                      price: record.fuel_type.toLowerCase().includes('petrol') ? 105 : 92,
                      unit: 'L',
                      description: `${record.litres}L of ${record.fuel_type}`,
                      image: 'https://images.unsplash.com/photo-1610492410313-094038a83a0a?auto=format&fit=crop&q=80&w=400',
                      category: 'fuel',
                    },
                    quantity: record.litres,
                  },
                ],
                status: record.status === 'DELIVERED' ? 'delivered' : record.status === 'DISPATCHED' ? 'dispatched' : 'processing',
                total: record.litres * (record.fuel_type.toLowerCase().includes('petrol') ? 105 : 92),
                deliveryFee: 49,
                distance: 2.4,
                deliveryAddress: 'DLF Cyber City, Gachibowli',
                estimatedTime: 15,
                createdAt: new Date(record.created_at).getTime(),
                customer_id: record.customer_id,
                fuel_type: record.fuel_type,
                litres: record.litres,
                delivery_lat: record.delivery_lat,
                delivery_lng: record.delivery_lng,
                driver_lat: record.driver_lat,
                driver_lng: record.driver_lng,
                driver_speed_kmh: record.driver_speed_kmh,
                otp: record.otp,
                supabase_status: record.status as any,
                synced_to_supabase: record.source === 'supabase_cloud',
              };
              setActiveOrder(convertedOrder);
              setCurrentScreen('tracking');
            }}
          />
        );
      default:
        return <Home onNavigate={setCurrentScreen} userPhone={user?.phone || ''} selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} locations={HYDERABAD_LOCATIONS} cartCount={cart.length} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
