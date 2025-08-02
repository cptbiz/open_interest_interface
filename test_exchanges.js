const axios = require('axios');

console.log('🧪 Testing Exchange REST APIs...');

async function testBinanceAPI() {
    try {
        console.log('\n🔗 Testing Binance API...');
        
        // Test Open Interest
        const oiResponse = await axios.get('https://fapi.binance.com/fapi/v1/openInterest', {
            params: { symbol: 'BTCUSDT' },
            timeout: 10000
        });
        
        console.log(`✅ Binance Open Interest: ${JSON.stringify(oiResponse.data)}`);
        
        // Test Funding Rate
        const frResponse = await axios.get('https://fapi.binance.com/fapi/v1/fundingRate', {
            params: { symbol: 'BTCUSDT', limit: 1 },
            timeout: 10000
        });
        
        console.log(`✅ Binance Funding Rate: ${JSON.stringify(frResponse.data[0])}`);
        
        return true;
    } catch (error) {
        console.log(`❌ Binance API error: ${error.message}`);
        return false;
    }
}

async function testBybitAPI() {
    try {
        console.log('\n🔗 Testing Bybit API...');
        
        // Test Open Interest
        const oiResponse = await axios.get('https://api.bybit.com/v5/market/open-interest', {
            params: { 
                category: 'linear',
                symbol: 'BTCUSDT'
            },
            timeout: 10000
        });
        
        console.log(`✅ Bybit Open Interest: ${JSON.stringify(oiResponse.data)}`);
        
        return true;
    } catch (error) {
        console.log(`❌ Bybit API error: ${error.message}`);
        return false;
    }
}

async function testOKXAPI() {
    try {
        console.log('\n🔗 Testing OKX API...');
        
        // Test Open Interest
        const oiResponse = await axios.get('https://www.okx.com/api/v5/public/open-interest', {
            params: { 
                instType: 'SWAP',
                instId: 'BTC-USDT-SWAP'
            },
            timeout: 10000
        });
        
        console.log(`✅ OKX Open Interest: ${JSON.stringify(oiResponse.data)}`);
        
        return true;
    } catch (error) {
        console.log(`❌ OKX API error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting exchange API tests...\n');
    
    const results = {
        binance: await testBinanceAPI(),
        bybit: await testBybitAPI(),
        okx: await testOKXAPI()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    for (const [exchange, success] of Object.entries(results)) {
        console.log(`   ${exchange}: ${success ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All exchange APIs are working!');
    } else {
        console.log('⚠️ Some exchange APIs failed. Check your internet connection.');
    }
}

runTests().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
}); 