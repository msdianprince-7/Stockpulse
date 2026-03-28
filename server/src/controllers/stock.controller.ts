import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { stockService } from '../services/stock.service';

export const searchStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, exchange, sector } = req.query;
    const queryStr = String(q || '');

    // 1. Search Local Database
    const dbStocks = await prisma.stock.findMany({
      where: {
        AND: [
          queryStr ? {
            OR: [
              { symbol: { contains: queryStr, mode: 'insensitive' } },
              { name: { contains: queryStr, mode: 'insensitive' } },
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
                currentPrice: 0, // Placeholder, fetched on stock page
              });
            }
          }
        });
      } catch (yahooErr) {
        console.error('Yahoo search error:', yahooErr);
      }
    }

    res.json(Array.from(resultsMap.values()).slice(0, 20));
  } catch (error: any) {
    console.error('Search stocks error:', error);
    res.status(500).json({ error: 'Failed to search stocks', details: error?.message, stack: error?.stack });
  }
};

export const getStockBySymbol = async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = String(req.params.symbol);

    let stock = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      res.status(404).json({ error: 'Stock not found' });
      return;
    }

    // Try fetching the live quote immediately to replace any dummy seed prices 
    // before the WebSocket engine's 10-second polling ticks.
    try {
      const liveQuote = await stockService.getQuote(symbol);
      if (liveQuote && liveQuote.c && liveQuote.c !== stock.currentPrice) {
        stock = await prisma.stock.update({
          where: { id: stock.id },
          data: { currentPrice: liveQuote.c }
        });
      }
    } catch (e) {
      // Ignore background quote failure and serve DB value as fallback
    }

    res.json(stock);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: 'Failed to get stock' });
  }
};

export const getAllStocks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { symbol: 'asc' },
      take: 100,
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get all stocks error:', error);
    res.status(500).json({ error: 'Failed to get stocks' });
  }
};

export const getTopGainers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { currentPrice: 'desc' },
      take: 10,
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get top gainers error:', error);
    res.status(500).json({ error: 'Failed to get top gainers' });
  }
};

export const getTopLosers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await prisma.stock.findMany({
      orderBy: { currentPrice: 'asc' },
      take: 10,
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get top losers error:', error);
    res.status(500).json({ error: 'Failed to get top losers' });
  }
};

export const getChartData = async (req: Request, res: Response): Promise<void> => {
  try {
    const symbol = String(req.params.symbol).toUpperCase();
    const { range = '1D' } = req.query;

    const to = Math.floor(Date.now() / 1000);
    let from = to;
    let resolution = 'D';
    let numPoints = 30;

    switch (range) {
      case '1D':
        from = to - 24 * 60 * 60;
        resolution = '15';
        numPoints = 26; // ~6.5 trading hours / 15 min
        break;
      case '1W':
        from = to - 7 * 24 * 60 * 60;
        resolution = '60';
        numPoints = 35;
        break;
      case '1M':
        from = to - 30 * 24 * 60 * 60;
        resolution = 'D';
        numPoints = 22;
        break;
      case '1Y':
        from = to - 365 * 24 * 60 * 60;
        resolution = 'W';
        numPoints = 52;
        break;
      default:
        from = to - 24 * 60 * 60;
        resolution = '15';
        numPoints = 26;
    }

    // Try real API first
    try {
      const candles: any = await stockService.getCandles(symbol, resolution, from, to);

      if (candles.s !== 'no_data' && candles.t) {
        const formattedData = candles.t.map((timestamp: number, index: number) => ({
          time: timestamp * 1000,
          open: candles.o[index],
          high: candles.h[index],
          low: candles.l[index],
          close: candles.c[index],
          volume: candles.v[index],
        }));

        res.json(formattedData);
        return;
      }
    } catch {
      // External API failed (e.g. no valid key), fall through to mock data
    }

    // Generate realistic mock chart data based on the stock's current price
    const stock = await prisma.stock.findUnique({ where: { symbol } });
    const basePrice = stock?.currentPrice || 1000;
    const volatility = basePrice * 0.02; // 2% volatility
    const timeStep = (to - from) / numPoints;

    let price = basePrice * (1 - (Math.random() * 0.03)); // start slightly offset
    const mockData = [];

    for (let i = 0; i < numPoints; i++) {
      const change = (Math.random() - 0.48) * volatility; // slight upward bias
      price = Math.max(price + change, basePrice * 0.8);
      const high = price + Math.random() * volatility * 0.5;
      const low = price - Math.random() * volatility * 0.5;

      mockData.push({
        time: (from + i * timeStep) * 1000,
        open: parseFloat((price - change * 0.3).toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(price.toFixed(2)),
        volume: Math.floor(Math.random() * 500000 + 100000),
      });
    }

    res.json(mockData);
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({ error: 'Failed to get chart data' });
  }
};

