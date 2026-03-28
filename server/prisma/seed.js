const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding stock data...');
  
  const stocks = [
    // === NIFTY 50 STOCKS ===
    // Energy & Oil
    { symbol: 'RELIANCE', name: 'Reliance Industries Limited', exchange: 'NSE', sector: 'Energy', currentPrice: 2950.50, marketCap: 19500000000000 },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corporation', exchange: 'NSE', sector: 'Energy', currentPrice: 275.40, marketCap: 3460000000000 },
    { symbol: 'NTPC', name: 'NTPC Limited', exchange: 'NSE', sector: 'Power', currentPrice: 365.20, marketCap: 3540000000000 },
    { symbol: 'POWERGRID', name: 'Power Grid Corporation', exchange: 'NSE', sector: 'Power', currentPrice: 310.75, marketCap: 2890000000000 },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Limited', exchange: 'NSE', sector: 'Diversified', currentPrice: 2840.60, marketCap: 3240000000000 },
    { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', exchange: 'NSE', sector: 'Infrastructure', currentPrice: 1280.30, marketCap: 2770000000000 },
    { symbol: 'BPCL', name: 'Bharat Petroleum Corporation', exchange: 'NSE', sector: 'Energy', currentPrice: 620.80, marketCap: 1350000000000 },
    { symbol: 'COALINDIA', name: 'Coal India Limited', exchange: 'NSE', sector: 'Mining', currentPrice: 435.60, marketCap: 2680000000000 },

    // IT Services
    { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT Services', currentPrice: 4120.00, marketCap: 14800000000000 },
    { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE', sector: 'IT Services', currentPrice: 1620.25, marketCap: 6700000000000 },
    { symbol: 'HCLTECH', name: 'HCL Technologies Limited', exchange: 'NSE', sector: 'IT Services', currentPrice: 1540.50, marketCap: 4180000000000 },
    { symbol: 'WIPRO', name: 'Wipro Limited', exchange: 'NSE', sector: 'IT Services', currentPrice: 465.30, marketCap: 2430000000000 },
    { symbol: 'TECHM', name: 'Tech Mahindra Limited', exchange: 'NSE', sector: 'IT Services', currentPrice: 1650.80, marketCap: 1610000000000 },
    { symbol: 'LTIM', name: 'LTIMindtree Limited', exchange: 'NSE', sector: 'IT Services', currentPrice: 5420.60, marketCap: 1600000000000 },

    // Banking & Finance
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Banking', currentPrice: 1450.75, marketCap: 11000000000000 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', exchange: 'NSE', sector: 'Banking', currentPrice: 1050.00, marketCap: 7300000000000 },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', currentPrice: 750.80, marketCap: 6700000000000 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', sector: 'Banking', currentPrice: 1780.40, marketCap: 3530000000000 },
    { symbol: 'AXISBANK', name: 'Axis Bank Limited', exchange: 'NSE', sector: 'Banking', currentPrice: 1150.25, marketCap: 3560000000000 },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Limited', exchange: 'NSE', sector: 'Banking', currentPrice: 1420.60, marketCap: 1100000000000 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', exchange: 'NSE', sector: 'Financials', currentPrice: 6750.00, marketCap: 4100000000000 },
    { symbol: 'BAJFINSV', name: 'Bajaj Finserv Limited', exchange: 'NSE', sector: 'Financials', currentPrice: 1620.50, marketCap: 2590000000000 },
    { symbol: 'SBILIFE', name: 'SBI Life Insurance', exchange: 'NSE', sector: 'Insurance', currentPrice: 1520.30, marketCap: 1520000000000 },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', exchange: 'NSE', sector: 'Insurance', currentPrice: 640.80, marketCap: 1380000000000 },

    // FMCG & Consumer
    { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE', sector: 'FMCG', currentPrice: 410.20, marketCap: 5100000000000 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', exchange: 'NSE', sector: 'FMCG', currentPrice: 2380.50, marketCap: 5590000000000 },
    { symbol: 'NESTLEIND', name: 'Nestle India Limited', exchange: 'NSE', sector: 'FMCG', currentPrice: 2540.70, marketCap: 2450000000000 },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products', exchange: 'NSE', sector: 'FMCG', currentPrice: 1120.40, marketCap: 1040000000000 },
    { symbol: 'BRITANNIA', name: 'Britannia Industries', exchange: 'NSE', sector: 'FMCG', currentPrice: 5420.30, marketCap: 1300000000000 },

    // Automobile
    { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', exchange: 'NSE', sector: 'Automobile', currentPrice: 950.40, marketCap: 3500000000000 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India', exchange: 'NSE', sector: 'Automobile', currentPrice: 12450.60, marketCap: 3910000000000 },
    { symbol: 'M&M', name: 'Mahindra & Mahindra Limited', exchange: 'NSE', sector: 'Automobile', currentPrice: 2680.20, marketCap: 3330000000000 },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Limited', exchange: 'NSE', sector: 'Automobile', currentPrice: 8950.40, marketCap: 2500000000000 },
    { symbol: 'EICHERMOT', name: 'Eicher Motors Limited', exchange: 'NSE', sector: 'Automobile', currentPrice: 4620.80, marketCap: 1260000000000 },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Limited', exchange: 'NSE', sector: 'Automobile', currentPrice: 4850.30, marketCap: 970000000000 },

    // Telecom
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecommunication', currentPrice: 1120.45, marketCap: 6800000000000 },

    // Metals & Mining
    { symbol: 'TATASTEEL', name: 'Tata Steel Limited', exchange: 'NSE', sector: 'Metals', currentPrice: 145.60, marketCap: 1770000000000 },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Limited', exchange: 'NSE', sector: 'Metals', currentPrice: 870.40, marketCap: 2130000000000 },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', exchange: 'NSE', sector: 'Metals', currentPrice: 620.50, marketCap: 1390000000000 },

    // Construction & Infrastructure
    { symbol: 'LT', name: 'Larsen & Toubro Limited', exchange: 'NSE', sector: 'Construction', currentPrice: 3540.60, marketCap: 4800000000000 },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', exchange: 'NSE', sector: 'Cement', currentPrice: 11250.40, marketCap: 3250000000000 },
    { symbol: 'GRASIM', name: 'Grasim Industries', exchange: 'NSE', sector: 'Cement', currentPrice: 2540.30, marketCap: 1670000000000 },
    { symbol: 'SHREECEM', name: 'Shree Cement Limited', exchange: 'NSE', sector: 'Cement', currentPrice: 26800.50, marketCap: 970000000000 },

    // Pharma & Healthcare
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', exchange: 'NSE', sector: 'Pharma', currentPrice: 1650.30, marketCap: 3960000000000 },
    { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", exchange: 'NSE', sector: 'Pharma', currentPrice: 6420.80, marketCap: 1070000000000 },
    { symbol: 'CIPLA', name: 'Cipla Limited', exchange: 'NSE', sector: 'Pharma', currentPrice: 1480.50, marketCap: 1200000000000 },
    { symbol: 'DIVISLAB', name: "Divi's Laboratories", exchange: 'NSE', sector: 'Pharma', currentPrice: 3850.20, marketCap: 1020000000000 },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', exchange: 'NSE', sector: 'Healthcare', currentPrice: 6540.30, marketCap: 940000000000 },

    // Others (Nifty 50)
    { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', exchange: 'NSE', sector: 'Consumer Goods', currentPrice: 2850.60, marketCap: 2730000000000 },
    { symbol: 'TITAN', name: 'Titan Company Limited', exchange: 'NSE', sector: 'Consumer Goods', currentPrice: 3280.40, marketCap: 2910000000000 },
    { symbol: 'WIPRO', name: 'Wipro Limited', exchange: 'NSE', sector: 'IT Services', currentPrice: 465.30, marketCap: 2430000000000 },

    // === POPULAR MID-CAP / NEXT 50 ===
    { symbol: 'ZOMATO', name: 'Zomato Limited', exchange: 'NSE', sector: 'Internet', currentPrice: 265.40, marketCap: 2340000000000 },
    { symbol: 'PAYTM', name: 'One97 Communications (Paytm)', exchange: 'NSE', sector: 'Fintech', currentPrice: 840.60, marketCap: 530000000000 },
    { symbol: 'NYKAA', name: 'FSN E-Commerce (Nykaa)', exchange: 'NSE', sector: 'E-Commerce', currentPrice: 185.20, marketCap: 530000000000 },
    { symbol: 'IRCTC', name: 'Indian Railway Catering', exchange: 'NSE', sector: 'Travel', currentPrice: 920.40, marketCap: 735000000000 },
    { symbol: 'DMART', name: 'Avenue Supermarts (DMart)', exchange: 'NSE', sector: 'Retail', currentPrice: 3840.50, marketCap: 2490000000000 },
    { symbol: 'PIDILITIND', name: 'Pidilite Industries', exchange: 'NSE', sector: 'Chemicals', currentPrice: 2950.30, marketCap: 1500000000000 },
    { symbol: 'HAVELLS', name: 'Havells India Limited', exchange: 'NSE', sector: 'Consumer Durables', currentPrice: 1680.40, marketCap: 1050000000000 },
    { symbol: 'SIEMENS', name: 'Siemens Limited', exchange: 'NSE', sector: 'Capital Goods', currentPrice: 6250.80, marketCap: 2220000000000 },
    { symbol: 'ABB', name: 'ABB India Limited', exchange: 'NSE', sector: 'Capital Goods', currentPrice: 7450.20, marketCap: 1580000000000 },
    { symbol: 'HAL', name: 'Hindustan Aeronautics', exchange: 'NSE', sector: 'Defence', currentPrice: 4520.60, marketCap: 3020000000000 },
    { symbol: 'BEL', name: 'Bharat Electronics Limited', exchange: 'NSE', sector: 'Defence', currentPrice: 280.40, marketCap: 2050000000000 },
    { symbol: 'TRENT', name: 'Trent Limited (Westside)', exchange: 'NSE', sector: 'Retail', currentPrice: 5820.30, marketCap: 2070000000000 },
    { symbol: 'VEDL', name: 'Vedanta Limited', exchange: 'NSE', sector: 'Metals', currentPrice: 445.60, marketCap: 1650000000000 },
    { symbol: 'BANKBARODA', name: 'Bank of Baroda', exchange: 'NSE', sector: 'Banking', currentPrice: 260.80, marketCap: 1350000000000 },
    { symbol: 'PNB', name: 'Punjab National Bank', exchange: 'NSE', sector: 'Banking', currentPrice: 105.40, marketCap: 1160000000000 },
    { symbol: 'CANBK', name: 'Canara Bank', exchange: 'NSE', sector: 'Banking', currentPrice: 110.20, marketCap: 1000000000000 },
    { symbol: 'IOC', name: 'Indian Oil Corporation', exchange: 'NSE', sector: 'Energy', currentPrice: 165.30, marketCap: 2330000000000 },
    { symbol: 'TATAPOWER', name: 'Tata Power Company', exchange: 'NSE', sector: 'Power', currentPrice: 420.60, marketCap: 1340000000000 },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy', exchange: 'NSE', sector: 'Renewable Energy', currentPrice: 1840.50, marketCap: 2910000000000 },
    { symbol: 'JIOFIN', name: 'Jio Financial Services', exchange: 'NSE', sector: 'Financials', currentPrice: 340.20, marketCap: 2160000000000 },
    { symbol: 'POLYCAB', name: 'Polycab India Limited', exchange: 'NSE', sector: 'Consumer Durables', currentPrice: 6120.40, marketCap: 920000000000 },
    { symbol: 'GODREJCP', name: 'Godrej Consumer Products', exchange: 'NSE', sector: 'FMCG', currentPrice: 1320.50, marketCap: 1350000000000 },
    { symbol: 'SBICARD', name: 'SBI Cards & Payment', exchange: 'NSE', sector: 'Financials', currentPrice: 780.40, marketCap: 740000000000 },
    { symbol: 'COLPAL', name: 'Colgate-Palmolive India', exchange: 'NSE', sector: 'FMCG', currentPrice: 2780.60, marketCap: 760000000000 },
    { symbol: 'PAGEIND', name: 'Page Industries Limited', exchange: 'NSE', sector: 'Textile', currentPrice: 42500.80, marketCap: 474000000000 },
  ];

  // De-duplicate by symbol
  const uniqueStocks = [...new Map(stocks.map(s => [s.symbol, s])).values()];

  for (const stock of uniqueStocks) {
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: { name: stock.name, sector: stock.sector, currentPrice: stock.currentPrice, marketCap: stock.marketCap },
      create: stock,
    });
  }

  console.log(`Database seeded with ${uniqueStocks.length} stocks! 🌱`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
