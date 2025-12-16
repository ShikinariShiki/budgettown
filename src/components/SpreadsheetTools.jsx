import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../utils/storage';
import { getCategoryById } from '../utils/categories';
import { Download, Upload, FileSpreadsheet, Check, AlertCircle, X } from 'lucide-react';

export default function SpreadsheetTools({ onSuccess }) {
    const { user } = useAuth();
    const data = getUserData(user.id);
    const [importData, setImportData] = useState(null);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const formatCurrency = (amount) => amount.toFixed(2);

    const exportToCSV = () => {
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const rows = data.transactions.map(t => [
            t.date,
            t.type,
            getCategoryById(t.category).name,
            t.description || '',
            t.type === 'income' ? formatCurrency(t.amount) : `-${formatCurrency(t.amount)}`
        ]);

        // Add summary section
        const income = data.transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
        const expenses = data.transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

        rows.push([]);
        rows.push(['Summary']);
        rows.push(['Starting Balance', '', '', '', formatCurrency(data.startingBalance)]);
        rows.push(['Total Income', '', '', '', formatCurrency(income)]);
        rows.push(['Total Expenses', '', '', '', `-${formatCurrency(expenses)}`]);
        rows.push(['Current Balance', '', '', '', formatCurrency(data.startingBalance + income - expenses)]);
        rows.push([]);
        rows.push(['Formulas (for your own spreadsheet):']);
        rows.push(['Balance Calculation:', '=StartingBalance + SUM(Income) - SUM(Expenses)']);
        rows.push(['Savings Rate:', '=(Total_Income - Total_Expenses) / Total_Income * 100']);

        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `budgetown_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        setSuccess('Exported successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n').filter(l => l.trim());
                const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());

                const transactions = [];
                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                    if (values.length < 4) continue;

                    const dateIdx = headers.findIndex(h => h.includes('date'));
                    const typeIdx = headers.findIndex(h => h.includes('type'));
                    const catIdx = headers.findIndex(h => h.includes('category'));
                    const descIdx = headers.findIndex(h => h.includes('desc'));
                    const amtIdx = headers.findIndex(h => h.includes('amount'));

                    if (dateIdx >= 0 && amtIdx >= 0) {
                        const amount = parseFloat(values[amtIdx].replace(/[^0-9.-]/g, ''));
                        if (!isNaN(amount) && amount !== 0) {
                            transactions.push({
                                date: values[dateIdx] || new Date().toISOString().split('T')[0],
                                type: values[typeIdx]?.toLowerCase() === 'income' || amount > 0 ? 'income' : 'expense',
                                category: 'other',
                                description: values[descIdx] || '',
                                amount: Math.abs(amount)
                            });
                        }
                    }
                }
                setImportData(transactions);
                setError('');
            } catch (err) {
                setError('Failed to parse CSV file');
            }
        };
        reader.readAsText(file);
    };

    const confirmImport = () => {
        if (!importData) return;
        setImporting(true);

        const currentData = getUserData(user.id);
        importData.forEach(t => {
            currentData.transactions.unshift({
                ...t,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString()
            });
        });

        localStorage.setItem(`budgetown-data-${user.id}`, JSON.stringify(currentData));
        setImportData(null);
        setImporting(false);
        setSuccess(`Imported ${importData.length} transactions!`);
        onSuccess?.();
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Spreadsheet Tools 📊</h1>

            {success && <div className="p-4 rounded-xl bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 flex items-center gap-2"><Check size={18} />{success}</div>}
            {error && <div className="p-4 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2"><AlertCircle size={18} />{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-500/20"><Download size={24} className="text-green-600 dark:text-green-400" /></div>
                        <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h2><p className="text-sm text-gray-500 dark:text-gray-400">Download as CSV</p></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Export all transactions with summary and formula templates for your own analysis.</p>
                    <button onClick={exportToCSV} className="w-full py-3 rounded-xl gradient-primary text-white font-medium flex items-center justify-center gap-2"><FileSpreadsheet size={20} />Export CSV</button>
                </div>

                {/* Import */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20"><Upload size={24} className="text-blue-600 dark:text-blue-400" /></div>
                        <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Import Data</h2><p className="text-sm text-gray-500 dark:text-gray-400">Upload CSV file</p></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">CSV should have columns: Date, Type, Category, Description, Amount</p>
                    <label className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 cursor-pointer flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                        <Upload size={20} />Choose CSV File
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Import Preview */}
            {importData && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Preview ({importData.length} transactions)</h3>
                        <button onClick={() => setImportData(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} className="text-gray-500" /></button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                <tr><th className="px-4 py-2 text-left text-gray-500 dark:text-gray-400">Date</th><th className="px-4 py-2 text-left">Type</th><th className="px-4 py-2 text-left">Description</th><th className="px-4 py-2 text-right">Amount</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {importData.slice(0, 10).map((t, i) => (
                                    <tr key={i}><td className="px-4 py-2 text-gray-900 dark:text-white">{t.date}</td><td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type}</span></td><td className="px-4 py-2 text-gray-600 dark:text-gray-300">{t.description}</td><td className="px-4 py-2 text-right font-medium">{t.amount.toLocaleString()}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                        <button onClick={() => setImportData(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">Cancel</button>
                        <button onClick={confirmImport} disabled={importing} className="flex-1 py-2.5 rounded-xl gradient-primary text-white font-medium">{importing ? 'Importing...' : 'Import All'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
