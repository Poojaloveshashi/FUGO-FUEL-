import QRCode from 'qrcode';
import { PaymentTransactionInfo, PaymentMethodCategory } from '../types';

export const FUGO_MERCHANT_VPA = 'fugo.energy@icicibank';
export const FUGO_MERCHANT_NAME = 'Fugo Fuel Express';
export const FUGO_GSTIN = '36AABCF9821L1ZT';

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  brand: 'Visa' | 'Mastercard' | 'RuPay' | 'American Express' | 'Diners Club' | 'Card';
  saveCard: boolean;
}

export interface FleetCardDetails {
  provider: 'IndianOil XTRAPOWER' | 'BPCL SmartFleet' | 'HPCL DriveTrack Plus' | 'Shell Fleet Card' | 'Reliance TransConnect';
  cardNumber: string;
  cardPin: string;
  vehicleRegNumber: string;
  odometerReading: string;
  driverName?: string;
}

export interface PayLaterDetails {
  provider: 'Simpl' | 'LazyPay' | 'Corporate 30-Day Fleet Credit';
  accountPhone: string;
  creditLimit: number;
  availableLimit: number;
}

export const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC0000001', icon: '🏦' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBIN0000001', icon: '🏛️' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICIC0000001', icon: '🏦' },
  { id: 'axis', name: 'Axis Bank', code: 'UTIB0000001', icon: '🏢' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KKBK0000001', icon: '💼' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PUNB0000001', icon: '🏛️' },
  { id: 'bob', name: 'Bank of Baroda', code: 'BARB0000001', icon: '🏦' },
  { id: 'canara', name: 'Canara Bank', code: 'CNRB0000001', icon: '🏛️' },
  { id: 'indusind', name: 'IndusInd Bank', code: 'INDB0000001', icon: '🏢' },
  { id: 'yes', name: 'Yes Bank', code: 'YESB0000001', icon: '💼' },
  { id: 'idfc', name: 'IDFC FIRST Bank', code: 'IDFB0000001', icon: '🏦' },
  { id: 'federal', name: 'Federal Bank', code: 'FDRL0000001', icon: '🏢' },
];

export const ALL_BANKS = [
  ...POPULAR_BANKS,
  { id: 'union', name: 'Union Bank of India', code: 'UBIN0000001', icon: '🏛️' },
  { id: 'uco', name: 'UCO Bank', code: 'UCBA0000001', icon: '🏦' },
  { id: 'boi', name: 'Bank of India', code: 'BKID0000001', icon: '🏛️' },
  { id: 'central', name: 'Central Bank of India', code: 'CBIN0000001', icon: '🏦' },
  { id: 'rbl', name: 'RBL Bank', code: 'RATN0000001', icon: '💼' },
  { id: 'standard_chartered', name: 'Standard Chartered', code: 'SCBL0000001', icon: '🌐' },
  { id: 'citi', name: 'Citibank India', code: 'CITI0000001', icon: '🌐' },
];

export const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '⚡', scheme: 'tez://upi/pay' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', scheme: 'phonepe://pay' },
  { id: 'paytm', name: 'Paytm UPI', icon: '🔵', scheme: 'paytmmp://pay' },
  { id: 'cred', name: 'CRED UPI', icon: '⚪', scheme: 'cred://pay' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳', scheme: 'bhim://pay' },
  { id: 'amazon', name: 'Amazon Pay', icon: '🟠', scheme: 'amazonpay://pay' },
];

export const WALLET_PROVIDERS = [
  { id: 'fugo', name: 'Fugo Fuel Balance', subtitle: 'Instant 1-Click Fuel Dispense', isDefault: true },
  { id: 'paytm', name: 'Paytm Wallet', subtitle: 'Linked with OTP' },
  { id: 'amazon', name: 'Amazon Pay Balance', subtitle: 'Fast 1-tap checkout' },
  { id: 'phonepe', name: 'PhonePe Wallet', subtitle: 'Instant cashback eligible' },
  { id: 'mobikwik', name: 'MobiKwik Fuel Wallet', subtitle: 'SuperCash auto-applied' },
];

export const FLEET_CARD_PROVIDERS: FleetCardDetails['provider'][] = [
  'IndianOil XTRAPOWER',
  'BPCL SmartFleet',
  'HPCL DriveTrack Plus',
  'Shell Fleet Card',
  'Reliance TransConnect',
];

export function detectCardBrand(num: string): CardDetails['brand'] {
  const clean = num.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
  if (/^(60|65|81|82)/.test(clean)) return 'RuPay';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^(30|36|38)/.test(clean)) return 'Diners Club';
  return 'Card';
}

export function formatCardNumber(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 16);
  const groups = clean.match(/.{1,4}/g);
  return groups ? groups.join(' ') : clean;
}

export function formatFleetCardNumber(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 16);
  const groups = clean.match(/.{1,4}/g);
  return groups ? groups.join(' ') : clean;
}

export function formatExpiry(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) {
    return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
  }
  return clean;
}

export function validateExpiry(expiry: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [mmStr, yyStr] = expiry.split('/');
  const mm = parseInt(mmStr, 10);
  const yy = parseInt(`20${yyStr}`, 10);
  if (mm < 1 || mm > 12) return false;

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  if (yy < curYear) return false;
  if (yy === curYear && mm < curMonth) return false;
  return true;
}

export function validateLuhn(num: string): boolean {
  const clean = num.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function validateVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(vpa.trim());
}

export function generateTransactionId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TXN_${dateStr}_${rand}`;
}

export function generateRRN(): string {
  return `RRN_${Math.floor(100000000000 + Math.random() * 900000000000)}`;
}

export function generateAuthCode(): string {
  return `AUTH_${Math.floor(100000 + Math.random() * 900000)}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${num}`;
}

export function buildUpiPayloadUrl(amount: number, txnId: string, customVpa?: string): string {
  const pa = customVpa || FUGO_MERCHANT_VPA;
  const pn = encodeURIComponent(FUGO_MERCHANT_NAME);
  const am = amount.toFixed(2);
  const tn = encodeURIComponent(`FugoFuel_${txnId}`);
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}&tr=${txnId}`;
}

export async function generateUpiQrDataUrl(amount: number, txnId: string): Promise<string> {
  const upiUrl = buildUpiPayloadUrl(amount, txnId);
  try {
    return await QRCode.toDataURL(upiUrl, {
      margin: 1,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (e) {
    console.error('Failed to generate QR code', e);
    return '';
  }
}

const WALLET_KEY = 'fugo_wallet_balance';
const DEFAULT_WALLET_BALANCE = 5000;

export function getWalletBalance(): number {
  if (typeof localStorage === 'undefined') return DEFAULT_WALLET_BALANCE;
  const val = localStorage.getItem(WALLET_KEY);
  if (!val) {
    localStorage.setItem(WALLET_KEY, DEFAULT_WALLET_BALANCE.toString());
    return DEFAULT_WALLET_BALANCE;
  }
  const parsed = parseFloat(val);
  return isNaN(parsed) ? DEFAULT_WALLET_BALANCE : parsed;
}

export function updateWalletBalance(delta: number): number {
  const current = getWalletBalance();
  const next = Math.max(0, current + delta);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(WALLET_KEY, next.toFixed(2));
  }
  return next;
}

export function createPaymentRecord(params: {
  method: PaymentMethodCategory;
  methodTitle: string;
  amount: number;
  subtotal: number;
  deliveryFee: number;
  cardLast4?: string;
  cardBrand?: string;
  upiVpa?: string;
  upiApp?: string;
  bankName?: string;
  walletName?: string;
  fleetProvider?: string;
  fleetCardNumber?: string;
  fleetVehicleReg?: string;
  fleetOdometer?: string;
  payLaterProvider?: string;
  podType?: 'cash' | 'card_pos' | 'qr_pos';
  changeRequiredFor?: number;
}): PaymentTransactionInfo {
  const txnId = generateTransactionId();
  const gstAmount = Math.round(params.subtotal * 0.18); // 18% GST (CGST 9% + SGST 9%)
  
  return {
    method: params.method,
    methodTitle: params.methodTitle,
    transactionId: txnId,
    rrn: generateRRN(),
    authCode: generateAuthCode(),
    paidAt: new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    status: params.method === 'pod' ? 'PENDING_ON_DELIVERY' : 'PAID',
    amount: params.amount,
    subtotal: params.subtotal,
    deliveryFee: params.deliveryFee,
    gstAmount,
    invoiceNumber: generateInvoiceNumber(),
    cardLast4: params.cardLast4,
    cardBrand: params.cardBrand,
    upiVpa: params.upiVpa,
    upiApp: params.upiApp,
    bankName: params.bankName,
    walletName: params.walletName,
    fleetProvider: params.fleetProvider,
    fleetCardNumber: params.fleetCardNumber ? `•••• ${params.fleetCardNumber.slice(-4)}` : undefined,
    fleetVehicleReg: params.fleetVehicleReg,
    fleetOdometer: params.fleetOdometer,
    payLaterProvider: params.payLaterProvider,
    podType: params.podType,
    changeRequiredFor: params.changeRequiredFor,
  };
}
