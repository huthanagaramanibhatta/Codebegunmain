// API configuration for BioStorefront client

const API_BASE = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '')
  ? process.env.NEXT_PUBLIC_API_URL.trim()
  : 'https://codebegunbackend-4.onrender.com';

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL && process.env.NEXT_PUBLIC_WS_URL.trim() !== '')
  ? process.env.NEXT_PUBLIC_WS_URL.trim()
  : 'wss://codebegunbackend-4.onrender.com';

export { API_BASE, WS_URL };
