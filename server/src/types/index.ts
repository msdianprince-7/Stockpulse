// Types for StockPulse Server

export interface StockQuote {
  c: number;   // Current price
  d: number;   // Change
  dp: number;  // Percent change
  h: number;   // High price of the day
  l: number;   // Low price of the day
  o: number;   // Open price of the day
  pc: number;  // Previous close price
  t: number;   // Timestamp
}

export interface StockCandle {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  v: number[];  // Volume
  t: number[];  // Timestamps
  s: string;    // Status
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface MarketNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface WebSocketEvents {
  'stock_price_update': { symbol: string; price: number; change: number; changePercent: number };
  'watchlist_update': { userId: string; stockId: string; action: 'add' | 'remove' };
  'alert_triggered': { alertId: string; userId: string; symbol: string; targetPrice: number; currentPrice: number };
  'market_status_change': { status: 'open' | 'closed' | 'pre-market'; message: string };
}
