import requests
from bs4 import BeautifulSoup

def scrape_amazon_reviews(url, max_reviews=10):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    reviews = []

    for tag in soup.find_all("span", class_="a-size-base review-text review-text-content"):
        if len(reviews) >= max_reviews:
            break
        reviews.append(tag.get_text(strip=True))

    return reviews

def scrape_ebay_reviews(url, max_reviews=10):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, 'html.parser')
    reviews = []

    # eBay reviews are often in divs with class 'review-item-content'
    for tag in soup.find_all("div", class_="review-item-content"):
        if len(reviews) >= max_reviews:
            break
        reviews.append(tag.get_text(strip=True))

    return reviews

def scrape_reviews(url, max_reviews=10):
    if "amazon." in url:
        return scrape_amazon_reviews(url, max_reviews)
    elif "ebay." in url:
        return scrape_ebay_reviews(url, max_reviews)
    else:
        # Default fallback: try Amazon scraper or return empty list
        return scrape_amazon_reviews(url, max_reviews)
