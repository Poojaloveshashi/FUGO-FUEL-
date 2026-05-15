import { ChevronLeft, Moon, Sun, Monitor, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface DarkModeProps {
  onBack: () => void;
}

export default function DarkMode({ onBack }: DarkModeProps) {
  const [theme, setTheme] = useState('System Default');

  const themes = [
    { name: 'Light Mode', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50' },
    { name: 'Dark Mode', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'System Default', icon: Monitor, color: 'text-slate-500', bg: 'bg-slate-50' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Appearance</h1>
      </header>

      <div className="flex-1 p-6 space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Moon className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Theme Settings</h2>
              <p className="text-xs text-slate-400">Choose how Fugo Fuel looks on your device</p>
            </div>
          </div>

          <div className="space-y-3">
            {themes.map((t, idx) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`w-full p-5 flex items-center justify-between rounded-3xl transition-all border-2 ${
                  theme === t.name 
                    ? 'border-orange-500 bg-orange-50/30 ring-4 ring-orange-50' 
                    : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center`}>
                    <t.icon className={`w-5 h-5 ${t.color}`} />
                  </div>
                  <span className={`font-bold ${theme === t.name ? 'text-slate-900' : 'text-slate-600'}`}>
                    {t.name}
                  </span>
                </div>
                {theme === t.name && (
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/30 transition-colors" />
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-2">Eyes Feeling Tired?</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">
              Switch to Dark Mode to reduce eye strain and save battery life on OLED screens.
            </p>
            <button className="mt-6 bg-white text-slate-900 px-6 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">
              Try it now
            </button>
          </div>
          <Moon className="absolute bottom-4 right-4 w-24 h-24 text-white/5 -mb-4 -mr-4" />
        </div>

        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center px-8 leading-loose">
          Changing theme might restart some active processes to apply styles correctly.
        </p>
      </div>
    </div>
  );
}
