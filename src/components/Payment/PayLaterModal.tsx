import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, X, CheckCircle2, Clock, Smartphone, AlertCircle, Building2 } from 'lucide-react';
import { PayLaterDetails } from '../../services/payment';

interface PayLaterModalProps {
  isOpen: boolean;
  amount: number;
  userPhone?: string;
  onClose: () => void;
  onSuccess: (payLaterData: {
    provider: PayLaterDetails['provider'];
    authCode: string;
    rrn: string;
  }) => void;
}

export default function PayLaterModal({
  isOpen,
  amount,
  userPhone = '+91 98765 43210',
  onClose,
  onSuccess,
}: PayLaterModalProps) {
  const [provider, setProvider] = useState<PayLaterDetails['provider']>('Simpl');
  const [phone, setPhone] = useState(userPhone);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState('7392');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid mobile number linked with your credit account');
      return;
    }
    setError(null);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('otp');
    }, 700);
  };

  const handleConfirmPayment = () => {
    if (otp.length < 4) {
      setError('Please enter 4-digit approval code');
      return;
    }
    setError(null);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        provider,
        authCode: `PL_${Math.floor(100000 + Math.random() * 900000)}`,
        rrn: `RRN_${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      });
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 border-b border-emerald-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Fuel Pay Later & BNPL</h3>
                  <span className="text-[10px] text-emerald-300 block">0% Interest Fuel Credit</span>
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
                <span className="text-[9px] text-emerald-200 uppercase tracking-widest block">Billing Cycle</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  15th & 30th of Month
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-emerald-200 uppercase tracking-widest block">Due Amount</span>
                <span className="text-sm font-extrabold text-emerald-300">₹{amount}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Provider Selector */}
            {step === 'details' ? (
              <>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1.5">
                    Select Credit Partner
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'Simpl', name: 'Simpl Pay Later', limit: '₹12,000 available', desc: '1-tap fuel checkout' },
                      { id: 'LazyPay', name: 'LazyPay by PayU', limit: '₹15,000 available', desc: 'Pay on 3rd & 18th' },
                      { id: 'Corporate 30-Day Fleet Credit', name: 'Corporate Fleet Credit Line', limit: '₹1,50,000 corporate quota', desc: 'Monthly consolidated GST invoice' },
                    ].map((p) => {
                      const isSel = provider === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setProvider(p.id as any)}
                          className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                            isSel
                              ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-800">{p.name}</div>
                            <div className="text-[11px] text-slate-500">{p.desc}</div>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                            {p.limit}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSendOtp}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue with {provider}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="text-center py-2 space-y-1">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Authorize {provider} Fuel Debit</h4>
                  <p className="text-xs text-slate-500">
                    Enter the 4-digit code sent to <span className="font-mono font-bold">{phone}</span>
                  </p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1 text-center">
                    Security Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center tracking-[1em] font-mono text-xl font-extrabold bg-slate-50 border border-slate-300 rounded-2xl py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmPayment}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Pay ₹{amount}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-700"
                >
                  ← Back to options
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
