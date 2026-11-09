// server/services/mockService.js

const mockData = {
  Amazon: [
    {
      content:
        'Great product, very satisfied with the purchase. The quality is excellent and it exceeded my expectations in every way.',
      rating: 5,
      date: new Date(),
    },
    {
      content:
        'Decent quality but a bit overpriced compared to similar items. Works well enough but I expected better for the price.',
      rating: 3,
      date: new Date(),
    },
    {
      content:
        'The product arrived damaged and customer service was unhelpful. Had to return it and the process was frustrating.',
      rating: 1,
      date: new Date(),
    },
    {
      content:
        'Amazing product and fast shipping! Would definitely recommend to anyone considering this purchase.',
      rating: 5,
      date: new Date(),
    },
    {
      content:
        'Product works exactly as described. No complaints so far after several weeks of use.',
      rating: 4,
      date: new Date(),
    },
    {
      content:
        'Instructions were confusing and setup was difficult. Once I got it working, the performance was okay.',
      rating: 3,
      date: new Date(),
    },
    {
      content:
        'Not worth the money at all. Poor build quality and stopped working after just a few uses.',
      rating: 2,
      date: new Date(),
    },
  ],
  Flipkart: [
    {
      content:
        'Good value for money, fast delivery. The packaging was secure and the product was exactly as shown in pictures.',
      rating: 4,
      date: new Date(),
    },
    {
      content:
        'Product broke after two weeks of use. Very disappointed with the durability.',
      rating: 1,
      date: new Date(),
    },
    {
      content:
        'Excellent product with great features. This is the best version of this product I have used so far.',
      rating: 5,
      date: new Date(),
    },
    {
      content:
        'The product is fine but delivery took longer than expected. Flipkart should improve their shipping times.',
      rating: 3,
      date: new Date(),
    },
    {
      content:
        'Perfect product for my needs. Easy to use and very efficient. Would buy again from this seller.',
      rating: 5,
      date: new Date(),
    },
    {
      content:
        'Not as described in the product details. The color is different and some features are missing.',
      rating: 2,
      date: new Date(),
    },
    {
      content:
        'Average product for the price. There are better alternatives available but this works fine for basic use.',
      rating: 3,
      date: new Date(),
    },
  ],
  Google: [
    {
      content:
        'Excellent customer service and product quality. The company really cares about their customers.',
      rating: 5,
      date: new Date(),
    },
    {
      content:
        'Average product, nothing special but works as advertised. No major issues to report.',
      rating: 3,
      date: new Date(),
    },
    {
      content:
        'Would recommend to friends, good quality for the price. It has been reliable so far in my daily use.',
      rating: 4,
      date: new Date(),
    },
    {
      content:
        'Product design is sleek and modern. Performance is consistently good across all features.',
      rating: 5,
      date: new Date(),
    },
    {
      content:
        'Battery life is disappointing compared to what was advertised. Otherwise functions well.',
      rating: 3,
      date: new Date(),
    },
    {
      content:
        'Poor customer support when I had issues. Was on hold for hours and problem still not resolved.',
      rating: 2,
      date: new Date(),
    },
  ],
};

function getMockReviews(platform = 'Amazon', count = 3) {
  const normalizedPlatform =
    platform === 'Amazon' || platform === 'Flipkart' || platform === 'Google'
      ? platform
      : 'Amazon';

  const list = mockData[normalizedPlatform] || mockData.Amazon;

  return list.slice(0, count).map((review) => ({
    platform: normalizedPlatform,
    ...review,
    isFallback: true,
  }));
}

module.exports = {
  mockData,
  getMockReviews,
};

