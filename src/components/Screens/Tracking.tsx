import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Fuel, 
  Box, 
  Wrench, 
  Clock, 
  ThumbsUp, 
  ShieldCheck, 
  Database, 
  Radio, 
  Navigation2, 
  Gauge, 
  Terminal, 
  Play, 
  Pause, 
  FastForward, 
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Order, StreamEventLog, SupabaseOrderRecord } from '../../types';
import { 
  subscribeToOrderStream, 
  updateOrderStatus, 
  updateDriverLocation 
} from '../../services/supabase';

interface TrackingProps {
  order: Order | null;
  onBack: () => void;
}

function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const deltaP = ((lat2 - lat1) * Math.PI) / 180;
  const deltaL = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function Tracking({ order, onBack }: TrackingProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins default
  const [streamOrder, setStreamOrder] = useState<SupabaseOrderRecord | null>(null);
  const [status, setStatus] = useState<'processing' | 'dispatched' | 'nearby' | 'delivered'>('processing');
  
  // Realtime GPS telemetry
  const destLat = order?.delivery_lat ?? 17.4125;
  const destLng = order?.delivery_lng ?? 78.3364;
  const [driverLat, setDriverLat] = useState<number>(destLat + 0.0165);
  const [driverLng, setDriverLng] = useState<number>(destLng + 0.0142);
  const [driverSpeed, setDriverSpeed] = useState<number>(38);
  const [streamLogs, setStreamLogs] = useState<StreamEventLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isSimPaused, setIsSimPaused] = useState(false);

  // Subscribe to real-time Supabase stream matching user's Flutter/Dart pattern:
  // Supabase.instance.client.from('orders').stream(primaryKey: ['id']).eq('id', activeOrderId).listen(...)
  useEffect(() => {
    if (!order) return;

    const unsubscribe = subscribeToOrderStream(
      order.id,
      (updatedRecord, event) => {
        setStreamOrder(updatedRecord);
        
        if (updatedRecord.driver_lat !== undefined && updatedRecord.driver_lng !== undefined) {
          setDriverLat(updatedRecord.driver_lat);
          setDriverLng(updatedRecord.driver_lng);
        }
        if (updatedRecord.driver_speed_kmh !== undefined) {
          setDriverSpeed(updatedRecord.driver_speed_kmh);
        }

        // Map Supabase status to UI status
        if (updatedRecord.status === 'DELIVERED') {
          setStatus('delivered');
          setTimeLeft(0);
        } else if (updatedRecord.status === 'DISPATCHED') {
          // Check proximity
          const dist = calculateDistanceMeters(
            updatedRecord.driver_lat || destLat,
            updatedRecord.driver_lng || destLng,
            destLat,
            destLng
          );
          if (dist <= 300) {
            setStatus('nearby');
          } else {
            setStatus('dispatched');
          }
        } else {
          setStatus('processing');
        }

        if (event) {
          setStreamLogs(prev => [event, ...prev.slice(0, 19)]);
        }
      },
      {
        simulateProgress: !isSimPaused,
        speedMultiplier: simSpeed,
      }
    );

    return () => {
      unsubscribe();
    };
  }, [order?.id, isSimPaused, simSpeed, destLat, destLng]);

  // Countdown timer
  useEffect(() => {
    if (status === 'delivered') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 10 ? prev - 1 : 10));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  if (!order) return null;

  const currentProduct = order.items[0]?.product;
  const StatusIcon = currentProduct?.category === 'fuel' ? Fuel : currentProduct?.category === 'parts' ? Box : Wrench;

  const distanceMeters = calculateDistanceMeters(driverLat, driverLng, destLat, destLng);
  const initialDist = 2400; // ~2.4 km initial
  const progressRatio = Math.max(0, Math.min(1, 1 - distanceMeters / initialDist));

  // Compute map marker pixel coordinates along an aesthetic curved SVG track
  const svgWidth = 360;
  const svgHeight = 220;
  const startX = 50;
  const startY = 40;
  const endX = 310;
  const endY = 180;
  const currentX = startX + (endX - startX) * progressRatio;
  const currentY = startY + (endY - startY) * progressRatio - Math.sin(progressRatio * Math.PI) * 35;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSimulateArrived = () => {
    updateDriverLocation(order.id, destLat, destLng, 0);
    updateOrderStatus(order.id, 'DELIVERED');
  };

  const handleTogglePause = () => {
    setIsSimPaused(prev => !prev);
  };

  const cycleSpeed = () => {
    if (simSpeed === 1) setSimSpeed(2);
    else if (simSpeed === 2) setSimSpeed(4);
    else setSimSpeed(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Interactive Map & Realtime Stream Visualization */}
      <div className="h-80 bg-slate-900 relative overflow-hidden select-none">
        {/* Subtle Map Grid Backdrop */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Realtime Stream Live Badge */}
        <div className="absolute top-4 left-16 right-4 z-20 flex items-center justify-between">
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-300 uppercase">
              Supabase Realtime Stream
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleSpeed}
              title="Simulation speed"
              className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[10px] font-mono text-orange-400 font-bold hover:bg-black/80 flex items-center gap-1"
            >
              <FastForward className="w-3 h-3" />
              {simSpeed}x
            </button>
            <button
              onClick={handleTogglePause}
              title={isSimPaused ? "Resume Stream" : "Pause Stream"}
              className="bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-white hover:bg-black/80"
            >
              {isSimPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="absolute top-4 left-4 z-30 p-2.5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 text-white hover:bg-black/80 transition-colors shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Animated SVG GPS Route */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Planned Road Route */}
          <path
            d={`M ${startX} ${startY} Q ${svgWidth / 2} ${startY - 10}, ${endX} ${endY}`}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Active Traversed Route */}
          <path
            d={`M ${startX} ${startY} Q ${svgWidth / 2} ${startY - 10}, ${endX} ${endY}`}
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeDasharray="6 4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Depot Start Pin */}
          <circle cx={startX} cy={startY} r="5" fill="#f97316" />
          <text x={startX - 15} y={startY - 10} fill="#fdba74" fontSize="9" fontFamily="monospace">Depot</text>

          {/* Destination Delivery Pin */}
          <circle cx={endX} cy={endY} r="7" fill="#10b981" filter="url(#glow)" />
          <circle cx={endX} cy={endY} r="14" fill="#10b981" opacity="0.2" className="animate-ping" />
          <text x={endX - 35} y={endY + 18} fill="#6ee7b7" fontSize="9" fontWeight="bold" fontFamily="monospace">
            Delivery: {order.deliveryAddress.substring(0, 12)}
          </text>
        </svg>

        {/* Real-time Moving Driver Truck/Agent Marker */}
        <motion.div
          animate={{ x: currentX - 20, y: currentY - 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 80 }}
          className="absolute top-0 left-0 z-20 pointer-events-none"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/40 border-2 border-white flex items-center justify-center">
              <Navigation2 
                className="w-5 h-5 text-white transform rotate-45 transition-transform duration-300" 
              />
            </div>
            {/* Speed bubble */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/20 whitespace-nowrap shadow">
              {driverSpeed} km/h
            </div>
          </div>
        </motion.div>

        {/* Live GPS Telemetry Floating HUD */}
        <div className="absolute bottom-3 left-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Driver GPS Stream</span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold">
                  {distanceMeters <= 50 ? 'ARRIVED' : `${distanceMeters}m away`}
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-200">
                Lat: {driverLat.toFixed(4)} • Lng: {driverLng.toFixed(4)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1 text-[10px] font-mono bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-xl transition-colors border border-white/10"
          >
            <Terminal className="w-3 h-3 text-orange-400" />
            <span>{showLogs ? 'Hide Log' : 'Stream Log'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Stream Terminal Log (Collapsible) */}
      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black text-emerald-400 font-mono text-[11px] p-4 border-b border-slate-800 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1">
              <span>Flutter / Dart Stream packet listener</span>
              <span>ID: {order.id}</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              <div className="text-slate-400">
                &gt; Supabase.instance.client.from('orders').stream(primaryKey: ['id']).eq('id', '{order.id}').listen(...)
              </div>
              {streamLogs.map(log => (
                <div key={log.id} className="flex items-start gap-2 text-[10px] leading-tight">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className="text-orange-400 shrink-0">[{log.type}]</span>
                  <span className="text-slate-200">{log.message}</span>
                </div>
              ))}
              {streamLogs.length === 0 && (
                <div className="text-slate-500 italic">Listening for incoming PostgreSQL changes...</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Delivery Info Card */}
      <div className="flex-1 bg-white rounded-t-[36px] -mt-5 relative z-20 shadow-[0_-15px_30px_rgba(0,0,0,0.06)] p-6 flex flex-col space-y-5 pb-24">
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto" />

        {/* Time Left & Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {status === 'delivered' ? (
                <span className="text-emerald-600">Arrived</span>
              ) : (
                <>
                  {minutes}<span className="text-orange-500">:</span>{seconds < 10 ? `0${seconds}` : seconds}
                </>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {status === 'delivered' 
                ? 'Delivery completed successfully' 
                : `Estimated arrival at ${order.deliveryAddress}`}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
              status === 'delivered' 
                ? 'bg-emerald-100 text-emerald-700' 
                : status === 'nearby'
                ? 'bg-amber-100 text-amber-800 animate-pulse'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* Security OTP Card */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-xl shadow-orange-500/20 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-orange-100" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">Delivery Security OTP</span>
            </div>
            <p className="text-xs text-orange-100/90 font-medium">Share with delivery agent to unload</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-center">
            <span className="font-mono text-2xl font-black tracking-[0.25em] pl-1">
              {order.otp || '4821'}
            </span>
          </div>
        </section>

        {/* Supabase Order Payload & Stream Diagnostics */}
        <section className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-slate-200">Supabase Order Payload</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {order.synced_to_supabase ? 'Synced to Cloud' : 'Active Record'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel & Quantity</span>
              <span className="font-bold text-white">{order.fuel_type || 'Diesel'} • {order.litres || 100}L</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Customer ID</span>
              <span className="font-mono text-slate-300">{order.customer_id || 'cust_123'}</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 text-slate-400 text-[11px] font-mono pt-1 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dest: Lat {destLat.toFixed(4)}, Lng {destLng.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-300">
                <Navigation2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Live Driver: Lat {driverLat.toFixed(4)}, Lng {driverLng.toFixed(4)} ({driverSpeed} km/h)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Simulation Controls */}
        {status !== 'delivered' && (
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-xs font-medium text-slate-600">Simulate rapid arrival:</span>
            <button
              onClick={handleSimulateArrived}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Mark Delivered
            </button>
          </div>
        )}

        {/* Delivery Agent Card */}
        <section className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex items-center gap-4">
          <div className="w-13 h-13 bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-4 ring-slate-100 shrink-0">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=rahul" alt="agent" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 leading-none mb-1">Rahul Sharma</h3>
            <div className="flex items-center gap-1">
              <div className="flex text-orange-400">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">4.9 (2k+ trips)</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.open('tel:+919876543210')}
              className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button 
              onClick={() => alert('Message sent to agent: Rahul')}
              className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Progress Pipeline */}
        <section className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
            <div className="space-y-6 relative">
              <ProgressStep 
                title="Order Confirmed" 
                desc="Saved in Supabase orders table" 
                active={true} 
                completed={status !== 'processing'} 
              />
              <ProgressStep 
                title="Agent Dispatched" 
                desc="Rahul left depot with Diesel Bowser" 
                active={status !== 'processing'} 
                completed={status === 'nearby' || status === 'delivered'} 
              />
              <ProgressStep 
                title="Approaching Location" 
                desc="Driver is under 300m away" 
                active={status === 'nearby' || status === 'delivered'} 
                completed={status === 'delivered'} 
              />
              <ProgressStep 
                title="Fuel Dispensed & Complete" 
                desc="Delivery OTP verified and completed" 
                active={status === 'delivered'} 
                completed={status === 'delivered'} 
              />
            </div>
          </div>
        </section>

        {/* Delivery Completion Banner */}
        <AnimatePresence>
          {status === 'delivered' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500 text-white p-5 rounded-3xl flex items-center justify-between shadow-xl shadow-emerald-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base leading-none mb-1">Delivered!</h4>
                  <p className="text-white/80 text-xs">Diesel 100L delivered successfully</p>
                </div>
              </div>
              <button 
                onClick={onBack} 
                className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-lg"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] pt-2">
          Order ID: {order.id}
        </p>
      </div>
    </div>
  );
}

function ProgressStep({ title, desc, active, completed }: { title: string; desc: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-start gap-5 relative">
      <div className={`w-8 h-8 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-colors ${
        completed ? 'bg-emerald-500' : active ? 'bg-orange-500 animate-pulse' : 'bg-slate-200'
      }`}>
        {completed && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {!completed && active && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <div className={`flex-1 transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>
        <h4 className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</h4>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
