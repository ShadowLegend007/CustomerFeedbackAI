// server/services/scraperService.js
const axios = require('axios');
const cheerio = require('cheerio');
const { getBrowser } = require('../utils/browser');
const { normalizeUrl, autoScroll } = require('../utils/urlHelper');
const { getMockReviews } = require('./mockService');

// Helper function to fetch HTML content with Puppeteer, ScraperAPI, or direct request
async function fetchHtml(targetUrl, options = {}) {
  try {
    let html = '';
    let source = '';

    const normalizedUrl = normalizeUrl(targetUrl);
    if (!normalizedUrl) {
      throw new Error(`Invalid URL: ${targetUrl}`);
    }

    console.log(`Fetching normalized URL: ${normalizedUrl}`);

    const browser = getBrowser();

    // Try Puppeteer first if browser is available and preferPuppeteer is true
    if (browser && (options.preferPuppeteer || options.forcePuppeteer)) {
      try {
        console.log(`Fetching ${normalizedUrl} with Puppeteer`);
        const page = await browser.newPage();

        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
        );
        await page.setViewport({ width: 1280, height: 800 });

        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        });

        const timeout = options.timeout || 30000;
        await page.setDefaultNavigationTimeout(timeout);

        await page.goto(normalizedUrl, {
          waitUntil: ['load', 'domcontentloaded', 'networkidle2'],
          timeout,
        });

        if (options.extraWaitMs) {
          await new Promise((r) => setTimeout(r, options.extraWaitMs));
        }

        if (options.scroll) {
          await autoScroll(page);
        }

        html = await page.content();
        source = 'puppeteer';

        await page.close();

        console.log(
          `Successfully fetched content from ${normalizedUrl} using Puppeteer (${html.length} bytes)`
        );
        return { html, source };
      } catch (puppeteerError) {
        console.error(`Puppeteer error for ${normalizedUrl}:`, puppeteerError.message);
        if (options.forcePuppeteer) {
          throw puppeteerError;
        }
      }
    }

    // Try ScraperAPI if configured
    if (process.env.SCRAPER_API_KEY) {
      try {
        console.log(`Fetching ${normalizedUrl} with ScraperAPI`);
        const scraperUrl = `http://api.scraperapi.com?api_key=${
          process.env.SCRAPER_API_KEY
        }&url=${encodeURIComponent(normalizedUrl)}&render=true&retry=3`;
        const response = await axios.get(scraperUrl, {
          timeout: 30000,
          maxRedirects: 5,
        });

        if (response.status === 200 && response.data) {
          console.log(`Successfully fetched content from ${normalizedUrl} using ScraperAPI`);
          source = 'scraperapi';
          return { html: response.data, source };
        }
      } catch (scraperError) {
        console.error(`ScraperAPI error for ${normalizedUrl}:`, scraperError.message);
      }
    }

    // Fallback to direct HTTP request with robust headers
    console.log(`Fetching ${normalizedUrl} with direct request`);
    const response = await axios.get(normalizedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        ...options.headers,
      },
      timeout: 30000,
      maxRedirects: 5,
      ...options,
    });

    console.log(`Successfully fetched content from ${normalizedUrl} using direct request`);
    source = 'direct';
    return { html: response.data, source };
  } catch (error) {
    console.error(`Error fetching HTML from ${targetUrl}:`, error.message);
    throw error;
  }
}

// Extract product name from a URL
async function extractProductNameFromUrl(productUrl) {
  try {
    const { html } = await fetchHtml(productUrl);
    const $ = cheerio.load(html);
    const title =
      $('title').text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="title"]').attr('content') ||
      $('h1').first().text();

    return title.split('|')[0].split('-')[0].trim() || 'Unknown Product';
  } catch (error) {
    console.error('Error extracting product name:', error.message);
    return 'Unknown Product';
  }
}

// Extract content helper
function extractContent(html, xpathQuery, cheerioSelector) {
  try {
    const $ = cheerio.load(html);
    return $(cheerioSelector)
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 0);
  } catch (error) {
    console.error('Extraction error:', error.message);
    return [];
  }
}

// Scrape Amazon reviews from URL
async function scrapeAmazonReviewsFromUrl(url) {
  try {
    const { html, source } = await fetchHtml(url);
    console.log(`Got Amazon product page using ${source} method`);

    const $ = cheerio.load(html);
    const productName = $('#productTitle').text().trim();

    if (!productName) {
      console.log('Could not find product name on Amazon');
      return [];
    }

    let reviewsUrl = $(
      'a#customerReviews, a#cr-pagination-link-top, a[data-hook="see-all-reviews-link-foot"]'
    ).attr('href');

    if (!reviewsUrl) {
      console.log('No reviews link found on Amazon product page');
      return [];
    }

    if (!reviewsUrl.startsWith('http')) {
      reviewsUrl = `https://www.amazon.com${reviewsUrl}`;
    }

    const { html: reviewsHtml, source: reviewsSource } = await fetchHtml(reviewsUrl);
    console.log(`Got Amazon reviews page using ${reviewsSource} method`);

    const reviews$ = cheerio.load(reviewsHtml);
    const reviews = [];

    const reviewContainers = [
      'div[data-hook="review"]',
      'div.review',
      'div.customer-review',
      'div.review-item',
    ];

    const titleSelectors = [
      'a[data-hook="review-title"] span',
      'span.review-title',
      'h3.review-title',
    ];

    const contentSelectors = [
      'span[data-hook="review-body"] span',
      'div.review-text',
      'div.review-content',
      'p.review-text',
    ];

    const ratingSelectors = [
      'i[data-hook="review-star-rating"] span',
      'span.a-icon-alt',
      'div.review-rating',
      'span.rating',
    ];

    for (const container of reviewContainers) {
      const reviewElements = reviews$(container);
      if (reviewElements.length > 0) {
        reviewElements.each((i, elem) => {
          if (i >= 20) return false;

          let reviewTitle = '';
          for (const selector of titleSelectors) {
            const title = reviews$(elem).find(selector).text().trim();
            if (title) {
              reviewTitle = title;
              break;
            }
          }

          let reviewText = '';
          for (const selector of contentSelectors) {
            const text = reviews$(elem).find(selector).text().trim();
            if (text) {
              reviewText = text;
              break;
            }
          }

          let rating = 0;
          for (const selector of ratingSelectors) {
            const ratingText = reviews$(elem).find(selector).text().trim();
            if (ratingText) {
              const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
              rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
              break;
            }
          }

          if (reviewText) {
            reviews.push({
              title: reviewTitle,
              text: reviewText,
              rating: rating,
              source: 'Amazon',
              platform: 'Amazon',
            });
          }
        });

        if (reviews.length > 0) break;
      }
    }

    console.log(`Found ${reviews.length} Amazon reviews for "${productName}"`);
    return reviews;
  } catch (error) {
    console.error('Amazon URL scraping error:', error.message);
    return [];
  }
}

// Scrape Amazon reviews by product name
async function scrapeAmazonReviews(productName) {
  try {
    console.log(`Searching Amazon for: ${productName}`);
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`;

    const { html, source } = await fetchHtml(searchUrl, {
      preferPuppeteer: true,
      scroll: true,
    });
    console.log(`Got Amazon search results using ${source} method (${html.length} bytes)`);

    const $ = cheerio.load(html);
    let firstProductLink = null;

    const standardSelectors = [
      'a.a-link-normal.s-no-outline',
      'a.a-link-normal.s-underline-text',
      'div.sg-col-inner h2 a',
      'h2.a-size-mini a',
      'h2 a.a-link-normal',
      'div[data-component-type="s-search-result"] h2 a',
    ];

    for (const selector of standardSelectors) {
      const links = $(selector);
      if (links.length > 0) {
        links.each((i, element) => {
          const href = $(element).attr('href');
          if (href && !firstProductLink) {
            firstProductLink = href;
          }
        });
        if (firstProductLink) break;
      }
    }

    if (!firstProductLink) {
      $('a').each((i, element) => {
        const href = $(element).attr('href');
        if (
          href &&
          (href.includes('/dp/') || href.includes('/gp/product/')) &&
          !firstProductLink
        ) {
          firstProductLink = href;
        }
      });
    }

    if (!firstProductLink) {
      console.log('No products found on Amazon');
      return [];
    }

    const productUrl = firstProductLink.startsWith('http')
      ? firstProductLink
      : `https://www.amazon.com${firstProductLink}`;

    console.log(`Selected Amazon product URL: ${productUrl}`);
    return await scrapeAmazonReviewsFromUrl(productUrl);
  } catch (error) {
    console.error('Amazon scraping error:', error.message);
    return [];
  }
}

// Scrape Flipkart reviews from URL
async function scrapeFlipkartReviewsFromUrl(url) {
  try {
    const { html, source } = await fetchHtml(url);
    console.log(`Got Flipkart product page using ${source} method`);

    const $ = cheerio.load(html);
    const productName = $('span.B_NuCI').text().trim();

    if (!productName) {
      console.log('Could not find product name on Flipkart');
      return [];
    }

    let reviewsUrl = $('div._3UAT2v a').attr('href');

    if (!reviewsUrl) {
      console.log('No reviews link found on Flipkart product page');
      return [];
    }

    if (!reviewsUrl.startsWith('http')) {
      reviewsUrl = `https://www.flipkart.com${reviewsUrl}`;
    }

    const { html: reviewsHtml, source: reviewsSource } = await fetchHtml(reviewsUrl);
    console.log(`Got Flipkart reviews page using ${reviewsSource} method`);

    const reviews$ = cheerio.load(reviewsHtml);
    const reviewElements = reviews$('div._1AtVbE div._27M-vq');
    const reviews = [];

    reviewElements.each((i, elem) => {
      if (i >= 20) return false;

      const reviewTitle = reviews$(elem).find('p._2-N8zT').text().trim();
      const reviewText = reviews$(elem).find('div.t-ZTKy div div').text().trim();
      let rating = '0';

      const ratingText = reviews$(elem).find('div._3LWZlK').text().trim();
      if (ratingText) {
        rating = ratingText;
      }

      reviews.push({
        title: reviewTitle,
        text: reviewText,
        rating: parseFloat(rating),
        source: 'Flipkart',
        platform: 'Flipkart',
      });
    });

    console.log(`Found ${reviews.length} Flipkart reviews for "${productName}"`);
    return reviews;
  } catch (error) {
    console.error('Flipkart URL scraping error:', error.message);
    return [];
  }
}

// Scrape Flipkart reviews by product name
async function scrapeFlipkartReviews(productName) {
  try {
    console.log(`Searching Flipkart for: ${productName}`);
    const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(productName)}`;

    const { html, source } = await fetchHtml(searchUrl, {
      preferPuppeteer: true,
      scroll: true,
    });
    console.log(`Got Flipkart search results using ${source} method (${html.length} bytes)`);

    const $ = cheerio.load(html);
    let firstProductLink = null;

    const selectors = [
      '_1fQZEK',
      'a.IRpwTa',
      'a.s1Q9rs',
      '_2kHMtA a',
      '_4ddWXP a',
      '_13oc-S div a',
      '.r5xu7J a',
      '._2UzuFa',
    ];

    for (const selector of selectors) {
      const selectorStr = selector.includes(' ') ? selector : `.${selector}`;
      const elements = $(selectorStr);

      elements.each((i, element) => {
        const href = $(element).attr('href');
        if (href && !firstProductLink) {
          firstProductLink = href;
        }
      });

      if (firstProductLink) break;
    }

    if (!firstProductLink) {
      $('a').each((i, element) => {
        const href = $(element).attr('href');
        if (href && (href.includes('/p/') || href.includes('pid=')) && !firstProductLink) {
          firstProductLink = href;
        }
      });
    }

    if (!firstProductLink) {
      console.log('No products found on Flipkart');
      return [];
    }

    const productUrl = firstProductLink.startsWith('http')
      ? firstProductLink
      : `https://www.flipkart.com${firstProductLink}`;

    console.log(`Selected Flipkart product URL: ${productUrl}`);
    return await scrapeFlipkartReviewsFromUrl(productUrl);
  } catch (error) {
    console.error('Flipkart scraping error:', error.message);
    return [];
  }
}

// Scrape Google reviews from URL
async function scrapeGoogleReviewsFromUrl(url) {
  try {
    const { html, source } = await fetchHtml(url);
    console.log(`Got Google product page using ${source} method`);

    const $ = cheerio.load(html);
    const productName = $('h1').first().text().trim();

    if (!productName) {
      console.log('Could not find product name on Google Shopping');
      return [];
    }

    const reviewElements = $('div.dIsU3e');
    const reviews = [];

    reviewElements.each((i, elem) => {
      if (i >= 20) return false;

      const reviewText = $(elem).text().trim();
      let rating = '0';

      const ratingElement = $(elem).find('span[aria-label]');
      if (ratingElement.length) {
        const ratingText = ratingElement.attr('aria-label');
        rating = ratingText.match(/\d+(\.\d+)?/)?.[0] || '0';
      }

      reviews.push({
        title: reviewText.substring(0, 50) + '...',
        text: reviewText,
        rating: parseFloat(rating),
        source: 'Google',
        platform: 'Google',
      });
    });

    console.log(`Found ${reviews.length} Google reviews for "${productName}"`);
    return reviews;
  } catch (error) {
    console.error('Google URL scraping error:', error.message);
    return [];
  }
}

// Scrape Google reviews by product name
async function scrapeGoogleReviews(productName) {
  try {
    console.log(`Searching Google for: ${productName}`);
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      productName
    )}+reviews&tbm=shop`;

    const { html, source } = await fetchHtml(searchUrl, {
      preferPuppeteer: true,
      scroll: true,
      extraWaitMs: 2000,
    });
    console.log(`Got Google search results using ${source} method (${html.length} bytes)`);

    const $ = cheerio.load(html);
    let productLink = null;

    const selectors = [
      'a.shntl',
      'div.pla-unit-title a',
      'a[href*="shopping/product"]',
      'div.sh-dgr__content a',
      'div.sh-dlr__list-result a',
      'div.mnr-c a[href*="shopping"]',
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      elements.each((i, element) => {
        const href = $(element).attr('href');
        if (href && !productLink) {
          productLink = href;
        }
      });
      if (productLink) break;
    }

    if (!productLink) {
      return getMockReviews('Google', 6);
    }

    if (productLink.startsWith('/url?') || productLink.includes('/url?q=')) {
      try {
        const urlObj = new URL(
          `https://www.google.com${
            productLink.startsWith('/') ? productLink : '/' + productLink
          }`
        );
        const actualUrl = urlObj.searchParams.get('q');
        if (actualUrl) {
          productLink = actualUrl;
        }
      } catch (urlError) {
        console.error('Error parsing Google redirect URL:', urlError.message);
      }
    }

    const productUrl = productLink.startsWith('http')
      ? productLink
      : `https://www.google.com${productLink}`;

    try {
      const reviews = await scrapeGoogleReviewsFromUrl(productUrl);
      if (reviews && reviews.length > 0) {
        return reviews;
      }
    } catch (e) {
      console.warn('Google specialized scraper failed, falling back:', e.message);
    }

    return getMockReviews('Google', 6);
  } catch (error) {
    console.error('Google scraping error:', error.message);
    return getMockReviews('Google', 6);
  }
}

// Scrape Generic reviews from URL
async function scrapeGenericReviewsFromUrl(productUrl) {
  try {
    const { html, source } = await fetchHtml(productUrl);
    console.log(`Got generic page using ${source} method`);

    const productName = await extractProductNameFromUrl(productUrl);
    const $ = cheerio.load(html);
    const reviews = [];

    const reviewSelectors = [
      'div.review',
      'div.reviews',
      'div.customer-review',
      '.ratings-reviews',
      '[data-hook="review"]',
      '.review-item',
    ];

    for (const selector of reviewSelectors) {
      const reviewElements = $(selector);
      if (reviewElements.length > 0) {
        reviewElements.each((i, element) => {
          if (i >= 20) return false;

          const contentSelectors = [
            'p',
            'div.content',
            'div.text',
            'div.review-content',
            'div.review-text',
          ];
          let content = '';

          for (const contentSelector of contentSelectors) {
            const foundContent = $(element).find(contentSelector).text().trim();
            if (foundContent && foundContent.length > 10) {
              content = foundContent;
              break;
            }
          }

          if (content) {
            const ratingSelectors = [
              'span.rating',
              'div.rating',
              'span.stars',
              'div.stars',
            ];
            let rating = 3;

            for (const ratingSelector of ratingSelectors) {
              const ratingText = $(element).find(ratingSelector).text().trim();
              if (ratingText) {
                const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
                rating = ratingMatch ? parseFloat(ratingMatch[1]) : 3;
                break;
              }
            }

            reviews.push({
              platform: 'Generic',
              content,
              rating,
              date: new Date(),
            });
          }
        });
      }
      if (reviews.length > 0) break;
    }

    if (reviews.length === 0) {
      $('p, div').each((i, element) => {
        if (reviews.length >= 20) return false;
        const text = $(element).text().trim();
        if (text.length > 50 && text.length < 1000 && !$(element).has('p, div').length) {
          reviews.push({
            platform: 'Generic',
            content: text,
            rating: 3,
            date: new Date(),
          });
        }
      });
    }

    return {
      productName,
      reviews,
    };
  } catch (error) {
    console.error('Generic URL scraping error:', error.message);
    return {
      productName: 'Unknown Product',
      reviews: [],
    };
  }
}

module.exports = {
  fetchHtml,
  extractProductNameFromUrl,
  extractContent,
  scrapeAmazonReviews,
  scrapeAmazonReviewsFromUrl,
  scrapeFlipkartReviews,
  scrapeFlipkartReviewsFromUrl,
  scrapeGoogleReviews,
  scrapeGoogleReviewsFromUrl,
  scrapeGenericReviewsFromUrl,
};

