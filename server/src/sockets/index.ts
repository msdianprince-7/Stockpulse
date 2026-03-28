import { Server } from 'socket.io';
import http from 'http';
import { startMockPriceEngine, registerActiveSymbol } from '../services/mockPriceEngine';

export const initializeSocket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join stock-specific rooms
    socket.on('subscribe:stock', (symbol: string) => {
      socket.join(`stock:${symbol}`);
      registerActiveSymbol(symbol);
      console.log(`📈 ${socket.id} subscribed to stock:${symbol}`);
    });

    // Leave stock-specific rooms
    socket.on('unsubscribe:stock', (symbol: string) => {
      socket.leave(`stock:${symbol}`);
      console.log(`📉 ${socket.id} unsubscribed from stock:${symbol}`);
    });

    // Join user-specific room for alerts & watchlist updates
    socket.on('subscribe:user', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`👤 ${socket.id} subscribed to user:${userId}`);
    });

    // Market status room
    socket.on('subscribe:market', () => {
      socket.join('market');
      console.log(`🏪 ${socket.id} subscribed to market updates`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} - ${reason}`);
    });
  });

  // Start the engine
  startMockPriceEngine(io);

  return io;
};
