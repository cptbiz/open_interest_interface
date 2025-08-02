// Demo data for Open Interest Interface
const demoData = {
    openInterest: [
        {
            exchange: 'binance',
            symbol: 'BTCUSDT',
            openInterest: 86145.131,
            openInterestValue: 9723456789.12,
            timestamp: new Date().toISOString(),
            price: 112798.50
        },
        {
            exchange: 'binance',
            symbol: 'ETHUSDT',
            openInterest: 123456.789,
            openInterestValue: 4567890123.45,
            timestamp: new Date().toISOString(),
            price: 3456.78
        },
        {
            exchange: 'bybit',
            symbol: 'BTCUSDT',
            openInterest: 78901.234,
            openInterestValue: 8901234567.89,
            timestamp: new Date().toISOString(),
            price: 112750.25
        },
        {
            exchange: 'okx',
            symbol: 'BTCUSDT',
            openInterest: 2599666.66,
            openInterestValue: 2920582510.84,
            timestamp: new Date().toISOString(),
            price: 112345.67
        }
    ],
    fundingRates: [
        {
            exchange: 'binance',
            symbol: 'BTCUSDT',
            fundingRate: 0.00004437,
            nextFundingTime: 1754150400000,
            timestamp: new Date().toISOString()
        },
        {
            exchange: 'binance',
            symbol: 'ETHUSDT',
            fundingRate: 0.00012345,
            nextFundingTime: 1754150400000,
            timestamp: new Date().toISOString()
        },
        {
            exchange: 'bybit',
            symbol: 'BTCUSDT',
            fundingRate: 0.00005678,
            nextFundingTime: 1754150400000,
            timestamp: new Date().toISOString()
        }
    ],
    longShortRatio: [
        {
            exchange: 'binance',
            symbol: 'BTCUSDT',
            longRatio: 0.65,
            shortRatio: 0.35,
            longShortRatio: 1.86,
            timestamp: new Date().toISOString()
        },
        {
            exchange: 'binance',
            symbol: 'ETHUSDT',
            longRatio: 0.58,
            shortRatio: 0.42,
            longShortRatio: 1.38,
            timestamp: new Date().toISOString()
        },
        {
            exchange: 'bybit',
            symbol: 'BTCUSDT',
            longRatio: 0.72,
            shortRatio: 0.28,
            longShortRatio: 2.57,
            timestamp: new Date().toISOString()
        }
    ]
};

module.exports = demoData; 