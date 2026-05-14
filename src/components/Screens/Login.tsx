import { useState } from 'react';
import * as React from 'react';
import { motion } from 'motion/react';
import { Fuel, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (phone: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      if (phone.length >= 10) setOtpSent(true);
    } else {
      if (otp.length === 4) onLogin(phone);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200"
      >
        <Fuel className="text-white w-10 h-10" />
      </motion.div>
      
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Fugo Fuel</h1>
      <p className="text-slate-500 mb-10 text-sm">Fuel & spare parts delivered in 15 mins</p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {!otpSent ? (
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 border-r pr-3">+91</span>
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-16 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={phone.length < 10}
              className="w-full bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 group"
            >
              Get OTP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Sent to {phone}</p>
            <input
              type="text"
              placeholder="4-digit OTP"
              className="w-full bg-white border border-slate-200 rounded-xl py-4 px-4 text-center text-2xl tracking-[1em] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
            />
            <button
              type="submit"
              disabled={otp.length < 4}
              className="w-full bg-orange-500 border-2 border-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl py-4 font-bold shadow-lg shadow-orange-200 transition-all"
            >
              Verify & Start
            </button>
            <button 
              type="button" 
              onClick={() => setOtpSent(false)}
              className="text-slate-400 text-sm hover:text-orange-500 transition-colors"
            >
              Edit Phone Number
            </button>
          </div>
        )}
      </form>

      <p className="mt-auto text-slate-400 text-[10px] uppercase tracking-widest">Powered by Antigravity</p>
    </div>
  );
}
