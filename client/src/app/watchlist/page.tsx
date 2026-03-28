'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { watchlistAPI, stockAPI } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { Star, TrendingUp, TrendingDown, Trash2, Loader2, Search } from 'lucide-react';
import Link from 'next/link';

interface WatchlistItem {
  id: string;
  stockId: string;
  stock: {
    id: string;
    symbol: string;
    name: string;
    currentPrice: number;
    sector?: string;
    exchange: string;
  };
}

export default function WatchlistPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { socket } = useSocket();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Fetch watchlist
  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await watchlistAPI.get();
      setWatchlist(res.data);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchWatchlist();
  }, [user, fetchWatchlist]);

  // Subscribe to real-time price updates for all watchlist stocks
  useEffect(() => {
    if (!socket || watchlist.length === 0) return;

    watchlist.forEach((item) => {
      socket.emit('subscribe:stock', item.stock.symbol);
    });

    const handlePriceUpdate = (data: { symbol: string; price: number; change: number }) => {
      setPrices((prev) => ({
        ...prev,
        [data.symbol]: { price: data.price, change: data.change },
      }));
    };

    socket.on('stock_price_update', handlePriceUpdate);

    return () => {
      socket.off('stock_price_update', handlePriceUpdate);
      watchlist.forEach((item) => {
        socket.emit('unsubscribe:stock', item.stock.symbol);
      });
    };
  }, [socket, watchlist]);

  const handleRemove = async (stockId: string) => {
    try {
      await watchlistAPI.remove(stockId);
      setWatchlist((prev) => prev.filter((item) => item.stockId !== stockId));
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
              <Star className="text-yellow-500" size={28} />
              My Watchlist
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
          >
            <Search size={16} />
            Discover Stocks
          </Link>
        </div>

        {/* Watchlist Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl ring-1 ring-gray-200/50 dark:ring-white/10">
            <Star className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your watchlist is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Search for any Indian stock and add it to your watchlist to track real-time prices.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Search size={18} />
              Find Stocks
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((item) => {
              const livePrice = prices[item.stock.symbol]?.price || item.stock.currentPrice;
              const change = prices[item.stock.symbol]?.change || 0;
              const isUp = change >= 0;

              return (
                <Link
                  href={`/stock/${item.stock.symbol}`}
                  key={item.id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl p-5 ring-1 ring-gray-200/50 dark:ring-white/10 hover:ring-blue-400/50 dark:hover:ring-blue-500/30 transition-all hover:shadow-lg cursor-pointer relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.stock.symbol}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                        {item.stock.name}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(item.stockId);
                      }}
                      className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                      title="Remove from watchlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{livePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${
                        isUp
                          ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10'
                          : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
                      }`}
                    >
                      {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {isUp ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </div>

                  {item.stock.sector && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{item.stock.exchange} · {item.stock.sector}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
