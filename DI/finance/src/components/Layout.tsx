import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, Archive, Settings, LogOut, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileNav from './MobileNav';

const Layout: React.FC = () => {
    const { t } = useTranslation();
    const { signOut } = useAuth();
    const location = useLocation();

    const navigation = [
        { name: t('dashboard'), href: '/', icon: LayoutDashboard },
        { name: t('transactions'), href: '/transactions', icon: Wallet },
        { name: t('files'), href: '/files', icon: Archive },
        { name: 'API Demo', href: '/api-demo', icon: Globe },
        { name: t('settings'), href: '/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen flex text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
            {/* Desktop Sidebar with Glassmorphism */}
            <aside className="hidden md:flex md:w-72 md:flex-col glass-sidebar fixed h-full z-10 transition-all duration-300">
                <div className="p-8 flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 animate-pulse-soft"></div>
                        <Wallet className="h-8 w-8 text-cyan-400 relative z-10" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tighter text-white font-orbitron">
                        FIN<span className="text-cyan-400">HUB</span>
                        <span className="text-[10px] align-top text-purple-400 ml-1">v2.0</span>
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-white/5 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 hover:border hover:border-white/10'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-slate-500 group-hover:text-purple-300'}`} />
                                <span className="relative z-10">{item.name}</span>

                                {isActive && (
                                    <div className="absolute inset-y-0 left-0 w-1 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mx-4 mb-4 border border-white/5 rounded-2xl bg-black/20">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold ring-2 ring-black">
                            U
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">User</p>
                            <p className="text-xs text-slate-500 truncate">Online</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center justify-center w-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all border border-red-500/20 hover:border-red-500/40"
                    >
                        <LogOut className="h-3 w-3 mr-2" />
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Mobile Navigation (Bottom) */}
            <MobileNav />

            {/* Main Content Area */}
            <main className="flex-1 md:pl-72 p-4 md:p-8 overflow-x-hidden pb-24 md:pb-8">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
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
