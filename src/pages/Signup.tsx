
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, UserPlus } from 'lucide-react';

export default function Signup() {
    /* const navigate = useNavigate(); */
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Attempt signup
        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Optional: Navigate to login or show check email message
            // navigate('/login'); 
        }
    };

    if (success) {
        return (
            <div className="flex bg-[#E3EDF7] py-12 px-4 sm:px-6 lg:px-8 justify-center min-h-[calc(100vh-4rem)] items-center">
                <div className="max-w-md w-full text-center space-y-4 bg-[#E3EDF7] p-8 rounded-2xl shadow-neu-flat">
                    <div className="rounded-full bg-[#E3EDF7] p-4 mx-auto w-fit shadow-neu-button">
                        <Mail className="h-8 w-8 text-green-600 drop-shadow-sm" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-700">Check your email</h2>
                    <p className="text-gray-600">
                        We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox to complete your registration.
                    </p>
                    <div className="mt-6">
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
                            Back to Login
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
                        Create an account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Join CricTrac to start tracking stats
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignup}>
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
                                autoComplete="new-password"
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
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                <>
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <UserPlus className="h-5 w-5 text-blue-600 group-hover:text-blue-700" aria-hidden="true" />
                                    </span>
                                    Sign Up
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                            Sign in
                        </Link>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
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
