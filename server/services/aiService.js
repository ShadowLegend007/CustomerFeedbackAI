// server/services/aiService.js
const { genAI, RATE_LIMIT } = require('../config/gemini');

// Rate limiter helper function
async function rateLimit() {
  const now = Date.now();
  if (now - RATE_LIMIT.lastRequestTime > RATE_LIMIT.timeWindow) {
    RATE_LIMIT.requestCount = 0;
    RATE_LIMIT.lastRequestTime = now;
  }

  if (RATE_LIMIT.requestCount >= RATE_LIMIT.maxRequests) {
    const waitTime = RATE_LIMIT.timeWindow - (now - RATE_LIMIT.lastRequestTime);
    console.log(`Rate limit reached, waiting ${waitTime}ms`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    RATE_LIMIT.requestCount = 0;
    RATE_LIMIT.lastRequestTime = Date.now();
  }

  RATE_LIMIT.requestCount++;
}

// AI analysis function using Google Gemini
async function analyzeReviewsWithAI(reviews, productName) {
  try {
    if (!reviews || reviews.length === 0) {
      console.log('No reviews to analyze, creating default analysis');
      return {
        summary: `No reviews were found for ${productName}. Unable to provide sentiment analysis.`,
        sentiment: { positive: 0, neutral: 100, negative: 0 },
        keyPoints: ['No review data available'],
        pros: ['Insufficient data to determine pros'],
        cons: ['Insufficient data to determine cons'],
      };
    }

    console.log(`Analyzing ${reviews.length} review(s) for ${productName}`);

    const reviewTexts = reviews
      .map(
        (review) =>
          `Platform: ${review.platform || 'Unknown'}, Rating: ${
            review.rating || 'Not rated'
          }, Review: ${review.content || review.text || 'No content'}`
      )
      .join('\n\n');

    try {
      await rateLimit();

      let prompt;
      if (reviews.length === 1) {
        prompt = `You are a product review analyzer. Analyze this single review for ${productName}:

${reviewTexts}

Provide a structured analysis with the following:
1. A brief summary of the sentiment (1-2 sentences)
2. Sentiment assessment (positive, neutral, or negative)
3. Key points mentioned in the review
4. Pros mentioned or implied in the review
5. Cons mentioned or implied in the review

Format your response as a JSON object with the following structure:
{
  "summary": "Overall summary text",
  "sentiment": {
    "positive": percentage based on your assessment,
    "neutral": percentage based on your assessment,
    "negative": percentage based on your assessment
  },
  "keyPoints": ["point1", "point2", "point3"],
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"]
}

Make sure to return only the JSON object, without any additional text or explanation.`;
      } else {
        prompt = `You are a product review analyzer. Analyze these ${reviews.length} reviews for ${productName}:

${reviewTexts}

Provide a structured analysis with the following:
1. A brief summary of overall sentiment (2-3 sentences)
2. Sentiment breakdown (percentage positive, neutral, negative)
3. ${Math.min(5, reviews.length)} key points mentioned across reviews
4. Top ${Math.min(3, reviews.length)} pros of the product
5. Top ${Math.min(3, reviews.length)} cons of the product

Format your response as a JSON object with the following structure:
{
  "summary": "Overall summary text",
  "sentiment": {
    "positive": percentage,
    "neutral": percentage,
    "negative": percentage
  },
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2", "con3"]
}

Make sure to return only the JSON object, without any additional text or explanation.`;
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };

      const safetySettings = [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ];

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
      });

      const response = await result.response;
      const text = response.text();
      const jsonText = text.replace(/```json\n|\n```/g, '').trim();

      return JSON.parse(jsonText);
    } catch (apiError) {
      console.error('Gemini API error:', apiError.message);
      return generateLocalAnalysis(reviews, productName);
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return generateLocalAnalysis(reviews, productName);
  }
}

// Local analysis fallback when AI is unavailable
function generateLocalAnalysis(reviews, productName) {
  console.log('Using local analysis fallback');

  const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 3), 0);
  const avgRating = totalRating / (reviews.length || 1);

  let sentiment;
  if (avgRating >= 4) {
    sentiment = { positive: 80, neutral: 15, negative: 5 };
  } else if (avgRating >= 3) {
    sentiment = { positive: 40, neutral: 40, negative: 20 };
  } else {
    sentiment = { positive: 20, neutral: 30, negative: 50 };
  }

  const allText = reviews.map((r) => r.content || r.text || '').join(' ');
  const words = allText
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  const wordCount = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const commonWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  let summary;
  if (avgRating >= 4) {
    summary = `Overall, ${productName} has received positive feedback with an average rating of ${avgRating.toFixed(
      1
    )}. Users generally seem satisfied with their purchase.`;
  } else if (avgRating >= 3) {
    summary = `Reviews for ${productName} are mixed, with an average rating of ${avgRating.toFixed(
      1
    )}. Some users are satisfied while others have concerns.`;
  } else {
    summary = `Based on reviews, ${productName} has received mostly negative feedback with an average rating of ${avgRating.toFixed(
      1
    )}. Users have expressed several concerns.`;
  }

  return {
    summary,
    sentiment,
    keyPoints:
      commonWords.length > 0
        ? commonWords.map((word) => `Frequently mentioned: ${word}`)
        : ['Product features discussed', 'Value for money considered'],
    pros: [
      avgRating >= 4 ? 'Generally positive feedback' : 'Some positive aspects mentioned',
      'Multiple user experiences available',
      'Detailed feedback provided',
    ],
    cons: [
      avgRating < 3 ? 'Several concerns raised' : 'Some areas for improvement',
      'Mixed user experiences',
      'Varying levels of satisfaction',
    ],
  };
}

module.exports = {
  rateLimit,
  analyzeReviewsWithAI,
  generateLocalAnalysis,
};

