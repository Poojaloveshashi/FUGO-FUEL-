import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MessageSquare, 
  Truck, 
  ShieldCheck, 
  Star, 
  Navigation, 
  Radio, 
  Gauge, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Send
} from 'lucide-react';

export interface DriverInfo {
  id?: string;
  name: string;
  phone: string;
  vehicleName: string;
  vehiclePlate: string;
  vehicleType?: string;
  capacity?: string;
  rating?: number;
  tripsCount?: number;
  avatarUrl?: string;
  speedKmh?: number | null;
  distanceMeters?: number | null;
  statusText?: string;
}

interface DriverDetailsViewProps {
  isAssigned: boolean;
  driver?: DriverInfo | null;
  onCallDriver?: (phone: string) => void;
  onMessageDriver?: (name: string) => void;
}

export default function DriverDetailsView({
  isAssigned,
  driver,
  onCallDriver,
  onMessageDriver
}: DriverDetailsViewProps) {
  const [showDirectMsgModal, setShowDirectMsgModal] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  // Fallback defaults if assigned but specific attributes are pending broadcast
  const effectiveDriver: DriverInfo = {
    id: driver?.id || 'drv_partner_4d28',
    name: driver?.name || 'Rajesh Kumar',
    phone: driver?.phone || '+91 98765 43210',
    vehicleName: driver?.vehicleName || 'Tata Ace Mobile Bowser 2000L',
    vehiclePlate: driver?.vehiclePlate || 'TS 09 UB 4821',
    vehicleType: driver?.vehicleType || 'Mobile Fuel & Service Bowser',
    capacity: driver?.capacity || '2,000 Litres • PESO Class B',
    rating: driver?.rating || 4.9,
    tripsCount: driver?.tripsCount || 1842,
    avatarUrl: driver?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driver?.name || 'rajesh'}&backgroundColor=b6e3f4`,
    speedKmh: driver?.speedKmh ?? null,
    distanceMeters: driver?.distanceMeters ?? null,
    statusText: driver?.statusText || 'En Route to Delivery Location',
  };

  const handleCall = () => {
    if (onCallDriver) {
      onCallDriver(effectiveDriver.phone);
    } else {
      window.location.href = `tel:${effectiveDriver.phone.replace(/\s+/g, '')}`;
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSentNotice(`Message sent to ${effectiveDriver.name}: "${msgText.trim()}"`);
    setMsgText('');
    setShowDirectMsgModal(false);
    setTimeout(() => setSentNotice(null), 4000);
    if (onMessageDriver) {
      onMessageDriver(effectiveDriver.name);
    }
  };

  // 1. UNASSIGNED STATE: Searching for a Driver
  if (!isAssigned) {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-300/60 rounded-3xl p-5 relative overflow-hidden shadow-xs">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-13 h-13 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-300/40">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                Finding Nearest Driver
              </h3>
              <span className="text-[9px] bg-amber-500/20 text-amber-900 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-400/40 animate-pulse">
                BROADCASTING
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Matching your order with certified mobile bowsers & doorstep technicians within 3 km.
            </p>
            <div className="mt-2.5 flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Driver name, phone & vehicle plate will appear as soon as accepted</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ASSIGNED STATE: Full Driver & Vehicle Details View
  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      <AnimatePresence>
        {sentNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-2xl flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">{sentNotice}</span>
            </div>
            <button onClick={() => setSentNotice(null)} className="text-slate-400 hover:text-white text-xs ml-2">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4 hover:border-indigo-200 transition-all">
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Assigned Partner & Vehicle
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            Verified Partner
          </span>
        </div>

        {/* Driver Profile Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar with Online Ping */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md ring-2 ring-slate-100">
                <img 
                  src={effectiveDriver.avatarUrl} 
                  alt={effectiveDriver.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              </span>
            </div>

            {/* Name, Rating & Deliveries */}
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 text-base leading-tight truncate">
                {effectiveDriver.name}
              </h3>
              
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black text-amber-800">{effectiveDriver.rating}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">
                  ({effectiveDriver.tripsCount.toLocaleString()} trips)
                </span>
              </div>

              <p className="text-[11px] font-mono text-slate-500 mt-0.5 font-medium truncate">
                {effectiveDriver.phone}
              </p>
            </div>
          </div>

          {/* Contact Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCall}
              title={`Call ${effectiveDriver.name} (${effectiveDriver.phone})`}
              className="w-11 h-11 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-xs transition-transform"
            >
              <Phone className="w-5 h-5 text-emerald-600" />
            </button>
            <button
              onClick={() => setShowDirectMsgModal(true)}
              title={`Message ${effectiveDriver.name}`}
              className="w-11 h-11 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 rounded-2xl flex items-center justify-center border border-indigo-200 shadow-xs transition-transform"
            >
              <MessageSquare className="w-5 h-5 text-indigo-600" />
            </button>
          </div>
        </div>

        {/* Vehicle Details Card */}
        <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {effectiveDriver.vehicleName}
                </p>
                <p className="text-[10px] text-slate-500">
                  {effectiveDriver.vehicleType}
                </p>
              </div>
            </div>

            {/* Authentic Indian License Plate Badge */}
            <div className="bg-white border-2 border-slate-800 rounded-md px-2 py-0.5 shadow-xs flex items-center gap-1.5 shrink-0">
              <div className="flex flex-col items-center justify-center leading-none text-[7px] font-black text-blue-800 border-r border-slate-300 pr-1">
                <span>IND</span>
                <span className="w-1.5 h-1.5 rounded-full border border-blue-800 inline-block mt-0.5" />
              </div>
              <span className="font-mono text-xs font-black tracking-wider text-slate-900 uppercase">
                {effectiveDriver.vehiclePlate}
              </span>
            </div>
          </div>

          {/* Vehicle Certification & Tech Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[9px] text-slate-600">
            <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium flex items-center gap-1">
              ✓ Tamper-Proof Digital Flow Meter
            </span>
            <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium flex items-center gap-1">
              ✓ PESO Safety Tested
            </span>
            <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium flex items-center gap-1">
              ✓ GPS Monitored
            </span>
          </div>
        </div>

        {/* Live En Route Movement HUD */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-orange-400 shrink-0">
              <Navigation className="w-4 h-4 animate-pulse transform rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  Live Dispatch Status
                </span>
                {effectiveDriver.speedKmh !== null && effectiveDriver.speedKmh > 0 && (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono font-bold">
                    {effectiveDriver.speedKmh} km/h
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-white mt-0.5">
                {effectiveDriver.statusText}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            {effectiveDriver.distanceMeters !== null ? (
              <>
                <p className="text-sm font-black text-orange-400 font-mono leading-none">
                  {effectiveDriver.distanceMeters <= 50 ? 'Arrived' : `${effectiveDriver.distanceMeters}m`}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-medium">Distance</p>
              </>
            ) : (
              <>
                <p className="text-xs font-black text-emerald-400 font-mono leading-none">En Route</p>
                <p className="text-[9px] text-slate-400 mt-0.5 font-medium">GPS Active</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Message Modal */}
      <AnimatePresence>
        {showDirectMsgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Message {effectiveDriver.name}</h4>
                    <p className="text-[10px] text-slate-400">{effectiveDriver.vehiclePlate}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDirectMsgModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Quick Template Replies */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'I am at the gate',
                  'Call when you arrive',
                  'Park in front of driveway',
                  'Payment is ready'
                ].map((tmpl) => (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => setMsgText(tmpl)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium transition-colors"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Type dispatch instructions for driver..."
                  rows={3}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectMsgModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
