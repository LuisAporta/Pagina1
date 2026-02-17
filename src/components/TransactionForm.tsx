import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../types';
import { Mic } from 'lucide-react';

interface TransactionFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSuccess, initialData }) => {
    const { t } = useTranslation();
    const { addTransaction } = useTransactions();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (initialData) {
            setAmount(initialData.amount.toString());
            setCategory(initialData.category);
            setDescription(initialData.description);
            setDate(initialData.date.split('T')[0]);
        }
    }, [initialData]);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice input is not supported in this browser.');
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListening(true);
        recognition.start();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            processVoiceCommand(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    };

    const processVoiceCommand = (text: string) => {
        // Try to extract amount
        const numberMatch = text.match(/(\d+([.,]\d+)?)/);
        if (numberMatch) {
            setAmount(numberMatch[0].replace(',', '.'));
        }

        // Try to map categories (simple keyword matching)
        const lowerText = text.toLowerCase();
        if (lowerText.includes('comida') || lowerText.includes('food') || lowerText.includes('supermercado')) setCategory('Food');
        else if (lowerText.includes('transporte') || lowerText.includes('uber') || lowerText.includes('bus')) setCategory('Transport');
        else if (lowerText.includes('salario') || lowerText.includes('nómina')) setCategory('Salary');
        else if (lowerText.includes('cine') || lowerText.includes('juego') || lowerText.includes('entretenimiento')) setCategory('Entertainment');
        else if (lowerText.includes('factura') || lowerText.includes('luz') || lowerText.includes('agua')) setCategory('Bills');

        setDescription(text); // Set the full text as description
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData) {
                // Edit mode to be implemented
                console.log('Edit not implemented yet');
            } else {
                await addTransaction({
                    amount: parseFloat(amount),
                    category: category || 'General', // Fallback category
                    description,
                    date,
                });
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {initialData ? t('edit') : t('add_transaction')}
                </h3>
                <button
                    type="button"
                    onClick={startListening}
                    className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title="Voice Input"
                >
                    <Mic className="h-5 w-5" />
                </button>
            </div>

            {isListening && (
                <p className="text-sm text-center text-indigo-600 mb-4 font-medium">Listening... speak now</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('amount')}</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('category')}</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">Select Category</option>
                        <option value="Food">Food / Comida</option>
                        <option value="Transport">Transport / Transporte</option>
                        <option value="Salary">Salary / Salario</option>
                        <option value="Entertainment">Entertainment / Entretenimiento</option>
                        <option value="Bills">Bills / Facturas</option>
                        <option value="General">General</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('date')}</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('description')}</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Description of the transaction..."
                    />
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    >
                        {t('save')}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransactionForm;
