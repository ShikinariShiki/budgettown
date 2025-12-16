import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useLanguage } from './contexts/LanguageContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import BudgetManager from './components/BudgetManager';
import FixedCosts from './components/FixedCosts';
import ScreenshotUpload from './components/ScreenshotUpload';
import SpreadsheetTools from './components/SpreadsheetTools';
import Profile from './components/Profile';
import Onboarding from './components/Onboarding';
import WalletManager from './components/WalletManager';
import { Home, List, BarChart3, Target, FileSpreadsheet, LogOut, Sun, Moon, Menu, X, User, CalendarClock } from 'lucide-react';

function App() {
    const { user, loading, logout, isAuthenticated, isNewUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t } = useLanguage();
    const [authView, setAuthView] = useState('login');
    const [currentView, setCurrentView] = useState('dashboard');
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showScreenshotUpload, setShowScreenshotUpload] = useState(false);
    const [showWalletManager, setShowWalletManager] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const refresh = () => setRefreshKey(k => k + 1);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
                <div className="floating-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-xl shadow-primary-500/30 animate-bounce-subtle">
                        <span className="text-3xl">💰</span>
                    </div>
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return authView === 'login'
            ? <Login onSwitchToRegister={() => setAuthView('register')} />
            : <Register onSwitchToLogin={() => setAuthView('login')} />;
    }

    const navItems = [
        { id: 'dashboard', labelKey: 'nav.dashboard', icon: Home },
        { id: 'transactions', labelKey: 'nav.transactions', icon: List },
        { id: 'charts', labelKey: 'nav.analytics', icon: BarChart3 },
        { id: 'budgets', labelKey: 'nav.budgets', icon: Target },
        { id: 'fixedcosts', labelKey: 'nav.fixedCosts', icon: CalendarClock },
        { id: 'spreadsheet', labelKey: 'nav.spreadsheet', icon: FileSpreadsheet },
        { id: 'profile', labelKey: 'nav.profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Background Mesh */}
            <div className="fixed inset-0 gradient-mesh pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <span className="text-xl">💰</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">BudgeTown</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300 btn-hover"
                        >
                            {theme === 'dark' ? (
                                <Sun size={20} className="text-yellow-500" />
                            ) : (
                                <Moon size={20} className="text-gray-600" />
                            )}
                        </button>

                        {/* Profile Button */}
                        <button
                            onClick={() => setCurrentView('profile')}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/80 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-all duration-300 group"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary-500/30 group-hover:ring-primary-500/60 transition-all">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full gradient-accent flex items-center justify-center text-white text-sm font-medium">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.username}</span>
                        </button>

                        <button
                            onClick={logout}
                            className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-500 hover:text-red-600 transition-all duration-300"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex relative">
                {/* Sidebar - Desktop */}
                <aside className="hidden lg:block w-64 sticky top-16 h-[calc(100vh-4rem)] glass border-r border-gray-200/50 dark:border-gray-700/50 p-4 overflow-y-auto">
                    <nav className="space-y-1">
                        {navItems.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${currentView === item.id
                                    ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 active'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                    }`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <item.icon size={20} />
                                {t(item.labelKey)}
                            </button>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="glass-strong rounded-2xl p-4 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">BudgeTown v1.0</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Made with ❤️</p>
                        </div>
                    </div>
                </aside>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-50">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                        <div className="absolute left-0 top-0 h-full w-72 glass-strong p-4 animate-slide-in">
                            {/* Mobile Profile */}
                            <div className="flex items-center gap-3 p-4 mb-4 glass rounded-2xl">
                                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary-500/50">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full gradient-accent flex items-center justify-center text-white font-medium">
                                            {user.username[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {navItems.map((item, index) => (
                                    <button
                                        key={item.id}
                                        onClick={() => { setCurrentView(item.id); setMobileMenuOpen(false); }}
                                        className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${currentView === item.id
                                            ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 active'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                            }`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl relative z-10" key={refreshKey}>
                    <div className="animate-fade-in-up">
                        {currentView === 'dashboard' && <Dashboard onAddTransaction={() => setShowTransactionForm(true)} onUploadScreenshot={() => setShowScreenshotUpload(true)} onManageWallets={() => setShowWalletManager(true)} />}
                        {currentView === 'transactions' && <TransactionList onEdit={(t) => { setEditingTransaction(t); setShowTransactionForm(true); }} onRefresh={refresh} />}
                        {currentView === 'charts' && <Charts />}
                        {currentView === 'budgets' && <BudgetManager />}
                        {currentView === 'fixedcosts' && <FixedCosts />}
                        {currentView === 'spreadsheet' && <SpreadsheetTools onSuccess={refresh} />}
                        {currentView === 'profile' && <Profile />}
                    </div>
                </main>
            </div>

            {/* Modals */}
            {showTransactionForm && (
                <div className="modal-backdrop flex items-center justify-center p-4">
                    <div className="modal-content">
                        <TransactionForm onClose={() => { setShowTransactionForm(false); setEditingTransaction(null); }} editTransaction={editingTransaction} onSuccess={refresh} />
                    </div>
                </div>
            )}
            {showScreenshotUpload && (
                <div className="modal-backdrop flex items-center justify-center p-4">
                    <div className="modal-content">
                        <ScreenshotUpload onClose={() => setShowScreenshotUpload(false)} onSuccess={refresh} />
                    </div>
                </div>
            )}
            {showWalletManager && (
                <WalletManager onClose={() => setShowWalletManager(false)} onSuccess={refresh} />
            )}

            {/* Onboarding for new users */}
            {(isNewUser || showOnboarding) && (
                <Onboarding onComplete={() => setShowOnboarding(false)} />
            )}
        </div>
    );
}

export default App;
