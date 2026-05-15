import { ChevronLeft, Check, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface LanguageProps {
  onBack: () => void;
}

export default function Language({ onBack }: LanguageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  const languages = [
    { name: 'English (US)', detail: 'Default' },
    { name: 'English (UK)', detail: 'British English' },
    { name: 'Hindi', detail: 'हिन्दी' },
    { name: 'Telugu', detail: 'తెలుగు' },
    { name: 'Spanish', detail: 'Español' },
    { name: 'French', detail: 'Français' },
    { name: 'German', detail: 'Deutsch' },
    { name: 'Chinese', detail: '中文' },
    { name: 'Arabic', detail: 'العربية' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Language</h1>
      </header>

      <div className="flex-1 p-6 space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Choose Language</h2>
              <p className="text-xs text-slate-400">Select your preferred app language</p>
            </div>
          </div>

          <div className="space-y-2">
            {languages.map((lang, idx) => (
              <button
                key={lang.name}
                onClick={() => setSelectedLanguage(lang.name)}
                className={`w-full p-4 flex items-center justify-between rounded-2xl transition-all ${
                  selectedLanguage === lang.name 
                    ? 'bg-orange-50 border border-orange-200' 
                    : 'bg-white border border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="text-left">
                  <p className={`text-sm font-bold ${selectedLanguage === lang.name ? 'text-orange-600' : 'text-slate-700'}`}>
                    {lang.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">{lang.detail}</p>
                </div>
                {selectedLanguage === lang.name && (
                  <Check className="w-5 h-5 text-orange-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-orange-500 rounded-[2rem] text-white shadow-xl shadow-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Active Language</p>
              <p className="font-bold">{selectedLanguage}</p>
            </div>
          </div>
          <button 
            onClick={onBack}
            className="bg-white text-orange-500 px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform"
          >
            Apply
          </button>
        </div>

        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center px-8 leading-loose">
          Content availability may vary based on your selected language and region.
        </p>
      </div>
    </div>
  );
}
