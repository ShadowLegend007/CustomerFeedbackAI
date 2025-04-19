from flask import Flask, render_template, request, jsonify
from scraper import scrape_reviews
from sentiment import analyze_sentiment, extract_key_insights, generate_response_suggestion
from collections import Counter
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Optional, only if you're calling API externally

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    company_url = request.json.get('company_url')
    product_url = request.json.get('product_url')
    if not product_url:
        return jsonify({'error': 'Missing product URL'}), 400

    # For now, only product_url is used for scraping
    reviews = scrape_reviews(product_url)
    result = []
    all_feedback_text = ""
    sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}

    for review in reviews:
        sentiment = analyze_sentiment(review)
        # Adjust sentiment to lowercase keys for frontend
        sentiment_lower = sentiment.lower() if sentiment in ['Positive', 'Negative'] else 'neutral'
        sentiment_counts[sentiment_lower] = sentiment_counts.get(sentiment_lower, 0) + 1
        result.append({'review': review, 'sentiment': sentiment})
        all_feedback_text += review + "\n"

    key_insights = extract_key_insights(all_feedback_text)
    response_suggestion = generate_response_suggestion(all_feedback_text)

    return jsonify({
        'sentiment_counts': sentiment_counts,
        'reviews': result,
        'key_insights': key_insights,
        'response_suggestion': response_suggestion
    })

if __name__ == '__main__':
    app.run(debug=True)
