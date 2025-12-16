import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addTransaction, updateTransaction, getUserData, setStartingBalance } from '../utils/storage';
import { getCategoriesByType } from '../utils/categories';
import { X, Save, Wallet, Banknote, CreditCard } from 'lucide-react';

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Tunai', icon: Banknote, color: '#22c55e' },
    { id: 'bca', label: 'BCA', icon: CreditCard, color: '#004B93' },
    { id: 'bni', label: 'BNI', icon: CreditCard, color: '#F5821F' },
];

export default function TransactionForm({ onClose, editTransaction = null, onSuccess }) {
    const { user } = useAuth();
    const data = getUserData(user.id);

    const [type, setType] = useState(editTransaction?.type || 'expense');
    const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
    const [category, setCategory] = useState(editTransaction?.category || '');
    const [paymentMethod, setPaymentMethod] = useState(editTransaction?.payment_method || 'cash');
    const [description, setDescription] = useState(editTransaction?.description || '');
    const [date, setDate] = useState(editTransaction?.date || new Date().toISOString().split('T')[0]);
    const [showStartingBalance, setShowStartingBalance] = useState(false);
    const [startingBalanceAmount, setStartingBalanceAmount] = useState(data.startingBalance?.toString() || '0');
    const [error, setError] = useState('');

    const categories = getCategoriesByType(type);

    useEffect(() => {
        // Reset category when type changes
        if (!editTransaction) {
            setCategory(categories[0]?.id || '');
        }
    }, [type]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid positive amount');
            return;
        }

        if (!category) {
            setError('Please select a category');
            return;
        }

        const transactionData = {
            type,
            amount: numAmount,
            category,
            payment_method: paymentMethod,
            description: description.trim(),
            date
        };

        try {
            if (editTransaction) {
                updateTransaction(user.id, editTransaction.id, transactionData);
            } else {
                addTransaction(user.id, transactionData);
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            setError('Failed to save transaction');
        }
    };

    const handleStartingBalance = (e) => {
        e.preventDefault();
        const num = parseFloat(startingBalanceAmount);
        if (isNaN(num)) {
            setError('Please enter a valid amount');
            return;
        }
        setStartingBalance(user.id, num);
        setShowStartingBalance(false);
        onSuccess?.();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md lg:max-w-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {/* Responsive grid: vertical on mobile, horizontal on PC */}
                    <div className="flex flex-col lg:flex-row lg:gap-6">

                        {/* Left column */}
                        <div className="flex-1 space-y-4">
                            {/* Type Toggle */}
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${type === 'expense'
                                        ? 'bg-red-500 text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${type === 'income'
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Income
                                </button>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        onWheel={(e) => e.target.blur()}
                                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:border-primary-500"
                                        placeholder="0"
                                        min="0"
                                        step="any"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`p-2 rounded-lg flex flex-col items-center gap-0.5 transition-all ${category === cat.id
                                                ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-500/20'
                                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            <span className="text-lg">{cat.icon}</span>
                                            <span className="text-[10px] text-gray-600 dark:text-gray-300 truncate w-full text-center">
                                                {cat.name.split(' ')[0]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="flex-1 space-y-4 mt-4 lg:mt-0">
                            {/* Payment Method */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {PAYMENT_METHODS.map((method) => {
                                        const Icon = method.icon;
                                        return (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`p-2 rounded-lg flex flex-col items-center gap-0.5 transition-all ${paymentMethod === method.id
                                                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-500/20'
                                                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                <Icon size={18} style={{ color: method.color }} />
                                                <span className="text-[10px] text-gray-600 dark:text-gray-300">
                                                    {method.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:border-primary-500"
                                    placeholder="What was this for?"
                                />
                            </div>

                            {/* Date */}
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:border-primary-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700 mt-4">
                        <button
                            type="button"
                            onClick={() => setShowStartingBalance(true)}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Set starting balance"
                        >
                            <Wallet size={18} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm ${type === 'expense'
                                ? 'gradient-danger shadow-red-500/30'
                                : 'gradient-primary shadow-primary-500/30'
                                }`}
                        >
                            <Save size={18} />
                            Save
                        </button>
                    </div>
                </form>

                {/* Starting Balance Modal */}
                {showStartingBalance && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Set Starting Balance</h3>
                            <form onSubmit={handleStartingBalance} className="space-y-4">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                                    <input
                                        type="number"
                                        value={startingBalanceAmount}
                                        onChange={(e) => setStartingBalanceAmount(e.target.value)}
                                        onWheel={(e) => e.target.blur()}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="0"
                                        step="any"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowStartingBalance(false)}
                                        className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-medium"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
