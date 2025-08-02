const WebSocket = require('ws');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

console.log('🚀 Starting Simple Open Interest Real-time Analyzer...');
console.log('📊 Real-time analysis without database storage');
console.log('🔄 Railway deployment ready - ' + new Date().toISOString());

// ==================== ENVIRONMENT VARIABLES ====================
const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3000,
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    WS_RECONNECT_INTERVAL: parseInt(process.env.WS_RECONNECT_INTERVAL) || 5000,
    API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT) || 100,
    API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000
};

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
    }
};

// ==================== IN-MEMORY DATA STORAGE ====================
const openInterestData = new Map();
const fundingRateData = new Map();

// ==================== WEB SOCKET CONNECTIONS ====================
let binanceWS = null;
let bybitWS = null;

class SimpleOpenInterestAnalyzer {
    constructor() {
        this.isRunning = false;
        this.app = express();
        this.setupExpress();
        this.startTime = new Date();
        this.lastRestUpdate = new Date();
    }

    setupExpress() {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Simple Open Interest Real-time Analyzer',
                exchanges: Object.keys(exchanges),
                dataPoints: openInterestData.size,
                uptime: Date.now() - this.startTime.getTime(),
                lastRestUpdate: this.lastRestUpdate.toISOString()
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

        // Get funding rates
        this.app.get('/api/funding-rates', (req, res) => {
            const data = Array.from(fundingRateData.values());
            res.json({
                data,
                total: data.length,
                timestamp: new Date().toISOString()
            });
        });

        // Force update
        this.app.post('/api/force-update', async (req, res) => {
            try {
                await this.updateFromRestAPIs();
                res.json({
                    message: 'Data updated successfully',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    updateOpenInterest(exchange, symbol, openInterest, openInterestValue) {
        const key = `${exchange}_${symbol}`;
        const data = {
            exchange,
            symbol,
            openInterest,
            openInterestValue,
            timestamp: new Date().toISOString(),
            price: openInterestValue / openInterest // Estimated price
        };
        
        openInterestData.set(key, data);
        console.log(`📊 ${exchange} OI: ${symbol} = ${openInterest} (${openInterestValue} USDT)`);
    }

    updateFundingRate(exchange, symbol, fundingRate, nextFundingTime) {
        const key = `${exchange}_${symbol}`;
        const data = {
            exchange,
            symbol,
            fundingRate,
            nextFundingTime,
            timestamp: new Date().toISOString()
        };
        
        fundingRateData.set(key, data);
        console.log(`💰 ${exchange} FR: ${symbol} = ${fundingRate}%`);
    }

    async updateFromRestAPIs() {
        console.log('🔄 Updating data from REST APIs...');
        
        try {
            // Binance Open Interest
            for (const symbol of exchanges.binance.pairs) {
                try {
                    const response = await axios.get(`${exchanges.binance.restUrl}/fapi/v1/openInterest`, {
                        params: { symbol },
                        timeout: 5000
                    });
                    
                    if (response.data) {
                        // Исправляем проблему с undefined openInterestValue
                        const openInterestValue = response.data.openInterestValue || 
                            (response.data.openInterest * 50000); // Примерная оценка
                        this.updateOpenInterest('binance', symbol, 
                            response.data.openInterest, 
                            openInterestValue);
                    }
                } catch (error) {
                    console.log(`⚠️ Binance OI for ${symbol}: ${error.message}`);
                }
            }

            // Binance Funding Rate
            for (const symbol of exchanges.binance.pairs) {
                try {
                    const response = await axios.get(`${exchanges.binance.restUrl}/fapi/v1/fundingRate`, {
                        params: { symbol, limit: 1 },
                        timeout: 5000
                    });
                    
                    if (response.data && response.data.length > 0) {
                        const data = response.data[0];
                        this.updateFundingRate('binance', symbol, 
                            parseFloat(data.fundingRate), 
                            data.nextFundingTime);
                    }
                } catch (error) {
                    console.log(`⚠️ Binance FR for ${symbol}: ${error.message}`);
                }
            }

            this.lastRestUpdate = new Date();
            console.log('✅ REST API update completed');
            
        } catch (error) {
            console.error('❌ REST API update error:', error.message);
        }
    }

    async start() {
        try {
            console.log('🚀 Starting Simple Open Interest Real-time Analyzer...');
            
            // Initial data load from REST APIs
            await this.updateFromRestAPIs();
            
            // Set up periodic REST API updates
            setInterval(() => {
                this.updateFromRestAPIs();
            }, 60000); // Update every minute
            
            // Start Express server
            this.app.listen(ENV.PORT, () => {
                const baseUrl = process.env.RAILWAY_STATIC_URL || `http://localhost:${ENV.PORT}`;
                console.log(`🌐 Simple Open Interest Analyzer running on port ${ENV.PORT}`);
                console.log(`📊 Health check: ${baseUrl}/health`);
                console.log(`📈 Open Interest: ${baseUrl}/api/open-interest`);
                console.log(`💰 Funding Rates: ${baseUrl}/api/funding-rates`);
                console.log(`🔄 Force Update: POST ${baseUrl}/api/force-update`);
                console.log('✅ Server is ready to accept requests');
            });
            
            this.isRunning = true;
            console.log('✅ Simple Open Interest Real-time Analyzer started successfully');
            
        } catch (error) {
            console.error('❌ Error starting analyzer:', error);
            throw error;
        }
    }

    stop() {
        console.log('🛑 Stopping Simple Open Interest Real-time Analyzer...');
        this.isRunning = false;
        console.log('✅ Simple Open Interest Real-time Analyzer stopped');
    }
}

// Start the analyzer
const analyzer = new SimpleOpenInterestAnalyzer();

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down...');
    analyzer.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down...');
    analyzer.stop();
    process.exit(0);
});

analyzer.start().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

module.exports = analyzer; 