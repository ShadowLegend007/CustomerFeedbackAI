import React from 'react';

export default function Header({ currentPage, onNavigate, mobileMenuOpen, setMobileMenuOpen }) {
  const handleNavClick = (page) => (e) => {
    e.preventDefault();
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header>
      <div className="container">
        <div className="header-content">
          <a
            href="#"
            className="logo"
            onClick={handleNavClick('home')}
          >
            NeuraGlance
          </a>
          <div
            className="menu-toggle"
            id="menuToggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <nav>
            <ul id="navMenu" className={mobileMenuOpen ? 'active' : ''}>
              <li>
                <a
                  href="#"
                  className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                  onClick={handleNavClick('home')}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`nav-link ${currentPage === 'analyze' ? 'active' : ''}`}
                  onClick={handleNavClick('analyze')}
                >
                  Analyze
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
                  onClick={handleNavClick('about')}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
                  onClick={handleNavClick('contact')}
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

