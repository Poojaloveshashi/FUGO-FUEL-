import { useState, useEffect, useMemo } from 'react';
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
  Smartphone,
  Radio,
  Building2,
  Banknote,
  Fuel,
  RefreshCw
} from 'lucide-react';
import { UserLocation, Product, PaymentTransactionInfo, PaymentMethodCategory } from '../../types';
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
  buildUpiPayloadUrl,
  POPULAR_BANKS,
  ALL_BANKS,
  UPI_APPS,
  WALLET_PROVIDERS,
  FleetCardDetails,
  PayLaterDetails
} from '../../services/payment';
import { companionSync, COMPANION_APP_URL } from '../../services/companionSync';
import ThreeDSecureModal from '../Payment/ThreeDSecureModal';
import NetBankingModal from '../Payment/NetBankingModal';
import FleetCardModal from '../Payment/FleetCardModal';
import PayLaterModal from '../Payment/PayLaterModal';
import PaymentReceiptModal from '../Payment/PaymentReceiptModal';
import CompanionSyncModal from '../Companion/CompanionSyncModal';

interface CheckoutProps {
  cart: { product: Product; quantity: number }[];
  onBack: () => void;
  onPlaceOrder: (address: string, fee: number, dist: number, payment?: PaymentTransactionInfo) => Promise<void> | void;
  location: UserLocation;
}

export default function Checkout({ cart, onBack, onPlaceOrder, location }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodCategory>('upi');
  
  // UPI states
  const [upiSubMode, setUpiSubMode] = useState<'qr' | 'apps' | 'vpa'>('qr');
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [upiVpaInput, setUpiVpaInput] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
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
  const [bankSearch, setBankSearch] = useState('');
  const [isNetBankingOpen, setIsNetBankingOpen] = useState(false);

  // Wallet states
  const [selectedWallet, setSelectedWallet] = useState('fugo');
  const [walletBalance, setWalletBalance] = useState<number>(() => getWalletBalance());
  const [walletPin, setWalletPin] = useState('');
  const [walletError, setWalletError] = useState('');

  // Fleet Card states
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);

  // Pay Later states
  const [isPayLaterModalOpen, setIsPayLaterModalOpen] = useState(false);

  // Pay on Delivery states
  const [podType, setPodType] = useState<'cash' | 'card_pos' | 'qr_pos'>('card_pos');
  const [cashDenom, setCashDenom] = useState<number | undefined>(undefined);

  // Receipt & Companion Modals
  const [completedPayment, setCompletedPayment] = useState<PaymentTransactionInfo | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [isCompanionConnected, setIsCompanionConnected] = useState(companionSync.isConnected());

  // Price calculations
  const distance = 0.35; // 350 meters
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalExchangeSavings = cart.reduce((acc, item) => acc + ((item.product.exchangeDiscount || 0) * item.quantity), 0);
  const deliveryFee = distance < 0.5 ? 25 : 49;
  const total = Math.max(0, subtotal - totalExchangeSavings + deliveryFee);

  // Listen to companion sync status
  useEffect(() => {
    const unsub = companionSync.subscribe(() => {
      setIsCompanionConnected(companionSync.isConnected());
    });
    return unsub;
  }, []);

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

  const handleFillDemoCard = (type: 'visa' | 'rupay' | 'mastercard') => {
    if (type === 'visa') {
      setCardDetails({
        number: '4532 8910 2341 8921',
        name: 'RAHUL SHARMA',
        expiry: '12/28',
        cvv: '891',
        brand: 'Visa',
        saveCard: true,
      });
    } else if (type === 'rupay') {
      setCardDetails({
        number: '6071 5200 4402 1198',
        name: 'RAHUL SHARMA',
        expiry: '08/29',
        cvv: '452',
        brand: 'RuPay',
        saveCard: true,
      });
    } else {
      setCardDetails({
        number: '5241 8890 3215 7712',
        name: 'RAHUL SHARMA',
        expiry: '05/27',
        cvv: '633',
        brand: 'Mastercard',
        saveCard: true,
      });
    }
    setCardErrors({});
  };

  // Filter banks
  const filteredBanks = useMemo(() => {
    if (!bankSearch.trim()) return ALL_BANKS;
    return ALL_BANKS.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));
  }, [bankSearch]);

  // Primary Action: Initiates payment depending on method
  const handleInitiatePayment = () => {
    if (paymentMethod === 'upi') {
      if (upiSubMode === 'vpa') {
        if (!validateVpa(upiVpaInput)) {
          alert('Please enter a valid UPI ID (e.g., yourname@okaxis)');
          return;
        }
        setVpaRequestSent(true);
        setTimeout(() => {
          setVpaRequestSent(false);
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
        }, 2200);
        return;
      }

      if (upiSubMode === 'apps') {
        setIsVerifyingPayment(true);
        const appObj = UPI_APPS.find(a => a.id === selectedUpiApp);
        setTimeout(() => {
          setIsVerifyingPayment(false);
          const record = createPaymentRecord({
            method: 'upi',
            methodTitle: `${appObj?.name || 'UPI App'} Direct Intent`,
            amount: total,
            subtotal,
            deliveryFee,
            upiApp: appObj?.name,
          });
          setCompletedPayment(record);
          setIsReceiptOpen(true);
        }, 1600);
        return;
      }

      // Dynamic QR mode
      setIsVerifyingPayment(true);
      setTimeout(() => {
        setIsVerifyingPayment(false);
        const record = createPaymentRecord({
          method: 'upi',
          methodTitle: 'Dynamic UPI QR (ICICI Switch)',
          amount: total,
          subtotal,
          deliveryFee,
          upiVpa: FUGO_MERCHANT_VPA,
        });
        setCompletedPayment(record);
        setIsReceiptOpen(true);
      }, 1500);
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

      setIs3DSOpen(true);
      return;
    }

    if (paymentMethod === 'netbanking') {
      setIsNetBankingOpen(true);
      return;
    }

    if (paymentMethod === 'wallet') {
      if (selectedWallet === 'fugo') {
        if (walletBalance < total) {
          setWalletError(`Insufficient Fugo balance (₹${walletBalance}). Please top up.`);
          return;
        }
        if (walletPin.length !== 4) {
          setWalletError('Please enter your 4-digit Wallet PIN');
          return;
        }
      }

      setIsVerifyingPayment(true);
      setTimeout(() => {
        setIsVerifyingPayment(false);
        if (selectedWallet === 'fugo') {
          updateWalletBalance(-total);
          setWalletBalance(getWalletBalance());
        }
        const walletObj = WALLET_PROVIDERS.find(w => w.id === selectedWallet);
        const record = createPaymentRecord({
          method: 'wallet',
          methodTitle: walletObj ? walletObj.name : 'Digital Wallet',
          amount: total,
          subtotal,
          deliveryFee,
          walletName: walletObj ? walletObj.name : 'Wallet',
        });
        setCompletedPayment(record);
        setIsReceiptOpen(true);
      }, 1200);
      return;
    }

    if (paymentMethod === 'fleet_card') {
      setIsFleetModalOpen(true);
      return;
    }

    if (paymentMethod === 'pay_later') {
      setIsPayLaterModalOpen(true);
      return;
    }

    if (paymentMethod === 'pod') {
      setIsVerifyingPayment(true);
      setTimeout(() => {
        setIsVerifyingPayment(false);
        const titleMap = {
          cash: cashDenom ? `Cash on Delivery (Change for ₹${cashDenom})` : 'Cash on Delivery',
          card_pos: 'Mobile POS Machine on Bowser Truck (Card Swipe)',
          qr_pos: 'Bowser Flowmeter BharatQR Payment',
        };
        const record = createPaymentRecord({
          method: 'pod',
          methodTitle: titleMap[podType],
          amount: total,
          subtotal,
          deliveryFee,
          podType,
          changeRequiredFor: cashDenom,
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

  // Called when Fleet Card completes successfully
  const handleFleetCardSuccess = (fleet: {
    provider: FleetCardDetails['provider'];
    cardNumber: string;
    vehicleReg: string;
    odometer: string;
    authCode: string;
    rrn: string;
  }) => {
    setIsFleetModalOpen(false);
    const record = createPaymentRecord({
      method: 'fleet_card',
      methodTitle: `${fleet.provider} (${fleet.vehicleReg})`,
      amount: total,
      subtotal,
      deliveryFee,
      fleetProvider: fleet.provider,
      fleetCardNumber: fleet.cardNumber,
      fleetVehicleReg: fleet.vehicleReg,
      fleetOdometer: fleet.odometer,
    });
    record.authCode = fleet.authCode;
    record.rrn = fleet.rrn;
    setCompletedPayment(record);
    setIsReceiptOpen(true);
  };

  // Called when Pay Later completes successfully
  const handlePayLaterSuccess = (pl: {
    provider: PayLaterDetails['provider'];
    authCode: string;
    rrn: string;
  }) => {
    setIsPayLaterModalOpen(false);
    const record = createPaymentRecord({
      method: 'pay_later',
      methodTitle: `${pl.provider} 1-Tap Credit`,
      amount: total,
      subtotal,
      deliveryFee,
      payLaterProvider: pl.provider,
    });
    record.authCode = pl.authCode;
    record.rrn = pl.rrn;
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

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4 pb-28">
        {/* Delivery Address Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">{location.name}</span>
                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  {distance * 1000}m away (15 min ETA)
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs">{location.address}, {location.city}</p>
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
              <span>₹{Math.round(subtotal * 0.18)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Total Payable Amount</span>
              <span className="text-orange-600 text-base">₹{total}</span>
            </div>
          </div>
        </div>

        {/* EVERY PAYMENT OPTION SELECTOR */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Select Payment Method</h2>
              <p className="text-[11px] text-slate-500">All payment channels supported with instant GST tax receipts</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              256-Bit SSL
            </span>
          </div>

          {/* Payment Method Badges / Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* 1. UPI */}
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                paymentMethod === 'upi'
                  ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <QrCode className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-[10px] bg-orange-500 text-white font-bold px-1.5 py-0.2 rounded">Fast</span>
              </div>
              <div>
                <span className="text-xs font-bold block">UPI / QR</span>
                <span className="text-[10px] text-slate-500">GPay, PhonePe, QR</span>
              </div>
            </button>

            {/* 2. Cards */}
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                paymentMethod === 'card'
                  ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-[10px] text-slate-400 font-mono">3DS</span>
              </div>
              <div>
                <span className="text-xs font-bold block">Cards</span>
                <span className="text-[10px] text-slate-500">Visa, RuPay, MC</span>
              </div>
            </button>

            {/* 3. Corporate Fleet Cards */}
            <button
              type="button"
              onClick={() => setPaymentMethod('fleet_card')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                paymentMethod === 'fleet_card'
                  ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Truck className={`w-5 h-5 ${paymentMethod === 'fleet_card' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-[10px] bg-blue-600 text-white font-bold px-1 rounded">Fleet</span>
              </div>
              <div>
                <span className="text-xs font-bold block">Fleet Cards</span>
                <span className="text-[10px] text-slate-500">IOCL, BPCL, HPCL</span>
              </div>
            </button>

            {/* 4. Net Banking */}
            <button
              type="button"
              onClick={() => setPaymentMethod('netbanking')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                paymentMethod === 'netbanking'
                  ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Landmark className={`w-5 h-5 ${paymentMethod === 'netbanking' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-[10px] text-slate-400">40+</span>
              </div>
              <div>
                <span className="text-xs font-bold block">Net Banking</span>
                <span className="text-[10px] text-slate-500">All major banks</span>
              </div>
            </button>

            {/* 5. Wallets */}
            <button
              type="button"
              onClick={() => setPaymentMethod('wallet')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                paymentMethod === 'wallet'
                  ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Wallet className={`w-5 h-5 ${paymentMethod === 'wallet' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-[10px] text-emerald-600 font-bold">₹{walletBalance}</span>
              </div>
              <div>
                <span className="text-xs font-bold block">Wallets</span>
                <span className="text-[10px] text-slate-500">Fugo, Paytm, Amazon</span>
              </div>
            </button>

            {/* 6. Pay Later / BNPL */}
            <button
              type="button"
              onClick={() => setPaymentMethod('pay_later')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                paymentMethod === 'pay_later'
                  ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Sparkles className={`w-5 h-5 ${paymentMethod === 'pay_later' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-1 rounded">0% Int</span>
              </div>
              <div>
                <span className="text-xs font-bold block">Pay Later</span>
                <span className="text-[10px] text-slate-500">Simpl, LazyPay</span>
              </div>
            </button>

            {/* 7. Pay On Delivery (POD) */}
            <button
              type="button"
              onClick={() => setPaymentMethod('pod')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all col-span-2 ${
                paymentMethod === 'pod'
                  ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <Banknote className={`w-5 h-5 ${paymentMethod === 'pod' ? 'text-orange-600' : 'text-slate-500'}`} />
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">On Truck Arrival</span>
              </div>
              <div>
                <span className="text-xs font-bold block">Pay On Delivery (POD)</span>
                <span className="text-[10px] text-slate-500">Cash, Mobile POS Card Swipe or BharatQR on Bowser</span>
              </div>
            </button>
          </div>

          {/* ACTIVE METHOD CONFIGURATION PANEL */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {/* 1. UPI PANEL */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setUpiSubMode('qr')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      upiSubMode === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Dynamic QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiSubMode('apps')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      upiSubMode === 'apps' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    UPI Apps
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiSubMode('vpa')}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      upiSubMode === 'vpa' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    UPI ID / VPA
                  </button>
                </div>

                {upiSubMode === 'qr' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        Valid for {timerDisplay}
                      </span>
                      <span className="font-bold text-slate-700">ICICI FastSwitch Gateway</span>
                    </div>

                    <div className="w-52 h-52 bg-white rounded-2xl p-2 mx-auto shadow-md border border-slate-200 flex items-center justify-center">
                      {upiQrUrl ? (
                        <img src={upiQrUrl} alt="UPI Payment QR" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Scan with ANY UPI App to pay ₹{total}</p>
                      <p className="text-[11px] text-slate-500">Google Pay • PhonePe • Paytm • BHIM • CRED • Amazon Pay</p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2">
                      <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                        {FUGO_MERCHANT_VPA}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600"
                        title="Copy VPA"
                      >
                        {copiedVpa ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {upiSubMode === 'apps' && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                      Choose Your Preferred UPI App
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {UPI_APPS.map((app) => {
                        const isSel = selectedUpiApp === app.id;
                        return (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              isSel
                                ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{app.icon}</span>
                            <span className="text-xs font-bold block text-slate-800">{app.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {upiSubMode === 'vpa' && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                      Enter Your UPI ID / VPA
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiVpaInput}
                        onChange={(e) => setUpiVpaInput(e.target.value)}
                        placeholder="e.g. mobile@okhdfcbank or user@paytm"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                      />
                      <Smartphone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                    <div className="flex gap-2">
                      {['@okhdfcbank', '@paytm', '@ybl', '@ibl'].map((suf) => (
                        <button
                          key={suf}
                          type="button"
                          onClick={() => setUpiVpaInput(prev => (prev.split('@')[0] || '9876543210') + suf)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-semibold text-slate-700"
                        >
                          {suf}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. CARDS PANEL */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Credit / Debit Card Details
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFillDemoCard('visa')}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      Fill Visa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillDemoCard('rupay')}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      Fill RuPay
                    </button>
                  </div>
                </div>

                {/* Card Number */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={19}
                      value={cardDetails.number}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="Card Number (0000 0000 0000 0000)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    />
                    <span className="absolute right-3.5 top-2.5 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {cardDetails.brand}
                    </span>
                  </div>
                  {cardErrors.number && <p className="text-[10px] text-rose-600 mt-1">{cardErrors.number}</p>}
                </div>

                {/* Cardholder Name */}
                <div>
                  <input
                    type="text"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                    placeholder="Cardholder Name as on card"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                  {cardErrors.name && <p className="text-[10px] text-rose-600 mt-1">{cardErrors.name}</p>}
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardDetails.expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    />
                    {cardErrors.expiry && <p className="text-[10px] text-rose-600 mt-1">{cardErrors.expiry}</p>}
                  </div>

                  <div className="relative">
                    <input
                      type={showCvv ? 'text' : 'password'}
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                      placeholder="CVV"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(prev => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    id="saveCard"
                    checked={cardDetails.saveCard}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, saveCard: e.target.checked }))}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="saveCard" className="text-xs">
                    Securely save card for 1-click future fuel refills (RBI Tokenized)
                  </label>
                </div>
              </div>
            )}

            {/* 3. CORPORATE FLEET CARDS PANEL */}
            {paymentMethod === 'fleet_card' && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-700" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-950">Corporate Fleet Card Program</h4>
                      <p className="text-[11px] text-blue-800">IndianOil XTRAPOWER • BPCL SmartFleet • HPCL DriveTrack • Shell</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  Direct invoicing to your corporate account with vehicle registration number, odometer validation, and automated fuel tax slips.
                </p>

                <button
                  type="button"
                  onClick={() => setIsFleetModalOpen(true)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Configure Fleet Card & Authorize ₹{total}</span>
                </button>
              </div>
            )}

            {/* 4. NET BANKING PANEL */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                  Select Popular Bank
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_BANKS.slice(0, 6).map((bank) => {
                    const isSel = selectedBank === bank.name;
                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBank(bank.name)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                          isSel
                            ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-orange-950'
                            : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span>{bank.icon}</span>
                        <span className="truncate">{bank.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* All Banks Search Dropdown */}
                <div className="pt-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
                    Or Search All Other Banks
                  </label>
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Search bank name (SBI, Kotak, ICICI, etc.)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                  />
                  {bankSearch && (
                    <div className="max-h-32 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                      {filteredBanks.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBank(b.name);
                            setBankSearch('');
                          }}
                          className="w-full p-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800">{b.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{b.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Selected: <strong className="text-slate-800">{selectedBank}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. WALLET PANEL */}
            {paymentMethod === 'wallet' && (
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                  Select Digital Fuel Wallet
                </label>
                <div className="space-y-2">
                  {WALLET_PROVIDERS.map((w) => {
                    const isSel = selectedWallet === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWallet(w.id);
                          setWalletError('');
                        }}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSel
                            ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">{w.name}</div>
                          <div className="text-[11px] text-slate-500">{w.subtitle}</div>
                        </div>
                        {w.id === 'fugo' && (
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                            Balance: ₹{walletBalance}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedWallet === 'fugo' && (
                  <div className="pt-2 space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                      Wallet Security PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={walletPin}
                      onChange={(e) => setWalletPin(e.target.value)}
                      placeholder="••••"
                      className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-center text-sm font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {walletError && <p className="text-[11px] text-rose-600">{walletError}</p>}
                  </div>
                )}
              </div>
            )}

            {/* 6. PAY LATER / BNPL PANEL */}
            {paymentMethod === 'pay_later' && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-700" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Fuel Pay Later & Enterprise Credit</h4>
                    <p className="text-[11px] text-emerald-800">Simpl (1-Tap) • LazyPay • 30-Day Fleet Credit</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Refuel now and pay with your consolidated bi-weekly or monthly statement with 0% extra fees.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPayLaterModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Choose Credit Partner & Verify</span>
                </button>
              </div>
            )}

            {/* 7. PAY ON DELIVERY (POD) PANEL */}
            {paymentMethod === 'pod' && (
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                  Select On-Arrival Payment Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'card_pos', name: 'Mobile POS Swipe', desc: 'Driver brings POS machine for Card / Tap' },
                    { id: 'qr_pos', name: 'Bowser BharatQR', desc: 'Dynamic QR on digital flowmeter' },
                    { id: 'cash', name: 'Cash on Delivery', desc: 'Pay driver in cash upon dispensing' },
                  ].map((pod) => {
                    const isSel = podType === pod.id;
                    return (
                      <button
                        key={pod.id}
                        type="button"
                        onClick={() => setPodType(pod.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSel
                            ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-800">{pod.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{pod.desc}</div>
                      </button>
                    );
                  })}
                </div>

                {podType === 'cash' && (
                  <div className="pt-2 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">
                      Need Change from Driver?
                    </label>
                    <div className="flex gap-2">
                      {[undefined, 500, 2000].map((denom) => (
                        <button
                          key={String(denom)}
                          type="button"
                          onClick={() => setCashDenom(denom)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            cashDenom === denom
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          {denom ? `Change for ₹${denom}` : 'Exact Cash'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Bottom Bar with Primary Action */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 p-4 shadow-xl z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Total Payable</span>
            <span className="text-xl font-black text-slate-900">₹{total}</span>
          </div>

          <button
            type="button"
            disabled={isVerifyingPayment}
            onClick={handleInitiatePayment}
            className="flex-1 max-w-sm py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {isVerifyingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Pay ₹{total} & Confirm Order</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* 3D SECURE OTP MODAL FOR CARDS */}
      <ThreeDSecureModal
        isOpen={is3DSOpen}
        cardDetails={cardDetails}
        amount={total}
        onClose={() => setIs3DSOpen(false)}
        onSuccess={handleCard3DSSuccess}
      />

      {/* NETBANKING MODAL */}
      <NetBankingModal
        isOpen={isNetBankingOpen}
        bankName={selectedBank}
        amount={total}
        onClose={() => setIsNetBankingOpen(false)}
        onSuccess={handleNetBankingSuccess}
      />

      {/* FLEET CARD MODAL */}
      <FleetCardModal
        isOpen={isFleetModalOpen}
        amount={total}
        onClose={() => setIsFleetModalOpen(false)}
        onSuccess={handleFleetCardSuccess}
      />

      {/* PAY LATER MODAL */}
      <PayLaterModal
        isOpen={isPayLaterModalOpen}
        amount={total}
        onClose={() => setIsPayLaterModalOpen(false)}
        onSuccess={handlePayLaterSuccess}
      />

      {/* OFFICIAL TAX INVOICE & RECEIPT MODAL */}
      {completedPayment && (
        <PaymentReceiptModal
          isOpen={isReceiptOpen}
          orderId={completedPayment.transactionId}
          items={cart}
          deliveryAddress={`${location.name}: ${location.address}, ${location.city}`}
          payment={completedPayment}
          onProceedToTracking={handleProceedToTracking}
        />
      )}

      {/* COMPANION DRIVER APP SYNCHRONIZATION MODAL */}
      <CompanionSyncModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
      />
    </div>
  );
}
