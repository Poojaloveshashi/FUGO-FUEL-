/**
 * Central System Service
 * Implements the unified core layer coordinating:
 * 1. Front-end Apps: Fuel app, Repairs app, Service app
 * 2. Central system: Same users, orders, payments, stock
 * 3. Fulfilment: Delivery (Fuel drop-offs), Mechanics (Repairs + service),
 *                Offline outlets (Pumps, garages), Warehouse (Fuel + parts stock)
 */

import { getLocalOrders, placeSupabaseOrder } from './supabase';
import { getWalletBalance, updateWalletBalance } from './payment';
import { companionSync, COMPANION_APP_URL, COMPANION_APP_ID } from './companionSync';
import { SPARE_PARTS_MASTER_CATALOG } from '../data/sparePartsCatalog';
import { SupabaseOrderRecord } from '../types';

export interface CentralStockState {
  dieselLiters: number;
  petrolLiters: number;
  cngKg: number;
  partsTotalUnits: number;
  lowStockItemsCount: number;
  lastRestockedAt: string;
}

export interface FulfilmentDeliveryUnit {
  id: string;
  name: string;
  type: 'Mobile Bowser (Diesel)' | 'Mobile Bowser (Petrol)' | 'EV Rescue Van';
  capacityLiters: number;
  currentLoadLiters: number;
  status: 'DISPATCHED' | 'STANDBY' | 'REFUELLING' | 'EN_ROUTE';
  driver: string;
  phone: string;
  currentLat: number;
  currentLng: number;
  companionAppConnected: boolean;
}

export interface FulfilmentMechanicUnit {
  id: string;
  name: string;
  specialization: 'Engine & Fuel Injectors' | 'Brakes & Suspension' | 'Electrical & Battery' | 'Quick Puncture & Lube';
  status: 'AVAILABLE' | 'ON_JOB' | 'TRANSIT';
  rating: number;
  jobsCompleted: number;
  assignedLocation: string;
}

export interface FulfilmentOutlet {
  id: string;
  name: string;
  type: 'Company-Owned Bowser Depot' | 'Partner Fuel Pump' | 'Certified Garage Station';
  address: string;
  city: 'Hyderabad' | 'Bangalore';
  pumpsAvailable: number;
  serviceBays: number;
  isOpen24x7: boolean;
}

export interface FulfilmentWarehouse {
  id: string;
  name: string;
  city: string;
  fuelStorageTanksLiters: number;
  fuelCapacityLiters: number;
  sparePartsSkus: number;
  activeDispatchesToday: number;
}

const STORAGE_KEY_CENTRAL_STOCK = 'fugo_central_system_stock';

export function getCentralStock(): CentralStockState {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STORAGE_KEY_CENTRAL_STOCK);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Fallback
      }
    }
  }

  const defaultStock: CentralStockState = {
    dieselLiters: 18450,
    petrolLiters: 12200,
    cngKg: 4800,
    partsTotalUnits: SPARE_PARTS_MASTER_CATALOG.reduce((acc, p) => acc + (p.stockQty || 12), 0),
    lowStockItemsCount: 3,
    lastRestockedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
  return defaultStock;
}

export function decrementFuelStock(type: string, liters: number) {
  const stock = getCentralStock();
  if (type.toLowerCase().includes('diesel')) {
    stock.dieselLiters = Math.max(0, stock.dieselLiters - liters);
  } else if (type.toLowerCase().includes('petrol')) {
    stock.petrolLiters = Math.max(0, stock.petrolLiters - liters);
  } else if (type.toLowerCase().includes('cng')) {
    stock.cngKg = Math.max(0, stock.cngKg - liters);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CENTRAL_STOCK, JSON.stringify(stock));
  }
}

export const FULFILMENT_DELIVERY_FLEET: FulfilmentDeliveryUnit[] = [
  {
    id: 'bowser_01',
    name: 'BharatBenz Bowser 01',
    type: 'Mobile Bowser (Diesel)',
    capacityLiters: 4000,
    currentLoadLiters: 3250,
    status: 'EN_ROUTE',
    driver: 'Rahul Sharma',
    phone: '+91 98765 43210',
    currentLat: 17.4290,
    currentLng: 78.3506,
    companionAppConnected: true,
  },
  {
    id: 'bowser_02',
    name: 'Tata 1109 Mobile Bowser 02',
    type: 'Mobile Bowser (Petrol)',
    capacityLiters: 3000,
    currentLoadLiters: 2400,
    status: 'STANDBY',
    driver: 'Vikram Singh',
    phone: '+91 98765 11223',
    currentLat: 17.4125,
    currentLng: 78.3364,
    companionAppConnected: false,
  },
  {
    id: 'ev_van_01',
    name: 'Emergency EV Charging Van',
    type: 'EV Rescue Van',
    capacityLiters: 60, // 60 kWh battery bank
    currentLoadLiters: 58,
    status: 'STANDBY',
    driver: 'Amit Patel',
    phone: '+91 98765 99887',
    currentLat: 17.4435,
    currentLng: 78.3772,
    companionAppConnected: true,
  },
];

export const FULFILMENT_MECHANICS: FulfilmentMechanicUnit[] = [
  {
    id: 'mech_01',
    name: 'K. Srinivas',
    specialization: 'Engine & Fuel Injectors',
    status: 'AVAILABLE',
    rating: 4.9,
    jobsCompleted: 342,
    assignedLocation: 'Gachibowli Hub',
  },
  {
    id: 'mech_02',
    name: 'Mohammed Razi',
    specialization: 'Brakes & Suspension',
    status: 'ON_JOB',
    rating: 4.8,
    jobsCompleted: 218,
    assignedLocation: 'Hitech City Express Bay',
  },
  {
    id: 'mech_03',
    name: 'D. Venkat',
    specialization: 'Electrical & Battery',
    status: 'AVAILABLE',
    rating: 5.0,
    jobsCompleted: 489,
    assignedLocation: 'Banjara Hills Service Unit',
  },
];

export const FULFILMENT_OFFLINE_OUTLETS: FulfilmentOutlet[] = [
  {
    id: 'outlet_01',
    name: 'DLF Cyber City Bowser Depot',
    type: 'Company-Owned Bowser Depot',
    address: 'DLF Cyber City, Gachibowli, Hyderabad',
    city: 'Hyderabad',
    pumpsAvailable: 6,
    serviceBays: 4,
    isOpen24x7: true,
  },
  {
    id: 'outlet_02',
    name: 'IOCL Partner Station - Hitech City',
    type: 'Partner Fuel Pump',
    address: 'Near Mindspace IT Park, Hyderabad',
    city: 'Hyderabad',
    pumpsAvailable: 12,
    serviceBays: 2,
    isOpen24x7: true,
  },
  {
    id: 'outlet_03',
    name: 'Fugo Certified Garage & Fitment Hub',
    type: 'Certified Garage Station',
    address: 'Road No. 36, Jubilee Hills, Hyderabad',
    city: 'Hyderabad',
    pumpsAvailable: 0,
    serviceBays: 8,
    isOpen24x7: false,
  },
  {
    id: 'outlet_04',
    name: 'MG Road Express Logistics Base',
    type: 'Company-Owned Bowser Depot',
    address: 'No 42, MG Road, Bangalore',
    city: 'Bangalore',
    pumpsAvailable: 4,
    serviceBays: 3,
    isOpen24x7: true,
  },
];

export const FULFILMENT_WAREHOUSES: FulfilmentWarehouse[] = [
  {
    id: 'wh_hyd_01',
    name: 'Hyderabad Central Fuel & Parts Depot',
    city: 'Hyderabad',
    fuelStorageTanksLiters: 65000,
    fuelCapacityLiters: 100000,
    sparePartsSkus: 64,
    activeDispatchesToday: 42,
  },
  {
    id: 'wh_blr_01',
    name: 'Bangalore Regional Logistics Hub',
    city: 'Bangalore',
    fuelStorageTanksLiters: 48000,
    fuelCapacityLiters: 80000,
    sparePartsSkus: 64,
    activeDispatchesToday: 29,
  },
];
