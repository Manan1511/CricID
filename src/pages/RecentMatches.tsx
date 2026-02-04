
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, MapPin, Trophy } from 'lucide-react';
import type { Match } from '../lib/types';

export default function RecentMatches() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    async function fetchMatches() {
        // Fetch completed matches from the matches table
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching matches:', error);
        } else {
            setMatches(data || []);
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto bg-[#E3EDF7] rounded-[3rem] shadow-neu-flat p-8 sm:p-12 min-h-[80vh]">
                <h1 className="text-3xl font-extrabold text-gray-700 mb-8 drop-shadow-sm px-2">Recent Matches</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {matches.length > 0 ? (
                        matches.map((match) => (
                            <Link
                                key={match.id}
                                to={`/match/${match.id}`}
                                className="block bg-[#E3EDF7] shadow-neu-flat rounded-2xl hover:shadow-neu-pressed transition-all duration-300 border-none group"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2 font-medium">
                                            <Calendar className="h-4 w-4 drop-shadow-sm" />
                                            <span>{new Date(match.date).toLocaleDateString()}</span>
                                        </div>
                                        {match.is_official && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E3EDF7] text-blue-600 shadow-neu-pressed">
                                                Official
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-1 line-clamp-2 drop-shadow-sm group-hover:text-blue-600 transition-colors">
                                        {match.tournament_name || 'Friendly Match'}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-2 font-medium">
                                        <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                                        {match.venue || 'Unknown Venue'}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        View Scorecard &rarr;
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-[#E3EDF7] rounded-xl">
                            <Trophy className="mx-auto h-12 w-12 text-blue-300" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
                            <p className="mt-1 text-sm text-gray-500">Check back later for recent match results.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
