import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getFixedCosts, addFixedCost, updateFixedCost, deleteFixedCost, getTotalFixedCosts } from '../utils/storage';
import { Receipt, Plus, Edit2, Trash2, Check, X, Home, Zap, Shield, Tv, CreditCard, Package } from 'lucide-react';

const FIXED_COST_CATEGORIES = [
    { id: 'rent', icon: Home, color: '#3b82f6' },
    { id: 'utilities', icon: Zap, color: '#eab308' },
    { id: 'insurance', icon: Shield, color: '#22c55e' },
    { id: 'subscriptions', icon: Tv, color: '#a855f7' },
    { id: 'loans', icon: CreditCard, color: '#ef4444' },
    { id: 'other', icon: Package, color: '#6b7280' },
];

export default function FixedCosts() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [costs, setCosts] = useState(() => getFixedCosts(user.id));
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: 'other',
        dueDate: '',
        notes: ''
    });

    const totalMonthly = useMemo(() => getTotalFixedCosts(user.id), [costs]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getCategoryInfo = (catId) => {
        return FIXED_COST_CATEGORIES.find(c => c.id === catId) || FIXED_COST_CATEGORIES[5];
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(formData.amount);
        if (!formData.name || isNaN(amount) || amount <= 0) return;

        const costData = {
            name: formData.name,
            amount,
            category: formData.category,
            dueDate: formData.dueDate,
            notes: formData.notes
        };

        if (editingId) {
            updateFixedCost(user.id, editingId, costData);
        } else {
            addFixedCost(user.id, costData);
        }

        setCosts(getFixedCosts(user.id));
        resetForm();
    };

    const handleEdit = (cost) => {
        setFormData({
            name: cost.name,
            amount: cost.amount.toString(),
            category: cost.category,
            dueDate: cost.dueDate || '',
            notes: cost.notes || ''
        });
        setEditingId(cost.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        deleteFixedCost(user.id, id);
        setCosts(getFixedCosts(user.id));
    };

    const resetForm = () => {
        setFormData({ name: '', amount: '', category: 'other', dueDate: '', notes: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {t('fixedCosts.title')} 📋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('fixedCosts.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
                >
                    <Plus size={20} />
                    {t('fixedCosts.addNew')}
                </button>
            </div>

            {/* Total Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/20">
                        <Receipt size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{t('fixedCosts.total')}</span>
                </div>
                <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalMonthly)}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    {costs.length} {costs.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            {/* Fixed Costs List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {costs.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <Receipt size={28} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mb-2">{t('fixedCosts.noItems')}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">{t('fixedCosts.addFirst')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {costs.map((cost) => {
                            const catInfo = getCategoryInfo(cost.category);
                            const Icon = catInfo.icon;
                            return (
                                <div key={cost.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${catInfo.color}20` }}
                                    >
                                        <Icon size={20} style={{ color: catInfo.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {cost.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t(`fixedCosts.${cost.category}`)}
                                            {cost.dueDate && ` • Due: ${cost.dueDate}`}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(cost.amount)}
                                    </p>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(cost)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Edit2 size={16} className="text-gray-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cost.id)}
                                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingId ? t('fixedCosts.edit') : t('fixedCosts.addNew')}
                            </h3>
                            <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('fixedCosts.name')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                    placeholder="e.g., Netflix, Rent, Internet"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('fixedCosts.amount')}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                        onWheel={(e) => e.target.blur()}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('fixedCosts.category')}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {FIXED_COST_CATEGORIES.map((cat) => {
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, category: cat.id }))}
                                                className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${formData.category === cat.id
                                                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-500/20'
                                                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                <Icon size={20} style={{ color: cat.color }} />
                                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                                    {t(`fixedCosts.${cat.id}`)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('fixedCosts.dueDate')} (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                    placeholder="e.g., 15th of month"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('fixedCosts.notes')} (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                    placeholder="Additional notes"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t('fixedCosts.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Check size={20} />
                                    {t('fixedCosts.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
