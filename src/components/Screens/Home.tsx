import { motion } from 'motion/react';
import { Fuel, Settings, ShoppingBag, Wrench, Navigation, Bell, MapPin, Search } from 'lucide-react';
import { Screen } from '../../types';

interface HomeProps {
  onNavigate: (screen: Screen) => void;
  userPhone: string;
}

export default function Home({ onNavigate }: HomeProps) {
  const categories = [
    { id: 'fuel', icon: Fuel, label: 'Fuel Up', color: 'bg-orange-500', desc: 'Petrol/Diesel' },
    { id: 'parts', icon: ShoppingBag, label: 'Spare Parts', color: 'bg-slate-900', desc: 'Engine/Body' },
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
        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell className="w-6 h-6 text-slate-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[10px] text-white flex items-center justify-center font-bold">2</span>
          </button>
          <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=fugo`} alt="avatar" />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Location Selector */}
        <section className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <MapPin className="text-orange-400 w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Delivering to</p>
              <h3 className="font-semibold text-sm truncate w-40">MG Road, Bangalore</h3>
            </div>
          </div>
          <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors">
            <Navigation className="w-5 h-5" />
          </button>
        </section>

        {/* Promo Banner */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-44 rounded-3xl overflow-hidden shadow-lg shadow-orange-100 group"
        >
          <img 
            src="https://picsum.photos/seed/delivery/800/600" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            alt="promo"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/90 via-orange-600/20 to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-white text-2xl font-bold leading-tight line-clamp-2">Get your first fuel delivery FREE!</h2>
            <p className="text-white/80 text-sm mt-1">Valid only for first 100 users today</p>
          </div>
        </motion.section>

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

        {/* Essential Items Section */}
        <section>
          <h2 className="font-bold text-lg mb-4">Emergency Essentials</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[160px] bg-white rounded-2xl border border-slate-100 p-3 shadow-sm shadow-slate-100">
                <div className="h-24 bg-slate-100 rounded-xl mb-3 overflow-hidden">
                  <img src={`https://picsum.photos/seed/item${i}/300/200`} className="w-full h-full object-cover" alt="item" referrerPolicy="no-referrer" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 truncate">Generic {i === 1 ? 'Oil' : i === 2 ? 'Mist' : 'Lube'}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-orange-600 font-bold text-sm">₹{i * 199}</span>
                  <button className="bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500">+</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-100 px-8 py-3 flex justify-between items-center z-20">
        <NavButton icon={Navigation} active />
        <NavButton icon={Search} />
        <div className="bg-orange-500 w-12 h-12 rounded-full -mt-10 flex items-center justify-center shadow-xl shadow-orange-300 border-4 border-white active:scale-90 transition-transform cursor-pointer" onClick={() => onNavigate('fuel')}>
          <Fuel className="text-white w-6 h-6" />
        </div>
        <NavButton icon={ShoppingBag} />
        <NavButton icon={Settings} />
      </nav>
    </div>
  );
}

function NavButton({ icon: Icon, active = false }: { icon: any; active?: boolean }) {
  return (
    <button className={`p-2 transition-colors ${active ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}>
      <Icon className="w-6 h-6" />
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
