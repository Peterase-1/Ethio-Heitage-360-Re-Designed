const express = require('express');

// Test loading the educationApiRoutes
try {
    console.log('🔍 Testing educationApiRoutes import...');
    const educationApiRoutes = require('./server/routes/educationApi');
    console.log('✅ educationApiRoutes loaded successfully');
    
    // Check if it's a router
    if (educationApiRoutes && typeof educationApiRoutes === 'function') {
        console.log('✅ educationApiRoutes is a valid Express router');
    } else {
        console.log('❌ educationApiRoutes is not a valid router');
    }
    
    // Create a mock app to register the routes and see what endpoints are available
    const mockApp = express();
    mockApp.use('/api', educationApiRoutes);
    
    // Get registered routes
    const routes = [];
    function extractRoutes(middlewareStack, prefix = '') {
        middlewareStack.forEach(layer => {
            if (layer.route) {
                // Regular route
                const methods = Object.keys(layer.route.methods);
                routes.push(`${methods.join(',').toUpperCase()} ${prefix}${layer.route.path}`);
            } else if (layer.name === 'router') {
                // Router middleware
                const routerPrefix = layer.regexp.source
                    .replace('\\/', '/')
                    .replace(/^\^/, '')
                    .replace(/\$.*$/, '')
                    .replace(/\\\//g, '/');
                extractRoutes(layer.handle.stack, prefix + routerPrefix);
            }
        });
    }
    
    extractRoutes(mockApp._router.stack);
    
    console.log('\n📋 Found routes:');
    routes.forEach(route => console.log(`  ${route}`));
    
    // Check if platform/stats is in the routes
    const hasStatsRoute = routes.some(route => route.includes('platform/stats'));
    console.log(`\n🔍 Platform stats route found: ${hasStatsRoute ? '✅ YES' : '❌ NO'}`);
    
} catch (error) {
    console.error('❌ Error testing educationApiRoutes:', error.message);
    console.error(error.stack);
}
