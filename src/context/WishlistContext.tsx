'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: Product[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  isInWishlist: () => false,
  toggleWishlist: () => {},
  wishlistCount: 0,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bio_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      let updated: Product[];
      if (exists) {
        updated = prev.filter(p => p.id !== product.id);
        toast.success(`Removed "${product.name}" from saved items`);
      } else {
        updated = [product, ...prev];
        toast.success(`❤️ Saved "${product.name}" to your wishlist!`);
      }
      try {
        localStorage.setItem('bio_wishlist', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
