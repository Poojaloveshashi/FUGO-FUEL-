import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin, Fuel, ArrowRight } from 'lucide-react';
import { UserLocation, Product } from '../../types';

interface FuelBookingProps {
  products: Product[];
  onBack: () => void;
  onAddToCart: (p: Product, q: number) => void;
  onGoToCheckout: () => void;
  location: UserLocation;
}

export default function FuelBooking({ products, onBack, onAddToCart, onGoToCheckout, location }: FuelBookingProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [quantity, setQuantity] = useState(10);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(selectedProduct, quantity);
    setAdded(true);
    setTimeout(() => {
      onGoToCheckout();
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-20 border-b border-slate-100">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-xl">Order Fuel</h1>
      </header>

      <div className="flex-1 p-6 space-y-8">
        {/* Station Info Banner */}
        <section className="relative h-32 rounded-3xl overflow-hidden shadow-md shadow-orange-50 group">
          <img 
            src="https://images.unsplash.com/photo-1545644161-591605335805?auto=format&fit=crop&q=80&w=600" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            alt="Station"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 to-transparent p-5 flex flex-col justify-center">
            <span className="text-[10px] text-white/70 font-black uppercase tracking-widest mb-1">Dispatching from</span>
            <h2 className="text-white text-lg font-bold leading-tight">Fugo Express {location.city} Hub</h2>
            <p className="text-white/80 text-[10px] mt-0.5">Automated quality check enabled</p>
          </div>
        </section>

        {/* Product Selection */}
        <section>
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4 block">Select Fuel Type</label>
          <div className="grid grid-cols-2 gap-4">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`relative p-5 rounded-2xl border-2 transition-all text-left ${
                  selectedProduct.id === p.id 
                    ? 'border-orange-500 bg-orange-50/50 shadow-md ring-4 ring-orange-500/10' 
                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${selectedProduct.id === p.id ? 'bg-orange-500' : 'bg-slate-100'}`}>
                   <Fuel className={`${selectedProduct.id === p.id ? 'text-white' : 'text-slate-400'} w-5 h-5`} />
                </div>
                <h3 className="font-bold text-sm mb-1">{p.name}</h3>
                <p className="text-orange-600 font-bold text-lg">₹{p.price}<span className="text-[10px] text-slate-400 font-normal ml-0.5">/{p.unit}</span></p>
                {selectedProduct.id === p.id && (
                  <motion.div layoutId="check" className="absolute top-4 right-4 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Quantity Selection */}
        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100">
           <div className="flex justify-between items-center mb-6">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Quantity</label>
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{quantity} {selectedProduct.unit}</div>
           </div>
           
           <input 
              type="range" 
              min="5" 
              max="100" 
              step="5"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full accent-orange-500 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer mb-6"
           />
           
           <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map(val => (
                <button 
                  key={val}
                  onClick={() => setQuantity(val)}
                  className={`py-2 rounded-xl text-sm font-bold transition-colors ${quantity === val ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  {val} {selectedProduct.unit}
                </button>
              ))}
           </div>
        </section>

        {/* Address Preview */}
        <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-slate-200">
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="text-orange-400 w-5 h-5" />
             </div>
             <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Standard Delivery • {location.city} Station</p>
                <h3 className="font-semibold text-sm mb-1 leading-tight">{location.name}: {location.address}, {location.city}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Nearby Station (350m) • 15 Mins</span>
                </div>
             </div>
          </div>
        </section>
      </div>

      {/* Footer Payment Info */}
      <footer className="p-6 bg-white border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between mb-4">
           <div>
              <p className="text-xs text-slate-400 font-medium">Total Amount</p>
              <h2 className="text-2xl font-bold text-slate-900">₹{(quantity * selectedProduct.price).toLocaleString()}</h2>
           </div>
           <p className="text-[10px] text-slate-400 text-right font-medium">Includes delivery fee <br /> & taxes</p>
        </div>
        
        <button
          onClick={handleAdd}
          disabled={added}
          className={`w-full py-5 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 group ${
            added ? 'bg-green-500 text-white shadow-green-100' : 'bg-orange-500 text-white shadow-orange-100 hover:bg-orange-600 active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>Success! Redirecting...</>
          ) : (
            <>
              Confirm Order & Pay <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
