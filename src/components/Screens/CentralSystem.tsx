import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Fuel, 
  Wrench, 
  ShoppingBag, 
  Layers, 
  Truck, 
  Users, 
  CreditCard, 
  Package, 
  Warehouse as WarehouseIcon, 
  Building2, 
  Radio, 
  ExternalLink, 
  CheckCircle2, 
  ArrowUpDown, 
  Database, 
  Activity, 
  Zap, 
  ShieldCheck, 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { Screen, UserLocation, SupabaseOrderRecord } from '../../types';
import { 
  getCentralStock, 
  CentralStockState, 
  FULFILMENT_DELIVERY_FLEET, 
  FULFILMENT_MECHANICS, 
  FULFILMENT_OFFLINE_OUTLETS, 
  FULFILMENT_WAREHOUSES,
  FulfilmentDeliveryUnit
} from '../../services/centralSystem';
import { getLocalOrders } from '../../services/supabase';
import { getWalletBalance } from '../../services/payment';
import { companionSync, COMPANION_APP_URL, COMPANION_APP_ID, CURRENT_APP_ID } from '../../services/companionSync';
import CompanionSyncModal from '../Companion/CompanionSyncModal';

interface CentralSystemProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  selectedLocation: UserLocation;
  userPhone: string;
}

type SelectedNode = 
  | 'fuel_app' 
  | 'repairs_app' 
  | 'service_app' 
  | 'central_system' 
  | 'delivery' 
  | 'mechanics' 
  | 'offline_outlets' 
  | 'warehouse';

export default function CentralSystem({
  onBack,
  onNavigate,
  selectedLocation,
  userPhone,
}: CentralSystemProps) {
  const [selectedNode, setSelectedNode] = useState<SelectedNode>('central_system');
  const [stock, setStock] = useState<CentralStockState>(() => getCentralStock());
  const [orders, setOrders] = useState<SupabaseOrderRecord[]>([]);
  const [walletBal, setWalletBal] = useState<number>(() => getWalletBalance());
  const [isCompanionConnected, setIsCompanionConnected] = useState(companionSync.isConnected());
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [centralTab, setCentralTab] = useState<'overview' | 'users' | 'orders' | 'payments' | 'stock'>('overview');

  useEffect(() => {
    setOrders(getLocalOrders());
    setStock(getCentralStock());
    setWalletBal(getWalletBalance());

    const unsub = companionSync.subscribe(() => {
      setIsCompanionConnected(companionSync.isConnected());
      setOrders(getLocalOrders());
    });
    return unsub;
  }, []);

  return (
    <div className="min-h-screen bg-[#111418] text-slate-100 flex flex-col font-sans pb-24">
      {/* Top Header */}
      <header className="bg-[#181d24] border-b border-slate-800/80 sticky top-0 z-30 shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight">System Architecture & Ecosystem</h1>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30 font-mono">
                  Live Unified Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Multi-App Unified Database, Stock & Fulfilment</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCompanionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">Companion Driver App</span>
            <span className="sm:hidden">Driver App</span>
            <span className={`w-2 h-2 rounded-full ${isCompanionConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-6">
        {/* Banner with Companion Driver App link */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-4 border border-indigo-800/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Central Dispatch Synced with Partner App</span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isCompanionConnected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isCompanionConnected ? 'Live Connection Active' : 'Realtime Standby'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                App ID: {COMPANION_APP_ID} • Realtime channel: <code className="text-indigo-300">fleet-bowser-sync</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => companionSync.openCompanionApp()}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Launch Driver App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            THE VISUAL ARCHITECTURE CANVAS (Direct Match with User's Diagram)
            ========================================================================= */}
        <div className="bg-[#14181d] rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Interactive Architecture Map
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Click any component to inspect live state</span>
          </div>

          {/* TOP ROW: 3 FRONT-END APPS (Dark Green Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Fuel app */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedNode('fuel_app')}
              className={`p-4 rounded-2xl text-center border transition-all cursor-pointer ${
                selectedNode === 'fuel_app'
                  ? 'bg-[#0f4333] border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950/40'
                  : 'bg-[#0c382b] hover:bg-[#0f4333] border-emerald-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Fuel className="w-5 h-5 text-emerald-300" />
                <h3 className="text-base font-extrabold text-white">Fuel app</h3>
              </div>
              <p className="text-[11px] text-emerald-200/80">Doorstep bowser diesel & petrol</p>
              <div className="mt-2.5 pt-2 border-t border-emerald-700/40 flex items-center justify-center gap-1.5 text-[10px] text-emerald-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Active • 4 Products</span>
              </div>
            </motion.button>

            {/* 2. Repairs app */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedNode('repairs_app')}
              className={`p-4 rounded-2xl text-center border transition-all cursor-pointer ${
                selectedNode === 'repairs_app'
                  ? 'bg-[#0f4333] border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950/40'
                  : 'bg-[#0c382b] hover:bg-[#0f4333] border-emerald-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShoppingBag className="w-5 h-5 text-emerald-300" />
                <h3 className="text-base font-extrabold text-white">Repairs app</h3>
              </div>
              <p className="text-[11px] text-emerald-200/80">64 verified vehicle parts & catalog</p>
              <div className="mt-2.5 pt-2 border-t border-emerald-700/40 flex items-center justify-center gap-1.5 text-[10px] text-emerald-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>64 SKUs In Stock</span>
              </div>
            </motion.button>

            {/* 3. Service app */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedNode('service_app')}
              className={`p-4 rounded-2xl text-center border transition-all cursor-pointer ${
                selectedNode === 'service_app'
                  ? 'bg-[#0f4333] border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-950/40'
                  : 'bg-[#0c382b] hover:bg-[#0f4333] border-emerald-800/60'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Wrench className="w-5 h-5 text-emerald-300" />
                <h3 className="text-base font-extrabold text-white">Service app</h3>
              </div>
              <p className="text-[11px] text-emerald-200/80">Breakdown SOS & scheduled slots</p>
              <div className="mt-2.5 pt-2 border-t border-emerald-700/40 flex items-center justify-center gap-1.5 text-[10px] text-emerald-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>On-Site Mechanics</span>
              </div>
            </motion.button>
          </div>

          {/* BIDIRECTIONAL CONNECTING ARROWS ↕ */}
          <div className="flex justify-around items-center py-1 text-slate-500">
            <div className="flex flex-col items-center">
              <ArrowUpDown className="w-5 h-5 text-slate-500 animate-bounce" />
            </div>
            <div className="flex flex-col items-center">
              <ArrowUpDown className="w-5 h-5 text-slate-500 animate-bounce" />
            </div>
            <div className="flex flex-col items-center">
              <ArrowUpDown className="w-5 h-5 text-slate-500 animate-bounce" />
            </div>
          </div>

          {/* MIDDLE ROW: CENTRAL SYSTEM (Solid Purple Card) */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={() => setSelectedNode('central_system')}
            className={`p-5 rounded-2xl text-center border transition-all cursor-pointer ${
              selectedNode === 'central_system'
                ? 'bg-[#3d3282] border-indigo-300 ring-2 ring-indigo-400/50 shadow-xl shadow-indigo-950/50'
                : 'bg-[#342a73] hover:bg-[#3d3282] border-indigo-700/60'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Database className="w-6 h-6 text-indigo-200" />
              <h3 className="text-xl font-black text-white tracking-tight">Central system</h3>
            </div>
            <p className="text-sm font-medium text-indigo-100">
              Same users, orders, payments, stock
            </p>

            {/* Central System Quick Metrics Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-indigo-400/20 text-xs">
              <div className="bg-black/25 rounded-xl p-2">
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">Same Users</span>
                <span className="font-bold text-white font-mono">{userPhone}</span>
              </div>
              <div className="bg-black/25 rounded-xl p-2">
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">Same Orders</span>
                <span className="font-bold text-white font-mono">{orders.length} in Supabase</span>
              </div>
              <div className="bg-black/25 rounded-xl p-2">
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">Same Payments</span>
                <span className="font-bold text-emerald-300 font-mono">₹{walletBal} + 7 Gateways</span>
              </div>
              <div className="bg-black/25 rounded-xl p-2">
                <span className="text-[10px] uppercase font-bold text-indigo-200 block">Same Stock</span>
                <span className="font-bold text-orange-300 font-mono">{stock.dieselLiters.toLocaleString()}L Diesel</span>
              </div>
            </div>
          </motion.div>

          {/* BIDIRECTIONAL CONNECTING ARROW ↕ */}
          <div className="flex justify-center items-center py-1 text-slate-500">
            <ArrowUpDown className="w-6 h-6 text-slate-500 animate-pulse" />
          </div>

          {/* BOTTOM ROW: FULFILMENT CONTAINER (Dotted Border Container) */}
          <div className="border-2 border-dashed border-slate-700/80 rounded-3xl p-5 bg-black/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-200 tracking-wide uppercase">
                  Fulfilment
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Integrated Ground Network</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Delivery */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedNode('delivery')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedNode === 'delivery'
                    ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-500/30'
                    : 'bg-[#1a2027] hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-black text-white">Delivery</h4>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                    Bowser Fleet
                  </span>
                </div>
                <p className="text-xs text-slate-300">Fuel drop-offs</p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  <span>3 Mobile Bowsers</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">1 En-Route (Driver Rahul)</span>
                </div>
              </motion.button>

              {/* 2. Mechanics */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedNode('mechanics')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedNode === 'mechanics'
                    ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-500/30'
                    : 'bg-[#1a2027] hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-black text-white">Mechanics</h4>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                    On-Site
                  </span>
                </div>
                <p className="text-xs text-slate-300">Repairs + service</p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  <span>3 Certified Techs</span>
                  <span>•</span>
                  <span className="text-emerald-400">2 Available Now</span>
                </div>
              </motion.button>

              {/* 3. Offline outlets */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedNode('offline_outlets')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedNode === 'offline_outlets'
                    ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-500/30'
                    : 'bg-[#1a2027] hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-black text-white">Offline outlets</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    4 Stations
                  </span>
                </div>
                <p className="text-xs text-slate-300">Pumps, garages</p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  <span>DLF Cyber City Depot</span>
                  <span>•</span>
                  <span>IOCL Station</span>
                </div>
              </motion.button>

              {/* 4. Warehouse */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedNode('warehouse')}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedNode === 'warehouse'
                    ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-500/30'
                    : 'bg-[#1a2027] hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-base font-black text-white">Warehouse</h4>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                    Hub Depot
                  </span>
                </div>
                <p className="text-xs text-slate-300">Fuel + parts stock</p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  <span>65,000L Bulk Tank</span>
                  <span>•</span>
                  <span>64 Parts SKUs</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DYNAMIC NODE INSPECTOR: DETAILS FOR THE SELECTED COMPONENT
            ========================================================================= */}
        <div className="bg-[#181d24] rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
          {/* Node Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Selected Component Inspector
              </span>
              <h3 className="text-base font-bold text-white capitalize">
                {selectedNode.replace('_', ' ')}
              </h3>
            </div>
            
            {/* Quick Action Button for that specific node */}
            {selectedNode === 'fuel_app' && (
              <button
                onClick={() => onNavigate('fuel')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Open Fuel App
              </button>
            )}
            {selectedNode === 'repairs_app' && (
              <button
                onClick={() => onNavigate('parts')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Open Repairs & Parts
              </button>
            )}
            {selectedNode === 'service_app' && (
              <button
                onClick={() => onNavigate('services')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Open Service App
              </button>
            )}
            {selectedNode === 'delivery' && (
              <button
                onClick={() => companionSync.openCompanionApp()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Launch Driver App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* DETAILS: CENTRAL SYSTEM */}
          {selectedNode === 'central_system' && (
            <div className="space-y-4">
              <div className="flex bg-slate-900/60 p-1 rounded-xl text-xs font-bold text-slate-400">
                {(['overview', 'users', 'orders', 'payments', 'stock'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCentralTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                      centralTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {centralTab === 'overview' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">Users Database</span>
                    <p className="text-sm font-extrabold text-white">Unified Profile</p>
                    <p className="text-[10px] text-slate-400 mt-1">Single sign-on across Fuel, Repairs, and Service</p>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">Supabase Orders</span>
                    <p className="text-sm font-extrabold text-white">{orders.length} Active</p>
                    <p className="text-[10px] text-slate-400 mt-1">Status: PENDING, DISPATCHED, DELIVERED</p>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">Payment Gateway</span>
                    <p className="text-sm font-extrabold text-emerald-400">Every Option</p>
                    <p className="text-[10px] text-slate-400 mt-1">UPI, Cards, Fleet Cards, NetBanking, Wallets</p>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">Live Stock Sync</span>
                    <p className="text-sm font-extrabold text-orange-400">Auto Decrement</p>
                    <p className="text-[10px] text-slate-400 mt-1">Diesel, Petrol, CNG & 64 replacement parts</p>
                  </div>
                </div>
              )}

              {centralTab === 'users' && (
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">User Identity (SSO Phone)</span>
                    <span className="font-mono font-bold text-white">{userPhone}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Active Delivery Location</span>
                    <span className="font-bold text-white">{selectedLocation.name}, {selectedLocation.city}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Unified Fuel Balance</span>
                    <span className="font-mono font-bold text-emerald-400">₹{walletBal}</span>
                  </div>
                </div>
              )}

              {centralTab === 'orders' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Recent orders in Supabase <code className="text-indigo-400 font-mono">orders</code> table:</span>
                    <button onClick={() => onNavigate('supabase_orders')} className="text-indigo-400 hover:underline">
                      View Raw Stream →
                    </button>
                  </div>
                  <div className="divide-y divide-slate-800 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden text-xs">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{o.id}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              OTP: {o.otp}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{o.fuel_type} • {o.litres}L</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                          o.status === 'DELIVERED' 
                            ? 'bg-emerald-500/20 text-emerald-300' 
                            : 'bg-orange-500/20 text-orange-300'
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {centralTab === 'payments' && (
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-white">Central Payment Infrastructure</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'UPI Dynamic QR & Apps', status: 'Online', code: 'ICICI FASTSWITCH' },
                      { name: 'Cards (Visa, RuPay, MC)', status: '3DS Active', code: 'CYBERSOURCE' },
                      { name: 'Fleet Cards (IOCL/BPCL)', status: 'Enabled', code: 'FLEET POS' },
                      { name: 'Net Banking (40+ Banks)', status: 'Online', code: 'DIRECT INTEGRATION' },
                      { name: 'Fuel Wallet (Fugo)', status: 'Active', code: `BAL: ₹${walletBal}` },
                      { name: 'Pay Later / BNPL', status: 'Active', code: 'SIMPL & LAZYPAY' },
                    ].map((p, idx) => (
                      <div key={idx} className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                        <span className="font-bold text-white block text-[11px]">{p.name}</span>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-emerald-400 font-semibold">{p.status}</span>
                          <span className="font-mono text-slate-400">{p.code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {centralTab === 'stock' && (
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Central Fuel Reservoir & Parts Stock</span>
                    <span className="text-slate-400 text-[10px]">Updated: {stock.lastRestockedAt}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800/70 p-3 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">Diesel (BS-VI)</span>
                      <span className="text-sm font-black text-orange-400 font-mono">
                        {stock.dieselLiters.toLocaleString()} L
                      </span>
                    </div>
                    <div className="bg-slate-800/70 p-3 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">Petrol (95 Octane)</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        {stock.petrolLiters.toLocaleString()} L
                      </span>
                    </div>
                    <div className="bg-slate-800/70 p-3 rounded-xl">
                      <span className="text-slate-400 text-[10px] block">Spare Parts Units</span>
                      <span className="text-sm font-black text-blue-400 font-mono">
                        {stock.partsTotalUnits} units
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DETAILS: DELIVERY */}
          {selectedNode === 'delivery' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Mobile bowsers equipped with digital flowmeters, vapor recovery systems, and automated OTP delivery verification valves.
              </p>
              <div className="space-y-2">
                {FULFILMENT_DELIVERY_FLEET.map((bowser) => (
                  <div key={bowser.id} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{bowser.name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                          {bowser.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Driver: <strong className="text-slate-200">{bowser.driver}</strong> • {bowser.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-400 block font-mono">
                        {bowser.currentLoadLiters} / {bowser.capacityLiters} L
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${
                        bowser.status === 'EN_ROUTE' ? 'text-orange-400' : 'text-slate-400'
                      }`}>
                        {bowser.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DETAILS: MECHANICS */}
          {selectedNode === 'mechanics' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Certified on-demand technicians dispatched with diagnostics tools, battery jump starters, and spare parts.
              </p>
              <div className="space-y-2">
                {FULFILMENT_MECHANICS.map((mech) => (
                  <div key={mech.id} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{mech.name}</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                          ★ {mech.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{mech.specialization} • {mech.assignedLocation}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      mech.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {mech.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DETAILS: OFFLINE OUTLETS */}
          {selectedNode === 'offline_outlets' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Network of partner fuel pumps and certified service garages for fleet replenishment and customer drop-offs.
              </p>
              <div className="space-y-2">
                {FULFILMENT_OFFLINE_OUTLETS.map((outlet) => (
                  <div key={outlet.id} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{outlet.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{outlet.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {outlet.pumpsAvailable} Pumps • {outlet.serviceBays} Bays
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {outlet.isOpen24x7 ? 'Open 24x7' : 'Standard Hours'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DETAILS: WAREHOUSE */}
          {selectedNode === 'warehouse' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Central storage tanks and parts fulfillment centers maintaining buffer inventory for bowser fleets and garage mechanics.
              </p>
              <div className="space-y-2">
                {FULFILMENT_WAREHOUSES.map((wh) => (
                  <div key={wh.id} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{wh.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        City: {wh.city} • {wh.sparePartsSkus} Spare Parts SKUs
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-orange-400 font-mono block">
                        {wh.fuelStorageTanksLiters.toLocaleString()} / {wh.fuelCapacityLiters.toLocaleString()} L
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {wh.activeDispatchesToday} dispatches today
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Companion Driver App Sync Bridge Modal */}
      <CompanionSyncModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
      />
    </div>
  );
}
