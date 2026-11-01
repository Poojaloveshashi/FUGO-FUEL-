import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Truck, 
  Database, 
  Layers, 
  RefreshCw, 
  Copy, 
  Check, 
  Play, 
  Sparkles,
  ShieldCheck,
  Smartphone,
  Zap,
  Activity
} from 'lucide-react';
import { 
  companionSync, 
  COMPANION_APP_URL, 
  COMPANION_APP_ID, 
  CURRENT_APP_ID 
} from '../../services/companionSync';
import { updateOrderStatus, updateDriverLocation, getLocalOrders } from '../../services/supabase';
import { SupabaseOrderRecord } from '../../types';

interface CompanionSyncModalProps {
  isOpen: boolean;
  activeOrderId?: string;
  onClose: () => void;
}

export default function CompanionSyncModal({
  isOpen,
  activeOrderId,
  onClose,
}: CompanionSyncModalProps) {
  const [isConnected, setIsConnected] = useState(companionSync.isConnected());
  const [lastHeartbeat, setLastHeartbeat] = useState(companionSync.getLastHeartbeat());
  const [isPinging, setIsPinging] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [recentEvents, setRecentEvents] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<SupabaseOrderRecord | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Check current orders
    const orders = getLocalOrders();
    const curr = (activeOrderId ? orders.find(o => o.id === activeOrderId) : null) || orders[0] || null;
    setActiveOrder(curr);

    const updateStatus = () => {
      setIsConnected(companionSync.isConnected());
      setLastHeartbeat(companionSync.getLastHeartbeat());
    };

    const interval = setInterval(updateStatus, 1500);

    const unsubscribe = companionSync.subscribe((msg) => {
      updateStatus();
      const timeStr = new Date(msg.timestamp).toLocaleTimeString();
      setRecentEvents(prev => [
        `[${timeStr}] ${msg.type} from ${msg.sourceAppId.slice(0, 8)}: ${msg.message || ''}`,
        ...prev.slice(0, 7)
      ]);
      if (msg.orderId && activeOrder && msg.orderId === activeOrder.id) {
        const refreshed = getLocalOrders().find(o => o.id === msg.orderId);
        if (refreshed) setActiveOrder(refreshed);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [isOpen, activeOrderId]);

  if (!isOpen) return null;

  const handlePing = () => {
    setIsPinging(true);
    companionSync.sendPing();
    setTimeout(() => {
      setIsPinging(false);
      setIsConnected(companionSync.isConnected());
      setLastHeartbeat(companionSync.getLastHeartbeat());
    }, 600);
  };

  const handleOpenCompanion = () => {
    companionSync.openCompanionApp();
  };

  const handleCopyPrompt = () => {
    const promptText = `Connect this app to our live Supabase database. Use @supabase/supabase-js. Use YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY. When an order is placed, insert it into the orders table with status 'PENDING', generate a 4-digit OTP, and subscribe to real-time changes on that order. Connect with customer app: https://ai.studio/apps/${CURRENT_APP_ID}`;
    navigator.clipboard?.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(COMPANION_APP_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Simulation controls to test bidirectional sync
  const handleDriverAccept = () => {
    if (!activeOrder) return;
    updateOrderStatus(activeOrder.id, 'DISPATCHED');
    companionSync.broadcast({
      type: 'ORDER_ACCEPTED',
      orderId: activeOrder.id,
      status: 'DISPATCHED',
      message: `Driver partner accepted order #${activeOrder.id}`,
    });
  };

  const handleDriverMove = () => {
    if (!activeOrder) return;
    const destLat = activeOrder.delivery_lat || 17.4125;
    const destLng = activeOrder.delivery_lng || 78.3364;
    // Step closer
    const nextLat = Number(((activeOrder.driver_lat || destLat + 0.01) - 0.003).toFixed(6));
    const nextLng = Number(((activeOrder.driver_lng || destLng + 0.01) - 0.002).toFixed(6));
    updateDriverLocation(activeOrder.id, nextLat, nextLng, 44);
    companionSync.broadcast({
      type: 'DRIVER_LOCATION_UPDATE',
      orderId: activeOrder.id,
      driver_lat: nextLat,
      driver_lng: nextLng,
      speed_kmh: 44,
      message: `Bowser in transit to destination (${nextLat}, ${nextLng})`,
    });
  };

  const handleDriverDeliver = () => {
    if (!activeOrder) return;
    updateOrderStatus(activeOrder.id, 'DELIVERED');
    companionSync.broadcast({
      type: 'DELIVERY_COMPLETED',
      orderId: activeOrder.id,
      status: 'DELIVERED',
      message: `Fuel dispensed successfully. OTP verified: ${activeOrder.otp}`,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-900/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                  <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Companion Driver App Realtime Bridge
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                      Live
                    </span>
                  </h3>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Target: {COMPANION_APP_ID.slice(0, 16)}...
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target App Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="truncate">
                <span className="text-[9px] text-indigo-300 uppercase tracking-widest block font-bold">
                  Sister Driver App Link
                </span>
                <span className="font-mono text-slate-200 text-[11px] truncate block max-w-xs">
                  {COMPANION_APP_URL}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCompanion}
                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Launch Driver App</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Sync Matrix */}
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Live Status Indicators */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-bold text-slate-700">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  Supabase
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block">
                  Live Postgres
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-bold text-slate-700">
                  <Radio className="w-3.5 h-3.5 text-indigo-600" />
                  Broadcast
                </div>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 inline-block">
                  Channel Active
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                <div className="flex items-center justify-center gap-1.5 mb-1 text-[11px] font-bold text-slate-700">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Tab Bridge
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                  isConnected 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {isConnected ? 'Paired Tab' : 'Standby'}
                </span>
              </div>
            </div>

            {/* Heartbeat & Action bar */}
            <div className="flex items-center justify-between p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'}`} />
                <span className="font-semibold text-slate-800">
                  {isConnected ? 'Driver App Connected in Realtime' : 'Waiting for Driver App PING (open both tabs to test)'}
                </span>
              </div>
              <button
                type="button"
                onClick={handlePing}
                disabled={isPinging}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin text-indigo-600' : ''}`} />
                <span>Ping</span>
              </button>
            </div>

            {/* Remote Bowser Driver Simulator Controls */}
            {activeOrder && (
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-slate-800">
                      Active Order Simulator: {activeOrder.id}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    OTP: {activeOrder.otp}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  You can trigger driver partner responses directly here to test live updates, or perform them in the companion tab!
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDriverAccept}
                    className="p-2 bg-white hover:bg-slate-100 active:scale-95 border border-slate-300 rounded-xl text-[10px] font-bold text-slate-800 text-center shadow-sm transition-all"
                  >
                    1. Accept & Dispatch
                  </button>

                  <button
                    type="button"
                    onClick={handleDriverMove}
                    className="p-2 bg-white hover:bg-slate-100 active:scale-95 border border-slate-300 rounded-xl text-[10px] font-bold text-slate-800 text-center shadow-sm transition-all"
                  >
                    2. Drive Closer
                  </button>

                  <button
                    type="button"
                    onClick={handleDriverDeliver}
                    className="p-2 bg-white hover:bg-slate-100 active:scale-95 border border-slate-300 rounded-xl text-[10px] font-bold text-emerald-800 text-center shadow-sm transition-all"
                  >
                    3. Verify OTP & Finish
                  </button>
                </div>
              </div>
            )}

            {/* Copy synchronization prompt for companion app */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-400" />
                  Companion App Sync Prompt
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
                >
                  {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrompt ? 'Copied to Clipboard' : 'Copy Prompt'}</span>
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-300 bg-black/40 p-2.5 rounded-xl leading-relaxed border border-white/5">
                Connect this app to our live Supabase database. Use @supabase/supabase-js. Use YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY. When an order is placed, insert it into the orders table with status 'PENDING', generate a 4-digit OTP, and subscribe to real-time changes on that order.
              </p>
            </div>

            {/* Event Activity Log */}
            {recentEvents.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                  Inter-App Event Telemetry
                </span>
                <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] p-2.5 rounded-xl space-y-1 max-h-24 overflow-y-auto">
                  {recentEvents.map((ev, i) => (
                    <div key={i} className="truncate">{ev}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
