import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wallet, Archive, Settings, LogOut, Menu, X } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-gray-200">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-indigo-600">FinanceApp</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Menu */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-indigo-600">FinanceApp</h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 top-16 bg-white">
                    <nav className="px-4 py-4 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center px-4 py-3 text-base font-medium rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                signOut();
                                setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            {t('logout')}
                        </button>
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
