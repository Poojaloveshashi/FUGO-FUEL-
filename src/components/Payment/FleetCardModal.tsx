import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShieldCheck, X, Truck, CheckCircle2, AlertCircle, Building2, Fuel } from 'lucide-react';
import { FLEET_CARD_PROVIDERS, FleetCardDetails, formatFleetCardNumber } from '../../services/payment';

interface FleetCardModalProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onSuccess: (fleetData: {
    provider: FleetCardDetails['provider'];
    cardNumber: string;
    vehicleReg: string;
    odometer: string;
    authCode: string;
    rrn: string;
  }) => void;
}

export default function FleetCardModal({
  isOpen,
  amount,
  onClose,
  onSuccess,
}: FleetCardModalProps) {
  const [provider, setProvider] = useState<FleetCardDetails['provider']>('IndianOil XTRAPOWER');
  const [cardNumber, setCardNumber] = useState('7083 4512 8820 9014');
  const [pin, setPin] = useState('4821');
  const [vehicleReg, setVehicleReg] = useState('TS 09 EA 4821');
  const [odometer, setOdometer] = useState('68,420');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCardNumberChange = (val: string) => {
    setCardNumber(formatFleetCardNumber(val));
    setError(null);
  };

  const handleAuthorize = () => {
    const rawNumber = cardNumber.replace(/\D/g, '');
    if (rawNumber.length < 12) {
      setError('Please enter a valid 16-digit Fleet Card number');
      return;
    }
    if (!pin || pin.length < 4) {
      setError('Please enter your 4-digit Fleet TPIN / Security PIN');
      return;
    }
    if (!vehicleReg.trim()) {
      setError('Vehicle Registration number is required for fuel accounting');
      return;
    }

    setIsAuthorizing(true);
    setError(null);

    setTimeout(() => {
      setIsAuthorizing(false);
      onSuccess({
        provider,
        cardNumber,
        vehicleReg: vehicleReg.toUpperCase(),
        odometer: odometer.trim(),
        authCode: `FLT_${Math.floor(100000 + Math.random() * 900000)}`,
        rrn: `RRN_${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      });
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                  <Truck className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Corporate Fuel Fleet Card</h3>
                  <span className="text-[10px] text-slate-400 block">Fleet Management POS Network</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-slate-300 uppercase tracking-widest block">Authorized Fleet</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-orange-400" />
                  National Logistics Logistics Ltd
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-300 uppercase tracking-widest block">Fuel Invoice</span>
                <span className="text-sm font-extrabold text-orange-400">₹{amount}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Select Provider */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1.5">
                Fleet Program Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FLEET_CARD_PROVIDERS.map((p) => {
                  const isSel = provider === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProvider(p)}
                      className={`px-3 py-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                        isSel
                          ? 'bg-orange-50 border-orange-500 text-orange-950 ring-1 ring-orange-500'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Fuel className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-orange-600' : 'text-slate-400'}`} />
                        <span className="truncate">{p}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fleet Card Number */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
                16-Digit Fleet Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="7083 4512 8820 9014"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {/* Row: PIN + Vehicle Reg */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
                  Card PIN / TPIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
                  Vehicle Reg Plate
                </label>
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                  placeholder="TS 09 EA 4821"
                  className="w-full bg-amber-50/70 border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-extrabold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Odometer */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
                Current Odometer (km)
              </label>
              <input
                type="text"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="e.g. 68,420"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Pre-approved Fleet Balance:
              </span>
              <span className="font-bold text-emerald-700 font-mono">₹75,000</span>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={isAuthorizing}
              onClick={handleAuthorize}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isAuthorizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing Fleet Dispenser...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize & Pay ₹{amount}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
