import type { Order, AnalyticsData, Product } from '@/types';
import { PRODUCTS_CATALOG } from './productsCatalog';

export const DEFAULT_ORDERS: Order[] = [
  {
    id: 'BS1001',
    productId: 'prod_002',
    productName: 'Pure Chanderi Silk Saree',
    amount: 1499,
    quantity: 1,
    customerName: 'Ananya Iyer',
    customerPhone: '+91 98765 43210',
    address: 'Flat 402, Lotus Towers, Bandra West, Mumbai - 400050',
    paymentMethod: 'upi',
    paymentId: 'UPI_9823482312',
    status: 'delivered',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'BS1002',
    productId: 'prod_004',
    productName: 'Classic Indigo Denim Jacket',
    amount: 1899,
    quantity: 1,
    customerName: 'Rohan Verma',
    customerPhone: '+91 98112 34567',
    address: 'House 12, Sector 14, Gurugram, Haryana - 122001',
    paymentMethod: 'card',
    paymentId: 'PAY_CARD_5541',
    status: 'shipped',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'BS1003',
    productId: 'prod_001',
    productName: 'Black Embroidered Kurti',
    amount: 699,
    quantity: 1,
    customerName: 'Pooja Hegde',
    customerPhone: '+91 97654 32109',
    address: 'Villa 8, Palm Meadows, Whitefield, Bengaluru - 560066',
    paymentMethod: 'upi',
    paymentId: 'UPI_8712398231',
    status: 'processing',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'BS1004',
    productId: 'prod_003',
    productName: 'Oversized Cotton Graphic Tee',
    amount: 549,
    quantity: 1,
    customerName: 'Siddharth Rao',
    customerPhone: '+91 99887 76655',
    address: '301, Silver Sands, Juhu Beach Road, Mumbai - 400049',
    paymentMethod: 'wallet',
    paymentId: 'WAL_6623910',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'BS1005',
    productId: 'prod_005',
    productName: 'Slim Fit Linen Casual Shirt',
    amount: 899,
    quantity: 1,
    customerName: 'Vikram Malhotra',
    customerPhone: '+91 98450 12345',
    address: 'Flat 10B, Emerald Heights, Jubilee Hills, Hyderabad - 500033',
    paymentMethod: 'upi',
    paymentId: 'UPI_4455667788',
    status: 'delivered',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export const DEFAULT_ANALYTICS: AnalyticsData = {
  visitors: 1428,
  productViews: {
    'prod_001': 342,
    'prod_002': 298,
    'prod_004': 256,
    'prod_003': 189,
    'prod_005': 143,
  },
  productClicks: {
    'prod_001': 198,
    'prod_002': 176,
    'prod_004': 142,
    'prod_003': 110,
    'prod_005': 88,
  },
  checkoutStarted: 560,
  completedPurchases: 412,
  cartAbandoned: 148,
  avgPageLoadMs: 245,
  funnelBase: {
    visitors: 1428,
    productClicks: 842,
    checkoutStarted: 560,
    purchases: 412,
  },
  conversionRate: 28.8,
  totalRevenue: 482650,
  totalOrders: 412,
  totalProducts: 131,
};

export function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return DEFAULT_ORDERS;
  try {
    const raw = localStorage.getItem('bio_orders');
    if (raw) {
      const parsed: Order[] = JSON.parse(raw);
      // Combine stored custom orders with defaults
      const combined = [...parsed, ...DEFAULT_ORDERS.filter(d => !parsed.some(p => p.id === d.id))];
      return combined;
    }
  } catch {}
  return DEFAULT_ORDERS;
}

export function saveStoredOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredOrders();
    const updated = [order, ...current.filter(o => o.id !== order.id)];
    localStorage.setItem('bio_orders', JSON.stringify(updated));
  } catch {}
}
