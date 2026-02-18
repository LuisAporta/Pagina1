import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Archive, Settings, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileNav: React.FC = () => {
    const location = useLocation();

    const navigation = [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Txns', href: '/transactions', icon: Wallet },
        { name: 'Files', href: '/files', icon: Archive },
        { name: 'API', href: '/api-demo', icon: Globe },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 pb-safe">
            <nav className="flex justify-around items-center px-2 py-3">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            className="relative flex flex-col items-center p-2 group"
                        >
                            <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                                }`}>
                                <item.icon className="h-6 w-6" />
                                {isActive && (
                                    <span className="absolute inset-0 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"></span>
                                )}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500'
                                }`}>
                                {item.name}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="mobileTab"
                                    className="absolute -top-3 w-8 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default MobileNav;
