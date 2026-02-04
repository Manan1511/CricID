
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Attempt login
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setLoading(false);
            navigate('/stats');
        }
    };



    return (

        <div className="flex bg-[#E3EDF7] py-12 px-4 sm:px-6 lg:px-8 justify-center min-h-[calc(100vh-4rem)]">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-700 drop-shadow-sm">
                        Sign in to CricTrac
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Access stats, watchlist, and more
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-10 py-3 border-none bg-[#E3EDF7] shadow-neu-pressed rounded-xl placeholder-gray-400 focus:outline-none text-gray-700 sm:text-sm transition-shadow"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none block w-full px-10 py-3 border-none bg-[#E3EDF7] shadow-neu-pressed rounded-xl placeholder-gray-400 focus:outline-none text-gray-700 sm:text-sm transition-shadow"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50/50 p-2 rounded-lg">{error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border-none text-sm font-bold rounded-xl text-blue-600 bg-[#E3EDF7] shadow-neu-button hover:shadow-neu-pressed hover:text-blue-700 focus:outline-none disabled:opacity-50 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
                        </button>
                    </div>
                </form>


                <div className="mt-6 text-center space-y-2">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700">
                            Sign up
                        </Link>
                    </p>
                    <p className="text-xs text-gray-500">
                        Are you a cricketer?{' '}
                        <Link to="/signup-player" className="font-bold text-blue-600 hover:text-blue-700">
                            Register as Player
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
