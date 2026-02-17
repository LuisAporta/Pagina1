import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, Archive, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: React.FC = () => {
    const { t } = useTranslation();
    const { signOut } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const navigation = [
        { name: t('dashboard'), href: '/', icon: LayoutDashboard },
        { name: t('transactions'), href: '/transactions', icon: Wallet },
        { name: t('files'), href: '/files', icon: Archive },
        { name: t('settings'), href: '/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen flex text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Desktop Sidebar with Glassmorphism */}
            <aside className="hidden md:flex md:w-72 md:flex-col glass-sidebar fixed h-full z-10">
                <div className="p-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        FinanceApp
                    </h1>
                </div>
                <nav className="flex-1 px-6 space-y-3">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                        ? 'bg-indigo-600/30 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-300'}`} />
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-sidebar px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">FinanceApp</h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md text-slate-300 hover:bg-white/10"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden fixed inset-0 z-40 top-16 glass-sidebar backdrop-blur-3xl"
                    >
                        <nav className="px-4 py-4 space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-slate-300 hover:bg-white/10"
                                >
                                    <item.icon className="h-5 w-5 mr-3 text-indigo-400" />
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    signOut();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-3 text-base font-medium text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                {t('logout')}
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 md:pl-72 pt-16 md:pt-0 p-4 md:p-8 overflow-x-hidden">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
};

export default Layout;
