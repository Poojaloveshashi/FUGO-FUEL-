import { ChevronLeft, Calendar, MapPin, Wrench, Shield, ArrowRight, HelpCircle, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface AppointmentBookingProps {
  onBack: () => void;
  onBook: () => void;
}

export default function AppointmentBooking({ onBack, onBook }: AppointmentBookingProps) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const commonIssues = [
    { id: 'engine', label: 'Engine Problems', icon: '🔥' },
    { id: 'brakes', label: 'Brake Issues', icon: '🛑' },
    { id: 'electric', label: 'Electrical Fault', icon: '⚡' },
    { id: 'suspension', label: 'Suspension', icon: '🛣️' },
    { id: 'unknown', label: 'Other / Not Sure', icon: '❓' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Book Appointment</h1>
        </div>
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-600" />
        </div>
      </header>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto pb-32">
        {/* Banner */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
                <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-md">
                    24/7 Premium Support
                </div>
                <h2 className="text-2xl font-black mb-2">Pro Repair & Service</h2>
                <p className="text-indigo-100 text-sm font-medium leading-relaxed">Expert technicians at your doorstep in under 15 minutes.</p>
            </div>
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -bottom-10 -right-10 opacity-10"
            >
                <Wrench className="w-40 h-40" />
            </motion.div>
        </div>

        {/* Issue Selection */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">What's the issue?</h3>
            <button className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Get Help
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {commonIssues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue.id)}
                className={`p-5 rounded-[2rem] border transition-all flex flex-col items-center gap-3 text-center ${
                  selectedIssue === issue.id 
                    ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200' 
                    : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">{issue.icon}</span>
                <span className={`text-[11px] font-black uppercase tracking-tight ${selectedIssue === issue.id ? 'text-white' : 'text-slate-600'}`}>
                    {issue.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Additional Details */}
        <section className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Tell us more (Optional)</h3>
           <textarea 
             placeholder="e.g. Unusual noise from engine, burning smell..."
             value={description}
             onChange={(e) => setDescription(e.target.value)}
             className="w-full bg-white border border-slate-100 rounded-[2rem] p-6 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none min-h-[120px] shadow-sm"
           />
        </section>

        {/* Selected Location */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                 <MapPin className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Service Location</p>
                 <h4 className="text-sm font-bold text-slate-800">Current Location (Madhapur)</h4>
              </div>
           </div>
           <button className="text-slate-300 hover:text-indigo-600 p-2">
              <ArrowRight className="w-5 h-5" />
           </button>
        </section>

        {/* Trust Badge */}
        <div className="bg-green-50 p-6 rounded-[2.5rem] border border-green-100 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-green-900 mb-1">Insurance Covered</h4>
                <p className="text-[10px] text-green-700/60 font-medium leading-relaxed">
                    All repairs initiated through Fugo are covered under our FugoAssist™ insurance policy up to ₹50,000.
                </p>
            </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 sticky bottom-0">
        <button 
          onClick={onBook}
          disabled={!selectedIssue}
          className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] ${
            selectedIssue 
              ? 'bg-slate-900 text-white shadow-indigo-100' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Book Appointment Now
        </button>
      </div>
    </div>
  );
}
