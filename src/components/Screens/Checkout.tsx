import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  MapPin, 
  CreditCard, 
  QrCode, 
  Wallet, 
  Landmark, 
  Truck, 
  ShieldCheck, 
  ShoppingBag, 
  ExternalLink, 
  Sparkles, 
  Radio, 
  Banknote,
  CheckCircle2,
  Info
} from 'lucide-react';
import { UserLocation, Product, PaymentTransactionInfo, PaymentMethodCategory } from '../../types';
import { 
  fetchAppSettings, 
  AppSettings, 
  createPaymentRecord, 
  generateUpiQrDataUrl 
} from '../../services/payment';
import { companionSync } from '../../services/companionSync';
import PaymentReceiptModal from '../Payment/PaymentReceiptModal';
import CompanionSyncModal from '../Companion/CompanionSyncModal';

interface CheckoutProps {
  cart: { product: Product; quantity: number }[];
  onBack: () => void;
  onPlaceOrder: (address: string, fee: number, dist: number, payment?: PaymentTransactionInfo) => Promise<boolean | void> | boolean | void;
  handleOrderSubmit?: (address: string, fee: number, dist: number, payment?: PaymentTransactionInfo) => Promise<boolean | void> | boolean | void;
  location: UserLocation;
}

export default function Checkout({ cart, onBack, onPlaceOrder, handleOrderSubmit, location }: CheckoutProps) {
  // Only two methods work: 'cod' (Cash on delivery) and 'upi' (UPI at the door)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [appSettings, setAppSettings] = useState<AppSettings>({
    merchant_vpa: '',
    merchant_name: 'Fugo',
    gstin: '',
    transport_fee: 100,
  });
  const [upiQrPreviewUrl, setUpiQrPreviewUrl] = useState<string>('');
  const [cashChangeReq, setCashChangeReq] = useState<string>('exact');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [completedPayment, setCompletedPayment] = useState<PaymentTransactionInfo | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [isCompanionConnected, setIsCompanionConnected] = useState(companionSync.isConnected());

  // Price calculations
  const distance = 0.35; // 350 meters
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalExchangeSavings = cart.reduce((acc, item) => acc + ((item.product.exchangeDiscount || 0) * item.quantity), 0);
  const deliveryFee = distance < 0.5 ? 25 : 49;
  const gstAmount = Math.round(subtotal * 0.18);
  const total = Math.max(0, subtotal - totalExchangeSavings + deliveryFee);

  // Load business details from public.app_settings in Supabase
  useEffect(() => {
    let active = true;
    fetchAppSettings().then((settings) => {
      if (!active) return;
      setAppSettings(settings);
      // If merchant_vpa is set, default to UPI or allow it; if empty, strictly default to cod
      if (!settings.merchant_vpa) {
        setPaymentMethod('cod');
      } else {
        // Pre-generate sample QR preview
        generateUpiQrDataUrl(total, `PRE_${Date.now()}`, settings.merchant_vpa, settings.merchant_name)
          .then((url) => {
            if (active && url) setUpiQrPreviewUrl(url);
          });
      }
    });

    const unsub = companionSync.subscribe(() => {
      if (active) setIsCompanionConnected(companionSync.isConnected());
    });

    return () => {
      active = false;
      unsub();
    };
  }, [total]);

  // Handle direct order placement without fake payment delay
  const handleConfirmOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const isUpi = paymentMethod === 'upi' && Boolean(appSettings.merchant_vpa);
    const methodCategory: PaymentMethodCategory = isUpi ? 'upi' : 'cod';
    const methodTitle = isUpi 
      ? 'UPI at the door' 
      : cashChangeReq === 'exact' 
      ? 'Cash on delivery (Exact Cash)' 
      : `Cash on delivery (Change for ₹${cashChangeReq})`;

    const record = createPaymentRecord({
      method: methodCategory,
      methodTitle,
      amount: total,
      subtotal,
      deliveryFee,
      upiVpa: isUpi ? appSettings.merchant_vpa : undefined,
    });

    setCompletedPayment(record);

    const formattedAddressParts = [
      location.houseNumber,
      location.name,
      location.address,
      location.landmark ? `(Near: ${location.landmark})` : null,
      location.city
    ].filter(Boolean);
    const address = formattedAddressParts.join(', ');

    const submitFn = handleOrderSubmit || onPlaceOrder;
    const res = await submitFn(address, deliveryFee, distance, record);

    setIsSubmitting(false);

    if (res !== false) {
      setIsReceiptOpen(true);
    }
  };

  const handleProceedToTracking = () => {
    setIsReceiptOpen(false);
  };

  const hasUpi = Boolean(appSettings.merchant_vpa);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">Order Checkout & Payment</h1>
              <span className="text-[11px] text-slate-500 block">Instant Fuel Delivery at Doorstep</span>
            </div>
          </div>

          {/* Real-time Companion Partner App Bridge Button */}
          <button
            type="button"
            onClick={() => setIsCompanionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">Driver App Link</span>
            <span className="sm:hidden">Driver</span>
            <span className={`w-2 h-2 rounded-full ${isCompanionConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </button>
        </div>
      </header>

      {/* Companion App Real-time Sync Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-4 py-2 border-b border-indigo-950">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <Radio className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
            <span className="text-slate-300 truncate">
              Live Real-time Sync with Driver App:
              <span className="font-mono text-indigo-200 ml-1 font-bold">4d28260b</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCompanionModalOpen(true)}
            className="text-[11px] font-bold text-indigo-300 hover:text-white underline flex items-center gap-1 shrink-0 ml-2"
          >
            <span>Live Bridge</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4 pb-32">
        {/* Delivery Address Card with House Number & Landmark */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {location.tag ? `[${location.tag}] ` : ''}{location.name}
                </span>
                {location.isLiveLocation && (
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono font-bold border border-emerald-200">
                    Live GPS
                  </span>
                )}
                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  {distance * 1000}m away (15 min ETA)
                </span>
              </div>
              {location.houseNumber && (
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  Door/Flat: {location.houseNumber}
                </p>
              )}
              <p className="text-xs text-slate-500 truncate max-w-xs">{location.address}, {location.city}</p>
              {location.landmark && (
                <p className="text-[10px] text-orange-600 font-medium">Near: {location.landmark}</p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Bowser Delivery</span>
            <span className="text-xs font-extrabold text-orange-600">Priority</span>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cart Fuel Summary</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">{cart.length} item(s)</span>
          </div>

          <div className="divide-y divide-slate-100">
            {cart.map((item) => (
              <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-11 h-11 object-cover rounded-xl border border-slate-100"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800">{item.product.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {item.quantity} {item.product.unit} × ₹{item.product.price}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-slate-900">₹{item.quantity * item.product.price}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs border border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Fuel & Goods Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {totalExchangeSavings > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Exchange & Scrap Discount</span>
                <span>-₹{totalExchangeSavings}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Mobile Bowser Logistics Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Taxes & GST (18% included)</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Total Payable Amount</span>
              <span className="text-orange-600 text-base">₹{total}</span>
            </div>
          </div>
        </div>

        {/* PAYMENT METHODS SECTION */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Select Payment Method</h2>
              <p className="text-[11px] text-slate-500">Pay the driver at your doorstep via Cash or UPI</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Pay at Doorstep
            </span>
          </div>

          {/* ACTIVE OPTIONS (Cash on delivery & UPI at the door) */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
              Available Payment Methods
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Cash on delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/30 text-orange-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Banknote className="w-5 h-5" />
                  </div>
                  {paymentMethod === 'cod' && (
                    <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold block">Cash on delivery</span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Hand cash directly to the driver upon delivery
                  </span>
                </div>
              </button>

              {/* Option 2: UPI at the door (shown only if merchant_vpa is set in app_settings) */}
              {hasUpi ? (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500/30 text-orange-950 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <QrCode className="w-5 h-5" />
                    </div>
                    {paymentMethod === 'upi' && (
                      <CheckCircle2 className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">UPI at the door</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Instant</span>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      Scan driver's QR using GPay, PhonePe or Paytm
                    </span>
                  </div>
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col justify-center text-left">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <QrCode className="w-4 h-4" />
                    <span className="text-xs font-semibold">UPI at the door</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Configure UPI ID in app_settings to enable door QR
                  </span>
                </div>
              )}
            </div>

            {/* Selected Method Detail Card */}
            {paymentMethod === 'cod' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center gap-2 text-orange-900 font-bold">
                  <Banknote className="w-4 h-4 text-orange-600" />
                  <span>Cash on delivery instructions</span>
                </div>
                <p className="text-slate-600">
                  Driver Rahul will verify fuel volume from the smart meter and collect <strong>₹{total}</strong> before dispensing fuel.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-500 text-[11px]">Change requirement:</span>
                  <div className="flex gap-1.5">
                    {['exact', '500', '2000'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCashChangeReq(opt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          cashChangeReq === opt
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt === 'exact' ? 'Exact Cash' : `Change for ₹${opt}`}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {paymentMethod === 'upi' && hasUpi && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>UPI Payment at the door</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {appSettings.merchant_name}
                  </span>
                </div>
                <p className="text-slate-600">
                  When the bowser arrives, the driver will present a dedicated QR on their phone for <strong>₹{total}</strong>. You can scan and pay with any UPI app.
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200/70 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Merchant VPA:</span>
                  <span className="font-mono font-bold text-slate-800">{appSettings.merchant_vpa}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* DISABLED / COMING SOON OPTIONS (Cards, NetBanking, Wallets, Fleet Cards, Pay Later) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Online & Gateway Channels
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Gateway KYC Pending</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* Credit / Debit Cards */}
              <div className="p-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 opacity-60 cursor-not-allowed text-left flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Coming soon</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-600 block">Credit / Debit Cards</span>
                  <span className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</span>
                </div>
              </div>

              {/* Net Banking */}
              <div className="p-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 opacity-60 cursor-not-allowed text-left flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <Landmark className="w-4 h-4 text-slate-400" />
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Coming soon</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-600 block">Net Banking</span>
                  <span className="text-[10px] text-slate-400">All Indian Banks</span>
                </div>
              </div>

              {/* Digital Wallets */}
              <div className="p-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 opacity-60 cursor-not-allowed text-left flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <Wallet className="w-4 h-4 text-slate-400" />
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Coming soon</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-600 block">Fugo & Digital Wallets</span>
                  <span className="text-[10px] text-slate-400">Paytm, PhonePe, Amazon</span>
                </div>
              </div>

              {/* Corporate Fleet Cards */}
              <div className="p-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 opacity-60 cursor-not-allowed text-left flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Coming soon</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-600 block">Fleet Cards</span>
                  <span className="text-[10px] text-slate-400">IOCL, BPCL, HPCL</span>
                </div>
              </div>

              {/* Pay Later / BNPL */}
              <div className="p-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 opacity-60 cursor-not-allowed text-left flex flex-col justify-between col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Coming soon</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-600 block">Pay Later (BNPL)</span>
                  <span className="text-[10px] text-slate-400">Simpl, LazyPay</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-100/70 rounded-xl text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Online payment gateways will activate once merchant KYC registration is approved.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Order Submission Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
              Pay on delivery
            </span>
            <span className="text-xl font-black text-slate-900">₹{total}</span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmOrder}
            className="flex-1 max-w-xs py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Placing Order...</span>
            ) : (
              <span>Pay on delivery: ₹{total}</span>
            )}
          </button>
        </div>
      </div>

      {/* Verified Receipt Modal */}
      {completedPayment && isReceiptOpen && (
        <PaymentReceiptModal
          isOpen={isReceiptOpen}
          orderId="Active Order"
          items={cart}
          deliveryAddress={`${location.name}: ${location.address}, ${location.city}`}
          payment={completedPayment}
          onProceedToTracking={handleProceedToTracking}
        />
      )}

      {/* Companion Driver App Sync Bridge Modal */}
      <CompanionSyncModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
      />
    </div>
  );
}
