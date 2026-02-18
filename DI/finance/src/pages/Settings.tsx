import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Target, Download, Upload } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { storageService } from '../services/storage';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { transactions } = useTransactions();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const [budgets, setBudgets] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        const savedBudgets = localStorage.getItem('budgets');
        if (savedBudgets) {
            setBudgets(JSON.parse(savedBudgets));
        }
    }, []);

    const handleBudgetChange = (category: string, value: string) => {
        const val = parseFloat(value);
        const newBudgets = { ...budgets, [category]: isNaN(val) ? 0 : val };
        setBudgets(newBudgets);
        localStorage.setItem('budgets', JSON.stringify(newBudgets));
    };

    const handleExport = () => {
        if (transactions.length === 0) {
            alert('No transactions to export.');
            return;
        }

        const headers = ['Date', 'Category', 'Description', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                t.date,
                t.category,
                `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
                t.amount
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'transactions_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('settings')}</h2>

            <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200">
                {/* Language Settings */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Globe className="h-5 w-5 mr-2 text-indigo-500" />
                            {t('language')}
                        </h3>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`px-4 py-2 rounded-md ${i18n.language === 'en'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {t('english')}
                        </button>
                        <button
                            onClick={() => changeLanguage('es')}
                            className={`px-4 py-2 rounded-md ${i18n.language === 'es'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {t('spanish')}
                        </button>
                    </div>
                </div>

                {/* Theme Settings (Stub for now) */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Sun className="h-5 w-5 mr-2 text-orange-500" />
                            {t('theme')}
                        </h3>
                    </div>
                    <div className="text-sm text-gray-500">
                        Theme switching coming soon. Currently using System/Light mode.
                    </div>
                </div>

                {/* Budget Goals Settings */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Target className="h-5 w-5 mr-2 text-emerald-500" />
                            Budget Goals
                        </h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Set your monthly budget limits for each category.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Food', 'Transport', 'Entertainment', 'Bills', 'General'].map((category) => (
                            <div key={category}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{category}</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                                        placeholder="0.00"
                                        value={budgets[category] || ''}
                                        onChange={(e) => handleBudgetChange(category, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Management */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            <Download className="h-5 w-5 mr-2 text-blue-500" />
                            Data Management
                        </h3>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Download a copy of your transaction data.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleExport}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Download className="-ml-1 mr-2 h-4 w-4" />
                                Export CSV
                            </button>
                            <button
                                onClick={() => storageService.exportDataToJSON(transactions, 'finance_backup.json')}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <Download className="-ml-1 mr-2 h-4 w-4" />
                                Backup JSON
                            </button>
                            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none cursor-pointer">
                                <Upload className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
                                Restore JSON
                                <input
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={async (e) => {
                                        if (e.target.files?.[0]) {
                                            try {
                                                const data = await storageService.importDataFromJSON(e.target.files[0]);
                                                if (Array.isArray(data)) {
                                                    // Assuming data is transactions array, simpler for demo
                                                    // In real app, we might merge or replace.
                                                    // For now, let's just alert the content count.
                                                    alert(`Loaded ${data.length} items from backup. (Logic to merge would go here)`);
                                                    console.log("Imported data:", data);
                                                } else {
                                                    alert('Invalid backup format');
                                                }
                                            } catch (err) {
                                                alert('Failed to import');
                                            }
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
