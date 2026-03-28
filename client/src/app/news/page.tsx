'use client';

import { useState, useEffect } from 'react';
import { newsAPI } from '@/lib/api';
import { NewsCard } from '@/components/NewsCard';
import { Loader2, Newspaper, TrendingUp } from 'lucide-react';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await newsAPI.getMarketNews();
        setNews(data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Header */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Newspaper size={160} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={28} className="text-white/80" />
            <h1 className="text-3xl font-bold">Market News</h1>
          </div>
          <p className="text-pink-100 max-w-xl">
            Stay ahead of the curve with the latest financial headlines, market movements, and company announcements from across the Indian stock market.
          </p>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
            <Newspaper size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No news available</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back later for the latest market headlines.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
