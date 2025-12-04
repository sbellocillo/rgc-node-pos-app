const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users');
const customerRoutes = require('./customers');
const itemRoutes = require('./items');
const roleRoutes = require('./roles');
const orderRoutes = require('./orders');
const orderItemRoutes = require('./orderItems');
const statusRoutes = require('./status');
const locationRoutes = require('./location');
const paymentMethodRoutes = require('./paymentMethod');
const orderTypeRoutes = require('./orderType');
const taxConfigRoutes = require('./taxConfig');
const itemCategoryRoutes = require('./item-categories');
const lookupRoutes = require('./lookup');
const cardNetworkRoutes = require('./cardNetworks');


// Mount routes
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/items', itemRoutes);
router.use('/roles', roleRoutes);
router.use('/orders', orderRoutes);
router.use('/order-items', orderItemRoutes);
router.use('/status', statusRoutes);
router.use('/locations', locationRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/order-types', orderTypeRoutes);
router.use('/tax-config', taxConfigRoutes);
router.use('/item-categories', itemCategoryRoutes);
router.use('/lookup', lookupRoutes);
router.use('/card-networks', cardNetworkRoutes);


// API root endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Ribshack POS API',
        version: '1.0.0',
        endpoints: {
            users: '/rgc/api/users',
            customers: '/rgc/api/customers',
            items: '/rgc/api/items',
            roles: '/rgc/api/roles',
            orders: '/rgc/api/orders',
            orderItems: '/rgc/api/order-items',
            status: '/rgc/api/status',
            locations: '/rgc/api/locations',
            paymentMethods: '/rgc/api/payment-methods',
            orderTypes: '/rgc/api/order-types',
            taxConfig: '/rgc/api/tax-config',
            itemCategories: '/rgc/api/item-categories',
            itemTypes: '/rgc/api/item-types',
            lookup: '/rgc/api/lookup',
            cardNetworks: '/rgc/api/card-networks',
            health: '/health'
        }
    });
});

module.exports = router;