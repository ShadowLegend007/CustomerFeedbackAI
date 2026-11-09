// server/utils/cache.js
const reviewCache = new Map();

const CACHE_TTL_MS = 3600000; // 1 hour

function getCachedData(key) {
  if (!reviewCache.has(key)) return null;

  const cached = reviewCache.get(key);
  const now = Date.now();

  if (now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Remove expired entry
  reviewCache.delete(key);
  return null;
}

function setCachedData(key, data) {
  reviewCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

module.exports = {
  reviewCache,
  getCachedData,
  setCachedData,
  CACHE_TTL_MS,
};

