import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MapPin, CreditCard, ChevronRight, X, Clock, ShieldCheck, ShoppingBag } from 'lucide-react';
import { UserLocation, Product } from '../../types';

interface CheckoutProps {
  cart: { product: Product; quantity: number }[];
  onBack: () => void;
  onPlaceOrder: (address: string, fee: number, dist: number) => Promise<void> | void;
  location: UserLocation;
}

export default function Checkout({ cart, onBack, onPlaceOrder, location }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('upi');
  const [isPlacing, setIsPlacing] = useState(false);

  // Simulated distance to nearest station (in km)
  const distance = 0.35; // 350 meters
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalExchangeSavings = cart.reduce((acc, item) => acc + ((item.product.exchangeDiscount || 0) * item.quantity), 0);
  
  // Dynamic Delivery Fee Logic: ₹25 if < 0.5km, else ₹49
  const deliveryFee = distance < 0.5 ? 25 : 49;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    try {
      await onPlaceOrder(`${location.name}: ${location.address}, ${location.city}`, deliveryFee, distance);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlacing(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} disabled={isPlacing} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-xl">Checkout</h1>
      </header>

      <div className="flex-1 p-6 space-y-6">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">Looks like you haven't added anything to your cart yet. Browse our fuels and services to get started.</p>
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Delivery Info */}
            <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Delivery Chain</span>
              <div className="flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                 <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Optimized Route</span>
              </div>
           </div>

           <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1545644161-591605335805?auto=format&fit=crop&q=80&w=100" 
                    className="w-full h-full object-cover" 
                    alt="hub"
                  />
              </div>
              <div className="flex-1">
                  <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Dispatching from</h3>
                  <p className="text-xs text-orange-600 font-bold mt-0.5">Fugo Express {location.city} Hub</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-tight italic">Verified Quality • Tamper Proof Seal</p>
              </div>
           </div>
           
           <div className="flex items-start gap-4 border-t border-slate-100 pt-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-orange-50">
                 <MapPin className="text-orange-500 w-5 h-5" />
              </div>
              <div className="flex-1">
                 <div className="flex items-center justify-between">
                   <h3 className="font-bold text-sm text-slate-800">{location.name}</h3>
                   <span className="text-[10px] font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-bold">
                     {location.lat ?? 17.4125}, {location.lng ?? 78.3364}
                   </span>
                 </div>
                 <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{location.address}, {location.city}</p>
                 <p className="text-[10px] text-slate-500 font-mono mt-1">
                   GPS: {location.lat ?? 17.4125}° N, {location.lng ?? 78.3364}° E
                 </p>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-dashed border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-slate-600">Expected Delivery in <span className="text-green-600">15 mins</span></span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-lg">
                Supabase: orders table
              </span>
           </div>
        </section>

        {/* Order Summary */}
        <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
           <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-4">Order Items</span>
           <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                        <img src={item.product.image} className="w-full h-full object-cover" alt="p" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">{item.product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400">{item.quantity} {item.product.unit}</p>
                          {item.product.exchangeDiscount && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                              -₹{item.product.exchangeDiscount * item.quantity} Scrap Discount
                            </span>
                          )}
                        </div>
                      </div>
                   </div>
                   <span className="text-sm font-bold text-slate-800">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
           </div>
           
           <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Subtotal</span>
                 <span className="text-slate-800 font-medium">₹{subtotal}</span>
              </div>
              {totalExchangeSavings > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                   <span>Scrap Battery Buyback Credit</span>
                   <span>-₹{totalExchangeSavings}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Delivery Fee</span>
                 <div className="flex flex-col items-end">
                    <span className={deliveryFee === 25 ? "text-green-600 font-bold" : "text-slate-800 font-medium"}>
                       ₹{deliveryFee}
                    </span>
                    {distance < 0.5 && (
                      <span className="text-[10px] text-green-500 font-bold uppercase tracking-tight">Nearby Station Discount ({(distance * 1000).toFixed(0)}m)</span>
                    )}
                 </div>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-100 pt-3 mt-2">
                 <span className="text-slate-900">Total</span>
                 <span className="text-orange-600">₹{total}</span>
              </div>
           </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
           <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-4">Payment Method</span>
           <div className="space-y-2">
              <PaymentOption 
                id="upi" 
                label="UPI (Google Pay / PhonePe)" 
                active={paymentMethod === 'upi'} 
                onSelect={() => setPaymentMethod('upi')} 
              />
              <PaymentOption 
                id="card" 
                label="Credit / Debit Card" 
                active={paymentMethod === 'card'} 
                onSelect={() => setPaymentMethod('card')} 
              />
              <PaymentOption 
                id="wallet" 
                label="Fugo Wallet" 
                active={paymentMethod === 'wallet'} 
                onSelect={() => setPaymentMethod('wallet')} 
              />
           </div>
        </section>
        
        <div className="flex items-center gap-2 justify-center py-4 bg-slate-100 rounded-2xl border border-dashed border-slate-200">
           <ShieldCheck className="w-4 h-4 text-slate-400" />
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure 128-bit Encrypted Payments</span>
        </div>
      </>
    )}
  </div>

      {/* Footer CTA */}
      <footer className="p-6 bg-white border-t border-slate-100">
         <button 
           onClick={handlePlaceOrder}
           disabled={isPlacing || cart.length === 0}
           className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
             isPlacing ? 'bg-slate-900 text-white' : 'bg-orange-500 text-white shadow-xl shadow-orange-100 hover:bg-orange-600 active:scale-95'
           }`}
         >
            {isPlacing ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
                Processing Payment...
              </>
            ) : (
              <>Place Order & Pay ₹{total}</>
            )}
         </button>
      </footer>

      {/* Success Modal Simulation */}
      <AnimatePresence>
        {isPlacing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
             <motion.div 
               initial={{ scale: 0.8, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl"
             >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
                   <motion.div
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                   >
                     <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                     </svg>
                   </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">Your order has been placed. Our agent is arriving in 15 minutes.</p>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</span>
                      <span className="text-xs font-mono text-slate-600">#TXN98273645</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Paid</span>
                      <span className="text-sm font-bold text-slate-900">₹{total}</span>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaymentOption({ id, label, active, onSelect }: { id: string; label: string; active: boolean; onSelect: () => void }) {
  return (
    <button 
      onClick={onSelect}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
        active ? 'border-orange-500 bg-orange-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
      }`}
    >
       <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-400 border border-slate-100'}`}>
             <CreditCard className="w-5 h-5" />
          </div>
          <span className={`text-sm font-bold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
       </div>
       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'border-orange-500 bg-orange-500' : 'border-slate-200 bg-white'}`}>
          {active && <div className="w-2 h-2 bg-white rounded-full" />}
       </div>
    </button>
  );
}
