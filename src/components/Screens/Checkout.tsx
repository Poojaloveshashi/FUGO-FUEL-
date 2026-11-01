import { useState, useEffect, type ReactNode } from 'react';
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
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { UserLocation, Product, PaymentTransactionInfo } from '../../types';
import { 
  FUGO_MERCHANT_VPA,
  FUGO_MERCHANT_NAME,
  CardDetails,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  validateExpiry,
  validateLuhn,
  validateVpa,
  generateUpiQrDataUrl,
  getWalletBalance,
  updateWalletBalance,
  createPaymentRecord,
  buildUpiPayloadUrl
} from '../../services/payment';
import ThreeDSecureModal from '../Payment/ThreeDSecureModal';
import NetBankingModal from '../Payment/NetBankingModal';
import PaymentReceiptModal from '../Payment/PaymentReceiptModal';

interface CheckoutProps {
  cart: { product: Product; quantity: number }[];
  onBack: () => void;
  onPlaceOrder: (address: string, fee: number, dist: number, payment?: PaymentTransactionInfo) => Promise<void> | void;
  location: UserLocation;
}

type PaymentMethodType = 'upi' | 'card' | 'netbanking' | 'wallet' | 'pod';

export default function Checkout({ cart, onBack, onPlaceOrder, location }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('upi');
  
  // UPI states
  const [upiSubMode, setUpiSubMode] = useState<'qr' | 'vpa'>('qr');
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [upiVpaInput, setUpiVpaInput] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [qrTimeLeft, setQrTimeLeft] = useState(300); // 5 mins
  const [vpaRequestSent, setVpaRequestSent] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Card states
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    brand: 'Card',
    saveCard: true,
  });
  const [showCvv, setShowCvv] = useState(false);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [is3DSOpen, setIs3DSOpen] = useState(false);

  // NetBanking states
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isNetBankingOpen, setIsNetBankingOpen] = useState(false);

  // Wallet states
  const [walletBalance, setWalletBalance] = useState<number>(() => getWalletBalance());
  const [walletPin, setWalletPin] = useState('');
  const [walletError, setWalletError] = useState('');

  // Receipt Modal state
  const [completedPayment, setCompletedPayment] = useState<PaymentTransactionInfo | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Price calculations
  const distance = 0.35; // 350 meters
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalExchangeSavings = cart.reduce((acc, item) => acc + ((item.product.exchangeDiscount || 0) * item.quantity), 0);
  const deliveryFee = distance < 0.5 ? 25 : 49;
  const total = Math.max(0, subtotal - totalExchangeSavings + deliveryFee);

  // Pre-generate dynamic QR code for UPI
  useEffect(() => {
    let active = true;
    const tempTxn = `ORD${Math.floor(100000 + Math.random() * 900000)}`;
    generateUpiQrDataUrl(total, tempTxn).then((url) => {
      if (active && url) setUpiQrUrl(url);
    });
    return () => { active = false; };
  }, [total]);

  // UPI 5-minute countdown timer
  useEffect(() => {
    if (paymentMethod !== 'upi' || upiSubMode !== 'qr') return;
    const interval = setInterval(() => {
      setQrTimeLeft((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod, upiSubMode]);

  // Copy UPI ID helper
  const handleCopyVpa = () => {
    navigator.clipboard?.writeText(FUGO_MERCHANT_VPA);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  // Card formatting & validation helpers
  const handleCardNumberChange = (raw: string) => {
    const formatted = formatCardNumber(raw);
    const brand = detectCardBrand(formatted);
    setCardDetails(prev => ({ ...prev, number: formatted, brand }));
    if (cardErrors.number) {
      setCardErrors(prev => ({ ...prev, number: '' }));
    }
  };

  const handleExpiryChange = (raw: string) => {
    const formatted = formatExpiry(raw);
    setCardDetails(prev => ({ ...prev, expiry: formatted }));
    if (cardErrors.expiry) {
      setCardErrors(prev => ({ ...prev, expiry: '' }));
    }
  };

  const handleFillDemoCard = (type: 'visa' | 'rupay') => {
    if (type === 'visa') {
      setCardDetails({
        number: '4532 8910 2341 8921',
        name: 'RAHUL SHARMA',
        expiry: '12/28',
        cvv: '891',
        brand: 'Visa',
        saveCard: true,
      });
    } else {
      setCardDetails({
        number: '6071 5200 4402 1198',
        name: 'RAHUL SHARMA',
        expiry: '08/29',
        cvv: '452',
        brand: 'RuPay',
        saveCard: true,
      });
    }
    setCardErrors({});
  };

  // Primary Action: Initiates payment depending on method
  const handleInitiatePayment = () => {
    if (paymentMethod === 'upi') {
      if (upiSubMode === 'vpa') {
        if (!validateVpa(upiVpaInput)) {
          alert('Please enter a valid UPI ID (e.g., yourname@okaxis)');
          return;
        }
        setVpaRequestSent(true);
        return;
      }
      // Dynamic QR mode: Simulate banking switch check
      setIsVerifyingPayment(true);
      setTimeout(() => {
        setIsVerifyingPayment(false);
        const record = createPaymentRecord({
          method: 'upi',
          methodTitle: 'UPI QR (ICICI Bank Switch)',
          amount: total,
          subtotal,
          deliveryFee,
          upiVpa: FUGO_MERCHANT_VPA,
        });
        setCompletedPayment(record);
        setIsReceiptOpen(true);
      }, 1600);
      return;
    }

    if (paymentMethod === 'card') {
      const errs: Record<string, string> = {};
      const cleanNum = cardDetails.number.replace(/\D/g, '');
      if (cleanNum.length < 15) {
        errs.number = 'Enter a valid 16-digit card number';
      }
      if (!validateExpiry(cardDetails.expiry)) {
        errs.expiry = 'Invalid expiry date (MM/YY)';
      }
      if (cardDetails.cvv.length < 3) {
        errs.cvv = 'Invalid CVV';
      }
      if (!cardDetails.name.trim()) {
        errs.name = 'Cardholder name required';
      }

      if (Object.keys(errs).length > 0) {
        setCardErrors(errs);
        return;
      }

      // Open 3D Secure OTP verification modal
      setIs3DSOpen(true);
      return;
    }

    if (paymentMethod === 'netbanking') {
      setIsNetBankingOpen(true);
      return;
    }

    if (paymentMethod === 'wallet') {
      if (walletBalance < total) {
        setWalletError(`Insufficient wallet balance (₹${walletBalance}). Please top up.`);
        return;
      }
      if (walletPin.length !== 4) {
        setWalletError('Please enter your 4-digit Wallet PIN');
        return;
      }

      setIsVerifyingPayment(true);
      setTimeout(() => {
        setIsVerifyingPayment(false);
        updateWalletBalance(-total);
        setWalletBalance(getWalletBalance());
        const record = createPaymentRecord({
          method: 'wallet',
          methodTitle: 'Fugo Fuel Wallet',
          amount: total,
          subtotal,
          deliveryFee,
          walletName: 'Fugo Instant Fuel Credit',
        });
        setCompletedPayment(record);
        setIsReceiptOpen(true);
      }, 1200);
      return;
    }

    if (paymentMethod === 'pod') {
      setIsVerifyingPayment(true);
      setTimeout(() => {
        setIsVerifyingPayment(false);
        const record = createPaymentRecord({
          method: 'pod',
          methodTitle: 'Pay on Delivery (Card / UPI / Cash)',
          amount: total,
          subtotal,
          deliveryFee,
        });
        setCompletedPayment(record);
        setIsReceiptOpen(true);
      }, 900);
    }
  };

  // Called when 3DS Card completes successfully
  const handleCard3DSSuccess = (auth: { authCode: string; rrn: string }) => {
    setIs3DSOpen(false);
    const last4 = cardDetails.number.replace(/\D/g, '').slice(-4) || '4242';
    const record = createPaymentRecord({
      method: 'card',
      methodTitle: `${cardDetails.brand} Card ending in •••• ${last4}`,
      amount: total,
      subtotal,
      deliveryFee,
      cardLast4: last4,
      cardBrand: cardDetails.brand,
    });
    record.authCode = auth.authCode;
    record.rrn = auth.rrn;
    setCompletedPayment(record);
    setIsReceiptOpen(true);
  };

  // Called when NetBanking completes successfully
  const handleNetBankingSuccess = (auth: { authCode: string; rrn: string }) => {
    setIsNetBankingOpen(false);
    const record = createPaymentRecord({
      method: 'netbanking',
      methodTitle: `${selectedBank} NetBanking Direct`,
      amount: total,
      subtotal,
      deliveryFee,
      bankName: selectedBank,
    });
    record.authCode = auth.authCode;
    record.rrn = auth.rrn;
    setCompletedPayment(record);
    setIsReceiptOpen(true);
  };

  // Called when user clicks "Track Live Bowser on Map" from the Receipt Modal
  const handleProceedToTracking = async () => {
    if (!completedPayment) return;
    setIsReceiptOpen(false);
    const address = `${location.name}: ${location.address}, ${location.city}`;
    await onPlaceOrder(address, deliveryFee, distance, completedPayment);
  };

  const minutes = Math.floor(qrTimeLeft / 60);
  const seconds = qrTimeLeft % 60;
  const timerDisplay = `0${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-20 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h1 className="font-black text-lg text-slate-900 leading-tight">Secure Checkout</h1>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 256-bit Bank Encryption
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest">Total Payable</span>
          <span className="text-lg font-black text-slate-900">₹{total}</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-5 space-y-5 pb-32">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Your cart is empty</h2>
            <p className="text-slate-400 text-xs mb-6">Select fuels or vehicle services to continue.</p>
            <button 
              onClick={onBack}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-md"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Delivery Location Banner */}
            <section className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Delivery Destination</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Bowser Station 350m Away
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0 text-orange-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 truncate">{location.name}</h3>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{location.address}, {location.city}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Lat {location.lat ?? 17.4125}, Lng {location.lng ?? 78.3364}
                  </p>
                </div>
              </div>
            </section>

            {/* Payment Method Selector Grid */}
            <section className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block px-1">
                Select Real Payment Rail
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <PaymentPill
                  active={paymentMethod === 'upi'}
                  icon={<QrCode className="w-4 h-4" />}
                  title="Instant UPI / QR"
                  badge="Fastest • 0% Fee"
                  badgeColor="emerald"
                  onClick={() => setPaymentMethod('upi')}
                />
                <PaymentPill
                  active={paymentMethod === 'card'}
                  icon={<CreditCard className="w-4 h-4" />}
                  title="Card (Visa/RuPay)"
                  badge="3DS OTP Secure"
                  badgeColor="blue"
                  onClick={() => setPaymentMethod('card')}
                />
                <PaymentPill
                  active={paymentMethod === 'netbanking'}
                  icon={<Landmark className="w-4 h-4" />}
                  title="Net Banking"
                  badge="Major Banks"
                  badgeColor="slate"
                  onClick={() => setPaymentMethod('netbanking')}
                />
                <PaymentPill
                  active={paymentMethod === 'wallet'}
                  icon={<Wallet className="w-4 h-4" />}
                  title="Fugo Wallet"
                  badge={`₹${walletBalance} Avail`}
                  badgeColor="orange"
                  onClick={() => setPaymentMethod('wallet')}
                />
              </div>

              <button
                onClick={() => setPaymentMethod('pod')}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  paymentMethod === 'pod'
                    ? 'border-orange-500 bg-orange-50/30 ring-2 ring-orange-400/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    paymentMethod === 'pod' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Pay on Delivery (POD)</h4>
                    <p className="text-[10px] text-slate-500">Wireless POS Card Machine or Cash with Delivery OTP</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'pod' ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'pod' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
              </button>
            </section>

            {/* Interactive Payment Details Form Area */}
            <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* --- 1. UPI Payment Mode --- */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  {/* Mode switcher: QR vs Enter VPA */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                    <button
                      onClick={() => setUpiSubMode('qr')}
                      className={`flex-1 py-2 rounded-xl transition-all ${
                        upiSubMode === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Scan Dynamic QR
                    </button>
                    <button
                      onClick={() => setUpiSubMode('vpa')}
                      className={`flex-1 py-2 rounded-xl transition-all ${
                        upiSubMode === 'vpa' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Enter UPI ID (VPA)
                    </button>
                  </div>

                  {upiSubMode === 'qr' ? (
                    <div className="text-center space-y-4 pt-1">
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>QR Code expires in <strong className="font-mono text-orange-600 font-bold">{timerDisplay}</strong></span>
                      </div>

                      {/* Dynamic QR Display */}
                      <div className="inline-block p-4 bg-white rounded-3xl border-2 border-slate-900 shadow-xl relative group">
                        <div className="w-52 h-52 mx-auto flex items-center justify-center bg-white">
                          {upiQrUrl ? (
                            <img src={upiQrUrl} alt="UPI QR" className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-12 h-12 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
                          )}
                        </div>
                        <div className="mt-2 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                          Scan with GPay • PhonePe • Paytm • CRED
                        </div>
                      </div>

                      {/* Merchant VPA & Copy button */}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                        <div className="text-left">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Fugo Merchant VPA</span>
                          <span className="font-mono font-bold text-slate-800">{FUGO_MERCHANT_VPA}</span>
                        </div>
                        <button
                          onClick={handleCopyVpa}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center gap-1 text-slate-700 transition-colors shadow-xs"
                        >
                          {copiedVpa ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Intent deep link button */}
                      <a
                        href={buildUpiPayloadUrl(total, 'ORD_DIRECT')}
                        className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <Smartphone className="w-4 h-4 text-slate-600" />
                        <span>Open Installed UPI App on Phone</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  ) : (
                    /* Enter UPI ID mode */
                    <div className="space-y-4 pt-1">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                          Enter your UPI ID / VPA
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={upiVpaInput}
                            onChange={(e) => setUpiVpaInput(e.target.value)}
                            placeholder="e.g. mobile@okhdfcbank"
                            className="w-full p-3.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                          />
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {['@okaxis', '@okhdfcbank', '@paytm', '@ybl', '@oksbi'].map((suffix) => (
                            <button
                              key={suffix}
                              type="button"
                              onClick={() => {
                                const base = upiVpaInput.split('@')[0] || '9876543210';
                                setUpiVpaInput(`${base}${suffix}`);
                              }}
                              className="text-[10px] font-mono font-bold bg-slate-100 hover:bg-orange-50 hover:text-orange-600 px-2.5 py-1 rounded-lg text-slate-600 transition-colors"
                            >
                              {suffix}
                            </button>
                          ))}
                        </div>
                      </div>

                      {vpaRequestSent ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-2">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>Payment request sent to {upiVpaInput}!</span>
                          </div>
                          <p className="text-emerald-700 text-[11px] leading-relaxed">
                            Open your UPI app (Google Pay, PhonePe, or Paytm) and approve the transaction of <strong>₹{total}</strong> within 04:59.
                          </p>
                          <button
                            onClick={() => {
                              setIsVerifyingPayment(true);
                              setTimeout(() => {
                                setIsVerifyingPayment(false);
                                const record = createPaymentRecord({
                                  method: 'upi',
                                  methodTitle: `UPI Collect (${upiVpaInput})`,
                                  amount: total,
                                  subtotal,
                                  deliveryFee,
                                  upiVpa: upiVpaInput,
                                });
                                setCompletedPayment(record);
                                setIsReceiptOpen(true);
                              }, 1200);
                            }}
                            className="w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
                          >
                            Simulate App Approval (Click to Verify)
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* --- 2. Credit / Debit Card Mode --- */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  {/* Virtual Card Preview */}
                  <div className={`w-full h-44 rounded-3xl p-5 text-white flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-500 ${
                    cardDetails.brand === 'Visa'
                      ? 'bg-gradient-to-tr from-blue-900 via-indigo-900 to-blue-700'
                      : cardDetails.brand === 'RuPay'
                      ? 'bg-gradient-to-tr from-emerald-900 via-teal-900 to-emerald-700'
                      : cardDetails.brand === 'Mastercard'
                      ? 'bg-gradient-to-tr from-slate-900 via-neutral-900 to-amber-950'
                      : 'bg-gradient-to-tr from-slate-800 via-slate-900 to-zinc-900'
                  }`}>
                    <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300 flex items-center justify-center">
                        <div className="w-6 h-4 border border-amber-800/40 rounded-xs grid grid-cols-2 gap-0.5" />
                      </div>
                      <span className="font-black italic text-lg tracking-wider text-white">
                        {cardDetails.brand}
                      </span>
                    </div>

                    <div className="relative z-10 font-mono text-lg font-bold tracking-[0.25em] text-white/95">
                      {cardDetails.number || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end relative z-10">
                      <div>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/60 block">Cardholder</span>
                        <span className="font-bold text-xs uppercase tracking-wider text-white">
                          {cardDetails.name || 'YOUR FULL NAME'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/60 block">Expires</span>
                        <span className="font-mono font-bold text-xs text-white">
                          {cardDetails.expiry || 'MM/YY'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fast Demo Card Fill Chips */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-medium">Quick Test Card:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFillDemoCard('visa')}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        Demo Visa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCard('rupay')}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        Demo RuPay
                      </button>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={19}
                        value={cardDetails.number}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        placeholder="4532 •••• •••• ••••"
                        className={`w-full p-3 font-mono text-sm bg-slate-50 border rounded-2xl focus:bg-white outline-none transition-all ${
                          cardErrors.number ? 'border-red-500' : 'border-slate-200 focus:border-blue-600'
                        }`}
                      />
                      {cardErrors.number && (
                        <span className="text-[11px] text-red-500 font-semibold mt-1 block">{cardErrors.number}</span>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => {
                          setCardDetails(prev => ({ ...prev, name: e.target.value.toUpperCase() }));
                          if (cardErrors.name) setCardErrors(prev => ({ ...prev, name: '' }));
                        }}
                        placeholder="NAME ON CARD"
                        className={`w-full p-3 uppercase text-sm bg-slate-50 border rounded-2xl focus:bg-white outline-none transition-all ${
                          cardErrors.name ? 'border-red-500' : 'border-slate-200 focus:border-blue-600'
                        }`}
                      />
                      {cardErrors.name && (
                        <span className="text-[11px] text-red-500 font-semibold mt-1 block">{cardErrors.name}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={5}
                          value={cardDetails.expiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="MM/YY"
                          className={`w-full p-3 font-mono text-sm bg-slate-50 border rounded-2xl focus:bg-white outline-none transition-all ${
                            cardErrors.expiry ? 'border-red-500' : 'border-slate-200 focus:border-blue-600'
                          }`}
                        />
                        {cardErrors.expiry && (
                          <span className="text-[11px] text-red-500 font-semibold mt-1 block">{cardErrors.expiry}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                            CVV
                          </label>
                          <span className="text-[9px] text-slate-400">3 or 4 digits</span>
                        </div>
                        <div className="relative">
                          <input
                            type={showCvv ? 'text' : 'password'}
                            inputMode="numeric"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setCardDetails(prev => ({ ...prev, cvv: val }));
                              if (cardErrors.cvv) setCardErrors(prev => ({ ...prev, cvv: '' }));
                            }}
                            placeholder="•••"
                            className={`w-full p-3 font-mono text-sm bg-slate-50 border rounded-2xl focus:bg-white outline-none transition-all ${
                              cardErrors.cvv ? 'border-red-500' : 'border-slate-200 focus:border-blue-600'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                          >
                            {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {cardErrors.cvv && (
                          <span className="text-[11px] text-red-500 font-semibold mt-1 block">{cardErrors.cvv}</span>
                        )}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cardDetails.saveCard}
                        onChange={(e) => setCardDetails(prev => ({ ...prev, saveCard: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-400"
                      />
                      <span>Save card securely per RBI tokenization guidelines</span>
                    </label>
                  </div>
                </div>
              )}

              {/* --- 3. Net Banking Mode --- */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                    Popular Scheduled Banks
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      'HDFC Bank',
                      'State Bank of India',
                      'ICICI Bank',
                      'Axis Bank',
                      'Kotak Bank',
                      'Punjab National Bank'
                    ].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          selectedBank === bank
                            ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold shadow-xs'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium'
                        }`}
                      >
                        <span className="text-xs leading-tight block">{bank}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                      Or Select from 40+ Other Banks
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                      <option value="Federal Bank">Federal Bank</option>
                      <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* --- 4. Wallet Mode --- */}
              {paymentMethod === 'wallet' && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-500 rounded-2xl text-white flex justify-between items-center shadow-md shadow-orange-100">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-orange-100 block">
                        Fugo Instant Fuel Wallet
                      </span>
                      <span className="text-2xl font-black">₹{walletBalance.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => {
                        updateWalletBalance(1000);
                        setWalletBalance(getWalletBalance());
                        setWalletError('');
                      }}
                      className="px-3 py-1.5 bg-white text-orange-600 font-bold rounded-xl text-xs hover:bg-orange-50 transition-colors shadow-xs"
                    >
                      + Top Up ₹1,000
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                      Enter 4-Digit Wallet Security PIN
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={walletPin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setWalletPin(val);
                          if (walletError) setWalletError('');
                        }}
                        placeholder="••••"
                        className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setWalletPin('1234')}
                        className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl whitespace-nowrap"
                      >
                        Fill PIN: 1234
                      </button>
                    </div>
                    {walletError && (
                      <span className="text-xs text-red-500 font-semibold block">{walletError}</span>
                    )}
                  </div>
                </div>
              )}

              {/* --- 5. POD Mode --- */}
              {paymentMethod === 'pod' && (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                      <Truck className="w-4 h-4 text-orange-500" />
                      <span>Fugo Bowser with Handheld ICICI POS Terminal</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Pay <strong className="text-slate-900 font-bold">₹{total}</strong> directly to driver Rahul when the fuel tanker arrives at your doorstep. Handheld POS accepts Tap & Pay Visa, Mastercard, RuPay, UPI QR, and cash.
                    </p>
                    <div className="pt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Delivery OTP will verify tamper-proof fuel seal.</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Order Items Breakdown */}
            <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block">
                Order Breakdown ({cart.length} item{cart.length > 1 ? 's' : ''})
              </span>

              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        <img src={item.product.image} className="w-full h-full object-cover" alt="item" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{item.product.name}</h4>
                        <span className="text-slate-400 text-[11px]">{item.quantity} {item.product.unit} × ₹{item.product.price}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">₹{item.quantity * item.product.price}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">₹{subtotal}</span>
                </div>
                {totalExchangeSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/70 p-2 rounded-xl">
                    <span>Scrap Battery Buyback Credit</span>
                    <span>-₹{totalExchangeSavings}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery & Bowser Surcharge</span>
                  <span className="font-medium text-slate-800">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-orange-600 text-base">₹{total}</span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Floating Bottom Action CTA */}
      {cart.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-2xl z-20">
          <button
            onClick={handleInitiatePayment}
            disabled={isVerifyingPayment}
            className={`w-full py-4 rounded-2xl font-black text-white text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isVerifyingPayment
                ? 'bg-slate-900'
                : paymentMethod === 'upi'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : paymentMethod === 'card'
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                : paymentMethod === 'netbanking'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                : paymentMethod === 'wallet'
                ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            {isVerifyingPayment ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                <span>Connecting to Banking Switch...</span>
              </>
            ) : (
              <>
                {paymentMethod === 'upi' && <span>Verify & Pay ₹{total} via UPI</span>}
                {paymentMethod === 'card' && <span>Pay ₹{total} with Card (3DS)</span>}
                {paymentMethod === 'netbanking' && <span>Proceed to {selectedBank}</span>}
                {paymentMethod === 'wallet' && <span>Pay ₹{total} with Fugo Wallet</span>}
                {paymentMethod === 'pod' && <span>Confirm Order & Pay on Delivery</span>}
              </>
            )}
          </button>
        </footer>
      )}

      {/* 3D Secure OTP Modal */}
      <ThreeDSecureModal
        isOpen={is3DSOpen}
        amount={total}
        cardDetails={cardDetails}
        onClose={() => setIs3DSOpen(false)}
        onSuccess={handleCard3DSSuccess}
      />

      {/* NetBanking Modal */}
      <NetBankingModal
        isOpen={isNetBankingOpen}
        bankName={selectedBank}
        amount={total}
        onClose={() => setIsNetBankingOpen(false)}
        onSuccess={handleNetBankingSuccess}
      />

      {/* Verified Payment Receipt & Tax Invoice Modal */}
      {completedPayment && (
        <PaymentReceiptModal
          isOpen={isReceiptOpen}
          orderId={`ORD-${Math.floor(100000 + Math.random() * 900000)}`}
          items={cart}
          deliveryAddress={`${location.name}, ${location.address}`}
          payment={completedPayment}
          onProceedToTracking={handleProceedToTracking}
        />
      )}
    </div>
  );
}

function PaymentPill({
  active,
  icon,
  title,
  badge,
  badgeColor,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  badge: string;
  badgeColor: 'emerald' | 'blue' | 'slate' | 'orange';
  onClick: () => void;
}) {
  const badgeClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  }[badgeColor];

  return (
    <button
      onClick={onClick}
      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
        active
          ? 'border-orange-500 bg-orange-50/20 ring-2 ring-orange-400/20 shadow-xs'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
        }`}>
          {icon}
        </div>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
          active ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
        }`}>
          {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-900 leading-tight">{title}</h4>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${badgeClasses}`}>
          {badge}
        </span>
      </div>
    </button>
  );
}
