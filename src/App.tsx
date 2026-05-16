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
const FUEL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Premium Petrol', price: 105, unit: 'L', description: '95 Octane high-performance fuel', image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
  { id: 'd1', name: 'Clean Diesel', price: 92, unit: 'L', description: 'Ultra-low sulfur refined diesel', image: 'https://images.unsplash.com/photo-1610492410313-094038a83a0a?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
];

const PARTS: Product[] = [
  // Car Parts
  { id: 'oil-filter', name: 'Premium Oil Filter', price: 450, unit: 'qty', description: 'Synthetic media filter for cars', image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193b?auto=format&fit=crop&q=80&w=400', category: 'parts' },
  { id: 'battery', name: 'Exide 75Ah Battery', price: 4500, unit: 'qty', description: 'Zero maintenance car battery', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400', category: 'parts' },
  { id: 'wiper', name: 'Bosch Wiper Blades', price: 850, unit: 'set', description: 'Frameless all-weather car wipers', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=400', category: 'parts' },
  { id: 'air-filter', name: 'Car Air Filter', price: 650, unit: 'qty', description: 'High-flow intake air filter', image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=400', category: 'parts' },
  
  // Bike Parts
  { id: 'chain-lube', name: 'Motul Chain Lube', price: 550, unit: '300ml', description: 'Synthetic lube for bike chains', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=400', category: 'parts' },
  { id: 'bike-pads', name: 'Ceramic Brake Pads', price: 1200, unit: 'set', description: 'High-performance bike brake pads', image: 'https://images.unsplash.com/photo-1581404917879-53e19259fddd?auto=format&fit=crop&q=80&w=400', category: 'parts' },
  { id: 'spark-plug', name: 'NGK Iridium Plug', price: 850, unit: 'qty', description: 'Iridium spark plug for motorcycles', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=400', category: 'parts' },
  
  // Essentials
  { id: 'coolant', name: 'Castrol Coolant', price: 350, unit: '1L', description: 'Anti-freeze engine coolant', image: 'https://images.unsplash.com/photo-1621905252507-b354bc2c1df5?auto=format&fit=crop&q=80&w=400', category: 'parts' },
  { id: 'brake-fluid', name: 'DOT 4 Brake Fluid', price: 280, unit: '250ml', description: 'High boiling point brake fluid', image: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=400', category: 'parts' },
];

const SERVICES: Product[] = [
  { id: 'jumpstart', name: 'Battery Jumpstart', price: 300, unit: 'service', description: 'On-site battery jumpstart service', image: 'https://images.unsplash.com/photo-1615906659123-23d3408667be?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'puncture', name: 'Tire Puncture Fix', price: 150, unit: 'service', description: 'Quick repair for punctured tires', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'wash', name: 'Express Waterless Wash', price: 500, unit: 'service', description: 'Eco-friendly waterless cleaning', image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=400', category: 'service' },
];

const HYDERABAD_LOCATIONS: UserLocation[] = [
  { id: 'h1', name: 'Banjara Hills', address: 'Road No. 1, Banjara Hills', city: 'Hyderabad' },
  { id: 'h2', name: 'Jubilee Hills', address: 'Road No. 36, Jubilee Hills', city: 'Hyderabad' },
  { id: 'h3', name: 'Gachibowli', address: 'DLF Cyber City, Gachibowli', city: 'Hyderabad' },
  { id: 'h4', name: 'Hitech City', address: 'Mindspace IT Park, Hitech City', city: 'Hyderabad' },
  { id: 'b1', name: 'MG Road', address: 'No 42, 2nd Cross, MG Road', city: 'Bangalore' },
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

  const placeOrder = (address: string, fee: number, dist: number) => {
    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) + fee;
    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: [...cart],
      status: 'processing',
      total,
      deliveryFee: fee,
      distance: dist,
      deliveryAddress: address,
      estimatedTime: 15,
      createdAt: Date.now(),
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
        return <FuelPrices onBack={() => setCurrentScreen('home')} />;
      case 'analytics':
        return <ServiceAnalytics onBack={() => setCurrentScreen('home')} />;
      case 'appointment':
        return <AppointmentBooking onBack={() => setCurrentScreen('home')} onBook={() => setCurrentScreen('appointment_tracking')} />;
      case 'appointment_tracking':
        return <RepairTracking onBack={() => setCurrentScreen('home')} />;
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
