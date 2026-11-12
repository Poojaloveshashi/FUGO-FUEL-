import { motion } from 'motion/react';
import { ChevronLeft, Fuel, ShieldCheck, ArrowRight, Wrench, AlertTriangle } from 'lucide-react';
import { UserLocation, Product, Screen } from '../../types';
import { FUEL_COMING_SOON_MESSAGE } from '../../config/fuelConfig';

interface FuelBookingProps {
  products: Product[];
  onBack: () => void;
  onAddToCart?: (p: Product, q: number) => void;
  onGoToCheckout?: () => void;
  onOrderFuelDirect?: (p: Product, q: number) => Promise<void> | void;
  onNavigate?: (screen: Screen) => void;
  location: UserLocation;
}

export default function FuelBooking({ onBack, onNavigate }: FuelBookingProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-20 border-b border-slate-100 shadow-xs">
        <button 
          onClick={onBack} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
          title="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-slate-900">Order Fuel</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-6 text-center">
        {/* Animated Icon Badge */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/20 text-white relative"
        >
          <Fuel className="w-12 h-12" />
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-600"></span>
          </span>
        </motion.div>

        {/* Heading & Badge */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-200 inline-block">
            Coming Soon
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Fuel Delivery Coming Soon
          </h2>
        </div>

        {/* Official notice box */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm text-left space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {FUEL_COMING_SOON_MESSAGE}
            </p>
          </div>
          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            All safety audits and PESO vehicle compliances are underway to ensure certified calibration and safe doorstep fueling.
          </div>
        </div>

        {/* Live Alternative Services CTA */}
        <div className="w-full space-y-2.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available Services Right Now
          </p>
          
          <button
            onClick={() => onNavigate ? onNavigate('appointment') : onBack()}
            className="w-full p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-between shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-indigo-200" />
              <div className="text-left">
                <span className="block font-bold">Book Doorstep Repair</span>
                <span className="text-[10px] text-indigo-200 font-normal">Expert Mechanic & Diagnostics</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-200" />
          </button>

          <button
            onClick={onBack}
            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
