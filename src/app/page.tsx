'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, MapPin, CheckCircle, Zap, Users, Star, RefreshCw, 
  ArrowUpDown, Share2, ShieldCheck, Sparkles, SlidersHorizontal, 
  X, ExternalLink, Heart
} from 'lucide-react';
import type { Product, StoreProfile } from '@/types';
import { fetchProducts, fetchStoreProfile, trackEvent } from '@/lib/api';
import { useWebSocket } from '@/context/WebSocketContext';
import ProductCard from '@/components/ProductCard';
import CheckoutModal from '@/components/CheckoutModal';
import ProductDetailModal from '@/components/ProductDetailModal';
import ConnectionStatus from '@/components/ConnectionStatus';
import AppShell from '@/components/AppShell';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 'All', label: 'All Picks', icon: '✨' },
  { id: 'Fashion', label: 'Fashion', icon: '👗' },
  { id: 'Jewellery', label: 'Jewellery', icon: '💎' },
  { id: 'Footwear', label: 'Footwear', icon: '👟' },
  { id: 'Beauty', label: 'Beauty', icon: '💄' },
  { id: 'Accessories', label: 'Accessories', icon: '🕶️' },
  { id: 'Electronics', label: 'Electronics', icon: '⚡' },
  { id: 'Home & Living', label: 'Home & Living', icon: '🏡' },
];

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { stockUpdates, lastMessage, isConnected } = useWebSocket();

  // Load products & profile
  const loadData = useCallback(async () => {
    const t0 = performance.now();
    setLoading(true);
    try {
      const [prods, prof] = await Promise.all([
        fetchProducts({ 
          category: category === 'All' ? undefined : category, 
          search: search.trim() || undefined 
        }),
        profile ? Promise.resolve(profile) : fetchStoreProfile(),
      ]);
      setProducts(prods);
      if (!profile) setProfile(prof);
      setLoadTime(Math.round(performance.now() - t0));
    } catch (err) {
      console.error('Failed to load:', err);
      toast.error('Could not load products. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const t = setTimeout(loadData, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [loadData]);

  // Apply real-time stock updates from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'STOCK_UPDATE' && lastMessage.data.productId !== undefined) {
      const { productId, stock, productName, source } = lastMessage.data;
      setStockOverrides(prev => ({ ...prev, [productId!]: stock! }));

      const icon = stock === 0 ? '🔴' : '🟢';
      toast.success(
        `${icon} ${productName || productId}: ${stock === 0 ? 'SOLD OUT' : `${stock} in stock`} (via ${source || 'sync'})`,
        { duration: 4000 }
      );
    }
  }, [lastMessage]);

  const getEffectiveStock = (product: Product) => {
    if (stockOverrides[product.id] !== undefined) return stockOverrides[product.id];
    if (stockUpdates[product.id] !== undefined) return stockUpdates[product.id];
    return product.stock;
  };

  const handleBuyNow = (product: Product, quantity: number = 1) => {
    trackEvent('product_click', product.id);
    setSelectedProduct(product);
    setCheckoutQuantity(quantity);
    setShowProductDetail(false);
    setShowCheckout(true);
  };

  const handleProductClick = (product: Product) => {
    trackEvent('product_view', product.id);
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  const handleOrderSuccess = (orderId: string, remainingStock: number) => {
    if (selectedProduct) {
      setStockOverrides(prev => ({ ...prev, [selectedProduct.id]: remainingStock }));
    }
    toast.success(`🎉 Order ${orderId} confirmed! Inventory updated in real time.`, { duration: 5000 });
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success('🔗 Store link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Sorted products
  const sortedProducts = useMemo(() => {
    const items = [...products];
    switch (sortBy) {
      case 'price-asc':
        return items.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return items.sort((a, b) => b.price - a.price);
      case 'rating':
        return items.sort((a, b) => b.rating - a.rating);
      case 'featured':
      default:
        return items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [products, sortBy]);

  return (
    <AppShell>
      <div className="relative ambient-glow-wrapper pb-24">
        {/* Background ambient light orbs */}
        <div className="ambient-glow-orb-2" />
        <div className="ambient-glow-orb-3" />

      {/* ─── Top Floating Glass Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#090a14]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 py-2.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-white/80 hidden sm:inline">
              Instant Zero-Redirect Checkout
            </span>
            <span className="text-xs font-semibold tracking-wide text-white/80 sm:hidden">
              BioStorefront
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <div className="h-3 w-px bg-white/10 hidden sm:block" />
            <Link
              href="/admin"
              className="text-xs font-medium text-violet-300 hover:text-white bg-violet-600/10 hover:bg-violet-600/20 px-3 py-1.5 rounded-lg border border-violet-500/20 transition-all flex items-center gap-1.5"
              id="nav-admin"
            >
              <span>Admin Dashboard</span>
              <ExternalLink size={11} className="opacity-70" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Container ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        {/* Creator / Storefront Glass Hero Card */}
        <div className="glass-panel rounded-3xl overflow-hidden relative mb-8 shadow-2xl border border-white/[0.1]">
          {/* Banner cover */}
          <div className="h-40 sm:h-64 relative overflow-hidden">
            {profile?.banner ? (
              <img
                src={profile.banner}
                alt="Store banner"
                className="w-full h-full object-cover transform hover:scale-103 transition-transform duration-1000"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-violet-900/60 via-purple-900/50 to-pink-900/60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c16] via-[#0b0c16]/50 to-transparent" />
            
            {/* Quick Share action button top right */}
            <button
              onClick={handleShare}
              className="absolute top-4 right-4 glass-pill px-3.5 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-1.5 hover:bg-white/20 transition-all shadow-lg"
              title="Share storefront"
            >
              <Share2 size={13} className="text-violet-400" />
              <span>{isCopied ? 'Link Copied!' : 'Share Store'}</span>
            </button>
          </div>

          {/* Profile details & metrics */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 relative z-10 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              
              {/* Avatar + Main Info */}
              <div className="flex items-end gap-4">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-violet-500 via-pink-500 to-amber-400 shadow-2xl flex-shrink-0">
                    <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900">
                      {profile?.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-violet-400">
                          B
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-[#0b0c16] w-5 h-5 rounded-full flex items-center justify-center shadow-lg" title="Live sync active">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>

                <div className="pb-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                      {profile?.name || 'BioStorefront'}
                    </h1>
                    {profile?.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm">
                        <CheckCircle size={12} className="text-violet-400 fill-violet-400/20" />
                        Verified Partner
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-violet-400/90 font-medium mt-0.5">
                    {profile?.handle || '@biostorefront'}
                  </p>
                </div>
              </div>

              {/* Verified Trust Badges */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="glass-pill px-3 py-1.5 rounded-xl text-white/80 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Buyer Protection</span>
                </span>
                <span className="glass-pill px-3 py-1.5 rounded-xl text-white/80 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>100% Authentic</span>
                </span>
              </div>
            </div>

            {/* Description */}
            {profile?.description && (
              <p className="text-sm sm:text-base text-white/70 mt-4 leading-relaxed max-w-2xl font-normal">
                {profile.description}
              </p>
            )}

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-white/[0.08]">
              <div className="glass-pill rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-medium">Followers</p>
                  <p className="text-sm sm:text-base font-bold text-white font-display">{profile?.followers || '42.8K'}</p>
                </div>
              </div>

              <div className="glass-pill rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                  <Star size={16} className="fill-amber-400/40" />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-medium">Customer Rating</p>
                  <p className="text-sm sm:text-base font-bold text-white font-display">4.9 ★ (1.8k+)</p>
                </div>
              </div>

              <div className="glass-pill rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-medium">Live Catalog</p>
                  <p className="text-sm sm:text-base font-bold text-white font-display">{products.length}+ Items</p>
                </div>
              </div>

              <div className="glass-pill rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-xs text-white/40 font-medium">Location</p>
                  <p className="text-sm sm:text-base font-bold text-white font-display truncate">{profile?.location || 'Mumbai, IN'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Search & Sort Bar ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search Input with glow */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              className="luxury-input pl-11 pr-10"
              placeholder="Search by product name, tag (e.g. kurti, watch, earbuds)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="product-search"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="glass-pill px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-white/5 border border-white/10 appearance-none pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                id="sort-select"
              >
                <option value="featured" className="bg-slate-900 text-white">⭐ Featured First</option>
                <option value="price-asc" className="bg-slate-900 text-white">💵 Price: Low to High</option>
                <option value="price-desc" className="bg-slate-900 text-white">💎 Price: High to Low</option>
                <option value="rating" className="bg-slate-900 text-white">🔥 Highest Rated</option>
              </select>
              <ArrowUpDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ─── Category Filter Pill Slider ──────────────────────────── */}
        <div className="flex gap-2 sm:gap-2.5 mb-7 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(cat => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-violet-600/35 border border-white/20 transform -translate-y-0.5'
                    : 'glass-pill text-white/70 hover:text-white hover:border-white/20'
                }`}
                id={`category-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Products Feed Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-display text-white">
              {category === 'All' ? 'Curated Collection' : category}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              {sortedProducts.length} items
            </span>
          </div>

          {loadTime !== null && (
            <span className="text-[11px] text-emerald-400/80 font-medium">
              ⚡ Loaded in {loadTime}ms
            </span>
          )}
        </div>

        {/* ─── Product Cards Grid ───────────────────────────────────── */}
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
        ) : sortedProducts.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">No products found</h3>
            <p className="text-white/50 text-sm mb-6">
              We couldn’t find any items matching &ldquo;{search}&rdquo; in {category}.
            </p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="btn-luxury-primary"
            >
              <RefreshCw size={14} /> Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                liveStock={getEffectiveStock(product)}
                onBuyNow={handleBuyNow}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Full Product Information Modal ─────────────────────── */}
      {showProductDetail && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          liveStock={getEffectiveStock(selectedProduct)}
          isOpen={showProductDetail}
          onClose={() => setShowProductDetail(false)}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* ─── Checkout & Instant Buy Modal ─────────────────────────── */}
      {showCheckout && selectedProduct && (
        <CheckoutModal
          product={selectedProduct}
          quantity={checkoutQuantity}
          liveStock={getEffectiveStock(selectedProduct)}
          onClose={() => { setShowCheckout(false); setSelectedProduct(null); }}
          onSuccess={handleOrderSuccess}
        />
      )}
      </div>
    </AppShell>
  );
}
