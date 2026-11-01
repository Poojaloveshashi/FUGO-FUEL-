import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Smartphone, RefreshCw, X, AlertCircle } from 'lucide-react';
import { CardDetails } from '../../services/payment';

interface ThreeDSecureModalProps {
  isOpen: boolean;
  amount: number;
  cardDetails: CardDetails;
  onClose: () => void;
  onSuccess: (authData: { authCode: string; rrn: string }) => void;
}

export default function ThreeDSecureModal({
  isOpen,
  amount,
  cardDetails,
  onClose,
  onSuccess,
}: ThreeDSecureModalProps) {
  const [otp, setOtp] = useState('');
  const [demoOtp] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const last4 = cardDetails.number.replace(/\D/g, '').slice(-4) || '4242';
  const brand = cardDetails.brand || 'Visa';

  useEffect(() => {
    if (!isOpen) {
      setOtp('');
      setError('');
      setTimeLeft(60);
      setIsVerifying(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleVerify = () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onSuccess({
        authCode: `AUTH_${Math.floor(100000 + Math.random() * 900000)}`,
        rrn: `RRN_${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      });
    }, 1600);
  };

  const handleAutofill = () => {
    setOtp(demoOtp);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Bank Security Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-blue-300 uppercase block">
                    Verified by {brand}
                  </span>
                  <span className="text-xs font-bold text-white">3D Secure 2.0 Gateway</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[9px] text-blue-200 block">Merchant</span>
                <span className="font-bold text-white">Fugo Energy Ltd</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-blue-200 block">Card Ending</span>
                <span className="font-mono font-bold text-white">•••• {last4}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-blue-200 block">Amount</span>
                <span className="font-extrabold text-orange-400 text-sm">₹{amount}</span>
              </div>
            </div>
          </div>

          {/* OTP Body */}
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>OTP sent to +91 ••••••7890</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Enter the 6-digit verification code sent to your registered mobile number.
              </p>
            </div>

            {/* Test Helper Pill */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-medium text-amber-900">
                  Demo OTP: <strong className="font-mono font-bold text-amber-950">{demoOtp}</strong>
                </span>
              </div>
              <button
                onClick={handleAutofill}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors"
              >
                Auto-fill
              </button>
            </div>

            {/* OTP Input Field */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block text-center">
                One-Time Password
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                  if (error) setError('');
                }}
                placeholder="• • • • • •"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono font-bold py-3 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all placeholder:text-slate-300"
              />
              {error && (
                <div className="flex items-center justify-center gap-1 text-red-500 text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Resend Timer */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Didn't receive code?</span>
              {timeLeft > 0 ? (
                <span className="font-medium text-slate-500 font-mono">Resend in 0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
              ) : (
                <button
                  onClick={() => setTimeLeft(60)}
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP
                </button>
              )}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || otp.length < 6}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                isVerifying || otp.length < 6
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isVerifying ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Authenticating with Bank...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Submit & Pay ₹{amount}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>256-bit SSL Banking Encryption • RBI Compliant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
