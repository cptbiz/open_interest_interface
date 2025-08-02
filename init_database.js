const { Pool } = require('pg');
require('dotenv').config();

console.log('🗄️ Initializing Open Interest Database...');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDatabase() {
    try {
        console.log('📋 Creating database tables...');
        
        const createTablesSQL = `
            -- Open Interest Table
            CREATE TABLE IF NOT EXISTS open_interest (
                id SERIAL PRIMARY KEY,
                exchange VARCHAR(50) NOT NULL,
                symbol VARCHAR(20) NOT NULL,
                open_interest DECIMAL(20,8),
                open_interest_value DECIMAL(20,8),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(exchange, symbol)
            );

            -- Funding Rates Table
            CREATE TABLE IF NOT EXISTS funding_rates (
                id SERIAL PRIMARY KEY,
                exchange VARCHAR(50) NOT NULL,
                symbol VARCHAR(20) NOT NULL,
                funding_rate DECIMAL(10,8),
                next_funding_time BIGINT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(exchange, symbol)
            );

            -- Long/Short Ratio Table
            CREATE TABLE IF NOT EXISTS long_short_ratio (
                id SERIAL PRIMARY KEY,
                exchange VARCHAR(50) NOT NULL,
                symbol VARCHAR(20) NOT NULL,
                long_ratio DECIMAL(10,8),
                short_ratio DECIMAL(10,8),
                long_short_ratio DECIMAL(10,8),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(exchange, symbol)
            );

            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_open_interest_exchange_symbol ON open_interest(exchange, symbol);
            CREATE INDEX IF NOT EXISTS idx_open_interest_timestamp ON open_interest(timestamp);
            
            CREATE INDEX IF NOT EXISTS idx_funding_rates_exchange_symbol ON funding_rates(exchange, symbol);
            CREATE INDEX IF NOT EXISTS idx_funding_rates_timestamp ON funding_rates(timestamp);
            
            CREATE INDEX IF NOT EXISTS idx_long_short_ratio_exchange_symbol ON long_short_ratio(exchange, symbol);
            CREATE INDEX IF NOT EXISTS idx_long_short_ratio_timestamp ON long_short_ratio(timestamp);
        `;

        await pool.query(createTablesSQL);
        
        console.log('✅ Database tables created successfully');
        
        // Insert sample trading pairs
        const tradingPairs = [
            'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT',
            'DOGEUSDT', 'DOTUSDT', 'AVAXUSDT', 'LTCUSDT', 'LINKUSDT',
            'BCHUSDT', 'ETCUSDT', 'UNIUSDT', 'OPUSDT', 'ARBUSDT',
            'APTUSDT', 'SUIUSDT', 'FILUSDT', 'MATICUSDT', 'SHIBUSDT'
        ];
        
        const exchanges = ['binance', 'bybit', 'okx'];
        
        console.log('📊 Inserting sample data...');
        
        for (const exchange of exchanges) {
            for (const symbol of tradingPairs) {
                // Skip some pairs for certain exchanges
                if (exchange === 'binance' && ['MATICUSDT', 'SHIBUSDT'].includes(symbol)) continue;
                if (exchange === 'bybit' && ['MATICUSDT', 'SHIBUSDT'].includes(symbol)) continue;
                
                await pool.query(`
                    INSERT INTO open_interest (exchange, symbol, open_interest, open_interest_value)
                    VALUES ($1, $2, 0, 0)
                    ON CONFLICT (exchange, symbol) DO NOTHING
                `, [exchange, symbol]);
                
                await pool.query(`
                    INSERT INTO funding_rates (exchange, symbol, funding_rate, next_funding_time)
                    VALUES ($1, $2, 0, 0)
                    ON CONFLICT (exchange, symbol) DO NOTHING
                `, [exchange, symbol]);
                
                await pool.query(`
                    INSERT INTO long_short_ratio (exchange, symbol, long_ratio, short_ratio, long_short_ratio)
                    VALUES ($1, $2, 0, 0, 0)
                    ON CONFLICT (exchange, symbol) DO NOTHING
                `, [exchange, symbol]);
            }
        }
        
        console.log('✅ Sample data inserted successfully');
        
        // Show statistics
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM open_interest) as open_interest_count,
                (SELECT COUNT(*) FROM funding_rates) as funding_rates_count,
                (SELECT COUNT(*) FROM long_short_ratio) as long_short_ratio_count
        `);
        
        console.log('📊 Database Statistics:');
        console.log(`  - Open Interest records: ${stats.rows[0].open_interest_count}`);
        console.log(`  - Funding Rates records: ${stats.rows[0].funding_rates_count}`);
        console.log(`  - Long/Short Ratio records: ${stats.rows[0].long_short_ratio_count}`);
        
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

initDatabase().then(() => {
    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Database initialization failed:', error);
    process.exit(1);
}); 