<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/trending-up.svg" width="80" alt="Logo" />
  <h1>StockPulse</h1>
  <p>A Full-Stack, Real-Time Virtual Stock Market Trading Platform</p>
</div>

<p align="center">
  <img src="./client/public/home.png" alt="StockPulse Dashboard" width="100%" />
</p>

## 🚀 Overview

**StockPulse** is a feature-rich, full-stack paper-trading and investment tracking platform built specifically for the Indian and Global equity markets. It streams live market data, allows users to simulate stock purchases, maintain watchlists, track portfolios, and set real-time price alerts, all from a beautiful, responsive dark-mode UI.

## ✨ Features

- **Real-Time Market Data:** Live stock prices, charts, and metrics via Yahoo Finance API (`yahoo-finance2`), dynamically streamed across the app using **WebSockets**.
- **Virtual Portfolio Management:** Buy/Sell simulation. Trade tracking and accurate P&L calculation instantly reflected on your account balance.
- **Smart Watchlists:** Pin favorites and keep track of trending stocks effortlessly.
- **Automated Price Alerts:** Set target bounds (Above/Below). Background engines monitor streaming data and trigger real-time browser notifications instantly.
- **Search Engine:** Parallelized asset search queries that seamlessly return global and regional (NSE/BSE) variants accurately, completely bypassing rate-limits.
- **Market News RSS Aggregation:** Live daily financial news scraper targeting standard APIs (Google News).

## 🖼️ Application Gallery

<details open>
<summary><b>Live Stock Dashboard & Charts</b></summary>
<img src="./client/public/stockdashboard.png" alt="Live Charts" width="100%" />
</details>

<details open>
<summary><b>Portfolio Tracking</b></summary>
<img src="./client/public/portfolio.png" alt="Portfolio" width="100%" />
</details>

<details>
<summary><b>Watchlists</b></summary>
<img src="./client/public/watchlist.png" alt="Watchlist" width="100%" />
</details>

<details>
<summary><b>Real-Time Price Alerts</b></summary>
<img src="./client/public/pricealerts.png" alt="Alerts" width="100%" />
</details>

<details>
<summary><b>Market News Feed</b></summary>
<img src="./client/public/news.png" alt="News Feed" width="100%" />
</details>

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** Next.js 16.2 (`App Router`)
- **Styling:** Tailwind CSS + Headless UI
- **Components:** Radix UI, Lucide React Icons
- **Real-Time:** Socket.io-client
- **Charts:** Lightweight Charts (TradingView)

### Backend (Server)
- **Framework:** Node.js, Express.js
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma
- **Caching & Pub/Sub:** Upstash Redis
- **APIs:** `yahoo-finance2`
- **Real-Time Engine:** Socket.io
- **Security:** JWT Authentication, CORS, Rate Limiting

## 💻 Getting Started (Local Development)

### 1. Requirements
- Node.js >= 22.0.0 (Strict enforcement due to `yahoo-finance2` package updates)
- A hosted PostgreSQL Database (e.g., Neon.tech)
- Redis Server (Optionally Upstash free tier)

### 2. Backend Setup
```bash
cd server
npm install
# Set up .env variables (DATABASE_URL, REDIS_URL, JWT_SECRET...)
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Set up .env.local (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL)
npm run dev
```

## 🌐 Production Deployment

The platform's architecture supports isolated horizontal scaling perfectly.
- **Frontend** deployed on **Vercel**
- **Backend Node Engine** deployed on **Render** utilizing Serverless Neon/Upstash endpoints. 
- Ensure `NODE_VERSION=22` is supplied to Render's environment footprint to support native `fetch` operations triggered by the Yahoo-Finance API wrapper.

---
> Developed intentionally for testing caching algorithms, rate-limiting resiliency, and parallel fetching efficiency in highly-volatile websocket architectures.
