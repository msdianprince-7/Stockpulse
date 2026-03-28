'use client';

import { useState, useEffect } from 'react';
import { alertAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Bell, BellOff, Trash2, ArrowRight, Loader2, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    fetchAlerts();
  }, [user, router]);

  const fetchAlerts = async () => {
    try {
      const { data } = await alertAPI.get();
      setAlerts(data);
    } catch (err) {
      setError('Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlert = async (id: string) => {
    try {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
      await alertAPI.toggle(id);
    } catch (err) {
      // Revert on error
      fetchAlerts();
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      setAlerts(prev => prev.filter(a => a.id !== id));
      await alertAPI.delete(id);
    } catch (err) {
      // Revert on error
      fetchAlerts();
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </main>
    );
  }

  const activeAlerts = alerts.filter(a => a.isActive && !a.triggeredAt);
  const triggeredAlerts = alerts.filter(a => a.triggeredAt);
  const inactiveAlerts = alerts.filter(a => !a.isActive && !a.triggeredAt);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Bell size={160} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Price Alerts</h1>
          <p className="text-indigo-100 max-w-xl">
            Never miss a trading opportunity. Set target prices for your favorite stocks and we'll instantly notify you when they hit your targets.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 font-medium">{error}</div>
        )}

        {alerts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
            <div className="inline-flex w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full items-center justify-center mb-4 text-indigo-500">
              <BellOff size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active alerts</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              You haven't set up any automated price alerts yet. Go to any stock page to create your first alert.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Explore Stocks <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Monitoring Active Alerts ({activeAlerts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} onToggle={() => toggleAlert(alert.id)} onDelete={() => deleteAlert(alert.id)} />
                  ))}
                </div>
              </section>
            )}

            {/* Triggered Alerts */}
            {triggeredAlerts.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Recently Triggered ({triggeredAlerts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {triggeredAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} onToggle={undefined} onDelete={() => deleteAlert(alert.id)} isTriggered />
                  ))}
                </div>
              </section>
            )}

            {/* Inactive Alerts */}
            {inactiveAlerts.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  Paused Alerts ({inactiveAlerts.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} onToggle={() => toggleAlert(alert.id)} onDelete={() => deleteAlert(alert.id)} />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </main>
  );
}

function AlertCard({ alert, onToggle, onDelete, isTriggered = false }: any) {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isTriggered 
        ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800/30' 
        : alert.isActive 
          ? 'bg-white border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800' 
          : 'bg-gray-50 border-gray-100 opacity-75 dark:bg-gray-900/50 dark:border-gray-800'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <Link href={`/stock/${alert.stock?.symbol}`} className="font-bold text-lg text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {alert.stock?.symbol}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">{alert.stock?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {onToggle && (
            <button 
              onClick={onToggle}
              className={`text-sm px-3 py-1 rounded-full font-medium transition-colors ${
                alert.isActive 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {alert.isActive ? 'Active' : 'Paused'}
            </button>
          )}
          {isTriggered && (
            <span className="text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 font-medium flex items-center gap-1">
              <Clock size={14} /> Triggered
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          {alert.condition === 'ABOVE' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
              <TrendingDown size={16} />
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Target Price</p>
            <p className="font-bold text-gray-900 dark:text-white">
              ₹{alert.targetPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <button 
          onClick={onDelete}
          className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-colors"
          title="Delete Alert"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isTriggered && alert.triggeredAt && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 font-medium">
          Triggered on {new Date(alert.triggeredAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
