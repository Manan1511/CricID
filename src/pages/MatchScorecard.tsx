
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Calendar, MapPin, User } from 'lucide-react';
import type { MatchScorecardView, Match } from '../lib/types';

export default function MatchScorecard() {
    const { id } = useParams<{ id: string }>();
    const [scorecard, setScorecard] = useState<MatchScorecardView[]>([]);
    const [matchDetails, setMatchDetails] = useState<Match | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchScorecard(id);
    }, [id]);

    async function fetchScorecard(matchId: string) {
        setLoading(true);

        // Fetch Match Details
        const { data: matchData } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        setMatchDetails(matchData);

        // Fetch Scorecard Data
        const { data, error } = await supabase
            .from('match_scorecard_view')
            .select('*')
            .eq('match_id', matchId)
            .order('team_name', { ascending: true }); // Groups players by team

        if (error) {
            console.error('Error fetching scorecard:', error);
        } else {
            setScorecard(data || []);
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

    if (!matchDetails) {
        return <div className="text-center py-12">Match not found.</div>;
    }

    // Group by Team
    const teams_map: { [key: string]: MatchScorecardView[] } = {};
    scorecard.forEach(item => {
        const tName = item.team_name || 'Unknown Team';
        if (!teams_map[tName]) teams_map[tName] = [];
        teams_map[tName].push(item);
    });

    const teamNames = Object.keys(teams_map);

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Match Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                        {matchDetails.tournament_name || 'Match Scorecard'}
                    </h1>
                    <div className="flex justify-center items-center text-gray-500 text-sm space-x-6">
                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {new Date(matchDetails.date).toDateString()}</span>
                        <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {matchDetails.venue}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
                {teamNames.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">No player data available for this match.</div>
                )}

                {teamNames.map(team => (
                    <div key={team} className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                {teams_map[team][0]?.team_logo && (
                                    <img src={teams_map[team][0].team_logo} alt={team} className="h-8 w-8 mr-3 rounded-full bg-white p-0.5" />
                                )}
                                {team}
                            </h2>
                        </div>

                        {/* Batting Table */}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Batting</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batter</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">R</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">B</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">SR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {teams_map[team]
                                            .filter(p => p.balls_faced > 0 || p.is_out) // Show only if they batted
                                            .map(p => (
                                                <tr key={p.player_id}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        <Link to={`/player/${p.player_id}`} className="hover:text-blue-600 hover:underline flex items-center">
                                                            <User className="h-4 w-4 mr-2 text-gray-400" />
                                                            {p.player_name}
                                                            {!p.is_out && <span className="ml-1 text-green-600">*</span>}
                                                        </Link>
                                                        <span className="text-xs text-gray-500 block ml-6">{p.player_role.replace(/Batter/g, 'Batsman')}</span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold">{p.runs_scored}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">{p.balls_faced}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">{p.batting_sr}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bowling Table */}
                        <div className="p-4 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Bowling</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bowler</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">O</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">R</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">W</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Econ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {teams_map[team]
                                            .filter(p => p.balls_bowled > 0)
                                            .map(p => (
                                                <tr key={p.player_id + '_bowl'}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        <Link to={`/player/${p.player_id}`} className="hover:text-blue-600 hover:underline">
                                                            {p.player_name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">{p.overs_bowled}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">{p.runs_conceded}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-gray-900">{p.wickets_taken}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">{p.bowling_eco}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
