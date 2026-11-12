import { ChevronLeft, Calendar, MapPin, Wrench, Shield, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { UserLocation } from '../../types';
import { placeSupabaseOrder, getCustomerIdFromPhone } from '../../services/supabase';

interface AppointmentBookingProps {
  onBack: () => void;
  onBook: (orderId: string) => void;
  selectedLocation: UserLocation;
  userPhone?: string;
  onError?: (msg: string) => void;
}

export default function AppointmentBooking({ 
  onBack, 
  onBook, 
  selectedLocation, 
  userPhone,
  onError 
}: AppointmentBookingProps) {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const commonIssues = [
    { id: 'engine', label: 'Engine Problems', icon: '🔥' },
    { id: 'brakes', label: 'Brake Issues', icon: '🛑' },
    { id: 'electric', label: 'Electrical Fault', icon: '⚡' },
    { id: 'suspension', label: 'Suspension', icon: '🛣️' },
    { id: 'unknown', label: 'Other / Not Sure', icon: '❓' },
  ];

  const handleBookAppointment = async () => {
    if (!selectedIssue || isSubmitting) return;

    setIsSubmitting(true);
    setBookingError(null);

    const issueObj = commonIssues.find(i => i.id === selectedIssue);
    const issueLabel = issueObj ? issueObj.label : 'General Inspection';
    const finalDescription = description.trim() ? `${issueLabel} - ${description.trim()}` : issueLabel;
    
    // Requirement 6: id 'REQ-' + Date.now(), service_type 'MAINTENANCE', status 'pending'
    const orderId = `REQ-${Date.now()}`;
    const customerId = getCustomerIdFromPhone(userPhone);
    const fullAddress = `${selectedLocation.name}, ${selectedLocation.address}, ${selectedLocation.city}`;

    const res = await placeSupabaseOrder({
      id: orderId,
      service_type: 'MAINTENANCE',
      status: 'pending',
      customer_id: customerId,
      customer_phone: userPhone || '',
      description: finalDescription,
      address: fullAddress,
      delivery_lat: selectedLocation.lat,
      delivery_lng: selectedLocation.lng,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      customer_location: `${selectedLocation.lat}, ${selectedLocation.lng}`,
      total_amount: 0,
      price: 0,
      payment_status: 'UNPAID',
    });

    setIsSubmitting(false);

    if (!res.success) {
      console.error('Appointment booking error:', res.error);
      const errorMsg = 'Something went wrong. Please try again.';
      setBookingError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // Pass the new id to RepairTracking
    onBook(res.data.id || orderId);
  };

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

      {/* Red Error Banner if Supabase is unconfigured or insert fails */}
      {bookingError && (
        <div className="bg-red-600 text-white px-5 py-3 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{bookingError}</span>
          </div>
          <button onClick={() => setBookingError(null)} className="text-red-200 hover:text-white font-mono text-sm">
            ✕
          </button>
        </div>
      )}

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

        {/* Selected Location (Real Selected Location, not hardcoded) */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Service Location</p>
              <h4 className="text-sm font-bold text-slate-800">{selectedLocation.name}</h4>
              <p className="text-xs text-slate-500">{selectedLocation.address}, {selectedLocation.city}</p>
            </div>
          </div>
        </section>

        {/* Transparent Service Pricing Card with MRP */}
        <section className="bg-white p-5 rounded-[2.2rem] border border-slate-100 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Doorstep Visit & Inspection Tariff</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase">
              Save ₹300
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">₹199</span>
              <span className="text-xs text-slate-400 ml-2">Inspection & Diagnosis</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">MRP: <span className="line-through">₹499</span></span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 font-medium">
            💡 <strong>100% Rebate:</strong> Inspection fee is adjusted and waived if you approve any on-spot repair or parts replacement! Pay on delivery via Cash or UPI.
          </p>
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
          onClick={handleBookAppointment}
          disabled={!selectedIssue || isSubmitting}
          className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            selectedIssue && !isSubmitting
              ? 'bg-slate-900 text-white shadow-indigo-100' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span>Confirming Appointment...</span>
          ) : (
            <span>Book Appointment Now</span>
          )}
        </button>
      </div>
    </div>
  );
}
