import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'react-hot-toast';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'BioStorefront — Shop Curated Luxury & Essentials',
  description: 'Ultra-fast link-in-bio storefront. Shop exclusive curated products with instant zero-redirect checkout and real-time live stock sync.',
  keywords: ['link in bio', 'storefront', 'shopping', 'luxury ecommerce', 'instagram shop'],
  openGraph: {
    title: 'BioStorefront',
    description: 'Shop curated collections instantly with real-time inventory.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#090a14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans antialiased selection:bg-violet-500/30 selection:text-white">
        <WebSocketProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <CartDrawer />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'hsl(222 47% 9%)',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </WebSocketProvider>
      </body>
    </html>
  );
}
