'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { StockHeader, StockChart } from '@/components';
import { WatchlistButton } from '@/components/WatchlistButton';
import { stockAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';

import { TradeModal } from '@/components/TradeModal';
import { AlertModal } from '@/components/AlertModal';
import { NewsList } from '@/components/NewsList';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function StockPage() {
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase();
  const [stock, setStock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!symbol) return;

    stockAPI.getBySymbol(symbol)
      .then((res) => setStock(res.data))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [symbol]);

  const handleTradeClick = () => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setIsTradeOpen(true);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </main>
    );
  }

  if (error || !stock) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Stock not found</h1>
          <p className="text-gray-500 dark:text-gray-400">We couldn&apos;t find data for &quot;{symbol}&quot;.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <StockHeader initialStock={stock} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StockChart symbol={stock.symbol} initialPrice={stock.currentPrice} />

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About {stock.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {stock.name} is a leading company in the {stock.sector} sector, listed on the {stock.exchange}.
              </p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{(stock.marketCap / 10000000).toFixed(2)} Cr
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sector</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{stock.sector || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Exchange</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{stock.exchange}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <NewsList symbol={stock.symbol} />
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 blur-2xl rounded-full pointer-events-none" />
              <h3 className="text-xl font-bold mb-2">Trade & Track</h3>
              <p className="text-blue-100 mb-6 text-sm">Add {stock.symbol} to your watchlist or buy it for your portfolio to track live profits.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleTradeClick}
                  className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Buy Stock
                </button>
                <WatchlistButton stockId={stock.id} symbol={stock.symbol} />
                <button 
                  onClick={() => user ? setIsAlertOpen(true) : router.push('/auth')}
                  className="w-full mt-2 bg-white/10 border border-white/20 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/20 transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  🔔 Set Price Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TradeModal
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        stockId={stock.id}
        symbol={stock.symbol}
        currentPrice={stock.currentPrice}
        mode="BUY"
      />

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        stockId={stock.id}
        symbol={stock.symbol}
        currentPrice={stock.currentPrice}
      />
    </main>
  );
}
