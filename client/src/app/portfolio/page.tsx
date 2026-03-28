'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { portfolioAPI } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { TradeModal } from '@/components/TradeModal';
import { Loader2, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { socket } = useSocket();
  
  const [data, setData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Real-time prices
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  // Modal state
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [tradeTarget, setTradeTarget] = useState<{ stockId: string; symbol: string; currentPrice: number } | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    try {
      const [portRes, transRes] = await Promise.all([
        portfolioAPI.get(),
        portfolioAPI.getTransactions()
      ]);
      setData(portRes.data);
      setTransactions(transRes.data);
      
      // Initialize prices from static db data
      const initialPrices: Record<string, number> = {};
      portRes.data.holdings.forEach((h: any) => {
        initialPrices[h.stock.symbol] = h.stock.currentPrice;
      });
      setPrices(initialPrices);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Handle modal closing and refetching
  const handleTradeClose = () => {
    setIsTradeOpen(false);
    setTradeTarget(null);
    fetchData(); // Refresh data after trade
  };

  const handleSellClick = (stockId: string, symbol: string) => {
    setTradeTarget({
      stockId,
      symbol,
      currentPrice: prices[symbol] || 0,
    });
    setIsTradeOpen(true);
  };

  // Subscribe to real-time updates for holdings
  useEffect(() => {
    if (!socket || !data?.holdings || data.holdings.length === 0) return;

    data.holdings.forEach((h: any) => {
      socket.emit('subscribe:stock', h.stock.symbol);
    });

    const handlePriceUpdate = (update: { symbol: string; price: number }) => {
      setPrices((prev) => ({
        ...prev,
        [update.symbol]: update.price,
      }));
    };

    socket.on('stock_price_update', handlePriceUpdate);

    return () => {
      socket.off('stock_price_update', handlePriceUpdate);
      data.holdings.forEach((h: any) => {
        socket.emit('unsubscribe:stock', h.stock.symbol);
      });
    };
  }, [socket, data?.holdings]);

  // Compute live portfolio metrics
  const liveInvested = data?.holdings.reduce((sum: number, h: any) => sum + (h.avgPrice * h.quantity), 0) || 0;
  const liveCurrentValue = data?.holdings.reduce((sum: number, h: any) => {
    const p = prices[h.stock.symbol] || h.stock.currentPrice;
    return sum + (p * h.quantity);
  }, 0) || 0;
  
  const livePL = liveCurrentValue - liveInvested;
  const livePLPercent = liveInvested > 0 ? (livePL / liveInvested) * 100 : 0;
  const isProfit = livePL >= 0;

  if (authLoading || (!user && !authLoading)) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <PieChart className="text-indigo-500" size={32} />
            My Portfolio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your simulated investments and live market performance
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 ring-1 ring-gray-200/50 dark:ring-white/10 shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Invested</p>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{liveInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 ring-1 ring-gray-200/50 dark:ring-white/10 shadow-sm">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Current Value</p>
                <div className={`text-3xl font-bold ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                  ₹{liveCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className={`rounded-3xl p-6 shadow-sm relative overflow-hidden ${isProfit ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-pink-600'}`}>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 blur-2xl rounded-full pointer-events-none" />
                <p className="text-white/80 text-sm font-medium mb-1">Total Returns</p>
                <div className="flex items-end gap-3 text-white">
                  <span className="text-3xl font-bold">
                    {isProfit ? '+' : ''}₹{livePL.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="flex items-center gap-1 text-lg font-semibold bg-white/20 px-2 py-0.5 rounded-lg mb-1">
                    {isProfit ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    {Math.abs(livePLPercent).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl ring-1 ring-gray-200/50 dark:ring-white/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" />
                  Your Holdings
                </h2>
              </div>
              
              {data.holdings.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <p className="mb-4">You don't have any stocks in your portfolio yet.</p>
                  <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    Explore Stocks
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm">Stock</th>
                        <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">Qty</th>
                        <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">Avg. Price</th>
                        <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">LTP</th>
                        <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">Current Value</th>
                        <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">P&L</th>
                        <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {data.holdings.map((h: any) => {
                        const ltp = prices[h.stock.symbol] || h.stock.currentPrice;
                        const currVal = ltp * h.quantity;
                        const invVal = h.avgPrice * h.quantity;
                        const pl = currVal - invVal;
                        const plPercent = (pl / invVal) * 100;
                        const isUp = pl >= 0;

                        return (
                          <tr key={h.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                            <td className="py-4 px-6">
                              <Link href={`/stock/${h.stock.symbol}`} className="block">
                                <span className="font-bold text-gray-900 dark:text-white hover:text-blue-600 block">{h.stock.symbol}</span>
                                <span className="text-xs text-gray-500 truncate max-w-[120px] block">{h.stock.name}</span>
                              </Link>
                            </td>
                            <td className="py-4 px-6 text-right font-medium text-gray-900 dark:text-gray-300">{h.quantity}</td>
                            <td className="py-4 px-6 text-right font-medium text-gray-500 dark:text-gray-400">₹{h.avgPrice.toFixed(2)}</td>
                            <td className="py-4 px-6 text-right font-medium text-gray-900 dark:text-white">₹{ltp.toFixed(2)}</td>
                            <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white">₹{currVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="py-4 px-6 text-right">
                              <div className={`flex flex-col items-end ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                <span className="font-bold">{isUp ? '+' : ''}₹{pl.toFixed(2)}</span>
                                <span className="text-xs flex items-center gap-0.5 mt-0.5 bg-current/10 px-1.5 py-0.5 rounded">
                                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  {Math.abs(plPercent).toFixed(2)}%
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleSellClick(h.stockId, h.stock.symbol)}
                                className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-medium rounded-lg text-sm transition-colors"
                              >
                                Sell
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Transactions */}
            {transactions.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl ring-1 ring-gray-200/50 dark:ring-white/10 shadow-sm p-6 overflow-hidden">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                  {transactions.slice(0, 10).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.type === 'BUY' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'}`}>
                          {t.type}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{t.stock.symbol}</p>
                          <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {t.quantity} @ ₹{t.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">Total: ₹{t.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {tradeTarget && (
        <TradeModal
          isOpen={isTradeOpen}
          onClose={handleTradeClose}
          stockId={tradeTarget.stockId}
          symbol={tradeTarget.symbol}
          currentPrice={tradeTarget.currentPrice}
          mode="SELL"
        />
      )}
    </main>
  );
}
