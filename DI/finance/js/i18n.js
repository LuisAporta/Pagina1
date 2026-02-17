const translations = {
    es: {
        dashboard: "Dashboard",
        transactions: "Transacciones",
        analytics: "Análisis",
        settings: "Configuración",
        welcome: "Bienvenido",
        manageCapital: "Gestiona tu capital de forma inteligente.",
        login: "Iniciar Sesión",
        register: "Registrarse",
        totalBalance: "Balance Total",
        income: "Ingresos",
        expense: "Gastos",
        recent: "Recientes",
        newTransaction: "Nueva Transacción",
        save: "Guardar",
        amount: "Monto",
        concept: "Concepto",
        category: "Categoría",
        type: "Tipo"
    },
    en: {
        dashboard: "Dashboard",
        transactions: "Transactions",
        analytics: "Analytics",
        settings: "Settings",
        welcome: "Welcome",
        manageCapital: "Manage your capital smartly.",
        login: "Login",
        register: "Register",
        totalBalance: "Total Balance",
        income: "Income",
        expense: "Expenses",
        recent: "Recent",
        newTransaction: "New Transaction",
        save: "Save",
        amount: "Amount",
        concept: "Concept",
        category: "Category",
        type: "Type"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('finance_lang', lang);
    const t = translations[lang];
    if (!t) return;

    // Update specific elements by ID or Data attribute (simplified approach)
    // In a full app, we'd use data-i18n attributes. 
    // For this MVP, we'll reload or have specific updates.

    // Example updates:
    document.querySelectorAll('[data-target="dashboard"]').forEach(el => el.innerHTML = `<i class="ri-dashboard-line"></i> ${t.dashboard}`);
    document.querySelectorAll('[data-target="transactions"]').forEach(el => el.innerHTML = `<i class="ri-exchange-dollar-line"></i> ${t.transactions}`);
    document.querySelectorAll('[data-target="settings"]').forEach(el => el.innerHTML = `<i class="ri-settings-4-line"></i> ${t.settings}`);

    // Update headers if they exist
    const h1 = document.querySelector('#dashboard h1');
    if (h1 && h1.innerText.includes('Resumen')) h1.innerText = lang === 'es' ? 'Resumen Financiero' : 'Financial Summary';

    // Update placeholders
    document.getElementById('email').placeholder = lang === 'es' ? 'Usuario' : 'Username';
    document.getElementById('password').placeholder = lang === 'es' ? 'Contraseña' : 'Password';

    console.log(`Language changed to ${lang}`);
}

document.addEventListener('DOMContentLoaded', () => {
    const lang = localStorage.getItem('finance_lang') || 'es';
    const select = document.getElementById('languageSelect');
    if (select) {
        select.value = lang;
        select.addEventListener('change', (e) => changeLanguage(e.target.value));
    }
    changeLanguage(lang);
});
