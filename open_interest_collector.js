const WebSocket = require('ws');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const OpenAIAnalyzer = require('./openai_analyzer.js');

console.log('🚀 Starting Open Interest Real-time Analyzer...');
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
    },
    okx: {
        name: 'OKX',
        wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
        restUrl: 'https://www.okx.com',
        pairs: tradingPairs
    }
};

// ==================== IN-MEMORY DATA STORAGE ====================
const openInterestData = new Map();
const fundingRateData = new Map();
const longShortRatioData = new Map();
const analysisData = new Map();

// ==================== WEB SOCKET CONNECTIONS ====================
let binanceWS = null;
let bybitWS = null;
let okxWS = null;

class OpenInterestAnalyzer {
    constructor() {
        this.isRunning = false;
        this.app = express();
        this.setupExpress();
        this.startTime = new Date();
        this.lastRestUpdate = new Date();
        this.openaiAnalyzer = new OpenAIAnalyzer();
    }

    setupExpress() {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                service: 'Open Interest Real-time Analyzer',
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

        // Get real-time analysis
        this.app.get('/api/analysis', (req, res) => {
            const analysis = this.generateAnalysis();
            res.json({
                analysis,
                timestamp: new Date().toISOString()
            });
        });

        // Get statistics
        this.app.get('/api/stats', (req, res) => {
            const stats = this.getStats();
            res.json(stats);
        });

        // Get market sentiment
        this.app.get('/api/sentiment', (req, res) => {
            const sentiment = this.calculateMarketSentiment();
            res.json({
                sentiment,
                timestamp: new Date().toISOString()
            });
        });

        // Get OpenAI analysis
        this.app.get('/api/openai-analysis', async (req, res) => {
            try {
                const data = {
                    openInterest: Array.from(openInterestData.values()),
                    fundingRates: Array.from(fundingRateData.values()),
                    longShortRatio: Array.from(longShortRatioData.values())
                };
                
                const analysis = await this.openaiAnalyzer.analyzeOpenInterest(data);
                res.json({
                    analysis,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Get OpenAI market report
        this.app.get('/api/openai-report', async (req, res) => {
            try {
                const data = {
                    openInterest: Array.from(openInterestData.values()),
                    fundingRates: Array.from(fundingRateData.values()),
                    longShortRatio: Array.from(longShortRatioData.values())
                };
                
                const report = await this.openaiAnalyzer.generateMarketReport(data);
                res.json({
                    report,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Force update from REST APIs
        this.app.post('/api/force-update', async (req, res) => {
            try {
                await this.updateFromRestAPIs();
                res.json({
                    success: true,
                    message: 'Data updated from REST APIs',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
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

    updateLongShortRatio(exchange, symbol, longRatio, shortRatio, longShortRatio) {
        const key = `${exchange}_${symbol}`;
        const data = {
            exchange,
            symbol,
            longRatio,
            shortRatio,
            longShortRatio,
            timestamp: new Date().toISOString()
        };
        
        longShortRatioData.set(key, data);
        console.log(`⚖️ ${exchange} L/S: ${symbol} = ${longShortRatio}`);
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
                        this.updateOpenInterest('binance', symbol, 
                            response.data.openInterest, 
                            response.data.openInterestValue);
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

            // Bybit Open Interest
            for (const symbol of exchanges.bybit.pairs) {
                try {
                    const response = await axios.get(`${exchanges.bybit.restUrl}/v5/market/open-interest`, {
                        params: { 
                            category: 'linear',
                            symbol 
                        },
                        timeout: 5000
                    });
                    
                    if (response.data && response.data.result) {
                        const data = response.data.result;
                        this.updateOpenInterest('bybit', symbol, 
                            data.openInterest, 
                            data.openInterestValue);
                    }
                } catch (error) {
                    console.log(`⚠️ Bybit OI for ${symbol}: ${error.message}`);
                }
            }

            this.lastRestUpdate = new Date();
            console.log('✅ REST API update completed');
            
        } catch (error) {
            console.error('❌ REST API update error:', error.message);
        }
    }

    generateAnalysis() {
        const analysis = {
            totalOpenInterest: 0,
            totalFundingRate: 0,
            averageLongShortRatio: 0,
            topGainers: [],
            topLosers: [],
            marketTrend: 'neutral',
            exchanges: {}
        };

        // Calculate totals
        let totalOI = 0;
        let totalFR = 0;
        let totalLSR = 0;
        let count = 0;

        openInterestData.forEach((data) => {
            totalOI += data.openInterestValue || 0;
        });

        fundingRateData.forEach((data) => {
            totalFR += data.fundingRate || 0;
            count++;
        });

        longShortRatioData.forEach((data) => {
            totalLSR += data.longShortRatio || 0;
        });

        analysis.totalOpenInterest = totalOI;
        analysis.totalFundingRate = count > 0 ? totalFR / count : 0;
        analysis.averageLongShortRatio = longShortRatioData.size > 0 ? totalLSR / longShortRatioData.size : 0;

        // Determine market trend
        if (analysis.totalFundingRate > 0.01) {
            analysis.marketTrend = 'bullish';
        } else if (analysis.totalFundingRate < -0.01) {
            analysis.marketTrend = 'bearish';
        } else {
            analysis.marketTrend = 'neutral';
        }

        return analysis;
    }

    calculateMarketSentiment() {
        const sentiment = {
            bullish: 0,
            bearish: 0,
            neutral: 0,
            total: 0,
            overall: 'neutral'
        };

        fundingRateData.forEach((data) => {
            sentiment.total++;
            if (data.fundingRate > 0.01) {
                sentiment.bullish++;
            } else if (data.fundingRate < -0.01) {
                sentiment.bearish++;
            } else {
                sentiment.neutral++;
            }
        });

        // Determine overall sentiment
        if (sentiment.bullish > sentiment.bearish && sentiment.bullish > sentiment.neutral) {
            sentiment.overall = 'bullish';
        } else if (sentiment.bearish > sentiment.bullish && sentiment.bearish > sentiment.neutral) {
            sentiment.overall = 'bearish';
        } else {
            sentiment.overall = 'neutral';
        }

        return sentiment;
    }

    getStats() {
        return {
            openInterest: {
                total: openInterestData.size,
                exchanges: Object.keys(exchanges)
            },
            fundingRates: {
                total: fundingRateData.size,
                exchanges: Object.keys(exchanges)
            },
            longShortRatio: {
                total: longShortRatioData.size,
                exchanges: Object.keys(exchanges)
            },
            analysis: {
                total: analysisData.size
            },
            exchanges: Object.keys(exchanges),
            tradingPairs: tradingPairs.length,
            uptime: Date.now() - this.startTime.getTime(),
            lastRestUpdate: this.lastRestUpdate.toISOString(),
            timestamp: new Date().toISOString()
        };
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
                        this.updateOpenInterest('binance', symbol, openInterest, openInterestValue);
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
                            this.updateOpenInterest('bybit', symbol, openInterest, openInterestValue);
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

    async start() {
        try {
            console.log('🚀 Starting Open Interest Real-time Analyzer...');
            
            // Initialize WebSocket connections
            this.initializeBinanceWS();
            this.initializeBybitWS();
            
            // Initial data load from REST APIs
            await this.updateFromRestAPIs();
            
            // Set up periodic REST API updates
            setInterval(() => {
                this.updateFromRestAPIs();
            }, 60000); // Update every minute
            
            // Start Express server
            this.app.listen(ENV.PORT, () => {
                console.log(`🌐 Open Interest Analyzer running on port ${ENV.PORT}`);
                console.log(`📊 Health check: http://localhost:${ENV.PORT}/health`);
                console.log(`📈 Open Interest: http://localhost:${ENV.PORT}/api/open-interest`);
                console.log(`💰 Funding Rates: http://localhost:${ENV.PORT}/api/funding-rates`);
                console.log(`⚖️ Long/Short Ratio: http://localhost:${ENV.PORT}/api/long-short-ratio`);
                console.log(`📊 Analysis: http://localhost:${ENV.PORT}/api/analysis`);
                console.log(`😊 Sentiment: http://localhost:${ENV.PORT}/api/sentiment`);
                console.log(`🤖 OpenAI Analysis: http://localhost:${ENV.PORT}/api/openai-analysis`);
                console.log(`📋 OpenAI Report: http://localhost:${ENV.PORT}/api/openai-report`);
                console.log(`🔄 Force Update: POST http://localhost:${ENV.PORT}/api/force-update`);
            });
            
            this.isRunning = true;
            console.log('✅ Open Interest Real-time Analyzer started successfully');
            
        } catch (error) {
            console.error('❌ Error starting analyzer:', error);
            throw error;
        }
    }

    stop() {
        console.log('🛑 Stopping Open Interest Real-time Analyzer...');
        this.isRunning = false;
        
        if (binanceWS) binanceWS.close();
        if (bybitWS) bybitWS.close();
        if (okxWS) okxWS.close();
        
        console.log('✅ Open Interest Real-time Analyzer stopped');
    }
}

// Start the analyzer
const analyzer = new OpenInterestAnalyzer();

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