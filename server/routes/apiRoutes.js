// server/routes/apiRoutes.js
const express = require('express');
const router = express.Router();

const { getHealth } = require('../controllers/healthController');
const { searchProduct } = require('../controllers/searchController');
const { analyzeUrl } = require('../controllers/urlController');
const { debugPage, testScraper } = require('../controllers/debugController');

// Health check
router.get('/health', getHealth);

// Product search by name
router.get('/search/:productName', searchProduct);

// Product search by URL
router.post('/url', analyzeUrl);

// Debug endpoint
router.post('/debug', debugPage);

// Test scraper endpoint
router.get('/test-scraper', testScraper);

module.exports = router;

