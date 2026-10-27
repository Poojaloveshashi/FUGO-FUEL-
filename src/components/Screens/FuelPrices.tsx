import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MapPin, 
  Zap, 
  BatteryCharging, 
  Flame, 
  Wrench, 
  CheckCircle2, 
  RefreshCw, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Percent,
  CalendarClock,
  Layers,
  PackageCheck,
  Car,
  Bike,
  Truck,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { 
  CITY_COMMODITY_PRICES, 
  BATTERY_CATALOG, 
  ROADSIDE_TARIFFS, 
  getCommodityList, 
  BatteryItem, 
  RoadsideTariff 
} from '../../services/livePricing';
import { Product, Screen } from '../../types';
import { SPARE_PARTS_MASTER_CATALOG } from '../../data/sparePartsCatalog';

interface FuelPricesProps {
  onBack: () => void;
  onNavigate?: (screen: Screen) => void;
  onAddToCart?: (p: Product, q: number) => void;
}

type TabType = 'fuel' | 'batteries' | 'spare_parts' | 'roadside';

export default function FuelPrices({ onBack, onNavigate, onAddToCart }: FuelPricesProps) {
  const [activeTab, setActiveTab] = useState<TabType>('fuel');
  const [activeCity, setActiveCity] = useState('Hyderabad');
  const [withExchange, setWithExchange] = useState(true);
  const [selectedBatteryType, setSelectedBatteryType] = useState<string>('all');
  const [selectedTrendCommodity, setSelectedTrendCommodity] = useState<'petrol' | 'diesel' | 'cng'>('petrol');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [partsSearch, setPartsSearch] = useState('');
  const [partsCategory, setPartsCategory] = useState('All');

  const currentCityProfile = CITY_COMMODITY_PRICES.find(c => c.city === activeCity) || CITY_COMMODITY_PRICES[0];
  const commodities = getCommodityList(currentCityProfile);

  const historicalTrends = {
    petrol: [
      { day: 'Mon', price: 108.5 },
      { day: 'Tue', price: 108.8 },
      { day: 'Wed', price: 109.2 },
      { day: 'Thu', price: 109.4 },
      { day: 'Today', price: currentCityProfile.petrol },
    ],
    diesel: [
      { day: 'Mon', price: 98.1 },
      { day: 'Tue', price: 98.0 },
      { day: 'Wed', price: 97.95 },
      { day: 'Thu', price: 97.9 },
      { day: 'Today', price: currentCityProfile.diesel },
    ],
    cng: [
      { day: 'Mon', price: 92.5 },
      { day: 'Tue', price: 92.5 },
      { day: 'Wed', price: 92.5 },
      { day: 'Thu', price: 92.5 },
      { day: 'Today', price: currentCityProfile.cng },
    ],
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleBookBattery = (battery: BatteryItem) => {
    const finalPrice = withExchange ? battery.mrp - battery.exchangeRebate : battery.mrp;
    const product: Product = {
      id: battery.id,
      name: `${battery.model} ${withExchange ? '(With Old Battery Exchange)' : '(New)'}`,
      price: finalPrice,
      originalPrice: battery.mrp,
      exchangeDiscount: withExchange ? battery.exchangeRebate : 0,
      unit: 'unit',
      image: battery.image,
      description: `${battery.warranty} • Free 15-min doorstep fitting`,
      category: 'parts',
      vehicleType: battery.vehicleType,
      warranty: battery.warranty,
    };

    if (onAddToCart) {
      onAddToCart(product, 1);
      setAddedNotice(`Added ${battery.model} to Cart (₹${finalPrice.toLocaleString('en-IN')})`);
      setTimeout(() => setAddedNotice(null), 3000);
    }
  };

  const handleBookRoadside = (tariff: RoadsideTariff) => {
    const product: Product = {
      id: tariff.id,
      name: tariff.serviceName,
      price: tariff.standardPrice,
      originalPrice: tariff.strikePrice,
      unit: 'service',
      image: 'https://images.unsplash.com/photo-1615906659123-23d3408667be?auto=format&fit=crop&q=80&w=400',
      description: tariff.description,
      category: 'service',
    };

    if (onAddToCart) {
      onAddToCart(product, 1);
      setAddedNotice(`Booked ${tariff.serviceName} (₹${tariff.standardPrice})`);
      setTimeout(() => setAddedNotice(null), 3000);
    }
  };

  const filteredBatteries = selectedBatteryType === 'all' 
    ? BATTERY_CATALOG 
    : BATTERY_CATALOG.filter(b => b.vehicleType.toLowerCase().includes(selectedBatteryType));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-20 border-b border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Live Rates & Tariffs</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Real-Time Fuel, CNG & Battery Exchange
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            className={`p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all ${isRefreshing ? 'rotate-180 duration-500' : ''}`}
            title="Refresh prices"
          >
            <RefreshCw className="w-4 h-4 text-slate-700" />
          </button>
          <div className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-sm shadow-orange-200">
            ₹
          </div>
        </div>
      </header>

      {/* Added Notification Toast */}
      <AnimatePresence>
        {addedNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-18 left-4 right-4 z-50 max-w-md mx-auto bg-emerald-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-700"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs font-bold leading-tight">{addedNotice}</p>
            </div>
            {onNavigate && (
              <button 
                onClick={() => onNavigate('checkout')}
                className="bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shrink-0 ml-2"
              >
                View Cart
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 pt-2 sticky top-[65px] z-10">
        <div className="flex items-center gap-1 max-w-md mx-auto overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('fuel')}
            className={`px-3 py-3 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'fuel' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Fuel & CNG</span>
          </button>
          <button
            onClick={() => setActiveTab('batteries')}
            className={`px-3 py-3 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'batteries' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <BatteryCharging className="w-4 h-4" />
            <span>Battery Swap</span>
          </button>
          <button
            onClick={() => setActiveTab('spare_parts')}
            className={`px-3 py-3 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'spare_parts' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Spare Parts (64)</span>
          </button>
          <button
            onClick={() => setActiveTab('roadside')}
            className={`px-3 py-3 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'roadside' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Roadside</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pb-28 max-w-2xl mx-auto w-full">

        {/* TAB 1: FUEL, CNG & EV COMMODITIES */}
        {activeTab === 'fuel' && (
          <div className="space-y-6">
            {/* City Selector */}
            <section className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">Select City Rates</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentCityProfile.lastUpdated}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CITY_COMMODITY_PRICES.map(c => (
                  <button
                    key={c.city}
                    onClick={() => setActiveCity(c.city)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeCity === c.city
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.city}
                  </button>
                ))}
              </div>
            </section>

            {/* Commodities Grid: Petrol, Diesel, CNG, Auto LPG, EV */}
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Live Station Rates • {activeCity}
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {commodities.map((comm) => (
                  <motion.div
                    key={comm.id}
                    whileHover={{ y: -2 }}
                    className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-orange-300 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${comm.color}`}>
                          {comm.badge}
                        </span>
                        <h4 className="font-bold text-sm text-slate-800 mt-2">{comm.name}</h4>
                      </div>
                      <div className={`p-2 rounded-xl ${comm.trend === 'up' ? 'bg-red-50 text-red-500' : comm.trend === 'down' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {comm.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : comm.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">₹{comm.price.toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-400 ml-1.5">{comm.unit}</span>
                      </div>
                      <span className={`text-[11px] font-bold ${comm.trend === 'up' ? 'text-red-500' : comm.trend === 'down' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {comm.change > 0 ? `+₹${comm.change.toFixed(2)}` : comm.change < 0 ? `-₹${Math.abs(comm.change).toFixed(2)}` : '0.00'} today
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{comm.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Doorstep Delivery</span>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('fuel')}
                          className="text-[11px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
                        >
                          <span>Order Now</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Interactive Trend Chart */}
            <section className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold tracking-tight">5-Day Rate Trajectory</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activeCity} Metropolitan Area</p>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-xl">
                  {(['petrol', 'diesel', 'cng'] as const).map(cKey => (
                    <button
                      key={cKey}
                      onClick={() => setSelectedTrendCommodity(cKey)}
                      className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${
                        selectedTrendCommodity === cKey
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cKey}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between h-36 gap-3 pt-4">
                {historicalTrends[selectedTrendCommodity].map((item) => {
                  const base = selectedTrendCommodity === 'cng' ? 90 : selectedTrendCommodity === 'diesel' ? 95 : 106;
                  const barHeight = Math.max(30, (item.price - base) * 25);
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-300">₹{item.price.toFixed(1)}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}px` }}
                        className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-lg min-h-[30px]"
                      />
                      <span className="text-[10px] font-bold text-slate-400">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: BATTERY REPLACEMENT & EXCHANGE CALCULATOR */}
        {activeTab === 'batteries' && (
          <div className="space-y-6">
            {/* Old Battery Scrap Exchange Toggle Banner */}
            <section className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 rounded-3xl text-white shadow-lg shadow-emerald-900/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                      Scrap Buyback Offer
                    </span>
                    <span className="text-[11px] text-emerald-200 font-bold">Doorstep Fitting Free</span>
                  </div>
                  <h3 className="text-lg font-black leading-tight">Replace Old Car/Bike Battery</h3>
                  <p className="text-xs text-emerald-100 mt-1 max-w-sm">
                    Hand over your dead/used battery to our certified technician and get an instant cash discount of up to ₹1,100!
                  </p>
                </div>

                {/* Switcher Toggle */}
                <div className="bg-black/25 backdrop-blur-md p-1.5 rounded-2xl flex items-center border border-white/20 self-stretch sm:self-auto">
                  <button
                    onClick={() => setWithExchange(true)}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      withExchange
                        ? 'bg-white text-emerald-800 shadow-md'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>With Old Battery Exchange</span>
                  </button>
                  <button
                    onClick={() => setWithExchange(false)}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                      !withExchange
                        ? 'bg-white text-slate-800 shadow-md'
                        : 'text-emerald-100 hover:text-white'
                    }`}
                  >
                    Without Exchange
                  </button>
                </div>
              </div>
            </section>

            {/* Vehicle Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Batteries' },
                { id: 'hatchback', label: 'Hatchback / Sedan (35Ah)' },
                { id: 'suv', label: 'SUV / Compact (45Ah)' },
                { id: 'motorcycle', label: 'Two-Wheeler (5Ah)' },
                { id: 'heavy', label: 'Commercial (65Ah)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedBatteryType(f.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedBatteryType === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Battery Cards List */}
            <div className="space-y-4">
              {filteredBatteries.map((bat) => {
                const finalPrice = withExchange ? bat.mrp - bat.exchangeRebate : bat.mrp;
                return (
                  <motion.div
                    key={bat.id}
                    whileHover={{ y: -2 }}
                    className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        <img 
                          src={bat.image} 
                          alt={bat.model} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            {bat.brand}
                          </span>
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                            {bat.capacity}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {bat.vehicleType}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{bat.model}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {bat.warranty}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600 font-bold">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            Arrival in {bat.estArrivalMin} mins
                          </span>
                        </div>
                        {/* Features chips */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {bat.features.slice(0, 2).map((feat, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price and Action Section */}
                    <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-2 shrink-0">
                      <div className="text-left md:text-right">
                        {withExchange ? (
                          <>
                            <div className="flex items-center gap-1.5 md:justify-end">
                              <span className="text-xs text-slate-400 line-through">₹{bat.mrp.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                -₹{bat.exchangeRebate} Scrap Rebate
                              </span>
                            </div>
                            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                              ₹{finalPrice.toLocaleString('en-IN')}
                            </div>
                            <p className="text-[10px] text-emerald-600 font-bold">Free Doorstep Fitting & Testing</p>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl font-black text-slate-900 tracking-tight">
                              ₹{finalPrice.toLocaleString('en-IN')}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold">Standard Price (Without Scrap)</p>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handleBookBattery(bat)}
                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-200"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Book & Replace</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ROADSIDE & REPAIR TARIFFS */}
        {activeTab === 'roadside' && (
          <div className="space-y-6">
            <section className="bg-slate-900 p-5 rounded-3xl text-white shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">15-Minute Guaranteed Assistance</h3>
                  <p className="text-xs text-slate-400">Fixed, transparent rate card with zero hidden charges</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-bold">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>&lt; 15 Min Arrival in Hyderabad</span>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Certified Fugo Mechanics</span>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROADSIDE_TARIFFS.map((tariff) => (
                <div
                  key={tariff.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-200">
                        Arrival ~{tariff.estTimeMin} mins
                      </span>
                      {tariff.strikePrice && (
                        <span className="text-xs text-slate-400 line-through">₹{tariff.strikePrice}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{tariff.serviceName}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{tariff.description}</p>
                    
                    <ul className="space-y-1.5 pt-2">
                      {tariff.includes.map((inc, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">₹{tariff.standardPrice}</span>
                      <span className="text-[10px] text-slate-400 block font-bold">Standard Tariff</span>
                    </div>

                    <button
                      onClick={() => handleBookRoadside(tariff)}
                      className="bg-slate-900 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <CalendarClock className="w-3.5 h-3.5" />
                      <span>Book Service</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SPARE PARTS MASTER RATE SHEET */}
        {activeTab === 'spare_parts' && (
          <div className="space-y-5">
            {/* Master Banner */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-500/30">
                  <Sparkles className="w-3 h-3" /> Fugo Master Parts Catalog
                </span>
                <span className="text-[10px] text-slate-400 font-mono">64 Total Items</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Live Spare Parts Price Sheet</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  Direct OEM parts with doorstep delivery & 15-minute technician support.
                </p>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('parts')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Open Dedicated Parts Store</span>
                </button>
              )}
            </div>

            {/* Vehicle Category Filters */}
            <div className="space-y-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: 'All', label: 'All (64)', icon: Layers },
                  { id: 'Cars (4-Wheelers)', label: 'Cars 4W (27)', icon: Car },
                  { id: 'Bikes (2-Wheelers)', label: 'Bikes 2W (21)', icon: Bike },
                  { id: 'Commercial/Cargo', label: 'Commercial (9)', icon: Truck },
                  { id: 'Electric Vehicles', label: 'EV (7)', icon: Zap },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = partsCategory === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPartsCategory(item.id)}
                      className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                        isSel 
                          ? 'bg-orange-500 text-white shadow-xs' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter parts by name, subsystem (e.g. Engine, Brakes, Battery)..."
                  value={partsSearch}
                  onChange={(e) => setPartsSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Parts Rate Items */}
            <div className="space-y-2.5">
              {SPARE_PARTS_MASTER_CATALOG
                .filter(p => {
                  const matchCat = partsCategory === 'All' || p.vehicleCategory === partsCategory;
                  const q = partsSearch.toLowerCase().trim();
                  const matchQ = !q || 
                    p.name.toLowerCase().includes(q) || 
                    p.subsystem.toLowerCase().includes(q) || 
                    p.vehicleCategory.toLowerCase().includes(q);
                  return matchCat && matchQ;
                })
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {p.subsystem}
                          </span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                            p.replacementType === 'Fast-Moving' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {p.replacementType === 'Fast-Moving' ? '⚡ Fast' : '🛡️ Critical'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {p.vehicleCategory} • Stock: {p.stockQty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 leading-none">
                          ₹{p.price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">/{p.unit}</p>
                      </div>

                      {onAddToCart && (
                        <button
                          onClick={() => {
                            onAddToCart(p, 1);
                            setAddedNotice(`Added ${p.name} (₹${p.price.toLocaleString('en-IN')})`);
                            setTimeout(() => setAddedNotice(null), 3000);
                          }}
                          className="w-8 h-8 bg-slate-900 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-colors active:scale-95 shadow-xs"
                          title="Add to Cart"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Bottom Quick Action */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-20">
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 px-5 rounded-3xl shadow-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <div>
              <p className="text-xs font-bold leading-none">Hyderabad Hub Active</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Petrol ₹{currentCityProfile.petrol} • CNG ₹{currentCityProfile.cng}</p>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
