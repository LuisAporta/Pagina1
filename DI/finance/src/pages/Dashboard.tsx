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
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-widest uppercase relative inline-block">
                        {t('dashboard')}
                        <span className="absolute -top-2 -right-4 w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                    </h2>
                    <p className="text-slate-400 mt-1 font-mono text-sm">SYSTEM STATUS: <span className="text-emerald-400">NOMINAL</span></p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-cyan-400 hover:bg-cyan-500/10 transition">
                        REFRESH DATALINK
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Balance', value: stats.balance, icon: DollarSign, color: 'text-cyan-400', bg: 'from-cyan-500/20 to-blue-500/5', border: 'border-cyan-500/30' },
                    { label: 'Network Income', value: stats.income, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/5', border: 'border-emerald-500/30' },
                    { label: 'System Drain', value: stats.expenses, icon: TrendingDown, color: 'text-pink-500', bg: 'from-pink-500/20 to-red-500/5', border: 'border-pink-500/30' }
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className={`glass-card p-6 relative overflow-hidden group border ${stat.border}`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-30 group-hover:opacity-50 transition-opacity`} />

                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                <p className={`text-4xl font-bold ${stat.color} font-mono tracking-tighter`}>
                                    {stat.label.includes('Drain') ? '-' : ''}${Math.abs(stat.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl bg-black/40 border border-white/10 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>

                        {/* Decorative HUD Lines */}
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-white/10 rounded-br-xl" />
                    </motion.div>
                ))}
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Area Chart - Spans 2 cols */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 glass-card p-6 border border-white/10 relative"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white flex items-center tracking-wide">
                            <Activity className="w-5 h-5 mr-3 text-cyan-400" />
                            TRANSACTION_FLOW
                        </h3>
                        <div className="flex gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse delay-75"></div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} dx={-10} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(5, 5, 10, 0.9)',
                                        borderColor: 'rgba(0, 243, 255, 0.3)',
                                        borderRadius: '8px',
                                        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Pie Chart & Budget */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <PieChartIcon className="w-5 h-5 mr-3 text-purple-400" />
                            RATIO_ANALYSIS
                        </h3>
                        <div className="h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ec4899" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xs font-mono text-slate-500">NET/GROSS</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <span className="text-xs font-mono text-slate-300">IN</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                                <span className="text-xs font-mono text-slate-300">OUT</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Target className="w-5 h-5 mr-3 text-red-400" />
                            LIMIT_PROTOCOL
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(budgetProgress).slice(0, 3).map(([category, { spent, limit }]) => {
                                const percentage = Math.min((spent / limit) * 100, 100);
                                return (
                                    <div key={category} className="group">
                                        <div className="flex justify-between text-xs mb-1 font-mono">
                                            <span className="text-slate-400 group-hover:text-white transition-colors">{category}</span>
                                            <span className="text-slate-500">{Math.round(percentage)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${spent > limit ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {!Object.keys(budgetProgress).length && (
                                <p className="text-xs text-slate-600 font-mono text-center py-2">NO LIMITS SET</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
