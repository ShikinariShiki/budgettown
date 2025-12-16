import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, deleteTransaction } from '../utils/storage';
import { getCategoryById, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { Search, Filter, Edit2, Trash2, ChevronDown, SortAsc, SortDesc, X } from 'lucide-react';

export default function TransactionList({ onEdit, onRefresh }) {
    const { user } = useAuth();
    const data = getUserData(user.id);

    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

    const filteredTransactions = useMemo(() => {
        let result = [...data.transactions];

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(t =>
                t.description?.toLowerCase().includes(searchLower) ||
                getCategoryById(t.category).name.toLowerCase().includes(searchLower)
            );
        }

        // Type filter
        if (filterType !== 'all') {
            result = result.filter(t => t.type === filterType);
        }

        // Category filter
        if (filterCategory !== 'all') {
            result = result.filter(t => t.category === filterCategory);
        }

        // Date range filter
        if (dateRange.start) {
            result = result.filter(t => new Date(t.date) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            result = result.filter(t => new Date(t.date) <= new Date(dateRange.end));
        }

        // Sort
        result.sort((a, b) => {
            let aVal, bVal;
            if (sortBy === 'date') {
                aVal = new Date(a.date).getTime();
                bVal = new Date(b.date).getTime();
            } else if (sortBy === 'amount') {
                aVal = a.amount;
                bVal = b.amount;
            } else {
                aVal = getCategoryById(a.category).name;
                bVal = getCategoryById(b.category).name;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });

        return result;
    }, [data.transactions, search, filterType, filterCategory, sortBy, sortOrder, dateRange]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleDelete = (id) => {
        deleteTransaction(user.id, id);
        setDeleteConfirm(null);
        onRefresh?.();
    };

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const clearFilters = () => {
        setSearch('');
        setFilterType('all');
        setFilterCategory('all');
        setDateRange({ start: '', end: '' });
    };

    const hasActiveFilters = search || filterType !== 'all' || filterCategory !== 'all' || dateRange.start || dateRange.end;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:border-primary-500"
                            placeholder="Search transactions..."
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${showFilters || hasActiveFilters
                                ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        <Filter size={20} />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                        )}
                        <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Expanded Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                        {/* Type */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Types</option>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Categories</option>
                                {allCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="sm:col-span-2 lg:col-span-4 flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X size={16} />
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Transaction
                            </th>
                            <th
                                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                onClick={() => toggleSort('category')}
                            >
                                <div className="flex items-center gap-1">
                                    Category
                                    {sortBy === 'category' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </div>
                            </th>
                            <th
                                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                onClick={() => toggleSort('date')}
                            >
                                <div className="flex items-center gap-1">
                                    Date
                                    {sortBy === 'date' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </div>
                            </th>
                            <th
                                className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                                onClick={() => toggleSort('amount')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    Amount
                                    {sortBy === 'amount' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                                </div>
                            </th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                                    {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((t) => {
                                const category = getCategoryById(t.category);
                                return (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                    style={{ backgroundColor: `${category.color}20` }}
                                                >
                                                    {category.icon}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {t.description || category.name}
                                                    </p>
                                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${t.type === 'income'
                                                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                                            : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400'
                                                        }`}>
                                                        {t.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{category.name}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(t.date)}</span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className={`font-semibold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onEdit(t)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(t.id)}
                                                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-gray-500 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Results count */}
            {filteredTransactions.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    Showing {filteredTransactions.length} of {data.transactions.length} transactions
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm animate-fade-in">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Transaction?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 py-2.5 rounded-xl gradient-danger text-white font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
