import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getWallets, addWallet, updateWallet, deleteWallet, setWalletBalance, calculateAllWalletBalances } from '../utils/storage';
import { formatNumber, parseFormattedNumber } from '../utils/categories';
import { Wallet, Plus, Edit2, Trash2, Check, X, Banknote, Building2 } from 'lucide-react';

const WALLET_ICONS = ['💵', '🏦', '💳', '📱', '🪙', '💰', '🏧', '💎'];
const WALLET_COLORS = ['#22c55e', '#004B93', '#F5821F', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#eab308'];

export default function WalletManager({ onClose, onSuccess }) {
    const { user } = useAuth();
    const { t, isIndonesian } = useLanguage();
    const [wallets, setWallets] = useState(() => calculateAllWalletBalances(user.id));
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        balance: '',
        icon: '💵',
        color: '#22c55e'
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const walletData = {
            name: formData.name.trim(),
            balance: parseFormattedNumber(formData.balance) || 0,
            icon: formData.icon,
            color: formData.color
        };

        if (editingId) {
            updateWallet(user.id, editingId, walletData);
        } else {
            addWallet(user.id, walletData);
        }

        setWallets(calculateAllWalletBalances(user.id));
        resetForm();
        onSuccess?.();
    };

    const handleEdit = (wallet) => {
        setFormData({
            name: wallet.name,
            balance: formatNumber(wallet.balance || 0),
            icon: wallet.icon,
            color: wallet.color
        });
        setEditingId(wallet.id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (wallets.length <= 1) return; // Keep at least 1 wallet
        deleteWallet(user.id, id);
        setWallets(calculateAllWalletBalances(user.id));
        onSuccess?.();
    };

    const resetForm = () => {
        setFormData({ name: '', balance: '', icon: '💵', color: '#22c55e' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleBalanceChange = (e) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        setFormData(p => ({ ...p, balance: value ? formatNumber(parseInt(value)) : '' }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Wallet size={22} className="text-primary-500" />
                        {isIndonesian ? 'Kelola Dompet' : 'Manage Wallets'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Wallet List */}
                    <div className="space-y-2">
                        {wallets.map((wallet) => (
                            <div
                                key={wallet.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                            >
                                <span className="text-2xl">{wallet.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                        {wallet.name}
                                    </p>
                                    <p className={`text-sm font-semibold ${wallet.currentBalance < 0 ? 'text-red-500' : 'text-primary-600 dark:text-primary-400'}`}>
                                        {formatCurrency(wallet.currentBalance)}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(wallet)}
                                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <Edit2 size={16} className="text-gray-500" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(wallet.id)}
                                        disabled={wallets.length <= 1}
                                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-30"
                                    >
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Button */}
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
                        >
                            <Plus size={20} />
                            {isIndonesian ? 'Tambah Dompet Baru' : 'Add New Wallet'}
                        </button>
                    )}

                    {/* Add/Edit Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {isIndonesian ? 'Nama Dompet' : 'Wallet Name'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                    placeholder="e.g., Cash, Mandiri, GoPay"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {isIndonesian ? 'Saldo Awal' : 'Initial Balance'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                    <input
                                        type="text"
                                        value={formData.balance}
                                        onChange={handleBalanceChange}
                                        className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Icon Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Icon
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {WALLET_ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, icon }))}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${formData.icon === icon ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-500/20' : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {isIndonesian ? 'Warna' : 'Color'}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {WALLET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, color }))}
                                            className={`w-8 h-8 rounded-full transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                >
                                    {isIndonesian ? 'Batal' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Check size={18} />
                                    {isIndonesian ? 'Simpan' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
