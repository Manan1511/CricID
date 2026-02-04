
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
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between pt-10 pb-16 px-4 sm:px-6 lg:px-8">

                    {/* Left Side: Text & Search */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
                            <span className="block xl:inline">Find Cricketers.</span>{' '}
                            <span className="block text-blue-600 xl:inline">Backed by Data.</span>
                        </h1>
                        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 mb-8">
                            Comprehensive tracking for cricket identities, stats, and performance.
                            Join the community of scouts and officials today.
                        </p>

                        <form onSubmit={handleSearch} className="sm:max-w-xl sm:mx-auto lg:mx-0">
                            <div className="flex rounded-md shadow-sm">
                                <div className="relative flex-grow focus-within:z-10">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border border-gray-300 py-3"
                                        placeholder="Search for players..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="-ml-px relative inline-flex items-center space-x-2 px-6 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Stats Panels */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center mt-12 lg:mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-lg">
                            <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl group">
                                <div className="p-3 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                                    <ShieldCheck className="h-10 w-10 text-blue-600" />
                                </div>
                                <span className="text-4xl font-extrabold text-gray-900 mb-1">{counts.players}+</span>
                                <span className="text-gray-600 font-medium tracking-wide">Verified Players</span>
                            </div>

                            <div className="bg-gradient-to-br from-white to-green-50 p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-xl group">
                                <div className="p-3 bg-green-100 rounded-full mb-4 group-hover:bg-green-200 transition-colors">
                                    <Activity className="h-10 w-10 text-green-600" />
                                </div>
                                <span className="text-4xl font-extrabold text-gray-900 mb-1">{counts.matches}+</span>
                                <span className="text-gray-600 font-medium tracking-wide">Matches Tracked</span>
                            </div>

                            {/* Player Signup CTA */}
                            <div className="sm:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-xl border border-transparent flex flex-col items-center transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl text-center group relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>

                                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Are you a Player?</h3>
                                <p className="text-blue-100 mb-6 relative z-10 max-w-xs mx-auto">Create your official digital profile and get your unique CricID today.</p>

                                <button
                                    onClick={() => navigate('/signup-player')}
                                    className="px-6 py-3 bg-white text-blue-700 font-bold rounded-lg shadow-md hover:bg-blue-50 transition-colors relative z-10 w-full sm:w-auto"
                                >
                                    Register as Player
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
