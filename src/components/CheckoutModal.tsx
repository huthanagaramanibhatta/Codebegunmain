'use client';

import { useState } from 'react';
import { 
  X, ShoppingBag, CheckCircle, Loader2, CreditCard, Smartphone, 
  Wallet, AlertCircle, ShieldCheck, Truck, Sparkles, ArrowRight
} from 'lucide-react';
import type { Product } from '@/types';
import { initiateCheckout, confirmOrder, trackEvent } from '@/lib/api';
import toast from 'react-hot-toast';

type Step = 'details' | 'payment' | 'processing' | 'success';

interface CheckoutModalProps {
  product: Product;
  quantity?: number;
  liveStock?: number;
  onClose: () => void;
  onSuccess?: (orderId: string, remainingStock: number) => void;
}

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / QR', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Debit & Credit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'wallet', label: 'Wallets / NetBanking', icon: Wallet, description: 'Instant checkout from wallet' },
] as const;

export default function CheckoutModal({ product, quantity = 1, liveStock, onClose, onSuccess }: CheckoutModalProps) {
  const currentStock = liveStock !== undefined ? liveStock : product.stock;
  const checkoutQty = Math.max(1, quantity);
  const totalAmount = product.price * checkoutQty;
  const [step, setStep] = useState<Step>('details');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    paymentMethod: 'upi' as 'upi' | 'card' | 'wallet',
    upiId: '',
  });

  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    paymentId: string;
    remainingStock: number;
  } | null>(null);

  const formatPrice = (p: number) => `₹${p.toLocaleString('en-IN')}`;

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!form.customerName.trim()) return 'Please enter your full name';
    if (!form.customerPhone.match(/^[6-9]\d{9}$/)) return 'Enter a valid 10-digit Indian mobile number';
    if (!form.address.trim() || form.address.length < 8) return 'Please enter your complete shipping address';
    return '';
  };

  const handleProceedToPayment = async () => {
    const err = validateForm();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');

    try {
      trackEvent('checkout_started', product.id);
      const session = await initiateCheckout(product.id, checkoutQty);
      setSessionId(session.sessionId);
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setStep('processing');
    setLoading(true);
    setError('');

    // Simulate swift instant gateway processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const result = await confirmOrder({
        sessionId: sessionId || undefined,
        productId: product.id,
        quantity: checkoutQty,
        amount: totalAmount,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        address: form.address,
        paymentMethod: form.paymentMethod,
        paymentId: `DEMO_PAY_${Date.now()}`,
      });

      setOrderResult({
        orderId: result.orderId,
        paymentId: result.paymentId,
        remainingStock: result.remainingStock,
      });

      setStep('success');
      if (onSuccess) onSuccess(result.orderId, result.remainingStock);

    } catch (err: any) {
      setError(err.message || 'Payment simulation failed. Please try again.');
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  if (currentStock === 0 && step === 'details') {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400" size={28} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-display">Item Sold Out</h3>
          <p className="text-white/50 text-sm mb-6">{product.name} is currently out of stock.</p>
          <button className="btn-luxury-secondary w-full" onClick={onClose}>
            Back to Store
          </button>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper onClose={step !== 'processing' ? onClose : undefined}>
      {/* ─── Product Overview Card ─────────────────────────────────── */}
      <div className="flex gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-5 items-center">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-0.5">
            {product.category}
          </span>
          <p className="font-display font-bold text-white text-sm sm:text-base leading-snug truncate">
            {product.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base sm:text-lg font-black text-white font-display">
              {formatPrice(totalAmount)}
            </span>
            {checkoutQty > 1 && (
              <span className="text-xs text-violet-300 font-bold bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 rounded-md">
                Qty: {checkoutQty}
              </span>
            )}
            {product.originalPrice > product.price && (
              <span className="text-xs text-white/40 line-through">
                {formatPrice(product.originalPrice * checkoutQty)}
              </span>
            )}
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              FREE Express Shipping
            </span>
          </div>
        </div>
      </div>

      {/* ─── Step 1: Customer Details ──────────────────────────────── */}
      {step === 'details' && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-white font-display">Shipping Information</h2>
            <span className="text-xs text-violet-300 font-medium flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" /> Secure Checkout
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <input
                id="name"
                className="luxury-input"
                placeholder="e.g. Priya Sharma"
                value={form.customerName}
                onChange={e => handleChange('customerName', e.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="phone">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold text-sm">+91</span>
                <input
                  id="phone"
                  className="luxury-input pl-14"
                  placeholder="98765 43210"
                  value={form.customerPhone}
                  onChange={e => handleChange('customerPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  type="tel"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="address">Delivery Address</label>
              <textarea
                id="address"
                className="luxury-input resize-none"
                rows={3}
                placeholder="Flat / House no., Landmark, City, State, PIN Code"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              className="btn-luxury-primary w-full py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
              onClick={handleProceedToPayment}
              disabled={loading}
              id="proceed-to-payment"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              <span>{loading ? 'Securing checkout...' : `Continue to Payment • ${formatPrice(product.price)}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Payment Selection ─────────────────────────────── */}
      {step === 'payment' && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg font-bold text-white font-display">Select Payment Method</h2>
            <button 
              onClick={() => setStep('details')}
              className="text-xs text-violet-400 hover:text-violet-300 font-semibold underline"
            >
              Edit Details
            </button>
          </div>

          <div className="space-y-2.5">
            {PAYMENT_METHODS.map(({ id, label, icon: Icon, description }) => (
              <label
                key={id}
                htmlFor={`pay-${id}`}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  form.paymentMethod === id
                    ? 'bg-gradient-to-r from-violet-600/20 to-pink-600/20 border-violet-500/60 shadow-lg shadow-violet-500/10'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  id={`pay-${id}`}
                  name="paymentMethod"
                  value={id}
                  checked={form.paymentMethod === id}
                  onChange={() => handleChange('paymentMethod', id)}
                  className="sr-only"
                />
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  form.paymentMethod === id ? 'bg-violet-500 text-white shadow-md' : 'bg-white/5 text-white/50'
                }`}>
                  <Icon size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${form.paymentMethod === id ? 'text-white' : 'text-white/80'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-white/40 truncate">{description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  form.paymentMethod === id ? 'border-violet-400 bg-violet-500' : 'border-white/25'
                }`}>
                  {form.paymentMethod === id && <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </label>
            ))}
          </div>

          {/* Sandbox mode banner */}
          <div className="flex items-center gap-2.5 text-amber-300 text-xs bg-amber-400/10 border border-amber-400/25 rounded-2xl p-3">
            <Sparkles size={16} className="text-amber-400 flex-shrink-0" />
            <span><strong>Sandbox Demonstration:</strong> Real-time instant checkout with simulated payment. No real credit card or bank charge.</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              className="btn-luxury-primary w-full py-3.5 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
              onClick={handlePay}
              disabled={loading}
              id="pay-now-button"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              <span>{loading ? 'Processing Payment...' : `Complete Order • ${formatPrice(totalAmount)}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Processing Simulation ─────────────────────────── */}
      {step === 'processing' && (
        <div className="text-center py-12 animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag size={24} className="text-violet-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2 font-display">Processing Instant Order...</h2>
          <p className="text-white/50 text-sm max-w-xs mx-auto">
            Contacting payment switch and locking inventory atomically...
          </p>
        </div>
      )}

      {/* ─── Step 4: Success ───────────────────────────────────────── */}
      {step === 'success' && orderResult && (
        <div className="text-center py-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl shadow-emerald-500/20">
            <CheckCircle size={32} />
          </div>

          <h2 className="text-2xl font-black text-white font-display mb-1">
            Order Confirmed!
          </h2>
          <p className="text-white/60 text-sm mb-6">
            Thank you, {form.customerName}! We have received your order.
          </p>

          <div className="glass-panel rounded-2xl p-4 text-left space-y-2.5 mb-6 border border-white/10 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Order Reference</span>
              <span className="text-white font-bold font-mono">{orderResult.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Transaction ID</span>
              <span className="text-white/80 font-mono text-xs">{orderResult.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Amount Paid</span>
              <span className="text-emerald-400 font-bold font-display">{formatPrice(product.price)}</span>
            </div>
            <div className="flex justify-between border-t border-white/[0.08] pt-2">
              <span className="text-white/50">Inventory Update</span>
              <span className={`font-bold ${orderResult.remainingStock === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {orderResult.remainingStock === 0 ? 'Item Now Sold Out' : `${orderResult.remainingStock} remaining`}
              </span>
            </div>
          </div>

          <button
            className="btn-luxury-primary w-full py-3"
            onClick={onClose}
            id="order-success-close"
          >
            Continue Browsing
          </button>
        </div>
      )}
    </ModalWrapper>
  );
}

function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Deep frosted backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />

      {/* Luxury Modal Container */}
      <div className="relative w-full sm:max-w-lg bg-[#0c0d18] border border-white/[0.12] rounded-t-[2rem] sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto p-5 sm:p-7 safe-bottom z-10 animate-fade-in">
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Close Button */}
        {onClose && (
          <button
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close"
            id="checkout-close"
          >
            <X size={16} />
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
