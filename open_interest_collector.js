const WebSocket = require('ws');
const { Pool } = require('pg');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

console.log('🚀 Starting Open Interest Data Collector...');
console.log('📊 Real-time Open Interest from major exchanges');
console.log('🔄 Railway deployment ready - ' + new Date().toISOString());

// ==================== ENVIRONMENT VARIABLES ====================
const ENV = {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3000,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    WS_RECONNECT_INTERVAL: parseInt(process.env.WS_RECONNECT_INTERVAL) || 5000,
    API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT) || 100,
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000
};

// ==================== DATABASE CONFIGURATION ====================
const pool = new Pool({
    connectionString: ENV.DATABASE_URL,
    ssl: ENV.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// ==================== TRADING PAIRS ====================
const tradingPairs = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT',
    'DOGEUSDT', 'DOTUSDT', 'AVAXUSDT', 'LTCUSDT', 'LINKUSDT',
    'BCHUSDT', 'ETCUSDT', 'UNIUSDT', 'OPUSDT', 'ARBUSDT',
    'APTUSDT', 'SUIUSDT', 'FILUSDT', 'MATICUSDT', 'SHIBUSDT'
];

// ==================== EXCHANGE CONFIGURATIONS ====================
const exchanges = {
    binance: {
        name: 'Binance',
        wsUrl: 'wss://fstream.binance.com/ws/',
        restUrl: 'https://fapi.binance.com',
        pairs: tradingPairs.filter(pair => !['MATICUSDT', 'SHIBUSDT'].includes(pair))
    },
    bybit: {
        name: 'Bybit',
        wsUrl: 'wss://stream.bybit.com/v5/public/linear',
        restUrl: 'https://api.bybit.com',
        pairs: tradingPairs.filter(pair => !['MATICUSDT', 'SHIBUSDT'].includes(pair))
    },
    okx: {
        name: 'OKX',
        wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
        restUrl: 'https://www.okx.com',
        pairs: tradingPairs
    }
};

// ==================== DATA STORAGE ====================
const openInterestData = new Map();
const fundingRateData = new Map();
const longShortRatioData = new Map();

// ==================== WEB SOCKET CONNECTIONS ====================
let binanceWS = null;
let bybitWS = null;
let okxWS = null;

class OpenInterestCollector {
    constructor() {
        this.isRunning = false;
        this.pool = pool;
        this.app = express();
        this.setupExpress();
    }

    setupExpress() {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Open Interest Collector',
                exchanges: Object.keys(exchanges),
                dataPoints: openInterestData.size
            });
        });

        // Get all open interest data
        this.app.get('/api/open-interest', (req, res) => {
            const data = Array.from(openInterestData.values());
            res.json({
                data,
                total: data.length,
                timestamp: new Date().toISOString()
            });
        });

        // Get open interest by exchange
        this.app.get('/api/open-interest/:exchange', (req, res) => {
            const exchange = req.params.exchange;
            const data = Array.from(openInterestData.values())
                .filter(item => item.exchange === exchange);
            res.json({
                exchange,
                data,
                total: data.length,
                timestamp: new Date().toISOString()
            });
        });

        // Get funding rates
        this.app.get('/api/funding-rates', (req, res) => {
            const data = Array.from(fundingRateData.values());
            res.json({
                data,
                total: data.length,
                timestamp: new Date().toISOString()
            });
        });

        // Get long/short ratio
        this.app.get('/api/long-short-ratio', (req, res) => {
            const data = Array.from(longShortRatioData.values());
            res.json({
                data,
                total: data.length,
                timestamp: new Date().toISOString()
            });
        });

        // Get statistics
        this.app.get('/api/stats', async (req, res) => {
            try {
                const stats = await this.getStats();
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    async initDatabase() {
        try {
            console.log('🗄️ Initializing database...');
            
            const createTablesSQL = `
                CREATE TABLE IF NOT EXISTS open_interest (
                    id SERIAL PRIMARY KEY,
                    exchange VARCHAR(50) NOT NULL,
                    symbol VARCHAR(20) NOT NULL,
                    open_interest DECIMAL(20,8),
                    open_interest_value DECIMAL(20,8),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS funding_rates (
                    id SERIAL PRIMARY KEY,
                    exchange VARCHAR(50) NOT NULL,
                    symbol VARCHAR(20) NOT NULL,
                    funding_rate DECIMAL(10,8),
                    next_funding_time BIGINT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS long_short_ratio (
                    id SERIAL PRIMARY KEY,
                    exchange VARCHAR(50) NOT NULL,
                    symbol VARCHAR(20) NOT NULL,
                    long_ratio DECIMAL(10,8),
                    short_ratio DECIMAL(10,8),
                    long_short_ratio DECIMAL(10,8),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_open_interest_exchange_symbol ON open_interest(exchange, symbol);
                CREATE INDEX IF NOT EXISTS idx_funding_rates_exchange_symbol ON funding_rates(exchange, symbol);
                CREATE INDEX IF NOT EXISTS idx_long_short_ratio_exchange_symbol ON long_short_ratio(exchange, symbol);
            `;

            await this.pool.query(createTablesSQL);
            console.log('✅ Database initialized successfully');
            
        } catch (error) {
            console.error('❌ Database initialization error:', error);
            throw error;
        }
    }

    async saveOpenInterest(exchange, symbol, openInterest, openInterestValue) {
        try {
            const query = `
                INSERT INTO open_interest (exchange, symbol, open_interest, open_interest_value)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (exchange, symbol) 
                DO UPDATE SET 
                    open_interest = EXCLUDED.open_interest,
                    open_interest_value = EXCLUDED.open_interest_value,
                    timestamp = CURRENT_TIMESTAMP
            `;
            
            await this.pool.query(query, [exchange, symbol, openInterest, openInterestValue]);
            
            // Update cache
            openInterestData.set(`${exchange}_${symbol}`, {
                exchange,
                symbol,
                openInterest,
                openInterestValue,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`❌ Error saving open interest for ${exchange} ${symbol}:`, error);
        }
    }

    async saveFundingRate(exchange, symbol, fundingRate, nextFundingTime) {
        try {
            const query = `
                INSERT INTO funding_rates (exchange, symbol, funding_rate, next_funding_time)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (exchange, symbol) 
                DO UPDATE SET 
                    funding_rate = EXCLUDED.funding_rate,
                    next_funding_time = EXCLUDED.next_funding_time,
                    timestamp = CURRENT_TIMESTAMP
            `;
            
            await this.pool.query(query, [exchange, symbol, fundingRate, nextFundingTime]);
            
            // Update cache
            fundingRateData.set(`${exchange}_${symbol}`, {
                exchange,
                symbol,
                fundingRate,
                nextFundingTime,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`❌ Error saving funding rate for ${exchange} ${symbol}:`, error);
        }
    }

    async saveLongShortRatio(exchange, symbol, longRatio, shortRatio, longShortRatio) {
        try {
            const query = `
                INSERT INTO long_short_ratio (exchange, symbol, long_ratio, short_ratio, long_short_ratio)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (exchange, symbol) 
                DO UPDATE SET 
                    long_ratio = EXCLUDED.long_ratio,
                    short_ratio = EXCLUDED.short_ratio,
                    long_short_ratio = EXCLUDED.long_short_ratio,
                    timestamp = CURRENT_TIMESTAMP
            `;
            
            await this.pool.query(query, [exchange, symbol, longRatio, shortRatio, longShortRatio]);
            
            // Update cache
            longShortRatioData.set(`${exchange}_${symbol}`, {
                exchange,
                symbol,
                longRatio,
                shortRatio,
                longShortRatio,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error(`❌ Error saving long/short ratio for ${exchange} ${symbol}:`, error);
        }
    }

    initializeBinanceWS() {
        try {
            console.log('🔗 Initializing Binance WebSocket...');
            
            const pairs = exchanges.binance.pairs.map(pair => pair.toLowerCase() + '@openInterest');
            const wsUrl = exchanges.binance.wsUrl + pairs.join('/');
            
            binanceWS = new WebSocket(wsUrl);
            
            binanceWS.on('open', () => {
                console.log('✅ Binance WebSocket connected');
            });
            
            binanceWS.on('message', async (data) => {
                try {
                    const message = JSON.parse(data);
                    if (message.data) {
                        const { symbol, openInterest, openInterestValue } = message.data;
                        await this.saveOpenInterest('binance', symbol, openInterest, openInterestValue);
                        console.log(`📊 Binance OI: ${symbol} = ${openInterest}`);
                    }
                } catch (error) {
                    console.error('❌ Binance message error:', error);
                }
            });
            
            binanceWS.on('error', (error) => {
                console.error('❌ Binance WebSocket error:', error);
            });
            
            binanceWS.on('close', () => {
                console.log('🔌 Binance WebSocket disconnected, reconnecting...');
                setTimeout(() => this.initializeBinanceWS(), ENV.WS_RECONNECT_INTERVAL);
            });
            
        } catch (error) {
            console.error('❌ Binance WebSocket initialization error:', error);
        }
    }

    initializeBybitWS() {
        try {
            console.log('🔗 Initializing Bybit WebSocket...');
            
            const pairs = exchanges.bybit.pairs.map(pair => `"openInterest.${pair}"`);
            const wsUrl = exchanges.bybit.wsUrl;
            
            bybitWS = new WebSocket(wsUrl);
            
            bybitWS.on('open', () => {
                console.log('✅ Bybit WebSocket connected');
                const subscribeMsg = {
                    "op": "subscribe",
                    "args": pairs
                };
                bybitWS.send(JSON.stringify(subscribeMsg));
            });
            
            bybitWS.on('message', async (data) => {
                try {
                    const message = JSON.parse(data);
                    if (message.data && message.data.length > 0) {
                        for (const item of message.data) {
                            const { symbol, openInterest, openInterestValue } = item;
                            await this.saveOpenInterest('bybit', symbol, openInterest, openInterestValue);
                            console.log(`📊 Bybit OI: ${symbol} = ${openInterest}`);
                        }
                    }
                } catch (error) {
                    console.error('❌ Bybit message error:', error);
                }
            });
            
            bybitWS.on('error', (error) => {
                console.error('❌ Bybit WebSocket error:', error);
            });
            
            bybitWS.on('close', () => {
                console.log('🔌 Bybit WebSocket disconnected, reconnecting...');
                setTimeout(() => this.initializeBybitWS(), ENV.WS_RECONNECT_INTERVAL);
            });
            
        } catch (error) {
            console.error('❌ Bybit WebSocket initialization error:', error);
        }
    }

    async getStats() {
        try {
            const openInterestCount = await this.pool.query('SELECT COUNT(*) FROM open_interest');
            const fundingRatesCount = await this.pool.query('SELECT COUNT(*) FROM funding_rates');
            const longShortRatioCount = await this.pool.query('SELECT COUNT(*) FROM long_short_ratio');
            
            return {
                openInterest: {
                    total: parseInt(openInterestCount.rows[0].count),
                    cached: openInterestData.size
                },
                fundingRates: {
                    total: parseInt(fundingRatesCount.rows[0].count),
                    cached: fundingRateData.size
                },
                longShortRatio: {
                    total: parseInt(longShortRatioCount.rows[0].count),
                    cached: longShortRatioData.size
                },
                exchanges: Object.keys(exchanges),
                tradingPairs: tradingPairs.length,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Error getting stats:', error);
            throw error;
        }
    }

    async start() {
        try {
            console.log('🚀 Starting Open Interest Collector...');
            
            // Initialize database
            await this.initDatabase();
            
            // Initialize WebSocket connections
            this.initializeBinanceWS();
            this.initializeBybitWS();
            
            // Start Express server
            this.app.listen(ENV.PORT, () => {
                console.log(`🌐 Open Interest API running on port ${ENV.PORT}`);
                console.log(`📊 Health check: http://localhost:${ENV.PORT}/health`);
                console.log(`📈 Open Interest: http://localhost:${ENV.PORT}/api/open-interest`);
                console.log(`💰 Funding Rates: http://localhost:${ENV.PORT}/api/funding-rates`);
                console.log(`⚖️ Long/Short Ratio: http://localhost:${ENV.PORT}/api/long-short-ratio`);
            });
            
            this.isRunning = true;
            console.log('✅ Open Interest Collector started successfully');
            
        } catch (error) {
            console.error('❌ Error starting collector:', error);
            throw error;
        }
    }

    stop() {
        console.log('🛑 Stopping Open Interest Collector...');
        this.isRunning = false;
        
        if (binanceWS) binanceWS.close();
        if (bybitWS) bybitWS.close();
        if (okxWS) okxWS.close();
        
        this.pool.end();
        console.log('✅ Open Interest Collector stopped');
    }
}

// Start the collector
const collector = new OpenInterestCollector();

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down...');
    collector.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down...');
    collector.stop();
    process.exit(0);
});

collector.start().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

module.exports = collector; 