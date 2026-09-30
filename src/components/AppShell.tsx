'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Heart, User, Sparkles, ShoppingBag } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();
  const { totalItems, openCart } = useCart();

  const isAuthPage = pathname === '/register';

  // If on register, render auth screen without full sidebar
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#06070d] text-slate-100 flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070d] text-slate-100 flex flex-col">
      {/* ─── Sidebar (Displays upon login) ───────────────────────── */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* ─── Mobile Header ────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#090a14]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0b0c16] rounded-[10px] flex items-center justify-center">
                <Sparkles size={14} className="text-violet-400" />
              </div>
            </div>
            <span className="font-display font-black text-sm tracking-tight text-white">
              BIO<span className="text-violet-400">STORE</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <ConnectionStatus />

          <Link
            href="/wishlist"
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/70 hover:text-white relative"
            title="Wishlist"
          >
            <Heart size={16} className={wishlistCount > 0 ? 'text-rose-400 fill-rose-400/20' : ''} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/70 hover:text-white relative"
            title="Cart"
            aria-label="View Cart"
          >
            <ShoppingBag size={16} className={totalItems > 0 ? 'text-violet-400' : ''} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white font-extrabold text-[9px] flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </button>

          <Link
            href="/orders"
            className="w-9 h-9 rounded-xl overflow-hidden bg-slate-800 border border-white/10 flex items-center justify-center text-white/70"
            title={user?.name || 'Account'}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User size={16} />
            )}
          </Link>
        </div>
      </header>

      {/* ─── Main Content Canvas (offset by desktop sidebar) ─────── */}
      <div className="flex-1 lg:pl-64 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
