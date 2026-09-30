'use client';

import { API_BASE } from '@/lib/config';
import type { Product, Order, AnalyticsData, StoreProfile } from '@/types';

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
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('[API] Could not fetch products:', err);
    return [];
  }
}

export async function fetchProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return apiFetch<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
}

export async function updateStock(id: string, stock: number): Promise<{ productId: string; stock: number }> {
  return apiFetch(`/api/products/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  });
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
  return apiFetch<{
    sessionId: string;
    product: Partial<Product>;
    amount: number;
    quantity: number;
    paymentMode: string;
  }>('/api/orders/initiate', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
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
  return apiFetch('/api/orders/confirm', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/api/orders');
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function fetchAnalytics(): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>('/api/analytics');
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
