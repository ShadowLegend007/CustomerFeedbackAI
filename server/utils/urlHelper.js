// server/utils/urlHelper.js

function normalizeUrl(inputUrl) {
  try {
    if (!inputUrl) return null;

    let cleanUrl = inputUrl.trim();

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const urlObj = new URL(cleanUrl);
    return urlObj.toString();
  } catch (error) {
    console.error(`Error normalizing URL ${inputUrl}:`, error.message);
    return inputUrl;
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight > 10000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

module.exports = {
  normalizeUrl,
  autoScroll,
};

