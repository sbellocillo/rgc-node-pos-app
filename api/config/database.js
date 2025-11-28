const { Pool } = require('pg');

// Database configuration
require('dotenv').config();

let ENVIROMENT_TYPE = "development"; // Manually Declared here to avoid undefined error


let dbConfig = {};
if (ENVIROMENT_TYPE === "production") {
    dbConfig = {
        user: process.env.PRODUCTION_DB_USER,
        host: process.env.PRODUCTION_DB_HOST,
        database: process.env.PRODUCTION_DB_NAME,
        password: process.env.PRODUCTION_DB_PASSWORD,
        port: process.env.PRODUCTION_DB_PORT || 5432,
    };
} else {
    dbConfig = {
        user: process.env.DEVEOPLPMENT_DB_USER,
        host: process.env.DEVEOPLPMENT_DB_HOST,
        database: process.env.DEVEOPLPMENT_DB_NAME,
        password: process.env.DEVEOPLPMENT_DB_PASSWORD,
        port: process.env.DEVEOPLPMENT_DB_PORT || 5432,
    };
}


// Create a new pool instance
const pool = new Pool(dbConfig);

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err.stack);
    } else {
        console.log('✅ Connected to PostgreSQL database successfully!');
        release();
    }
});

// Handle pool errors
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;