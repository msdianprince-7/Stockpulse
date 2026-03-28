import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeSocket } from './sockets';
import { prisma } from './config/database';
import stockRoutes from './routes/stock.routes';
import userRoutes from './routes/user.routes';
import watchlistRoutes from './routes/watchlist.routes';
import portfolioRoutes from './routes/portfolio.routes';
import alertRoutes from './routes/alert.routes';
import newsRoutes from './routes/news.routes';
import marketRoutes from './routes/market.routes';

dotenv.config();

// Fix for BigInt JSON serialization error in Prisma/Express
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/stocks', stockRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/market', marketRoutes);

// Initialize WebSocket
initializeSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`⚡ StockPulse server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;


