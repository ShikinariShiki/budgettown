// Supabase configuration
// Project: BudgeTown
// NOTE: Supabase anon key is SAFE to be public - it's designed for frontend use with RLS

export const SUPABASE_CONFIG = {
    url: 'https://tbtnysaxrgfrvguxhzws.supabase.co',
    // Anon key is safe - RLS protects data, this just allows connection
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRidG55c2F4cmdmcnZndXhoendzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNDgyMDcsImV4cCI6MjA0OTkyNDIwN30.mFb4VjfjCMqVXQlQQqZeIt4csZS62ZjX92fya0RN1tE',
};

// Telegram Bot configuration
// Token is stored ONLY in Supabase Edge Function secrets - NEVER in frontend!
export const TELEGRAM_CONFIG = {
    botUsername: 'budgettown_bot',
};
