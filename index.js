

// Load environment variables
require('dotenv').config();


const express = require('express');
let cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Import API routes
const apiRoutes = require('./api/routes');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());
// Mount API routes
app.use('/rgc/api', apiRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Ribshack POS System!',
        status: 'Server is running successfully'
    });
});

// Health check route
// Start the server
const server = app.listen(PORT, () => {
    console.log(`Ribshack POS Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view your application`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

// Keep the process running
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;