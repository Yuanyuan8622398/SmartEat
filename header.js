document.addEventListener("DOMContentLoaded", () => {
    initializeHeader();
    waitForFirebase();
});

function initializeHeader() {
    if (document.querySelector('.banner')) return;
    
    const headerHTML = `
        <div class="banner">
            <div class="logo-area">
                <a href="index.html">
                    <img class="logo" src="/picture/logo.png" alt="SmartEat Logo">
                    <span class="brand">SmartEat</span>
                </a>
            </div>
            
            <div class="nav-links">
                <a href="main.html">Home</a>
                
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle">Features ▼</a>
                    <div class="dropdown-menu">
                        <a href="scan.html" class="dropdown-item">📷 Smart Scan</a>
                        <a href="googleMap.html" class="dropdown-item">🗺️ Nearby Maps</a>
                        <a href="recommendedFood.html" class="dropdown-item">🥗 Recommended Food</a>
                    </div>
                </div>
                
                <a href="#about">About Us</a>
                
                <div id="authSection" style="display: inline-block;"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    
    const footerHTML = `
        <footer class="smart-footer">
            <div class="footer-container">
                <div class="footer-section">
                    <h4>SmartEat</h4>
                    <p>Making healthy eating simple, smart, and accessible for everyone.</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <a href="main.html">Home</a>
                    <a href="scan.html">Smart Scan</a>
                    <a href="googleMap.html">Nearby Maps</a>
                    <a href="recommendedFood.html">Recommended Food</a>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <a href="#">FAQ</a>
                    <a href="#">Contact</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                </div>
                <div class="footer-section">
                    <h4>Connect</h4>
                    <a href="#">Twitter</a>
                    <a href="#">Instagram</a>
                    <a href="#">Facebook</a>
                </div>
            </div>
            <div class="footer-bottom">
                © 2024 SmartEat. All rights reserved.
            </div>
        </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

function waitForFirebase() {
    if (typeof firebase === 'undefined') {
        setTimeout(waitForFirebase, 100);
        return;
    }
    
    console.log("Firebase loaded, checking current user...");
    const auth = firebase.auth();
    
    checkCurrentUser();
    auth.onAuthStateChanged(user => {
        console.log("Auth state changed:", user ? `✅ Logged in as ${user.email}` : "❌ Logged out");
        updateAuthUI(user);
    });
    
    setTimeout(checkCurrentUser, 500);
    setTimeout(checkCurrentUser, 1000);
}

function checkCurrentUser() {
    if (typeof firebase === 'undefined') return;
    
    const auth = firebase.auth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
        console.log("✅ Current user detected in check:", currentUser.email);
        updateAuthUI(currentUser);
    }
}

function updateAuthUI(user) {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const noAuthPages = ['index.html', 'login.html', 'profile.html'];
    
    if (noAuthPages.includes(currentPage)) {
        authSection.innerHTML = '';
        return;
    }
    
    if (user) {
        console.log("🔵 Showing profile emoji for:", user.email);
        authSection.innerHTML = `
            <a href="profile.html" class="profile-emoji-link" title="${user.email}">
                👤
            </a>
        `;
    } else {
        console.log("🟢 Showing login button");
        authSection.innerHTML = `
            <a href="login.html" class="login-btn-header">Login</a>
        `;
    }
}