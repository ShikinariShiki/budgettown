// Supabase configuration
// Project: BudgeTown
// IMPORTANT: Use environment variables for sensitive data

export const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://tbtnysaxrgfrvguxhzws.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Telegram Bot configuration
// Token should NEVER be in frontend code - use Edge Functions with env vars
export const TELEGRAM_CONFIG = {
    botUsername: 'BudgeTownBot',
    // Token is stored in Supabase Edge Function environment variables
};
