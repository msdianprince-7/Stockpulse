import { PrismaClient } from '@prisma/client';
import { stockService } from '../src/services/stock.service';

const prisma = new PrismaClient();

async function main() {
  const queryStr = 'reliance';
  const exchange = undefined;
  const sector = undefined;
  try {
    const dbStocks = await prisma.stock.findMany({
      where: {
        AND: [
          queryStr ? {
            OR: [
              { symbol: { contains: String(queryStr), mode: 'insensitive' } },
              { name: { contains: String(queryStr), mode: 'insensitive' } },
            ],
          } : {},
          exchange ? { exchange: exchange as 'NSE' | 'BSE' } : {},
          sector ? { sector: String(sector) } : {},
        ],
      },
      take: 15,
      orderBy: { symbol: 'asc' },
    });

    const resultsMap = new Map<string, any>();
    dbStocks.forEach((stock) => resultsMap.set(stock.symbol, stock));

    // 2. Search Yahoo Finance (if query provided)
    if (queryStr && queryStr.length > 1) {
      try {
        const yahooResults = await stockService.searchSymbol(queryStr + '.NS');
        const quotes = yahooResults.quotes || [];

        quotes.forEach((quote: any) => {
          // Only include Indian stocks (NSE/BSE) or ones that match the query closely
          if (quote.symbol && (quote.symbol.endsWith('.NS') || quote.symbol.endsWith('.BO'))) {
            const cleanSymbol = quote.symbol.replace('.NS', '').replace('.BO', '');
            
            if (!resultsMap.has(cleanSymbol)) {
              resultsMap.set(cleanSymbol, {
                id: `yahoo_${cleanSymbol}`,
                symbol: cleanSymbol,
                name: quote.longname || quote.shortname || cleanSymbol,
                exchange: quote.symbol.endsWith('.NS') ? 'NSE' : 'BSE',
                sector: quote.sector || quote.industry || 'Equities',
                currentPrice: 0, 
              });
            }
          }
        });
      } catch (yahooErr) {
        console.error('Yahoo search error:', yahooErr);
      }
    }

    console.log(Array.from(resultsMap.values()).slice(0, 20));
  } catch (e) {
    console.error('QUERY ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
