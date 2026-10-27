import { ChevronLeft, User, Bell, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Moon, Globe, MapPin, History, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../../types';

interface SettingsProps {
  onBack: () => void;
  userPhone: string;
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
}

export default function Settings({ onBack, userPhone, onLogout, onNavigate }: SettingsProps) {
  const sections = [
    {
      title: 'Profile Settings',
      items: [
        { icon: User, label: 'Personal Information', value: userPhone, color: 'text-blue-500', bg: 'bg-blue-50', onClick: () => onNavigate('profile') },
        { icon: History, label: 'Order History', value: 'Recent orders', color: 'text-orange-600', bg: 'bg-orange-100', onClick: () => onNavigate('orders') },
        { icon: Database, label: 'Supabase Database', value: 'orders table', color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: () => onNavigate('supabase_orders') },
        { icon: CreditCard, label: 'Payment Methods', value: '2 Cards Saved', color: 'text-orange-500', bg: 'bg-orange-50', onClick: () => onNavigate('payments') },
        { icon: MapPin, label: 'Saved Addresses', value: '3 Locations', color: 'text-green-500', bg: 'bg-green-50', onClick: () => onNavigate('addresses') },
      ]
    },
    {
      title: 'App Settings',
      items: [
        { icon: Bell, label: 'Notifications', value: 'On', color: 'text-purple-500', bg: 'bg-purple-50' },
        { icon: Moon, label: 'Dark Mode', value: 'System', color: 'text-slate-700', bg: 'bg-slate-100', onClick: () => onNavigate('darkMode') },
        { icon: Globe, label: 'Language', value: 'English (US)', color: 'text-cyan-500', bg: 'bg-cyan-50', onClick: () => onNavigate('language') },
      ]
    },
    {
      title: 'Support & Legal',
      items: [
        { icon: Shield, label: 'Privacy Policy', color: 'text-slate-400', bg: 'bg-slate-50' },
        { icon: HelpCircle, label: 'Help Center', color: 'text-slate-400', bg: 'bg-slate-50' },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Profile</h1>
      </header>

      <div className="flex-1 p-6 space-y-8">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-orange-100">
            {userPhone.slice(-1)}
          </div>
          <div>
            <h2 className="font-bold text-slate-800">Premium User</h2>
            <p className="text-sm text-slate-400">{userPhone}</p>
          </div>
        </div>

        {/* Setting Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">{section.title}</h3>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {section.items.map((item, itemIdx) => (
                <button 
                  key={itemIdx}
                  onClick={item.onClick}
                  className={`w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${itemIdx !== section.items.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">{item.label}</p>
                      {item.value && <p className="text-[10px] text-slate-400 font-medium">{item.value}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button 
          onClick={onLogout}
          className="w-full p-5 flex items-center justify-center gap-3 bg-red-50 text-red-600 rounded-3xl font-bold border border-red-100 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>

        <div className="text-center pt-4">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Fugo Fuel • Version 2.4.0</p>
        </div>
      </div>
    </div>
  );
}
