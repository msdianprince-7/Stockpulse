export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)} K`;
  return num.toString();
};

export const getISTTime = (): Date => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
};

export const isMarketOpen = (): boolean => {
  const ist = getISTTime();
  const hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  const day = ist.getUTCDay();
  const timeInMinutes = hours * 60 + minutes;

  if (day === 0 || day === 6) return false;
  return timeInMinutes >= 555 && timeInMinutes < 930; // 9:15 - 15:30
};
