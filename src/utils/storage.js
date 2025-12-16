// User-scoped storage utility
export const getStorageKey = (userId) => `budgetown-data-${userId}`;

export const getUserData = (userId) => {
    try {
        const data = localStorage.getItem(getStorageKey(userId));
        if (!data) {
            return getDefaultData();
        }
        return JSON.parse(data);
    } catch (e) {
        console.error('Error reading user data:', e);
        return getDefaultData();
    }
};

export const saveUserData = (userId, data) => {
    try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving user data:', e);
        return false;
    }
};

export const getDefaultData = () => ({
    transactions: [],
    budgets: {},
    startingBalance: 0,
    merchantCategories: {},
    geminiApiKey: '',
    fixedCosts: [],
    wallets: [
        { id: 'cash', name: 'Tunai', icon: '💵', color: '#22c55e', balance: 0 },
        { id: 'bca', name: 'BCA', icon: '🏦', color: '#004B93', balance: 0 },
        { id: 'bni', name: 'BNI', icon: '🏦', color: '#F5821F', balance: 0 },
    ]
});

// Transaction helpers
export const addTransaction = (userId, transaction) => {
    const data = getUserData(userId);
    const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    };
    data.transactions.unshift(newTransaction);
    saveUserData(userId, data);
    return newTransaction;
};

export const updateTransaction = (userId, transactionId, updates) => {
    const data = getUserData(userId);
    const index = data.transactions.findIndex(t => t.id === transactionId);
    if (index !== -1) {
        data.transactions[index] = { ...data.transactions[index], ...updates };
        saveUserData(userId, data);
        return data.transactions[index];
    }
    return null;
};

export const deleteTransaction = (userId, transactionId) => {
    const data = getUserData(userId);
    data.transactions = data.transactions.filter(t => t.id !== transactionId);
    saveUserData(userId, data);
};

// Balance calculation
export const calculateBalance = (userId) => {
    const data = getUserData(userId);
    const transactionTotal = data.transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
    return data.startingBalance + transactionTotal;
};

// Budget helpers
export const setBudget = (userId, category, amount) => {
    const data = getUserData(userId);
    data.budgets[category] = amount;
    saveUserData(userId, data);
};

export const getBudgetSpent = (userId, category, month, year) => {
    const data = getUserData(userId);
    return data.transactions
        .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' &&
                t.category === category &&
                tDate.getMonth() === month &&
                tDate.getFullYear() === year;
        })
        .reduce((acc, t) => acc + t.amount, 0);
};

// Starting balance
export const getStartingBalance = (userId) => {
    const data = getUserData(userId);
    return data.startingBalance || 0;
};

export const setStartingBalance = (userId, amount) => {
    const data = getUserData(userId);
    data.startingBalance = amount;
    saveUserData(userId, data);
};

// API Key storage
export const getGeminiApiKey = (userId) => {
    const data = getUserData(userId);
    return data.geminiApiKey || '';
};

export const setGeminiApiKey = (userId, apiKey) => {
    const data = getUserData(userId);
    data.geminiApiKey = apiKey;
    saveUserData(userId, data);
};

// Merchant category mapping
export const saveMerchantCategory = (userId, merchant, category) => {
    const data = getUserData(userId);
    data.merchantCategories[merchant.toLowerCase()] = category;
    saveUserData(userId, data);
};

export const getMerchantCategory = (userId, merchant) => {
    const data = getUserData(userId);
    return data.merchantCategories[merchant.toLowerCase()] || null;
};

// Fixed Costs helpers
export const getFixedCosts = (userId) => {
    const data = getUserData(userId);
    return data.fixedCosts || [];
};

export const addFixedCost = (userId, fixedCost) => {
    const data = getUserData(userId);
    if (!data.fixedCosts) data.fixedCosts = [];
    const newCost = {
        ...fixedCost,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    };
    data.fixedCosts.push(newCost);
    saveUserData(userId, data);
    return newCost;
};

export const updateFixedCost = (userId, costId, updates) => {
    const data = getUserData(userId);
    const index = data.fixedCosts?.findIndex(c => c.id === costId);
    if (index !== -1) {
        data.fixedCosts[index] = { ...data.fixedCosts[index], ...updates };
        saveUserData(userId, data);
        return data.fixedCosts[index];
    }
    return null;
};

export const deleteFixedCost = (userId, costId) => {
    const data = getUserData(userId);
    data.fixedCosts = data.fixedCosts?.filter(c => c.id !== costId) || [];
    saveUserData(userId, data);
};

export const getTotalFixedCosts = (userId) => {
    const costs = getFixedCosts(userId);
    return costs.reduce((total, cost) => total + (cost.amount || 0), 0);
};

// Wallet helpers
export const getWallets = (userId) => {
    const data = getUserData(userId);
    // Migrate old data if wallets don't exist
    if (!data.wallets || data.wallets.length === 0) {
        data.wallets = [
            { id: 'cash', name: 'Tunai', icon: '💵', color: '#22c55e', balance: data.startingBalance || 0 },
            { id: 'bca', name: 'BCA', icon: '🏦', color: '#004B93', balance: 0 },
            { id: 'bni', name: 'BNI', icon: '🏦', color: '#F5821F', balance: 0 },
        ];
        saveUserData(userId, data);
    }
    return data.wallets;
};

export const addWallet = (userId, wallet) => {
    const data = getUserData(userId);
    if (!data.wallets) data.wallets = [];
    const newWallet = {
        ...wallet,
        id: wallet.id || Date.now().toString(),
        balance: wallet.balance || 0,
    };
    data.wallets.push(newWallet);
    saveUserData(userId, data);
    return newWallet;
};

export const updateWallet = (userId, walletId, updates) => {
    const data = getUserData(userId);
    const index = data.wallets?.findIndex(w => w.id === walletId);
    if (index !== -1) {
        data.wallets[index] = { ...data.wallets[index], ...updates };
        saveUserData(userId, data);
        return data.wallets[index];
    }
    return null;
};

export const deleteWallet = (userId, walletId) => {
    const data = getUserData(userId);
    data.wallets = data.wallets?.filter(w => w.id !== walletId) || [];
    saveUserData(userId, data);
};

export const setWalletBalance = (userId, walletId, balance) => {
    const data = getUserData(userId);
    const wallet = data.wallets?.find(w => w.id === walletId);
    if (wallet) {
        wallet.balance = balance;
        saveUserData(userId, data);
    }
};

// Calculate balance per wallet from transactions
export const calculateWalletBalance = (userId, walletId) => {
    const data = getUserData(userId);
    const wallet = data.wallets?.find(w => w.id === walletId);
    const startingBalance = wallet?.balance || 0;

    const transactionTotal = data.transactions
        .filter(t => t.payment_method === walletId || t.wallet === walletId)
        .reduce((acc, t) => {
            return t.type === 'income' ? acc + t.amount : acc - t.amount;
        }, 0);

    return startingBalance + transactionTotal;
};

// Calculate all wallet balances
export const calculateAllWalletBalances = (userId) => {
    const wallets = getWallets(userId);
    return wallets.map(wallet => ({
        ...wallet,
        currentBalance: calculateWalletBalance(userId, wallet.id)
    }));
};

// Get total balance across all wallets
export const getTotalBalance = (userId) => {
    const balances = calculateAllWalletBalances(userId);
    return balances.reduce((total, w) => total + w.currentBalance, 0);
};
