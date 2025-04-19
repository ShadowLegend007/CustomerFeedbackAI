import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def analyze_sentiment(text):
    prompt = f"Classify the following customer feedback as Positive or Negative:\n\n{text}\n\nSentiment:"
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            temperature=0,
            max_tokens=10
        )
        sentiment = response.choices[0].text.strip()
        return "Positive" if "Positive" in sentiment else "Negative"
    except:
        return "Unknown"

def extract_key_insights(text):
    prompt = f"Extract key insights from the following customer feedback. Provide concise bullet points:\n\n{text}\n\nInsights:"
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            temperature=0.3,
            max_tokens=150,
            stop=["\n\n"]
        )
        insights = response.choices[0].text.strip()
        return insights
    except:
        return "No insights available."

def generate_response_suggestion(text):
    prompt = f"Based on the following customer feedback, generate a polite and empathetic response suggestion:\n\n{text}\n\nResponse:"
    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            temperature=0.7,
            max_tokens=150,
            stop=["\n\n"]
        )
        suggestion = response.choices[0].text.strip()
        return suggestion
    except:
        return "No response suggestion available."
