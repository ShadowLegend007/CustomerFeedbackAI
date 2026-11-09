import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './components/HomePage.jsx';
import AnalyzePage from './components/AnalyzePage.jsx';
import AboutPage from './components/AboutPage.jsx';
import ContactPage from './components/ContactPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Button click ripple effect - faithful to original script.js
  useEffect(() => {
    const handleBtnRipple = (e) => {
      const button = e.target.closest('.btn');
      if (!button) return;

      button.classList.remove('clicked');
      void button.offsetWidth; // Force reflow
      button.classList.add('clicked');

      setTimeout(() => {
        button.classList.remove('clicked');
      }, 700);
    };

    document.addEventListener('click', handleBtnRipple);
    return () => {
      document.removeEventListener('click', handleBtnRipple);
    };
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Header
        currentPage={currentPage}
        onNavigate={navigateTo}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main>
        <div className="container">
          {currentPage === 'home' && <HomePage onNavigate={navigateTo} />}
          {currentPage === 'analyze' && <AnalyzePage />}
          {currentPage === 'about' && <AboutPage />}
          {currentPage === 'contact' && <ContactPage />}
        </div>
      </main>
      <Footer onNavigate={navigateTo} />
    </>
  );
}

