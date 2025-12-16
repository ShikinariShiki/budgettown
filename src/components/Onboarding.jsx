import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { setStartingBalance as saveStartingBalance, getUserData, saveUserData } from '../utils/storage';
import { Sparkles, Wallet, MessageCircle, ArrowRight, Check, Globe, Loader2 } from 'lucide-react';

const STEPS = [
    { id: 'welcome', icon: Sparkles },
    { id: 'balance', icon: Wallet },
    { id: 'telegram', icon: MessageCircle },
    { id: 'preferences', icon: Globe },
];

export default function Onboarding({ onComplete }) {
    const { user, updateUser } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [step, setStep] = useState(0);
    const [startingBalance, setStartingBalance] = useState('');
    const [telegramChatId, setTelegramChatId] = useState('');
    const [currency, setCurrency] = useState('IDR');
    const [saving, setSaving] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState('right');

    const handleNext = () => {
        if (step < STEPS.length - 1) {
            setSlideDirection('right');
            setAnimating(true);
            setTimeout(() => {
                setStep(step + 1);
                setAnimating(false);
            }, 200);
        }
    };

    const handleBack = () => {
        setSlideDirection('left');
        setAnimating(true);
        setTimeout(() => {
            setStep(step - 1);
            setAnimating(false);
        }, 200);
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            // Save to localStorage
            if (startingBalance) {
                saveStartingBalance(user.id, parseFloat(startingBalance) || 0);
            }

            // Update user data
            const data = getUserData(user.id);
            data.onboardingCompleted = true;
            data.telegramChatId = telegramChatId || null;
            saveUserData(user.id, data);

            // Update user preferences
            await updateUser({ currency, language });

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
                ? 'BudgeTown akan membantu kamu mengelola keuangan dengan mudah.'
                : "BudgeTown will help you manage your finances easily.",
        },
        balance: {
            title: isIndonesian ? '💰 Saldo Awal' : '💰 Starting Balance',
            subtitle: isIndonesian
                ? 'Berapa saldo kamu saat ini?'
                : 'What is your current balance?',
        },
        telegram: {
            title: isIndonesian ? '📱 Koneksi Telegram' : '📱 Telegram Connection',
            subtitle: isIndonesian
                ? 'Dapatkan notifikasi saldo harian! (Opsional)'
                : 'Get daily balance notifications! (Optional)',
        },
        preferences: {
            title: isIndonesian ? '⚙️ Preferensi' : '⚙️ Preferences',
            subtitle: isIndonesian
                ? 'Pilih bahasa dan mata uang.'
                : 'Choose your language and currency.',
        },
    };

    const CurrentIcon = STEPS[step].icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark animated background */}
            <div className="absolute inset-0 bg-gray-900">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 -left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                    <div className="absolute top-20 right-10 w-72 h-72 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                    <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
                </div>
            </div>

            {/* Modal Card */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up">
                {/* Progress bar */}
                <div className="flex gap-2 p-4 bg-black/20">
                    {STEPS.map((s, i) => (
                        <div
                            key={s.id}
                            className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary-400' : 'bg-white/20'}`}
                        />
                    ))}
                </div>

                {/* Content area with animation */}
                <div
                    className={`p-8 transition-all duration-200 ${animating ? (slideDirection === 'right' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4') : 'opacity-100 translate-x-0'}`}
                >
                    {/* Animated Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30 animate-bounce-subtle">
                        <CurrentIcon size={40} className="text-white" />
                    </div>

                    {/* Title & Subtitle */}
                    <h2 className="text-2xl font-bold text-white text-center mb-2">
                        {content[STEPS[step].id].title}
                    </h2>
                    <p className="text-gray-300 text-center mb-8">
                        {content[STEPS[step].id].subtitle}
                    </p>

                    {/* Step 0: Welcome */}
                    {step === 0 && (
                        <div className="space-y-3">
                            {[
                                { text: isIndonesian ? 'Track pemasukan & pengeluaran' : 'Track income & expenses', color: 'from-green-500/20 to-green-500/10', iconColor: 'text-green-400' },
                                { text: isIndonesian ? 'Input via foto struk (AI)' : 'Input via receipt photo (AI)', color: 'from-blue-500/20 to-blue-500/10', iconColor: 'text-blue-400' },
                                { text: isIndonesian ? 'Notifikasi Telegram harian' : 'Daily Telegram notifications', color: 'from-purple-500/20 to-purple-500/10', iconColor: 'text-purple-400' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${item.color} border border-white/10 animate-fade-in-up`}
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <Check size={20} className={item.iconColor} />
                                    <span className="text-white">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 1: Balance */}
                    {step === 1 && (
                        <div className="relative animate-fade-in-up">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-xl">Rp</span>
                            <input
                                type="number"
                                value={startingBalance}
                                onChange={(e) => setStartingBalance(e.target.value)}
                                onWheel={(e) => e.target.blur()}
                                className="w-full pl-14 pr-4 py-5 rounded-2xl bg-white/10 border border-white/20 text-white text-3xl font-bold text-center placeholder-gray-500 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 transition-all"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Step 2: Telegram */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300">
                                <p className="font-medium mb-2">
                                    {isIndonesian ? '📌 Cara mendapatkan Chat ID:' : '📌 How to get your Chat ID:'}
                                </p>
                                <ol className="list-decimal list-inside space-y-1 text-blue-200">
                                    <li>{isIndonesian ? 'Buka bot di Telegram' : 'Open bot on Telegram'}</li>
                                    <li>{isIndonesian ? 'Ketik /start' : 'Type /start'}</li>
                                    <li>{isIndonesian ? 'Copy Chat ID' : 'Copy Chat ID'}</li>
                                </ol>
                            </div>
                            <input
                                type="text"
                                value={telegramChatId}
                                onChange={(e) => setTelegramChatId(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-center placeholder-gray-500 focus:border-primary-400 transition-all"
                                placeholder={isIndonesian ? 'Chat ID (opsional)' : 'Chat ID (optional)'}
                            />
                        </div>
                    )}

                    {/* Step 3: Preferences */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">
                                    {isIndonesian ? 'Bahasa' : 'Language'}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { code: 'en', flag: '🇺🇸', label: 'English' },
                                        { code: 'id', flag: '🇮🇩', label: 'Indonesia' },
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setLanguage(lang.code)}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${language === lang.code
                                                ? 'border-primary-400 bg-primary-500/20 text-white'
                                                : 'border-white/20 text-gray-300 hover:border-white/40'}`}
                                        >
                                            <span className="text-xl">{lang.flag}</span>
                                            <span>{lang.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">
                                    {isIndonesian ? 'Mata Uang' : 'Currency'}
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white appearance-none cursor-pointer focus:border-primary-400 transition-all"
                                >
                                    <option value="IDR" className="bg-gray-800">🇮🇩 Indonesian Rupiah (Rp)</option>
                                    <option value="USD" className="bg-gray-800">🇺🇸 US Dollar ($)</option>
                                    <option value="SGD" className="bg-gray-800">🇸🇬 Singapore Dollar (S$)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-black/20 flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={handleBack}
                            className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                        >
                            {isIndonesian ? 'Kembali' : 'Back'}
                        </button>
                    )}
                    <button
                        onClick={step === STEPS.length - 1 ? handleFinish : handleNext}
                        disabled={saving}
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                {isIndonesian ? 'Menyimpan...' : 'Saving...'}
                            </>
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
