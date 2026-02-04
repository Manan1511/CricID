
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;
    const linkClasses = (path: string) => isActive(path)
        ? "inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl text-blue-600 shadow-neu-pressed transition-all active:scale-95"
        : "inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-gray-500 hover:text-gray-700 shadow-neu-flat hover:shadow-neu-pressed transition-all active:scale-95";

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <nav className="bg-[#E3EDF7] m-4 rounded-2xl shadow-neu-flat">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <Activity className="h-8 w-8 text-blue-600 drop-shadow-sm" />
                            <span className="font-bold text-xl tracking-tight text-gray-700">CricTrac</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
                            <Link to="/" className={linkClasses('/')}>
                                Home
                            </Link>
                            <Link to="/stats" className={linkClasses('/stats')}>
                                Stats
                            </Link>
                            <Link to="/matches" className={linkClasses('/matches')}>
                                Matches
                            </Link>
                            <Link to="/watchlist" className={linkClasses('/watchlist')}>
                                Watchlist
                            </Link>
                            <Link to="/about" className={linkClasses('/about')}>
                                About
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-700 font-medium">Hi, {user.email?.split('@')[0]}</span>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-gray-700 shadow-neu-flat hover:shadow-neu-pressed transition-all active:scale-95"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-gray-700 shadow-neu-flat hover:shadow-neu-pressed transition-all active:scale-95">
                                    Login
                                </Link>
                                <Link to="/signup" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-blue-600 shadow-neu-flat hover:text-blue-700 hover:shadow-neu-pressed transition-all active:scale-95">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-500 shadow-neu-flat hover:shadow-neu-pressed focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="sm:hidden pb-4 px-2">
                    <div className="pt-2 pb-3 space-y-2">
                        <Link to="/" className="block px-3 py-2 rounded-xl text-base font-medium text-gray-500 hover:text-gray-800 hover:shadow-neu-pressed transition-all">Home</Link>
                        <Link to="/stats" className="block px-3 py-2 rounded-xl text-base font-medium text-gray-500 hover:text-gray-800 hover:shadow-neu-pressed transition-all">Stats</Link>
                        <Link to="/watchlist" className="block px-3 py-2 rounded-xl text-base font-medium text-gray-500 hover:text-gray-800 hover:shadow-neu-pressed transition-all">Watchlist</Link>
                        <Link to="/about" className="block px-3 py-2 rounded-xl text-base font-medium text-gray-500 hover:text-gray-800 hover:shadow-neu-pressed transition-all">About</Link>
                        <Link to="/login" className="block px-3 py-2 rounded-xl text-base font-medium text-gray-500 hover:text-gray-800 hover:shadow-neu-pressed transition-all">Login</Link>
                        <Link to="/signup" className="block px-3 py-2 rounded-xl text-base font-medium text-gray-500 hover:text-gray-800 hover:shadow-neu-pressed transition-all">Sign Up</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
