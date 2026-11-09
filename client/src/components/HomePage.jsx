import React from 'react';

export default function HomePage({ onNavigate }) {
  const handleNav = (page) => (e) => {
    e.preventDefault();
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page active" id="home">
      <div className="hero">
        <h1 className="gradient-title">Welcome to NeuraGlance</h1>
      </div>
      <div className="features">
        <div className="feature-card purple" onClick={handleNav('about')}>
          <h3>Innovative Design</h3>
          <p className="subtitle">Smart Design That Just Feels Right</p>
          <p>
            Our interface is fast, flexible, and easy to use. Because a great
            experience should never slow you down.
          </p>
          <a
            href="#"
            className="btn btn-purple nav-btn"
            onClick={handleNav('about')}
          >
            Learn More
          </a>
        </div>
        <div className="feature-card blue" onClick={handleNav('analyze')}>
          <h3>Powerful Analysis</h3>
          <p className="subtitle">Data-driven insights at your fingertips</p>
          <p>
            Identify patterns, sentiments, and recurring themes with ease. Our
            analytics empower smarter, faster product choices.
          </p>
          <a
            href="#"
            className="btn btn-purple nav-btn"
            onClick={handleNav('analyze')}
          >
            Explore Analytics
          </a>
        </div>
        <div className="feature-card purple" onClick={handleNav('contact')}>
          <h3>Expert Support</h3>
          <p className="subtitle">You've Got Questions, We've Got Insight</p>
          <p>
            We turn feedback into insight and insight into help. Get expert
            answers, fast and personalized.
          </p>
          <a
            href="#"
            className="btn btn-purple nav-btn"
            onClick={handleNav('contact')}
          >
            Contact Us
          </a>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <a
          href="#"
          className="btn btn-purple nav-btn"
          onClick={handleNav('analyze')}
          style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
        >
          Get Started Today
        </a>
      </div>
    </div>
  );
}

