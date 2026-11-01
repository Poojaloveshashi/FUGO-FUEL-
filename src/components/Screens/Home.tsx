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

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  userPhone: string;
  selectedLocation: UserLocation;
  onLocationChange: (loc: UserLocation) => void;
  locations: UserLocation[];
  cartCount: number;
  onRequestSOS?: () => void;
  onOrderFuel?: () => void;
}

export default function Home({ 
  onNavigate, 
  selectedLocation, 
  onLocationChange, 
  locations, 
  cartCount,
  onRequestSOS,
  onOrderFuel 
}: HomeProps) {
  const [showLocations, setShowLocations] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [isCompanionConnected, setIsCompanionConnected] = useState(companionSync.isConnected());

  useEffect(() => {
    const unsub = companionSync.subscribe(() => {
      setIsCompanionConnected(companionSync.isConnected());
    });
    return unsub;
  }, []);

  const categories = [
    { id: 'fuel', icon: Fuel, label: 'Fuel Up', color: 'bg-orange-500', desc: 'Petrol/Diesel' },
    { id: 'parts', icon: ShoppingBag, label: 'Spare Parts', color: 'bg-slate-900', desc: '64 Verified Items • Rates from ₹120' },
    { id: 'services', icon: Wrench, label: 'Service', color: 'bg-blue-600', desc: 'Puncture/Jump' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Fuel className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Fugo Fuel</span>
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
        {/* Location Selector */}
        <section className="relative">
          <div 
            onClick={() => setShowLocations(!showLocations)}
            className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-200 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <MapPin className="text-orange-400 w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Delivering to</p>
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-sm truncate max-w-[120px]">{selectedLocation.name}</h3>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showLocations ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-bold text-orange-400">{selectedLocation.city}</span>
              <Navigation className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Location Dropdown */}
          <AnimatePresence>
            {showLocations && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl z-20 overflow-hidden"
              >
                <div className="p-3 border-b border-slate-50 bg-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3">Saved Locations</p>
                </div>
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onLocationChange(loc);
                      setShowLocations(false);
                    }}
                    className={`w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left ${selectedLocation.id === loc.id ? 'bg-orange-50' : ''}`}
                  >
                    <div>
                      <h4 className={`font-bold text-sm ${selectedLocation.id === loc.id ? 'text-orange-600' : 'text-slate-800'}`}>{loc.name}</h4>
                      <p className="text-xs text-slate-400">{loc.address}</p>
                    </div>
                    {selectedLocation.id === loc.id && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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

        {/* Promo Banner */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-44 rounded-3xl overflow-hidden shadow-lg shadow-orange-100 group"
        >
          <img 
            src="https://images.unsplash.com/photo-1545644161-591605335805?auto=format&fit=crop&q=80&w=800" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            alt="Fugo Express Station"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/90 via-orange-600/20 to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-white text-2xl font-bold leading-tight line-clamp-2">Fugo Express: {selectedLocation.city} Station</h2>
            <p className="text-white/80 text-sm mt-1">15-Minute delivery guaranteed from nearest station</p>
          </div>
        </motion.section>

        {/* Core Direct Action Triggers: Order Fuel & Request SOS */}
        <section className="grid grid-cols-2 gap-3.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (onOrderFuel) onOrderFuel();
              else onNavigate('fuel');
            }}
            className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4 rounded-3xl shadow-lg shadow-orange-500/20 text-left flex flex-col justify-between group border border-orange-400/40 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Fuel className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] bg-black/20 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                15m Express
              </span>
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">Order Fuel</h3>
              <p className="text-[11px] text-white/80 mt-0.5">Petrol & Diesel Dispatch</p>
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

        {/* Central System Architecture Interactive Card (Matches User's Ecosystem Diagram) */}
        <section
          onClick={() => onNavigate('central_system')}
          className="bg-[#12161c] text-white p-5 rounded-[2.5rem] border border-slate-800 shadow-xl cursor-pointer hover:border-indigo-500/60 transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 font-mono">
                Ecosystem Architecture
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
              <span>Inspect Live System</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Interactive visual diagram widget */}
          <div className="bg-[#181e26] p-4 rounded-3xl border border-slate-800/80 space-y-2.5">
            {/* Top: 3 Apps */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
              <div className="bg-[#0f4333] text-emerald-300 py-1.5 px-1 rounded-xl border border-emerald-700/50 truncate">
                Fuel app
              </div>
              <div className="bg-[#0f4333] text-emerald-300 py-1.5 px-1 rounded-xl border border-emerald-700/50 truncate">
                Repairs app
              </div>
              <div className="bg-[#0f4333] text-emerald-300 py-1.5 px-1 rounded-xl border border-emerald-700/50 truncate">
                Service app
              </div>
            </div>

            {/* Connecting Arrows */}
            <div className="flex justify-around text-slate-500 text-[11px] leading-none py-0.5">
              <span>↕</span>
              <span>↕</span>
              <span>↕</span>
            </div>

            {/* Middle: Central system */}
            <div className="bg-[#3d3282] text-white py-2 px-3 rounded-2xl text-center border border-indigo-400/40 shadow-sm">
              <span className="text-xs font-black block">Central system</span>
              <span className="text-[10px] text-indigo-200 block">Same users, orders, payments, stock</span>
            </div>

            {/* Connecting Arrow */}
            <div className="text-center text-slate-500 text-[11px] leading-none py-0.5">
              <span>↕</span>
            </div>

            {/* Bottom: Fulfilment */}
            <div className="border border-dashed border-slate-700/90 rounded-2xl p-2 bg-black/20">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Fulfilment
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-slate-800/80 py-1 px-2 rounded-lg text-slate-200">
                  <strong>Delivery</strong>: Fuel drop-offs
                </div>
                <div className="bg-slate-800/80 py-1 px-2 rounded-lg text-slate-200">
                  <strong>Mechanics</strong>: Repairs + service
                </div>
                <div className="bg-slate-800/80 py-1 px-2 rounded-lg text-slate-200">
                  <strong>Offline outlets</strong>: Pumps, garages
                </div>
                <div className="bg-slate-800/80 py-1 px-2 rounded-lg text-slate-200">
                  <strong>Warehouse</strong>: Fuel + parts stock
                </div>
              </div>
            </div>
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

          <section 
            onClick={() => onNavigate('supabase_orders')}
            className="bg-emerald-950 text-white p-6 rounded-[2.5rem] border border-emerald-800/80 shadow-lg flex items-center justify-between cursor-pointer hover:bg-emerald-900 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-500/30">
                 <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                 <div className="flex items-center gap-2">
                   <h3 className="text-sm font-bold text-white">Supabase Orders</h3>
                   <span className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.5 rounded uppercase">Live Table</span>
                 </div>
                 <p className="text-[10px] text-emerald-300/80 font-mono tracking-tight mt-0.5">placeOrder() • Lat: 17.4125, Lng: 78.3364</p>
              </div>
            </div>
            <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-colors">
               <ArrowRightIcon className="w-4 h-4 text-emerald-300 group-hover:text-white" />
            </div>
          </section>
        </div>

        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Services</h2>
            <button className="text-orange-500 text-sm font-semibold">View All</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {categories.map((cat, idx) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(cat.id as Screen)}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all hover:shadow-md group shadow-sm shadow-slate-100"
              >
                <div className={`${cat.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <cat.icon className="text-white w-7 h-7" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-slate-800">{cat.label}</h3>
                  <p className="text-xs text-slate-400">{cat.desc}</p>
                </div>
                <div className="bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                  <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-orange-500" />
                </div>
              </motion.button>
            ))}
          </div>
        </section>

      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-100 px-8 py-3 flex justify-between items-center z-20">
        <NavButton icon={Navigation} active onClick={() => onNavigate('home')} />
        <div className="bg-orange-500 w-12 h-12 rounded-full -mt-10 flex items-center justify-center shadow-xl shadow-orange-300 border-4 border-white active:scale-90 transition-transform cursor-pointer" onClick={() => onNavigate('fuel')}>
          <Fuel className="text-white w-6 h-6" />
        </div>
        <NavButton icon={ShoppingBag} onClick={() => onNavigate('checkout')} badge={cartCount > 0 ? cartCount : undefined} />
        <NavButton icon={User} onClick={() => onNavigate('settings')} />
      </nav>

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
