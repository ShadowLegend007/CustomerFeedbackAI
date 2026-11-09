// server/config/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini client with v1 API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '', {
  apiVersion: 'v1',
});

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 3,
  timeWindow: 60000, // 1 minute
  lastRequestTime: 0,
  requestCount: 0,
};

module.exports = {
  genAI,
  RATE_LIMIT,
};

