import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MapPin, CreditCard, ChevronRight, X, Clock, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';

interface CheckoutProps {
  cart: { product: Product; quantity: number }[];
  onBack: () => void;
  onPlaceOrder: (address: string) => void;
}

export default function Checkout({ cart, onBack, onPlaceOrder }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('upi');
  const [isPlacing, setIsPlacing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const deliveryFee = 49;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsPlacing(true);
    setTimeout(() => {
      onPlaceOrder("Home: No 42, 2nd Cross, MG Road, Bangalore");
    }, 2000);
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
        {/* Delivery Info */}
        <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Delivery Location</span>
              <button className="text-orange-500 text-xs font-bold">Change</button>
           </div>
           <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                 <MapPin className="text-orange-500 w-5 h-5" />
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-sm text-slate-800">Home</h3>
                 <p className="text-xs text-slate-400 leading-relaxed mt-0.5">No 42, 2nd Cross, MG Road, Bangalore - 560001</p>
              </div>
           </div>
           <div className="mt-4 pt-4 border-t border-dashed border-slate-100 flex items-center gap-3">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-xs font-semibold text-slate-600">Expected Delivery in <span className="text-green-600">15 mins</span></span>
           </div>
        </section>

        {/* Order Summary */}
        <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
           <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block mb-4">Order Items</span>
           <div className="space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden">
                        <img src={item.product.image} className="w-full h-full object-cover" alt="p" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{item.product.name}</h4>
                        <p className="text-xs text-slate-400">{item.quantity} {item.product.unit}</p>
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
              <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Delivery Fee</span>
                 <span className="text-green-600 font-bold">₹{deliveryFee}</span>
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
