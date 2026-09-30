'use client';

import React from 'react';
import { 
  X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, 
  ShieldCheck, Sparkles, AlertCircle 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

interface CartDrawerProps {
  onCheckoutProduct?: (product: Product, quantity: number) => void;
}

export default function CartDrawer({ onCheckoutProduct }: CartDrawerProps) {
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totalItems, 
    totalAmount 
  } = useCart();

  if (!isCartOpen) return null;

  const formatPrice = (p: number) => `₹${p?.toLocaleString('en-IN')}`;
  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min(100, Math.round((totalAmount / freeShippingThreshold) * 100));

  const handleCheckoutAll = () => {
    if (cart.length === 0) return;
    closeCart();
    // If checkout handler provided, checkout primary product with total quantity
    if (onCheckoutProduct) {
      onCheckoutProduct(cart[0].product, cart[0].quantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0c16] border-l border-white/[0.12] shadow-2xl flex flex-col justify-between animate-slide-left">
          {/* ─── Header ────────────────────────────────────────────── */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base">Shopping Bag</h3>
                <p className="text-[11px] text-white/40">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-white/40 hover:text-rose-400 transition-colors px-2 py-1"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={closeCart}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                aria-label="Close cart"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ─── Free Shipping Bar ──────────────────────────────────── */}
          <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
              <span className="text-white/60">
                {totalAmount >= freeShippingThreshold 
                  ? '🎉 You unlocked Free Express Shipping!' 
                  : `Add ${formatPrice(freeShippingThreshold - totalAmount)} more for Free Shipping`
                }
              </span>
              <span className="text-violet-400 font-bold">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* ─── Cart Items List ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 text-white/30">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="text-base font-bold text-white font-display mb-1">Your cart is empty</h4>
                <p className="text-xs text-white/40 max-w-xs mx-auto mb-6">
                  Explore our curated collections and add your favorite pieces to shop instantly.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="btn-luxury-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  <span>Start Browsing</span>
                </button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex gap-3 relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-white/10">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-white/90 line-clamp-1">
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="text-white/30 hover:text-rose-400 transition-colors p-1"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <span className="text-[10px] text-violet-400 block font-medium">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Price */}
                      <span className="font-bold text-sm text-white font-display">
                        {formatPrice(product.price * quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-white/15 rounded-lg bg-white/[0.04]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-white">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ─── Footer: Summary & Checkout ─────────────────────────── */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#090a14] space-y-3.5">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="text-white font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Express Shipping</span>
                  <span className="text-emerald-400 font-semibold">
                    {totalAmount >= freeShippingThreshold ? 'FREE' : '₹99'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.08]">
                  <span>Total Amount</span>
                  <span className="text-lg text-violet-300 font-display">
                    {formatPrice(totalAmount + (totalAmount >= freeShippingThreshold ? 0 : 99))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckoutAll}
                className="btn-luxury-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Proceed to Instant Checkout</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-[10px] text-white/40 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Zero-redirect checkout with 256-bit encryption</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
