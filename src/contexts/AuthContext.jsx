import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getProfile, createProfile, updateProfile as updateProfileDb } from '../lib/supabase';
import { GOOGLE_CONFIG } from '../config/googleConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [googleReady, setGoogleReady] = useState(false);

    // Initialize Google Sign-In
    useEffect(() => {
        const initGoogle = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CONFIG.clientId,
                    callback: handleGoogleCallback,
                    auto_select: false,
                });
                setGoogleReady(true);
            }
        };

        if (window.google?.accounts?.id) {
            initGoogle();
        } else {
            const checkGoogle = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(checkGoogle);
                    initGoogle();
                }
            }, 100);
            setTimeout(() => clearInterval(checkGoogle), 10000);
        }
    }, []);

    // Fetch profile from Supabase
    const fetchProfile = async (userId) => {
        const profileData = await getProfile(userId);
        if (profileData) {
            setProfile(profileData);
        }
        return profileData;
    };

    // Handle Supabase auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const supabaseUser = {
                    id: session.user.id,
                    email: session.user.email,
                    username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
                    avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                    provider: session.user.app_metadata?.provider || 'email',
                };
                setUser(supabaseUser);
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        // Check initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const supabaseUser = {
                    id: session.user.id,
                    email: session.user.email,
                    username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
                    avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                    provider: session.user.app_metadata?.provider || 'email',
                };
                setUser(supabaseUser);
                await fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Handle Google OAuth callback (for popup method)
    const handleGoogleCallback = useCallback(async (response) => {
        try {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
            });

            if (error) {
                console.error('Supabase Google Sign-In error:', error);
                // Fallback: decode token manually for legacy support
                const payload = JSON.parse(atob(response.credential.split('.')[1]));
                console.log('Google payload:', payload);
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
        }
    }, []);

    // Trigger Google Sign-In with Supabase OAuth
    const loginWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        });

        if (error) {
            console.error('Google OAuth error:', error);
        }
    }, []);

    // Register with email/password
    const register = async (username, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: username,
                }
            }
        });

        if (error) throw new Error(error.message);
        return data.user;
    };

    // Login with email/password
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw new Error(error.message);
        return data.user;
    };

    // Logout
    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    };

    // Update user profile
    const updateUser = async (updates) => {
        if (!user) return;

        // Update Supabase auth metadata
        if (updates.username) {
            await supabase.auth.updateUser({
                data: { full_name: updates.username }
            });
        }

        // Update profile in database
        const updatedProfile = await updateProfileDb(user.id, updates);
        if (updatedProfile) {
            setProfile(updatedProfile);
        }

        // Update local user state
        setUser(prev => ({ ...prev, ...updates }));
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            register,
            login,
            loginWithGoogle,
            logout,
            updateUser,
            fetchProfile,
            isAuthenticated: !!user,
            googleReady,
            isNewUser: profile && !profile.onboarding_completed,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
