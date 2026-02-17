// Common Logic & Initialization

// 1. Supabase Initialization
if (typeof supabase !== 'undefined' && typeof CONFIG !== 'undefined') {
    if (CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' && CONFIG.SUPABASE_URL.includes('.supabase.co')) {
        window.sbClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
}

// 2. Theme Management
function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    document.body.className = `${theme}-theme`;

    configThemeIcon(theme);

    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            const newTheme = isDark ? 'light' : 'dark';
            document.body.className = `${newTheme}-theme`;
            localStorage.setItem('theme', newTheme);
            configThemeIcon(newTheme);
        });
    }
}

function configThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
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
            <div style="display:flex; flex-direction:column">
                <span id="userNameDisplay" style="font-weight:600; font-size:0.9rem">Cargando...</span>
                <span style="font-size:0.7rem; color:var(--text-muted)">Premium User</span>
            </div>
            <button id="logoutBtn" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1.2rem"><i class="ri-logout-box-r-line"></i></button>
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
    const sessionStr = localStorage.getItem('finance_session');
    if (sessionStr) {
        const user = JSON.parse(sessionStr);
        const nameDisplay = document.getElementById('userNameDisplay');
        if (nameDisplay) nameDisplay.innerText = user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario';
    }
}

// 4. Auth Check
function requireAuth() {
    const session = localStorage.getItem('finance_session');
    if (!session) {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});
