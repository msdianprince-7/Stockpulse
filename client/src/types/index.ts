// StockPulse Frontend Types

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string | null;
  industry: string | null;
  marketCap: number | null;
  currentPrice: number;
  dayHigh: number | null;
  dayLow: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  volume: number | null;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  stockId: string;
  addedAt: string;
  stock: Stock;
}

export interface PortfolioHolding {
  id: string;
  userId: string;
  stockId: string;
  quantity: number;
  avgPrice: number;
  createdAt: string;
  updatedAt: string;
  stock: Stock;
  currentValue: number;
  investedValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrent: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

export interface Portfolio {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
}

export interface Transaction {
  id: string;
  userId: string;
  stockId: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  stock: Stock;
}

export interface Alert {
  id: string;
  userId: string;
  stockId: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
  stock: Stock;
}

export interface NewsItem {
  id: string;
  stockId: string | null;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  source: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  publishedAt: string;
  stock: Stock | null;
}

export interface MarketStatus {
  status: 'open' | 'closed' | 'pre-market';
  message: string;
  exchange: string;
  currentTime: string;
  tradingHours: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
