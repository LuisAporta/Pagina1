import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, FileText } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionForm from '../components/TransactionForm';
import type { Transaction } from '../types';

const Transactions: React.FC = () => {
    const { t } = useTranslation();
    const { transactions, loading, deleteTransaction, refresh } = useTransactions();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm(t('Are you sure you want to delete this transaction?'))) {
            await deleteTransaction(id);
            refresh();
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">{t('transactions')}</h2>
                <button
                    onClick={() => {
                        setEditingTransaction(null);
                        setIsFormOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    {t('add_transaction')}
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-indigo-300">Loading...</div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <ul className="divide-y divide-white/10">
                        {transactions.length === 0 ? (
                            <li className="px-6 py-8 text-center text-slate-400">No transactions found.</li>
                        ) : (
                            transactions.map((transaction) => (
                                <li key={transaction.id} className="px-6 py-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                                    <div className="flex-1 cursor-pointer" onClick={() => handleEdit(transaction)}>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-300 truncate">{transaction.category}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.amount > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                                    }`}>
                                                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-slate-400">
                                                    {transaction.description}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                                                <p>{new Date(transaction.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex items-center space-x-2">
                                        {transaction.file_url && (
                                            <a href={transaction.file_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                                                <FileText className="h-5 w-5" />
                                            </a>
                                        )}
                                        <button onClick={() => handleDelete(transaction.id)} className="text-rose-400/70 hover:text-rose-400 transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom glass-card text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/10">
                            <TransactionForm
                                onClose={() => setIsFormOpen(false)}
                                onSuccess={() => {
                                    setIsFormOpen(false);
                                    refresh();
                                }}
                                initialData={editingTransaction}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
