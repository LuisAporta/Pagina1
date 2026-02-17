import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../hooks/useTransactions';
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart as PieChartIcon, BarChart3, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

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

    // Data for Area Chart (Income vs Expenses over time) - Mocking daily data for demo
    const chartData = useMemo(() => {
        // In a real app, group transactions by date
        return [
            { name: 'Mon', income: 4000, expense: 2400 },
            { name: 'Tue', income: 3000, expense: 1398 },
            { name: 'Wed', income: 2000, expense: 9800 },
            { name: 'Thu', income: 2780, expense: 3908 },
            { name: 'Fri', income: 1890, expense: 4800 },
            { name: 'Sat', income: 2390, expense: 3800 },
            { name: 'Sun', income: 3490, expense: 4300 },
        ];
    }, []);

    // Data for Pie Chart
    const pieData = useMemo(() => {
        return [
            { name: 'Income', value: stats.income },
            { name: 'Expenses', value: stats.expenses },
        ];
    }, [stats]);

    // Budget Logic
    const [budgets, setBudgets] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        const saved = localStorage.getItem('budgets');
        if (saved) setBudgets(JSON.parse(saved));
    }, []);

    const budgetProgress = useMemo(() => {
        const progress: Record<string, { spent: number; limit: number }> = {};

        // Calculate spent per category
        const spentByCategory: Record<string, number> = {};
        transactions.forEach(t => {
            if (t.amount < 0 && budgets[t.category]) {
                spentByCategory[t.category] = (spentByCategory[t.category] || 0) + Math.abs(t.amount);
            }
        });

        // Merge with limits
        Object.keys(budgets).forEach(cat => {
            if (budgets[cat] > 0) {
                progress[cat] = {
                    spent: spentByCategory[cat] || 0,
                    limit: budgets[cat]
                };
            }
        });

        return progress;
    }, [transactions, budgets]);

    const COLORS = ['#10b981', '#f43f5e'];

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
                    Live Data
                </span>
            </div>

            {/* Top Stats Cards */}
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Area Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-medium text-white mb-6 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-3 text-indigo-400" />
                        Weekly Overview
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-medium text-white mb-6 flex items-center">
                        <PieChartIcon className="w-5 h-5 mr-3 text-indigo-400" />
                        Income vs Expenses
                    </h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center space-x-6 mt-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                            <span className="text-sm text-slate-300">Income</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
                            <span className="text-sm text-slate-300">Expenses</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Transactions Preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
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
                                transition={{ delay: 0.6 + (index * 0.1) }}
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
            {/* Budget Progress Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6"
            >
                <h3 className="text-lg font-medium text-white mb-6 flex items-center">
                    <Target className="w-5 h-5 mr-3 text-indigo-400" />
                    Budget Goals
                </h3>
                <div className="space-y-6">
                    {Object.entries(budgetProgress).map(([category, { spent, limit }], index) => {
                        const percentage = Math.min((spent / limit) * 100, 100);
                        const isOverBudget = spent > limit;

                        return (
                            <div key={category}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-300 font-medium">{category}</span>
                                    <span className={`${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        ${spent.toFixed(0)} / ${limit.toFixed(0)}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: 0.7 + (index * 0.1) }}
                                        className={`h-full rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {Object.keys(budgetProgress).length === 0 && (
                        <div className="text-center text-slate-500 py-4">
                            No budgets set. Go to Settings to define your goals.
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
