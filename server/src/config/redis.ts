import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null; // Stop retrying after 3 attempts
    return Math.min(times * 500, 3000);
  },
});

export const redisSub = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 500, 3000);
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

redisSub.on('error', (err) => {
  console.error('❌ Redis sub error:', err.message);
});

// Safe publish helper — never throws
export async function safePublish(channel: string, message: string) {
  try {
    await redisSub.publish(channel, message);
  } catch {
    // Silently ignore Redis publish failures
  }
}

// Pub/Sub channels
export const CHANNELS = {
  STOCK_PRICE_UPDATE: 'stock:price:update',
  WATCHLIST_UPDATE: 'watchlist:update',
  ALERT_TRIGGERED: 'alert:triggered',
  MARKET_STATUS_CHANGE: 'market:status:change',
} as const;

export default redis;
