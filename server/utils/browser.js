// server/utils/browser.js
const puppeteer = require('puppeteer');

let browser = null;

async function initBrowser() {
  try {
    const launchArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ];

    try {
      const initial = await puppeteer.launch({
        headless: 'new',
        args: launchArgs,
      });
      const executablePath = initial.executablePath();
      await initial.close();

      browser = await puppeteer.launch({
        headless: 'new',
        executablePath,
        args: launchArgs,
      });
    } catch {
      browser = await puppeteer.launch({
        headless: 'new',
        args: launchArgs,
      });
    }

    console.log('Puppeteer browser initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Puppeteer browser:', error.message);
    browser = null;
    return false;
  }
}

function getBrowser() {
  return browser;
}

async function closeBrowser() {
  if (browser) {
    try {
      await browser.close();
    } catch (e) {
      console.error('Error closing browser:', e.message);
    }
    browser = null;
  }
}

module.exports = {
  initBrowser,
  getBrowser,
  closeBrowser,
};

