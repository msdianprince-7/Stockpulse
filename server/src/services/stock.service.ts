import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

class StockService {
  constructor() {
    // empty
  }

  private getYahooNS(symbol: string) {
    // Yahoo expects NSE stocks to have .NS suffix
    return `${symbol.toUpperCase()}.NS`;
  }

  async getQuote(symbol: string) {
    try {
      const quote: any = await yahooFinance.quote(this.getYahooNS(symbol));
      // Map to expected format
      return {
        c: quote.regularMarketPrice,
        h: quote.regularMarketDayHigh,
        l: quote.regularMarketDayLow,
        o: quote.regularMarketOpen,
        pc: quote.regularMarketPreviousClose,
      };
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      throw error;
    }
  }

  async searchSymbol(query: string) {
    try {
      const results = await yahooFinance.search(query);
      return results;
    } catch (error) {
      console.error(`Failed to search for ${query}:`, error);
      throw error;
    }
  }

  async getCompanyProfile(symbol: string) {
    try {
      const quote: any = await yahooFinance.quote(this.getYahooNS(symbol));
      return {
        name: quote.longName || quote.shortName,
        ticker: quote.symbol,
        exchange: quote.exchange,
        currency: quote.currency,
        marketCapitalization: quote.marketCap,
        industry: quote.industry, // Often missing in simple quote
      };
    } catch (error) {
      console.error(`Failed to fetch profile for ${symbol}:`, error);
      throw error;
    }
  }

  async getCandles(symbol: string, resolution: string, from: number, to: number) {
    try {
      // Map our app's resolution to yahoo-finance intervals
      // "15", "60", "D", "W"
      let interval: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo' = '1d';
      
      switch(resolution) {
        case '15': interval = '15m'; break;
        case '60': interval = '60m'; break;
        case 'D': interval = '1d'; break;
        case 'W': interval = '1wk'; break;
        case 'M': interval = '1mo'; break;
      }

      const queryOptions = {
        period1: new Date(from * 1000),
        period2: new Date(to * 1000),
        interval,
      };

      const result: any = await yahooFinance.chart(this.getYahooNS(symbol), queryOptions as any);
      
      const quotes = result?.quotes || [];

      if (!quotes || quotes.length === 0) {
        return { s: 'no_data' };
      }

      // Map to the format the controllers/frontend expect (originally mimicking Finnhub)
      const formatted = {
        c: quotes.map((r: any) => r.close),
        h: quotes.map((r: any) => r.high),
        l: quotes.map((r: any) => r.low),
        o: quotes.map((r: any) => r.open),
        t: quotes.map((r: any) => Math.floor(r.date.getTime() / 1000)),
        v: quotes.map((r: any) => r.volume),
        s: 'ok'
      };

      return formatted;
    } catch (error: any) {
      // Ignore not found errors for chart data gracefully to allow mock fallback
      if (error && error.message && error.message.includes('Not Found')) {
        return { s: 'no_data' };
      }
      console.error(`Failed to fetch candles for ${symbol}:`, error);
      throw error;
    }
  }

  async getMarketNews() {
    try {
      const res: any = await yahooFinance.search('^NSEI', { newsCount: 15 });
      return res.news || [];
    } catch (e) {
      console.error('Market news error:', e);
      return [];
    }
  }

  async getCompanyNews(symbol: string) {
    try {
      // Use Google News RSS — Yahoo Finance search returns generic global news
      const https = require('https');
      const query = encodeURIComponent(`${symbol} stock NSE India when:7d`);
      const url = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;

      return new Promise<any[]>((resolve) => {
        const options = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          }
        };
        
        https.get(url, options, (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => data += chunk);
          res.on('end', () => {
            try {
              const items = data.match(/<item>([\s\S]*?)<\/item>/g) || [];
              const articles = items.slice(0, 10).map((item: string) => {
                const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '') || '';
                const link = item.match(/<link>(.*?)<\/link>/)?.[1] || item.match(/<link\/>(.*?)(?=<)/)?.[1] || '';
                const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
                const source = item.match(/<source.*?>(.*?)<\/source>/)?.[1] || 'Google News';
                return {
                  uuid: Math.random().toString(36).substring(7),
                  title,
                  link: link.trim(),
                  publisher: source,
                  providerPublishTime: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
                  thumbnail: null,
                  relatedTickers: [symbol],
                };
              });
              resolve(articles);
            } catch {
              resolve([]);
            }
          });
          res.on('error', () => resolve([]));
        }).on('error', () => resolve([]));
      });
    } catch (e) {
      console.error(`Company news error ${symbol}:`, e);
      return [];
    }
  }
}

export const stockService = new StockService();
export default stockService;
