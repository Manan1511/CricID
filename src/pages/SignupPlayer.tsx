
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, User, Calendar, Activity, CheckCircle } from 'lucide-react';

export default function SignupPlayer() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        dob: '',
        role: 'Batter'
    });
    const [error, setError] = useState<string | null>(null);
    const [generatedId, setGeneratedId] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Sign up auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                    dob: formData.dob,
                    role: formData.role,
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
            // 2. Generate Unique ID (Simulated server-side logic)
            // In production, this would be a database trigger or Edge Function
            const uniqueId = `CT-${Math.floor(100000 + Math.random() * 900000)}`;

            // Simulate DB insertion delay
            setTimeout(() => {
                setGeneratedId(uniqueId);
                setLoading(false);
            }, 1000);

            // Ideally: await supabase.from('players').insert({ id: uniqueId, user_id: authData.user.id, ... })
        }
    };

    if (generatedId) {
        return (
            <div className="flex bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 justify-center min-h-[calc(100vh-4rem)] items-center">
                <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="rounded-full bg-green-100 p-3 mx-auto w-fit">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold text-gray-900">Welcome to CricTrac!</h2>
                        <p className="text-gray-500">Your player profile has been created.</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <p className="text-sm text-blue-600 font-medium uppercase tracking-wide">Your Unique Player ID</p>
                        <p className="text-4xl font-mono font-bold text-blue-900 mt-2 tracking-wider select-all">{generatedId}</p>
                        <p className="text-xs text-blue-500 mt-2">Please save this ID. You will need it for official matches.</p>
                    </div>

                    <div className="pt-4">
                        <Link to="/login" className="block w-full text-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            Continue to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 justify-center min-h-[calc(100vh-4rem)]">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Player Registration
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create your official player profile and get your CricID
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Full Name */}
                        <div className="relative">
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                className="appearance-none rounded-none rounded-t-md relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name (as per ID proof)"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 z-10" />
                        </div>

                        {/* DOB */}
                        <div className="relative">
                            <input
                                id="dob"
                                name="dob"
                                type="date"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 z-10" />
                        </div>

                        {/* Role */}
                        <div className="relative">
                            <select
                                id="role"
                                name="role"
                                className="appearance-none rounded-none relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="Batter">Batter</option>
                                <option value="Bowler">Bowler</option>
                                <option value="All-Rounder">All-Rounder</option>
                                <option value="Wicket Keeper">Wicket Keeper</option>
                            </select>
                            <Activity className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 z-10" />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 z-10" />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none rounded-b-md relative block w-full px-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 z-10" />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                <>
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                                    </span>
                                    Register Player
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
