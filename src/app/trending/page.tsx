'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Flame, Zap, Clock, Sparkles, ArrowLeft, ArrowRight, 
  TrendingUp, ShieldCheck, Tag
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { fetchProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import CheckoutModal from '@/components/CheckoutModal';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function TrendingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);

  // Live countdown timer for Flash Drops
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadTrending() {
      try {
        const all = await fetchProducts();
        // Curate hot deals with >= 35% discount or featured
        const curated = all.filter(p => p.discount >= 35 || p.featured).slice(0, 24);
        setProducts(curated);
      } catch {
        toast.error('Failed to load trending items');
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    setSelectedProduct(product);
    setCheckoutQuantity(quantity);
    setShowProductDetail(false);
    setShowCheckout(true);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative ambient-glow-wrapper">
        <div className="ambient-glow-orb-2" />
        <div className="ambient-glow-orb-3" />

        {/* ─── Header & Flash Sale Banner ──────────────────────────── */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/[0.12] mb-8 shadow-2xl relative overflow-hidden bg-gradient-to-r from-violet-950/60 via-purple-900/40 to-pink-950/60">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-3 shadow-lg">
                <Flame size={14} className="fill-rose-400 text-rose-400" />
                Limited Quantity Flash Drop
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight leading-tight">
                Trending Drops & Hot Deals
              </h1>
              <p className="text-sm sm:text-base text-white/70 mt-2 max-w-xl leading-relaxed">
                Hand-picked discounts up to 60% off directly from creators. Stock is live and synchronized with the database in real-time.
              </p>
            </div>

            {/* Countdown Clock Widget */}
            <div className="flex-shrink-0 bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block mb-2 text-center flex items-center justify-center gap-1.5">
                <Clock size={12} className="text-rose-400" /> Drop Ends In
              </span>
              <div className="flex items-center gap-2 text-center">
                <div className="w-12 py-2 rounded-xl bg-white/[0.06] border border-white/10">
                  <span className="text-xl font-extrabold text-white font-display block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-white/40 uppercase font-bold">Hrs</span>
                </div>
                <span className="text-white/40 font-bold">:</span>
                <div className="w-12 py-2 rounded-xl bg-white/[0.06] border border-white/10">
                  <span className="text-xl font-extrabold text-white font-display block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-white/40 uppercase font-bold">Min</span>
                </div>
                <span className="text-white/40 font-bold">:</span>
                <div className="w-12 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
                  <span className="text-xl font-extrabold text-rose-400 font-display block">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-rose-300 uppercase font-bold">Sec</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Breadcrumb / Info Bar ───────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white font-display">Active Flash Deals</h2>
            <p className="text-xs text-white/50">Showing {products.length} viral products with high creator demand</p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <span>Explore Full Catalog</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="product-card-luxury overflow-hidden">
                <div className="aspect-[4/3] sm:aspect-[1/1] skeleton shimmer-effect" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 skeleton rounded w-2/3" />
                  <div className="h-4 skeleton rounded w-5/6" />
                  <div className="h-8 skeleton rounded-xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onBuyNow={handleBuyNow}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}

        {/* ─── Full Product Information Modal ──────────────────────── */}
        {showProductDetail && selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            isOpen={showProductDetail}
            onClose={() => setShowProductDetail(false)}
            onBuyNow={handleBuyNow}
          />
        )}

        {/* ─── Checkout Modal ──────────────────────────────────────── */}
        {showCheckout && selectedProduct && (
          <CheckoutModal
            product={selectedProduct}
            quantity={checkoutQuantity}
            onClose={() => { setShowCheckout(false); setSelectedProduct(null); }}
            onSuccess={() => {
              toast.success('Trending deal purchased!');
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
