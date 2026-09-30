'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, Flame, Heart, Package, BarChart3, Settings, 
  LogIn, LogOut, ChevronLeft, ChevronRight, X, Sparkles, 
  ShieldCheck, User, ExternalLink, Zap, ShoppingBag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useWebSocket } from '@/context/WebSocketContext';
import { useCart } from '@/context/CartContext';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { isConnected } = useWebSocket();
  const { totalItems, openCart } = useCart();

  const navItems = [
    {
      label: 'Storefront',
      href: '/',
      icon: Store,
      badge: null,
      color: 'text-violet-400',
    },
    {
      label: 'Trending Drops',
      href: '/trending',
      icon: Flame,
      badge: 'HOT',
      color: 'text-pink-400',
    },
    {
      label: 'My Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : null,
      color: 'text-rose-400',
    },
    {
      label: 'Shopping Bag',
      action: openCart,
      icon: ShoppingBag,
      badge: totalItems > 0 ? totalItems : null,
      color: 'text-violet-400',
    },
    {
      label: 'Order Tracking',
      href: '/orders',
      icon: Package,
      badge: null,
      color: 'text-amber-400',
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
      color: 'text-cyan-400',
    },
    {
      label: 'Admin Console',
      href: '/admin',
      icon: Settings,
      badge: 'PRO',
      color: 'text-purple-400',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* ─── Logo & Brand ──────────────────────────────────────────── */}
      <div className={`p-4 sm:p-5 flex items-center justify-between border-b border-white/[0.08] ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-violet-600/30">
              <div className="w-full h-full bg-[#0b0c16] rounded-[14px] flex items-center justify-center">
                <Sparkles size={18} className="text-violet-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-display font-extrabold text-base tracking-tight text-white block">
                BIO<span className="text-violet-400">STORE</span>
              </span>
              <span className="text-[10px] text-white/40 tracking-wider font-semibold uppercase block">
                Direct Commerce
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-violet-600/30 block">
            <div className="w-full h-full bg-[#0b0c16] rounded-[14px] flex items-center justify-center">
              <Sparkles size={18} className="text-violet-400" />
            </div>
          </Link>
        )}

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* ─── Real-Time Sync Indicator ──────────────────────────────── */}
      {!collapsed && (
        <div className="px-5 py-3 mx-4 my-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 radar-dot' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-[11px] font-semibold text-white/70">
              {isConnected ? 'Real-Time Sync' : 'Reconnecting...'}
            </span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-mono">
            v2.4
          </span>
        </div>
      )}

      {/* ─── Navigation Links ──────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const Icon = item.icon;

          const content = (
            <>
              <Icon
                size={18}
                className={`${isActive ? 'text-violet-400' : 'text-white/40 group-hover:text-white/80'} transition-colors`}
              />

              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        typeof item.badge === 'number'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Active glow indicator line */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-violet-500 to-pink-500" />
              )}
            </>
          );

          const className = `w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 group relative text-left ${
            isActive
              ? 'bg-gradient-to-r from-violet-600/25 to-pink-600/15 text-white border border-violet-500/30 shadow-lg shadow-violet-600/10'
              : 'text-white/60 hover:text-white hover:bg-white/[0.05] hover:border-white/10 border border-transparent'
          } ${collapsed ? 'justify-center px-0' : ''}`;

          if ('action' in item && typeof item.action === 'function') {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.action();
                  onMobileClose();
                }}
                title={collapsed ? item.label : undefined}
                className={className}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      {/* ─── User Profile & Auth Footer ────────────────────────────── */}
      <div className="p-3 border-t border-white/[0.08] mt-auto">
        {isAuthenticated && user ? (
          <div className={`p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] ${collapsed ? 'text-center' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-white/10 flex-shrink-0">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-white truncate">{user.name}</p>
                  </div>
                  <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 uppercase tracking-wide">
                  {user.role === 'admin' ? 'Administrator' : 'VIP Member'}
                </span>
                <button
                  onClick={logout}
                  className="text-white/40 hover:text-rose-400 transition-colors p-1"
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            onClick={onMobileClose}
            className={`btn-luxury-primary w-full py-2.5 text-xs flex items-center justify-center gap-2 ${
              collapsed ? 'px-0' : ''
            }`}
          >
            <LogIn size={14} />
            {!collapsed && <span>Sign In / Demo</span>}
          </Link>
        )}

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden lg:flex items-center justify-end mt-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] text-white/40 hover:text-white text-xs flex items-center justify-center gap-1 transition-all"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : (
              <>
                <ChevronLeft size={14} />
                <span className="text-[11px] font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop Docked Sidebar ───────────────────────────────── */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out border-r border-white/[0.08] bg-[#090a14]/90 backdrop-blur-2xl ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* ─── Mobile Sliding Drawer ────────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[#090a14] border-r border-white/10 shadow-2xl flex flex-col z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
