'use client';

import { useState } from 'react';
import { portfolioAPI } from '@/lib/api';
import { X, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockId: string;
  symbol: string;
  currentPrice: number;
  mode: 'BUY' | 'SELL';
}

export const TradeModal = ({ isOpen, onClose, stockId, symbol, currentPrice, mode }: TradeModalProps) => {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (mode === 'BUY') {
        await portfolioAPI.addHolding({
          stockId,
          quantity: Number(quantity),
          avgPrice: currentPrice,
        });
      } else {
        await portfolioAPI.removeHolding(stockId, {
          quantity: Number(quantity),
          price: currentPrice,
        });
      }
      onClose();
      router.push('/portfolio');
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${mode.toLowerCase()} stock`);
    } finally {
      setIsLoading(false);
    }
  };

  const totalValue = (Number(quantity) || 0) * currentPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl ring-1 ring-gray-200/50 dark:ring-white/10 overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={`p-6 text-white ${mode === 'BUY' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-red-600 to-orange-600'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold">{mode} {symbol}</h2>
              <p className="text-white/80 mt-1 flex items-center gap-1">
                LTP: <span className="font-semibold text-white">₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
                placeholder="0"
                autoFocus
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Order Value</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
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
                disabled={isLoading || !quantity}
                className={`flex-1 px-4 py-3 rounded-xl text-white font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 ${
                  mode === 'BUY' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>
                    Confirm {mode} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
