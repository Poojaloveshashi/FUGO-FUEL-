import React, { useState } from 'react';
import { 
  ChevronLeft, 
  MapPin, 
  Plus, 
  Home as HomeIcon, 
  Briefcase, 
  Map as MapIcon, 
  Trash2, 
  Check, 
  Navigation,
  Building,
  Flag,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserLocation } from '../../types';

interface SavedAddressesProps {
  onBack: () => void;
  locations: UserLocation[];
  selectedLocation: UserLocation;
  onSelectLocation: (loc: UserLocation) => void;
  onAddLocation: (loc: UserLocation) => void;
  onDeleteLocation: (id: string) => void;
}

export default function SavedAddresses({ 
  onBack, 
  locations, 
  selectedLocation, 
  onSelectLocation,
  onAddLocation,
  onDeleteLocation
}: SavedAddressesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Form states
  const [formTag, setFormTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [formHouseNumber, setFormHouseNumber] = useState('');
  const [formAreaName, setFormAreaName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLandmark, setFormLandmark] = useState('');
  const [formCity, setFormCity] = useState('Hyderabad');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAreaName.trim() || !formAddress.trim()) return;

    const newLoc: UserLocation = {
      id: `addr_${Date.now()}`,
      name: formAreaName.trim(),
      houseNumber: formHouseNumber.trim() || 'Door / Villa No.',
      address: formAddress.trim(),
      landmark: formLandmark.trim(),
      city: formCity.trim() || 'Hyderabad',
      lat: 17.4125 + (Math.random() - 0.5) * 0.02,
      lng: 78.3364 + (Math.random() - 0.5) * 0.02,
      tag: formTag,
    };

    onAddLocation(newLoc);
    onSelectLocation(newLoc);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormHouseNumber('');
    setFormAreaName('');
    setFormAddress('');
    setFormLandmark('');
    setFormTag('Home');
  };

  const handleDetectLiveLocation = () => {
    setIsDetectingGps(true);
    if (!navigator.geolocation) {
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const liveLoc: UserLocation = {
          id: `live_${Date.now()}`,
          name: 'Device Current Location',
          houseNumber: 'Current Spot',
          address: `GPS Pin: ${lat}, ${lng}`,
          city: 'Hyderabad',
          lat,
          lng,
          tag: 'Other',
          isLiveLocation: true,
          landmark: 'Auto-detected via device GPS'
        };
        onAddLocation(liveLoc);
        onSelectLocation(liveLoc);
        setIsDetectingGps(false);
        setShowAddModal(false);
      },
      () => {
        const liveLoc: UserLocation = {
          id: `live_${Date.now()}`,
          name: 'Current Spot (DLF Financial District)',
          houseNumber: 'Door 104',
          address: 'DLF Cyber City, Gachibowli',
          city: 'Hyderabad',
          lat: 17.4125,
          lng: 78.3364,
          tag: 'Other',
          isLiveLocation: true,
          landmark: 'Near DLF Gate 2'
        };
        onAddLocation(liveLoc);
        onSelectLocation(liveLoc);
        setIsDetectingGps(false);
        setShowAddModal(false);
      },
      { timeout: 7000 }
    );
  };

  const getTagIcon = (tag?: 'Home' | 'Work' | 'Other', isLive?: boolean) => {
    if (isLive) return Compass;
    if (tag === 'Home') return HomeIcon;
    if (tag === 'Work') return Briefcase;
    return MapIcon;
  };

  const getTagColor = (tag?: 'Home' | 'Work' | 'Other', isLive?: boolean) => {
    if (isLive) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (tag === 'Home') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (tag === 'Work') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-purple-600 bg-purple-50 border-purple-200';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Saved Addresses</h1>
            <p className="text-[11px] text-slate-400">Set Home, Work, and Doorstep points</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New</span>
        </button>
      </header>

      <div className="flex-1 p-4 space-y-3.5">
        {/* Quick GPS Location Bar */}
        <button
          type="button"
          onClick={handleDetectLiveLocation}
          disabled={isDetectingGps}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold flex items-center justify-between shadow-md shadow-orange-500/20 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Navigation className={`w-5 h-5 text-white ${isDetectingGps ? 'animate-spin' : ''}`} />
            </div>
            <div className="text-left">
              <span className="text-xs font-black block">
                {isDetectingGps ? 'Acquiring GPS...' : 'Select Device Live Location'}
              </span>
              <span className="text-[10px] text-orange-100">
                Detects coordinates for emergency or on-road delivery
              </span>
            </div>
          </div>
          <Compass className="w-5 h-5 text-orange-200" />
        </button>

        {/* Addresses List */}
        {locations.map((addr, idx) => {
          const isSelected = selectedLocation.id === addr.id;
          const Icon = getTagIcon(addr.tag, addr.isLiveLocation);
          const colorClass = getTagColor(addr.tag, addr.isLiveLocation);

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={addr.id}
              onClick={() => onSelectLocation(addr)}
              className={`bg-white p-4 rounded-3xl border cursor-pointer transition-all ${
                isSelected 
                  ? 'border-orange-500 ring-4 ring-orange-50 shadow-md' 
                  : 'border-slate-200/80 hover:border-orange-200 shadow-xs'
              } relative`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {addr.name}
                      </span>
                      {addr.tag && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {addr.tag}
                        </span>
                      )}
                      {addr.isLiveLocation && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Live GPS
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* House Number / Door Details */}
                  {addr.houseNumber && (
                    <p className="text-xs font-semibold text-slate-800 mb-0.5">
                      House / Flat: {addr.houseNumber}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {addr.address}, {addr.city}
                  </p>

                  {addr.landmark && (
                    <p className="text-[11px] text-orange-600 font-medium mt-1 flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      <span>Landmark: {addr.landmark}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-mono text-[10px] text-slate-400">
                      Coords: {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}
                    </span>
                    {locations.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLocation(addr.id);
                        }}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 text-[10px] font-bold p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Address Modal Form */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Add Delivery Location Details</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="p-4 space-y-3">
                {/* Tag */}
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormTag(t)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-colors ${
                        formTag === t
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    House / Flat / Door Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formHouseNumber}
                    onChange={e => setFormHouseNumber(e.target.value)}
                    placeholder="e.g. Flat 301, Block A or Villa 12"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Building / Society / Office Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAreaName}
                    onChange={e => setFormAreaName(e.target.value)}
                    placeholder="e.g. DLF Cyber City or Jubilee Ridge"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={e => setFormAddress(e.target.value)}
                    placeholder="e.g. Road No 36, Beside Metro Station"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    value={formLandmark}
                    onChange={e => setFormLandmark(e.target.value)}
                    placeholder="e.g. Near HDFC Bank ATM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md mt-2"
                >
                  Save Address
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
