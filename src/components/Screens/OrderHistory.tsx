import { ChevronLeft, Package, Calendar, ChevronRight, Fuel, Wrench, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderHistoryProps {
  onBack: () => void;
}

export default function OrderHistory({ onBack }: OrderHistoryProps) {
  const pastOrders = [
    {
      id: 'ORD-98241',
      date: 'Oct 12, 2023',
      total: 2450,
      status: 'delivered',
      itemsCount: 2,
      type: 'fuel'
    },
    {
      id: 'ORD-97102',
      date: 'Sep 28, 2023',
      total: 890,
      status: 'delivered',
      itemsCount: 1,
      type: 'parts'
    },
    {
      id: 'ORD-96554',
      date: 'Sep 15, 2023',
      total: 1200,
      status: 'delivered',
      itemsCount: 3,
      type: 'fuel'
    },
    {
      id: 'ORD-95221',
      date: 'Aug 30, 2023',
      total: 4500,
      status: 'delivered',
      itemsCount: 1,
      type: 'service'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'fuel': return Fuel;
      case 'parts': return ShoppingBag;
      case 'service': return Wrench;
      default: return Package;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'fuel': return 'text-orange-500 bg-orange-50';
      case 'parts': return 'text-blue-500 bg-blue-50';
      case 'service': return 'text-purple-500 bg-purple-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Order History</h1>
      </header>

      <div className="flex-1 p-6 space-y-4">
        {pastOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Package className="w-8 h-8 text-slate-200" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">No orders yet</h2>
            <p className="text-sm text-slate-400">Your past orders will appear here.</p>
          </div>
        ) : (
          pastOrders.map((order, idx) => {
            const Icon = getIcon(order.type);
            const colorClass = getColor(order.type);
            
            return (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={order.id}
                className="w-full bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-orange-200 transition-colors group"
              >
                <div className={`w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon className="w-7 h-7" />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.id}</span>
                    <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase">Delivered</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">
                    {order.itemsCount} {order.itemsCount === 1 ? 'Item' : 'Items'} • ₹{order.total.toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-medium text-slate-400">{order.date}</span>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
              </motion.button>
            );
          })
        )}
      </div>

      <div className="p-6 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Showing orders from last 6 months</p>
      </div>
    </div>
  );
}
