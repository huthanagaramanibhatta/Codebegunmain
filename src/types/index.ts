// Shared TypeScript types for BioStorefront

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  tags: string[];
  featured: boolean;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  quantity: number;
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: string;
  paymentId: string;
  status: string;
  createdAt: string;
}

export interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  address: string;
  paymentMethod: 'upi' | 'card' | 'wallet';
  upiId?: string;
}

export interface AnalyticsData {
  visitors: number;
  productViews: Record<string, number>;
  productClicks: Record<string, number>;
  checkoutStarted: number;
  completedPurchases: number;
  cartAbandoned: number;
  avgPageLoadMs: number;
  funnelBase: {
    visitors: number;
    productClicks: number;
    checkoutStarted: number;
    purchases: number;
  };
  conversionRate: number;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
}

export interface StoreProfile {
  name: string;
  handle: string;
  description: string;
  avatar: string;
  banner: string;
  followers: string;
  location: string;
  verified: boolean;
}

export interface WSMessage {
  type: 'STOCK_UPDATE' | 'CONNECTED' | 'ORDER_CONFIRMED';
  data: {
    productId?: string;
    stock?: number;
    source?: string;
    productName?: string;
    message?: string;
  };
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'customer';
  joinedDate: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

