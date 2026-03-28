'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { watchlistAPI } from '@/lib/api';
import { Star, Loader2 } from 'lucide-react';

interface WatchlistButtonProps {
  stockId: string;
  symbol: string;
}

export const WatchlistButton = ({ stockId, symbol }: WatchlistButtonProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if stock is in user's watchlist
  useEffect(() => {
    if (!user) return;

    watchlistAPI.get().then((res) => {
      const found = res.data.some((item: any) => item.stockId === stockId);
      setIsInWatchlist(found);
    }).catch(() => {});
  }, [user, stockId]);

  const handleToggle = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistAPI.remove(stockId);
        setIsInWatchlist(false);
      } else {
        await watchlistAPI.add(stockId);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Watchlist toggle failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`w-full font-medium py-3 px-4 rounded-xl transition-all border flex items-center justify-center gap-2 ${
        isInWatchlist
          ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20 hover:bg-yellow-100 dark:hover:bg-yellow-500/20'
          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
      } disabled:opacity-50`}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Star size={16} className={isInWatchlist ? 'fill-current' : ''} />
      )}
      {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
    </button>
  );
};

export default WatchlistButton;
