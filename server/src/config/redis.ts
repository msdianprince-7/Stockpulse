import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});


export const redisSub = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

// Pub/Sub channels
export const CHANNELS = {
  STOCK_PRICE_UPDATE: 'stock:price:update',
  WATCHLIST_UPDATE: 'watchlist:update',
  ALERT_TRIGGERED: 'alert:triggered',
  MARKET_STATUS_CHANGE: 'market:status:change',
} as const;

export default redis;
