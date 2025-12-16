import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, setBudget, saveUserData, getBudgetSpent } from '../utils/storage';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { Target, Edit2, Check, X, AlertTriangle } from 'lucide-react';

export default function BudgetManager() {
    const { user } = useAuth();
    const data = getUserData(user.id);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editAmount, setEditAmount] = useState('');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const budgetData = useMemo(() => {
        return EXPENSE_CATEGORIES.map(cat => {
            const budget = data.budgets[cat.id] || 0;
            const spent = getBudgetSpent(user.id, cat.id, currentMonth, currentYear);
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            const remaining = budget - spent;

            return {
                ...cat,
                budget,
                spent,
                percentage: Math.min(percentage, 100),
                remaining,
                status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
            };
        }).filter(b => b.budget > 0 || b.spent > 0);
    }, [data.budgets, data.transactions, currentMonth, currentYear]);

    const totalBudget = Object.values(data.budgets).reduce((a, b) => a + b, 0);
    const totalSpent = budgetData.reduce((acc, b) => acc + b.spent, 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleEdit = (cat) => {
        setEditingCategory(cat.id);
        setEditAmount(cat.budget.toString());
    };

    const handleSave = (catId) => {
        const amount = parseFloat(editAmount) || 0;
        setBudget(user.id, catId, amount);
        setEditingCategory(null);
        setEditAmount('');
    };

    const handleCancel = () => {
        setEditingCategory(null);
        setEditAmount('');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Budget Manager 🎯
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Budget</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalSpent)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                    <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(totalBudget - totalSpent)}
                    </p>
                </div>
            </div>

            {/* Budget Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Category Budgets</h2>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {EXPENSE_CATEGORIES.map(cat => {
                        const budgetInfo = budgetData.find(b => b.id === cat.id) || {
                            budget: 0,
                            spent: 0,
                            percentage: 0,
                            remaining: 0,
                            status: 'ok'
                        };
                        const isEditing = editingCategory === cat.id;

                        return (
                            <div key={cat.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                            style={{ backgroundColor: `${cat.color}20` }}
                                        >
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatCurrency(budgetInfo.spent)} spent
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {isEditing ? (
                                            <>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                                    <input
                                                        type="number"
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(e.target.value)}
                                                        onWheel={(e) => e.target.blur()}
                                                        className="w-32 pl-10 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm"
                                                        placeholder="0"
                                                        autoFocus
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleSave(cat.id)}
                                                    className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {budgetInfo.status === 'exceeded' && (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                                                        <AlertTriangle size={12} />
                                                        Exceeded
                                                    </span>
                                                )}
                                                {budgetInfo.status === 'warning' && (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                                                        <AlertTriangle size={12} />
                                                        80%+
                                                    </span>
                                                )}
                                                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-20 text-right">
                                                    {formatCurrency(budgetInfo.budget)}
                                                </span>
                                                <button
                                                    onClick={() => handleEdit({ id: cat.id, budget: data.budgets[cat.id] || 0 })}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${budgetInfo.status === 'exceeded'
                                            ? 'bg-red-500'
                                            : budgetInfo.status === 'warning'
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(budgetInfo.percentage, 100)}%` }}
                                    />
                                </div>

                                {budgetInfo.budget > 0 && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        {budgetInfo.remaining >= 0
                                            ? `${formatCurrency(budgetInfo.remaining)} remaining`
                                            : `${formatCurrency(Math.abs(budgetInfo.remaining))} over budget`
                                        }
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
