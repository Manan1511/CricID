
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Profile } from '../lib/types';

interface WatchlistItem extends Profile {
    watchlist_id: string; // ID of the relation row
}

export default function Watchlist() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
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
        // Join scout_watchlist with profiles
        const { data, error } = await supabase
            .from('scout_watchlist')
            .select(`
            id,
            profiles:player_id (
                id,
                full_name,
                role,
                playing_role,
                avatar_url,
                team_members (
                    teams (name)
                )
            )
        `)
            .eq('scout_id', userId);

        if (error) {
            console.error("Error fetching watchlist:", error);
        }

        if (data) {
            const transformed: WatchlistItem[] = data.map((item: any) => ({
                ...item.profiles,
                watchlist_id: item.id,
                team_name: item.profiles.team_members?.[0]?.teams?.name || "Free Agent",
                playing_role: item.profiles.playing_role || item.profiles.role
            }));
            setWatchlist(transformed);
        }
        setLoading(false);
    }

    const handleRemove = async (watchlistId: string) => {
        if (!user) return;

        const { error } = await supabase
            .from('scout_watchlist')
            .delete()
            .eq('id', watchlistId);

        if (error) {
            console.error("Error deleting:", error);
            alert("Failed to remove player.");
        } else {
            // Optimistic update
            setWatchlist(watchlist.filter(p => p.watchlist_id !== watchlistId));
        }
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

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {watchlist.length === 0 ? (
                        <p className="text-gray-500 text-center col-span-full py-8">No players in your watchlist yet.</p>
                    ) : (
                        watchlist.map((player) => (
                            <div key={player.watchlist_id} className="bg-white overflow-hidden shadow rounded-lg flex items-center p-6 space-x-4 border border-gray-100 hover:shadow-md transition-shadow">
                                <img className="h-12 w-12 rounded-full bg-gray-100 object-cover" src={player.avatar_url || `https://ui-avatars.com/api/?name=${player.full_name}&background=random`} alt="" />
                                <div className="flex-1 min-w-0">
                                    <Link to={`/player/${player.id}`} className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 hover:underline">{player.full_name}</Link>
                                    <p className="text-sm text-gray-500 truncate">{player.team_name} • {player.playing_role}</p>
                                </div>
                                <button
                                    onClick={() => handleRemove(player.watchlist_id)}
                                    className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    title="Remove from watchlist"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
