'use client';

import { useWebSocket } from '@/context/WebSocketContext';

export default function ConnectionStatus() {
  const { isConnected } = useWebSocket();

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-all ${
        isConnected 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
      }`}
      title={isConnected ? 'Connected to real-time inventory sync' : 'Connecting to real-time server...'}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 radar-dot' : 'bg-amber-400 animate-pulse'}`} />
      <span>{isConnected ? 'Real-Time Sync Active' : 'Connecting...'}</span>
    </div>
  );
}
