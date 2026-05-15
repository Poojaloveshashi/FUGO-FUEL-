import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MapPin, Phone, MessageSquare, Fuel, Box, Wrench, Clock, ThumbsUp } from 'lucide-react';
import { Order } from '../../types';

interface TrackingProps {
  order: Order | null;
  onBack: () => void;
}

export default function Tracking({ order, onBack }: TrackingProps) {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'processing' | 'dispatched' | 'nearby' | 'delivered'>('processing');

  useEffect(() => {
    if (!order) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setProgress((prev) => (prev < 100 ? prev + 0.1 : 100));
    }, 1000);

    // Simulated status updates
    const statusTimers = [
      setTimeout(() => setStatus('dispatched'), 5000),
      setTimeout(() => setStatus('nearby'), 20000),
      setTimeout(() => setStatus('delivered'), 45000), // Speeded up for demo
    ];

    return () => {
      clearInterval(timer);
      statusTimers.forEach(t => clearTimeout(t));
    };
  }, [order]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!order) return null;

  const currentProduct = order.items[0]?.product;
  const StatusIcon = currentProduct?.category === 'fuel' ? Fuel : currentProduct?.category === 'parts' ? Box : Wrench;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Map Backdrop Simulator */}
      <div className="h-2/5 bg-slate-200 relative overflow-hidden group">
         <img 
            src="https://picsum.photos/seed/map/800/1200?blur=1" 
            className="w-full h-full object-cover scale-150 animate-pulse" 
            alt="map" 
            referrerPolicy="no-referrer"
         />
         <div className="absolute inset-0 bg-slate-900/10" />
         
         {/* Simulated Route */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
           <path d="M100 400 L200 300 L300 350 L400 200" stroke="orange" strokeWidth="4" fill="none" strokeDasharray="10 10" />
         </svg>

         {/* Markers */}
         <motion.div 
           initial={{ y: -500 }}
           animate={{ y: 200, x: status === 'nearby' ? 300 : status === 'delivered' ? 350 : 200 }}
           className="absolute top-0 left-0 bg-slate-900 p-2 rounded-2xl shadow-2xl z-10"
         >
            <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
               <StatusIcon className="text-white w-5 h-5 animate-bounce" />
            </div>
         </motion.div>

         <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Live Delivery Agent</span>
         </div>

         <button 
           onClick={onBack} 
           className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white hover:bg-white transition-colors"
         >
            <ChevronLeft className="w-6 h-6 text-slate-900" />
         </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 -mt-10 bg-white rounded-t-[40px] relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] p-8 flex flex-col">
         {/* Handle for UI feel */}
         <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />

         <div className="flex items-center justify-between mb-8">
            <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {minutes}<span className="text-orange-500">:</span>{seconds < 10 ? `0${seconds}` : seconds}
               </h2>
               <p className="text-sm text-slate-400 font-medium">Estimated Arrival Time ({(order.distance * 1000).toFixed(0)}m away)</p>
            </div>
            <div className="text-right">
               <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
                 status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
               }`}>
                 {status}
               </span>
            </div>
         </div>

         {/* Delivery Agent Card */}
         <section className="bg-slate-50 border border-slate-100 p-5 rounded-3xl flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-4 ring-slate-100">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=rahul" alt="agent" />
            </div>
            <div className="flex-1">
               <h3 className="font-bold text-slate-800 leading-none mb-1">Rahul Sharma</h3>
               <div className="flex items-center gap-1">
                  <div className="flex text-orange-400">
                     {[1,2,3,4,5].map(i => <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">4.9 (2k+ trips)</span>
               </div>
            </div>
            <div className="flex gap-2">
               <button className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors">
                  <Phone className="w-5 h-5" />
               </button>
               <button className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
                  <MessageSquare className="w-5 h-5" />
               </button>
            </div>
         </section>

         {/* Progress Pipeline */}
         <section className="space-y-6 flex-1">
            <div className="relative">
               <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
               <div className="space-y-8 relative">
                  <ProgressStep 
                    title="Order Confirmed" 
                    desc="We've received your request" 
                    active={true} 
                    completed={status !== 'processing'} 
                  />
                  <ProgressStep 
                    title="Agent Dispatched" 
                    desc="Rahul left Fugo Express MG Road" 
                    active={status !== 'processing'} 
                    completed={status === 'nearby' || status === 'delivered'} 
                  />
                  <ProgressStep 
                    title="Nearby" 
                    desc="Rahul is 200m away" 
                    active={status === 'nearby' || status === 'delivered'} 
                    completed={status === 'delivered'} 
                  />
               </div>
            </div>
         </section>
         
         <AnimatePresence>
            {status === 'delivered' && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-green-500 text-white p-6 rounded-[32px] flex items-center justify-between shadow-xl shadow-green-100"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                       <ThumbsUp className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="font-bold text-lg leading-none mb-1">Delivered!</h4>
                       <p className="text-white/80 text-xs">Hope you're happy with us</p>
                    </div>
                 </div>
                 <button onClick={onBack} className="bg-white text-green-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-lg">Rate Experience</button>
              </motion.div>
            )}
         </AnimatePresence>

         <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] mt-auto pt-6">Order ID: {order.id}</p>
      </div>
    </div>
  );
}

function ProgressStep({ title, desc, active, completed }: { title: string; desc: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-start gap-6 relative">
       <div className={`w-8 h-8 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-colors ${
         completed ? 'bg-green-500' : active ? 'bg-orange-500 animate-pulse' : 'bg-slate-200'
       }`}>
          {completed && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          {!completed && active && <div className="w-2 h-2 bg-white rounded-full" />}
       </div>
       <div className={`flex-1 transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>
          <h4 className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</h4>
          <p className="text-xs text-slate-400">{desc}</p>
       </div>
    </div>
  );
}
