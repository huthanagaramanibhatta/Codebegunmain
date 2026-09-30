'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem } from '@/types';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalAmount: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  openCart: () => {},
  closeCart: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bio_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      setCart([]);
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (items: CartItem[]) => {
    setCart(items);
    try {
      localStorage.setItem('bio_cart', JSON.stringify(items));
    } catch {}
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const qty = Math.max(1, quantity);
    const existingIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + qty;
      const maxAvailable = product.stock || 99;

      if (newQty > maxAvailable) {
        toast.error(`Only ${maxAvailable} units available in stock!`);
        return;
      }

      const updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        product, // Refresh with latest product data
      };
      saveCart(updated);
      toast.success(`Updated "${product.name}" quantity (${newQty}) in cart!`, { icon: '🛒' });
    } else {
      if (product.stock !== undefined && product.stock < qty) {
        toast.error('Item is out of stock!');
        return;
      }

      const updated = [...cart, { product, quantity: qty }];
      saveCart(updated);
      toast.success(`Added "${product.name}" to cart!`, { icon: '✨' });
    }

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter(item => item.product.id !== productId);
    saveCart(updated);
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updated = cart.map(item => {
      if (item.product.id === productId) {
        const maxStock = item.product.stock !== undefined ? item.product.stock : 99;
        const validQty = Math.min(quantity, maxStock);
        if (quantity > maxStock) {
          toast.error(`Cannot exceed ${maxStock} in stock`);
        }
        return { ...item, quantity: validQty };
      }
      return item;
    });

    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
