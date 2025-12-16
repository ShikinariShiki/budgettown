import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../utils/storage';
import { getCategoryById, EXPENSE_CATEGORIES } from '../utils/categories';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

export default function Charts() {
    const { user } = useAuth();
    const data = getUserData(user.id);

    // Monthly income vs expenses (last 6 months)
    const monthlyData = useMemo(() => {
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();

            const monthTransactions = data.transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === month && tDate.getFullYear() === year;
            });

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((acc, t) => acc + t.amount, 0);

            const expenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);

            months.push({
                name: date.toLocaleDateString('en-US', { month: 'short' }),
                income,
                expenses
            });
        }
        return months;
    }, [data.transactions]);

    // Category breakdown for current month
    const categoryData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const categoryTotals = {};

        data.transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' &&
                    tDate.getMonth() === currentMonth &&
                    tDate.getFullYear() === currentYear;
            })
            .forEach(t => {
                if (!categoryTotals[t.category]) {
                    categoryTotals[t.category] = 0;
                }
                categoryTotals[t.category] += t.amount;
            });

        return Object.entries(categoryTotals)
            .map(([id, value]) => {
                const cat = getCategoryById(id);
                return {
                    name: cat.name,
                    value,
                    color: cat.color,
                    icon: cat.icon
                };
            })
            .sort((a, b) => b.value - a.value);
    }, [data.transactions]);

    // Balance trend (last 6 months)
    const balanceTrend = useMemo(() => {
        const months = [];
        const now = new Date();
        let runningBalance = data.startingBalance;

        // Get all transactions sorted by date
        const sortedTransactions = [...data.transactions].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const monthTransactions = sortedTransactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate <= endOfMonth;
            });

            const balance = data.startingBalance + monthTransactions.reduce((acc, t) => {
                return t.type === 'income' ? acc + t.amount : acc - t.amount;
            }, 0);

            months.push({
                name: date.toLocaleDateString('en-US', { month: 'short' }),
                balance
            });
        }
        return months;
    }, [data.transactions, data.startingBalance]);

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: Rp {entry.value.toLocaleString('id-ID')}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const totalExpenses = categoryData.reduce((acc, c) => acc + c.value, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Analytics 📊
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income vs Expenses Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                            <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Income vs Expenses</h2>
                    </div>

                    {monthlyData.some(m => m.income > 0 || m.expenses > 0) ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tickFormatter={formatCurrency}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            No transaction data to display
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-500/20">
                            <PieChartIcon size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spending by Category</h2>
                    </div>

                    {categoryData.length > 0 ? (
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-48 h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2">
                                {categoryData.slice(0, 5).map((cat, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-lg">{cat.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {((cat.value / totalExpenses) * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${(cat.value / totalExpenses) * 100}%`,
                                                        backgroundColor: cat.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            No expense data this month
                        </div>
                    )}
                </div>

                {/* Balance Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-500/20">
                            <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Balance Trend</h2>
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={balanceTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={formatCurrency}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="balance"
                                    name="Balance"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#22c55e' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
