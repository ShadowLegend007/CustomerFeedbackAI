import React, { useState, useEffect } from 'react';

const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // If running under Vite dev server (e.g. 5173), proxy handles /api
    // If directly accessed, fallback to localhost:5000/api if needed
    return window.location.port === '5000' || window.location.port === '5173'
      ? '/api'
      : 'http://localhost:5000/api';
  }
  return '/api';
};

export default function AnalyzePage() {
  const [searchMode, setSearchMode] = useState('name'); // 'name' | 'url'
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [backendIssue, setBackendIssue] = useState(false);

  // Check health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/health`);
      if (res.ok) {
        setBackendIssue(false);
      } else {
        setBackendIssue(true);
      }
    } catch {
      // Don't show hard error unless health check fails on user action
      console.warn('Backend connection health check did not respond.');
    }
  };

  const handleNameSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = productName.trim();
    if (!query) {
      alert('Please enter a product name');
      return;
    }

    setCurrentSearchTerm(query);
    setLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/search/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch results');
      }
      setAnalysisData(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to analyze product. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e) => {
    if (e) e.preventDefault();
    const url = productUrl.trim();
    if (!url) {
      alert('Please enter a product URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    setCurrentSearchTerm(url);
    setLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to process URL');
      }
      setAnalysisData(data);
    } catch (err) {
      console.error('URL search error:', err);
      setError(err.message || 'Failed to analyze product URL. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProductName('');
    setProductUrl('');
    setCurrentSearchTerm('');
    setError(null);
    setAnalysisData(null);
    setLoading(false);
  };

  // Calculations for results display
  const analysis = analysisData?.analysis;
  const positivePercent = Math.round(analysis?.sentiment?.positive || 0);

  const positiveReview =
    analysisData?.reviews?.find((r) => r.rating >= 4)?.content ||
    analysisData?.reviews?.find((r) => r.rating >= 4)?.text ||
    `This ${analysisData?.name || currentSearchTerm} exceeded my expectations.`;

  const negativeReview =
    analysisData?.reviews?.find((r) => r.rating <= 2)?.content ||
    analysisData?.reviews?.find((r) => r.rating <= 2)?.text ||
    `The ${analysisData?.name || currentSearchTerm} has some issues that need to be addressed.`;

  return (
    <div className="page active" id="analyze">
      <h1 className="section-title">Product Review Analysis</h1>
      <p>
        Enter a product name below and our AI will analyze reviews to provide
        valuable insights about customer sentiment, common issues, and standout
        features.
      </p>

      <div className="analyze-form">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <button
            id="searchByName"
            type="button"
            className="btn btn-purple"
            style={{
              background:
                searchMode === 'name' ? 'var(--gradient)' : 'var(--dark)',
              border:
                searchMode === 'name' ? 'none' : '1px solid var(--primary)',
            }}
            onClick={() => setSearchMode('name')}
          >
            <i className="fas fa-search search-icon"></i>Search by Name
          </button>
          <button
            id="searchByURL"
            type="button"
            className="btn btn-purple"
            style={{
              background:
                searchMode === 'url' ? 'var(--gradient)' : 'var(--dark)',
              border:
                searchMode === 'url' ? 'none' : '1px solid var(--primary)',
            }}
            onClick={() => setSearchMode('url')}
          >
            <i className="fas fa-link search-icon"></i>Search by URL
          </button>
        </div>

        {searchMode === 'name' ? (
          <form
            id="nameSearchForm"
            className="search-form active"
            onSubmit={handleNameSubmit}
          >
            <h3 className="form-title">Analyze Product Reviews</h3>
            <p className="form-subtitle">
              Get comprehensive feedback analysis for any product
            </p>

            <div className="form-group">
              <label htmlFor="productName">Product Name</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="productName"
                  placeholder="Enter a product name (e.g., iPhone 15, Sony WH-1000XM5)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-purple"
                  id="analyzeNameBtn"
                >
                  <i className="fas fa-search search-icon"></i>Analyze
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form
            id="urlSearchForm"
            className="search-form"
            onSubmit={handleUrlSubmit}
          >
            <h3 className="form-title">Analyze by URL</h3>
            <p className="form-subtitle">
              Enter product URL from Amazon, Flipkart, or Google
            </p>

            <div className="form-group">
              <label htmlFor="productURL">Product URL</label>
              <div className="input-with-button">
                <input
                  type="text"
                  id="productURL"
                  placeholder="Enter product URL (e.g., https://www.amazon.com/...)"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-purple"
                  id="analyzeURLBtn"
                >
                  <i className="fas fa-search search-icon"></i>Analyze
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Backend connection warning if detected */}
      {backendIssue && !loading && !analysisData && !error && (
        <div className="empty-state">
          <i
            className="fas fa-exclamation-triangle"
            style={{ color: '#FFC107' }}
          ></i>
          <h3>Backend connection issue</h3>
          <p>
            Unable to connect to the backend server. Please make sure the server
            is running on port 5000 or check your network connection.
          </p>
          <button
            type="button"
            className="btn btn-purple"
            onClick={checkHealth}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div id="analysisResult" style={{ display: 'block' }}>
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <i
              className="fas fa-spinner fa-spin"
              style={{
                fontSize: '3rem',
                color: 'var(--primary)',
                marginBottom: '1.5rem',
              }}
            ></i>
            <h3 style={{ color: 'white' }}>
              Analyzing reviews for "{currentSearchTerm || 'this product'}"...
            </h3>
            <p style={{ color: 'var(--gray-text)' }}>
              This might take a moment as we scrape data from multiple sources
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div id="analysisResult" style={{ display: 'block' }}>
          <div className="analyze-form" style={{ marginTop: '2rem' }}>
            <h3 className="form-title" style={{ color: '#F44336' }}>
              Error
            </h3>
            <p style={{ color: '#ddd' }}>{error}</p>
            <button
              type="button"
              className="btn btn-purple"
              onClick={handleReset}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisData && !loading && (
        <div id="analysisResult" style={{ display: 'block' }}>
          <div className="analyze-form" style={{ marginTop: '2rem' }}>
            <h3 className="form-title">
              Analysis Results for "{analysisData.name || currentSearchTerm}"
            </h3>
            <p className="form-subtitle">
              Based on {analysisData.reviews?.length || 0} reviews from multiple
              sources
            </p>

            <div style={{ margin: '2rem 0' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>
                Overall Sentiment
              </h4>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem',
                }}
              >
                <div
                  style={{
                    flexGrow: 1,
                    backgroundColor: '#222',
                    height: '12px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${positivePercent}%`,
                      height: '100%',
                      background: 'var(--gradient)',
                      transition: 'width 0.8s ease-in-out',
                    }}
                  ></div>
                </div>
                <span style={{ color: 'white', fontWeight: 600 }}>
                  {positivePercent}%
                </span>
              </div>
              <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem' }}>
                Positive sentiment across all reviews
              </p>
            </div>

            <div style={{ margin: '2rem 0' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>
                Key Topics
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {analysis?.keyPoints && analysis.keyPoints.length > 0 ? (
                  analysis.keyPoints.slice(0, 5).map((point, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor:
                          index % 2
                            ? 'rgba(52, 152, 254, 0.2)'
                            : 'rgba(142, 97, 248, 0.2)',
                        color:
                          index % 2 ? 'var(--secondary)' : 'var(--primary)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                      }}
                    >
                      {point}
                    </span>
                  ))
                ) : (
                  <span>No key topics available</span>
                )}
              </div>
            </div>

            <div style={{ margin: '2rem 0' }}>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>
                Sample Reviews
              </h4>
              <div
                style={{
                  backgroundColor: '#222',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <i
                    className="fas fa-thumbs-up"
                    style={{ color: '#4CAF50', marginRight: '0.5rem' }}
                  ></i>
                  <span style={{ color: '#4CAF50', fontWeight: 600 }}>
                    Positive
                  </span>
                </div>
                <p style={{ color: '#ddd' }}>"{positiveReview}"</p>
              </div>
              <div
                style={{
                  backgroundColor: '#222',
                  padding: '1.5rem',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <i
                    className="fas fa-thumbs-down"
                    style={{ color: '#F44336', marginRight: '0.5rem' }}
                  ></i>
                  <span style={{ color: '#F44336', fontWeight: 600 }}>
                    Negative
                  </span>
                </div>
                <p style={{ color: '#ddd' }}>"{negativeReview}"</p>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>
                Insights & Recommendations
              </h4>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {analysis?.pros &&
                  analysis.pros.slice(0, 3).map((pro, idx) => (
                    <li
                      key={`pro-${idx}`}
                      style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                      }}
                    >
                      <i
                        className="fas fa-check-circle"
                        style={{
                          color: 'var(--primary)',
                          marginRight: '0.8rem',
                          marginTop: '0.2rem',
                        }}
                      ></i>
                      <span style={{ color: '#ddd' }}>{pro}</span>
                    </li>
                  ))}
                {analysis?.cons &&
                  analysis.cons.slice(0, 3).map((con, idx) => (
                    <li
                      key={`con-${idx}`}
                      style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                      }}
                    >
                      <i
                        className="fas fa-exclamation-circle"
                        style={{
                          color: '#F44336',
                          marginRight: '0.8rem',
                          marginTop: '0.2rem',
                        }}
                      ></i>
                      <span style={{ color: '#ddd' }}>{con}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-purple"
                onClick={handleReset}
              >
                <i className="fas fa-search search-icon"></i>Start New Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !analysisData && !error && !backendIssue && (
        <div className="empty-state" id="emptyState">
          <i className="fas fa-search"></i>
          <h3>Enter product details to begin</h3>
          <p>
            Once you submit a product name or URL, our AI will analyze reviews
            from multiple sources to provide comprehensive insights.
          </p>
        </div>
      )}

      <div
        style={{
          textAlign: 'center',
          marginTop: '4rem',
          padding: '2rem 0',
          borderTop: '1px solid #222',
        }}
      >
        <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem' }}>
          Powered by NeuraGlance © 2025
        </p>
      </div>
    </div>
  );
}

