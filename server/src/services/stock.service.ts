import axios from 'axios';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

class StockService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY || '';
  }

  async getQuote(symbol: string) {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
        params: { symbol, token: this.apiKey },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch quote for ${symbol}:`, error);
      throw error;
    }
  }

  async searchSymbol(query: string) {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/search`, {
        params: { q: query, token: this.apiKey },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to search for ${query}:`, error);
      throw error;
    }
  }

  async getCompanyProfile(symbol: string) {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/stock/profile2`, {
        params: { symbol, token: this.apiKey },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch profile for ${symbol}:`, error);
      throw error;
    }
  }

  async getCandles(symbol: string, resolution: string, from: number, to: number) {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
        params: { symbol, resolution, from, to, token: this.apiKey },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch candles for ${symbol}:`, error);
      throw error;
    }
  }

  async getMarketNews(category: string = 'general') {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/news`, {
        params: { category, token: this.apiKey },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch market news:', error);
      throw error;
    }
  }

  async getCompanyNews(symbol: string, from: string, to: string) {
    try {
      const response = await axios.get(`${FINNHUB_BASE_URL}/company-news`, {
        params: { symbol, from, to, token: this.apiKey },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch news for ${symbol}:`, error);
      throw error;
    }
  }
}

export const stockService = new StockService();
export default stockService;
