import { ChevronLeft, CreditCard, Plus, Trash2, ShieldCheck, Wallet, Landmark } from 'lucide-react';
import { motion } from 'motion/react';

interface PaymentMethodsProps {
  onBack: () => void;
}

export default function PaymentMethods({ onBack }: PaymentMethodsProps) {
  const cards = [
    {
      id: '1',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/26',
      holder: 'PREMIUM USER',
      color: 'from-slate-800 to-slate-900',
      isDefault: true
    },
    {
      id: '2',
      brand: 'Mastercard',
      last4: '8892',
      expiry: '05/25',
      holder: 'PREMIUM USER',
      color: 'from-orange-500 to-orange-600',
      isDefault: false
    }
  ];

  const upiIds = [
    { id: '1', upi: 'user@okaxis', provider: 'Google Pay', isDefault: true },
    { id: '2', upi: 'user@paytm', provider: 'Paytm', isDefault: false }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 bg-white sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Payment Methods</h1>
      </header>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto">
        {/* Saved Cards Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Saved Cards</h2>
            <button className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 flex items-center gap-1">
              <Plus className="w-3 h-3" />
              Add New
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x -mx-6 px-6 no-scrollbar">
            {cards.map((card, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                key={card.id}
                className={`w-[280px] h-[180px] shrink-0 rounded-[2.5rem] bg-gradient-to-br ${card.color} p-6 text-white flex flex-col justify-between shadow-2xl shadow-slate-200 snap-center relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-lg font-black italic tracking-wider italic">{card.brand}</span>
                  {card.isDefault && (
                    <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full">Default</span>
                  )}
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-1">
                        {[1, 2, 3, 4].map(j => (
                          <div key={j} className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                        ))}
                      </div>
                    ))}
                    <span className="text-lg font-bold tracking-[0.2em] -mt-1 ml-2">{card.last4}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[8px] font-medium uppercase tracking-widest opacity-60 mb-0.5">Card Holder</p>
                      <p className="text-xs font-bold tracking-widest">{card.holder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-medium uppercase tracking-widest opacity-60 mb-0.5">Expires</p>
                      <p className="text-xs font-bold tracking-widest">{card.expiry}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* UPI IDs Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">UPI IDs</h2>
          <div className="space-y-3">
            {upiIds.map((upi, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                key={upi.id}
                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{upi.upi}</p>
                    <p className="text-[10px] font-medium text-slate-400">{upi.provider}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {upi.isDefault && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-2 py-1 rounded-full">Default</span>
                  )}
                  <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            <button className="w-full p-4 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-2 text-slate-400 hover:border-orange-300 hover:text-orange-500 transition-all hover:bg-orange-50">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-bold">Connect New UPI</span>
            </button>
          </div>
        </section>

        {/* Net Banking Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Net Banking</h2>
          <button className="w-full bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">Add Bank Account</p>
                <p className="text-[10px] font-medium text-slate-400">Supports all major banks</p>
              </div>
            </div>
            <Plus className="w-4 h-4 text-slate-300" />
          </button>
        </section>

        {/* Security Info */}
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex items-start gap-4">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Safe & Secure</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
              Your payment information is stored securely following PCI-DSS standards. We do not store your CVV or full card numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
