import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserData, calculateBalance } from '../utils/storage';
import { getCategoryById } from '../utils/categories';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    Upload,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Lightbulb
} from 'lucide-react';

// Get first name from full name
const getFirstName = (fullName) => {
    if (!fullName) return 'there';
    return fullName.split(' ')[0];
};

export default function Dashboard({ onAddTransaction, onUploadScreenshot }) {
    const { user } = useAuth();
    const { t, getGreeting, getFinancialTip } = useLanguage();
    const data = getUserData(user.id);
    const balance = calculateBalance(user.id);
    const firstName = getFirstName(user.username);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate monthly stats first
    const monthlyStats = useMemo(() => {
        const monthTransactions = data.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        return { income, expenses, net: income - expenses };
    }, [data.transactions, currentMonth, currentYear]);

    // Memoize greeting to prevent re-render changes
    const greeting = useMemo(() =>
        getGreeting(firstName, balance, data.transactions.length > 0),
        [firstName, balance > 0, data.transactions.length > 0]
    );

    // Memoize financial tip
    const financialTip = useMemo(() =>
        getFinancialTip(monthlyStats.income, monthlyStats.expenses, data.transactions.length > 0),
        [monthlyStats.income, monthlyStats.expenses, data.transactions.length > 0]
    );

    // Get subtitle based on context
    const getSubtitle = () => {
        if (data.transactions.length === 0) return t('dashboard.subtitleNoTx');
        if (balance > 1000000) return t('dashboard.subtitleGood');
        if (balance < 0) return t('dashboard.subtitleBad');
        return t('dashboard.subtitle');
    };

    const recentTransactions = data.transactions.slice(0, 5);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {greeting}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {getSubtitle()}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onAddTransaction}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
                    >
                        <Plus size={20} />
                        {t('dashboard.addTransaction')}
                    </button>
                    <button
                        onClick={onUploadScreenshot}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Upload size={20} />
                        {t('dashboard.upload')}
                    </button>
                </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-500/20">
                        <Wallet size={24} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{t('dashboard.currentBalance')}</span>
                </div>
                <p className={`text-4xl sm:text-5xl font-bold mb-2 ${balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatCurrency(balance)}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                    {balance >= 0 ? t('dashboard.availableToSpend') : t('dashboard.inTheRed')}
                </p>
            </div>

            {/* Financial Tip Card */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-700/50">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex-shrink-0">
                        <Lightbulb size={20} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                            {t('dashboard.financialTip')}
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            {financialTip}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Income Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-500/20">
                            <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {t('dashboard.thisMonth')}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.income')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(monthlyStats.income)}
                    </p>
                </div>

                {/* Expenses Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-500/20">
                            <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {t('dashboard.thisMonth')}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.expenses')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(monthlyStats.expenses)}
                    </p>
                </div>

                {/* Net Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${monthlyStats.net >= 0 ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                            {monthlyStats.net >= 0 ? (
                                <ArrowUpRight size={20} className="text-primary-600 dark:text-primary-400" />
                            ) : (
                                <ArrowDownRight size={20} className="text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {t('dashboard.netFlow')}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('dashboard.savings')}</p>
                    <p className={`text-2xl font-bold ${monthlyStats.net >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}`}>
                        {monthlyStats.net >= 0 ? '+' : ''}{formatCurrency(monthlyStats.net)}
                    </p>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.recentTransactions')}</h2>
                    <Calendar size={20} className="text-gray-400" />
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <Wallet size={28} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">{t('dashboard.noTransactions')}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.addFirst')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {recentTransactions.map((transaction) => {
                            const category = getCategoryById(transaction.category);
                            return (
                                <div key={transaction.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                                        style={{ backgroundColor: `${category.color}20` }}
                                    >
                                        {category.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {transaction.description || category.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(transaction.date)} • {category.name}
                                        </p>
                                    </div>
                                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
