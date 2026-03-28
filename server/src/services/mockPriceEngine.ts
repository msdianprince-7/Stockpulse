import { prisma } from '../config/database';
import { redisSub, CHANNELS } from '../config/redis';
import { Server } from 'socket.io';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

let ioInstance: Server | null = null;
let priceEngineInterval: NodeJS.Timeout | null = null;
let activeSymbols: Set<string> = new Set();
// Cache old prices to only broadcast when a change happens
let lastPrices: Record<string, number> = {};

/**
 * Attaches the Socket.IO instance to broadcast real NSE prices
 */
export const startMockPriceEngine = (io: Server) => {
  if (ioInstance) return; // Already started
  ioInstance = io;

  console.log('🚀 Starting LIVE Price Engine (yahoo-finance2)...');

  // Poll Yahoo Finance every 10 seconds to avoid strict rate limits
  priceEngineInterval = setInterval(updatePrices, 10000);

  loadTopSymbols();
};

export const stopMockPriceEngine = () => {
  if (priceEngineInterval) {
    clearInterval(priceEngineInterval);
    priceEngineInterval = null;
  }
  ioInstance = null;
};

const loadTopSymbols = async () => {
  try {
    const topStocks = await prisma.stock.findMany({
      take: 20,
      orderBy: { symbol: 'asc' }, // just grab a few popular ones to prepopulate
      select: { symbol: true },
    });
    
    topStocks.forEach((s: { symbol: string }) => activeSymbols.add(s.symbol));
  } catch (error) {
    console.error('Failed to load top symbols for live engine:', error);
  }
};

/**
 * Registers a symbol that a client just subscribed to
 */
export const registerActiveSymbol = (symbol: string) => {
  activeSymbols.add(symbol.toUpperCase());
};

const updatePrices = async () => {
  if (!ioInstance || activeSymbols.size === 0) return;

  try {
    // Determine which symbols actually have users in their WebSocket rooms
    const symbolsToUpdate = Array.from(activeSymbols).filter((symbol) => {
      const room = ioInstance?.sockets.adapter.rooms.get(`stock:${symbol}`);
      return room && room.size > 0; // Only fetch data if someone is watching
    });

    if (symbolsToUpdate.length === 0) return; // Save API calls if no one is watching

    console.log(`Polling real prices for ${symbolsToUpdate.length} active stocks...`);

    // Fetch batch quotes from Yahoo Finance
    const querySymbols = symbolsToUpdate.map(sym => `${sym}.NS`);
    
    // Yahoo Finance can batch request multiple symbols!
    const quotes: any[] = await yahooFinance.quote(querySymbols);

    for (const quote of quotes) {
      if (!quote || !quote.symbol) continue;

      // Extract raw symbol without .NS
      const symbol = quote.symbol.replace('.NS', '');
      const newPrice = quote.regularMarketPrice;
      const changeAmount = quote.regularMarketChange || 0;
      const changePercent = quote.regularMarketChangePercent || 0;

      if (newPrice && newPrice !== lastPrices[symbol]) {
        lastPrices[symbol] = newPrice;

        // Update database with latest price
        await prisma.stock.updateMany({
          where: { symbol },
          data: { currentPrice: newPrice },
        });

        const updateEvent = {
          symbol,
          price: newPrice,
          change: parseFloat(changeAmount.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          timestamp: new Date().toISOString()
        };

        // Broadcast directly to the Socket.IO room
        ioInstance!.to(`stock:${symbol}`).emit('stock_price_update', updateEvent);
        
        // Also publish to Redis for multi-server scaling
        redisSub.publish(CHANNELS.STOCK_PRICE_UPDATE, JSON.stringify(updateEvent));

        // Check for triggered alerts
        try {
          const triggeredAlerts = await prisma.alert.findMany({
            where: {
              isActive: true,
              stock: { symbol },
              OR: [
                { condition: 'ABOVE', targetPrice: { lte: newPrice } },
                { condition: 'BELOW', targetPrice: { gte: newPrice } }
              ]
            },
            include: { stock: true }
          });

          for (const alert of triggeredAlerts) {
            await prisma.alert.update({
              where: { id: alert.id },
              data: { isActive: false, triggeredAt: new Date() }
            });
            ioInstance!.to(`user:${alert.userId}`).emit('price_alert_triggered', { alert, stock: alert.stock });
          }
        } catch (alertErr) {
          console.error(`Error processing alerts for ${symbol}:`, alertErr);
        }
      }
    }
  } catch (error) {
    console.error('Live price engine error:', error);
  }
};
