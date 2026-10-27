import { ChevronLeft, BarChart3, LineChart, PieChart, Info, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

interface ServiceAnalyticsProps {
  onBack: () => void;
  onNavigate?: (screen: any) => void;
}

const lastWeekData = [
  { name: 'Mon', repairs: 12, services: 8 },
  { name: 'Tue', repairs: 19, services: 15 },
  { name: 'Wed', repairs: 15, services: 22 },
  { name: 'Thu', repairs: 22, services: 18 },
  { name: 'Fri', repairs: 30, services: 25 },
  { name: 'Sat', repairs: 45, services: 40 },
  { name: 'Sun', repairs: 38, services: 35 },
];

const lastMonthData = [
  { name: 'Week 1', repairs: 85, services: 70 },
  { name: 'Week 2', repairs: 110, services: 95 },
  { name: 'Week 3', repairs: 130, services: 120 },
  { name: 'Week 4', repairs: 165, services: 150 },
];

const categoryData = [
  { name: 'Repairs', value: 450, color: '#f97316' },
  { name: 'Services', value: 300, color: '#0f172a' },
  { name: 'Maintenance', value: 150, color: '#64748b' },
];

export default function ServiceAnalytics({ onBack, onNavigate }: ServiceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const data = timeRange === 'week' ? lastWeekData : lastMonthData;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Service Analytics</h1>
        </div>
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-24">
        {/* Launch Budget & Inventory Shortcut */}
        {onNavigate && (
          <div 
            onClick={() => onNavigate('budget')}
            className="p-3.5 bg-gradient-to-r from-slate-900 to-orange-950 text-white rounded-2xl shadow-sm border border-orange-500/30 flex items-center justify-between cursor-pointer hover:border-orange-500 transition-colors"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-orange-500 text-black font-black px-1.5 py-0.5 rounded uppercase">Capital Plan</span>
                <span className="text-xs font-bold text-white">Fugo Launch Budget & Inventory</span>
              </div>
              <p className="text-[10px] text-orange-200/80 font-mono mt-0.5">₹82.95L total • Capex vs 3-Mo Opex • 27 Staff</p>
            </div>
            <span className="text-xs text-orange-400 font-bold bg-white/10 px-2 py-1 rounded-lg">View &rarr;</span>
          </div>
        )}

        {/* Time Filter */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setTimeRange('week')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${timeRange === 'week' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Last Week
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${timeRange === 'month' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Last Month
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Repairs</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">452</h3>
              <div className="flex items-center text-green-500 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
                +12%
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Services</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">328</h3>
              <div className="flex items-center text-green-500 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full">
                +8%
              </div>
            </div>
          </motion.div>
        </div>

        {/* Volume Chart */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Job Volume</h2>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Repairs vs Services over time</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500">Repairs</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-900 rounded-full" />
                <span className="text-[10px] font-bold text-slate-500">Services</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="repairs" fill="#f97316" radius={[4, 4, 0, 0]} barSize={timeRange === 'week' ? 12 : 30} />
                <Bar dataKey="services" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={timeRange === 'week' ? 12 : 30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Line Chart - Revenue Visualization */}
        <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full" />
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-lg font-bold">Performance Trend</h2>
              <p className="text-xs text-slate-400">Total efficiency index</p>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={data}>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '1rem', 
                      background: '#1e293b', 
                      border: '1px solid #334155',
                      fontSize: '10px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="repairs" 
                    stroke="#f97316" 
                    strokeWidth={4} 
                    dot={{ fill: '#f97316', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="services" 
                    stroke="#ffffff30" 
                    strokeWidth={4} 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ReLineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUpIcon className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">Target Reached</p>
                    <p className="text-xs font-black">94.2%</p>
                  </div>
               </div>
               <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-bold transition-colors">
                  View Full Report
               </button>
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="h-32 w-32 shrink-0">
             <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
             </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-4">
             <h3 className="text-sm font-bold text-slate-800">Service Mix</h3>
             <div className="space-y-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-[10px] font-bold text-slate-500">{cat.name}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-700">{Math.round((cat.value / 900) * 100)}%</span>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Info Banner */}
        <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 flex gap-4">
           <Info className="w-5 h-5 text-indigo-500 shrink-0" />
           <p className="text-[10px] text-indigo-600 font-medium leading-relaxed">
             This data includes both completed and scheduled appointments for the selected time range. High volume during weekends typically requires additional technician allocation.
           </p>
        </div>
      </div>
    </div>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
    </svg>
  );
}
