import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Package, 
  Calendar, 
  ChevronRight, 
  Fuel, 
  Wrench, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  IndianRupee,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAllOrders, fetchMyOtp } from '../../services/supabase';
import { SupabaseOrderRecord, Order } from '../../types';

interface OrderHistoryProps {
  onBack: () => void;
  customerId?: string;
  onSelectOrder?: (order: SupabaseOrderRecord) => void;
}

export default function OrderHistory({ onBack, customerId, onSelectOrder }: OrderHistoryProps) {
  const [orders, setOrders] = useState<SupabaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [otps, setOtps] = useState<Record<string, string>>({});
  const [loadingOtpFor, setLoadingOtpFor] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrders(customerId);
      setOrders(res.orders);

      // Auto-fetch OTPs for transport orders (VEHICLE_PICKUP and VEHICLE_RETURN) if not present locally
      for (const ord of res.orders) {
        if (ord.service_type === 'TRANSPORT' || ord.job_kind === 'VEHICLE_PICKUP' || ord.job_kind === 'VEHICLE_RETURN') {
          if (ord.otp) {
            setOtps(prev => ({ ...prev, [ord.id]: ord.otp }));
          } else if (customerId || ord.customer_id) {
            fetchMyOtp(ord.id, customerId || ord.customer_id || '').then(code => {
              if (code) {
                setOtps(prev => ({ ...prev, [ord.id]: code }));
              }
            });
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [customerId]);

  const handleRevealOtp = async (orderId: string, orderCustomerId?: string) => {
    setLoadingOtpFor(orderId);
    try {
      const code = await fetchMyOtp(orderId, orderCustomerId || customerId || '');
      if (code) {
        setOtps(prev => ({ ...prev, [orderId]: code }));
      }
    } finally {
      setLoadingOtpFor(null);
    }
  };

  const getIcon = (order: SupabaseOrderRecord) => {
    if (order.service_type === 'TRANSPORT') return Truck;
    if (order.service_type === 'REPAIR') return Wrench;
    if (order.service_type === 'PARTS') return ShoppingBag;
    return Fuel;
  };

  const getColor = (order: SupabaseOrderRecord) => {
    if (order.service_type === 'TRANSPORT') return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    if (order.service_type === 'REPAIR') return 'text-purple-600 bg-purple-50 border-purple-100';
    if (order.service_type === 'PARTS') return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-orange-600 bg-orange-50 border-orange-100';
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">My Orders</h1>
            <p className="text-[11px] text-slate-400 font-mono">
              {customerId ? `Customer ID: ${customerId}` : 'All Bookings'}
            </p>
          </div>
        </div>

        <button 
          onClick={loadOrders}
          className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
          title="Refresh orders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
        </button>
      </header>

      <div className="flex-1 p-4 space-y-3">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs text-slate-400 font-medium">Loading your orders from Supabase...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-1">No orders yet</h2>
            <p className="text-xs text-slate-400 max-w-xs">
              Orders you place for fuel, vehicle pickup, repair, or parts will appear here.
            </p>
          </div>
        ) : (
          orders.map((order, idx) => {
            const Icon = getIcon(order);
            const colorClass = getColor(order);
            const isTransport = order.service_type === 'TRANSPORT';
            const isReturnJob = order.job_kind === 'VEHICLE_RETURN';
            const isPickupJob = order.job_kind === 'VEHICLE_PICKUP';
            const currentOtp = otps[order.id] || order.otp || order.handshake_otp;

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                key={order.id}
                className="w-full bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs hover:border-orange-300 transition-all space-y-3"
              >
                {/* Top Header */}
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center shrink-0 border`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 truncate">
                        {order.id}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        order.status === 'COMPLETED' || order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : order.status === 'IN_TRANSIT' || order.status === 'DISPATCHED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.status || 'PENDING'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {order.fuel_type || order.description || order.service_type}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span>{formatDate(order.created_at)}</span>
                      {order.payment_method && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">{order.payment_method}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount Section */}
                <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between text-xs border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      {isReturnJob ? 'Amount to Pay at Return' : 'Total Amount'}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{order.total_amount || order.price || 0}
                    </span>
                  </div>

                  {/* Delivery OTP Badge for Transport or Orders with OTP */}
                  {(isTransport || currentOtp) && (
                    <div className="flex items-center gap-2">
                      {currentOtp ? (
                        <div className="bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl text-right">
                          <span className="text-[9px] font-bold text-orange-600 uppercase block tracking-wider">
                            Delivery Code
                          </span>
                          <span className="font-mono text-sm font-black text-orange-700 tracking-widest">
                            {currentOtp}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRevealOtp(order.id, order.customer_id)}
                          disabled={loadingOtpFor === order.id}
                          className="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>{loadingOtpFor === order.id ? 'Fetching...' : 'Show Code'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Return Job Payment Notice */}
                {isReturnJob && (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Driver collects ₹{order.total_amount || 0} for the repair bill before hand-off.
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
