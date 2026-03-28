const { PrismaClient } = require('@prisma/client');
const yahooFinance = require('yahoo-finance2').default;

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fetching live prices for all seeded stocks to clear dummy data...');
  
  // Get all stocks
  const stocks = await prisma.stock.findMany({
    select: { symbol: true, id: true }
  });

  console.log(`Found ${stocks.length} stocks. Fetching in batches...`);

  const batchSize = 100; // Yahoo Finance can handle ~100 symbols per batch
  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize);
    const symbols = batch.map(s => `${s.symbol}.NS`);
    
    try {
      const quotes = await yahooFinance.quote(symbols);
      let updatedCount = 0;
      
      for (const quote of quotes) {
        if (!quote || !quote.symbol || !quote.regularMarketPrice) continue;
        const sym = quote.symbol.replace('.NS', '');
        
        await prisma.stock.updateMany({
          where: { symbol: sym },
          data: { currentPrice: quote.regularMarketPrice }
        });
        updatedCount++;
      }
      
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} complete. Updated ${updatedCount}/${batch.length} prices.`);
    } catch (e) {
      console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, e.message);
    }
  }

  console.log('🎉 Done updating all live prices!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
