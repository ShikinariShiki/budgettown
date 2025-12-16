import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
    Calendar
} from 'lucide-react';

export default function Dashboard({ onAddTransaction, onUploadScreenshot }) {
    const { user } = useAuth();
    const data = getUserData(user.id);
    const balance = calculateBalance(user.id);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

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
                        Welcome back, {user.username}! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Here's your financial overview
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onAddTransaction}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Add Transaction
                    </button>
                    <button
                        onClick={onUploadScreenshot}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        <Upload size={20} />
                        Upload
                    </button>
                </div>
            </div>

            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 sm:p-8 shadow-xl shadow-primary-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <span className="text-white/80 font-medium">Current Balance</span>
                    </div>
                    <p className={`text-4xl sm:text-5xl font-bold text-white mb-2 ${balance < 0 ? 'text-red-200' : ''}`}>
                        {formatCurrency(balance)}
                    </p>
                    <p className="text-white/60 text-sm">
                        {balance >= 0 ? "You're doing great! 🎉" : "Time to review your spending 💪"}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Income Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 card-hover">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-500/20">
                            <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            This Month
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Income</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(monthlyStats.income)}
                    </p>
                </div>

                {/* Expenses Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 card-hover">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-500/20">
                            <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            This Month
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expenses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(monthlyStats.expenses)}
                    </p>
                </div>

                {/* Net Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 card-hover">
                    <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${monthlyStats.net >= 0 ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                            {monthlyStats.net >= 0 ? (
                                <ArrowUpRight size={20} className="text-primary-600 dark:text-primary-400" />
                            ) : (
                                <ArrowDownRight size={20} className="text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            Net Flow
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Savings</p>
                    <p className={`text-2xl font-bold ${monthlyStats.net >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400'}`}>
                        {monthlyStats.net >= 0 ? '+' : ''}{formatCurrency(monthlyStats.net)}
                    </p>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
                    <Calendar size={20} className="text-gray-400" />
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <Wallet size={28} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">No transactions yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Add your first transaction to get started!</p>
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
