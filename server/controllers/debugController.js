// server/controllers/debugController.js
const cheerio = require('cheerio');
const {
  fetchHtml,
  scrapeAmazonReviews,
  scrapeFlipkartReviews,
  scrapeGoogleReviews,
} = require('../services/scraperService');

async function debugPage(req, res) {
  try {
    const { url, selector, action } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Debug request: ${action || 'fetch'} ${url} ${selector || ''}`);

    if (!action || action === 'fetch') {
      const { html, source } = await fetchHtml(url, {
        preferPuppeteer: true,
        scroll: true,
        extraWaitMs: 2000,
      });

      return res.json({
        success: true,
        source,
        htmlLength: html.length,
        htmlPreview: html.substring(0, 1000) + '...',
        fullUrl: url,
      });
    }

    if (action === 'extract' && selector) {
      const { html, source } = await fetchHtml(url, { preferPuppeteer: true });
      const $ = cheerio.load(html);

      const elements = $(selector);
      const results = [];

      elements.each((i, el) => {
        if (i < 10) {
          results.push({
            text: $(el).text().trim(),
            html: $(el).html(),
            attrs: $(el).attr(),
          });
        }
      });

      return res.json({
        success: true,
        source,
        selector,
        count: elements.length,
        results,
        fullUrl: url,
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

async function testScraper(req, res) {
  try {
    const { platform, query } = req.query;

    if (!platform || !query) {
      return res
        .status(400)
        .json({ error: 'Platform and query parameters are required' });
    }

    console.log(`Testing ${platform} scraper with query: ${query}`);

    let result;
    const startTime = Date.now();

    switch (platform.toLowerCase()) {
      case 'amazon':
        result = await scrapeAmazonReviews(query);
        break;
      case 'flipkart':
        result = await scrapeFlipkartReviews(query);
        break;
      case 'google':
        result = await scrapeGoogleReviews(query);
        break;
      default:
        return res
          .status(400)
          .json({ error: 'Invalid platform. Use "amazon", "flipkart", or "google"' });
    }

    const duration = Date.now() - startTime;

    return res.json({
      platform,
      query,
      duration: `${duration}ms`,
      reviewCount: result.length,
      reviews: result.slice(0, 3),
      hasMockData: result.some((r) => r.isFallback),
    });
  } catch (error) {
    console.error('Test scraper error:', error);
    return res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

module.exports = {
  debugPage,
  testScraper,
};

