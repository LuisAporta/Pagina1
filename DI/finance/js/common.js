// Common Logic & Initialization

// 1. Supabase Initialization
// Use a distinct global variable to avoid conflict with the CDN library 'supabase'
window.sbClient = null;

if (typeof supabase !== 'undefined' && typeof CONFIG !== 'undefined') {
    if (CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
        window.sbClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log("Supabase Client initialized as window.sbClient");
    } else {
        console.warn("Supabase credentials not set in config.js");
    }
} else {
    console.error("Supabase library or Config not loaded");
}

// 2. Theme Management
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.className = `${theme}-theme`;

    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            const newTheme = isDark ? 'light' : 'dark';
            document.body.className = `${newTheme}-theme`;
            localStorage.setItem('theme', newTheme);
        });
    }
}

// 3. Navigation / Sidebar Injection
function setupNavigation(activePage) {
    const sidebar = `
        <div class="logo">
            <i class="ri-wallet-3-fill"></i> FinanceFlow
        </div>
        <nav>
            <a href="dashboard.html" class="nav-btn ${activePage === 'dashboard' ? 'active' : ''}"><i class="ri-dashboard-line"></i> Dashboard</a>
            <a href="transactions.html" class="nav-btn ${activePage === 'transactions' ? 'active' : ''}"><i class="ri-exchange-dollar-line"></i> Transacciones</a>
            <a href="settings.html" class="nav-btn ${activePage === 'settings' ? 'active' : ''}"><i class="ri-settings-4-line"></i> Configuración</a>
        </nav>
        <div class="user-profile">
            <span id="userNameDisplay">Usuario</span>
            <button id="logoutBtn"><i class="ri-logout-box-r-line"></i></button>
        </div>
    `;

    const mobileNav = `
        <a href="dashboard.html" class="nav-btn ${activePage === 'dashboard' ? 'active' : ''}"><i class="ri-dashboard-line"></i></a>
        <a href="transactions.html" class="nav-btn ${activePage === 'transactions' ? 'active' : ''}"><i class="ri-exchange-dollar-line"></i></a>
        <a href="settings.html" class="nav-btn ${activePage === 'settings' ? 'active' : ''}"><i class="ri-settings-4-line"></i></a>
    `;

    const sidebarEl = document.querySelector('.sidebar');
    if (sidebarEl) sidebarEl.innerHTML = sidebar;

    const mobileNavEl = document.querySelector('.mobile-nav');
    if (mobileNavEl) mobileNavEl.innerHTML = mobileNav;

    // Logout Logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (window.sbClient) await window.sbClient.auth.signOut();
            localStorage.removeItem('finance_session');
            window.location.href = 'login.html';
        });
    }

    // Update User Name
    const user = JSON.parse(localStorage.getItem('finance_session'));
    if (user) {
        const nameDisplay = document.getElementById('userNameDisplay');
        if (nameDisplay) nameDisplay.innerText = user.user_metadata?.username || user.email || 'Usuario';
    }
}

// 4. Auth Check (Redirect if not logged in)
function requireAuth() {
    const session = localStorage.getItem('finance_session');
    if (!session) {
        window.location.href = 'login.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    // activePage is set in the specific html page script
});
