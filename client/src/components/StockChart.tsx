'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';
import { stockAPI } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface StockChartProps {
  symbol: string;
  initialPrice: number;
}

type TimeRange = '1D' | '1W' | '1M' | '1Y';

export const StockChart = ({ symbol, initialPrice }: StockChartProps) => {
  const [range, setRange] = useState<TimeRange>('1D');
  const [chartData, setChartData] = useState<{ time: number; close: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  // Load historical data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await stockAPI.getChart(symbol, range);
        // Response format: [{ time: 1234567, open: 1, high: 2, low: 0.5, close: 1.5, volume: 100 }, ...]
        
        // If it's a valid array of chart points
        if (Array.isArray(response.data)) {
            setChartData(
                response.data.map((d: any) => ({
                time: d.time,
                close: d.close,
                }))
            );
        } else {
            // Fallback empty UI
            setChartData([]);
        }
      } catch (error) {
        console.error('Failed to load chart data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, range]);

  // Live Append for 1D chart
  useEffect(() => {
    if (!socket || range !== '1D') return;

    const handlePriceUpdate = (data: { symbol: string; price: number; timestamp: string }) => {
      if (data.symbol === symbol) {
        setChartData((prev) => [
          ...prev,
          { time: new Date(data.timestamp).getTime(), close: data.price },
        ]);
      }
    };

    socket.on('stock_price_update', handlePriceUpdate);

    return () => {
      socket.off('stock_price_update', handlePriceUpdate);
    };
  }, [socket, symbol, range]);

  // Determine chart theme/color based on performance
  const isPositive = useMemo(() => {
    if (chartData.length < 2) return true;
    return chartData[chartData.length - 1].close >= chartData[0].close;
  }, [chartData]);

  const chartColor = isPositive ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)';
  const chartBgColor = isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  const data = {
    labels: chartData.map((d) => {
      const date = new Date(d.time);
      if (range === '1D') return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      if (range === '1W' || range === '1M') return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }),
    datasets: [
      {
        fill: true,
        label: `${symbol} Price`,
        data: chartData.map((d) => d.close),
        borderColor: chartColor,
        backgroundColor: chartBgColor,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `₹${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 6, color: '#9CA3AF' },
      },
      y: {
        position: 'right' as const,
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { color: '#9CA3AF', callback: (val: any) => `₹${val}` },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const ranges: TimeRange[] = ['1D', '1W', '1M', '1Y'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm ring-1 ring-gray-100 dark:ring-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Price History</h2>
        
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                range === r
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 z-10 rounded-xl">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500">
             <p className="text-lg font-medium">No chart data available.</p>
             <p className="text-sm">The free API tier may have rate limits.</p>
          </div>
        ) : null}
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default StockChart;
