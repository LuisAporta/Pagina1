import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { loginAsGuest } = useAuth(); // Destructure properly
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        // Simple "Plausible" Login Simulation
        setTimeout(() => {
            if (email && password.length >= 4) {
                // Simulate successful login
                loginAsGuest(); // Re-use guest login to set session
                navigate('/');
            } else {
                setMessage('Please enter a valid email and password (min 4 chars).');
                setLoading(false);
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-card p-8">
                <h2 className="text-3xl font-bold text-center mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
                    {isSignUp ? t('signup') : t('login')}
                </h2>

                {message && (
                    <div className={`p-4 mb-4 text-sm rounded-lg ${message.includes('Check') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-400 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-indigo-200 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-400 transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition duration-200 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (isSignUp ? t('signup') : t('login'))}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-4">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-sm text-indigo-300 hover:text-white transition-colors block w-full"
                    >
                        {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900 text-slate-500">or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            setLoading(true);
                            await loginAsGuest();
                            navigate('/');
                        }}
                        className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-indigo-200 hover:text-white font-medium rounded-xl transition duration-200 border border-white/10"
                    >
                        Enter as Guest (No Email)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
