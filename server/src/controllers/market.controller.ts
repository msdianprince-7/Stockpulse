import { Request, Response } from 'express';

export const getMarketStatus = (_req: Request, res: Response): void => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  const hours = istTime.getUTCHours();
  const minutes = istTime.getUTCMinutes();
  const day = istTime.getUTCDay();
  const timeInMinutes = hours * 60 + minutes;

  // NSE/BSE trading hours: 9:15 AM - 3:30 PM IST, Mon-Fri
  const marketOpen = 9 * 60 + 15;   // 9:15 AM
  const marketClose = 15 * 60 + 30;  // 3:30 PM
  const preMarketOpen = 9 * 60;      // 9:00 AM

  let status: string;
  let message: string;

  if (day === 0 || day === 6) {
    status = 'closed';
    message = 'Market is closed (Weekend)';
  } else if (timeInMinutes >= preMarketOpen && timeInMinutes < marketOpen) {
    status = 'pre-market';
    message = 'Pre-market session (9:00 AM - 9:15 AM IST)';
  } else if (timeInMinutes >= marketOpen && timeInMinutes < marketClose) {
    status = 'open';
    message = 'Market is open (9:15 AM - 3:30 PM IST)';
  } else {
    status = 'closed';
    message = 'Market is closed';
  }

  res.json({
    status,
    message,
    exchange: 'NSE/BSE',
    currentTime: istTime.toISOString(),
    tradingHours: '9:15 AM - 3:30 PM IST',
  });
};
