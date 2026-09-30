'use client';

import { Star, ShoppingBag, Zap, Flame, Eye, ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  liveStock?: number; // real-time stock override from WebSocket
  onBuyNow?: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({
  product,
  liveStock,
  onBuyNow,
  onProductClick,
  onAddToCart,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const currentStock = liveStock !== undefined ? liveStock : product.stock;
  const isOutOfStock = currentStock === 0;
  const isLowStock = currentStock > 0 && currentStock <= 3;
  const savings = product.originalPrice > product.price ? product.originalPrice - product.price : 0;

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <article
      className="product-card-luxury group cursor-pointer flex flex-col h-full select-none"
      onClick={() => onProductClick(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onProductClick(product)}
      aria-label={`${product.name} - ${formatPrice(product.price)}`}
    >
      {/* ─── Image Container ────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] sm:aspect-[1/1] overflow-hidden bg-slate-900/60">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${
            isOutOfStock ? 'opacity-40 grayscale contrast-125' : ''
          }`}
          loading="lazy"
        />

        {/* Soft dark gradient at bottom of image for seamless contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a12]/90 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges & Wishlist Button */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2 z-10">
          <div className="flex flex-col gap-1 items-start pointer-events-none">
            {product.discount > 0 && !isOutOfStock && (
              <span className="badge-luxury-discount shimmer-effect shadow-lg">
                <Flame size={11} className="text-amber-200 fill-amber-200" />
                {product.discount}% OFF
              </span>
            )}

            {isLowStock && !isOutOfStock && (
              <span className="badge-luxury-low-stock shadow-lg backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 radar-dot" />
                Only {currentStock} left!
              </span>
            )}

            {isOutOfStock && (
              <span className="badge-luxury-out-stock shadow-lg">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist Button for Each Product */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-lg active:scale-90 pointer-events-auto border ${
              isWishlisted
                ? 'bg-rose-600 text-white border-rose-400/80 shadow-rose-600/50 scale-105'
                : 'bg-black/55 hover:bg-black/80 text-white/70 hover:text-rose-400 border-white/20 hover:scale-110'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isWishlisted ? `Remove ${product.name} from Wishlist` : `Add ${product.name} to Wishlist`}
          >
            <Heart
              size={15}
              className={`transition-all duration-200 ${
                isWishlisted ? 'fill-white text-white' : ''
              }`}
            />
          </button>
        </div>

        {/* Featured Tag (Bottom Left of Image) */}
        {product.featured && !isOutOfStock && (
          <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md">
              <Zap size={10} className="fill-amber-300 text-amber-300" /> Featured
            </span>
          </div>
        )}

        {/* Quick View Button on Desktop Hover */}
        <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-xs pointer-events-none">
          <span className="btn-luxury-secondary text-xs px-3.5 py-2 pointer-events-auto shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-1.5">
            <Eye size={13} className="text-violet-400" /> View Details
          </span>
        </div>
      </div>

      {/* ─── Product Details ────────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-violet-400/80" />
              {product.category}
            </span>

            <div className="flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded-md border border-white/[0.06]">
              <Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-white/90">{product.rating}</span>
              <span className="text-[10px] text-white/40">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-display font-semibold text-white/95 text-xs sm:text-sm leading-snug line-clamp-1 group-hover:text-violet-200 transition-colors">
            {product.name}
          </h3>

          {/* Short description preview if available */}
          {product.description && (
            <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5 leading-relaxed font-normal">
              {product.description}
            </p>
          )}
        </div>

        {/* ─── Price & Action Footer ─────────────────────────────────── */}
        <div className="pt-2 border-t border-white/[0.06] mt-auto">
          <div className="flex items-baseline justify-between mb-2.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-extrabold text-white tracking-tight font-display">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-white/35 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {savings > 0 && !isOutOfStock && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Save ₹{savings}
              </span>
            )}
          </div>

          {/* Action Row: View Details & Quick Add to Cart */}
          <div className="grid grid-cols-5 gap-1.5">
            <button
              className={`col-span-4 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white hover:brightness-110 shadow-md shadow-violet-600/30 active:scale-97'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? 'Sold out' : `View ${product.name}`}
            >
              <Eye size={13} className={isOutOfStock ? 'opacity-30' : 'text-white'} />
              <span>{isOutOfStock ? 'Sold Out' : 'View & Buy'}</span>
            </button>

            <button
              type="button"
              className="col-span-1 flex items-center justify-center p-2.5 rounded-xl bg-white/[0.06] hover:bg-violet-600/25 border border-white/10 hover:border-violet-500/40 text-white/80 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) onAddToCart(product);
                else onProductClick(product);
              }}
              disabled={isOutOfStock}
              title="Add to Cart"
              aria-label="Add to Cart"
            >
              <ShoppingCart size={14} className="text-violet-400" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
