
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, User, Calendar, Activity, CheckCircle } from 'lucide-react';

export default function SignupPlayer() {
    const [loading, setLoading] = useState(false);

    // Detailed Role State
    const [battingHand, setBattingHand] = useState('Right-hand');
    const [bowlingType, setBowlingType] = useState('None'); // None, Wicketkeeper, Pace, Spin
    const [bowlingStyle, setBowlingStyle] = useState('Right-arm Pace'); // Default

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        dob: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [generatedId, setGeneratedId] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Construct the final role string based on user selection
    const getFinalRole = () => {
        const handPrefix = battingHand === 'Right-hand' ? 'Right-hand' : 'Left-hand';

        if (bowlingType === 'None') {
            return `${handPrefix} Specialist Batsman`;
        }

        if (bowlingType === 'Wicketkeeper') {
            return `${handPrefix} Batsman & Wicketkeeper`;
        }

        // Ensure the style matches the hand prefix logic if needed, but per requirements:
        // "Right-hand Batsman & Right-arm Pace"
        return `${handPrefix} Batsman & ${bowlingStyle}`;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const finalRoleString = getFinalRole();
        console.log("Registering Role:", finalRoleString);

        // 1. Sign up auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                    dob: formData.dob,
                    role: finalRoleString,
                    is_player: true
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            // 2. Generate Unique ID
            const uniqueId = `CT-${Math.floor(100000 + Math.random() * 900000)}`;

            // 3. Insert into Profiles table
            // 3. Upsert into Profiles table (safe handling for existing profiles)
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert([
                    {
                        id: authData.user.id,
                        cric_id: uniqueId,
                        full_name: formData.fullName,
                        date_of_birth: formData.dob,
                        role: 'player',
                        playing_role: finalRoleString,
                        is_verified: false
                    }
                ], { onConflict: 'id' })
                .select();

            if (profileError) {
                console.error("Profile creation failed:", profileError);
                setError("Account created but profile setup failed: " + profileError.message);
                setLoading(false);
            } else {
                setGeneratedId(uniqueId);
                setLoading(false);
            }
        }
    };

    if (generatedId) {
        return (
            <div className="flex bg-[#E3EDF7] py-12 px-4 sm:px-6 lg:px-8 justify-center min-h-[calc(100vh-4rem)] items-center">
                <div className="max-w-md w-full text-center space-y-6 bg-[#E3EDF7] p-8 rounded-2xl shadow-neu-flat">
                    <div className="rounded-full bg-[#E3EDF7] p-4 mx-auto w-fit shadow-neu-button">
                        <CheckCircle className="h-10 w-10 text-green-600 drop-shadow-sm" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold text-gray-700">Welcome to CricTrac!</h2>
                        <p className="text-gray-500">Your player profile has been created.</p>
                    </div>

                    <div className="bg-[#E3EDF7] rounded-xl p-6 shadow-neu-pressed">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Your Unique Player ID</p>
                        <p className="text-4xl font-mono font-bold text-gray-700 mt-2 tracking-wider select-all drop-shadow-sm">{generatedId}</p>
                        <p className="text-xs text-gray-500 mt-2">Please save this ID. You will need it for official matches.</p>
                    </div>

                    <div className="pt-4">
                        <Link to="/login" className="block w-full text-center px-4 py-3 border-none text-sm font-bold rounded-xl text-blue-600 bg-[#E3EDF7] shadow-neu-button hover:shadow-neu-pressed hover:text-blue-700 transition-all active:scale-95">
                            Continue to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-[#E3EDF7] py-12 px-4 sm:px-6 lg:px-8 justify-center min-h-[calc(100vh-4rem)]">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-700 drop-shadow-sm">
                        Player Registration
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Create your official player profile and get your CricID
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="rounded-md space-y-4">

                        {/* 1. Full Name */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">Full Name</label>
                            <div className="relative">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border-none bg-[#E3EDF7] shadow-neu-pressed rounded-xl placeholder-gray-400 focus:outline-none text-gray-700 text-base transition-shadow"
                                    placeholder="As per ID proof"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                            </div>
                        </div>

                        {/* 2. DOB */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">Date of Birth</label>
                            <div className="relative">
                                <input
                                    id="dob"
                                    name="dob"
                                    type="date"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border-none bg-[#E3EDF7] shadow-neu-pressed rounded-xl placeholder-gray-400 focus:outline-none text-gray-700 text-base"
                                    value={formData.dob}
                                    onChange={handleChange}
                                />
                                <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                            </div>
                        </div>

                        {/* 3. Role Selection Section */}
                        <div className="bg-[#E3EDF7] p-6 rounded-2xl shadow-neu-flat space-y-6 mt-6">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Activity className="h-6 w-6 text-blue-600 drop-shadow-sm" />
                                <h3 className="text-base font-bold text-gray-700">Cricketing Role</h3>
                            </div>

                            {/* Batting Hand */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Batting Hand</label>
                                <div className="flex space-x-4">
                                    {['Right-hand', 'Left-hand'].map((hand) => (
                                        <label key={hand} className={`flex-1 cursor-pointer rounded-xl p-3 text-center text-sm font-bold transition-all ${battingHand === hand ? 'bg-[#E3EDF7] shadow-neu-pressed text-blue-600' : 'bg-[#E3EDF7] shadow-neu-button text-gray-500 hover:text-gray-700'}`}>
                                            <input
                                                type="radio"
                                                name="battingHand"
                                                value={hand}
                                                className="sr-only"
                                                checked={battingHand === hand}
                                                onChange={() => setBattingHand(hand)}
                                            />
                                            {hand}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Bowling/Secondary Skill Type */}
                            <div>
                                <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-3 ml-1">Bowling / Secondary Skill</label>
                                <div className="relative">
                                    <select
                                        className="appearance-none block w-full bg-[#E3EDF7] border-none shadow-neu-pressed rounded-xl py-3 px-4 pr-10 focus:outline-none text-gray-700 text-base transition-shadow duration-200 cursor-pointer"
                                        value={bowlingType}
                                        onChange={(e) => {
                                            setBowlingType(e.target.value);
                                            // Reset style default based on type
                                            if (e.target.value === 'Pace') setBowlingStyle('Right-arm Pace');
                                            if (e.target.value === 'Spin') setBowlingStyle('Right-arm Off Spin');
                                        }}
                                    >
                                        <option value="None">None (Specialist Batsman)</option>
                                        <option value="Wicketkeeper">Wicketkeeper</option>
                                        <option value="Pace">Pace Bowler</option>
                                        <option value="Spin">Spin Bowler</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Bowling Style */}
                            {bowlingType === 'Pace' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-3 ml-1">Pace Style</label>
                                    <div className="relative">
                                        <select
                                            className="appearance-none block w-full bg-[#E3EDF7] border-none shadow-neu-pressed rounded-xl py-3 px-4 pr-10 focus:outline-none text-gray-700 text-base transition-shadow duration-200 cursor-pointer"
                                            value={bowlingStyle}
                                            onChange={(e) => setBowlingStyle(e.target.value)}
                                        >
                                            <option value="Right-arm Pace">Right-arm Pace</option>
                                            <option value="Left-arm Pace">Left-arm Pace</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {bowlingType === 'Spin' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 uppercase tracking-wide mb-3 ml-1">Spin Style</label>
                                    <div className="relative">
                                        <select
                                            className="appearance-none block w-full bg-[#E3EDF7] border-none shadow-neu-pressed rounded-xl py-3 px-4 pr-10 focus:outline-none text-gray-700 text-base transition-shadow duration-200 cursor-pointer"
                                            value={bowlingStyle}
                                            onChange={(e) => setBowlingStyle(e.target.value)}
                                        >
                                            <option value="Right-arm Off Spin">Right-arm Off Spin</option>
                                            <option value="Right-arm Leg Spin">Right-arm Leg Spin</option>
                                            <option value="Slow Left-arm Orthodox">Slow Left-arm Orthodox</option>
                                            <option value="Left-arm Unorthodox">Left-arm Unorthodox</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">Selected Role:</p>
                                <p className="text-sm font-semibold text-blue-700">{getFinalRole()}</p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">Email Address</label>
                            <div className="relative">
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-10 py-3 border-none bg-[#E3EDF7] shadow-neu-pressed rounded-xl placeholder-gray-400 focus:outline-none text-gray-700 sm:text-sm"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-600 mb-1 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none block w-full px-10 py-3 border-none bg-[#E3EDF7] shadow-neu-pressed rounded-xl placeholder-gray-400 focus:outline-none text-gray-700 sm:text-sm"
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md border border-red-100">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border-none text-sm font-bold rounded-xl text-blue-600 bg-[#E3EDF7] shadow-neu-button hover:shadow-neu-pressed hover:text-blue-700 focus:outline-none disabled:opacity-50 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                <>
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <CheckCircle className="h-5 w-5 text-blue-600 group-hover:text-blue-700" aria-hidden="true" />
                                    </span>
                                    Register Player & Generate ID
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4 space-y-2">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                    <p className="text-xs text-gray-500">
                        Not a player?{' '}
                        <Link to="/signup" className="font-medium text-gray-700 hover:text-gray-900 underline">
                            Regular Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
