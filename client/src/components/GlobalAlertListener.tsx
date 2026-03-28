'use client';

import { useState, useEffect } from 'react';
import useSocket from '@/hooks/useSocket';
import { useAuth } from '@/context/AuthContext';
import { BellRing, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AlertNotification {
  id: string;
  alertId: string;
  stockSymbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  currentPrice: number;
}

export const GlobalAlertListener = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);

  useEffect(() => {
    if (isConnected && user && socket) {
       // Subscribe to user-specific channel
       socket.emit('subscribe:user', user.id);

       const handleAlertTriggered = (data: any) => {
         const newAlert = {
           id: Math.random().toString(36).substring(7),
           alertId: data.alert.id,
           stockSymbol: data.stock.symbol,
           targetPrice: data.alert.targetPrice,
           condition: data.alert.condition,
           currentPrice: data.stock.currentPrice,
         };
         
         setNotifications((prev) => [...prev, newAlert]);
         
         // Auto dismiss after 8 seconds
         setTimeout(() => {
           setNotifications((prev) => prev.filter((n) => n.id !== newAlert.id));
         }, 8000);
       };

       socket.on('price_alert_triggered', handleAlertTriggered);

       return () => {
         socket.off('price_alert_triggered', handleAlertTriggered);
       };
    }
  }, [isConnected, user, socket]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className="pointer-events-auto bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 md:p-5 w-80 md:w-96 transform transition-all duration-500 animate-in slide-in-from-bottom-5 fade-in"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 shrink-0 text-indigo-600 dark:text-indigo-400">
              <BellRing size={20} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Alert Triggered! 🎉
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="font-bold text-gray-900 dark:text-white">{notif.stockSymbol}</span> just crossed 
                {notif.condition === 'ABOVE' ? ' above ' : ' below '} 
                <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{notif.targetPrice}</span>!
              </p>
              <div className="mt-3 flex gap-3">
                <Link 
                  href={`/stock/${notif.stockSymbol}`}
                  onClick={() => removeNotification(notif.id)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  View Stock <ArrowRight size={12} />
                </Link>
                <Link 
                  href={`/alerts`}
                  onClick={() => removeNotification(notif.id)}
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
                >
                  Manage Alerts
                </Link>
              </div>
            </div>
            <button 
              onClick={() => removeNotification(notif.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
