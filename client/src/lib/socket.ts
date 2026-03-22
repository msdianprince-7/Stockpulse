import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

class SocketClient {
  private socket: Socket | null = null;
  private static instance: SocketClient;

  static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 WebSocket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  subscribeToStock(symbol: string): void {
    this.socket?.emit('subscribe:stock', symbol);
  }

  unsubscribeFromStock(symbol: string): void {
    this.socket?.emit('unsubscribe:stock', symbol);
  }

  subscribeToUser(userId: string): void {
    this.socket?.emit('subscribe:user', userId);
  }

  subscribeToMarket(): void {
    this.socket?.emit('subscribe:market');
  }
}

export const socketClient = SocketClient.getInstance();
export default socketClient;
