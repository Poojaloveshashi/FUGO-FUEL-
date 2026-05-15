import { ChevronLeft, User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface PersonalInfoProps {
  onBack: () => void;
  userPhone: string;
}

export default function PersonalInfo({ onBack, userPhone }: PersonalInfoProps) {
  const [formData, setFormData] = useState({
    fullName: 'Premium User',
    email: 'user@fugo.com',
    phone: userPhone,
    dob: '1995-08-15',
    gender: 'Male'
  });

  const handleSave = () => {
    // Simulate save
    onBack();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Personal Info</h1>
        </div>
        <button 
          onClick={handleSave}
          className="bg-orange-500 text-white p-2 rounded-xl shadow-lg shadow-orange-100 active:scale-95 transition-transform"
        >
          <Save className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 p-6 space-y-8">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-28 h-28 bg-orange-500 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-orange-100 overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=fugo`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-100 text-slate-600 hover:text-orange-500 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">{formData.fullName}</h2>
            <p className="text-sm text-slate-400 font-medium">Member since Oct 2023</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="tel" 
                value={formData.phone}
                disabled
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-400 cursor-not-allowed opacity-75"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Date of Birth</label>
              <input 
                type="date" 
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all outline-none appearance-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-loose">
            Your data is encrypted and secure.<br/>
            Read our <span className="text-orange-500 underline">Privacy Policy</span> for more info.
          </p>
        </div>
      </div>
    </div>
  );
}
