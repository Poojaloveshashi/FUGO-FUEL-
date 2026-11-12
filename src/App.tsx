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

import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';
import { placeSupabaseOrder, generateDeliveryOtp } from './services/supabase';
import { FUEL_SALES_ENABLED } from './config/fuelConfig';
import { SPARE_PARTS_MASTER_CATALOG } from './data/sparePartsCatalog';

const FUEL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Premium Petrol (95 Octane)', price: 109.66, unit: 'L', description: '95 Octane high-performance fuel with cleaning additives', image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
  { id: 'd1', name: 'Clean Diesel (BS-VI)', price: 97.82, unit: 'L', description: 'Ultra-low sulfur refined high-speed diesel', image: 'https://images.unsplash.com/photo-1610492410313-094038a83a0a?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
  { id: 'cng1', name: 'Compressed Natural Gas (CNG)', price: 92.50, unit: 'kg', description: '200 bar compressed eco-green natural gas mobile dispatch', image: 'https://images.unsplash.com/photo-1545644161-591605335805?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
  { id: 'ev1', name: 'EV Fast Charging (Emergency Van)', price: 18.50, unit: 'kWh', description: 'Mobile DC Fast Charger 30kW CCS2 delivery to your breakdown spot', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=400', category: 'fuel' },
];

const PARTS: Product[] = SPARE_PARTS_MASTER_CATALOG;

const SERVICES: Product[] = [
  { id: 'jumpstart', name: 'Battery Jumpstart & Health Test', price: 299, mrp: 499, originalPrice: 499, unit: 'Service', description: 'Immediate on-site battery booster & alternator voltage diagnostics', image: 'https://images.unsplash.com/photo-1615906659123-23d3408667be?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'puncture', name: 'Tubeless Tire Puncture Repair', price: 149, mrp: 299, originalPrice: 299, unit: 'Service', description: 'On-spot pneumatic puncture plug repair & digital air pressure inflation', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'wash', name: 'Doorstep Waterless Eco Wash', price: 449, mrp: 699, originalPrice: 699, unit: 'Service', description: 'Carnauba wax protection, eco wash & micro-fiber vacuum deep clean', image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'oil_change', name: 'Periodic Lube & Oil Service', price: 699, mrp: 1199, originalPrice: 1199, unit: 'Service', description: 'Engine oil drain, replacement labor, 20-point chassis checkup', image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193b?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'brake_service', name: 'Brake Pads Replacement Labor', price: 399, mrp: 650, originalPrice: 650, unit: 'Service', description: 'Brake calliper overhaul, pad fitting, disc cleaning & brake bleed', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=400', category: 'service' },
  { id: 'inspection', name: 'Comprehensive Vehicle Inspection', price: 499, mrp: 999, originalPrice: 999, unit: 'Service', description: 'OBD-II computer scan, suspension test, battery & electrical audit', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=400', category: 'service' },
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
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

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

  // Real Supabase Auth state listener with session persistence
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setIsAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setIsAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setSession(null);
    setCurrentScreen('home');
  };

  const addToCart = (product: Product, quantity: number) => {
    // Strictly prevent fuel items when FUEL_SALES_ENABLED is false
    if (!FUEL_SALES_ENABLED && product.category === 'fuel') {
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
  };

  // Customer ID strictly uses session.user.id
  const customerId = session?.user?.id || '';
  const customerName = session?.user?.user_metadata?.full_name || 'Customer';
  const customerPhone = session?.user?.user_metadata?.phone || '';
  const userEmail = session?.user?.email || null;

  // Direct fuel ordering blocked while licences are in progress
  const handleOrderFuelDirect = async () => {
    if (!FUEL_SALES_ENABLED) {
      console.error('Fuel sales are currently disabled pending licenses.');
      return;
    }
  };

  // Direct "Request SOS" handler for roadside emergencies (mechanic, battery, towing)
  const handleRequestSOS = async (
    sosTitle: string = 'Emergency Roadside SOS',
    fuelType: string = 'Roadside Assistance',
    litres: number = 0
  ) => {
    try {
      const deliveryLat = selectedLocation.lat ?? 17.4125;
      const deliveryLng = selectedLocation.lng ?? 78.3364;
      const otp = generateDeliveryOtp();
      const total = 450; // Roadside dispatch tariff
      const address = `${selectedLocation.name}: ${selectedLocation.address}, ${selectedLocation.city}`;
      const serviceType = sosTitle.toLowerCase().includes('tow') ? 'TRANSPORT' : 'MAINTENANCE';

      const supabaseRes = await placeSupabaseOrder({
        service_type: serviceType,
        status: 'PENDING',
        handshake_otp: otp,
        otp: otp,
        customer_location: `${deliveryLat}, ${deliveryLng}`,
        address: address,
        total_amount: total,
        price: total,
        delivery_fee: 0,
        gst_amount: Math.round(total * 0.18),
        payment_method: 'COD',
        customer_phone: customerPhone,
        customer_name: customerName,
        customer_id: customerId,
        fuel_type: sosTitle,
        litres: litres,
        description: `${sosTitle}: ${fuelType}`,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
      });

      if (!supabaseRes.success) {
        console.error('SOS placeOrder error:', supabaseRes.error);
        setServerErrorBanner('Something went wrong. Please try again.');
        return;
      }
      setServerErrorBanner(null);

      const newOrder: Order = {
        id: supabaseRes.data.id,
        service_type: serviceType,
        items: [],
        status: 'processing',
        total,
        total_amount: total,
        deliveryFee: 0,
        distance: 0.35,
        deliveryAddress: address,
        address: address,
        customer_location: `${deliveryLat}, ${deliveryLng}`,
        estimatedTime: 15,
        createdAt: Date.now(),
        customer_id: customerId,
        customer_phone: customerPhone,
        fuel_type: sosTitle,
        litres: litres,
        description: `${sosTitle}: ${fuelType}`,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        driver_lat: supabaseRes.data.driver_lat,
        driver_lng: supabaseRes.data.driver_lng,
        driver_speed_kmh: supabaseRes.data.driver_speed_kmh,
        otp: otp,
        handshake_otp: otp,
        payment_status: 'PENDING',
        payment_method: 'COD',
        supabase_status: 'PENDING',
        synced_to_supabase: supabaseRes.cloudSynced,
      };
      setActiveOrder(newOrder);
      setCurrentScreen('tracking');
    } catch (err: any) {
      console.error('SOS submission error:', err);
      setServerErrorBanner('Something went wrong. Please try again.');
    }
  };

  // Handle Standard Checkout Order Submission
  const handleOrderSubmit = async (
    address: string,
    fee: number,
    dist: number,
    payment?: PaymentTransactionInfo
  ) => {
    try {
      const activeItems = cart.filter(item => FUEL_SALES_ENABLED || item.product.category !== 'fuel');
      const subtotal = activeItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      const totalSavings = activeItems.reduce((acc, item) => acc + ((item.product.exchangeDiscount || 0) * item.quantity), 0);
      const total = Math.max(0, subtotal - totalSavings + fee);

      const primaryCategory = activeItems[0]?.product?.category;
      const serviceType = primaryCategory === 'service' ? 'MAINTENANCE' : primaryCategory === 'parts' ? 'PARTS' : 'MAINTENANCE';
      const fuelType = activeItems.map(i => `${i.product.name} (x${i.quantity})`).join(', ') || 'Doorstep Service';
      const description = activeItems.map(i => `${i.quantity}x ${i.product.name}`).join(' | ');

      const deliveryLat = selectedLocation.lat ?? 17.4125;
      const deliveryLng = selectedLocation.lng ?? 78.3364;
      const otp = generateDeliveryOtp();
      const paymentMethod = payment?.method === 'upi' ? 'UPI' : 'COD';
      const gstAmount = Math.round((total - fee) * 0.18);

      // Place order with payment_method, total_amount, delivery_fee, gst_amount
      // Never send payment_status, paid_at or collected_by
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
        customer_phone: customerPhone,
        customer_name: customerName,
        customer_id: customerId,
        fuel_type: fuelType,
        litres: 0,
        description: description,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
      });

      if (!supabaseRes.success) {
        console.error('Checkout placeOrder error:', supabaseRes.error);
        setServerErrorBanner('Something went wrong. Please try again.');
        return false;
      }
      setServerErrorBanner(null);

      const newOrder: Order = {
        id: supabaseRes.data.id,
        service_type: serviceType,
        items: [...activeItems],
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
        customer_phone: customerPhone,
        fuel_type: fuelType,
        litres: 0,
        description: description,
        delivery_lat: deliveryLat,
        delivery_lng: deliveryLng,
        driver_lat: supabaseRes.data.driver_lat,
        driver_lng: supabaseRes.data.driver_lng,
        driver_speed_kmh: supabaseRes.data.driver_speed_kmh,
        otp: otp,
        handshake_otp: otp,
        payment_status: 'PENDING',
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
      console.error('Checkout error:', err);
      setServerErrorBanner('Something went wrong. Please try again.');
      return false;
    }
  };

  // Requirement 6: Show the Login screen whenever there is no session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-500">Connecting to secure session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Login
          onLoginSuccess={(user) => {
            // Once verified and profile completed, session will trigger through onAuthStateChange
            setCurrentScreen('home');
          }}
        />
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <Home 
            onNavigate={setCurrentScreen} 
            userPhone={customerPhone} 
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
            onNavigate={setCurrentScreen}
            location={selectedLocation} 
          />
        );
      case 'parts':
        return (
          <Store 
            title="Vehicle Parts" 
            products={PARTS} 
            onBack={() => setCurrentScreen('home')} 
            onAddToCart={addToCart} 
            onGoToCheckout={() => setCurrentScreen('checkout')} 
          />
        );
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
        return (
          <Checkout 
            cart={cart} 
            onBack={() => setCurrentScreen('home')} 
            onPlaceOrder={handleOrderSubmit} 
            handleOrderSubmit={handleOrderSubmit} 
            location={selectedLocation} 
          />
        );
      case 'tracking':
        return <Tracking order={activeOrder} onBack={() => setCurrentScreen('home')} />;
      case 'settings':
        return (
          <Settings 
            onBack={() => setCurrentScreen('home')} 
            userPhone={customerPhone} 
            userEmail={userEmail}
            displayName={customerName}
            onLogout={handleLogout} 
            onNavigate={setCurrentScreen} 
          />
        );
      case 'notifications':
        return <Notifications onBack={() => setCurrentScreen('home')} />;
      case 'orders':
        return (
          <OrderHistory 
            onBack={() => setCurrentScreen('settings')} 
            customerId={customerId} 
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
        return (
          <PersonalInfo 
            onBack={() => setCurrentScreen('settings')} 
            userPhone={customerPhone} 
            userEmail={userEmail} 
            displayName={customerName} 
          />
        );
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
            userPhone={customerPhone}
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
            userPhone={customerPhone} 
            selectedLocation={selectedLocation} 
            onLocationChange={handleSelectLocation} 
            locations={locationsList} 
            cartCount={cart.length}
            onRequestSOS={() => setIsSosModalOpen(true)}
            onOrderFuel={() => setCurrentScreen('fuel')}
            onAddNewLocation={handleAddNewLocation}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
      {/* Top Error Banner (Clean user error text) */}
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
