import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../hooks/useTransactions';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

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

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('dashboard')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Balance</p>
                            <p className="text-2xl font-bold text-gray-900">${stats.balance.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-full">
                            <DollarSign className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>

                {/* Income Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Income</p>
                            <p className="text-2xl font-bold text-green-600">+${stats.income.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-600">-${stats.expenses.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Preview */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                        {transactions.slice(0, 5).map((transaction) => (
                            <li key={transaction.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {transaction.description || transaction.category}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`inline-flex items-center text-base font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                    </div>
                                </div>
                            </li>
                        ))}
                        {transactions.length === 0 && (
                            <li className="py-4 text-center text-gray-500">No recent activity</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
