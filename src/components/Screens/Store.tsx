import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Search, Filter, ShoppingBag, Plus, Check } from 'lucide-react';
import { Product } from '../../types';

interface StoreProps {
  title: string;
  products: Product[];
  onBack: () => void;
  onAddToCart: (p: Product, q: number) => void;
  onGoToCheckout: () => void;
}

export default function Store({ title, products, onBack, onAddToCart, onGoToCheckout }: StoreProps) {
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAdd = (p: Product) => {
    onAddToCart(p, 1);
    const newSet = new Set(addedIds);
    newSet.add(p.id);
    setAddedIds(newSet);
    
    // Auto-timeout success state
    setTimeout(() => {
      const resetSet = new Set(addedIds);
      resetSet.delete(p.id);
      setAddedIds(newSet); // Keep it added for UI feedback
    }, 2000);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-xl">{title}</h1>
        </div>
        <button className="relative p-2 bg-slate-50 rounded-full" onClick={onGoToCheckout}>
           <ShoppingBag className="w-6 h-6 text-slate-900" />
           {addedIds.size > 0 && (
             <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 border-2 border-white rounded-full text-[10px] text-white flex items-center justify-center font-bold">
               {addedIds.size}
             </span>
           )}
        </button>
      </header>

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
           {['All', 'Essential', 'Popular', 'Trending'].map((tag, i) => (
             <button key={tag} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${i === 0 ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>
               {tag}
             </button>
           ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-4">
           {filtered.map(p => (
             <motion.div 
               layout
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               key={p.id} 
               className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm shadow-slate-100 flex flex-col group overflow-hidden relative"
             >
               <div className="h-32 bg-slate-50 rounded-2xl mb-4 overflow-hidden relative">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} referrerPolicy="no-referrer" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg shadow-sm">
                    <span className="text-[10px] font-bold text-slate-900 leading-none">₹{p.price}</span>
                  </div>
               </div>
               
               <h3 className="font-bold text-sm text-slate-800 mb-1 truncate">{p.name}</h3>
               <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 h-8">{p.description}</p>
               
               <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{p.unit}</span>
                  <button 
                    onClick={() => handleAdd(p)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${addedIds.has(p.id) ? 'bg-green-500 text-white shadow-green-100 scale-110' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-100'}`}
                  >
                    {addedIds.has(p.id) ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
               </div>
             </motion.div>
           ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="font-bold text-slate-800 text-lg">No items found</h3>
             <p className="text-slate-400 text-sm">Try searching for something else</p>
          </div>
        )}
      </div>

      {/* Floating Checkout Button */}
      {addedIds.size > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-30"
        >
           <button 
             onClick={onGoToCheckout}
             className="w-full bg-slate-900 border-2 border-slate-900 text-white py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-between px-6 hover:bg-slate-800 transition-all active:scale-95 translate-x-[calc(50%-max-w-md/2)]"
           >
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 px-2 py-1 rounded text-xs leading-none">{addedIds.size}</div>
                 <span>View Cart</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180" />
           </button>
        </motion.div>
      )}
    </div>
  );
}
