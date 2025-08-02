const axios = require('axios');
const WebSocket = require('ws');

console.log('🧪 Testing Open Interest Interface Connections...');

// Test configurations
const testConfigs = {
    binance: {
        name: 'Binance',
        restUrl: 'https://fapi.binance.com',
        wsUrl: 'wss://fstream.binance.com/ws/btcusdt@openInterest',
        testSymbol: 'BTCUSDT'
    },
    bybit: {
        name: 'Bybit',
        restUrl: 'https://api.bybit.com',
        wsUrl: 'wss://stream.bybit.com/v5/public/linear',
        testSymbol: 'BTCUSDT'
    },
    okx: {
        name: 'OKX',
        restUrl: 'https://www.okx.com',
        wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
        testSymbol: 'BTCUSDT'
    }
};

async function testRestAPI(exchange, config) {
    try {
        console.log(`\n🔗 Testing ${exchange} REST API...`);
        
        let response;
        switch (exchange) {
            case 'binance':
                response = await axios.get(`${config.restUrl}/fapi/v1/openInterest`, {
                    params: { symbol: config.testSymbol }
                });
                break;
            case 'bybit':
                response = await axios.get(`${config.restUrl}/v5/market/open-interest`, {
                    params: { 
                        category: 'linear',
                        symbol: config.testSymbol
                    }
                });
                break;
            case 'okx':
                response = await axios.get(`${config.restUrl}/api/v5/public/open-interest`, {
                    params: { 
                        instType: 'SWAP',
                        instId: config.testSymbol
                    }
                });
                break;
        }
        
        console.log(`✅ ${exchange} REST API: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
        
        return true;
    } catch (error) {
        console.log(`❌ ${exchange} REST API: FAILED`);
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

function testWebSocket(exchange, config) {
    return new Promise((resolve) => {
        console.log(`\n🔗 Testing ${exchange} WebSocket...`);
        
        const ws = new WebSocket(config.wsUrl);
        
        const timeout = setTimeout(() => {
            console.log(`⏰ ${exchange} WebSocket: TIMEOUT`);
            ws.close();
            resolve(false);
        }, 10000);
        
        ws.on('open', () => {
            console.log(`✅ ${exchange} WebSocket: CONNECTED`);
            
            if (exchange === 'bybit') {
                const subscribeMsg = {
                    "op": "subscribe",
                    "args": [`"openInterest.${config.testSymbol}"`]
                };
                ws.send(JSON.stringify(subscribeMsg));
            }
        });
        
        ws.on('message', (data) => {
            console.log(`📨 ${exchange} WebSocket: MESSAGE RECEIVED`);
            console.log(`   Data: ${data.toString().substring(0, 100)}...`);
            clearTimeout(timeout);
            ws.close();
            resolve(true);
        });
        
        ws.on('error', (error) => {
            console.log(`❌ ${exchange} WebSocket: ERROR`);
            console.log(`   Error: ${error.message}`);
            clearTimeout(timeout);
            resolve(false);
        });
        
        ws.on('close', () => {
            console.log(`🔌 ${exchange} WebSocket: CLOSED`);
        });
    });
}

async function testDatabase() {
    try {
        console.log('\n🗄️ Testing Database Connection...');
        
        const { Pool } = require('pg');
        require('dotenv').config();
        
        if (!process.env.DATABASE_URL) {
            console.log('⚠️ DATABASE_URL not set, skipping database test');
            return false;
        }
        
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        });
        
        const result = await pool.query('SELECT NOW() as current_time');
        console.log(`✅ Database: CONNECTED`);
        console.log(`   Current time: ${result.rows[0].current_time}`);
        
        await pool.end();
        return true;
    } catch (error) {
        console.log(`❌ Database: FAILED`);
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting connection tests...\n');
    
    const results = {
        rest: {},
        websocket: {},
        database: false
    };
    
    // Test REST APIs
    for (const [exchange, config] of Object.entries(testConfigs)) {
        results.rest[exchange] = await testRestAPI(exchange, config);
    }
    
    // Test WebSockets
    for (const [exchange, config] of Object.entries(testConfigs)) {
        results.websocket[exchange] = await testWebSocket(exchange, config);
    }
    
    // Test Database
    results.database = await testDatabase();
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    console.log('\n🌐 REST APIs:');
    for (const [exchange, success] of Object.entries(results.rest)) {
        console.log(`   ${exchange}: ${success ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    console.log('\n🔌 WebSockets:');
    for (const [exchange, success] of Object.entries(results.websocket)) {
        console.log(`   ${exchange}: ${success ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    console.log('\n🗄️ Database:');
    console.log(`   Connection: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
    
    const totalTests = Object.keys(results.rest).length + Object.keys(results.websocket).length + 1;
    const passedTests = Object.values(results.rest).filter(Boolean).length + 
                       Object.values(results.websocket).filter(Boolean).length + 
                       (results.database ? 1 : 0);
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! System is ready for deployment.');
    } else {
        console.log('⚠️ Some tests failed. Please check your configuration.');
    }
}

runTests().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
}); 