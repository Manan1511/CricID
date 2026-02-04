
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Player {
    id: string;
    name: string;
    team: string;
    role: string;
    avatar_url?: string;
}

export default function Watchlist() {
    const [watchlist, setWatchlist] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            fetchWatchlist(user.id);
        } else {
            setLoading(false);
        }
    }

    async function fetchWatchlist(userId: string) {
        // Assumption: 'user_watchlist' table links user_id to player_id
        // And we join with 'players' table
        console.log("Fetching watchlist for", userId);

        // Simulating mock data for now as we don't have the table schema guaranteed
        // In real implementation:
        // const { data, error } = await supabase.from('user_watchlist').select('players(*)').eq('user_id', userId);

        setWatchlist([
            { id: '1', name: 'Virat Kohli', team: 'India', role: 'Batter' },
            { id: '3', name: 'Steve Smith', team: 'Australia', role: 'Batter' },
        ]);
        setLoading(false);
    }

    const handleRemove = async (playerId: string) => {
        if (!user) return;

        // const { error } = await supabase.from('user_watchlist').delete().match({ user_id: user.id, player_id: playerId });

        // Optimistic update
        setWatchlist(watchlist.filter(p => p.id !== playerId));

        // alert("Removed from watchlist");
    };

    if (!user && !loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
                <p className="mt-1 text-sm text-gray-500">Please login to view your watchlist.</p>
                <div className="mt-6">
                    <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-semibold text-gray-900">Your Watchlist</h1>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {watchlist.length === 0 ? (
                    <p className="text-gray-500">No players in your watchlist.</p>
                ) : (
                    watchlist.map((player) => (
                        <div key={player.id} className="bg-white overflow-hidden shadow rounded-lg flex items-center p-6 space-x-4 border border-gray-100">
                            <img className="h-12 w-12 rounded-full bg-gray-100" src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.name}&background=random`} alt="" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{player.name}</p>
                                <p className="text-sm text-gray-500 truncate">{player.team} • {player.role}</p>
                            </div>
                            <button
                                onClick={() => handleRemove(player.id)}
                                className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
