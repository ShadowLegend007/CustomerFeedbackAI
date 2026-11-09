// server/server.js - Express backend for NeuraGlance
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { initBrowser, closeBrowser } = require('./utils/browser');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Static assets from React client build
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`Serving static files from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
}

// SPA fallback for all non-API GET requests
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }
  if (req.path.startsWith('/api')) {
    return next();
  }

  const clientDistIndex = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(clientDistIndex)) {
    return res.sendFile(clientDistIndex);
  }
  next();
});

// Close Puppeteer browser on process shutdown
process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit();
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit();
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log('======================================');
    console.log('Starting NeuraGlance Server');
    console.log('======================================');

    const browserInitialized = await initBrowser();
    if (!browserInitialized) {
      console.warn(
        'Warning: Puppeteer browser initialization failed. The application will continue without browser-based scraping.'
      );
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Application available at http://localhost:${PORT}`);
      console.log('\nScraping capabilities:');
      if (browserInitialized) console.log('✓ Puppeteer (browser-based scraping)');
      else console.log('✗ Puppeteer (not available)');

      if (process.env.SCRAPER_API_KEY) console.log('✓ ScraperAPI (API-based scraping)');
      else console.log('✗ ScraperAPI (not configured)');

      console.log('✓ Direct requests (fallback scraping)');
      console.log('------------------------------------------------');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();

module.exports = app;

