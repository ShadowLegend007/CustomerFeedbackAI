import React from 'react';

export default function Footer({ onNavigate }) {
  const handleLogoClick = (e) => {
    e.preventDefault();
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div
            className="footer-logo"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
          >
            NeuraGlance
          </div>
          <p>Turning reviews into clear, actionable insights</p>
          <p className="copyright">© 2025 NeuraGlance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

