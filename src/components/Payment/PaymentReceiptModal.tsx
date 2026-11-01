import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  ArrowRight, 
  Copy, 
  Check, 
  FileText, 
  Fuel, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { useState } from 'react';
import { PaymentTransactionInfo, Product } from '../../types';
import { FUGO_GSTIN, FUGO_MERCHANT_NAME } from '../../services/payment';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  orderId: string;
  items: { product: Product; quantity: number }[];
  deliveryAddress: string;
  payment: PaymentTransactionInfo;
  onProceedToTracking: () => void;
}

export default function PaymentReceiptModal({
  isOpen,
  orderId,
  items,
  deliveryAddress,
  payment,
  onProceedToTracking,
}: PaymentReceiptModalProps) {
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'txn' | 'inv') => {
    navigator.clipboard?.writeText(text);
    if (type === 'txn') {
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
    } else {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[130] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[32px] max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 my-6"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-xl shadow-emerald-900/30">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h2 className="text-xl font-black tracking-tight">Payment Verified & Received</h2>
            <p className="text-xs text-emerald-100 mt-1">Official Tax Invoice & Delivery Voucher</p>
            
            <div className="mt-4 pt-3 border-t border-emerald-500/40 flex items-center justify-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest bg-emerald-950/40 px-3 py-1 rounded-full text-emerald-200">
                {payment.status === 'PAID' ? 'TRANSACTION SETTLED' : 'PAYMENT ON ARRIVAL CONFIRMED'}
              </span>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-6 space-y-5 print:p-0">
            {/* Metadata Grid */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Invoice Number</span>
                <button
                  onClick={() => handleCopy(payment.invoiceNumber, 'inv')}
                  className="flex items-center gap-1 font-mono font-bold text-slate-800 hover:text-orange-600 transition-colors"
                >
                  <span>{payment.invoiceNumber}</span>
                  {copiedInvoice ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Transaction ID</span>
                <button
                  onClick={() => handleCopy(payment.transactionId, 'txn')}
                  className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700 hover:text-orange-600 transition-colors"
                >
                  <span>{payment.transactionId}</span>
                  {copiedTxn ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Bank Reference (RRN)</span>
                <span className="font-mono text-slate-700">{payment.rrn}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Payment Mode</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                  {payment.methodTitle}
                </span>
              </div>

              {payment.fleetVehicleReg && (
                <div className="flex justify-between items-center bg-blue-50/60 p-2 rounded-xl border border-blue-100">
                  <span className="text-blue-700 font-medium">Fleet Vehicle Reg</span>
                  <span className="font-mono font-extrabold text-blue-950">{payment.fleetVehicleReg}</span>
                </div>
              )}

              {payment.fleetOdometer && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Odometer Reading</span>
                  <span className="font-mono text-slate-700">{payment.fleetOdometer} km</span>
                </div>
              )}

              {payment.upiVpa && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">UPI VPA</span>
                  <span className="font-mono text-slate-700">{payment.upiVpa}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Date & Time</span>
                <span className="text-slate-700 font-mono text-[11px]">{payment.paidAt}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-400 font-medium">Merchant GSTIN</span>
                <span className="font-mono font-bold text-slate-600">{FUGO_GSTIN}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Itemized Summary
              </span>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                {items.map((item) => (
                  <div key={item.product.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {item.quantity} {item.product.unit} × ₹{item.product.price}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{item.quantity * item.product.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Base Value)</span>
                <span>₹{payment.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery & Fuel Bowser Fee</span>
                <span>₹{payment.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Integrated GST (18% / VAT included)</span>
                <span>₹{payment.gstAmount}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Total Amount Paid</span>
                <span className="text-emerald-600 text-lg">₹{payment.amount}</span>
              </div>
            </div>

            {/* Print & Download Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="py-3 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => {
                  const receiptBlob = new Blob([
                    `========================================\n` +
                    `       FUGO ENERGY LOGISTICS PVT LTD   \n` +
                    `       GSTIN: ${FUGO_GSTIN}            \n` +
                    `========================================\n` +
                    `TAX INVOICE: ${payment.invoiceNumber}\n` +
                    `ORDER ID: ${orderId}\n` +
                    `TRANSACTION ID: ${payment.transactionId}\n` +
                    `BANK RRN: ${payment.rrn}\n` +
                    `DATE: ${payment.paidAt}\n` +
                    `PAYMENT METHOD: ${payment.methodTitle}\n` +
                    `STATUS: ${payment.status}\n` +
                    `----------------------------------------\n` +
                    `ITEMS:\n` +
                    items.map(i => ` - ${i.product.name} (${i.quantity} ${i.product.unit}): Rs ${i.quantity * i.product.price}`).join('\n') +
                    `\n----------------------------------------\n` +
                    `Subtotal: Rs ${payment.subtotal}\n` +
                    `Delivery Fee: Rs ${payment.deliveryFee}\n` +
                    `GST Tax: Rs ${payment.gstAmount}\n` +
                    `TOTAL PAID: Rs ${payment.amount}\n` +
                    `DELIVERY ADDRESS: ${deliveryAddress}\n` +
                    `========================================\n` +
                    `Verified & Digitally Signed\n`
                  ], { type: 'text/plain' });
                  const url = URL.createObjectURL(receiptBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${payment.invoiceNumber}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="py-3 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download File</span>
              </button>
            </div>

            {/* Primary Track Driver Button */}
            <button
              onClick={onProceedToTracking}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-2xl shadow-xl shadow-orange-100 flex items-center justify-center gap-2 transition-all"
            >
              <span>Track Live Bowser on Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
