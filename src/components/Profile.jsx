import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getStartingBalance, setStartingBalance } from '../utils/storage';
import { User, Mail, Calendar, Wallet, Moon, Sun, Monitor, Camera, Save, Check, Loader2, Globe } from 'lucide-react';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [username, setUsername] = useState(user.username);
    const [startBalance, setStartBalance] = useState(getStartingBalance(user.id));
    const [currency, setCurrency] = useState(user.currency || 'IDR');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            updateUser({ username, currency });
            setStartingBalance(user.id, startBalance);
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 500);
    };

    const themeOptions = [
        { id: 'light', label: 'Light', icon: Sun },
        { id: 'dark', label: 'Dark', icon: Moon },
        { id: 'system', label: 'System', icon: Monitor },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="glass-strong rounded-3xl p-8 shadow-xl border border-white/10 animate-fade-in-up stagger-1">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary-500/30 transition-all group-hover:ring-primary-500/60">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full gradient-primary flex items-center justify-center text-white text-4xl font-bold">
                                    {user.username[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        {user.provider === 'google' && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center sm:text-left flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.username}</h2>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <Mail size={16} />
                            {user.email}
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Joined {formatDate(user.createdAt)}
                            </span>
                            {user.provider === 'google' && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-medium">
                                    Google Account
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Personal Info */}
                <div className="glass-strong rounded-3xl p-6 shadow-xl border border-white/10 animate-fade-in-up stagger-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={20} className="text-primary-500" />
                        Personal Information
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            >
                                <option value="IDR">🇮🇩 Indonesian Rupiah (Rp)</option>
                                <option value="USD">🇺🇸 US Dollar ($)</option>
                                <option value="EUR">🇪🇺 Euro (€)</option>
                                <option value="GBP">🇬🇧 British Pound (£)</option>
                                <option value="JPY">🇯🇵 Japanese Yen (¥)</option>
                                <option value="SGD">🇸🇬 Singapore Dollar (S$)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                <Globe size={16} />
                                {t('profile.language')}
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            >
                                <option value="en">🇺🇸 English</option>
                                <option value="id">🇮🇩 Bahasa Indonesia</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="glass-strong rounded-3xl p-6 shadow-xl border border-white/10 animate-fade-in-up stagger-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Wallet size={20} className="text-accent-500" />
                        Financial Settings
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Starting Balance</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                <input
                                    type="number"
                                    value={startBalance}
                                    onChange={(e) => setStartBalance(parseFloat(e.target.value) || 0)}
                                    onWheel={(e) => e.target.blur()}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">This is your initial balance before any transactions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Selection */}
            <div className="glass-strong rounded-3xl p-6 shadow-xl border border-white/10 animate-fade-in-up stagger-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme Preference</h3>

                <div className="grid grid-cols-3 gap-4">
                    {themeOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setTheme(option.id)}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 btn-hover ${theme === option.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === option.id ? 'gradient-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}>
                                <option.icon size={24} />
                            </div>
                            <span className={`text-sm font-medium ${theme === option.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end animate-fade-in-up stagger-5">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 rounded-xl gradient-primary text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 btn-hover disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : saved ? (
                        <>
                            <Check size={20} />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
