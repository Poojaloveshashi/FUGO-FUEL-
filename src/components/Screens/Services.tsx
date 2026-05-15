import { ChevronLeft, Wrench, Shield, Zap, Droplets, MapPin, Clock, Star, PhoneCall } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../../types';

interface ServicesProps {
  onBack: () => void;
  products: Product[];
  onAddToCart: (p: Product, q: number) => void;
  onGoToCheckout: () => void;
}

export default function Services({ onBack, products, onAddToCart, onGoToCheckout }: ServicesProps) {
  const handleBook = (p: Product) => {
    onAddToCart(p, 1);
    onGoToCheckout();
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'jumpstart': return Zap;
      case 'puncture': return Wrench;
      case 'wash': return Droplets;
      default: return Wrench;
    }
  };

  const getColor = (id: string) => {
     switch (id) {
      case 'jumpstart': return 'text-yellow-500 bg-yellow-50';
      case 'puncture': return 'text-blue-500 bg-blue-50';
      case 'wash': return 'text-cyan-500 bg-cyan-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Emergency Services</h1>
        </div>
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-600" />
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {/* Banner */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Need immediate help?</h2>
            <p className="text-sm text-slate-400 mb-6 max-w-[200px]">Our experts reach you in under 15 minutes anywhere in Hyderabad.</p>
            <button className="bg-white text-slate-900 px-6 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 active:scale-95 transition-transform">
              <PhoneCall className="w-3.5 h-3.5" />
              Call Support
            </button>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-10 -right-10 opacity-10"
          >
            <Wrench className="w-40 h-40" />
          </motion.div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Available Services</h3>
          
          {products.map((service, idx) => {
            const Icon = getIcon(service.id);
            const colorClass = getColor(service.id);
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={service.id}
                className="bg-white p-5 rounded-[2.2rem] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-orange-200 transition-colors"
              >
                <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 truncate">{service.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                      <span className="text-[10px] font-bold text-slate-400">4.9</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mb-3 line-clamp-1">{service.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400">15m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400">Near you</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">₹{service.price}</p>
                    </div>
                  </div>
                </div>

                <div className="h-20 w-[1px] bg-slate-50 mx-1" />

                <button 
                  onClick={() => handleBook(service)}
                  className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-slate-100"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 text-center">
            <h5 className="text-[9px] font-black uppercase tracking-widest text-orange-600 mb-1">Verified Expert</h5>
            <p className="text-[10px] text-orange-500 font-medium">BG checked professionals</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 text-center">
            <h5 className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">Live Tracking</h5>
            <p className="text-[10px] text-blue-500 font-medium">Real-time ETA updates</p>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-6 text-center">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-loose">
          Secure cashless payments. Satisfaction guaranteed.<br/>
          Part of Fugo Premium Assistance.
        </p>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
    </svg>
  );
}
