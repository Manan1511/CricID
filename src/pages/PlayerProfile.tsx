
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, User, Trophy, Calendar, Activity, MapPin, Shield } from 'lucide-react';
import type { Profile, PlayerStatsSummary } from '../lib/types';

interface ExtendedProfile extends Omit<Profile, 'stats'> {
    recent_matches?: any[];
    team_city?: string;
    stats?: PlayerStatsSummary | null;
}

export default function PlayerProfile() {
    const { id } = useParams<{ id: string }>();
    const [profile, setProfile] = useState<ExtendedProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchProfile(id);
    }, [id]);

    async function fetchProfile(playerId: string) {
        setLoading(true);
        // Fetch profile, team, and ALL match performances
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select(`
                *,
                team_members (
                    teams (name, city)
                )
            `)
            .eq('id', playerId)
            .single();

        if (profileError) {
            console.error("Error fetching profile:", profileError);
            setError("Player not found or error loading profile.");
            setLoading(false);
            return;
        }

        // Fetch Advanced Stats Summary
        const { data: statsData } = await supabase
            .from('player_stats_summary')
            .select('*')
            .eq('player_id', playerId)
            .single();

        // Fetch Match Performances Separately
        const { data: performanceData, error: perfError } = await supabase
            .from('match_performances')
            .select(`
                runs_scored,
                balls_faced,
                wickets_taken,
                runs_conceded,
                is_out,
                matches (
                    date,
                    tournament_name,
                    venue
                )
            `)
            .eq('player_id', playerId);

        if (perfError) {
            console.error("Error fetching performances:", perfError);
        } else {
            console.log("Fetched Perfs:", performanceData);
        }

        const performances = performanceData || [];

        setProfile({
            ...profileData,
            team_name: profileData.team_members?.[0]?.teams?.name || "Free Agent",
            team_city: profileData.team_members?.[0]?.teams?.city,
            stats: statsData, // Use the pre-calculated view data
            // Sort recent matches by date descending
            recent_matches: performances.sort((a: any, b: any) => {
                const dateA = a.matches?.date ? new Date(a.matches.date).getTime() : 0;
                const dateB = b.matches?.date ? new Date(b.matches.date).getTime() : 0;
                return dateB - dateA;
            }).slice(0, 5) // Show last 5
        });
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Player Not Found</h2>
                <p className="mt-2 text-gray-500">{error || "The requested profile does not exist."}</p>
                <div className="mt-6">
                    <Link to="/stats" className="text-blue-600 hover:text-blue-500 font-medium">
                        &larr; Back to Stats
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header / Banner */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex items-center">
                            <img
                                className="h-24 w-24 rounded-full bg-gray-100 object-cover border-4 border-white shadow-sm"
                                src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random&size=128`}
                                alt={profile.full_name}
                            />
                            <div className="ml-6">
                                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                                <div className="flex items-center mt-2 text-gray-500 text-sm">
                                    <span className="flex items-center mr-4">
                                        <Shield className="flex-shrink-0 mr-1.5 h-4 w-4 text-blue-500" />
                                        {profile.cric_id}
                                    </span>
                                    <span className="flex items-center mr-4">
                                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                        {profile.team_name} {profile.team_city ? `(${profile.team_city})` : ''}
                                    </span>
                                    {profile.is_verified && (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Left Column: Personal Info */}
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Personal Details</h3>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" /> Date of Birth
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile.date_of_birth || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <User className="h-4 w-4 mr-2" /> Role
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile.playing_role || profile.role}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <Activity className="h-4 w-4 mr-2" /> Batting Style
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile.batting_style || 'Not Specified'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <Activity className="h-4 w-4 mr-2" /> Bowling Style
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile.bowling_style || 'Not Specified'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Right Column: Stats & Performance */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Key Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="bg-white overflow-hidden shadow rounded-lg p-5 text-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Total Runs</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{profile.stats?.total_runs || 0}</dd>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg p-5 text-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Batting Avg</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{Number(profile.stats?.batting_avg || 0).toFixed(2)}</dd>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg p-5 text-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Strike Rate</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{Number(profile.stats?.batting_strike_rate || 0).toFixed(2)}</dd>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg p-5 text-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">High Score</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{profile.stats?.high_score || 0}</dd>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg p-5 text-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Wickets</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{profile.stats?.total_wickets || 0}</dd>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg p-5 text-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Economy</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{Number(profile.stats?.bowling_economy_rate || 0).toFixed(2)}</dd>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg p-5 text-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Bowling Avg</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{Number(profile.stats?.bowling_avg || 0).toFixed(2)}</dd>
                            </div>
                            <div className="bg-white overflow-hidden shadow rounded-lg p-5 text-center">
                                <dt className="text-sm font-medium text-gray-500 truncate">Matches</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{profile.stats?.matches_played || 0}</dd>
                            </div>
                        </div>

                        {/* Recent Matches */}
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" /> Recent Performances
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match/Venue</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Runs</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wickets</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {profile.recent_matches && profile.recent_matches.length > 0 ? (
                                            profile.recent_matches.map((perf: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(perf.matches?.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div className="font-medium">{perf.matches?.tournament_name || 'Friendly'}</div>
                                                        <div className="text-xs text-gray-500">{perf.matches?.venue}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                        {perf.runs_scored}{!perf.is_out && '*'} ({perf.balls_faced})
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {perf.wickets_taken}/{perf.runs_conceded}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                                                    No recent match data available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
