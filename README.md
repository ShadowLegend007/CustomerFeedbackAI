# NeuraGlance

An AI-powered application that scrapes product reviews from various platforms (Amazon, Flipkart, Google Shopping, and others) and provides sentiment analysis and insights to help users make informed purchasing decisions.

## Features

- Search for products by name or URL
- Dynamic web scraping with multiple fallback methods (Puppeteer, ScraperAPI, and direct requests)
- Sentiment analysis and key points extraction using Google's Gemini API
- Modern, responsive UI with a gradient-based theme
- In-memory caching for performance optimization
- Comprehensive contact form with form validation and feedback messages

## How It Works

### Architecture

The application is built with a modern **React (Vite) + Node.js (Express)** full-stack architecture:

#### 1. Express Backend (`server/`)
Segmented cleanly into modular components:
- `server/server.js`: Main Express entry point, middleware registration, React SPA static serving, and server lifecycle.
- `server/routes/apiRoutes.js`: Express router coordinating all `/api/*` endpoints.
- `server/controllers/`: Route handlers separated by domain:
  - `healthController.js`: Backend status and connectivity checks (`/api/health`).
  - `searchController.js`: Product search by name with multi-platform scraping and AI analysis (`/api/search/:productName`).
  - `urlController.js`: Product analysis by direct e-commerce URL (`/api/url`).
  - `debugController.js`: Debug extraction and individual scraper testing (`/api/debug`, `/api/test-scraper`).
- `server/services/`: Core business logic:
  - `scraperService.js`: Web scrapers for Amazon, Flipkart, Google Shopping, and generic sites (Puppeteer, ScraperAPI, Cheerio).
  - `aiService.js`: Gemini 2.0 Flash sentiment analysis, prompt engineering, rate limiting, and local analysis fallbacks.
  - `mockService.js`: High-quality fallback reviews for robust graceful degradation.
- `server/config/`: Configuration modules:
  - `gemini.js`: Google Generative AI client initialization and rate-limit parameters.
- `server/utils/`: Shared utilities:
  - `browser.js`: Puppeteer browser lifecycle management (launch, connect, cleanup).
  - `cache.js`: In-memory review cache with TTL expiration.
  - `urlHelper.js`: URL normalization and auto-scroll helpers.

#### 2. React Frontend (`client/`)
Exact modular React implementation replicating every original design element, animation, and interaction:
- `src/components/Header.jsx`: Responsive header with hamburger drawer navigation and active page indicator.
- `src/components/HomePage.jsx`: Hero banner with gradient text, interactive feature cards, and direct navigation.
- `src/components/AnalyzePage.jsx`: Name & URL search tabs, loading animations, error state, and sentiment analysis dashboard.
- `src/components/AboutPage.jsx`: Mission/vision statement and interactive team member grid.
- `src/components/ContactPage.jsx`: Getform.io-integrated contact form with live status feedback and contact info.
- `src/components/Footer.jsx`: Bottom branding with smooth scroll-to-top interaction.
- `src/styles.css`: Complete styling preserved, including custom typography (Xeroda & Andika), glow effects, ripple animations, and pulse effects.

### Product Analysis Flow

1. **User Input**:
   - Users can search for products by name (e.g., "iPhone 15")
   - Users can also provide a direct product URL from Amazon, Flipkart, or Google

2. **Backend Processing**:
   - The application scrapes reviews from multiple sources
   - Reviews are analyzed using the Gemini API
   - Results are formatted and returned to the frontend

3. **Analysis Display**:
   - Overall sentiment with percentage visualization
   - Key topics mentioned in reviews
   - Sample positive and negative reviews
   - Product pros and cons

### Contact System

The application includes a contact form:
- Form validation ensures all required fields are completed
- Integration with getform.io for form processing
- Real-time feedback messages for form submission status

#### Getform.io Integration

The contact form uses [getform.io](https://getform.io), a form backend platform that collects, stores, and sends form submissions to your email without requiring any backend code. Here's how it works:

1. When a user submits the contact form, the data is sent directly to getform.io
2. Getform processes the submission and stores it in your dashboard
3. You receive an email notification about the new submission
4. You can view and manage all submissions from the getform.io dashboard

#### Setting Up Getform.io

To set up your own getform.io integration:

1. **Create a Getform Account**:
   - Go to [getform.io](https://getform.io) and sign up for an account
   - They offer a free tier with up to 50 submissions per month

2. **Create a Form Endpoint**:
   - From your dashboard, click "Create Form"
   - Give your form a name (e.g., "NeuraGlance Contact Form")
   - Getform will generate a unique form endpoint URL (looks like `https://getform.io/f/your-unique-id`)

3. **Update the Contact Form Endpoint**:
   - Open `client/src/components/ContactPage.jsx`
   - Locate the `fetch('https://getform.io/f/bjjmgodb', ...)` call
   - Replace the URL with your getform.io endpoint:
     ```javascript
     const response = await fetch('https://getform.io/f/your-unique-id', {
     ```

4. **Configure Form Options** (Optional):
   - From your getform.io dashboard, you can:
     - Set up email notifications
     - Add spam protection
     - Configure webhook integrations
     - Enable reCAPTCHA
     - Set up autoresponders

5. **Testing Your Form**:
   - Submit a test message through your contact form
   - Check your getform.io dashboard to confirm it was received
   - Verify you received the email notification (if configured)

The implementation in NeuraGlance already includes:
- Honeypot spam protection (hidden field that bots fill out but humans don't)
- Form validation for required fields 
- Success/error feedback messages to inform users about submission status

## Prerequisites

Before running the project, you'll need:

1. **Node.js**: Version 14 or higher
2. **NPM**: For package management
3. **Gemini API Key**: For sentiment analysis (replaces previously used OpenAI)
4. **ScraperAPI Key** (Optional): For more reliable scraping
5. **Chrome/Chromium**: Required for Puppeteer browser automation

## API Setup Guide

### Setting Up Gemini API (Required)

1. **Create a Google Cloud Account**:
   - Go to [Google Cloud](https://cloud.google.com/)
   - Sign up for an account or log in if you already have one

2. **Get Your Gemini API Key**:
   - Navigate to the [API Keys section](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the generated API key

3. **Billing Setup**:
   - Google requires a payment method for API usage beyond free tier
   - Navigate to the Billing section
   - Add a payment method
   - You can set usage limits to control costs

### Setting Up ScraperAPI (Optional but Recommended)

1. **Create a ScraperAPI Account**:
   - Go to [ScraperAPI's website](https://www.scraperapi.com/)
   - Sign up for an account

2. **Choose a Plan**:
   - ScraperAPI offers various plans, including a free tier with 1,000 API calls
   - For testing purposes, the free tier should be sufficient

3. **Get Your API Key**:
   - After signing up, you'll be taken to your dashboard
   - Your API key will be displayed on the dashboard
   - Copy this key for use in the `.env` file

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/neuraglance.git
   cd neuraglance
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   SCRAPER_API_KEY=your_scraper_api_key_here  # Optional but recommended
   PORT=5000
   ```

## Environment Variables in Detail

The application uses several environment variables to configure its behavior:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Gemini API key for review analysis |
| `SCRAPER_API_KEY` | No | Your ScraperAPI key for improved web scraping |
| `PORT` | No | The port to run the server on (default: 5000) |

## Running the Project

### Development Mode (Concurrent React + Node)
To run both the Express backend and the Vite React frontend concurrently with hot-reloading:
```bash
npm run dev
```
- Frontend available at: `http://localhost:5173` (with `/api` automatically proxied to port 5000)
- Backend API running at: `http://localhost:5000`

You can also run them in separate terminals if preferred:
```bash
# Terminal 1 - Backend:
npm run server

# Terminal 2 - Frontend:
npm run client
```

### Production Build & Serve
To build the React frontend and serve everything through Node.js Express:
```bash
# Build React app
npm run build

# Start Node server
npm start
```
Access the application at: `http://localhost:5000`

3. Use the application:
   - Search for products by name or URL
   - View the sentiment analysis, key topics, and sample reviews
   - Use the Contact form to get in touch with the team

## Recent Updates

The project has undergone several important updates:

1. **Rebranding**: Changed from "Feedback AI" to "NeuraGlance" with updated branding throughout the application.

2. **Backend Improvements**:
   - Switched from OpenAI to Google's Gemini AI for sentiment analysis
   - Enhanced error handling and recovery mechanisms
   - Improved web scraping reliability across different platforms

3. **Frontend Enhancements**:
   - Completely redesigned UI with a modern gradient-based theme
   - Added responsive design for mobile and desktop
   - Improved loading states and error messages
   - New animations and interactive elements

4. **Contact System**:
   - Added a new contact form with seamless getform.io integration
   - Implemented form validation and intuitive error handling
   - Added real-time success/error feedback messages
   - Included spam protection with honeypot fields
   - Zero backend setup required for form processing

5. **Full-Stack React + Node.js Modularization**:
   - Converted the entire frontend to React (Vite) while faithfully retaining the exact UI, styling, and animations
   - Segmented the backend into `server/` with dedicated layers for controllers, services, routes, config, and utils
   - Removed all redundant and legacy files for a clean repository structure

## Testing Your Setup

After installation, verify that all components are working correctly:

### 1. Testing the Server

Run a quick health check to ensure the server is responding:

```bash
curl http://localhost:5000/api/health
```

You should receive a response like: `{"status":"ok"}`

### 2. Testing the Gemini Integration

Try searching for a popular product to test the Gemini AI integration:

1. In the web interface, search for "iPhone 15"
2. If Gemini is configured correctly, you should see:
   - A list of reviews (either real or mock data)
   - An AI-generated analysis with sentiment, key points, pros and cons

### 3. Testing the Contact Form

1. Fill out the contact form with test data
2. Submit the form
3. You should see a success message
4. Check your getform.io dashboard to confirm the submission was received

## Troubleshooting

If you encounter issues:

1. **API Connection Problems**:
   - Check your .env configuration
   - Verify your API keys are valid
   - Check if you have billing set up for Gemini API

2. **Scraping Issues**:
   - The application has multiple fallback mechanisms
   - Check the server logs for specific error messages
   - Consider using ScraperAPI for more reliable scraping

3. **UI Problems**:
   - Clear your browser cache
   - Try a different browser
   - Check the browser console for JavaScript errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 