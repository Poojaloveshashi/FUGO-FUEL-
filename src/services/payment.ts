import QRCode from 'qrcode';
import { PaymentTransactionInfo } from '../types';

export const FUGO_MERCHANT_VPA = 'fugo.energy@icicibank';
export const FUGO_MERCHANT_NAME = 'Fugo Energy Logistics';
export const FUGO_GSTIN = '36AABCF9821L1ZT';

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  brand: 'Visa' | 'Mastercard' | 'RuPay' | 'American Express' | 'Card';
  saveCard: boolean;
}

export function detectCardBrand(num: string): CardDetails['brand'] {
  const clean = num.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
  if (/^(60|65|81|82)/.test(clean)) return 'RuPay';
  if (/^3[47]/.test(clean)) return 'American Express';
  return 'Card';
}

export function formatCardNumber(val: string): string {
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
  const tn = encodeURIComponent(`Order_${txnId}`);
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
const DEFAULT_WALLET_BALANCE = 2500;

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
  method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'pod';
  methodTitle: string;
  amount: number;
  subtotal: number;
  deliveryFee: number;
  cardLast4?: string;
  cardBrand?: string;
  upiVpa?: string;
  bankName?: string;
  walletName?: string;
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
    bankName: params.bankName,
    walletName: params.walletName,
  };
}
