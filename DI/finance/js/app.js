/* Main Application Logic */

// State
let currentUser = null;
let transactions = [];
let myChart = null;

// DOM Elements
const pages = {
    auth: document.getElementById('auth-screen'),
    dashboard: document.getElementById('dashboard'),
    transactions: document.getElementById('transactions'),
    settings: document.getElementById('settings')
};

const navBtns = document.querySelectorAll('.nav-btn');
const authForm = document.getElementById('authForm');
const switchAuthMode = document.getElementById('switchAuthMode');
const transactionForm = document.getElementById('transactionForm');
const modal = document.getElementById('transactionModal');
const closeModalBtn = document.querySelector('.close-modal');
const addTransactionBtn = document.getElementById('addTransactionBtn');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    // Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.dataset.target;
            if (target) navigateTo(target);
        });
    });

    // Auth
    authForm.addEventListener('submit', handleAuth);
    switchAuthMode.addEventListener('click', (e) => {
        e.preventDefault();
        const isLogin = authForm.querySelector('button').innerText === 'Iniciar Sesión';
        toggleAuthMode(!isLogin);
    });

    document.getElementById('logoutBtnSmall').addEventListener('click', handleLogout);

    // Transactions
    addTransactionBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    transactionForm.addEventListener('submit', handleTransactionSubmit);

    // Theme
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

// --- Navigation ---
function navigateTo(targetId) {
    // Hide all pages
    Object.values(pages).forEach(page => page.classList.add('hidden'));
    // Show target
    if (pages[targetId]) pages[targetId].classList.remove('hidden');

    // Update Nav UI
    navBtns.forEach(btn => {
        if (btn.dataset.target === targetId) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Specific logic per page
    if (targetId === 'dashboard') updateDashboard();
    if (targetId === 'transactions') renderTransactionsList();
}

// --- Auth Handling ---
async function checkAuth() {
    const session = localStorage.getItem('finance_session');
    if (session) {
        currentUser = JSON.parse(session);
        showApp();
    } else {
        // Check Supabase if available
        if (supabase) {
            const { data: { session: sbSession } } = await supabase.auth.getSession();
            if (sbSession) {
                currentUser = sbSession.user;
                saveSession(currentUser);
                showApp();
                return;
            }
        }
        showAuth();
    }
}

function showApp() {
    document.getElementById('userProfileDisplay').classList.remove('hidden');
    document.getElementById('userNameSmall').textContent = currentUser.email;
    pages.auth.classList.add('hidden');
    navigateTo('dashboard');
    loadData();
}

function showAuth() {
    document.getElementById('userProfileDisplay').classList.add('hidden');
    Object.values(pages).forEach(p => p.classList.add('hidden'));
    pages.auth.classList.remove('hidden');
}

async function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('email').value; // Input ID kept as email for simplicity, but holds username
    const email = `${username}@financeflow.local`; // Dummy domain
    const password = document.getElementById('password').value;
    const isLogin = authForm.querySelector('button').innerText === 'Iniciar Sesión';

    if (!supabase) {
        // Mock Auth for offline/demo
        currentUser = { email: email, id: 'mock-id-' + Date.now() };
        saveSession(currentUser);
        showApp();
        return;
    }

    try {
        if (isLogin) {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            currentUser = data.user;
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username: username }
                }
            });
            if (error) throw error;
            currentUser = data.user;
            // Auto-login or show message depending on Supabase config (Email confirmation should be off)
            if (!currentUser && !error) alert('Registro completado. Por favor inicia sesión.');
        }
        if (currentUser) {
            saveSession(currentUser);
            showApp();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function handleLogout() {
    if (supabase) supabase.auth.signOut();
    localStorage.removeItem('finance_session');
    currentUser = null;
    showAuth();
}

function toggleAuthMode(isLogin) {
    const btn = authForm.querySelector('button');
    const title = document.querySelector('.auth-card h2');
    if (isLogin) {
        title.innerText = 'Bienvenido';
        btn.innerText = 'Iniciar Sesión';
        switchAuthMode.innerText = 'Regístrate';
        switchAuthMode.previousSibling.textContent = '¿No tienes cuenta? ';
    } else {
        title.innerText = 'Crear Cuenta';
        btn.innerText = 'Registrarse';
        switchAuthMode.innerText = 'Inicia Sesión';
        switchAuthMode.previousSibling.textContent = '¿Ya tienes cuenta? ';
    }
}

function saveSession(user) {
    localStorage.setItem('finance_session', JSON.stringify(user));
}

// --- Data & Logic ---
async function loadData() {
    // Try LocalStorage first
    const localData = localStorage.getItem('finance_transactions');
    if (localData) {
        transactions = JSON.parse(localData);
    }

    // Try Supabase Sync
    if (supabase && currentUser) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', currentUser.id);

        if (data && !error) {
            transactions = data;
            saveLocalData();
        }
    }

    updateDashboard();
}

function saveLocalData() {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
}

async function handleTransactionSubmit(e) {
    e.preventDefault();

    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const category = document.getElementById('category').value;
    const file = document.getElementById('fileUpload').files[0];

    const newTx = {
        id: crypto.randomUUID(),
        user_id: currentUser.id,
        type,
        amount,
        description,
        category,
        date: new Date().toISOString(),
        file_url: null // Handle file upload separately
    };

    // Optimistic UI Update
    transactions.unshift(newTx);
    saveLocalData();
    modal.classList.add('hidden');
    transactionForm.reset();
    updateDashboard();

    // Sync with Supabase
    if (supabase) {
        // Upload file if exists
        /* 
        if (file) {
            const { data, error } = await supabase.storage.from('receipts').upload(`${currentUser.id}/${Date.now()}_${file.name}`, file);
            if(data) newTx.file_url = data.path;
        } 
        */

        const { error } = await supabase.from('transactions').insert(newTx);
        if (error) console.error('Error syncing transaction:', error);
    }
}

// --- UI & Charts ---
function updateDashboard() {
    // Calc Totals
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const total = income - expense;

    document.getElementById('totalBalance').innerText = `€${total.toFixed(2)}`;
    document.getElementById('totalIncome').innerText = `€${income.toFixed(2)}`;
    document.getElementById('totalExpense').innerText = `€${expense.toFixed(2)}`;

    updateChart(income, expense);
    renderRecentList();
}

function renderRecentList() {
    const list = document.getElementById('recentList');
    list.innerHTML = '';
    transactions.slice(0, 5).forEach(tx => {
        const item = document.createElement('li');
        item.className = `transaction-item ${tx.type}`;
        item.innerHTML = `
            <div class="t-info">
                <span class="t-title">${tx.description}</span>
                <span class="t-date">${new Date(tx.date).toLocaleDateString()}</span>
            </div>
            <span class="t-amount">${tx.type === 'income' ? '+' : '-'}€${tx.amount.toFixed(2)}</span>
        `;
        list.appendChild(item);
    });
}

function renderTransactionsList() {
    const list = document.getElementById('transactionsList');
    list.innerHTML = '';
    transactions.forEach(tx => {
        const item = document.createElement('div');
        item.className = `transaction-item ${tx.type}`;
        item.innerHTML = `
             <div class="t-info">
                <span class="t-title">${tx.description}</span>
                <span class="t-date">${new Date(tx.date).toLocaleDateString()} - ${tx.category}</span>
            </div>
            <span class="t-amount">${tx.type === 'income' ? '+' : '-'}€${tx.amount.toFixed(2)}</span>
        `;
        list.appendChild(item);
    });
}

function openModal() {
    modal.classList.remove('hidden');
}

function updateChart(income, expense) {
    const ctx = document.getElementById('balanceChart').getContext('2d');

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ingresos', 'Gastos'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// --- Theme ---
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.className = `${theme}-theme`;
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    document.body.className = `${newTheme}-theme`;
    localStorage.setItem('theme', newTheme);
}
