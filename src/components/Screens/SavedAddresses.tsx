import { ChevronLeft, MapPin, Plus, Home, Briefcase, Map as MapIcon, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { UserLocation } from '../../types';

interface SavedAddressesProps {
  onBack: () => void;
  locations: UserLocation[];
}

export default function SavedAddresses({ onBack, locations }: SavedAddressesProps) {
  // We can enrich the locations with icons labels for display
  const addressList = [
    { ...locations[0], label: 'Home', icon: Home, isDefault: true },
    { ...locations[1], label: 'Work', icon: Briefcase, isDefault: false },
    { ...locations[2], label: 'Other', icon: MapIcon, isDefault: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Saved Addresses</h1>
      </header>

      <div className="flex-1 p-6 space-y-4">
        {addressList.map((addr, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={addr.id}
            className={`bg-white p-5 rounded-3xl border ${addr.isDefault ? 'border-orange-200 ring-4 ring-orange-50' : 'border-slate-100'} shadow-sm relative`}
          >
            {addr.isDefault && (
              <span className="absolute top-4 right-4 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
            
            <div className="flex gap-4">
              <div className={`w-12 h-12 ${addr.isDefault ? 'bg-orange-100' : 'bg-slate-100'} rounded-2xl flex items-center justify-center shrink-0`}>
                <addr.icon className={`w-6 h-6 ${addr.isDefault ? 'text-orange-600' : 'text-slate-400'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {addr.label}
                </h3>
                <p className="text-sm font-bold text-slate-700 mt-1">{addr.name}</p>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                  {addr.address}, {addr.city}
                </p>
                
                <div className="flex items-center gap-4 mt-4">
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 flex items-center gap-1.5 transition-colors">
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  {!addr.isDefault && (
                    <button className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 flex items-center gap-1.5 transition-colors">
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <button className="w-full p-5 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:border-orange-300 hover:text-orange-500 transition-all hover:bg-orange-50 active:scale-95">
          <Plus className="w-5 h-5" />
          <span className="font-bold">Add New Address</span>
        </button>
      </div>

      <div className="p-6 text-center">
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Manage your quick delivery points</p>
      </div>
    </div>
  );
}
