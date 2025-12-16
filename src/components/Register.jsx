import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, UserPlus, Loader2, Check, X } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
    const { register, loginWithGoogle, googleReady } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordRequirements = [
        { label: 'At least 8 characters', test: (p) => p.length >= 8 },
        { label: 'Contains a number', test: (p) => /\d/.test(p) },
        { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const allPassed = passwordRequirements.every(req => req.test(password));
        if (!allPassed) {
            setError('Please meet all password requirements');
            return;
        }

        setLoading(true);

        try {
            register(username, email, password);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        setError('');
        loginWithGoogle();
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
            {/* Floating Orbs Background */}
            <div className="floating-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl gradient-accent shadow-2xl shadow-accent-500/40 mb-6 animate-bounce-subtle">
                        <span className="text-4xl">🚀</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">Create Account</h1>
                    <p className="text-gray-400 text-lg">Start your financial journey with BudgeTown</p>
                </div>

                {/* Register Form */}
                <div className="glass-strong rounded-3xl p-8 shadow-2xl border border-white/10 animate-fade-in-up stagger-1">
                    {/* Google Sign-Up Button */}
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={!googleReady}
                        className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-semibold text-lg transition-all duration-300 btn-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg mb-6"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {googleReady ? 'Sign up with Google' : 'Loading...'}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <span className="text-gray-500 text-sm font-medium">or register with email</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-scale-in flex items-center gap-2">
                                <span className="text-lg">⚠️</span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2 animate-fade-in stagger-2">
                            <label className="block text-sm font-medium text-gray-300">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-accent-500 focus:bg-white/10 transition-all duration-300"
                                placeholder="johndoe"
                                required
                            />
                        </div>

                        <div className="space-y-2 animate-fade-in stagger-3">
                            <label className="block text-sm font-medium text-gray-300">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-accent-500 focus:bg-white/10 transition-all duration-300"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2 animate-fade-in stagger-4">
                            <label className="block text-sm font-medium text-gray-300">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-accent-500 focus:bg-white/10 transition-all duration-300 pr-14"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password requirements */}
                            <div className="mt-3 space-y-1.5">
                                {passwordRequirements.map((req, i) => (
                                    <div key={i} className={`flex items-center gap-2 text-xs transition-colors duration-200 ${req.test(password) ? 'text-green-400' : 'text-gray-500'}`}>
                                        {req.test(password) ? <Check size={14} /> : <X size={14} />}
                                        {req.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 animate-fade-in stagger-5">
                            <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-5 py-3.5 rounded-2xl bg-white/5 border text-white placeholder-gray-500 focus:border-accent-500 focus:bg-white/10 transition-all duration-300 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-white/10'}`}
                                placeholder="••••••••"
                                required
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-2xl gradient-accent text-white font-semibold text-lg shadow-xl shadow-accent-500/30 hover:shadow-accent-500/50 transition-all duration-300 btn-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 animate-fade-in stagger-6 mt-6"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <UserPlus size={22} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-accent-400 hover:text-accent-300 font-semibold transition-colors hover:underline"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
