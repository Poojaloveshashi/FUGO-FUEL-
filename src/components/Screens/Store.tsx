import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  ShoppingBag, 
  Plus, 
  Check, 
  Car, 
  Bike, 
  Truck, 
  Zap, 
  CheckCircle2, 
  Layers, 
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Fast-Moving' | 'Critical'>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'stock'>('recommended');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Extract distinct vehicle categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.vehicleCategory).filter(Boolean))) as string[];
    return ['All', ...list];
  }, [products]);

  // Extract distinct subsystems based on current category
  const subsystems = useMemo(() => {
    let source = products;
    if (selectedCategory !== 'All') {
      source = source.filter(p => p.vehicleCategory === selectedCategory);
    }
    const subs = Array.from(new Set(source.map(p => p.subsystem).filter(Boolean))) as string[];
    return ['All', ...subs];
  }, [products, selectedCategory]);

  const handleAdd = (p: Product) => {
    onAddToCart(p, 1);
    const newSet = new Set(addedIds);
    newSet.add(p.id);
    setAddedIds(newSet);
    
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    }, 2200);
  };

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Search
      const q = search.toLowerCase().trim();
      const matchSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        (p.subsystem && p.subsystem.toLowerCase().includes(q)) ||
        (p.vehicleCategory && p.vehicleCategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      // Category
      const matchCategory = selectedCategory === 'All' || p.vehicleCategory === selectedCategory;

      // Subsystem
      const matchSubsystem = selectedSubsystem === 'All' || p.subsystem === selectedSubsystem;

      // Replacement Type
      const matchType = selectedType === 'All' || p.replacementType === selectedType;

      return matchSearch && matchCategory && matchSubsystem && matchType;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock') {
      result.sort((a, b) => (b.stockQty || 0) - (a.stockQty || 0));
    }

    return result;
  }, [products, search, selectedCategory, selectedSubsystem, selectedType, sortBy]);

  // Category icons mapping
  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Car')) return Car;
    if (cat.includes('Bike')) return Bike;
    if (cat.includes('Commercial') || cat.includes('Cargo')) return Truck;
    if (cat.includes('Electric')) return Zap;
    return Layers;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-28">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-20 border-b border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">Spare Parts Catalog</h1>
            <p className="text-[10px] text-slate-500 font-medium">Official Rate Sheet • {products.length} Master Items</p>
          </div>
        </div>
        <button 
          className="relative p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl active:scale-95 transition-all" 
          onClick={onGoToCheckout}
          title="Open Cart"
        >
          <ShoppingBag className="w-5 h-5 text-slate-900" />
          {addedIds.size > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-[10px] text-white flex items-center justify-center font-bold rounded-full animate-bounce">
              {addedIds.size}
            </span>
          )}
        </button>
      </header>

      {/* Catalog Banner */}
      <div className="bg-slate-900 text-white p-5 m-4 rounded-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-500/30">
              <Sparkles className="w-3 h-3" /> Verified Master Rate Sheet
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Real-Time Wholesale Rates</span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Authentic OEM Spare Parts</h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Transparent unit pricing with 15-minute express doorstep technician delivery & fitting across Hyderabad.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/10 text-center">
            <div className="bg-white/5 p-2 rounded-xl">
              <p className="text-xs font-black text-white">27</p>
              <p className="text-[9px] text-slate-400 font-medium">4-Wheelers</p>
            </div>
            <div className="bg-white/5 p-2 rounded-xl">
              <p className="text-xs font-black text-white">21</p>
              <p className="text-[9px] text-slate-400 font-medium">2-Wheelers</p>
            </div>
            <div className="bg-white/5 p-2 rounded-xl">
              <p className="text-xs font-black text-white">9</p>
              <p className="text-[9px] text-slate-400 font-medium">Commercial</p>
            </div>
            <div className="bg-white/5 p-2 rounded-xl">
              <p className="text-xs font-black text-emerald-400">7</p>
              <p className="text-[9px] text-slate-400 font-medium">EV Fleet</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Search Bar & Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search parts, subsystems, tires..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 shadow-xs text-slate-800 placeholder:text-slate-400 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full"
              >
                Clear
              </button>
            )}
          </div>

          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl py-3 px-3 text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="recommended">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock">Stock Available</option>
            </select>
          </div>
        </div>

        {/* Vehicle Category Tabs */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-2">Vehicle Category</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat);
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubsystem('All');
                  }}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-xs ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-orange-200' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat === 'All' ? 'All Vehicles' : cat.replace(' (4-Wheelers)', '').replace(' (2-Wheelers)', '')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subsystem & Replacement Type Filters */}
        <div className="space-y-2">
          {subsystems.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {subsystems.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubsystem(sub)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors ${
                    selectedSubsystem === sub
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type:</span>
            {(['All', 'Fast-Moving', 'Critical'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  selectedType === type
                    ? type === 'Fast-Moving' 
                      ? 'bg-emerald-600 text-white' 
                      : type === 'Critical' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'Fast-Moving' ? '⚡ Fast-Moving' : type === 'Critical' ? '🛡️ Critical' : 'All Types'}
              </button>
            ))}
            <span className="text-[10px] text-slate-400 font-bold ml-auto font-mono">
              Showing {filteredProducts.length} items
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {filteredProducts.map(p => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={p.id} 
              className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group"
            >
              <div>
                {/* Image & Quick Badges */}
                <div className="h-36 bg-slate-100 rounded-2xl mb-3 overflow-hidden relative">
                  <img 
                    src={p.image} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    alt={p.name} 
                    referrerPolicy="no-referrer" 
                    loading="lazy"
                  />
                  
                  {/* Category & Subsystem Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {p.subsystem || p.category}
                    </span>
                    {p.replacementType && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded backdrop-blur-md text-white shadow-xs ${
                        p.replacementType === 'Fast-Moving' ? 'bg-emerald-600/90' : 'bg-indigo-600/90'
                      }`}>
                        {p.replacementType === 'Fast-Moving' ? '⚡ Fast-Moving' : '🛡️ Critical'}
                      </span>
                    )}
                  </div>

                  {/* Stock Indicator */}
                  {p.stockQty !== undefined && (
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md shadow-xs text-[9px] font-bold text-slate-700 flex items-center gap-1">
                      <PackageCheck className="w-3 h-3 text-emerald-600" />
                      <span>Stock: {p.stockQty}</span>
                    </div>
                  )}

                  {/* Scrap exchange badge if present */}
                  {p.exchangeDiscount && (
                    <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-xs">
                      -₹{p.exchangeDiscount} Scrap Off
                    </div>
                  )}
                </div>

                {/* Vehicle Category & Title */}
                <div className="space-y-1">
                  {p.vehicleCategory && (
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                      {p.vehicleCategory}
                    </p>
                  )}
                  <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>

              {/* Price, Unit & Add Button */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">₹{p.price.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">/{p.unit}</span>
                  </div>
                  {p.originalPrice && (
                    <span className="text-[9px] text-slate-400 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>

                <button 
                  onClick={() => handleAdd(p)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                    addedIds.has(p.id) 
                      ? 'bg-emerald-600 text-white shadow-emerald-200' 
                      : 'bg-slate-900 hover:bg-orange-600 text-white shadow-slate-200'
                  }`}
                >
                  {addedIds.has(p.id) ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No spare parts match your filters</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Try searching with different terms or reset your vehicle category and subsystem filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
                setSelectedSubsystem('All');
                setSelectedType('All');
              }}
              className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Checkout Button */}
      {addedIds.size > 0 && (
        <motion.div 
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-5 left-4 right-4 max-w-md mx-auto z-30"
        >
          <button 
            onClick={onGoToCheckout}
            className="w-full bg-slate-900 border border-slate-800 text-white py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-between px-6 hover:bg-orange-600 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-black">{addedIds.size} New</div>
              <span className="text-sm">Proceed to Checkout</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
