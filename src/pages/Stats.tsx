
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Search, Loader2, ArrowUpDown } from 'lucide-react';
import type { PlayerStatsSummary } from '../lib/types';

type SortField = 'matches_played' | 'batting_avg' | 'batting_strike_rate' | 'total_runs' | 'total_wickets' | 'bowling_economy_rate';

export default function Stats() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [players, setPlayers] = useState<PlayerStatsSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Sorting
    const [battingHand, setBattingHand] = useState('All');
    const [bowlingHand, setBowlingHand] = useState('All');
    const [bowlingStyle, setBowlingStyle] = useState('All');
    const [isWicketKeeper, setIsWicketKeeper] = useState('All');

    const [sortField, setSortField] = useState<SortField>('total_runs');
    const [sortAsc, setSortAsc] = useState(false);

    // Numeric Filters
    const [filters, setFilters] = useState({
        minMatches: 0,
        minRuns: 0,
        minWickets: 0,
        minAvg: 0,
        minSR: 0,
        maxEcon: 100
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchPlayers();
    }, []);

    async function fetchPlayers() {
        setLoading(true);

        // Fetch from the new view
        const { data, error } = await supabase
            .from('player_stats_summary')
            .select('*');

        if (error) {
            console.error("Error fetching stats:", error);
            setLoading(false);
            return;
        }

        setPlayers(data || []);
        setLoading(false);
    }

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false); // Default to descending for stats
        }
    };

    // Client-side Filtering & Sorting
    const processedPlayers = players
        .filter(player => {
            const matchName = player.full_name.toLowerCase().includes(searchQuery.toLowerCase());

            // Detailed Role Parsing
            const role = player.playing_role || '';

            // 1. Batting Hand
            const matchBattingHand = battingHand === 'All' || role.includes(battingHand);

            // 2. Bowling Hand
            const matchBowlingHand = bowlingHand === 'All' || role.includes(bowlingHand);

            // 3. Bowling Style
            // Pace matches "Pace"
            // Spin matches "Spin", "Orthodox", "Unorthodox"
            let matchBowlingStyle = true;
            if (bowlingStyle === 'Pace') {
                matchBowlingStyle = role.includes('Pace');
            } else if (bowlingStyle === 'Spin') {
                matchBowlingStyle = role.includes('Spin') || role.includes('Orthodox') || role.includes('Unorthodox');
            }

            // 4. Wicketkeeper
            let matchWicketKeeper = true;
            if (isWicketKeeper === 'Yes') {
                matchWicketKeeper = role.includes('Wicketkeeper');
            } else if (isWicketKeeper === 'No') {
                matchWicketKeeper = !role.includes('Wicketkeeper');
            }

            // Numeric Checks
            const matchMatches = (player.matches_played || 0) >= filters.minMatches;
            const matchRuns = (player.total_runs || 0) >= filters.minRuns;
            const matchWickets = (player.total_wickets || 0) >= filters.minWickets;
            const matchAvg = (player.batting_avg || 0) >= filters.minAvg;
            const matchSR = (player.batting_strike_rate || 0) >= filters.minSR;
            const matchEcon = (player.bowling_economy_rate || 0) <= filters.maxEcon;

            return matchName && matchBattingHand && matchBowlingHand && matchBowlingStyle && matchWicketKeeper && matchMatches && matchRuns && matchWickets && matchAvg && matchSR && matchEcon;
        })
        .sort((a, b) => {
            const valA = (a[sortField] || 0) as number;
            const valB = (b[sortField] || 0) as number;
            return sortAsc ? valA - valB : valB - valA;
        });

    const handleTrack = async (playerId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please login to track players.");
            navigate('/login');
            return;
        }

        const { error } = await supabase
            .from('scout_watchlist')
            .insert([{ scout_id: user.id, player_id: playerId }]);

        if (error) {
            if (error.code === '23505') {
                alert("Player already in your watchlist!");
            } else {
                console.error('Error tracking player:', error);
                alert(`Failed to track player: ${error.message}`);
            }
        } else {
            alert("Player added to watchlist!");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Stats Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-700">Advanced analytics from official match data.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mt-8 bg-[#E3EDF7] p-6 rounded-2xl shadow-neu-flat space-y-6">

                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search players by name..."
                        className="pl-10 block w-full rounded-xl border-none bg-[#E3EDF7] shadow-neu-pressed focus:ring-0 focus:outline-none sm:text-sm py-3 text-gray-700 placeholder-gray-400 transition-shadow"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Role Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Batting Hand */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Batting Hand</label>
                        <select
                            value={battingHand}
                            onChange={(e) => setBattingHand(e.target.value)}
                            className="block w-full rounded-xl border-none bg-[#E3EDF7] p-3 text-sm shadow-neu-pressed focus:ring-0 focus:outline-none text-gray-700 cursor-pointer"
                        >
                            <option value="All">All Batting Styles</option>
                            <option value="Right-hand">Right-hand</option>
                            <option value="Left-hand">Left-hand</option>
                        </select>
                    </div>

                    {/* Bowling Hand */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bowling Hand</label>
                        <select
                            value={bowlingHand}
                            onChange={(e) => setBowlingHand(e.target.value)}
                            className="block w-full rounded-xl border-none bg-[#E3EDF7] p-3 text-sm shadow-neu-pressed focus:ring-0 focus:outline-none text-gray-700 cursor-pointer"
                        >
                            <option value="All">All Bowling Arms</option>
                            <option value="Right-arm">Right-arm</option>
                            <option value="Left-arm">Left-arm</option>
                        </select>
                    </div>

                    {/* Bowling Style */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bowling Style</label>
                        <select
                            value={bowlingStyle}
                            onChange={(e) => setBowlingStyle(e.target.value)}
                            className="block w-full rounded-xl border-none bg-[#E3EDF7] p-3 text-sm shadow-neu-pressed focus:ring-0 focus:outline-none text-gray-700 cursor-pointer"
                        >
                            <option value="All">All Bowling Types</option>
                            <option value="Pace">Pace</option>
                            <option value="Spin">Spin</option>
                        </select>
                    </div>

                    {/* Wicketkeeper Checkbox */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 opacity-0 select-none">Role</label>
                        <label className="flex items-center justify-center w-full rounded-xl border-none bg-[#E3EDF7] p-3 text-sm shadow-neu-pressed cursor-pointer hover:text-blue-600 transition-colors">
                            <input
                                type="checkbox"
                                className="h-4 w-4 accent-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer mr-2"
                                checked={isWicketKeeper === 'Yes'}
                                onChange={(e) => setIsWicketKeeper(e.target.checked ? 'Yes' : 'All')}
                            />
                            <span className="font-bold text-gray-600">Is Wicketkeeper</span>
                        </label>
                    </div>
                </div>

                {/* Advanced Range Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-200/50 pt-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Stats Range</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="number"
                                placeholder="Min Matches"
                                className="block w-full rounded-xl border-none bg-[#E3EDF7] shadow-neu-pressed p-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none"
                                onChange={(e) => setFilters(prev => ({ ...prev, minMatches: Number(e.target.value) }))}
                            />
                            <input
                                type="number"
                                placeholder="Min Runs"
                                className="block w-full rounded-xl border-none bg-[#E3EDF7] shadow-neu-pressed p-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none"
                                onChange={(e) => setFilters(prev => ({ ...prev, minRuns: Number(e.target.value) }))}
                            />
                            <input
                                type="number"
                                placeholder="Min Wickets"
                                className="block w-full rounded-xl border-none bg-[#E3EDF7] shadow-neu-pressed p-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none"
                                onChange={(e) => setFilters(prev => ({ ...prev, minWickets: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Batting Criteria</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="number"
                                placeholder="Min Avg"
                                className="block w-full rounded-xl border-none bg-[#E3EDF7] shadow-neu-pressed p-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none"
                                onChange={(e) => setFilters(prev => ({ ...prev, minAvg: Number(e.target.value) }))}
                            />
                            <input
                                type="number"
                                placeholder="Min SR"
                                className="block w-full rounded-xl border-none bg-[#E3EDF7] shadow-neu-pressed p-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none"
                                onChange={(e) => setFilters(prev => ({ ...prev, minSR: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bowling Criteria</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="number"
                                placeholder="Max Econ"
                                className="block w-full rounded-xl border-none bg-[#E3EDF7] shadow-neu-pressed p-3 text-sm text-gray-700 placeholder-gray-400 focus:ring-0 focus:outline-none"
                                onChange={(e) => setFilters(prev => ({ ...prev, maxEcon: Number(e.target.value) || 100 }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="mt-8 flex flex-col">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow-neu-flat rounded-2xl bg-[#E3EDF7]">
                                <table className="min-w-full divide-y divide-gray-200/50">
                                    <thead className="bg-[#E3EDF7]">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Player</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>

                                            {/* Sortable Columns */}
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                                                onClick={() => handleSort('matches_played')}
                                            >
                                                <div className="flex items-center">Mat <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-600" /></div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                                                onClick={() => handleSort('total_runs')}
                                            >
                                                <div className="flex items-center">Runs <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-600" /></div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                                                onClick={() => handleSort('batting_avg')}
                                            >
                                                <div className="flex items-center">Avg <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-600" /></div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                                                onClick={() => handleSort('batting_strike_rate')}
                                            >
                                                <div className="flex items-center">SR <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-600" /></div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                                                onClick={() => handleSort('total_wickets')}
                                            >
                                                <div className="flex items-center">Wkts <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-600" /></div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                                                onClick={() => handleSort('bowling_economy_rate')}
                                            >
                                                <div className="flex items-center">Econ <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-600" /></div>
                                            </th>

                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Track</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200/50 bg-[#E3EDF7] text-gray-700">
                                        {processedPlayers.length > 0 ? (
                                            processedPlayers.map((player) => (
                                                <tr key={player.player_id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                <img className="h-10 w-10 rounded-full bg-gray-100 object-cover" src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.full_name}&background=random`} alt="" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <Link to={`/player/${player.player_id}`} className="font-medium text-gray-900 hover:text-blue-600 hover:underline">{player.full_name}</Link>
                                                                <div className="text-xs text-gray-500">{player.cric_id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{(player.playing_role || '-').replace(/Batter/g, 'Batsman')}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{player.matches_played}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{player.total_runs}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Number(player.batting_avg || 0).toFixed(2)}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Number(player.batting_strike_rate || 0).toFixed(2)}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 font-medium">{player.total_wickets}</td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Number(player.bowling_economy_rate || 0).toFixed(2)}</td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <button
                                                            onClick={() => handleTrack(player.player_id)}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1 justify-end ml-auto group"
                                                        >
                                                            <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" /> Track
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-gray-500">
                                                    No players found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
