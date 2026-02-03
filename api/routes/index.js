const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health');
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
const layoutRoutes = require('./layout');
const layoutIndices = require('./layoutIndices');
const layoutPosTerminal = require('./layoutPosTerminal');
const layoutTemplateRoutes = require('./layoutTemplates'); 
const posTerminalRoutes = require('./posTerminals');
const syncRoutes = require('./sync');

// Mount routes
router.use('/health', healthRoutes);
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
router.use('/layouts', layoutRoutes); 
router.use('/layout-indices', layoutIndices);
router.use('/layout-pos-terminal', layoutPosTerminal);
router.use('/layout-templates', layoutTemplateRoutes);
router.use('/pos-terminals', posTerminalRoutes); 
router.use('/sync', syncRoutes)

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
            lookup: '/rgc/api/lookup',
            cardNetworks: '/rgc/api/card-networks',
            layouts: '/rgc/api/layouts',  
            layoutIndices: '/rgc/api/layout-indices',
            layoutPosTerminal: '/rgc/api/layout-pos-terminal',
            layoutTemplates: '/rgc/api/layout-templates', 
            posTerminals: '/rgc/api/pos-terminals',
            sync: '/rgc/api/sync',
            health: '/health'
        }
    });
});

module.exports = router;