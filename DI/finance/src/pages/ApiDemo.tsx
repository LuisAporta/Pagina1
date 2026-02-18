
import React, { useState, useEffect } from 'react';
import { Globe, Search, Github } from 'lucide-react';

interface Repo {
    id: number;
    name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    language: string;
}

const ApiDemo: React.FC = () => {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('LuisAporta'); // Default to user's likely handle or a popular one
    const [error, setError] = useState('');

    const fetchRepos = async () => {
        setLoading(true);
        setError('');
        try {
            // Using public GitHub API
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
            if (!response.ok) {
                if (response.status === 404) throw new Error('User not found');
                throw new Error('Failed to fetch repositories');
            }
            const data = await response.json();
            setRepos(data);
        } catch (err: any) {
            setError(err.message);
            setRepos([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepos();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchRepos();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-3">
                <Globe className="text-purple-400" />
                API Integration Demo
            </h2>

            <p className="text-slate-300">
                This page demonstrates fetching data from an external API (GitHub).
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter GitHub Username"
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                >
                    {loading ? 'Loading...' : <Search size={18} />}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-500/20 text-red-200 border border-red-500/40 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repos.map((repo) => (
                    <a
                        key={repo.id}
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-5 hover:bg-white/10 transition group block"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition flex items-center gap-2">
                                <Github size={16} />
                                {repo.name}
                            </h3>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-slate-300">
                                ⭐ {repo.stargazers_count}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                            {repo.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-2">
                            {repo.language && (
                                <span className="text-xs text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                                    {repo.language}
                                </span>
                            )}
                        </div>
                    </a>
                ))}
            </div>

            {repos.length === 0 && !loading && !error && (
                <p className="text-slate-500 italic">No public repositories found.</p>
            )}
        </div>
    );
};

export default ApiDemo;
