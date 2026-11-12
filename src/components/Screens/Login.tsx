import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  ArrowRight, 
  Mail, 
  KeyRound, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '../../supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';

interface LoginProps {
  onLoginSuccess: (user: SupabaseAuthUser) => void;
}

type LoginStep = 'email' | 'otp' | 'profile';

export default function Login({ onLoginSuccess }: LoginProps) {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  const [verifiedUser, setVerifiedUser] = useState<SupabaseAuthUser | null>(null);

  // 30-second countdown timer for resending OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Step 1: Send verification email with 6-digit code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error('Supabase signInWithOtp error:', error);
        setErrorMsg('Something went wrong. Please try again.');
        return;
      }

      setStep('otp');
      setResendCountdown(30);
      setSuccessMsg(`We sent a 6-digit verification code to ${cleanEmail}`);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (resendCountdown > 0 || loading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
      });

      if (error) {
        console.error('Resend OTP error:', error);
        setErrorMsg('Something went wrong. Please try again.');
        return;
      }

      setResendCountdown(30);
      setSuccessMsg(`A new code has been sent to ${cleanEmail}`);
    } catch (err) {
      console.error('Resend error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim();
    if (cleanCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: cleanCode,
        type: 'email',
      });

      if (error) {
        console.error('Supabase verifyOtp error:', error);
        const raw = (error.message || '').toLowerCase();
        if (raw.includes('expired')) {
          setErrorMsg('Code expired. Please request a new code.');
        } else if (raw.includes('invalid') || raw.includes('token') || raw.includes('wrong')) {
          setErrorMsg('Wrong code. Please check your email and try again.');
        } else {
          setErrorMsg('Something went wrong. Please try again.');
        }
        return;
      }

      if (data?.user) {
        const user = data.user;
        const meta = user.user_metadata || {};
        
        // If user already has full_name and phone in profile, finish immediately
        if (meta.full_name && meta.phone) {
          onLoginSuccess(user);
        } else {
          // Ask for name and phone number once after the first login
          setVerifiedUser(user);
          setFullName(meta.full_name || '');
          setPhoneNumber(meta.phone || '');
          setStep('profile');
        }
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Verify error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete profile on first login (full_name & phone)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(0, 10);

    if (!cleanName) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
          phone: cleanPhone,
        },
      });

      if (error) {
        console.error('Supabase updateUser error:', error);
        setErrorMsg('Something went wrong. Please try again.');
        return;
      }

      const updatedUser = data?.user || verifiedUser;
      if (updatedUser) {
        onLoginSuccess(updatedUser);
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-200 text-white"
          >
            <Wrench className="w-8 h-8" />
          </motion.div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fugo Customer Account</h1>
            <p className="text-xs text-slate-500">
              {step === 'email' && 'Sign in or create account with email verification'}
              {step === 'otp' && 'Enter the 6-digit security code sent to your email'}
              {step === 'profile' && 'Complete your personal contact information'}
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{errorMsg}</div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-snug">{successMsg}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: Email Input */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 ml-1">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
                We will email you a secure 6-digit login code. No password needed.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl py-3.5 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending Code...
                </span>
              ) : (
                <>
                  <span>Send Login Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  6-Digit Email Code
                </label>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtpCode(''); setErrorMsg(null); }}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700"
                >
                  Change Email
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(clean);
                    setErrorMsg(null);
                  }}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-center tracking-[0.4em] font-mono text-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl py-3.5 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying Code...
                </span>
              ) : (
                <>
                  <span>Verify & Sign In</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Code Action */}
            <div className="text-center pt-2">
              {resendCountdown > 0 ? (
                <p className="text-xs text-slate-400">
                  Resend code in <strong className="font-mono text-slate-600">{resendCountdown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1.5 mx-auto active:scale-95 transition-transform"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Profile Completion on First Login */}
        {step === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 leading-relaxed">
              Welcome! Please provide your name and phone number for delivery contact & dispatch updates.
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 ml-1">
                Mobile Number (10 digits)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !fullName.trim() || phoneNumber.length < 10}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-50 text-white rounded-xl py-3.5 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Profile...
                </span>
              ) : (
                <>
                  <span>Save & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure one-time code authentication</span>
        </div>
      </div>
    </div>
  );
}
