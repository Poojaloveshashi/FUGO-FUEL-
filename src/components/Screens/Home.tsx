import { motion, AnimatePresence } from 'motion/react';
import { 
  Fuel, 
  User, 
  ShoppingBag, 
  Wrench, 
  Navigation, 
  Bell, 
  MapPin, 
  ChevronDown, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Database, 
  PieChart, 
  BatteryCharging, 
  Zap,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Radio
} from 'lucide-react';
import { Screen, UserLocation } from '../../types';
import { useState, useEffect } from 'react';
import CompanionSyncModal from '../Companion/CompanionSyncModal';
import { companionSync } from '../../services/companionSync';
import { FUEL_SALES_ENABLED, FUEL_COMING_SOON_MESSAGE } from '../../config/fuelConfig';

import LocationPickerModal from './LocationPickerModal';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  userPhone: string;
  selectedLocation: UserLocation;
  onLocationChange: (loc: UserLocation) => void;
  locations: UserLocation[];
  cartCount: number;
  onRequestSOS?: () => void;
  onOrderFuel?: () => void;
  onAddNewLocation?: (loc: UserLocation) => void;
}

export default function Home({ 
  onNavigate, 
  selectedLocation, 
  onLocationChange, 
  locations, 
  cartCount,
  onRequestSOS,
  onOrderFuel,
  onAddNewLocation
}: HomeProps) {
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [showFuelComingSoonSheet, setShowFuelComingSoonSheet] = useState(false);
  const [isCompanionConnected, setIsCompanionConnected] = useState(companionSync.isConnected());

  useEffect(() => {
    const unsub = companionSync.subscribe(() => {
      setIsCompanionConnected(companionSync.isConnected());
    });
    return unsub;
  }, []);

  const categories = [
    { id: 'appointment', icon: Calendar, label: 'Doorstep Repair & Mechanic', color: 'bg-indigo-600', desc: 'Expert Diagnosis • Arrival < 15m' },
    { id: 'services', icon: Wrench, label: 'Roadside Services', color: 'bg-blue-600', desc: 'Battery, Jumpstart, Puncture • Live Tariffs' },
    { id: 'parts', icon: ShoppingBag, label: 'Spare Parts Store', color: 'bg-slate-900', desc: '64 OEM Parts • Verified MRP & Discounts' },
    { 
      id: 'fuel', 
      icon: Fuel, 
      label: 'Fuel Up', 
      color: 'bg-slate-400', 
      desc: 'Mobile Bowser Delivery',
      isComingSoon: true,
      onClick: () => setShowFuelComingSoonSheet(true)
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Wrench className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Fugo Auto & Repair</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCompanionModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all"
            title="Companion Bowser Partner App Sync"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">Driver App</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isCompanionConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </button>
          <button 
            onClick={() => onNavigate('notifications')}
            className="relative active:scale-95 transition-transform"
          >
            <Bell className="w-6 h-6 text-slate-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[10px] text-white flex items-center justify-center font-bold">2</span>
          </button>
          <button 
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white overflow-hidden active:scale-95 transition-transform"
          >
             <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=fugo`} alt="avatar" />
          </button>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Interactive Location Selector Button */}
        <section className="relative">
          <button 
            type="button"
            onClick={() => setShowLocationsModal(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all text-left group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white/10 group-hover:bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                <MapPin className="text-orange-400 w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Delivering to</p>
                  {selectedLocation.isLiveLocation && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                      LIVE GPS
                    </span>
                  )}
                  {selectedLocation.tag && (
                    <span className="text-[9px] bg-white/10 text-slate-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      {selectedLocation.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm truncate max-w-[160px] text-white">
                    {selectedLocation.houseNumber ? `${selectedLocation.houseNumber}, ` : ''}{selectedLocation.name}
                  </h3>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-orange-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {selectedLocation.address}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded-lg font-bold text-orange-400">
                {selectedLocation.city}
              </span>
              <Navigation className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
            </div>
          </button>

          {/* Location Picker Modal */}
          <LocationPickerModal
            isOpen={showLocationsModal}
            onClose={() => setShowLocationsModal(false)}
            selectedLocation={selectedLocation}
            locations={locations}
            onSelectLocation={(loc) => {
              onLocationChange(loc);
            }}
            onAddNewLocation={onAddNewLocation}
          />
        </section>

        {/* Live Rates Ticker Banner */}
        <section 
          onClick={() => onNavigate('fuelPrices')}
          className="bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950 p-4 rounded-3xl text-white shadow-xl cursor-pointer border border-orange-500/30 hover:border-orange-500/60 transition-all group"
        >
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Live Rates • {selectedLocation.city}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 group-hover:text-orange-300">
              <span>View Full Rate Card</span>
              <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 font-bold">
              <span className="text-amber-400 font-black">Petrol</span>
              <span>₹109.66/L</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 font-bold">
              <span className="text-blue-400 font-black">Diesel</span>
              <span>₹97.82/L</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 font-bold">
              <span className="text-emerald-400 font-black">CNG</span>
              <span>₹92.50/kg</span>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 font-bold text-emerald-300">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>Battery Exch. from ₹1,100</span>
            </div>
            <div className="bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 rounded-xl shrink-0 flex items-center gap-1.5 font-bold text-cyan-300">
              <Zap className="w-3.5 h-3.5" />
              <span>EV Fast ₹18.50/kWh</span>
            </div>
          </div>
        </section>

        {/* Built-in Station Card (soft gradient background and map-pin icon) */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-44 rounded-3xl overflow-hidden shadow-lg shadow-orange-500/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-orange-950 p-6 flex flex-col justify-between border border-orange-500/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-orange-200 border border-white/10">
              15-Min Delivery Hub
            </span>
          </div>
          <div className="relative z-10">
            <h2 className="text-white text-xl sm:text-2xl font-bold leading-tight">
              Fugo Express: {selectedLocation.city} Station
            </h2>
            <p className="text-orange-200/80 text-xs sm:text-sm mt-1">
              Guaranteed doorstep service from your nearest authorized hub
            </p>
          </div>
        </motion.section>

        {/* Core Direct Action Triggers: Repair Booking & Breakdown Rescue */}
        <section className="grid grid-cols-2 gap-3.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('appointment')}
            className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-4 rounded-3xl shadow-lg shadow-indigo-600/20 text-left flex flex-col justify-between group border border-indigo-500/40 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active Now
              </span>
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">Book Repair</h3>
              <p className="text-[11px] text-indigo-200 mt-0.5">Doorstep Mechanic & Service</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (onRequestSOS) onRequestSOS();
            }}
            className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white p-4 rounded-3xl shadow-lg shadow-red-600/30 text-left flex flex-col justify-between group border border-red-500/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="text-[9px] bg-white text-red-600 font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                Emergency
              </span>
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">Request SOS</h3>
              <p className="text-[11px] text-white/80 mt-0.5">Instant Breakdown Rescue</p>
            </div>
          </motion.button>
        </section>

        {/* "Order Fuel" Card (Greyed out with orange Coming soon badge, tapping opens Coming soon sheet) */}
        <section 
          onClick={() => setShowFuelComingSoonSheet(true)}
          className="bg-slate-100/90 border border-slate-200/90 rounded-3xl p-5 relative overflow-hidden opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                <Fuel className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-700 leading-tight">Order Fuel</h3>
                <p className="text-[10px] text-slate-400">Mobile Bowser Doorstep Refuelling</p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white px-2.5 py-0.5 rounded-full shadow-xs">
              Coming Soon
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Doorstep fuel dispensing is under safety regulation rollout. Tap to view status.
          </p>

          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-slate-400 text-xs">
            <span className="text-[11px] font-mono">Diesel & Petrol Refuelling</span>
            <span className="text-orange-600 font-bold text-xs flex items-center gap-1">
              <span>Learn More</span>
              <ArrowRightIcon className="w-3 h-3" />
            </span>
          </div>
        </section>


        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 gap-4">
          <section 
            onClick={() => onNavigate('fuelPrices')}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-orange-200 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                   <h3 className="text-sm font-bold text-slate-800">Live Fuel & Gas Rates</h3>
                   <span className="text-[9px] bg-orange-100 text-orange-700 font-black px-1.5 py-0.5 rounded uppercase">Real-Time</span>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-widest mt-0.5">Petrol: ₹109.66 • Diesel: ₹97.82 • CNG: ₹92.50/kg</p>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-orange-50 transition-colors">
               <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
            </div>
          </section>

          <section 
            onClick={() => onNavigate('fuelPrices')}
            className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-[2.5rem] border border-emerald-500/30 shadow-lg flex items-center justify-between cursor-pointer hover:border-emerald-400/60 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/30">
                 <BatteryCharging className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                   <h3 className="text-sm font-bold text-white">Battery Replacement & Exchange</h3>
                   <span className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.5 rounded uppercase">Save ₹1,100</span>
                 </div>
                 <p className="text-[10px] text-emerald-300/80 font-mono tracking-tight mt-0.5">Exide & Amaron • Instant Scrap Rebate • 15m Fitting</p>
              </div>
            </div>
            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
               <ArrowRightIcon className="w-4 h-4 text-emerald-300 group-hover:text-white" />
            </div>
          </section>

          <section 
            onClick={() => onNavigate('analytics')}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-200 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <BarChart3 className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                 <h3 className="text-sm font-bold text-slate-800">Service Analytics</h3>
                 <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Weekly Report • 452 Repairs Done</p>
              </div>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-50 transition-colors">
               <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
            </div>
          </section>

          <section 
            onClick={() => onNavigate('appointment')}
            className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Calendar className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                 <h3 className="text-sm font-bold text-white">Repair Appointment</h3>
                 <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Book Expert • Arrival &lt; 15m</p>
              </div>
            </div>
            <div className="bg-white/5 p-2 rounded-xl group-hover:bg-white/10 transition-colors">
               <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
            </div>
          </section>


        </div>

        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg text-slate-900">Repair, Services & Parts</h2>
              <p className="text-xs text-slate-400">Doorstep mechanic & authentic parts with transparent MRP</p>
            </div>
            <button onClick={() => onNavigate('parts')} className="text-orange-500 text-xs font-bold hover:underline">
              View Catalog
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3.5">
            {categories.map((cat, idx) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if ((cat as any).onClick) {
                    (cat as any).onClick();
                  } else {
                    onNavigate(cat.id as Screen);
                  }
                }}
                className={`flex items-center gap-4 bg-white p-4 rounded-2xl border transition-all hover:shadow-md group shadow-sm shadow-slate-100 ${
                  (cat as any).isComingSoon 
                    ? 'opacity-75 border-slate-200 hover:border-orange-300' 
                    : 'border-slate-100 hover:border-indigo-200'
                }`}
              >
                <div className={`${cat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <cat.icon className="text-white w-7 h-7" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{cat.label}</h3>
                    {(cat as any).isComingSoon && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{cat.desc}</p>
                </div>
                <div className="bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                  <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-100 px-8 py-3 flex justify-between items-center z-20">
        <NavButton icon={Navigation} active onClick={() => onNavigate('home')} />
        <div 
          className="bg-indigo-600 w-12 h-12 rounded-full -mt-10 flex items-center justify-center shadow-xl shadow-indigo-300 border-4 border-white active:scale-90 transition-transform cursor-pointer" 
          onClick={() => onNavigate('appointment')}
          title="Book Doorstep Repair"
        >
          <Wrench className="text-white w-6 h-6" />
        </div>
        <NavButton icon={ShoppingBag} onClick={() => onNavigate('checkout')} badge={cartCount > 0 ? cartCount : undefined} />
        <NavButton icon={User} onClick={() => onNavigate('settings')} />
      </nav>

      {/* Fuel Coming Soon Sheet */}
      <AnimatePresence>
        {showFuelComingSoonSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto" />
              <div className="flex items-center gap-3 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <Fuel className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Fuel Delivery</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Licensing in Progress</p>
                </div>
              </div>

              <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed font-medium">
                {FUEL_COMING_SOON_MESSAGE}
              </div>

              <p className="text-xs text-slate-500">
                In the meantime, our certified mechanics, emergency roadside assistance, flatbed towing, and authentic spare parts catalog are fully active.
              </p>

              <button
                type="button"
                onClick={() => setShowFuelComingSoonSheet(false)}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Companion Driver App Sync Bridge Modal */}
      <CompanionSyncModal
        isOpen={showCompanionModal}
        onClose={() => setShowCompanionModal(false)}
      />
    </div>
  );
}

function NavButton({ icon: Icon, active = false, onClick, badge }: { icon: any; active?: boolean; onClick?: () => void; badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 transition-colors relative ${active ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <Icon className="w-6 h-6" />
      {badge !== undefined && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
