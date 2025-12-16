import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabaseConfig';

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Helper to get current user
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Profile operations
export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) console.error('Error fetching profile:', error);
    return data;
};

export const updateProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) console.error('Error updating profile:', error);
    return data;
};

export const createProfile = async (userId, profileData) => {
    const { data, error } = await supabase
        .from('profiles')
        .insert([{ id: userId, ...profileData }])
        .select()
        .single();

    if (error) console.error('Error creating profile:', error);
    return data;
};

// Transaction operations
export const getTransactions = async (userId) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    if (error) console.error('Error fetching transactions:', error);
    return data || [];
};

export const addTransaction = async (userId, transaction) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert([{ user_id: userId, ...transaction }])
        .select()
        .single();

    if (error) console.error('Error adding transaction:', error);
    return data;
};

export const updateTransaction = async (transactionId, updates) => {
    const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

    if (error) console.error('Error updating transaction:', error);
    return data;
};

export const deleteTransaction = async (transactionId) => {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

    if (error) console.error('Error deleting transaction:', error);
    return !error;
};

// Fixed costs operations
export const getFixedCosts = async (userId) => {
    const { data, error } = await supabase
        .from('fixed_costs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) console.error('Error fetching fixed costs:', error);
    return data || [];
};

export const addFixedCost = async (userId, fixedCost) => {
    const { data, error } = await supabase
        .from('fixed_costs')
        .insert([{ user_id: userId, ...fixedCost }])
        .select()
        .single();

    if (error) console.error('Error adding fixed cost:', error);
    return data;
};

export const updateFixedCost = async (costId, updates) => {
    const { data, error } = await supabase
        .from('fixed_costs')
        .update(updates)
        .eq('id', costId)
        .select()
        .single();

    if (error) console.error('Error updating fixed cost:', error);
    return data;
};

export const deleteFixedCost = async (costId) => {
    const { error } = await supabase
        .from('fixed_costs')
        .delete()
        .eq('id', costId);

    if (error) console.error('Error deleting fixed cost:', error);
    return !error;
};

// Calculate balance from transactions
export const calculateBalance = async (userId) => {
    const transactions = await getTransactions(userId);
    const profile = await getProfile(userId);

    const startingBalance = profile?.starting_balance || 0;

    const balance = transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, startingBalance);

    return balance;
};

// Budgets operations
export const getBudgets = async (userId) => {
    const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

    if (error) console.error('Error fetching budgets:', error);
    return data || [];
};

export const setBudget = async (userId, categoryId, amount) => {
    const { data, error } = await supabase
        .from('budgets')
        .upsert([{
            user_id: userId,
            category_id: categoryId,
            amount
        }], {
            onConflict: 'user_id,category_id'
        })
        .select()
        .single();

    if (error) console.error('Error setting budget:', error);
    return data;
};
