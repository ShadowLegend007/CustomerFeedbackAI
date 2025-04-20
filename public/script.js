// Add click ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        // Remove any existing ripple class
        this.classList.remove('clicked');
        
        // Force a DOM reflow
        void this.offsetWidth;
        
        // Add the ripple class
        this.classList.add('clicked');
        
        // Remove the class after animation
        setTimeout(() => {
            this.classList.remove('clicked');
        }, 700);
    });
});

// Global variables
let productData = null;
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? "http://localhost:5000/api" 
    : "/api"; // Use relative path for production
let currentSearchType = "name"; // Default search type

// Add a healthcheck function to verify API connection
async function checkApiConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('API connection successful:', await response.json());
            return true;
        } else {
            console.error('API health check failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('API connection error:', error);
        return false;
    }
}

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener("DOMContentLoaded", async () => {
    const searchForm = document.getElementById("search-form");
    const productNameInput = document.getElementById("product-name");
    const productUrlInput = document.getElementById("product-url");
    const nameSearchContainer = document.getElementById("name-search-container");
    const urlSearchContainer = document.getElementById("url-search-container");
    const searchTabButtons = document.querySelectorAll(".search-tab-btn");
    const tabButtons = document.querySelectorAll(".tab-btn");

    // Search type tab switching
    searchTabButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const searchType = e.target.closest('.search-tab-btn').dataset.searchType;
            searchTabButtons.forEach(btn => btn.classList.remove("active"));
            e.target.closest('.search-tab-btn').classList.add("active");
            
            if (searchType === "name") {
                nameSearchContainer.classList.remove("hidden");
                urlSearchContainer.classList.add("hidden");
                currentSearchType = "name";
                productNameInput.focus();
            } else {
                nameSearchContainer.classList.add("hidden");
                urlSearchContainer.classList.remove("hidden");
                currentSearchType = "url";
                productUrlInput.focus();
            }
        });
    });

    // Search form submission
    searchForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        if (currentSearchType === "name") {
            const productName = productNameInput.value.trim();
            
            if (!productName) {
                showError("Please enter a product name");
                return;
            }

            try {
                showLoading(productName);
                const response = await fetch(`${API_BASE_URL}/search/${encodeURIComponent(productName)}`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch results');
                }
                
                productData = data;
                displayProductAnalysis();
            } catch (error) {
                showError(`Error: ${error.message}`);
                console.error('Search error:', error);
            } finally {
                hideLoading();
            }
        } else {
            const productUrl = productUrlInput.value.trim();
            
            if (!productUrl) {
                showError("Please enter a product URL");
                return;
            }
            
            // Validate URL
            try {
                new URL(productUrl);
            } catch (e) {
                showError("Please enter a valid URL");
                return;
            }

            try {
                showLoading(productUrl);
                console.log(`Sending URL search request to: ${API_BASE_URL}/url with URL: ${productUrl}`);
                
                const response = await fetch(`${API_BASE_URL}/url`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productUrl })
                });
                
                console.log(`URL search response status: ${response.status}`);
                
                const data = await response.json();
                console.log('URL search response data:', data);
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch results');
                }
                
                productData = data;
                displayProductAnalysis();
            } catch (error) {
                console.error('URL search error details:', error);
                showError(`Error: ${error.message || 'Failed to process URL'}`);
            } finally {
                hideLoading();
            }
        }
    });

    // Improved tab switching
    tabButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default behavior
            const tabId = e.target.closest('.tab-btn').dataset.tab;
            console.log("Tab button clicked:", tabId);
            switchTab(tabId);
        });
    });

    // Add special handling for platforms tab
    const platformsTabButton = document.querySelector('.tab-btn[data-tab="platforms"]');
    if (platformsTabButton) {
        platformsTabButton.addEventListener("click", function(e) {
            // Get all elements we need to show
            const platformsTab = document.getElementById('platforms-tab');
            if (platformsTab) {
                // Force remove hidden class
                platformsTab.classList.remove('hidden');
                
                // Additional steps to ensure visibility
                platformsTab.style.display = 'block';
                
                // Log the state after our change
                console.log("Platforms tab after direct manipulation:", {
                    display: platformsTab.style.display,
                    isHidden: platformsTab.classList.contains('hidden'),
                    classList: Array.from(platformsTab.classList)
                });
                
                // Make sure platform sections are visible
                ensurePlatformTabsVisible();
            }
        });
    }

    // Check API connection
    try {
        const connected = await checkApiConnection();
        if (!connected) {
            console.warn('Backend API not available. Some features may not work.');
            // Show a warning message to the user
            const emptyState = document.getElementById('emptyState');
            if (emptyState) {
                emptyState.innerHTML = `
                    <i class="fas fa-exclamation-triangle" style="color: #FFC107;"></i>
                    <h3>Backend connection issue</h3>
                    <p>Unable to connect to the backend server. Please make sure the server is running on port 5000 or check your network connection.</p>
                    <button type="button" class="btn btn-purple" onclick="window.location.reload()">Retry Connection</button>
                `;
            }
        }
    } catch (error) {
        console.error('Error during API health check:', error);
    }
});

// Nav tabs functionality
const navLinks = document.querySelectorAll('.nav-link');
const navBtns = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');
const logo = document.querySelector('.logo');
const footerLogo = document.querySelector('.footer-logo');

function activatePage(pageId) {
    // Deactivate all pages and links
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Activate selected page and link
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`.nav-link[data-page="${pageId}"]`).classList.add('active');
}

// Logo click handlers
logo.addEventListener('click', (e) => {
    e.preventDefault();
    activatePage('home');
});

footerLogo.addEventListener('click', (e) => {
    e.preventDefault();
    activatePage('home');
    // Scroll to top when clicking footer logo
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        activatePage(pageId);
    });
});

navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = btn.getAttribute('data-page');
        activatePage(pageId);
    });
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// UI helper functions
function showLoading(searchTerm) {
    const emptyState = document.getElementById('emptyState');
    const analysisResult = document.getElementById('analysisResult');
    
    if (emptyState) emptyState.style.display = 'none';
    if (analysisResult) {
        analysisResult.style.display = 'block';
        analysisResult.innerHTML = `
            <div style="text-align: center; padding: 3rem 0;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary); margin-bottom: 1.5rem;"></i>
                <h3 style="color: white;">Analyzing reviews for "${searchTerm || 'this product'}"...</h3>
                <p style="color: var(--gray-text);">This might take a moment as we scrape data from multiple sources</p>
            </div>
        `;
    }
    
    console.log(`Loading state shown for: ${searchTerm || 'product'}`);
}

function hideLoading() {
    // Now properly implemented to clear the loading state if needed
    const spinner = document.querySelector('.fa-spinner');
    if (spinner) {
        spinner.classList.remove('fa-spin');
    }
    console.log('Loading state hidden');
}

function showError(message) {
    const emptyState = document.getElementById('emptyState');
    const analysisResult = document.getElementById('analysisResult');
    
    if (emptyState) emptyState.style.display = 'none';
    if (analysisResult) {
        analysisResult.style.display = 'block';
        analysisResult.innerHTML = `
            <div class="analyze-form" style="margin-top: 2rem;">
                <h3 class="form-title" style="color: #F44336;">Error</h3>
                <p style="color: #ddd;">${message}</p>
                <button type="button" class="btn btn-purple" onclick="window.location.reload()">Try Again</button>
            </div>
        `;
    }
    
    console.error(`Error displayed: ${message}`);
}

// Analyze button functionality
const analyzeNameBtn = document.getElementById('analyzeNameBtn');
const analyzeURLBtn = document.getElementById('analyzeURLBtn');
const searchByNameBtn = document.getElementById('searchByName');
const searchByURLBtn = document.getElementById('searchByURL');
const nameSearchForm = document.getElementById('nameSearchForm');
const urlSearchForm = document.getElementById('urlSearchForm');
const analysisResult = document.getElementById('analysisResult');
const emptyState = document.getElementById('emptyState');
const productNameInput = document.getElementById('productName');
const productURLInput = document.getElementById('productURL');

// Switch between search forms
searchByNameBtn.addEventListener('click', () => {
    searchByNameBtn.style.background = 'var(--gradient)';
    searchByNameBtn.style.border = 'none';
    searchByURLBtn.style.background = 'var(--dark)';
    searchByURLBtn.style.border = '1px solid var(--primary)';
    nameSearchForm.style.display = 'block';
    urlSearchForm.style.display = 'none';
});

searchByURLBtn.addEventListener('click', () => {
    searchByURLBtn.style.background = 'var(--gradient)';
    searchByURLBtn.style.border = 'none';
    searchByNameBtn.style.background = 'var(--dark)';
    searchByNameBtn.style.border = '1px solid var(--primary)';
    urlSearchForm.style.display = 'block';
    nameSearchForm.style.display = 'none';
});

// Connect to backend API
analyzeNameBtn.addEventListener('click', async () => {
    const productName = productNameInput.value.trim();
    
    if (productName === '') {
        alert('Please enter a product name');
        return;
    }
    
    try {
        showLoading(productName);
        
        console.log(`Sending search request to: ${API_BASE_URL}/search/${encodeURIComponent(productName)}`);
        const response = await fetch(`${API_BASE_URL}/search/${encodeURIComponent(productName)}`);
        
        if (!response.ok) {
            // Try to get error message from response
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch results');
            } catch (e) {
                throw new Error('Failed to fetch results. Server may be unavailable.');
            }
        }
        
        const data = await response.json();
        console.log('Product data received:', data);
        productData = data;
        displayAnalysisResults(productName, data);
    } catch (error) {
        console.error('Search error:', error);
        showError(`Error: ${error.message || 'Failed to analyze product. Please try again later.'}`);
    }
});

analyzeURLBtn.addEventListener('click', async () => {
    const productURL = productURLInput.value.trim();
    
    if (productURL === '') {
        alert('Please enter a product URL');
        return;
    }
    
    // Validate URL
    try {
        new URL(productURL);
    } catch (e) {
        alert('Please enter a valid URL');
        return;
    }
    
    try {
        showLoading(productURL);
        
        console.log(`Sending URL search request to: ${API_BASE_URL}/url with URL: ${productURL}`);
        const response = await fetch(`${API_BASE_URL}/url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productUrl: productURL })
        });
        
        console.log(`URL search response status: ${response.status}`);
        
        if (!response.ok) {
            // Try to get error message from response
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch results');
            } catch (e) {
                throw new Error('Failed to process URL. Server may be unavailable.');
            }
        }
        
        const data = await response.json();
        console.log('URL search response data:', data);
        productData = data;
        displayAnalysisResults(productURL, data);
    } catch (error) {
        console.error('URL search error:', error);
        showError(`Error: ${error.message || 'Failed to analyze product URL. Please try again later.'}`);
    }
});

function displayAnalysisResults(searchTerm, data) {
    if (!data || !data.analysis) {
        showError('No analysis data available');
        return;
    }

    const { analysis } = data;
    
    // Calculate percentages for sentiment
    const positivePercent = Math.round(analysis.sentiment?.positive || 0);
    const neutralPercent = Math.round(analysis.sentiment?.neutral || 0);
    const negativePercent = Math.round(analysis.sentiment?.negative || 0);
    
    // Get sample reviews - take one positive and one negative if available
    const positiveReview = data.reviews?.find(r => r.rating >= 4)?.content || 
                           data.reviews?.find(r => r.rating >= 4)?.text || 
                           `This ${data.name || searchTerm} exceeded my expectations.`;
    
    const negativeReview = data.reviews?.find(r => r.rating <= 2)?.content || 
                           data.reviews?.find(r => r.rating <= 2)?.text || 
                           `The ${data.name || searchTerm} has some issues that need to be addressed.`;
    
    // Format key topics
    let keyTopicsHTML = '';
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
        keyTopicsHTML = analysis.keyPoints.slice(0, 5).map((point, index) => 
            `<span style="background-color: ${index % 2 ? 'rgba(52, 152, 254, 0.2)' : 'rgba(142, 97, 248, 0.2)'}; 
             color: ${index % 2 ? 'var(--secondary)' : 'var(--primary)'}; 
             padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">${point}</span>`
        ).join('');
    } else {
        keyTopicsHTML = 'No key topics available';
    }
    
    // Format pros and cons
    let prosHTML = '';
    if (analysis.pros && analysis.pros.length > 0) {
        prosHTML = analysis.pros.slice(0, 3).map(pro => 
            `<li style="margin-bottom: 1rem; display: flex; align-items: start;">
                <i class="fas fa-check-circle" style="color: var(--primary); margin-right: 0.8rem; margin-top: 0.2rem;"></i>
                <span style="color: #ddd;">${pro}</span>
            </li>`
        ).join('');
    }
    
    let consHTML = '';
    if (analysis.cons && analysis.cons.length > 0) {
        consHTML = analysis.cons.slice(0, 3).map(con => 
            `<li style="margin-bottom: 1rem; display: flex; align-items: start;">
                <i class="fas fa-exclamation-circle" style="color: #F44336; margin-right: 0.8rem; margin-top: 0.2rem;"></i>
                <span style="color: #ddd;">${con}</span>
            </li>`
        ).join('');
    }
    
    // Display results with real data
    analysisResult.innerHTML = `
        <div class="analyze-form" style="margin-top: 2rem;">
            <h3 class="form-title">Analysis Results for "${data.name || searchTerm}"</h3>
            <p class="form-subtitle">Based on ${data.reviews?.length || 0} reviews from multiple sources</p>
            
            <div style="margin: 2rem 0;">
                <h4 style="color: white; margin-bottom: 1rem;">Overall Sentiment</h4>
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <div style="flex-grow: 1; background-color: #222; height: 12px; border-radius: 6px; overflow: hidden;">
                        <div style="width: ${positivePercent}%; height: 100%; background: var(--gradient);"></div>
                    </div>
                    <span style="color: white; font-weight: 600;">${positivePercent}%</span>
                </div>
                <p style="color: var(--gray-text); font-size: 0.9rem;">Positive sentiment across all reviews</p>
            </div>
            
            <div style="margin: 2rem 0;">
                <h4 style="color: white; margin-bottom: 1rem;">Key Topics</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.8rem;">
                    ${keyTopicsHTML}
                </div>
            </div>
            
            <div style="margin: 2rem 0;">
                <h4 style="color: white; margin-bottom: 1rem;">Sample Reviews</h4>
                <div style="background-color: #222; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <i class="fas fa-thumbs-up" style="color: #4CAF50; margin-right: 0.5rem;"></i>
                        <span style="color: #4CAF50; font-weight: 600;">Positive</span>
                    </div>
                    <p style="color: #ddd;">"${positiveReview}"</p>
                </div>
                <div style="background-color: #222; padding: 1.5rem; border-radius: 8px;">
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <i class="fas fa-thumbs-down" style="color: #F44336; margin-right: 0.5rem;"></i>
                        <span style="color: #F44336; font-weight: 600;">Negative</span>
                    </div>
                    <p style="color: #ddd;">"${negativeReview}"</p>
                </div>
            </div>
            
            <div>
                <h4 style="color: white; margin-bottom: 1rem;">Insights & Recommendations</h4>
                <ul style="list-style-type: none; padding: 0;">
                    ${prosHTML}
                    ${consHTML}
                </ul>
            </div>
            
            <div style="margin-top: 2rem; text-align: center;">
                <button type="button" class="btn btn-purple" onclick="window.location.reload()">
                    <i class="fas fa-search search-icon"></i>Start New Analysis
                </button>
            </div>
        </div>
    `;
}

// Contact form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-grid form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Create feedback message container if it doesn't exist
            let feedbackMessage = document.getElementById('form-feedback');
            if (!feedbackMessage) {
                feedbackMessage = document.createElement('div');
                feedbackMessage.id = 'form-feedback';
                contactForm.appendChild(feedbackMessage);
            }
            
            // Show loading state
            feedbackMessage.className = 'loading';
            feedbackMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending your message...';
            feedbackMessage.style.display = 'flex';
            feedbackMessage.style.opacity = '1';
            
            try {
                // Get form data
                const formData = new FormData(contactForm);
                
                // Submit the form using fetch
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                // Check if successful
                if (response.ok) {
                    // Success message
                    feedbackMessage.className = 'success';
                    feedbackMessage.innerHTML = '<i class="fas fa-check-circle"></i> We have received your query. We will contact you soon.';
                    
                    // Reset the form
                    contactForm.reset();
                    
                    // Add success animation
                    feedbackMessage.style.animation = 'pulse-success 2s infinite';
                    
                    // Scroll to the feedback message
                    feedbackMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Hide the message after 8 seconds
                    setTimeout(() => {
                        feedbackMessage.style.opacity = '0';
                        setTimeout(() => {
                            feedbackMessage.style.display = 'none';
                        }, 300);
                    }, 8000);
                } else {
                    throw new Error('Server responded with an error');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                
                // Error message
                feedbackMessage.className = 'error';
                feedbackMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> There was a problem sending your query. Please try again later.';
                
                // Add error animation
                feedbackMessage.style.animation = 'shake 0.5s';
            }
        });
    }
});

// Add keyframes for animations to the document
const style = document.createElement('style');
style.textContent = `
@keyframes pulse-success {
    0% {
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;
document.head.appendChild(style);