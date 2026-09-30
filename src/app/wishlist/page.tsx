'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import CheckoutModal from '@/components/CheckoutModal';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);

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

        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft size={13} /> Back to Catalog
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
                <Heart size={20} className="fill-rose-400/20" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  My Saved Wishlist
                </h1>
                <p className="text-xs sm:text-sm text-white/50">
                  {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved for quick zero-redirect checkout
                </p>
              </div>
            </div>
          </div>

          {wishlistCount > 0 && (
            <Link href="/" className="btn-luxury-secondary text-xs self-start sm:self-auto">
              Continue Browsing
            </Link>
          )}
        </div>

        {/* ─── Wishlist Grid ────────────────────────────────────────── */}
        {wishlistCount === 0 ? (
          <div className="glass-panel rounded-3xl p-12 sm:p-16 text-center max-w-lg mx-auto my-12 border border-white/10">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <Heart size={28} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-display">Your Wishlist is Empty</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Explore our catalog of 130+ products and tap the heart icon or save items you love to shop later.
            </p>
            <Link href="/" className="btn-luxury-primary">
              <Sparkles size={16} /> Explore Storefront Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {wishlist.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onBuyNow={handleBuyNow}
                onProductClick={handleProductClick}
                onAddToCart={(p) => {
                  addToCart(p, 1);
                  toast.success(`Added ${p.name} to bag!`, { icon: '🛍️' });
                }}
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
              toast.success('Ordered from your wishlist!');
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
