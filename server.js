const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// OpenAI configuration - set your API key here or use environment variable OPENAI_API_KEY
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
});
const openai = new OpenAIApi(configuration);

// Endpoint to analyze customer feedback
app.post('/analyze-feedback', async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!feedback) {
      return res.status(400).json({ error: 'Feedback text is required' });
    }

    // Compose prompt for sentiment analysis, key insights, and response suggestion
    const prompt = `
You are a customer feedback analysis assistant.
Analyze the following customer feedback and provide:
1. Sentiment (Positive, Negative, Neutral)
2. Key insights (brief bullet points)
3. Suggested intelligent response to the customer.

Feedback:
"""${feedback}"""

Response format:
Sentiment: <sentiment>
Key Insights:
- <insight 1>
- <insight 2>
Suggested Response: <response>
`;

    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.7,
    });

    const analysis = completion.data.choices[0].text.trim();
    res.json({ analysis });
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    res.status(500).json({ error: 'Failed to analyze feedback' });
  }
});

// Serve frontend files
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Customer Feedback AI server running at http://localhost:${port}`);
});
