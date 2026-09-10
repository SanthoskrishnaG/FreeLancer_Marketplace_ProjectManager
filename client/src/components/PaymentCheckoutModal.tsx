import React, { useState } from 'react';
import { Invoice } from '../types/index.js';
import { processPaymentApi } from '../api/payment.api.js';
import {
  CreditCard,
  CheckCircle2,
  X,
  Loader2,
  Lock,
  Building2,
} from 'lucide-react';

interface PaymentCheckoutModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'mock_card' | 'mock_escrow'>('mock_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    transactionId: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await processPaymentApi({
        invoiceId: invoice.id,
        provider: 'MOCK',
        paymentMethod: selectedMethod,
        currency: 'USD',
      });

      setPaymentResult({
        transactionId: res.payment.transactionId,
        message: res.message,
      });

      onPaymentSuccess();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Payment failed. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Invoice Settlement Checkout</h3>
              <p className="text-xs text-slate-400">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {paymentResult ? (
            /* Success View */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Payment Successful!</h4>
                <p className="text-xs text-slate-400 mt-1">{paymentResult.message}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="text-brand-400 font-mono font-medium truncate max-w-[200px]">
                    {paymentResult.transactionId}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Settled Total</span>
                  <span className="text-emerald-400 font-bold">${Number(invoice.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Gateway Provider</span>
                  <span className="text-white font-medium">Mock Gateway (Test Engine)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-xs font-bold bg-brand-400 text-slate-950 hover:bg-brand-300 transition-all shadow-lg shadow-brand-500/20"
              >
                Close & View Updated Invoice
              </button>
            </div>
          ) : (
            /* Payment Input View */
            <>
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                  {errorMessage}
                </div>
              )}

              {/* Invoice Summary Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Project / Scope</span>
                  <span className="text-white font-medium truncate max-w-[220px]">
                    {invoice.project?.title || 'Contract Deliverables'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Milestone Items</span>
                  <span className="text-slate-300">{invoice.items?.length || 1} Deliverables</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-300 font-semibold">Total Amount Due</span>
                  <span className="text-base font-extrabold text-brand-400">
                    ${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Method Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Select Settlement Method
                </label>

                <div
                  onClick={() => setSelectedMethod('mock_card')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedMethod === 'mock_card'
                      ? 'bg-brand-500/10 border-brand-500/40 shadow-lg shadow-brand-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 font-bold text-xs">
                      💳
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Mock Corporate Credit Card</p>
                      <p className="text-[11px] text-slate-400">Ends with •••• 4242 (Simulated Auth)</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="method"
                    checked={selectedMethod === 'mock_card'}
                    onChange={() => setSelectedMethod('mock_card')}
                    className="accent-brand-400 w-4 h-4"
                  />
                </div>

                <div
                  onClick={() => setSelectedMethod('mock_escrow')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedMethod === 'mock_escrow'
                      ? 'bg-brand-500/10 border-brand-500/40 shadow-lg shadow-brand-500/10'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 font-bold text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Marketplace Escrow Vault</p>
                      <p className="text-[11px] text-slate-400">Direct release from client deposit</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="method"
                    checked={selectedMethod === 'mock_escrow'}
                    onChange={() => setSelectedMethod('mock_escrow')}
                    className="accent-brand-400 w-4 h-4"
                  />
                </div>
              </div>

              {/* Zero-Card-Storage Security Guarantee */}
              <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-[11px] text-emerald-300">
                <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>
                  PCI-DSS Zero Storage Policy: Sensitive card numbers are never stored in our database.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>Pay ${Number(invoice.total).toFixed(2)}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
