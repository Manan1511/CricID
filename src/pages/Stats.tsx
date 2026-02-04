
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Search, Loader2, ArrowUpDown } from 'lucide-react';
import type { PlayerStatsSummary } from '../lib/types';

type SortField = 'batting_avg' | 'batting_strike_rate' | 'total_runs' | 'total_wickets' | 'bowling_economy_rate';

export default function Stats() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [players, setPlayers] = useState<PlayerStatsSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Sorting
    const [roleFilter, setRoleFilter] = useState('All');
    const [sortField, setSortField] = useState<SortField>('total_runs');
    const [sortAsc, setSortAsc] = useState(false);

    // Numeric Filters
    const [filters, setFilters] = useState({
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
            const matchRole = roleFilter === 'All' || player.playing_role === roleFilter;

            // Numeric Checks
            const matchRuns = (player.total_runs || 0) >= filters.minRuns;
            const matchWickets = (player.total_wickets || 0) >= filters.minWickets;
            const matchAvg = (player.batting_avg || 0) >= filters.minAvg;
            const matchSR = (player.batting_strike_rate || 0) >= filters.minSR;
            const matchEcon = (player.bowling_economy_rate || 0) <= filters.maxEcon;

            return matchName && matchRole && matchRuns && matchWickets && matchAvg && matchSR && matchEcon;
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
            <div className="mt-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search players..."
                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border min-w-[200px]"
                        >
                            <option value="All">All Roles</option>
                            <option value="Top-order Batter">Top-order Batsman</option>
                            <option value="Opening Batter">Opening Batsman</option>
                            <option value="Middle-order Batter">Middle-order Batsman</option>
                            <option value="Wicketkeeper Batter">Wicketkeeper Batsman</option>
                            <option value="All Rounder">All Rounder</option>
                            <option value="Bowling Allrounder">Bowling Allrounder</option>
                            <option value="Batting Allrounder">Batting Allrounder</option>
                            <option value="Bowler">Bowler</option>
                        </select>
                    </div>
                </div>

                {/* Advanced Range Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Min Stats Range</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="number"
                                placeholder="Min Runs"
                                className="block w-full rounded-md border-gray-300 text-sm border p-1"
                                onChange={(e) => setFilters(prev => ({ ...prev, minRuns: Number(e.target.value) }))}
                            />
                            <input
                                type="number"
                                placeholder="Min Wickets"
                                className="block w-full rounded-md border-gray-300 text-sm border p-1"
                                onChange={(e) => setFilters(prev => ({ ...prev, minWickets: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Batting Criteria</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="number"
                                placeholder="Min Avg"
                                className="block w-full rounded-md border-gray-300 text-sm border p-1"
                                onChange={(e) => setFilters(prev => ({ ...prev, minAvg: Number(e.target.value) }))}
                            />
                            <input
                                type="number"
                                placeholder="Min SR"
                                className="block w-full rounded-md border-gray-300 text-sm border p-1"
                                onChange={(e) => setFilters(prev => ({ ...prev, minSR: Number(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">Bowling Criteria</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="number"
                                placeholder="Max Econ"
                                className="block w-full rounded-md border-gray-300 text-sm border p-1"
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
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Player</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>

                                            {/* Sortable Columns */}
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
                                    <tbody className="divide-y divide-gray-200 bg-white">
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
