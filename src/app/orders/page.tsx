'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, Truck, CheckCircle2, Clock, Search, MapPin, 
  CreditCard, ArrowLeft, ExternalLink, RefreshCw, Sparkles, AlertCircle
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { fetchOrders } from '@/lib/api';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      }
    } catch (err) {
      console.warn('Orders fallback in use:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatPrice = (p: number) => `₹${p?.toLocaleString('en-IN')}`;

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.productName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative ambient-glow-wrapper">
        <div className="ambient-glow-orb-2" />
        <div className="ambient-glow-orb-3" />

        {/* ─── Page Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft size={13} /> Back to Catalog
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Package size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  Order Management & Live Tracking
                </h1>
                <p className="text-xs sm:text-sm text-white/50">
                  Track shipments in real time with automated warehouse status
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadOrders}
            className="btn-luxury-secondary text-xs self-start sm:self-auto flex items-center gap-2"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* ─── Search ──────────────────────────────────────────────── */}
        <div className="relative max-w-md mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            className="luxury-input pl-11 text-xs sm:text-sm"
            placeholder="Search by Order ID (e.g. BS1001), Customer, or Item..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ─── Content Grid ─────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 skeleton rounded-2xl shimmer-effect" />
              ))}
            </div>
            <div className="lg:col-span-2 h-96 skeleton rounded-3xl shimmer-effect" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-white/10">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
              <Package size={28} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 font-display">No Orders Found</h2>
            <p className="text-white/50 text-sm mb-6">
              You haven&apos;t placed any orders yet, or no orders match your search.
            </p>
            <Link href="/" className="btn-luxury-primary">
              <Sparkles size={15} /> Start Shopping Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Orders List (Left Column) */}
            <div className="lg:col-span-1 space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-600/20 to-pink-600/15 border-violet-500/50 shadow-lg shadow-violet-500/10'
                        : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-violet-300">
                        #{order.id}
                      </span>
                      <span className="badge-luxury-stock text-[10px]">
                        {order.status || 'Confirmed'}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-white truncate mb-1">
                      {order.productName}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/[0.06]">
                      <span>{order.customerName}</span>
                      <span className="font-bold text-white">{formatPrice(order.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Tracking & Order Details View (Right Column) */}
            {selectedOrder && (
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.12] shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-black text-white">
                        Order #{selectedOrder.id}
                      </span>
                      <span className="badge-luxury-stock text-xs">
                        ● Live Sync Active
                      </span>
                    </div>
                    <p className="text-xs text-white/40">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-white/40">Total Amount</p>
                    <p className="text-2xl font-black text-emerald-400 font-display">
                      {formatPrice(selectedOrder.amount)}
                    </p>
                  </div>
                </div>

                {/* ─── Visual Package Tracking Timeline ──────────────── */}
                <div className="my-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-6">
                    Live Dispatch & Transit Status
                  </h3>

                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-5 left-4 right-4 h-0.5 bg-white/10 hidden sm:block" />
                    <div className="absolute top-5 left-4 w-3/4 h-0.5 bg-gradient-to-r from-emerald-500 to-violet-500 hidden sm:block" />

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
                      {/* Step 1 */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">Order Confirmed</p>
                          <p className="text-[10px] text-white/40">Inventory reserved</p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">Packed & Verified</p>
                          <p className="text-[10px] text-white/40">Warehouse Mumbai</p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 border-2 border-violet-400 text-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/20 radar-dot">
                          <Truck size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-violet-300">In Transit</p>
                          <p className="text-[10px] text-white/40">Express Courier Air</p>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center opacity-40">
                        <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-white/20 text-white/50 flex items-center justify-center">
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">Delivered</p>
                          <p className="text-[10px] text-white/40">Est. Tomorrow</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Order Metadata Info ───────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/[0.08] text-xs">
                  <div className="glass-pill p-4 rounded-2xl">
                    <span className="text-white/40 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <MapPin size={13} className="text-violet-400" /> Shipping Destination
                    </span>
                    <p className="font-bold text-sm text-white mb-0.5">{selectedOrder.customerName}</p>
                    <p className="text-white/70 leading-relaxed">{selectedOrder.address}</p>
                    <p className="text-white/40 mt-1 font-mono">📱 +91 {selectedOrder.customerPhone}</p>
                  </div>

                  <div className="glass-pill p-4 rounded-2xl">
                    <span className="text-white/40 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <CreditCard size={13} className="text-emerald-400" /> Payment & Transaction
                    </span>
                    <p className="font-bold text-sm text-white uppercase mb-0.5">
                      {selectedOrder.paymentMethod || 'UPI Instant'}
                    </p>
                    <p className="text-white/60 font-mono text-[11px] mb-2 truncate">
                      Ref: {selectedOrder.paymentId || 'PAY_DEMO_GATEWAY'}
                    </p>
                    <span className="badge-luxury-stock text-[10px]">
                      Verified Zero-Redirect Payment
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.08]">
                  <Link href="/" className="btn-luxury-primary text-xs py-2.5 px-4">
                    Order Another Product
                  </Link>

                  <button
                    onClick={() => toast.success(`Receipt for #${selectedOrder.id} ready to print`)}
                    className="btn-luxury-secondary text-xs py-2.5 px-4"
                  >
                    Print Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
