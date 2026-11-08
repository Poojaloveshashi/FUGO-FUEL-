/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { Screen, Product, Order, UserLocation, PaymentTransactionInfo } from './types';
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

import SOSModal from './components/Screens/SOSModal';
import { placeSupabaseOrder, generateDeliveryOtp, updateOrderStatus, getCustomerIdFromPhone, supabaseUrl } from './services/supabase';

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
  { 
    id: 'h3', 
    name: 'Gachibowli Cyber Hub', 
    houseNumber: 'Plot 4, Block B',
    address: 'DLF Cyber City, Gachibowli', 
    city: 'Hyderabad', 
    lat: 17.4125, 
    lng: 78.3364,
    tag: 'Work',
    landmark: 'Opposite DLF Gate 2'
  },
  { 
    id: 'h1', 
    name: 'Banjara Hills Residence', 
    houseNumber: 'Villa 12, Park View',
    address: 'Road No. 1, Banjara Hills', 
    city: 'Hyderabad', 
    lat: 17.4156, 
    lng: 78.4357,
    tag: 'Home',
    landmark: 'Beside Taj Krishna'
  },
  { 
    id: 'h2', 
    name: 'Jubilee Hills Apt', 
    houseNumber: 'Flat 401, Sapphire Tower',
    address: 'Road No. 36, Jubilee Hills', 
    city: 'Hyderabad', 
    lat: 17.4319, 
    lng: 78.4073,
    tag: 'Home',
    landmark: 'Near Peddamma Temple Metro'
  },
  { 
    id: 'h4', 
    name: 'Mindspace IT Park', 
    houseNumber: 'Building No 12, 5th Floor',
    address: 'Mindspace IT Park, Hitech City', 
    city: 'Hyderabad', 
    lat: 17.4435, 
    lng: 78.3772,
    tag: 'Work',
    landmark: 'Behind Inorbit Mall'
  },
  { 
    id: 'b1', 
    name: 'MG Road Office', 
    houseNumber: 'No 42, 2nd Cross',
    address: 'MG Road', 
    city: 'Bangalore', 
    lat: 12.9716, 
    lng: 77.5946,
    tag: 'Work',
    landmark: 'Opposite Metro Pillar 128'
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [user, setUser] = useState<{ phone: string } | null>(() => {
    try {
      const savedUser = localStorage.getItem('fugo_user');
      if (savedUser && savedUser !== 'undefined') {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.phone) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse user', e);
    }
    return null;
  });
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [locationsList, setLocationsList] = useState<UserLocation[]>(() => {
    try {
      const stored = localStorage.getItem('fugo_user_locations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved locations', e);
    }
    return HYDERABAD_LOCATIONS;
  });
  const [selectedLocation, setSelectedLocation] = useState<UserLocation>(() => {
    try {
      const stored = localStorage.getItem('fugo_selected_location');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse selected location', e);
    }
    return HYDERABAD_LOCATIONS[0];
  });
  const [activeRepairOrderId, setActiveRepairOrderId] = useState<string | null>(null);
  const [serverErrorBanner, setServerErrorBanner] = useState<string | null>(null);

  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  const handleSelectLocation = (loc: UserLocation) => {
    setSelectedLocation(loc);
    try {
      localStorage.setItem('fugo_selected_location', JSON.stringify(loc));
    } catch (e) {
      console.warn('Failed to save selected location', e);
    }
  };

  const handleAddNewLocation = (newLoc: UserLocation) => {
    setLocationsList(prev => {
      const updated = [newLoc, ...prev.filter(l => l.id !== newLoc.id)];
      try {
        localStorage.setItem('fugo_user_locations', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save locations list', e);
      }
      return updated;
    });
    handleSelectLocation(newLoc);
  };

  const handleDeleteLocation = (id: string) => {
    setLocationsList(prev => {
      const updated = prev.filter(l => l.id !== id);
      try {
        localStorage.setItem('fugo_user_locations', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save locations list', e);
      }
      if (selectedLocation.id === id && updated.length > 0) {
        handleSelectLocation(updated[0]);
      }
      return updated;
    });
  };

  // Authentication persistence simulation
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('fugo_user');
      if (savedUser && savedUser !== 'undefined') {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.phone) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load user', e);
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

  // Direct "Order Fuel" handler with status 'PENDING', 4-digit OTP, and immediate real-time tracking
  const handleOrderFuelDirect = async (product: Product, quantity: number) => {
    try {
      const customerId = getCustomerIdFromPhone(user?.phone);
      const deliveryLat = selectedLocation.lat ?? 17.4125;
      const deliveryLng = selectedLocation.lng ?? 78.3364;
      const otp = generateDeliveryOtp();
      const deliveryFee = 25;
      const total = (product.price * quantity) + deliveryFee;
      const address = `${selectedLocation.name}: ${selectedLocation.address}, ${selectedLocation.city}`;

      const supabaseRes = await placeSupabaseOrder({
        service_type: 'FUEL',
        status: 'PENDING',
        handshake_otp: otp,
        otp: otp,
        payment_status: 'UNPAID',
        customer_location: `${deliveryLat}, ${deliveryLng}`,
        address: address,
        total_amount: total,
        price: total,
        customer_phone: user?.phone || '',
        customer_id: customerId,
        fuel_type: product.name,
        litres: quantity,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
      });

      if (!supabaseRes.success) {
        setServerErrorBanner(supabaseRes.error || 'Failed to insert order into public.orders');
        return;
      }
      setServerErrorBanner(null);

      const newOrder: Order = {
        id: supabaseRes.data.id,
        service_type: 'FUEL',
        items: [{ product, quantity }],
        status: 'processing',
        total,
        total_amount: total,
        deliveryFee,
        distance: 0.35,
        deliveryAddress: address,
        address: address,
        customer_location: `${deliveryLat}, ${deliveryLng}`,
        estimatedTime: 15,
        createdAt: Date.now(),
        customer_id: customerId,
        fuel_type: product.name,
        litres: quantity,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        driver_lat: supabaseRes.data.driver_lat,
        driver_lng: supabaseRes.data.driver_lng,
        driver_speed_kmh: supabaseRes.data.driver_speed_kmh,
        otp: otp,
        handshake_otp: otp,
        payment_status: 'UNPAID',
        supabase_status: 'PENDING',
        synced_to_supabase: supabaseRes.cloudSynced,
      };
      setActiveOrder(newOrder);
      setCurrentScreen('tracking');
    } catch (err: any) {
      console.error('Fetch error:', err, supabaseUrl);
      setServerErrorBanner(err?.message || 'Failed to insert order into public.orders');
    }
  };

  // Direct "Request SOS" handler with status 'PENDING', 4-digit OTP, and immediate real-time tracking
  const handleRequestSOS = async (
    sosTitle: string = 'Emergency Roadside SOS',
    fuelType: string = 'Emergency Fuel Rescue',
    litres: number = 10
  ) => {
    try {
      const customerId = getCustomerIdFromPhone(user?.phone);
      const deliveryLat = selectedLocation.lat ?? 17.4125;
      const deliveryLng = selectedLocation.lng ?? 78.3364;
      const otp = generateDeliveryOtp();
      const total = 450; // Flat roadside rescue fee
      const address = `${selectedLocation.name}: ${selectedLocation.address}, ${selectedLocation.city}`;

      const supabaseRes = await placeSupabaseOrder({
        service_type: 'FUEL',
        status: 'PENDING',
        handshake_otp: otp,
        otp: otp,
        payment_status: 'UNPAID',
        customer_location: `${deliveryLat}, ${deliveryLng}`,
        address: address,
        total_amount: total,
        price: total,
        customer_phone: user?.phone || '',
        customer_id: customerId,
        fuel_type: `${sosTitle}: ${fuelType}`,
        litres: litres || 10,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
      });

      if (!supabaseRes.success) {
        setServerErrorBanner(supabaseRes.error || 'Failed to insert order into public.orders');
        return;
      }
      setServerErrorBanner(null);

      const newOrder: Order = {
        id: supabaseRes.data.id,
        service_type: 'FUEL',
        items: [
          {
            product: {
              id: 'sos_emergency_item',
              name: `${sosTitle} - ${fuelType}`,
              price: total,
              unit: 'SOS',
              description: `Priority breakdown rescue at ${selectedLocation.name}`,
              image: 'https://images.unsplash.com/photo-1615906659123-23d3408667be?auto=format&fit=crop&q=80&w=400',
              category: 'service',
            },
            quantity: 1,
          },
        ],
        status: 'processing',
        total,
        total_amount: total,
        deliveryFee: 0,
        distance: 0.25,
        deliveryAddress: address,
        address: address,
        customer_location: `${deliveryLat}, ${deliveryLng}`,
        estimatedTime: 12,
        createdAt: Date.now(),
        customer_id: customerId,
        fuel_type: `${sosTitle}: ${fuelType}`,
        litres: litres || 10,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        driver_lat: supabaseRes.data.driver_lat,
        driver_lng: supabaseRes.data.driver_lng,
        driver_speed_kmh: supabaseRes.data.driver_speed_kmh,
        otp: otp,
        handshake_otp: otp,
        payment_status: 'UNPAID',
        supabase_status: 'PENDING',
        synced_to_supabase: supabaseRes.cloudSynced,
      };
      setActiveOrder(newOrder);
      setIsSosModalOpen(false);
      setCurrentScreen('tracking');
    } catch (err: any) {
      console.error('Fetch error:', err, supabaseUrl);
      setServerErrorBanner(err?.message || 'Failed to insert order into public.orders');
    }
  };

  const handleOrderSubmit = async (address: string, fee: number, dist: number, payment?: PaymentTransactionInfo): Promise<boolean> => {
    try {
      const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) + fee;
      
      // Checkout: send FUEL only if the cart has a fuel item.
      // Otherwise send service_type 'PARTS', fuel_type = short item summary (e.g. "Brake pad x2, Battery x1"), litres 0, description = the items
      const hasFuel = cart.some(item => item.product.category === 'fuel');
      const fuelItem = cart.find(item => item.product.category === 'fuel');
      const serviceType: 'FUEL' | 'PARTS' = hasFuel ? 'FUEL' : 'PARTS';
      const fuelType = hasFuel 
        ? (fuelItem?.product.name || 'Fuel') 
        : (cart.map(i => `${i.product.name} x${i.quantity}`).join(', ') || 'Vehicle Parts');
      const litres = hasFuel ? (fuelItem ? fuelItem.quantity : 1) : 0;
      const description = cart.map(i => `${i.product.name} x${i.quantity}`).join(', ');

      const customerId = getCustomerIdFromPhone(user?.phone);
      const deliveryLat = selectedLocation.lat ?? 17.4125;
      const deliveryLng = selectedLocation.lng ?? 78.3364;
      const otp = generateDeliveryOtp();
      const paymentMethod = payment?.method === 'upi' ? 'UPI' : 'COD';
      const gstAmount = Math.round((total - fee) * 0.18);

      // Call Supabase placeOrder to insert into public.orders
      const supabaseRes = await placeSupabaseOrder({
        service_type: serviceType,
        status: 'PENDING',
        handshake_otp: otp,
        otp: otp,
        payment_method: paymentMethod,
        customer_location: `${deliveryLat}, ${deliveryLng}`,
        address: address,
        total_amount: total,
        price: total,
        delivery_fee: fee,
        gst_amount: gstAmount,
        customer_phone: user?.phone || '',
        customer_id: customerId,
        fuel_type: fuelType,
        litres: litres,
        description: description,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
      });

      if (!supabaseRes.success) {
        setServerErrorBanner(supabaseRes.error || 'Failed to insert order into public.orders');
        return false;
      }
      setServerErrorBanner(null);

      const newOrder: Order = {
        id: supabaseRes.data.id,
        service_type: serviceType,
        items: [...cart],
        status: 'processing',
        total,
        total_amount: total,
        deliveryFee: fee,
        distance: dist,
        deliveryAddress: address,
        address: address,
        customer_location: `${deliveryLat}, ${deliveryLng}`,
        estimatedTime: 15,
        createdAt: Date.now(),
        customer_id: customerId,
        fuel_type: fuelType,
        litres: litres,
        description: description,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        driver_lat: supabaseRes.data.driver_lat,
        driver_lng: supabaseRes.data.driver_lng,
        driver_speed_kmh: supabaseRes.data.driver_speed_kmh,
        otp: otp,
        handshake_otp: otp,
        payment_status: 'UNPAID',
        payment_method: paymentMethod,
        supabase_status: 'PENDING',
        synced_to_supabase: supabaseRes.cloudSynced,
        payment: payment,
      };
      setActiveOrder(newOrder);
      setCart([]);
      setCurrentScreen('tracking');
      return true;
    } catch (err: any) {
      console.error('Fetch error:', err, supabaseUrl);
      setServerErrorBanner(err?.message || 'Failed to insert order into public.orders');
      return false;
    }
  };

  const placeOrder = handleOrderSubmit;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'home':
        return (
          <Home 
            onNavigate={setCurrentScreen} 
            userPhone={user?.phone || ''} 
            selectedLocation={selectedLocation} 
            onLocationChange={handleSelectLocation} 
            locations={locationsList} 
            cartCount={cart.length}
            onRequestSOS={() => setIsSosModalOpen(true)}
            onOrderFuel={() => setCurrentScreen('fuel')}
            onAddNewLocation={handleAddNewLocation}
          />
        );
      case 'fuel':
        return (
          <FuelBooking 
            products={FUEL_PRODUCTS} 
            onBack={() => setCurrentScreen('home')} 
            onAddToCart={addToCart} 
            onGoToCheckout={() => setCurrentScreen('checkout')} 
            onOrderFuelDirect={handleOrderFuelDirect} 
            location={selectedLocation} 
          />
        );
      case 'parts':
        return <Store title="Vehicle Parts" products={PARTS} onBack={() => setCurrentScreen('home')} onAddToCart={addToCart} onGoToCheckout={() => setCurrentScreen('checkout')} />;
      case 'services':
        return (
          <Services 
            products={SERVICES} 
            onBack={() => setCurrentScreen('home')} 
            onAddToCart={addToCart} 
            onGoToCheckout={() => setCurrentScreen('checkout')} 
            onBookAppointment={() => setCurrentScreen('appointment')} 
            onRequestSOS={() => setIsSosModalOpen(true)}
          />
        );
      case 'checkout':
        return <Checkout cart={cart} onBack={() => setCurrentScreen('home')} onPlaceOrder={handleOrderSubmit} handleOrderSubmit={handleOrderSubmit} location={selectedLocation} />;
      case 'tracking':
        return <Tracking order={activeOrder} onBack={() => setCurrentScreen('home')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentScreen('home')} userPhone={user?.phone || ''} onLogout={logout} onNavigate={setCurrentScreen} />;
      case 'notifications':
        return <Notifications onBack={() => setCurrentScreen('home')} />;
      case 'orders':
        return (
          <OrderHistory 
            onBack={() => setCurrentScreen('settings')} 
            customerId={getCustomerIdFromPhone(user?.phone)} 
          />
        );
      case 'addresses':
        return (
          <SavedAddresses 
            onBack={() => setCurrentScreen('settings')} 
            locations={locationsList} 
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onAddLocation={handleAddNewLocation}
            onDeleteLocation={handleDeleteLocation}
          />
        );
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
        return (
          <AppointmentBooking 
            onBack={() => setCurrentScreen('home')} 
            selectedLocation={selectedLocation}
            userPhone={user?.phone || ''}
            onBook={(newId) => {
              setActiveRepairOrderId(newId);
              setCurrentScreen('appointment_tracking');
            }}
          />
        );
      case 'appointment_tracking':
        return (
          <RepairTracking 
            orderId={activeRepairOrderId || undefined}
            onBack={() => setCurrentScreen('home')} 
          />
        );

      default:
        return (
          <Home 
            onNavigate={setCurrentScreen} 
            userPhone={user?.phone || ''} 
            selectedLocation={selectedLocation} 
            onLocationChange={setSelectedLocation} 
            locations={HYDERABAD_LOCATIONS} 
            cartCount={cart.length}
            onRequestSOS={() => setIsSosModalOpen(true)}
            onOrderFuel={() => setCurrentScreen('fuel')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
      {/* Top Red Error Banner if Supabase Insert Fails or Not Configured */}
      {serverErrorBanner && (
        <div className="bg-red-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-300" />
            <span>{serverErrorBanner}</span>
          </div>
          <button 
            onClick={() => setServerErrorBanner(null)}
            className="p-1 hover:bg-red-700 rounded text-red-200 hover:text-white transition-colors"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

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

      {/* Emergency SOS Breakdown Modal */}
      <SOSModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onRequestSOS={handleRequestSOS}
        location={selectedLocation}
      />
    </div>
  );
}
