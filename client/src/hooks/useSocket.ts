'use client';

import { useState, useEffect, useCallback } from 'react';
import socketClient from '@/lib/socket';

/**
 * Custom hook for WebSocket connection management
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketClient.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      // Don't disconnect — singleton pattern keeps it alive
    };
  }, []);

  const subscribeToStock = useCallback((symbol: string) => {
    socketClient.subscribeToStock(symbol);
  }, []);

  const unsubscribeFromStock = useCallback((symbol: string) => {
    socketClient.unsubscribeFromStock(symbol);
  }, []);

  return {
    isConnected,
    socket: socketClient.getSocket(),
    subscribeToStock,
    unsubscribeFromStock,
  };
};

export default useSocket;
