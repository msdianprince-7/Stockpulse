import { PrismaClient, Exchange } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding stock data...');
  
  const stocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Limited', exchange: Exchange.NSE, sector: 'Energy', currentPrice: 2950.50, marketCap: 19500000000000 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: Exchange.NSE, sector: 'IT Services', currentPrice: 4120.00, marketCap: 14800000000000 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: Exchange.NSE, sector: 'Banking', currentPrice: 1450.75, marketCap: 11000000000000 },
    { symbol: 'INFY', name: 'Infosys Limited', exchange: Exchange.NSE, sector: 'IT Services', currentPrice: 1620.25, marketCap: 6700000000000 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', exchange: Exchange.NSE, sector: 'Banking', currentPrice: 1050.00, marketCap: 7300000000000 },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: Exchange.NSE, sector: 'Banking', currentPrice: 750.80, marketCap: 6700000000000 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', exchange: Exchange.NSE, sector: 'Telecommunication', currentPrice: 1120.45, marketCap: 6800000000000 },
    { symbol: 'ITC', name: 'ITC Limited', exchange: Exchange.NSE, sector: 'FMCG', currentPrice: 410.20, marketCap: 5100000000000 },
    { symbol: 'L&T', name: 'Larsen & Toubro Limited', exchange: Exchange.NSE, sector: 'Construction', currentPrice: 3540.60, marketCap: 4800000000000 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', exchange: Exchange.NSE, sector: 'Financials', currentPrice: 6750.00, marketCap: 4100000000000 },
  ];

  for (const stock of stocks) {
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: {},
      create: stock,
    });
  }

  console.log('Database seeded successfully! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
