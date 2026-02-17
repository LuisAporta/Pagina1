import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction, NewTransaction } from '../types';
import { useAuth } from '../context/AuthContext';

export const useTransactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);

            // 1. Try Local Storage first for immediate render (offline first approach)
            const localData = localStorage.getItem('transactions');
            if (localData) {
                setTransactions(JSON.parse(localData));
            }

            if (!user) return;

            // 2. Try Supabase if configured
            if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
                const { data, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false });

                if (error) throw error;

                if (data) {
                    setTransactions(data);
                    // Update local cache
                    localStorage.setItem('transactions', JSON.stringify(data));
                }
            }
        } catch (err: any) {
            console.error('Error fetching transactions:', err);
            // Don't set global error if we have local data, just warn
            if (transactions.length === 0) setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (newTransaction: NewTransaction) => {
        try {
            setLoading(true);
            const transaction: Transaction = {
                ...newTransaction,
                id: crypto.randomUUID(),
                user_id: user?.id || 'offline-user',
                created_at: new Date().toISOString(),
            };

            // Optimistic update
            const updatedTransactions = [transaction, ...transactions];
            setTransactions(updatedTransactions);
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

            if (user && import.meta.env.VITE_SUPABASE_URL) {
                const { error } = await supabase.from('transactions').insert([transaction]);
                if (error) {
                    // If error, rollback or queue for sync (simplified: just log and keep local)
                    console.error('Supabase insert failed:', error);
                    throw error;
                }
            }

            return transaction;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteTransaction = async (id: string) => {
        // Optimistic delete
        const updatedTransactions = transactions.filter(t => t.id !== id);
        setTransactions(updatedTransactions);
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

        if (user && import.meta.env.VITE_SUPABASE_URL) {
            await supabase.from('transactions').delete().eq('id', id);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    return { transactions, loading, error, addTransaction, deleteTransaction, refresh: fetchTransactions };
};
