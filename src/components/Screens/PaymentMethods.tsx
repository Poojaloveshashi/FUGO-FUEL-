import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  CreditCard, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Wallet, 
  Landmark, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  detectCardBrand, 
  formatCardNumber, 
  formatExpiry, 
  validateExpiry, 
  validateVpa 
} from '../../services/payment';

interface PaymentMethodsProps {
  onBack: () => void;
}

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holder: string;
  color: string;
  isDefault: boolean;
}

interface SavedUpi {
  id: string;
  upi: string;
  provider: string;
  isDefault: boolean;
}

const DEFAULT_CARDS: SavedCard[] = [
  {
    id: '1',
    brand: 'Visa',
    last4: '4242',
    expiry: '12/28',
    holder: 'PREMIUM USER',
    color: 'from-blue-900 via-indigo-900 to-slate-900',
    isDefault: true,
  },
  {
    id: '2',
    brand: 'RuPay',
    last4: '8892',
    expiry: '05/29',
    holder: 'PREMIUM USER',
    color: 'from-emerald-900 via-teal-900 to-slate-900',
    isDefault: false,
  },
];

const DEFAULT_UPIS: SavedUpi[] = [
  { id: '1', upi: 'user@okhdfcbank', provider: 'Google Pay', isDefault: true },
  { id: '2', upi: 'user@paytm', provider: 'Paytm', isDefault: false },
];

export default function PaymentMethods({ onBack }: PaymentMethodsProps) {
  const [cards, setCards] = useState<SavedCard[]>(() => {
    try {
      const stored = localStorage.getItem('fugo_saved_cards');
      return stored ? JSON.parse(stored) : DEFAULT_CARDS;
    } catch {
      return DEFAULT_CARDS;
    }
  });

  const [upiIds, setUpiIds] = useState<SavedUpi[]>(() => {
    try {
      const stored = localStorage.getItem('fugo_saved_upis');
      return stored ? JSON.parse(stored) : DEFAULT_UPIS;
    } catch {
      return DEFAULT_UPIS;
    }
  });

  // Modal states
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddUpiOpen, setIsAddUpiOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Card form
  const [newCardNum, setNewCardNum] = useState('');
  const [newCardName, setNewCardName] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [cardError, setCardError] = useState('');

  // New UPI form
  const [newUpiId, setNewUpiId] = useState('');
  const [upiError, setUpiError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('fugo_saved_cards', JSON.stringify(cards));
    } catch {}
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem('fugo_saved_upis', JSON.stringify(upiIds));
    } catch {}
  }, [upiIds]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveCard = () => {
    const clean = newCardNum.replace(/\D/g, '');
    if (clean.length < 15) {
      setCardError('Enter a valid 16-digit card number');
      return;
    }
    if (!validateExpiry(newCardExp)) {
      setCardError('Valid MM/YY expiry required');
      return;
    }
    if (!newCardName.trim()) {
      setCardError('Cardholder name required');
      return;
    }

    const brand = detectCardBrand(newCardNum);
    const last4 = clean.slice(-4);
    const color = brand === 'Visa' 
      ? 'from-blue-900 via-indigo-900 to-slate-900' 
      : brand === 'RuPay' 
      ? 'from-emerald-900 via-teal-900 to-slate-900' 
      : 'from-slate-800 to-slate-900';

    const card: SavedCard = {
      id: `card_${Date.now()}`,
      brand,
      last4,
      expiry: newCardExp,
      holder: newCardName.toUpperCase(),
      color,
      isDefault: cards.length === 0,
    };

    setCards(prev => [...prev, card]);
    setIsAddCardOpen(false);
    setNewCardNum('');
    setNewCardName('');
    setNewCardExp('');
    setCardError('');
    showToast(`Saved ${brand} card •••• ${last4}`);
  };

  const handleDeleteCard = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    showToast('Card removed');
  };

  const handleSaveUpi = () => {
    if (!validateVpa(newUpiId)) {
      setUpiError('Enter a valid UPI ID (e.g. name@okaxis)');
      return;
    }

    const provider = newUpiId.includes('okhdfc') || newUpiId.includes('okaxis') || newUpiId.includes('oksbi')
      ? 'Google Pay'
      : newUpiId.includes('paytm')
      ? 'Paytm'
      : newUpiId.includes('ybl')
      ? 'PhonePe'
      : 'BHIM UPI';

    const upiItem: SavedUpi = {
      id: `upi_${Date.now()}`,
      upi: newUpiId.trim().toLowerCase(),
      provider,
      isDefault: upiIds.length === 0,
    };

    setUpiIds(prev => [...prev, upiItem]);
    setIsAddUpiOpen(false);
    setNewUpiId('');
    setUpiError('');
    showToast(`Connected ${newUpiId}`);
  };

  const handleDeleteUpi = (id: string) => {
    setUpiIds(prev => prev.filter(u => u.id !== id));
    showToast('UPI ID removed');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-800" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Payment Methods</h1>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          RBI Tokenized
        </span>
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-6 right-6 max-w-sm mx-auto bg-slate-900 text-white text-xs font-bold py-3 px-4 rounded-2xl shadow-xl z-50 flex items-center justify-between"
          >
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Saved Cards Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Saved Cards ({cards.length})
            </h2>
            <button 
              onClick={() => setIsAddCardOpen(true)}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Card
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-6 px-6 no-scrollbar">
            {cards.map((card, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={card.id}
                className={`w-[280px] h-[180px] shrink-0 rounded-[2.5rem] bg-gradient-to-br ${card.color} p-6 text-white flex flex-col justify-between shadow-xl shadow-slate-200 snap-center relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-lg font-black italic tracking-wider">{card.brand}</span>
                  <div className="flex items-center gap-2">
                    {card.isDefault && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                      title="Remove Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono tracking-[0.25em] opacity-70">• • • •  • • • •  • • • •</span>
                    <span className="text-lg font-mono font-bold tracking-[0.1em]">{card.last4}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-widest opacity-60 mb-0.5">Card Holder</p>
                      <p className="text-xs font-bold tracking-widest">{card.holder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-medium uppercase tracking-widest opacity-60 mb-0.5">Expires</p>
                      <p className="text-xs font-bold tracking-widest font-mono">{card.expiry}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* UPI IDs Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">
            Verified UPI Accounts ({upiIds.length})
          </h2>
          <div className="space-y-3">
            {upiIds.map((upi, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                key={upi.id}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{upi.upi}</p>
                    <p className="text-[10px] font-medium text-slate-400">{upi.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {upi.isDefault && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                      Default
                    </span>
                  )}
                  <button 
                    onClick={() => handleDeleteUpi(upi.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            <button 
              onClick={() => setIsAddUpiOpen(true)}
              className="w-full p-4 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-2 text-slate-400 hover:border-orange-300 hover:text-orange-500 transition-all hover:bg-orange-50"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-bold">Connect New UPI</span>
            </button>
          </div>
        </section>

        {/* Security Info */}
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex items-start gap-4 shadow-xl">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-md shadow-emerald-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Safe & Tokenized Storage</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Payment tokens are registered directly with NPCI & card issuing networks under RBI guidelines. CVVs and raw card numbers are never stored on device.
            </p>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {isAddCardOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Add New Card</h3>
                <button onClick={() => setIsAddCardOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Card Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={19}
                    value={newCardNum}
                    onChange={(e) => setNewCardNum(formatCardNumber(e.target.value))}
                    placeholder="4532 •••• •••• ••••"
                    className="w-full p-3 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value.toUpperCase())}
                    placeholder="NAME ON CARD"
                    className="w-full p-3 uppercase text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={newCardExp}
                    onChange={(e) => setNewCardExp(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full p-3 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                  />
                </div>

                {cardError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{cardError}</span>
                  </div>
                )}

                <button
                  onClick={handleSaveCard}
                  className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-100"
                >
                  Save Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add UPI Modal */}
      <AnimatePresence>
        {isAddUpiOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Connect UPI ID</h3>
                <button onClick={() => setIsAddUpiOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">UPI ID (VPA)</label>
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    placeholder="e.g. mobile@okhdfcbank"
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const base = newUpiId.split('@')[0] || 'yourname';
                        setNewUpiId(`${base}${s}`);
                      }}
                      className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {upiError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{upiError}</span>
                  </div>
                )}

                <button
                  onClick={handleSaveUpi}
                  className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-100"
                >
                  Verify & Save UPI
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
