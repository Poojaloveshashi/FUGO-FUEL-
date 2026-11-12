import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Clock, 
  MapPin, 
  User, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  Building2,
  FileText,
  PhoneCall,
  ShieldCheck,
  Radio,
  KeyRound
} from 'lucide-react';
import { getSupabaseClient, getLocalOrderById } from '../../services/supabase';
import { SupabaseOrderRecord } from '../../types';
import DriverDetailsView from '../Tracking/DriverDetailsView';

interface RepairTrackingProps {
  orderId?: string;
  onBack: () => void;
}

type RepairStatus = 'enroute' | 'warehouse_transfer' | 'warehouse_arrived' | 'vehicle_ready';

export default function RepairTracking({ orderId, onBack }: RepairTrackingProps) {
  const [order, setOrder] = useState<SupabaseOrderRecord | null>(null);
  const [childTransportOrder, setChildTransportOrder] = useState<SupabaseOrderRecord | null>(null);
  const [status, setStatus] = useState<RepairStatus>('enroute');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [loading, setLoading] = useState(true);

  // Map raw backend status to RepairTracking visual pipeline
  // pending -> enroute
  // transporting -> warehouse_transfer
  // warehouse & repairing -> warehouse_arrived
  // ready & completed -> vehicle_ready
  const mapBackendStatus = (rawStatus: string): RepairStatus => {
    const s = (rawStatus || '').toLowerCase();
    if (s === 'ready' || s === 'completed') {
      return 'vehicle_ready';
    }
    if (s === 'warehouse' || s === 'repairing' || s === 'diagnosing') {
      return 'warehouse_arrived';
    }
    if (s === 'transporting' || s === 'transferring') {
      return 'warehouse_transfer';
    }
    return 'enroute'; // 'pending' or default
  };

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const client = getSupabaseClient();
    let isMounted = true;

    // 1. Initial Load from Supabase or Local Storage
    const loadOrderData = async () => {
      // Check local first for immediate render
      const local = getLocalOrderById(orderId);
      if (local && isMounted) {
        setOrder(local);
        setStatus(mapBackendStatus(local.status));
      }

      if (client) {
        try {
          // Fetch the repair order
          const { data, error } = await client
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

          if (!error && data && isMounted) {
            setOrder(data);
            setStatus(mapBackendStatus(data.status));
          }

          // Fetch orders where parent_order_id = this id (if column exists)
          try {
            const { data: childOrders, error: childErr } = await client
              .from('orders')
              .select('*')
              .eq('parent_order_id', orderId);

            if (!childErr && childOrders && childOrders.length > 0 && isMounted) {
              const activeChild = childOrders.find(
                (o: any) => {
                  const cs = (o.status || '').toUpperCase();
                  return cs === 'PENDING' || cs === 'IN_TRANSIT' || cs === 'DISPATCHED';
                }
              );
              if (activeChild) {
                setChildTransportOrder(activeChild);
              }
            }
          } catch {
            // column parent_order_id may not exist in current schema
          }
        } catch (err) {
          console.warn('Error loading repair order from Supabase:', err);
        }
      }

      if (isMounted) setLoading(false);
    };

    loadOrderData();

    // 2. Realtime Subscriptions on Supabase orders table
    let channel: any = null;
    if (client) {
      try {
        channel = client
          .channel(`repair-track-${orderId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
              filter: `id=eq.${orderId}`,
            },
            (payload: any) => {
              if (!isMounted) return;
              const updated = payload.new;
              if (updated) {
                setOrder(updated);
                setStatus(mapBackendStatus(updated.status));
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
              filter: `parent_order_id=eq.${orderId}`,
            },
            (payload: any) => {
              if (!isMounted) return;
              const child = payload.new;
              if (child) {
                const cs = (child.status || '').toUpperCase();
                if (cs === 'PENDING' || cs === 'IN_TRANSIT' || cs === 'DISPATCHED') {
                  setChildTransportOrder(child);
                } else if (cs === 'COMPLETED' || cs === 'DELIVERED') {
                  setChildTransportOrder(null);
                }
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription failed:', err);
      }
    }

    return () => {
      isMounted = false;
      if (channel && client) {
        client.removeChannel(channel);
      }
    };
  }, [orderId]);

  // Countdown timer for ETA
  useEffect(() => {
    if (status === 'vehicle_ready') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 10 ? prev - 1 : 10));
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const steps = [
    { key: 'enroute', label: 'Technician Enroute', icon: User },
    { key: 'warehouse_transfer', label: 'Transporting', icon: Truck },
    { key: 'warehouse_arrived', label: 'In Workshop', icon: Building2 },
    { key: 'vehicle_ready', label: 'Vehicle Ready', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Repair Tracking</h1>
            {orderId && (
              <p className="text-[10px] font-mono text-slate-400">Order #{orderId}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
            Live Updates
          </span>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-32">
        {/* Child Order Driver Handshake OTP Card (Requirement 7) */}
        {childTransportOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-xl shadow-orange-500/20 flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-orange-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">
                  Transport Handshake OTP
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">Give this code to the driver</h3>
              <p className="text-xs text-orange-100">
                Vehicle towing driver #{childTransportOrder.id?.substring(0, 8)} has arrived
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <span className="font-mono text-2xl font-black tracking-[0.25em] pl-1">
                {childTransportOrder.handshake_otp || childTransportOrder.otp || '4821'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Assigned Tow Transport Driver Details View */}
        {childTransportOrder && (
          <DriverDetailsView
            isAssigned={Boolean(childTransportOrder.driver_id || childTransportOrder.status !== 'PENDING')}
            driver={{
              id: childTransportOrder.driver_id || 'drv_tow_transport',
              name: childTransportOrder.driver_name || 'Suresh Varma',
              phone: childTransportOrder.driver_phone || '+91 94401 23456',
              vehicleName: childTransportOrder.driver_vehicle || 'Ashok Leyland Flatbed Tow Carrier',
              vehiclePlate: childTransportOrder.vehicle_plate || 'TS 09 XY 9102',
              vehicleType: 'Heavy Flatbed Hydraulic Recovery Tow Carrier',
              rating: 4.95,
              tripsCount: 1420,
              speedKmh: childTransportOrder.driver_speed_kmh,
              statusText: 'Transporting vehicle safely to Central Depot'
            }}
          />
        )}

        {/* Status Pipeline Visual */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between relative">
            {/* Connector Lines */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100 -z-0" />
            <div 
              className="absolute top-5 left-8 h-0.5 bg-orange-500 transition-all duration-1000 -z-0" 
              style={{ 
                width: currentStepIndex <= 0 ? '0%' : currentStepIndex === 1 ? '33%' : currentStepIndex === 2 ? '66%' : '100%' 
              }}
            />

            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex || status === 'vehicle_ready';
              const isActive = step.key === status;
              
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors ${
                    isCompleted 
                      ? 'bg-orange-500 text-white' 
                      : isActive 
                      ? 'bg-slate-900 text-white ring-4 ring-slate-100' 
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-tight text-center ${
                    isActive ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Details for Each Realtime Status */}
        <AnimatePresence mode="wait">
          {/* Status 1: ENROUTE (mapped from 'pending') */}
          {status === 'enroute' && (
            <motion.div 
              key="enroute"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black mb-1">{formatTime(timeLeft)}</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">Technician En Route</p>
                  </div>
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <Clock className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
              </div>
              
              {/* Assigned Technician & Mobile Service Van Details View */}
              <DriverDetailsView
                isAssigned={true}
                driver={{
                  id: order?.driver_id || 'tech_vikram_82',
                  name: order?.driver_name || 'Vikram Singh',
                  phone: order?.driver_phone || '+91 98480 22334',
                  vehicleName: order?.vehicle_name || order?.driver_vehicle || 'Maruti Super Carry Mobile Workshop Van',
                  vehiclePlate: order?.vehicle_plate || 'TS 08 EM 3319',
                  vehicleType: 'Fully Equipped Mobile Diagnostic & Tool Unit',
                  rating: 4.98,
                  tripsCount: 1650,
                  statusText: 'Technician en route with diagnostic tools',
                  speedKmh: order?.driver_speed_kmh ?? 38,
                }}
              />

              {/* Real-time description info card */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Job Details</span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                    Realtime Sync
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {order?.description || 'Emergency Diagnostic & Inspection'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>{order?.address || 'Current Location'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status 2: WAREHOUSE TRANSFER (mapped from 'transporting') */}
          {status === 'warehouse_transfer' && (
            <motion.div 
              key="warehouse_transfer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-24 -mt-24" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-2xl">
                    <Truck className="w-10 h-10 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">Transporting to Workshop</h2>
                  <p className="text-sm text-indigo-100 font-medium">
                    Your vehicle is being safely towed to Fugo Central Workshop for advanced diagnostics.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Destination Hub</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    Madhapur Hub Depot
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">DLF Cyber City Central Depot</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Status 3: WAREHOUSE ARRIVED (mapped from 'warehouse' and 'repairing') */}
          {status === 'warehouse_arrived' && (
            <motion.div 
              key="warehouse_arrived"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 blur-3xl rounded-full" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-2xl">
                    <Building2 className="w-10 h-10 text-orange-400" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">Vehicle at Central Workshop</h2>
                  <p className="text-sm text-slate-300 font-medium">
                    Specialized technicians and hydraulic lift tools are actively resolving the issue.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Workshop Progress</span>
                  <span className="text-[10px] font-mono text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                    REPAIRING
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-slate-600 font-medium">Engine & Drivetrain Diagnostics</span>
                    <span className="text-emerald-600 font-bold">Completed</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="text-slate-600 font-medium">Parts Replacement & Assembly</span>
                    <span className="text-orange-500 font-bold animate-pulse">In Progress...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Status 4: VEHICLE READY (mapped from 'ready' and 'completed') */}
          {status === 'vehicle_ready' && (
            <motion.div 
              key="vehicle_ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-emerald-500/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-2xl">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-black mb-2">Vehicle Ready</h2>
                  <p className="text-sm text-emerald-100 font-medium">
                    All repairs and quality checks are complete! Your vehicle is ready for pickup or return delivery.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Quality Inspection Passed</h3>
                    <p className="text-xs text-slate-400">Covered with 6-month repair warranty</p>
                  </div>
                </div>
                <button
                  onClick={onBack}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all shadow-md active:scale-95"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Persistence Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between bg-slate-900 p-4 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                {order?.service_type || 'MAINTENANCE'}
              </p>
              <p className="text-xs font-black text-white capitalize">
                {status.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-white font-mono">
              {status === 'vehicle_ready' ? 'COMPLETED' : formatTime(timeLeft)}
            </p>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-none mt-1">
              Live State
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
