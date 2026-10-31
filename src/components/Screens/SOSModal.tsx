import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  X, 
  Fuel, 
  Zap, 
  Wrench, 
  Truck, 
  MapPin, 
  ShieldAlert, 
  ArrowRight,
  Radio,
  Clock
} from 'lucide-react';
import { UserLocation } from '../../types';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSOS: (sosType: string, fuelType?: string, litres?: number) => Promise<void> | void;
  location: UserLocation;
}

const SOS_OPTIONS = [
  {
    id: 'fuel_dry',
    title: 'Emergency Fuel Rescue',
    desc: 'Ran out of fuel on the road • 10L dispatch',
    fuelType: 'Diesel (BS-VI)',
    litres: 10,
    icon: Fuel,
    color: 'bg-amber-500',
    badge: '10L Fuel Included',
  },
  {
    id: 'battery_dead',
    title: 'Battery Jumpstart & Swap',
    desc: 'Instant heavy-duty jumpstart or mobile swap',
    fuelType: 'Battery Jumpstart SOS',
    litres: 0,
    icon: Zap,
    color: 'bg-yellow-500',
    badge: 'Rapid Van',
  },
  {
    id: 'flat_tire',
    title: 'Flat Tire / Puncture SOS',
    desc: 'On-site tubeless puncture fix & spare swap',
    fuelType: 'Flat Tire Assistance',
    litres: 0,
    icon: Wrench,
    color: 'bg-blue-500',
    badge: '15m Arrival',
  },
  {
    id: 'breakdown_tow',
    title: 'Mechanical Breakdown SOS',
    desc: 'Engine overheating, clutch failure or flatbed tow',
    fuelType: 'Emergency Breakdown Rescue',
    litres: 0,
    icon: Truck,
    color: 'bg-red-500',
    badge: 'Priority Response',
  },
];

export default function SOSModal({ isOpen, onClose, onRequestSOS, location }: SOSModalProps) {
  const [selectedSos, setSelectedSos] = useState(SOS_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onRequestSOS(selectedSos.title, selectedSos.fuelType, selectedSos.litres);
      onClose();
    } catch (e) {
      console.error('SOS Request error', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-white w-full max-w-md rounded-t-[36px] sm:rounded-[36px] overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 p-6 text-white relative">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-5 right-5 p-2 bg-black/20 hover:bg-black/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                Priority Dispatch Network
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Request SOS Emergency</h2>
                <p className="text-xs text-white/80">Dispatches fastest mobile unit &lt; 15 mins</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Live GPS Dispatch Coordinates */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 border border-red-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Emergency Location
                    </span>
                    <span className="text-[9px] bg-red-500/20 text-red-400 font-mono font-bold px-1.5 py-0.2 rounded">
                      Live GPS
                    </span>
                  </div>
                  <h4 className="font-bold text-xs truncate max-w-[200px]">
                    {location.name}: {location.address}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Lat: {location.lat ?? 17.4125}° N • Lng: {location.lng ?? 78.3364}° E
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>15 Mins</span>
                </div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">ETA</span>
              </div>
            </div>

            {/* Emergency Type Selection */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">
                Select Breakdown Situation
              </label>
              <div className="space-y-2.5">
                {SOS_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = selectedSos.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedSos(opt)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center gap-3.5 transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50/50 shadow-md ring-2 ring-red-500/20'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${opt.color} text-white shadow`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{opt.title}</h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Supabase Realtime Pipeline Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-3">
              <Radio className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">Supabase Real-Time Pipeline: </span>
                Clicking <strong className="text-red-600 font-bold">Request SOS</strong> inserts record to{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">orders</code> with{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">status: 'PENDING'</code> and a 4-digit security OTP.
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 bg-white border-t border-slate-100 mt-auto">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`w-full py-4.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all ${
                isSubmitting
                  ? 'bg-slate-800 text-white cursor-wait'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Dispatching SOS Unit...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Request SOS (Immediate Dispatch)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
