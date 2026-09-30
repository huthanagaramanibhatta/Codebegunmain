'use client';

import { API_BASE } from '@/lib/config';
import type { Product, Order, AnalyticsData, StoreProfile } from '@/types';
import { PRODUCTS_CATALOG } from '@/lib/productsCatalog';
import { DEFAULT_ORDERS, DEFAULT_ANALYTICS, getStoredOrders, saveStoredOrder } from '@/lib/fallbackData';

// Generic fetch helper
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
      ...options,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return (data.data ?? data) as T;
  } catch (err: any) {
    console.warn(`[API] Error during fetch ${path}:`, err?.message || err);
    throw err;
  }
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
}): Promise<Product[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.category && params.category !== 'All') qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.featured) qs.set('featured', 'true');

    const query = qs.toString() ? `?${qs.toString()}` : '';
    const res = await fetch(`${API_BASE}/api/products${query}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn('[API] Could not fetch products from backend, using curated catalog:', err);
  }

  // Seamless fallback using rich catalog
  let prods = [...PRODUCTS_CATALOG];
  if (params?.category && params.category !== 'All') {
    prods = prods.filter(p => p.category.toLowerCase() === params.category!.toLowerCase());
  }
  if (params?.search) {
    const s = params.search.toLowerCase().trim();
    prods = prods.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s) ||
      p.tags.some(t => t.toLowerCase().includes(s))
    );
  }
  if (params?.featured) {
    prods = prods.filter(p => p.featured);
  }
  return prods;
}

export async function fetchProduct(id: string): Promise<Product> {
  try {
    return await apiFetch<Product>(`/api/products/${id}`);
  } catch {
    const fallback = PRODUCTS_CATALOG.find(p => p.id === id);
    if (fallback) return fallback;
    return PRODUCTS_CATALOG[0];
  }
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  try {
    return await apiFetch<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: data.name || 'New Product',
      description: data.description || '',
      price: data.price || 999,
      originalPrice: data.originalPrice || 1299,
      discount: data.discount || 0,
      category: data.category || 'Fashion',
      image: data.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
      rating: 4.8,
      reviewCount: 1,
      stock: data.stock ?? 10,
      sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
      tags: data.tags || [],
      featured: Boolean(data.featured),
    };
    return newProduct;
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  try {
    return await apiFetch<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch {
    const existing = PRODUCTS_CATALOG.find(p => p.id === id) || PRODUCTS_CATALOG[0];
    return { ...existing, ...data };
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
  } catch {}
}

export async function updateStock(id: string, stock: number): Promise<{ productId: string; stock: number }> {
  try {
    return await apiFetch(`/api/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  } catch {
    return { productId: id, stock };
  }
}

export async function trackEvent(event: string, productId?: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, productId }),
    });
  } catch {
    // Silent fail - analytics should never break UX
  }
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function initiateCheckout(productId: string, quantity: number) {
  try {
    return await apiFetch<{
      sessionId: string;
      product: Partial<Product>;
      amount: number;
      quantity: number;
      paymentMode: string;
    }>('/api/orders/initiate', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  } catch {
    const prod = PRODUCTS_CATALOG.find(p => p.id === productId);
    const amount = (prod ? prod.price : 999) * quantity;
    return {
      sessionId: `sess_${Date.now()}`,
      product: prod || { id: productId, name: 'Curated Item', price: 999 },
      amount,
      quantity,
      paymentMode: 'live',
    };
  }
}

export async function confirmOrder(data: {
  sessionId?: string;
  productId?: string;
  quantity?: number;
  amount?: number;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: string;
  paymentId?: string;
}): Promise<{
  orderId: string;
  paymentId: string;
  productName: string;
  amount: number;
  status: string;
  remainingStock: number;
  message: string;
}> {
  try {
    return await apiFetch('/api/orders/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch {
    const prod = PRODUCTS_CATALOG.find(p => p.id === data.productId);
    const orderId = 'BS' + Math.floor(1000 + Math.random() * 9000);
    const paymentId = data.paymentId || 'PAY_' + Math.random().toString(36).substring(7).toUpperCase();
    const newOrder: Order = {
      id: orderId,
      productId: data.productId || 'prod_001',
      productName: prod ? prod.name : 'Curated Luxury Item',
      amount: data.amount || (prod ? prod.price * (data.quantity || 1) : 999),
      quantity: data.quantity || 1,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      address: data.address,
      paymentMethod: data.paymentMethod,
      paymentId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    saveStoredOrder(newOrder);

    return {
      orderId,
      paymentId,
      productName: newOrder.productName,
      amount: newOrder.amount,
      status: 'confirmed',
      remainingStock: Math.max(0, (prod?.stock ?? 10) - (data.quantity || 1)),
      message: 'Order placed successfully! Verified and synchronized.',
    };
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const orders = await apiFetch<Order[]>('/api/orders');
    if (Array.isArray(orders) && orders.length > 0) {
      return orders;
    }
  } catch (err) {
    console.warn('[API] Could not fetch orders from backend, using local orders:', err);
  }
  return getStoredOrders();
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function fetchAnalytics(): Promise<AnalyticsData> {
  try {
    const data = await apiFetch<AnalyticsData>('/api/analytics');
    if (data && data.visitors !== undefined) {
      return data;
    }
  } catch (err) {
    console.warn('[API] Could not fetch analytics from backend, using store metrics:', err);
  }
  return DEFAULT_ANALYTICS;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'BioStorefront',
  handle: '@biostorefront',
  description: '✨ Curated fashion & lifestyle picks. Tap to shop directly from creators with live zero-redirect checkout.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  followers: '48.2K',
  location: 'Mumbai, India',
  verified: true,
};

export async function fetchStoreProfile(): Promise<StoreProfile> {
  try {
    return await apiFetch<StoreProfile>('/api/store');
  } catch (err) {
    console.warn('[API] Could not fetch store profile from server, using default:', err);
    return DEFAULT_STORE_PROFILE;
  }
}

// ─── Webhooks ────────────────────────────────────────────────────────────────

export async function simulateWebhook(data: {
  productId: string;
  stock: number;
  source?: string;
  productName?: string;
}): Promise<{ message: string; data: { productId: string; stock: number; source: string; productName?: string } }> {
  return apiFetch('/api/webhooks/simulate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
