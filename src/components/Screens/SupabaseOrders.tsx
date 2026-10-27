import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Database, 
  Key, 
  RefreshCw, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  Code2,
  Copy,
  MapPin,
  Clock,
  Sparkles,
  Radio,
  Navigation2,
  Terminal,
  Play,
  Pause,
  FastForward,
  Activity
} from 'lucide-react';
import { SupabaseOrderRecord, StreamEventLog } from '../../types';
import { 
  fetchAllOrders, 
  placeSupabaseOrder, 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  resetSupabaseClient,
  generateDeliveryOtp,
  subscribeToOrderStream,
  updateOrderStatus,
  updateDriverLocation
} from '../../services/supabase';

interface SupabaseOrdersProps {
  onBack: () => void;
  onTrackOrder?: (record: SupabaseOrderRecord) => void;
}

export default function SupabaseOrders({ onBack, onTrackOrder }: SupabaseOrdersProps) {
  const [orders, setOrders] = useState<SupabaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'stream' | 'code' | 'config'>('orders');
  
  // Stream monitor state
  const [monitoredOrderId, setMonitoredOrderId] = useState<string>('');
  const [streamOrder, setStreamOrder] = useState<SupabaseOrderRecord | null>(null);
  const [streamLogs, setStreamLogs] = useState<StreamEventLog[]>([]);
  const [streamActive, setStreamActive] = useState(true);

  // Config state
  const [configUrl, setConfigUrl] = useState('');
  const [configKey, setConfigKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    const cfg = getStoredSupabaseConfig();
    setConfigUrl(cfg.url);
    setConfigKey(cfg.key);
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchAllOrders();
      setOrders(res.orders);
      setIsCloud(res.isCloud);
      if (res.orders.length > 0 && !monitoredOrderId) {
        setMonitoredOrderId(res.orders[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Real-time stream monitor subscriber
  useEffect(() => {
    if (!monitoredOrderId || activeTab !== 'stream') return;

    setStreamLogs([]);
    const unsubscribe = subscribeToOrderStream(
      monitoredOrderId,
      (updated, event) => {
        setStreamOrder(updated);
        if (event) {
          setStreamLogs(prev => [event, ...prev.slice(0, 24)]);
        }
      },
      { simulateProgress: streamActive, speedMultiplier: 1.5 }
    );

    return () => {
      unsubscribe();
    };
  }, [monitoredOrderId, activeTab, streamActive]);

  const handleSaveConfig = (e: FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(configUrl, configKey);
    resetSupabaseClient();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    loadOrders();
  };

  const handleInsertSample = async () => {
    setIsInserting(true);
    try {
      const otp = generateDeliveryOtp();
      const res = await placeSupabaseOrder({
        customer_id: 'cust_123',
        fuel_type: 'Diesel',
        litres: 100,
        delivery_lat: 17.4125,
        delivery_lng: 78.3364,
        driver_lat: 17.4290,
        driver_lng: 78.3506,
        driver_speed_kmh: 42,
        status: 'PENDING',
        otp: otp || '4821',
      });
      await loadOrders();
      if (res.data?.id) {
        setMonitoredOrderId(res.data.id);
      }
    } catch (e) {
      console.error('Failed to insert sample order', e);
    } finally {
      setIsInserting(false);
    }
  };

  const dartInsertCode = `// 1. Place Fuel Order
Future<void> placeOrder() async {
  await Supabase.instance.client.from('orders').insert({
    'customer_id': 'cust_123',
    'fuel_type': 'Diesel',
    'litres': 100,
    'delivery_lat': 17.4125,
    'delivery_lng': 78.3364,
    'status': 'PENDING',
    'otp': '4821',
  });
}`;

  const dartStreamCode = `// 2. Real-Time Order & Driver Location Stream
void streamActiveOrder(String activeOrderId) {
  Supabase.instance.client
      .from('orders')
      .stream(primaryKey: ['id'])
      .eq('id', activeOrderId)
      .listen((List<Map<String, dynamic>> data) {
        if (data.isNotEmpty) {
          final order = data.first;
          print('Current Status: \${order['status']}');
          print('Driver Location: \${order['driver_lat']}, \${order['driver_lng']}');
        }
      });
}`;

  const sqlSchema = `CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  litres NUMERIC NOT NULL,
  delivery_lat DOUBLE PRECISION NOT NULL,
  delivery_lng DOUBLE PRECISION NOT NULL,
  driver_lat DOUBLE PRECISION,
  driver_lng DOUBLE PRECISION,
  driver_speed_kmh NUMERIC DEFAULT 40,
  status TEXT DEFAULT 'PENDING',
  otp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Supabase Realtime for table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;`;

  const copyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg leading-tight">Supabase Orders</h1>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isCloud ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                {isCloud ? 'Cloud Connected' : 'Local + Realtime Mock'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">table: public.orders • streaming</p>
          </div>
        </div>
        <button 
          onClick={loadOrders} 
          disabled={loading}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-3 flex gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'orders' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('stream')}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'stream' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-500" />
          Stream Monitor
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'code' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Dart & Realtime
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'config' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Credentials
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
        {/* Tab 1: Orders List */}
        {activeTab === 'orders' && (
          <>
            {/* Quick action bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-3xl text-white shadow-xl shadow-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Insert Sample Order</h3>
                    <p className="text-[10px] text-slate-400">Diesel 100L • Hyderabad DLF (17.4125, 78.3364)</p>
                  </div>
                </div>
                <button
                  onClick={handleInsertSample}
                  disabled={isInserting}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  {isInserting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PlusCircle className="w-3.5 h-3.5" />
                  )}
                  placeOrder()
                </button>
              </div>
              <div className="text-[10px] text-slate-400 bg-black/40 p-2.5 rounded-xl font-mono leading-relaxed overflow-x-auto">
                insert &#123; customer_id: 'cust_123', fuel_type: 'Diesel', litres: 100, delivery_lat: 17.4125, delivery_lng: 78.3364, status: 'PENDING', otp: '4821' &#125;
              </div>
            </div>

            {/* Orders list */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                Loading records from Supabase...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center space-y-3 shadow-sm">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-orange-500">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800">No orders inserted yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Click the button above or complete a checkout in the app to trigger placeOrder() into Supabase.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <motion.div
                    key={ord.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                        <span className="font-bold text-sm text-slate-900">{ord.fuel_type}</span>
                        <span className="text-xs bg-orange-50 text-orange-700 font-black px-2 py-0.5 rounded-full">
                          {ord.litres}L
                        </span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        ord.status === 'DELIVERED' 
                          ? 'bg-green-100 text-green-700' 
                          : ord.status === 'DISPATCHED'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Customer</span>
                        <span className="font-mono font-semibold text-slate-700">{ord.customer_id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery OTP</span>
                        <span className="font-mono font-black text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded tracking-widest">
                          {ord.otp}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 text-slate-500 mt-1 font-mono text-[10px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Dest: {ord.delivery_lat}, {ord.delivery_lng}</span>
                      </div>
                      {ord.driver_lat !== undefined && (
                        <div className="col-span-2 flex items-center gap-1.5 text-orange-600 font-mono text-[10px]">
                          <Navigation2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>Driver GPS: {ord.driver_lat.toFixed(4)}, {ord.driver_lng?.toFixed(4)} ({ord.driver_speed_kmh || 38} km/h)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-400">ID: {ord.id.substring(0, 14)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setMonitoredOrderId(ord.id);
                            setActiveTab('stream');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Terminal className="w-3 h-3 text-slate-500" />
                          Stream
                        </button>
                        {onTrackOrder && (
                          <button
                            onClick={() => onTrackOrder(ord)}
                            className="px-3 py-1 text-[11px] font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                          >
                            <Navigation2 className="w-3 h-3" />
                            Track Live
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tab 2: Stream Monitor */}
        {activeTab === 'stream' && (
          <div className="space-y-4">
            {/* Monitor Header */}
            <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </div>
                  <h3 className="font-bold text-sm">Supabase Stream Monitor</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setStreamActive(!streamActive)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs"
                    title={streamActive ? 'Pause' : 'Resume'}
                  >
                    {streamActive ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* Order selector */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black block mb-1">
                  Active Monitored Order ID
                </label>
                <select
                  value={monitoredOrderId}
                  onChange={(e) => setMonitoredOrderId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-mono rounded-xl p-2.5 outline-none focus:border-orange-500"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.fuel_type} {o.litres}L ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Status and GPS Snapshot */}
              {streamOrder && (
                <div className="bg-black/50 p-3 rounded-2xl border border-white/10 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Current Status</span>
                    <span className={`font-bold ${
                      streamOrder.status === 'DELIVERED' ? 'text-emerald-400' : 'text-orange-400'
                    }`}>
                      {streamOrder.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Driver Speed</span>
                    <span className="font-bold text-slate-200">
                      {streamOrder.driver_speed_kmh || 38} km/h
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-white/10">
                    <span className="text-[10px] text-slate-400 uppercase block">Driver Location</span>
                    <span className="font-bold text-emerald-300">
                      {streamOrder.driver_lat?.toFixed(5)}, {streamOrder.driver_lng?.toFixed(5)}
                    </span>
                  </div>
                </div>
              )}

              {onTrackOrder && streamOrder && (
                <button
                  onClick={() => onTrackOrder(streamOrder)}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20"
                >
                  <Navigation2 className="w-3.5 h-3.5" />
                  Open Live Visual Tracking HUD
                </button>
              )}
            </div>

            {/* Live Packet Logs Console */}
            <div className="bg-black text-emerald-400 font-mono text-[11px] p-4 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-orange-400" />
                  <span>Realtime Stream Output (print logs)</span>
                </div>
                <span>{streamLogs.length} events</span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                <div className="text-slate-400">
                  &gt; Supabase.instance.client.from('orders').stream(primaryKey: ['id']).eq('id', '{monitoredOrderId}').listen(...)
                </div>
                {streamLogs.map(log => (
                  <div key={log.id} className="bg-white/5 p-2 rounded-xl text-[10px] leading-tight space-y-0.5 border border-white/5">
                    <div className="flex items-center justify-between text-slate-400 text-[9px]">
                      <span>[{log.timestamp}]</span>
                      <span className="text-orange-400 font-bold">{log.type}</span>
                    </div>
                    <div className="text-emerald-300 font-bold">Current Status: {log.status}</div>
                    <div className="text-slate-300">
                      Driver Location: {log.driver_lat?.toFixed(4)}, {log.driver_lng?.toFixed(4)}
                    </div>
                  </div>
                ))}
                {streamLogs.length === 0 && (
                  <div className="text-slate-500 italic py-4 text-center">
                    Connecting to Supabase stream channel...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Dart & SQL Code */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            {/* Dart Stream snippet */}
            <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                  Flutter / Dart: .stream().listen()
                </span>
                <button 
                  onClick={() => copyCode(dartStreamCode, 'stream')}
                  className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl text-slate-200 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {copiedSnippet === 'stream' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs font-mono bg-black/40 p-3.5 rounded-2xl overflow-x-auto text-emerald-300 leading-relaxed">
                {dartStreamCode}
              </pre>
            </div>

            {/* Dart placeOrder snippet */}
            <div className="bg-slate-900 rounded-3xl p-4 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                  Flutter / Dart: placeOrder()
                </span>
                <button 
                  onClick={() => copyCode(dartInsertCode, 'insert')}
                  className="flex items-center gap-1 text-[11px] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl text-slate-200 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {copiedSnippet === 'insert' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs font-mono bg-black/40 p-3.5 rounded-2xl overflow-x-auto text-emerald-300 leading-relaxed">
                {dartInsertCode}
              </pre>
            </div>

            {/* SQL Table Schema */}
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Supabase SQL Table & Realtime Setup
                </span>
                <button 
                  onClick={() => copyCode(sqlSchema, 'sql')}
                  className="flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl text-slate-700 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {copiedSnippet === 'sql' ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
              <pre className="text-xs font-mono bg-slate-50 p-3.5 rounded-2xl overflow-x-auto text-slate-700 border border-slate-100 leading-relaxed">
                {sqlSchema}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: Supabase Config */}
        {activeTab === 'config' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-800">Supabase Connection</h3>
              <p className="text-xs text-slate-400 mt-1">
                Connect your actual Supabase cloud project with Realtime enabled to stream directly across mobile devices and web browsers.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                  Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                  Anon / Public Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors active:scale-95"
              >
                Save Supabase Configuration
              </button>

              {saveSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Credentials updated and client reconnected!
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
