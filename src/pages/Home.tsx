
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const [counts, setCounts] = useState({ players: 0, matches: 0 });

    useEffect(() => {
        async function fetchCounts() {
            // fetching counts from real tables
            const { count: playerCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true);
            const { count: matchCount } = await supabase.from('matches').select('*', { count: 'exact', head: true });

            setCounts({
                players: playerCount || 0,
                matches: matchCount || 0,
            });
        }
        fetchCounts();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/stats?search=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Find Cricketers.</span>{' '}
                                    <span className="block text-blue-600 xl:inline">Backed by Data.</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Comprehensive tracking for cricket identities, stats, and performance.
                                    Join the community of scouts and officials today.
                                </p>
                                <div className="mt-8 sm:mt-12">
                                    <form onSubmit={handleSearch} className="sm:max-w-xl sm:mx-auto lg:mx-0">
                                        <div className="flex rounded-md shadow-sm">
                                            <div className="relative flex-grow focus-within:z-10">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Search className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300 py-3"
                                                    placeholder="Search for players..."
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50 flex items-center justify-center">
                    {/* Abstract or Image could go here */}
                    <div className="grid grid-cols-2 gap-8 p-8">
                        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
                            <ShieldCheck className="h-12 w-12 text-blue-500 mb-2" />
                            <span className="text-3xl font-bold text-gray-900">{counts.players}+</span>
                            <span className="text-gray-500">Verified Players</span>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
                            <Activity className="h-12 w-12 text-green-500 mb-2" />
                            <span className="text-3xl font-bold text-gray-900">{counts.matches}+</span>
                            <span className="text-gray-500">Matches Tracked</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
