'use client';

import { useState, useEffect } from 'react';
import { alertAPI } from '@/lib/api';
import { X, Loader2, BellRing, TrendingUp, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: string;
  symbol: string;
  currentPrice: number;
}

export const AlertModal = ({ isOpen, onClose, stockId, symbol, currentPrice }: AlertModalProps) => {
  const [targetPrice, setTargetPrice] = useState<number | ''>('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Smart condition default based on typed price
  useEffect(() => {
    if (targetPrice) {
      if (Number(targetPrice) > currentPrice) setCondition('ABOVE');
      else if (Number(targetPrice) < currentPrice) setCondition('BELOW');
    }
  }, [targetPrice, currentPrice]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice || targetPrice <= 0) {
      setError('Please enter a valid target price');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await alertAPI.create({
        stockId,
        targetPrice: Number(targetPrice),
        condition,
      });
      onClose();
      setTargetPrice('');
      router.push('/alerts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl ring-1 ring-gray-200/50 dark:ring-white/10 overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BellRing size={24} /> Set Alert
              </h2>
              <p className="text-white/80 mt-1 flex items-center gap-1">
                {symbol} LTP: <span className="font-semibold text-white">₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Price (₹)</label>
              <input
                type="number"
                min="0.05"
                step="0.05"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                placeholder={`e.g. ${(currentPrice * 1.05).toFixed(2)}`}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Condition</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ring-1 ${
                    condition === 'ABOVE'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30'
                      : 'bg-white text-gray-600 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-800'
                  }`}
                >
                  <TrendingUp size={18} /> Goes Above
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ring-1 ${
                    condition === 'BELOW'
                      ? 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30'
                      : 'bg-white text-gray-600 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-gray-800'
                  }`}
                >
                  <TrendingDown size={18} /> Drops Below
                </button>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl">
              <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
                We'll notify you instantly when {symbol} {condition === 'ABOVE' ? 'crosses above' : 'falls below'} 
                {' '}₹{Number(targetPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !targetPrice}
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Alert'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
