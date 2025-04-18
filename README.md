# Customer Feedback Intelligence Platform

This project is a GenAI-powered Customer Feedback Intelligence Platform that helps businesses automatically analyze large volumes of customer feedback. It detects sentiment, extracts key insights, and generates intelligent response suggestions to enable faster, more empathetic replies and data-driven decisions.

## Features

- Analyze customer feedback for sentiment (Positive, Negative, Neutral)
- Extract key insights from feedback
- Generate intelligent response suggestions
- Simple web interface to submit feedback and view analysis

## Tech Stack

- Backend: Node.js with Express
- Frontend: Static HTML/JS served by Express
- AI Integration: OpenAI API (text-davinci-003)

## Setup and Run

1. Clone the repository or download the project files.

2. Install dependencies:

```bash
cd CustomerFeedbackAI
npm install
```

3. Set your OpenAI API key as an environment variable:

- On Windows (cmd):

```cmd
set OPENAI_API_KEY=your_api_key_here
```

- On Linux/macOS (bash):

```bash
export OPENAI_API_KEY=your_api_key_here
```

4. Start the server:

```bash
npm start
```

5. Open your browser and go to:

```
http://localhost:3000
```

6. Enter customer feedback in the text area and click "Analyze Feedback" to see the sentiment, key insights, and suggested response.

## Notes

- Make sure you have an active OpenAI API key.
- The backend uses the OpenAI text-davinci-003 model for analysis.
- This is a basic prototype and can be extended with authentication, database storage, and more advanced UI.

## License

MIT License
