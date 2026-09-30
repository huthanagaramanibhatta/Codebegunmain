'use client';

import { WS_URL } from '@/lib/config';
import type { WSMessage } from '@/types';
import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

interface WebSocketContextValue {
  lastMessage: WSMessage | null;
  isConnected: boolean;
  stockUpdates: Record<string, number>; // productId -> latest stock
}

const WebSocketContext = createContext<WebSocketContextValue>({
  lastMessage: null,
  isConnected: false,
  stockUpdates: {},
});

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelay = useRef<number>(3000);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Prevent duplicate connections if already open or connecting
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        retryDelay.current = 3000; // Reset retry interval on success
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          setLastMessage(msg);

          if (msg.type === 'STOCK_UPDATE' && msg.data.productId !== undefined && msg.data.stock !== undefined) {
            setStockUpdates(prev => ({
              ...prev,
              [msg.data.productId!]: msg.data.stock!,
            }));
          }
        } catch {
          // Ignore parse errors on malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        // Exponential backoff reconnect without spamming console
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, retryDelay.current);

        // Increase delay up to max 12 seconds
        retryDelay.current = Math.min(retryDelay.current * 1.5, 12000);
      };

      ws.onerror = () => {
        // Silent handler: ws.onclose handles scheduling the reconnect
      };
    } catch {
      // Ignore initial connection errors; onclose will schedule reconnect
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ lastMessage, isConnected, stockUpdates }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
