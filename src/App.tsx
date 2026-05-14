/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen, Product, Order } from './types';
import Login from './components/Screens/Login';
import Home from './components/Screens/Home';
import FuelBooking from './components/Screens/FuelBooking';
import Store from './components/Screens/Store';
import Checkout from './components/Screens/Checkout';
import Tracking from './components/Screens/Tracking';

// Sample data for initial population
const FUEL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Premium Petrol', price: 105, unit: 'L', description: '95 Octane high-performance fuel', image: 'https://picsum.photos/seed/petrol/400/300', category: 'fuel' },
  { id: 'd1', name: 'Clean Diesel', price: 92, unit: 'L', description: 'Ultra-low sulfur refined diesel', image: 'https://picsum.photos/seed/diesel/400/300', category: 'fuel' },
];

const PARTS: Product[] = [
  { id: 'oil-filter', name: 'Oil Filter', price: 450, unit: 'qty', description: 'Generic high-quality oil filter', image: 'https://picsum.photos/seed/filter/400/300', category: 'parts' },
  { id: 'battery', name: '75Ah Battery', price: 4500, unit: 'qty', description: 'Maintenance-free car battery', image: 'https://picsum.photos/seed/battery/400/300', category: 'parts' },
  { id: 'bulb', name: 'H7 Headlight Bulb', price: 250, unit: 'qty', description: 'Halogen headlight replacement', image: 'https://picsum.photos/seed/bulb/400/300', category: 'parts' },
];

const SERVICES: Product[] = [
  { id: 'jumpstart', name: 'Battery Jumpstart', price: 300, unit: 'service', description: 'On-site battery jumpstart service', image: 'https://picsum.photos/seed/jump/400/300', category: 'service' },
  { id: 'puncture', name: 'Tire Puncture Fix', price: 150, unit: 'service', description: 'Quick repair for punctured tires', image: 'https://picsum.photos/seed/tire/400/300', category: 'service' },
  { id: 'wash', name: 'Express Waterless Wash', price: 500, unit: 'service', description: 'Eco-friendly waterless cleaning', image: 'https://picsum.photos/seed/wash/400/300', category: 'service' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<{ phone: string } | null>(null);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

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

  const placeOrder = (address: string) => {
    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: [...cart],
      status: 'processing',
      total,
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
        return <Home onNavigate={setCurrentScreen} userPhone={user?.phone || ''} />;
      case 'fuel':
        return <FuelBooking products={FUEL_PRODUCTS} onBack={() => setCurrentScreen('home')} onAddToCart={addToCart} onGoToCheckout={() => setCurrentScreen('checkout')} />;
      case 'parts':
        return <Store title="Vehicle Parts" products={PARTS} onBack={() => setCurrentScreen('home')} onAddToCart={addToCart} onGoToCheckout={() => setCurrentScreen('checkout')} />;
      case 'services':
        return <Store title="Emergency Services" products={SERVICES} onBack={() => setCurrentScreen('home')} onAddToCart={addToCart} onGoToCheckout={() => setCurrentScreen('checkout')} />;
      case 'checkout':
        return <Checkout cart={cart} onBack={() => setCurrentScreen('home')} onPlaceOrder={placeOrder} />;
      case 'tracking':
        return <Tracking order={activeOrder} onBack={() => setCurrentScreen('home')} />;
      default:
        return <Home onNavigate={setCurrentScreen} userPhone={user?.phone || ''} />;
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
