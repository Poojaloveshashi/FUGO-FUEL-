import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, ShieldCheck, Lock, X, CheckCircle2 } from 'lucide-react';

interface NetBankingModalProps {
  isOpen: boolean;
  bankName: string;
  amount: number;
  onClose: () => void;
  onSuccess: (authData: { authCode: string; rrn: string }) => void;
}

export default function NetBankingModal({
  isOpen,
  bankName,
  amount,
  onClose,
  onSuccess,
}: NetBankingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [accountId, setAccountId] = useState('• • • • 9012 (Savings A/c)');

  if (!isOpen) return null;

  const handleAuthorize = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        authCode: `NB_${Math.floor(100000 + Math.random() * 900000)}`,
        rrn: `RRN_${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      });
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Bank Portal Header */}
          <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600/30 rounded-xl flex items-center justify-center border border-blue-500/40">
                  <Landmark className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{bankName}</h3>
                  <span className="text-[10px] text-slate-400 block">Retail Internet Banking</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Beneficiary</span>
                <span className="font-bold text-white">Fugo Energy Logistics</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Debitable Total</span>
                <span className="text-sm font-extrabold text-orange-400">₹{amount}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Select Debit Account
              </label>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{bankName}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{accountId}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                You are connecting via bank direct API integration. One-click authorization enabled for verified customer.
              </p>
            </div>

            <button
              onClick={handleAuthorize}
              disabled={isProcessing}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                isProcessing
                  ? 'bg-slate-900 text-white cursor-wait'
                  : 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Connecting to {bankName}...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize Transfer of ₹{amount}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Direct Bank Settlement Protocol</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
