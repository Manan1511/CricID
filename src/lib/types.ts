
export type UserRole = 'player' | 'scout' | 'official' | 'admin';

export interface Profile {
    id: string; // uuid references auth.users
    cric_id: string;
    full_name: string;
    role: UserRole;
    date_of_birth: string;
    nationality?: string;
    is_verified: boolean;
    batting_style?: string;
    bowling_style?: string;
    playing_role?: string;
    avatar_url?: string;
    created_at: string;
    // Computed/Joined fields for UI
    team_name?: string;
    stats?: PlayerStats;
}

export interface Team {
    id: string;
    name: string;
    logo_url?: string;
    city?: string;
}

export interface TeamMember {
    id: string;
    team_id: string;
    player_id: string;
    joined_at: string;
    is_active: boolean;
    teams?: Team; // For joined queries
}

export interface Match {
    id: string;
    date: string;
    tournament_name?: string;
    is_official: boolean;
    venue?: string;
    created_by?: string;
}

export interface MatchPerformance {
    id: string;
    match_id: string;
    player_id: string;
    runs_scored: number;
    balls_faced: number;
    wickets_taken: number;
    runs_conceded: number;
    balls_bowled: number; // Added
    is_out: boolean;
    verified_by_official: boolean;
}

export interface PlayerStatsSummary {
    player_id: string;
    full_name: string;
    cric_id: string;
    avatar_url?: string;
    playing_role?: string;
    matches_played: number;
    total_runs: number;
    high_score: number;
    batting_avg: number;
    batting_strike_rate: number;
    total_wickets: number;
    bowling_economy_rate: number;
    bowling_avg: number;
}

export interface ScoutWatchlist {
    id: string;
    scout_id: string;
    player_id: string;
    notes?: string;
    added_at: string;
    profiles?: Profile; // For joined queries
}

export interface PlayerStats {
    matches: number;
    innings: number;
    runs: number;
    average: number;
    wickets: number;
}
