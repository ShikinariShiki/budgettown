export const EXPENSE_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#f97316' },
    { id: 'transport', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899' },
    { id: 'bills', name: 'Bills & Utilities', icon: '💡', color: '#eab308' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#a855f7' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#ef4444' },
    { id: 'education', name: 'Education', icon: '📚', color: '#14b8a6' },
    { id: 'travel', name: 'Travel', icon: '✈️', color: '#06b6d4' },
    { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#22c55e' },
    { id: 'other', name: 'Others', icon: '📦', color: '#6b7280' }
];

export const INCOME_CATEGORIES = [
    { id: 'salary', name: 'Salary', icon: '💰', color: '#22c55e' },
    { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3b82f6' },
    { id: 'investment', name: 'Investment', icon: '📈', color: '#a855f7' },
    { id: 'gift', name: 'Gift', icon: '🎁', color: '#ec4899' },
    { id: 'refund', name: 'Refund', icon: '↩️', color: '#f97316' },
    { id: 'other_income', name: 'Other Income', icon: '💵', color: '#6b7280' }
];

export const getAllCategories = () => [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const getCategoryById = (id) => {
    return getAllCategories().find(c => c.id === id) || { id: 'other', name: 'Others', icon: '📦', color: '#6b7280' };
};

export const getCategoryColor = (id) => {
    const category = getCategoryById(id);
    return category.color;
};

export const getCategoriesByType = (type) => {
    return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};
