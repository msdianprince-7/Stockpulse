'use client';

import { ExternalLink, Clock } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  relatedTickers?: string[];
}

export const NewsCard = ({ article }: { article: NewsArticle }) => {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white dark:bg-gray-900 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden hover:shadow-lg hover:ring-indigo-200 dark:hover:ring-indigo-500/30 transition-all duration-300"
    >
      {/* Thumbnail */}
      {article.imageUrl && (
        <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full">
            {article.source}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Clock size={12} /> {timeAgo(article.publishedAt)}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {article.title}
        </h3>

        <div className="mt-4 flex items-center justify-between">
          {article.relatedTickers && article.relatedTickers.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {article.relatedTickers.slice(0, 3).map((ticker) => (
                <span
                  key={ticker}
                  className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md"
                >
                  {ticker}
                </span>
              ))}
            </div>
          )}
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1 ml-auto group-hover:text-indigo-500 transition-colors">
            Read <ExternalLink size={12} />
          </span>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
