'use client';

import React, { useState } from 'react';
import { 
  X, Star, ShoppingCart, ShoppingBag, Zap, Flame, 
  ShieldCheck, Truck, RotateCcw, Check, Plus, Minus, Tag, ExternalLink, Heart
} from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductDetailModalProps {
  product: Product | null;
  liveStock?: number;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export default function ProductDetailModal({
  product,
  liveStock,
  isOpen,
  onClose,
  onBuyNow,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!isOpen || !product) return null;

  const isWishlisted = isInWishlist(product.id);

  const currentStock = liveStock !== undefined ? liveStock : product.stock;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 5;
  const savings = product.originalPrice > product.price ? product.originalPrice - product.price : 0;
  const subtotal = product.price * quantity;

  const formatPrice = (p: number) => `₹${p?.toLocaleString('en-IN')}`;

  const handleIncrement = () => {
    if (quantity < currentStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleBuyNowClick = () => {
    if (isOutOfStock) return;
    onBuyNow(product, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-[#0d0f1a] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-up my-auto">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        {/* Top Header Actions (Wishlist & Close) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md active:scale-95 border ${
              isWishlisted
                ? 'bg-rose-600 text-white border-rose-400/80 shadow-rose-600/30'
                : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-rose-300 border-white/15'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          >
            <Heart size={14} className={isWishlisted ? 'fill-white text-white' : ''} />
            <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all shadow-md active:scale-95"
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] md:max-h-[80vh] overflow-y-auto scrollbar-hide">
          {/* ─── Left Column: Image & Media ───────────────────────────── */}
          <div className="md:col-span-6 relative bg-slate-950 flex flex-col items-center justify-center min-h-[300px] md:min-h-[460px] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                isOutOfStock ? 'opacity-40 grayscale contrast-125' : ''
              }`}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f1a] via-transparent to-black/20 pointer-events-none md:hidden" />

            {/* Badges on Image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
              {product.discount > 0 && (
                <span className="badge-luxury-discount shadow-lg">
                  <Flame size={12} className="text-amber-200 fill-amber-200" />
                  {product.discount}% OFF
                </span>
              )}
              {product.featured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md">
                  <Zap size={11} className="fill-amber-300 text-amber-300" /> Featured
                </span>
              )}
            </div>

            {/* Live Stock Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              {isOutOfStock ? (
                <span className="badge-luxury-out-stock shadow-lg">
                  Out of Stock
                </span>
              ) : (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border shadow-lg ${
                  isLowStock 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-amber-400 radar-dot' : 'bg-emerald-400'}`} />
                  {currentStock} units available (Live Sync)
                </span>
              )}

              {product.sku && (
                <span className="text-[11px] font-mono text-white/50 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                  SKU: {product.sku}
                </span>
              )}
            </div>
          </div>

          {/* ─── Right Column: Information & Actions ─────────────────── */}
          <div className="md:col-span-6 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  {product.category}
                </span>

                <div className="flex items-center gap-1 bg-white/[0.06] px-2.5 py-1 rounded-lg border border-white/[0.08]">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-white">{product.rating}</span>
                  <span className="text-[11px] text-white/40">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white font-display leading-snug">
                {product.name}
              </h2>

              {/* Price Banner */}
              <div className="mt-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-white/40 block mb-0.5 font-medium">Direct Creator Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-white/35 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {savings > 0 && (
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-1 rounded-lg inline-block">
                      Save ₹{savings}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1.5">
                  About this Product
                </h4>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  {product.description || 'Premium curated selection from BioStorefront. Quality tested and verified for direct fast delivery.'}
                </p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold text-white/60 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <Tag size={9} className="text-violet-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector & Subtotal */}
              {!isOutOfStock && (
                <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white/70 block mb-1">Select Quantity</label>
                    <div className="flex items-center border border-white/15 rounded-xl bg-white/[0.04] p-1">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-white font-display">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={quantity >= currentStock}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-white/40 block">Item Subtotal</span>
                    <span className="text-lg font-bold text-violet-300 font-display">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Action Buttons: Wishlist, Add to Cart & Buy Now ─────── */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                    isWishlisted
                      ? 'bg-rose-600/20 text-rose-400 border-rose-500/50 hover:bg-rose-600/30'
                      : 'bg-white/[0.08] hover:bg-white/[0.14] text-white/80 hover:text-rose-400 border-white/15'
                  }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                >
                  <Heart size={18} className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''} />
                </button>

                {/* 1. ADD TO CART BUTTON */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15 transition-all shadow-md active:scale-97 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={16} className="text-violet-400" />
                  <span>Add to Cart</span>
                </button>

                {/* 2. BUY NOW BUTTON */}
                <button
                  type="button"
                  onClick={handleBuyNowClick}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:brightness-110 text-white shadow-lg shadow-violet-600/30 transition-all active:scale-97 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={16} />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-around text-[10px] text-white/40 pt-2 border-t border-white/[0.06]">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" /> Instant Zero-Redirect
                </span>
                <span className="flex items-center gap-1">
                  <Truck size={12} className="text-blue-400" /> Direct Fast Dispatch
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw size={12} className="text-amber-400" /> 7-Day Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
