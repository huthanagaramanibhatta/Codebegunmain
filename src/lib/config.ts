// API configuration for BioStorefront client
// In the browser, using relative path '' leverages Next.js rewrites to http://localhost:4000
// which eliminates CORS issues, network IP mismatches, and connection drops.

const isBrowser = typeof window !== 'undefined';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '')
  ? process.env.NEXT_PUBLIC_API_URL.trim()
  : (isBrowser ? '' : 'http://localhost:4000');

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL && process.env.NEXT_PUBLIC_WS_URL.trim() !== '')
  ? process.env.NEXT_PUBLIC_WS_URL.trim()
  : (isBrowser ? `ws://${window.location.hostname}:4000` : 'ws://localhost:4000');

export { API_BASE, WS_URL };

