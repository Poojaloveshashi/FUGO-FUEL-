import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Clock, 
  MapPin, 
  User, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  Building2,
  FileText,
  PhoneCall
} from 'lucide-react';

interface RepairTrackingProps {
  onBack: () => void;
}

type RepairStatus = 'enroute' | 'diagnosis' | 'reporting' | 'heavy_issue' | 'warehouse_transfer' | 'warehouse_arrived';

export default function RepairTracking({ onBack }: RepairTrackingProps) {
  const [status, setStatus] = useState<RepairStatus>('enroute');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
  const [isHeavyIssue, setIsHeavyIssue] = useState<boolean | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'enroute' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    
    // Simulate transitions for Demo
    if (status === 'enroute' && timeLeft === 14 * 60 + 50) { // After 10s of enroute
        // Fast forward for demo
        // setStatus('diagnosis'); 
    }

    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const steps = [
    { key: 'enroute', label: 'Technician Enroute', icon: User, color: 'indigo' },
    { key: 'diagnosis', label: 'Checking Issue', icon: Wrench, color: 'orange' },
    { key: 'reporting', label: 'Generating Report', icon: FileText, color: 'blue' },
    { key: 'warehouse', label: 'Warehouse Repair', icon: Building2, color: 'slate' },
  ];

  const handleNextStatus = () => {
    if (status === 'enroute') setStatus('diagnosis');
    else if (status === 'diagnosis') setStatus('reporting');
    else if (status === 'reporting') setStatus('heavy_issue');
  };

  const handleEscalateToWarehouse = () => {
    setIsHeavyIssue(true);
    setStatus('warehouse_transfer');
    setTimeout(() => setStatus('warehouse_arrived'), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Repair Tracking</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Live</span>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-32">
        {/* Status Pipeline Visual */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between relative">
                {/* Connector Lines */}
                <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-100 -z-0" />
                <div 
                    className="absolute top-5 left-10 h-0.5 bg-orange-500 transition-all duration-1000 -z-0" 
                    style={{ width: status === 'enroute' ? '0%' : status === 'diagnosis' ? '33%' : status === 'reporting' ? '66%' : '100%' }}
                />

                {steps.map((step, idx) => {
                    const isCompleted = idx < (status === 'warehouse_transfer' || status === 'warehouse_arrived' ? 4 : steps.findIndex(s => s.key === status));
                    const isActive = step.key === status || (idx === 3 && (status === 'warehouse_transfer' || status === 'warehouse_arrived'));
                    
                    return (
                        <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-colors ${
                                isCompleted ? 'bg-orange-500 text-white' : isActive ? 'bg-slate-900 text-white ring-4 ring-slate-100' : 'bg-slate-200 text-slate-400'
                            }`}>
                                <step.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        <AnimatePresence mode="wait">
            {status === 'enroute' && (
                <motion.div 
                    key="enroute"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black mb-1">{formatTime(timeLeft)}</h2>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">Agent Arriving Soon</p>
                            </div>
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                <Clock className="w-8 h-8 text-orange-400" />
                            </div>
                        </div>
                        
                        <div className="mt-8 flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                            <img 
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=vikram" 
                                className="w-12 h-12 bg-slate-800 rounded-xl" 
                                alt="technician" 
                            />
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">Vikram Singh</h4>
                                <p className="text-[10px] text-slate-400">Master Technician • 4.98 ⭐</p>
                            </div>
                            <button className="bg-white text-slate-900 p-3 rounded-xl active:scale-95 transition-transform">
                                <PhoneCall className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleNextStatus}
                        className="w-full bg-white border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm hover:border-orange-200 transition-colors group"
                    >
                        <div className="text-left">
                            <h3 className="font-bold text-slate-800">Technician Arrived?</h3>
                            <p className="text-[10px] text-slate-400">Confirm arrival to start diagnosis</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                            <CheckCircle2 className="w-5 h-5 text-slate-300 group-hover:text-orange-500" />
                        </div>
                    </button>
                </motion.div>
            )}

            {status === 'diagnosis' && (
                <motion.div 
                    key="diagnosis"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <div className="bg-orange-500 p-8 rounded-[2.5rem] text-white">
                        <div className="flex items-start justify-between mb-8">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Wrench className="w-6 h-6 animate-spin-slow" />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded">Stage: Diagnosis</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black mb-2">Analyzing Vehicle</h2>
                        <p className="text-sm text-orange-100 font-medium">Vikram is performing a 24-point health check on your engine and electrics.</p>
                        
                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/5">
                                <p className="text-[9px] font-bold text-white/60 mb-1">Battery</p>
                                <p className="text-xs font-black">Checking...</p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/5">
                                <p className="text-[9px] font-bold text-white/60 mb-1">Engine Oil</p>
                                <p className="text-xs font-black">Scanning</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleNextStatus}
                        className="w-full bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between shadow-xl shadow-slate-100"
                    >
                        <span className="font-bold">Next: View Technical Report</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            )}

            {status === 'reporting' && (
                <motion.div 
                    key="reporting"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                <FileText className="w-7 h-7 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Technical Report</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Job ID: #V9421-S</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-red-900">Heavy Issue Detected</h4>
                                    <p className="text-[10px] text-red-700/70 font-medium">Internal gear housing damage detected. On-site repair not possible.</p>
                                </div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-3xl border border-green-100 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-xs font-bold text-green-900">Electronics: Optimal</h4>
                                    <p className="text-[10px] text-green-700/70 font-medium">All electrical components passing safety threshold.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                            <button 
                                onClick={handleEscalateToWarehouse}
                                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-slate-100"
                            >
                                Transfer to Warehouse
                            </button>
                            <p className="text-center text-[10px] text-slate-300 font-bold mt-4">Required for specialized tools and lifting equipment</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {status === 'heavy_issue' && (
                <div key="thinking" className="flex items-center justify-center p-12">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
                </div>
            )}

            {(status === 'warehouse_transfer' || status === 'warehouse_arrived') && (
                <motion.div 
                    key="warehouse"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-24 -mt-24" />
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-2xl">
                                {status === 'warehouse_transfer' ? <Truck className="w-10 h-10 animate-bounce" /> : <Building2 className="w-10 h-10" />}
                            </div>
                            <h2 className="text-2xl font-black mb-2">
                                {status === 'warehouse_transfer' ? 'Moving to Warehouse' : 'Arrived at Workshop'}
                            </h2>
                            <p className="text-sm text-indigo-100 font-medium">
                                {status === 'warehouse_transfer' 
                                    ? 'Your vehicle is being safely towed to Fugo Central Repair Hub.' 
                                    : 'Specialized technicians are now starting the heavy repair process.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-slate-800">Warehouse Details</h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Hyderguda Central</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-xs font-bold text-slate-600">3.4 km away from you</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300" />
                        </div>
                    </div>

                    {status === 'warehouse_arrived' && (
                        <button 
                            onClick={onBack}
                            className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-bold text-sm tracking-wide"
                        >
                            Return to Dashboard
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Persistence Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between bg-slate-900 p-4 rounded-3xl shadow-2xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Ongoing Job</p>
                    <p className="text-xs font-black text-white">Full Engine Scan</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-xs font-black text-white">45:00</p>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-none mt-1">Est. Completion</p>
            </div>
        </div>
      </div>
    </div>
  );
}
