
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
        <div className="bg-[#E3EDF7] min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between pt-10 pb-16 px-4 sm:px-6 lg:px-8">

                    {/* Left Side: Text & Search */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                        <h1 className="text-4xl tracking-tight font-extrabold text-gray-700 sm:text-5xl md:text-6xl mb-6 drop-shadow-sm">
                            <span className="block xl:inline">Find Cricketers.</span>{' '}
                            <span className="block text-blue-600 xl:inline">Backed by Data.</span>
                        </h1>
                        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 mb-8">
                            Comprehensive tracking for cricket identities, stats, and performance.
                            Join the community of scouts and officials today.
                        </p>

                        <form onSubmit={handleSearch} className="sm:max-w-xl sm:mx-auto lg:mx-0">
                            <div className="flex rounded-xl shadow-neu-flat p-1 bg-[#E3EDF7]">
                                <div className="relative flex-grow focus-within:z-10">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="focus:ring-0 focus:outline-none block w-full rounded-l-xl pl-10 sm:text-sm border-none bg-[#E3EDF7] shadow-neu-pressed py-3 text-gray-700 placeholder-gray-400"
                                        placeholder="Search for players..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="relative inline-flex items-center space-x-2 px-6 py-2 border-none text-sm font-bold rounded-xl text-blue-600 bg-[#E3EDF7] shadow-neu-button hover:text-blue-700 hover:shadow-neu-pressed transition-all active:scale-95 ml-2"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Stats Panels */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center mt-12 lg:mt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-lg">
                            <div className="bg-[#E3EDF7] p-8 rounded-2xl shadow-neu-flat flex flex-col items-center transform transition-all duration-300 hover:shadow-neu-pressed group">
                                <div className="p-4 bg-[#E3EDF7] rounded-full mb-4 shadow-neu-button group-hover:shadow-neu-pressed transition-all">
                                    <ShieldCheck className="h-10 w-10 text-blue-600 drop-shadow-sm" />
                                </div>
                                <span className="text-4xl font-extrabold text-gray-700 mb-1 drop-shadow-sm">{counts.players}+</span>
                                <span className="text-gray-500 font-bold tracking-wide">Verified Players</span>
                            </div>

                            <div className="bg-[#E3EDF7] p-8 rounded-2xl shadow-neu-flat flex flex-col items-center transform transition-all duration-300 hover:shadow-neu-pressed group">
                                <div className="p-4 bg-[#E3EDF7] rounded-full mb-4 shadow-neu-button group-hover:shadow-neu-pressed transition-all">
                                    <Activity className="h-10 w-10 text-green-600 drop-shadow-sm" />
                                </div>
                                <span className="text-4xl font-extrabold text-gray-700 mb-1 drop-shadow-sm">{counts.matches}+</span>
                                <span className="text-gray-500 font-bold tracking-wide">Matches Tracked</span>
                            </div>

                            {/* Player Signup CTA */}
                            <div className="sm:col-span-2 bg-[#E3EDF7] p-8 rounded-2xl shadow-neu-flat flex flex-col items-center transform transition-all duration-300 hover:shadow-neu-pressed text-center group relative overflow-hidden border-2 border-blue-600/50">
                                <h3 className="text-2xl font-extrabold text-blue-800 mb-2 relative z-10">Are you a Player?</h3>
                                <p className="text-blue-600/80 mb-6 relative z-10 max-w-xs mx-auto font-medium">Create your official digital profile and get your unique CricID today.</p>

                                <button
                                    onClick={() => navigate('/signup-player')}
                                    className="px-6 py-3 bg-[#E3EDF7] text-blue-600 font-bold rounded-xl shadow-neu-button hover:shadow-neu-pressed hover:text-blue-700 transition-all active:scale-95 relative z-10 w-full sm:w-auto border border-blue-200"
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
