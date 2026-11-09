// server/controllers/urlController.js
const urlModule = require('url');
const { getCachedData, setCachedData } = require('../utils/cache');
const {
  extractProductNameFromUrl,
  scrapeAmazonReviewsFromUrl,
  scrapeFlipkartReviewsFromUrl,
  scrapeGoogleReviewsFromUrl,
  scrapeGenericReviewsFromUrl,
} = require('../services/scraperService');
const { getMockReviews } = require('../services/mockService');
const {
  analyzeReviewsWithAI,
  generateLocalAnalysis,
} = require('../services/aiService');

async function analyzeUrl(req, res) {
  try {
    const { productUrl } = req.body;

    if (!productUrl) {
      return res.status(400).json({ message: 'Product URL is required' });
    }

    console.log(`Processing URL: ${productUrl}`);

    // Check cache
    const cachedData = getCachedData(productUrl);
    if (cachedData) {
      console.log(`Returning cached data for URL: ${productUrl}`);
      return res.json(cachedData);
    }

    let parsedUrl, hostname;
    try {
      parsedUrl = urlModule.parse(productUrl);
      hostname = parsedUrl.hostname ? parsedUrl.hostname.toLowerCase() : '';
      console.log(`Parsed URL: ${productUrl} -> hostname: ${hostname}`);
    } catch (parseError) {
      console.error(`Error parsing URL ${productUrl}:`, parseError.message);
      hostname = '';
    }

    let reviews = [];
    let productName = 'Unknown Product';

    try {
      if (hostname.includes('amazon')) {
        console.log('Identified as Amazon URL');
        productName = await extractProductNameFromUrl(productUrl);
        reviews = await scrapeAmazonReviewsFromUrl(productUrl);
      } else if (hostname.includes('flipkart')) {
        console.log('Identified as Flipkart URL');
        productName = await extractProductNameFromUrl(productUrl);
        reviews = await scrapeFlipkartReviewsFromUrl(productUrl);
      } else if (hostname.includes('google')) {
        console.log('Identified as Google URL');
        productName = await extractProductNameFromUrl(productUrl);
        reviews = await scrapeGoogleReviewsFromUrl(productUrl);
      } else {
        console.log('Using generic scraping for URL');
        const result = await scrapeGenericReviewsFromUrl(productUrl);
        productName = result.productName;
        reviews = result.reviews;
      }
    } catch (scrapeError) {
      console.error(`Error during scraping: ${scrapeError.message}`);
    }

    // Fallback if no reviews were found
    if (reviews.length === 0) {
      console.log(`No reviews found for URL: ${productUrl}, using fallback reviews`);

      let platform = 'Generic';
      if (hostname.includes('amazon')) {
        platform = 'Amazon';
      } else if (hostname.includes('flipkart')) {
        platform = 'Flipkart';
      } else if (hostname.includes('google')) {
        platform = 'Google';
      }

      if (platform === 'Generic') {
        reviews = [
          ...getMockReviews('Amazon', 7),
          ...getMockReviews('Flipkart', 7),
          ...getMockReviews('Google', 6),
        ];
      } else {
        reviews = getMockReviews(platform, 20);
      }

      reviews.forEach((review) => {
        review.isFallback = true;
      });
    }

    console.log(
      `Found a total of ${reviews.length} review(s) for URL: ${productUrl}, proceeding with analysis`
    );

    let analysis;
    try {
      analysis = await analyzeReviewsWithAI(reviews, productName);
    } catch (analysisError) {
      console.error(`Error during AI analysis: ${analysisError.message}`);
      analysis = generateLocalAnalysis(reviews, productName);
    }

    const responseData = {
      name: productName,
      url: productUrl,
      reviews: reviews,
      analysis: analysis,
    };

    setCachedData(productUrl, responseData);

    console.log(`Sending response with ${reviews.length} review(s) and analysis`);
    res.json(responseData);
  } catch (error) {
    console.error('URL processing error:', error);
    res.status(500).json({
      message: 'Error processing product URL',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

module.exports = {
  analyzeUrl,
};

