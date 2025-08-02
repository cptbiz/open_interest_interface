const axios = require('axios');

console.log('🧪 Testing Open Interest Interface deployment...');

const BASE_URL = 'https://web-production-939d1.up.railway.app';

async function testDeployment() {
    try {
        console.log('🔗 Testing deployment endpoints...\n');
        
        // Test health check
        console.log('1. Testing health check...');
        try {
            const health = await axios.get(`${BASE_URL}/health`, { timeout: 10000 });
            console.log(`   ✅ Health: ${health.status} - ${JSON.stringify(health.data)}`);
        } catch (error) {
            console.log(`   ❌ Health: ${error.message}`);
        }
        
        // Test open interest
        console.log('\n2. Testing open interest endpoint...');
        try {
            const oi = await axios.get(`${BASE_URL}/api/open-interest`, { timeout: 10000 });
            console.log(`   ✅ Open Interest: ${oi.status} - ${oi.data.total} records`);
        } catch (error) {
            console.log(`   ❌ Open Interest: ${error.message}`);
        }
        
        // Test stats
        console.log('\n3. Testing stats endpoint...');
        try {
            const stats = await axios.get(`${BASE_URL}/api/stats`, { timeout: 10000 });
            console.log(`   ✅ Stats: ${stats.status} - ${JSON.stringify(stats.data)}`);
        } catch (error) {
            console.log(`   ❌ Stats: ${error.message}`);
        }
        
        console.log('\n📊 Deployment test completed!');
        console.log('\n💡 If endpoints are not working, check:');
        console.log('   1. Railway deployment logs');
        console.log('   2. Environment variables (DATABASE_URL)');
        console.log('   3. Application startup');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests
testDeployment(); 