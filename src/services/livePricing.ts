export interface FuelCommodity {
  id: string;
  name: string;
  type: 'petrol' | 'diesel' | 'cng' | 'lpg' | 'ev';
  unit: string;
  price: number;
  previousPrice: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  badge?: string;
  color: string;
  description: string;
}

export interface BatteryItem {
  id: string;
  brand: string;
  model: string;
  vehicleType: 'Car (Hatchback/Sedan)' | 'Car (SUV/MUV)' | 'Motorcycle/Scooter' | 'Heavy Vehicle/Truck';
  capacity: string; // e.g. 35Ah, 45Ah, 65Ah, 5Ah
  warranty: string; // e.g. 55 Months (30 Free + 25 Pro-rata)
  mrp: number;
  exchangeRebate: number; // Scrap discount for old battery
  doorstepFittingFee: number; // 0 for free
  features: string[];
  image: string;
  inStock: boolean;
  estArrivalMin: number;
}

export interface RoadsideTariff {
  id: string;
  serviceName: string;
  category: 'emergency' | 'maintenance' | 'inspection';
  standardPrice: number;
  strikePrice?: number;
  estTimeMin: number;
  description: string;
  includes: string[];
}

export interface CityPriceProfile {
  city: string;
  state: string;
  petrol: number;
  diesel: number;
  cng: number;
  lpg: number;
  ev: number;
  lastUpdated: string;
}

export const CITY_COMMODITY_PRICES: CityPriceProfile[] = [
  {
    city: 'Hyderabad',
    state: 'Telangana',
    petrol: 109.66,
    diesel: 97.82,
    cng: 92.50,
    lpg: 64.20,
    ev: 18.50,
    lastUpdated: 'Today, 06:00 AM IST',
  },
  {
    city: 'Bangalore',
    state: 'Karnataka',
    petrol: 102.86,
    diesel: 88.94,
    cng: 89.00,
    lpg: 61.50,
    ev: 17.80,
    lastUpdated: 'Today, 06:00 AM IST',
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    petrol: 104.21,
    diesel: 92.15,
    cng: 87.00,
    lpg: 63.80,
    ev: 19.20,
    lastUpdated: 'Today, 06:00 AM IST',
  },
  {
    city: 'Delhi',
    state: 'Delhi NCR',
    petrol: 94.72,
    diesel: 87.62,
    cng: 79.50,
    lpg: 59.90,
    ev: 16.50,
    lastUpdated: 'Today, 06:00 AM IST',
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    petrol: 100.75,
    diesel: 92.34,
    cng: 88.50,
    lpg: 62.10,
    ev: 18.00,
    lastUpdated: 'Today, 06:00 AM IST',
  },
];

export const BATTERY_CATALOG: BatteryItem[] = [
  {
    id: 'bat-exide-35ah',
    brand: 'Exide',
    model: 'Exide Epiq 35Ah (EPIQ35L)',
    vehicleType: 'Car (Hatchback/Sedan)',
    capacity: '35 Ah (12V)',
    warranty: '77 Months (42 Free + 35 Pro-rata)',
    mrp: 4299,
    exchangeRebate: 700,
    doorstepFittingFee: 0,
    features: ['Zero Maintenance', 'Penta-Alloy Tech', 'High Cranking Power', 'Free Doorstep Fitting in 15 Min'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400',
    inStock: true,
    estArrivalMin: 15,
  },
  {
    id: 'bat-amaron-45ah',
    brand: 'Amaron',
    model: 'Amaron FLO 45Ah (AAM-FL-545106036)',
    vehicleType: 'Car (SUV/MUV)',
    capacity: '45 Ah (12V)',
    warranty: '66 Months (36 Free + 30 Pro-rata)',
    mrp: 5499,
    exchangeRebate: 850,
    doorstepFittingFee: 0,
    features: ['Silver-Alloy Technology', 'Factory Charged', 'High Heat Resistance', 'Free Terminal Greasing'],
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=400',
    inStock: true,
    estArrivalMin: 15,
  },
  {
    id: 'bat-exide-65ah',
    brand: 'Exide',
    model: 'Exide Mileage 65Ah (ML65D26L)',
    vehicleType: 'Heavy Vehicle/Truck',
    capacity: '65 Ah (12V)',
    warranty: '55 Months (30 Free + 25 Pro-rata)',
    mrp: 7899,
    exchangeRebate: 1100,
    doorstepFittingFee: 0,
    features: ['Heavy Duty Grid', 'Spill-resistant Vent', 'Extra Heavy Cranking', 'Free Alternator Health Check'],
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193b?auto=format&fit=crop&q=80&w=400',
    inStock: true,
    estArrivalMin: 20,
  },
  {
    id: 'bat-amaron-bike-5ah',
    brand: 'Amaron',
    model: 'Amaron Pro Bike Rider 5Ah (ABR-PR-APBTZ5L)',
    vehicleType: 'Motorcycle/Scooter',
    capacity: '5 Ah (12V)',
    warranty: '48 Months (24 Free + 24 Pro-rata)',
    mrp: 1350,
    exchangeRebate: 250,
    doorstepFittingFee: 0,
    features: ['VRLA Spill-proof', 'High Cold Cranking Amps', 'No Acid Refilling Needed', 'Express 15-Min Delivery'],
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=400',
    inStock: true,
    estArrivalMin: 15,
  },
];

export const ROADSIDE_TARIFFS: RoadsideTariff[] = [
  {
    id: 'serv-jumpstart',
    serviceName: '15-Min On-site Jumpstart',
    category: 'emergency',
    standardPrice: 300,
    strikePrice: 450,
    estTimeMin: 15,
    description: 'Heavy-duty booster pack jumpstart with alternator diagnostic report',
    includes: ['Commercial grade 12V/24V booster jump', 'Battery voltage & alternator test', 'Digital report via SMS'],
  },
  {
    id: 'serv-battery-health',
    serviceName: 'Battery Health & Cranking Test',
    category: 'inspection',
    standardPrice: 199,
    strikePrice: 299,
    estTimeMin: 15,
    description: 'Complete electrical check: internal resistance, CCA, charge state, and terminal cleanup',
    includes: ['Digital load tester inspection', 'Terminal corrosion cleaning & anti-corrosive jelly', 'Free if new battery bought'],
  },
  {
    id: 'serv-puncture',
    serviceName: 'Tubeless Puncture Repair',
    category: 'emergency',
    standardPrice: 150,
    strikePrice: 200,
    estTimeMin: 15,
    description: 'High-vulcanized plug repair with portable air compressor inflation',
    includes: ['Leak detection spray', 'High-tensile rubber string plug', 'Pressure check to OEM spec (PSI)'],
  },
  {
    id: 'serv-ev-mobile-charge',
    serviceName: 'Mobile Emergency EV Quick Charge',
    category: 'emergency',
    standardPrice: 499,
    strikePrice: 799,
    estTimeMin: 20,
    description: 'Mobile EV Rescue Van provides 10–15 km range boost (5–8 kWh DC Fast Charge)',
    includes: ['CCS2 / Type-2 fast charging gun', 'Emergency roadside cordoning', '5 kWh complimentary energy'],
  },
];

export function getCommodityList(cityProfile: CityPriceProfile): FuelCommodity[] {
  return [
    {
      id: 'petrol',
      name: 'Petrol (Motor Spirit)',
      type: 'petrol',
      unit: '₹/L',
      price: cityProfile.petrol,
      previousPrice: cityProfile.petrol - 0.22,
      change: +0.22,
      trend: 'up',
      badge: 'BS-VI Pure',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      description: 'Standard 91-95 Octane unleaded gasoline for cars and two-wheelers',
    },
    {
      id: 'diesel',
      name: 'Clean Diesel (HSD)',
      type: 'diesel',
      unit: '₹/L',
      price: cityProfile.diesel,
      previousPrice: cityProfile.diesel + 0.15,
      change: -0.15,
      trend: 'down',
      badge: 'Ultra-Low Sulfur',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'High-speed diesel meeting BS-VI emissions with cetane booster',
    },
    {
      id: 'cng',
      name: 'Compressed Natural Gas (CNG)',
      type: 'cng',
      unit: '₹/kg',
      price: cityProfile.cng,
      previousPrice: cityProfile.cng,
      change: 0.00,
      trend: 'stable',
      badge: 'Eco Green',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Piped natural gas compressed to 200 bar, cleanest combustion fuel',
    },
    {
      id: 'lpg',
      name: 'Auto LPG (Liquified Gas)',
      type: 'lpg',
      unit: '₹/L',
      price: cityProfile.lpg,
      previousPrice: cityProfile.lpg - 0.10,
      change: +0.10,
      trend: 'up',
      badge: 'High Economy',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      description: 'Propane/butane blend for retrofitted LPG taxis and private fleets',
    },
    {
      id: 'ev',
      name: 'EV Fast Charging (DC)',
      type: 'ev',
      unit: '₹/kWh',
      price: cityProfile.ev,
      previousPrice: cityProfile.ev,
      change: 0.00,
      trend: 'stable',
      badge: 'Mobile Van Van DC',
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      description: 'Doorstep mobile fast charging up to 30kW DC CCS2 connection',
    },
  ];
}
