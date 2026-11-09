// server/controllers/searchController.js
const { getCachedData, setCachedData } = require('../utils/cache');
const {
  scrapeAmazonReviews,
  scrapeFlipkartReviews,
  scrapeGoogleReviews,
} = require('../services/scraperService');
const { getMockReviews } = require('../services/mockService');
const {
  analyzeReviewsWithAI,
  generateLocalAnalysis,
} = require('../services/aiService');

async function searchProduct(req, res) {
  try {
    const productName = req.params.productName;

    // Check cache first
    const cachedData = getCachedData(productName);
    if (cachedData) {
      console.log(`Returning cached data for ${productName}`);
      return res.json(cachedData);
    }

    console.log(`Searching for reviews of ${productName}`);

    // Timeout wrapper for platform scraping
    const fetchWithTimeout = async (
      platformFn,
      productName,
      platformName,
      timeout = 45000
    ) => {
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.error(`${platformName} search timed out after ${timeout}ms`);
          resolve({ status: 'rejected', reason: 'Timeout', value: [] });
        }, timeout);
      });

      const fetchPromise = new Promise(async (resolve) => {
        try {
          const result = await platformFn(productName);
          resolve({
            status: 'fulfilled',
            value: result || [],
          });
        } catch (error) {
          console.error(`${platformName} search error:`, error.message);
          resolve({
            status: 'rejected',
            reason: error.message,
            value: [] ,
          });
        }
      });

      return Promise.race([fetchPromise, timeoutPromise]);
    };

    // Parallel search across platforms
    const results = await Promise.all([
      fetchWithTimeout(scrapeAmazonReviews, productName, 'Amazon'),
      fetchWithTimeout(scrapeFlipkartReviews, productName, 'Flipkart'),
      fetchWithTimeout(scrapeGoogleReviews, productName, 'Google'),
    ]);

    results.forEach((result, index) => {
      const platform = ['Amazon', 'Flipkart', 'Google'][index];
      if (result.status === 'fulfilled') {
        console.log(`${platform}: Found ${result.value.length} reviews`);
      } else {
        console.error(`${platform}: Failed to scrape - ${result.reason}`);
      }
    });

    let allReviews = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allReviews = [...allReviews, ...result.value];
      }
    });

    // Fallback if no reviews obtained
    if (allReviews.length === 0) {
      const fallbackReviews = [
        ...getMockReviews('Amazon', 7),
        ...getMockReviews('Flipkart', 7),
        ...getMockReviews('Google', 6),
      ];

      console.log(
        `No actual reviews found for ${productName}, using ${fallbackReviews.length} fallback reviews`
      );

      fallbackReviews.forEach((review) => {
        review.isFallback = true;
      });

      allReviews = fallbackReviews;
    }

    console.log(
      `Found a total of ${allReviews.length} review(s) for ${productName}, proceeding with analysis`
    );

    let analysis;
    try {
      analysis = await analyzeReviewsWithAI(allReviews, productName);
    } catch (analysisError) {
      console.error(`Error during AI analysis: ${analysisError.message}`);
      analysis = generateLocalAnalysis(allReviews, productName);
    }

    const responseData = {
      name: productName,
      reviews: allReviews,
      analysis: analysis,
    };

    setCachedData(productName, responseData);

    res.json(responseData);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      message: 'Error searching for product',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

module.exports = {
  searchProduct,
};

