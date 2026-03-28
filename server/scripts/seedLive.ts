import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const nseStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', sector: 'Energy', currentPrice: 2900 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Limited', sector: 'Information Technology', currentPrice: 4100 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Financials', currentPrice: 1450 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Financials', currentPrice: 1050 },
  { symbol: 'INFY', name: 'Infosys Limited', sector: 'Information Technology', currentPrice: 1650 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financials', currentPrice: 750 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', sector: 'Communication Services', currentPrice: 1150 },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'Consumer Staples', currentPrice: 410 },
  { symbol: 'L&T', name: 'Larsen & Toubro Limited', sector: 'Industrials', currentPrice: 3400 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', sector: 'Financials', currentPrice: 6600 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', sector: 'Consumer Staples', currentPrice: 2400 },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited', sector: 'Financials', currentPrice: 1050 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Limited', sector: 'Financials', currentPrice: 1750 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', sector: 'Consumer Discretionary', currentPrice: 950 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Limited', sector: 'Consumer Discretionary', currentPrice: 11500 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Limited', sector: 'Health Care', currentPrice: 1550 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', sector: 'Materials', currentPrice: 2800 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited', sector: 'Materials', currentPrice: 150 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Limited', sector: 'Information Technology', currentPrice: 1600 },
  { symbol: 'TITAN', name: 'Titan Company Limited', sector: 'Consumer Discretionary', currentPrice: 3700 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Limited', sector: 'Consumer Discretionary', currentPrice: 1950 },
  { symbol: 'NTPC', name: 'NTPC Limited', sector: 'Utilities', currentPrice: 350 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Limited', sector: 'Utilities', currentPrice: 280 },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Limited', sector: 'Materials', currentPrice: 9800 },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'Information Technology', currentPrice: 480 },
  { symbol: 'TECHM', name: 'Tech Mahindra Limited', sector: 'Information Technology', currentPrice: 1300 },
  { symbol: 'NESTLEIND', name: 'Nestle India Limited', sector: 'Consumer Staples', currentPrice: 2600 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Limited', sector: 'Materials', currentPrice: 850 },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Limited', sector: 'Energy', currentPrice: 270 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Limited', sector: 'Financials', currentPrice: 1600 },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Limited', sector: 'Financials', currentPrice: 1500 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Limited', sector: 'Industrials', currentPrice: 3100 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Limited', sector: 'Industrials', currentPrice: 1300 },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Limited', sector: 'Financials', currentPrice: 600 },
  { symbol: 'SBIK', name: 'SBI Life Insurance Company Limited', sector: 'Financials', currentPrice: 1400 },
  { symbol: 'GRASIM', name: 'Grasim Industries Limited', sector: 'Materials', currentPrice: 2200 },
  { symbol: 'COALINDIA', name: 'Coal India Limited', sector: 'Energy', currentPrice: 450 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Limited', sector: 'Consumer Discretionary', currentPrice: 8500 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Limited', sector: 'Consumer Discretionary', currentPrice: 4600 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Limited', sector: 'Consumer Discretionary', currentPrice: 3800 },
  { symbol: 'KALYANKJIL', name: 'Kalyan Jewellers India Limited', sector: 'Consumer Discretionary', currentPrice: 420 },
  { symbol: 'ZOMATO', name: 'Zomato Limited', sector: 'Consumer Discretionary', currentPrice: 180 },
  { symbol: 'PAYTM', name: 'One 97 Communications Limited', sector: 'Financials', currentPrice: 450 },
  { symbol: 'JIOFIN', name: 'Jio Financial Services Limited', sector: 'Financials', currentPrice: 380 },
  { symbol: 'IREDA', name: 'Indian Renewable Energy Development Agency Limited', sector: 'Financials', currentPrice: 170 },
  { symbol: 'IRFC', name: 'Indian Railway Finance Corporation Limited', sector: 'Financials', currentPrice: 140 },
  { symbol: 'RVNL', name: 'Rail Vikas Nigam Limited', sector: 'Industrials', currentPrice: 250 },
  { symbol: 'SUZLON', name: 'Suzlon Energy Limited', sector: 'Energy', currentPrice: 45 },
  { symbol: 'TATACHEM', name: 'Tata Chemicals Limited', sector: 'Materials', currentPrice: 1100 },
  { symbol: 'MRF', name: 'MRF Limited', sector: 'Consumer Discretionary', currentPrice: 135000 },
];

async function main() {
  console.log('Seeding top 50 Indian stocks...');
  try {
    for (const stock of nseStocks) {
      await prisma.stock.upsert({
        where: { symbol: stock.symbol },
        update: {
          name: stock.name,
          sector: stock.sector,
          currentPrice: stock.currentPrice,
        },
        create: {
          symbol: stock.symbol,
          name: stock.name,
          exchange: 'NSE',
          sector: stock.sector,
          currentPrice: stock.currentPrice,
          dayHigh: stock.currentPrice * 1.02,
          dayLow: stock.currentPrice * 0.98,
          yearHigh: stock.currentPrice * 1.2,
          yearLow: stock.currentPrice * 0.8,
          volume: BigInt(Math.floor(Math.random() * 5000000) + 500000),
        },
      });
      console.log(`✅ Upserted ${stock.symbol}`);
    }
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
