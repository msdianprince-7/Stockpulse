'use client';

import { useState, useEffect } from 'react';
import { newsAPI } from '@/lib/api';
import { NewsCard } from './NewsCard';
import { Loader2, Newspaper } from 'lucide-react';

interface NewsListProps {
  symbol: string;
}

export const NewsList = ({ symbol }: NewsListProps) => {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    const fetchNews = async () => {
      try {
        const { data } = await newsAPI.getStockNews(symbol);
        setNews(data);
      } catch (err) {
        console.error('Failed to fetch stock news:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [symbol]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-3xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
        <Newspaper size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">No recent news for {symbol}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Newspaper size={20} className="text-pink-500" /> Latest News
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.slice(0, 6).map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default NewsList;
