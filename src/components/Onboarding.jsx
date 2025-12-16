import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { updateProfile } from '../lib/supabase';
import { Sparkles, Wallet, MessageCircle, ArrowRight, Check, Globe, DollarSign } from 'lucide-react';

const STEPS = [
    { id: 'welcome', icon: Sparkles },
    { id: 'balance', icon: Wallet },
    { id: 'telegram', icon: MessageCircle },
    { id: 'preferences', icon: Globe },
];

export default function Onboarding({ onComplete }) {
    const { user, fetchProfile } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [step, setStep] = useState(0);
    const [startingBalance, setStartingBalance] = useState('');
    const [telegramChatId, setTelegramChatId] = useState('');
    const [currency, setCurrency] = useState('IDR');
    const [saving, setSaving] = useState(false);

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        }
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            await updateProfile(user.id, {
                starting_balance: parseFloat(startingBalance) || 0,
                telegram_chat_id: telegramChatId || null,
                currency,
                language,
                onboarding_completed: true,
            });
            await fetchProfile(user.id);
            onComplete?.();
        } catch (error) {
            console.error('Error saving onboarding:', error);
        }
        setSaving(false);
    };

    const isIndonesian = language === 'id';

    const content = {
        welcome: {
            title: isIndonesian ? `Selamat datang, ${user?.username?.split(' ')[0]}! 🎉` : `Welcome, ${user?.username?.split(' ')[0]}! 🎉`,
            subtitle: isIndonesian
                ? 'BudgeTown akan membantu kamu mengelola keuangan dengan mudah. Mari setup beberapa hal dulu!'
                : "BudgeTown will help you manage your finances easily. Let's set up a few things!",
        },
        balance: {
            title: isIndonesian ? 'Saldo Awal' : 'Starting Balance',
            subtitle: isIndonesian
                ? 'Berapa saldo kamu saat ini? Ini akan jadi titik awal tracking keuangan kamu.'
                : 'What is your current balance? This will be the starting point for your financial tracking.',
        },
        telegram: {
            title: isIndonesian ? 'Koneksi Telegram (Opsional)' : 'Telegram Connection (Optional)',
            subtitle: isIndonesian
                ? 'Hubungkan Telegram untuk mendapat notifikasi saldo harian dan input transaksi via chat!'
                : 'Connect Telegram to receive daily balance notifications and input transactions via chat!',
        },
        preferences: {
            title: isIndonesian ? 'Preferensi' : 'Preferences',
            subtitle: isIndonesian
                ? 'Pilih bahasa dan mata uang yang kamu gunakan.'
                : 'Choose your language and currency.',
        },
    };

    const CurrentIcon = STEPS[step].icon;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Progress */}
                <div className="flex gap-2 p-4 bg-gray-50 dark:bg-gray-900">
                    {STEPS.map((s, i) => (
                        <div
                            key={s.id}
                            className={`flex-1 h-2 rounded-full transition-colors ${i <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        />
                    ))}
                </div>

                <div className="p-8">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
                        <CurrentIcon size={40} className="text-primary-600 dark:text-primary-400" />
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                        {content[STEPS[step].id].title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
                        {content[STEPS[step].id].subtitle}
                    </p>

                    {/* Step-specific content */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-500/10">
                                <Check size={20} className="text-green-600" />
                                <span className="text-green-700 dark:text-green-400">
                                    {isIndonesian ? 'Track pemasukan & pengeluaran' : 'Track income & expenses'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                                <Check size={20} className="text-blue-600" />
                                <span className="text-blue-700 dark:text-blue-400">
                                    {isIndonesian ? 'Input via foto struk (AI)' : 'Input via receipt photo (AI)'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                                <Check size={20} className="text-purple-600" />
                                <span className="text-purple-700 dark:text-purple-400">
                                    {isIndonesian ? 'Notifikasi Telegram harian' : 'Daily Telegram notifications'}
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                            <input
                                type="number"
                                value={startingBalance}
                                onChange={(e) => setStartingBalance(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-2xl font-bold text-center"
                                placeholder="0"
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-sm text-blue-700 dark:text-blue-400">
                                <p className="font-medium mb-2">
                                    {isIndonesian ? 'Cara mendapatkan Chat ID:' : 'How to get your Chat ID:'}
                                </p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>{isIndonesian ? 'Buka @BudgeTownBot di Telegram' : 'Open @BudgeTownBot on Telegram'}</li>
                                    <li>{isIndonesian ? 'Ketik /start' : 'Type /start'}</li>
                                    <li>{isIndonesian ? 'Copy Chat ID yang diberikan' : 'Copy the Chat ID given'}</li>
                                </ol>
                            </div>
                            <input
                                type="text"
                                value={telegramChatId}
                                onChange={(e) => setTelegramChatId(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-center"
                                placeholder={isIndonesian ? 'Telegram Chat ID (opsional)' : 'Telegram Chat ID (optional)'}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    {isIndonesian ? 'Bahasa' : 'Language'}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setLanguage('en')}
                                        className={`p-4 rounded-xl border-2 transition-all ${language === 'en' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-200 dark:border-gray-600'}`}
                                    >
                                        🇺🇸 English
                                    </button>
                                    <button
                                        onClick={() => setLanguage('id')}
                                        className={`p-4 rounded-xl border-2 transition-all ${language === 'id' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'border-gray-200 dark:border-gray-600'}`}
                                    >
                                        🇮🇩 Indonesia
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    {isIndonesian ? 'Mata Uang' : 'Currency'}
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                >
                                    <option value="IDR">🇮🇩 Indonesian Rupiah (Rp)</option>
                                    <option value="USD">🇺🇸 US Dollar ($)</option>
                                    <option value="SGD">🇸🇬 Singapore Dollar (S$)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900 flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                        >
                            {isIndonesian ? 'Kembali' : 'Back'}
                        </button>
                    )}
                    <button
                        onClick={step === STEPS.length - 1 ? handleFinish : handleNext}
                        disabled={saving}
                        className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <span>{isIndonesian ? 'Menyimpan...' : 'Saving...'}</span>
                        ) : step === STEPS.length - 1 ? (
                            <>
                                <Check size={20} />
                                {isIndonesian ? 'Selesai' : 'Finish'}
                            </>
                        ) : (
                            <>
                                {isIndonesian ? 'Lanjut' : 'Next'}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
