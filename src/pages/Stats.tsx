
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Search } from 'lucide-react';

interface Player {
    id: string;
    avatar_url?: string;
    name: string;
    team: string;
    role: 'Batter' | 'Bowler' | 'All-Rounder';
    batting_style?: string;
    matches: number;
    innings: number;
    runs: number;
    average: number;
}

// Mock Data for initial rendering when DB is empty or connection fails
const MOCK_PLAYERS: Player[] = [
    { id: '1', name: 'Virat Kohli', team: 'India', role: 'Batter', batting_style: 'Right Hand', matches: 275, innings: 265, runs: 13000, average: 57.3 },
    { id: '2', name: 'Jasprit Bumrah', team: 'India', role: 'Bowler', batting_style: 'Right Hand', matches: 80, innings: 30, runs: 150, average: 10.5 },
    { id: '3', name: 'Steve Smith', team: 'Australia', role: 'Batter', batting_style: 'Right Hand', matches: 150, innings: 145, runs: 8500, average: 59.1 },
    { id: '4', name: 'Ben Stokes', team: 'England', role: 'All-Rounder', batting_style: 'Left Hand', matches: 100, innings: 90, runs: 4500, average: 36.5 },
];

export default function Stats() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [players] = useState<Player[]>(MOCK_PLAYERS); // Start with mock
    const [filteredPlayers, setFilteredPlayers] = useState<Player[]>(MOCK_PLAYERS);
    const [roleFilter, setRoleFilter] = useState('All');
    const [battingStyleFilter, setBattingStyleFilter] = useState('All');

    const navigate = useNavigate();

    useEffect(() => {
        // Ideally fetch from Supabase here
        // const { data } = await supabase.from('players').select('*');
        // if (data) setPlayers(data);

        // For now, filtering mock data based on query
    }, []);

    useEffect(() => {
        let result = players;

        if (searchQuery) {
            result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (roleFilter !== 'All') {
            result = result.filter(p => p.role === roleFilter);
        }

        if (battingStyleFilter !== 'All') {
            result = result.filter(p => p.batting_style === battingStyleFilter);
        }

        setFilteredPlayers(result);
    }, [searchQuery, roleFilter, battingStyleFilter, players]);

    const handleTrack = async (playerId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please login to track players.");
            navigate('/login');
            return;
        }

        // Add to watchlist
        const { error } = await supabase
            .from('user_watchlist')
            .insert([{ user_id: user.id, player_id: playerId }]);

        if (error) {
            console.error('Error tracking player:', error);
            // Fallback alert for demo if table doesn't exist
            alert(`Track clicked for player ID: ${playerId}. (Ensure 'user_watchlist' table exists)`);
        } else {
            alert("Player added to watchlist!");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Stats Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-700">A comprehensive list of all verified players.</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
                        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border"
                    >
                        <option value="All">All Roles</option>
                        <option value="Batter">Batter</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-Rounder">All-Rounder</option>
                    </select>
                    <select
                        value={battingStyleFilter}
                        onChange={(e) => setBattingStyleFilter(e.target.value)}
                        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border"
                    >
                        <option value="All">All Styles</option>
                        <option value="Right Hand">Right Hand</option>
                        <option value="Left Hand">Left Hand</option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Team</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Matches</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Innings</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Runs</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Avg</th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Track</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredPlayers.map((player) => (
                                        <tr key={player.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img className="h-10 w-10 rounded-full bg-gray-100" src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.name}&background=random`} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-gray-900">{player.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{player.team}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{player.role}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{player.matches}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{player.innings}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{player.runs}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{player.average}</td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <button
                                                    onClick={() => handleTrack(player.id)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1 justify-end ml-auto"
                                                >
                                                    <UserPlus className="h-4 w-4" /> Track
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
