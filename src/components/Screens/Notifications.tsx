import { ChevronLeft, Bell, Fuel, Package, Tag, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface NotificationsProps {
  onBack: () => void;
}

export default function Notifications({ onBack }: NotificationsProps) {
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Delivered!',
      message: 'Your fuel delivery #ORD-XY23 has been successfully completed.',
      time: '2 mins ago',
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50',
      unread: true
    },
    {
      id: 2,
      type: 'promo',
      title: 'Weekend Special Offer',
      message: 'Get ₹150 off on your next high-speed diesel booking. Use code: WEEKEND150',
      time: '1 hour ago',
      icon: Tag,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      unread: true
    },
    {
      id: 3,
      type: 'update',
      title: 'Nearby Station Restocked',
      message: 'MG Road Station is now fully restocked with Premium Petrol.',
      time: '3 hours ago',
      icon: Fuel,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
      unread: false
    },
    {
      id: 4,
      type: 'order',
      title: 'Flash Sale: Engine Oils',
      message: 'Flat 20% off on all lubricant and engine oil brands for the next 24 hours.',
      time: '5 hours ago',
      icon: Package,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
      unread: false
    },
    {
      id: 5,
      type: 'system',
      title: 'Scheduled Maintenance',
      message: 'Our app will be down for maintenance from 2 AM to 4 AM tonight.',
      time: 'Yesterday',
      icon: Clock,
      color: 'text-slate-500',
      bg: 'bg-slate-50',
      unread: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Notifications</h1>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 px-3 py-1 bg-orange-50 rounded-full transition-colors">
          Mark all as read
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">No notifications yet</h2>
            <p className="text-sm text-slate-400">We'll notify you when something important happens regarding your orders or repairs.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((notification, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={notification.id}
                className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${notification.unread ? 'bg-orange-50/20' : ''}`}
              >
                {notification.unread && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                )}
                <div className={`w-12 h-12 ${notification.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                  <notification.icon className={`w-6 h-6 ${notification.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm ${notification.unread ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">{notification.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {notification.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Showing Last 30 Days</p>
      </div>
    </div>
  );
}
