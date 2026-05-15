import { ChevronLeft, TrendingUp, TrendingDown, Clock, MapPin, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface FuelPricesProps {
  onBack: () => void;
}

export default function FuelPrices({ onBack }: FuelPricesProps) {
  const [activeCity, setActiveCity] = useState('Hyderabad');

  const cityPrices = [
    { city: 'Hyderabad', petrol: 109.66, diesel: 97.82, trend: 'up' },
    { city: 'Bangalore', petrol: 101.94, diesel: 87.89, trend: 'down' },
    { city: 'Mumbai', petrol: 106.31, diesel: 94.27, trend: 'up' },
    { city: 'Delhi', petrol: 96.72, diesel: 89.62, trend: 'stable' },
    { city: 'Chennai', petrol: 102.63, diesel: 94.24, trend: 'down' },
  ];

  const historicalData = [
    { day: 'Mon', price: 108.5 },
    { day: 'Tue', price: 108.8 },
    { day: 'Wed', price: 109.2 },
    { day: 'Thu', price: 109.4 },
    { day: 'Fri', price: 109.66 },
  ];

  const currentPrices = cityPrices.find(c => c.city === activeCity) || cityPrices[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Live Fuel Prices</h1>
        </div>
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
        </div>
      </header>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto pb-24">
        {/* Search/City Selector */}
        <section className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search city prices..."
            className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-orange-500 transition-all outline-none"
          />
        </section>

        {/* Selected City Price Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
               <MapPin className="w-4 h-4 text-orange-500" />
               <h2 className="text-sm font-bold text-slate-800">{activeCity}</h2>
            </div>
            <div className="flex items-center gap-1.5">
               <Clock className="w-3.5 h-3.5 text-slate-300" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updated 2m ago</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <motion.div 
               whileHover={{ y: -5 }}
               className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
             >
                <div className={`absolute top-0 right-0 w-16 h-16 ${currentPrices.trend === 'up' ? 'bg-red-50' : 'bg-green-50'} rounded-bl-[2.5rem] flex items-center justify-center`}>
                    {currentPrices.trend === 'up' ? <TrendingUp className="w-5 h-5 text-red-500" /> : <TrendingDown className="w-5 h-5 text-green-500" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Petrol</p>
                <h3 className="text-2xl font-black text-slate-900">₹{currentPrices.petrol}</h3>
                <p className={`text-[10px] font-bold mt-2 ${currentPrices.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                  {currentPrices.trend === 'up' ? '+₹0.15' : '-₹0.22'} 
                  <span className="text-slate-300 ml-1">Today</span>
                </p>
             </motion.div>

             <motion.div 
               whileHover={{ y: -5 }}
               className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
             >
                <div className={`absolute top-0 right-0 w-16 h-16 ${currentPrices.trend === 'up' ? 'bg-red-50' : 'bg-green-50'} rounded-bl-[2.5rem] flex items-center justify-center`}>
                     {currentPrices.trend === 'up' ? <TrendingUp className="w-5 h-5 text-red-500" /> : <TrendingDown className="w-5 h-5 text-green-500" />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Diesel</p>
                <h3 className="text-2xl font-black text-slate-900">₹{currentPrices.diesel}</h3>
                <p className={`text-[10px] font-bold mt-2 ${currentPrices.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                  {currentPrices.trend === 'up' ? '+₹0.08' : '-₹0.12'} 
                  <span className="text-slate-300 ml-1">Today</span>
                </p>
             </motion.div>
          </div>
        </section>

        {/* Charts / Trends */}
        <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 overflow-hidden relative">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold">Price Trend</h3>
                <p className="text-xs text-slate-400">Last 5 days in {activeCity}</p>
              </div>
              <div className="flex gap-1">
                {['P', 'D'].map(m => (
                  <button key={m} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors ${m === 'P' ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                    {m}
                  </button>
                ))}
              </div>
           </div>

           <div className="flex items-end justify-between h-32 gap-3">
              {historicalData.map((d, i) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-3">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${(d.price - 100) * 8}px` }}
                     className="w-full bg-gradient-to-t from-orange-600 to-orange-400 rounded-lg min-h-[40px]"
                   />
                   <span className="text-[10px] font-bold text-slate-500">{d.day}</span>
                </div>
              ))}
           </div>
        </section>

        {/* Other Cities */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Major Cities</h3>
          <div className="grid grid-cols-1 gap-3">
            {cityPrices.map(cp => (
              <button
                key={cp.city}
                onClick={() => setActiveCity(cp.city)}
                className={`p-5 rounded-3xl border transition-all flex items-center justify-between shadow-sm ${
                  activeCity === cp.city 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 ${cp.trend === 'up' ? 'bg-red-50 text-red-500' : cp.trend === 'down' ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-500'} rounded-xl flex items-center justify-center`}>
                      {cp.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : cp.trend === 'down' ? <TrendingDown className="w-5 h-5" /> : <TrendingDown className="w-5 h-5 opacity-40" />}
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">{cp.city}</p>
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide">Last updated 06:00 AM</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-slate-900">₹{cp.petrol}</p>
                   <p className="text-[10px] text-slate-400 font-bold">Petrol</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto">
         <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-2xl flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Data Active</p>
            </div>
            <button 
              onClick={() => onBack()}
              className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              Order Now
            </button>
         </div>
      </div>
    </div>
  );
}
