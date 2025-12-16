// Category definitions with translation keys
// Icons and colors are universal, names are translated via LanguageContext
// name is kept for backward compatibility, nameKey is for translations

export const EXPENSE_CATEGORIES = [
    { id: 'food', name: 'Food', nameKey: 'cat_food', icon: '🍔', color: '#f97316' },
    { id: 'transport', name: 'Transport', nameKey: 'cat_transport', icon: '🚗', color: '#3b82f6' },
    { id: 'parking', name: 'Parking', nameKey: 'cat_parking', icon: '🅿️', color: '#8b5cf6' },
    { id: 'shopping', name: 'Shopping', nameKey: 'cat_shopping', icon: '🛍️', color: '#ec4899' },
    { id: 'bills', name: 'Bills', nameKey: 'cat_bills', icon: '💡', color: '#eab308' },
    { id: 'entertainment', name: 'Entertainment', nameKey: 'cat_entertainment', icon: '🎬', color: '#a855f7' },
    { id: 'healthcare', name: 'Healthcare', nameKey: 'cat_healthcare', icon: '🏥', color: '#ef4444' },
    { id: 'education', name: 'Education', nameKey: 'cat_education', icon: '📚', color: '#14b8a6' },
    { id: 'travel', name: 'Travel', nameKey: 'cat_travel', icon: '✈️', color: '#06b6d4' },
    { id: 'groceries', name: 'Groceries', nameKey: 'cat_groceries', icon: '🛒', color: '#22c55e' },
    { id: 'other', name: 'Other', nameKey: 'cat_other', icon: '📦', color: '#6b7280' }
];

export const INCOME_CATEGORIES = [
    { id: 'salary', name: 'Salary', nameKey: 'cat_salary', icon: '💰', color: '#22c55e' },
    { id: 'freelance', name: 'Freelance', nameKey: 'cat_freelance', icon: '💻', color: '#3b82f6' },
    { id: 'investment', name: 'Investment', nameKey: 'cat_investment', icon: '📈', color: '#a855f7' },
    { id: 'gift', name: 'Gift', nameKey: 'cat_gift', icon: '🎁', color: '#ec4899' },
    { id: 'refund', name: 'Refund', nameKey: 'cat_refund', icon: '↩️', color: '#f97316' },
    { id: 'other_income', name: 'Other Income', nameKey: 'cat_other_income', icon: '💵', color: '#6b7280' }
];

// Fixed cost categories
export const FIXED_COST_CATEGORIES = [
    { id: 'rent', name: 'Rent', nameKey: 'cat_rent', icon: '🏠', color: '#3b82f6' },
    { id: 'utilities', name: 'Utilities', nameKey: 'cat_utilities', icon: '⚡', color: '#eab308' },
    { id: 'insurance', name: 'Insurance', nameKey: 'cat_insurance', icon: '🛡️', color: '#22c55e' },
    { id: 'subscription', name: 'Subscription', nameKey: 'cat_subscription', icon: '📅', color: '#a855f7' },
    { id: 'loan', name: 'Loan', nameKey: 'cat_loan', icon: '💳', color: '#ef4444' },
    { id: 'other_fixed', name: 'Other', nameKey: 'cat_other', icon: '📦', color: '#6b7280' }
];

export const getAllCategories = () => [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const getCategoryById = (id) => {
    return getAllCategories().find(c => c.id === id) || { id: 'other', name: 'Other', nameKey: 'cat_other', icon: '📦', color: '#6b7280' };
};

export const getCategoryColor = (id) => {
    const category = getCategoryById(id);
    return category.color;
};

export const getCategoriesByType = (type) => {
    return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

// Format number with thousand separators
export const formatNumber = (num) => {
    if (!num && num !== 0) return '';
    return new Intl.NumberFormat('id-ID').format(num);
};

// Parse formatted number back to number
export const parseFormattedNumber = (str) => {
    if (!str) return 0;
    // Remove dots (thousand separators) and replace comma with dot for decimals
    return parseFloat(str.toString().replace(/\./g, '').replace(',', '.')) || 0;
};
