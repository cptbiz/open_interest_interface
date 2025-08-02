const axios = require('axios');

console.log('🧪 Testing Open Interest Interface locally...');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
    try {
        console.log('🔗 Testing endpoints...\n');
        
        // Test health check
        console.log('1. Testing health check...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log(`   ✅ Health: ${health.status} - ${JSON.stringify(health.data)}`);
        
        // Test open interest
        console.log('\n2. Testing open interest endpoint...');
        const oi = await axios.get(`${BASE_URL}/api/open-interest`);
        console.log(`   ✅ Open Interest: ${oi.status} - ${oi.data.total} records`);
        
        // Test funding rates
        console.log('\n3. Testing funding rates endpoint...');
        const fr = await axios.get(`${BASE_URL}/api/funding-rates`);
        console.log(`   ✅ Funding Rates: ${fr.status} - ${fr.data.total} records`);
        
        // Test long/short ratio
        console.log('\n4. Testing long/short ratio endpoint...');
        const lsr = await axios.get(`${BASE_URL}/api/long-short-ratio`);
        console.log(`   ✅ Long/Short Ratio: ${lsr.status} - ${lsr.data.total} records`);
        
        // Test stats
        console.log('\n5. Testing stats endpoint...');
        const stats = await axios.get(`${BASE_URL}/api/stats`);
        console.log(`   ✅ Stats: ${stats.status} - ${JSON.stringify(stats.data)}`);
        
        console.log('\n🎉 All endpoints working correctly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the server is running: npm start');
        }
    }
}

// Run tests
testEndpoints(); 