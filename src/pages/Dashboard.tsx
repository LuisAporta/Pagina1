import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../hooks/useTransactions';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const { transactions } = useTransactions();

    const stats = useMemo(() => {
        const income = transactions
            .filter((t) => t.amount > 0)
            .reduce((acc, t) => acc + t.amount, 0);
        const expenses = transactions
            .filter((t) => t.amount < 0)
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);
        const balance = income - expenses;

        return { income, expenses, balance };
    }, [transactions]);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
            },
        }),
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
                    {t('dashboard')}
                </h2>
                <span className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    Beta v0.2
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="glass-card p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-500/20 rounded-xl">
                                <DollarSign className="h-6 w-6 text-indigo-300" />
                            </div>
                            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> +2.5%
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Total Balance</p>
                        <p className="text-3xl font-bold text-white mt-1">${stats.balance.toFixed(2)}</p>
                    </div>
                </motion.div>

                {/* Income Card */}
                <motion.div
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="glass-card p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-emerald-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <TrendingUp className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Total Income</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-1">+${stats.income.toFixed(2)}</p>
                    </div>
                </motion.div>

                {/* Expenses Card */}
                <motion.div
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="glass-card p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown className="w-24 h-24 text-rose-400" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-rose-500/20 rounded-xl">
                                <TrendingDown className="h-6 w-6 text-rose-400" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-400">Total Expenses</p>
                        <p className="text-3xl font-bold text-rose-400 mt-1">-${stats.expenses.toFixed(2)}</p>
                    </div>
                </motion.div>
            </div>

            {/* Recent Transactions Preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 shadow-xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white flex items-center">
                        <Activity className="w-5 h-5 mr-3 text-indigo-400" />
                        Recent Activity
                    </h3>
                    <button className="text-sm text-indigo-300 hover:text-white transition-colors">View All</button>
                </div>

                <div className="flow-root">
                    <ul className="-my-5">
                        {transactions.slice(0, 5).map((transaction, index) => (
                            <motion.li
                                key={transaction.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                className="py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-4 rounded-lg -mx-4"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.amount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                                            }`}>
                                            {transaction.amount > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {transaction.description || transaction.category}
                                        </p>
                                        <p className="text-sm text-slate-400 truncate">
                                            {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                                        </p>
                                    </div>
                                    <div className={`inline-flex items-center text-base font-semibold ${transaction.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                        {transactions.length === 0 && (
                            <li className="py-8 text-center text-slate-500">
                                <p>No recent activity</p>
                                <p className="text-sm mt-2">Start by adding a new transaction</p>
                            </li>
                        )}
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
