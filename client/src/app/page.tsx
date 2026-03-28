import { SearchBar } from '@/components';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-wide mb-8 shadow-sm ring-1 ring-blue-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live Market Data
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
          Track Indian Stocks <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            In Real-Time
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          The fastest, smartest, and most beautiful way to analyze NSE and BSE stocks. Search a symbol below to see live charts.
        </p>

        <div className="transform -translate-y-2 relative z-50">
          <SearchBar />
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto align-top">
          <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10 text-left">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Real-Time Charts</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Lightning-fast WebSocket updates that stream live price changes directly to your charts.</p>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10 text-left">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Smart Search</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Instantly find NSE/BSE listed stocks with rapid autocomplete and sector identification.</p>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl p-6 rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10 text-left">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Virtual Portfolio</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Build your watchlist and simulate trading without risking real capital to learn market trends.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
