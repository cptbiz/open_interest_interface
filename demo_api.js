const express = require('express');
const cors = require('cors');
const demoData = require('./demo_data.js');

console.log('🎭 Starting Open Interest Demo API...');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Open Interest Demo API',
        exchanges: ['binance', 'bybit', 'okx'],
        dataPoints: demoData.openInterest.length,
        uptime: Date.now() - new Date().getTime(),
        demo: true
    });
});

// Get all open interest data
app.get('/api/open-interest', (req, res) => {
    res.json({
        data: demoData.openInterest,
        total: demoData.openInterest.length,
        timestamp: new Date().toISOString(),
        demo: true
    });
});

// Get open interest by exchange
app.get('/api/open-interest/:exchange', (req, res) => {
    const exchange = req.params.exchange;
    const data = demoData.openInterest.filter(item => item.exchange === exchange);
    res.json({
        exchange,
        data,
        total: data.length,
        timestamp: new Date().toISOString(),
        demo: true
    });
});

// Get funding rates
app.get('/api/funding-rates', (req, res) => {
    res.json({
        data: demoData.fundingRates,
        total: demoData.fundingRates.length,
        timestamp: new Date().toISOString(),
        demo: true
    });
});

// Get long/short ratio
app.get('/api/long-short-ratio', (req, res) => {
    res.json({
        data: demoData.longShortRatio,
        total: demoData.longShortRatio.length,
        timestamp: new Date().toISOString(),
        demo: true
    });
});

// Get real-time analysis
app.get('/api/analysis', (req, res) => {
    const totalOI = demoData.openInterest.reduce((sum, item) => sum + item.openInterestValue, 0);
    const avgFR = demoData.fundingRates.reduce((sum, item) => sum + item.fundingRate, 0) / demoData.fundingRates.length;
    const avgLSR = demoData.longShortRatio.reduce((sum, item) => sum + item.longShortRatio, 0) / demoData.longShortRatio.length;
    
    const analysis = {
        totalOpenInterest: totalOI,
        totalFundingRate: avgFR,
        averageLongShortRatio: avgLSR,
        topGainers: demoData.openInterest.slice(0, 3),
        topLosers: demoData.openInterest.slice(-3),
        marketTrend: avgFR > 0.0001 ? 'bullish' : avgFR < -0.0001 ? 'bearish' : 'neutral',
        exchanges: {
            binance: demoData.openInterest.filter(item => item.exchange === 'binance').length,
            bybit: demoData.openInterest.filter(item => item.exchange === 'bybit').length,
            okx: demoData.openInterest.filter(item => item.exchange === 'okx').length
        }
    };
    
    res.json({
        analysis,
        timestamp: new Date().toISOString(),
        demo: true
    });
});

// Get market sentiment
app.get('/api/sentiment', (req, res) => {
    const bullish = demoData.fundingRates.filter(item => item.fundingRate > 0.0001).length;
    const bearish = demoData.fundingRates.filter(item => item.fundingRate < -0.0001).length;
    const neutral = demoData.fundingRates.length - bullish - bearish;
    
    const sentiment = {
        bullish,
        bearish,
        neutral,
        total: demoData.fundingRates.length,
        overall: bullish > bearish && bullish > neutral ? 'bullish' : 
                bearish > bullish && bearish > neutral ? 'bearish' : 'neutral'
    };
    
    res.json({
        sentiment,
        timestamp: new Date().toISOString(),
        demo: true
    });
});

// Get statistics
app.get('/api/stats', (req, res) => {
    res.json({
        openInterest: {
            total: demoData.openInterest.length,
            exchanges: ['binance', 'bybit', 'okx']
        },
        fundingRates: {
            total: demoData.fundingRates.length,
            exchanges: ['binance', 'bybit']
        },
        longShortRatio: {
            total: demoData.longShortRatio.length,
            exchanges: ['binance', 'bybit']
        },
        analysis: {
            total: 1
        },
        exchanges: ['binance', 'bybit', 'okx'],
        tradingPairs: 20,
        uptime: Date.now() - new Date().getTime(),
        demo: true,
        timestamp: new Date().toISOString()
    });
});

// Demo info
app.get('/api/demo', (req, res) => {
    res.json({
        message: 'This is a demo version of Open Interest Interface',
        features: [
            'Real-time Open Interest data simulation',
            'Funding Rates analysis',
            'Long/Short Ratio tracking',
            'Market Sentiment analysis',
            'Real-time trend analysis'
        ],
        exchanges: ['binance', 'bybit', 'okx'],
        tradingPairs: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT'],
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🎭 Demo API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 Open Interest: http://localhost:${PORT}/api/open-interest`);
    console.log(`💰 Funding Rates: http://localhost:${PORT}/api/funding-rates`);
    console.log(`⚖️ Long/Short Ratio: http://localhost:${PORT}/api/long-short-ratio`);
    console.log(`📊 Analysis: http://localhost:${PORT}/api/analysis`);
    console.log(`😊 Sentiment: http://localhost:${PORT}/api/sentiment`);
    console.log(`ℹ️ Demo Info: http://localhost:${PORT}/api/demo`);
});

module.exports = app; 