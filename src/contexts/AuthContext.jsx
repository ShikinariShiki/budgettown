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

    // Check for saved session on load
    useEffect(() => {
        const savedUser = localStorage.getItem('budgetown-current-user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                setUser(parsed);
                // Try to fetch profile from Supabase
                if (parsed.supabaseId) {
                    getProfile(parsed.supabaseId).then(p => {
                        if (p) setProfile(p);
                    });
                }
            } catch (e) {
                localStorage.removeItem('budgetown-current-user');
            }
        }
        setLoading(false);
    }, []);

    // Handle Google OAuth callback
    const handleGoogleCallback = useCallback(async (response) => {
        try {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));

            const googleUser = {
                id: `google_${payload.sub}`,
                username: payload.name,
                email: payload.email,
                avatar: payload.picture,
                provider: 'google',
                createdAt: new Date().toISOString()
            };

            // Save to localStorage (works offline)
            const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');
            if (!existingUsers[googleUser.email]) {
                existingUsers[googleUser.email] = googleUser;
                localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
                localStorage.setItem(`budgetown-data-${googleUser.id}`, JSON.stringify({
                    transactions: [],
                    budgets: {},
                    startingBalance: 0,
                    merchantCategories: {},
                    fixedCosts: []
                }));
            } else {
                existingUsers[googleUser.email] = {
                    ...existingUsers[googleUser.email],
                    avatar: googleUser.avatar,
                    username: googleUser.username
                };
                localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
            }

            setUser(googleUser);
            localStorage.setItem('budgetown-current-user', JSON.stringify(googleUser));

            // Try to sync with Supabase (optional, non-blocking)
            try {
                const { data: authData } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: response.credential,
                });
                if (authData?.user) {
                    googleUser.supabaseId = authData.user.id;
                    localStorage.setItem('budgetown-current-user', JSON.stringify(googleUser));
                    const profileData = await getProfile(authData.user.id);
                    if (profileData) setProfile(profileData);
                }
            } catch (supabaseErr) {
                console.log('Supabase sync skipped (offline mode):', supabaseErr.message);
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
        }
    }, []);

    // Trigger Google Sign-In popup
    const loginWithGoogle = useCallback(() => {
        if (window.google?.accounts?.oauth2) {
            try {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CONFIG.clientId,
                    scope: 'email profile openid',
                    prompt: 'select_account',
                    callback: async (tokenResponse) => {
                        if (tokenResponse.error) {
                            console.error('OAuth error:', tokenResponse.error);
                            return;
                        }
                        if (tokenResponse.access_token) {
                            try {
                                const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                                });
                                const payload = await response.json();

                                const googleUser = {
                                    id: `google_${payload.sub}`,
                                    username: payload.name,
                                    email: payload.email,
                                    avatar: payload.picture,
                                    provider: 'google',
                                    createdAt: new Date().toISOString()
                                };

                                // Save to localStorage
                                const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');
                                if (!existingUsers[googleUser.email]) {
                                    existingUsers[googleUser.email] = googleUser;
                                    localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
                                    localStorage.setItem(`budgetown-data-${googleUser.id}`, JSON.stringify({
                                        transactions: [],
                                        budgets: {},
                                        startingBalance: 0,
                                        merchantCategories: {},
                                        fixedCosts: []
                                    }));
                                } else {
                                    existingUsers[googleUser.email] = {
                                        ...existingUsers[googleUser.email],
                                        avatar: googleUser.avatar,
                                        username: googleUser.username,
                                        id: googleUser.id
                                    };
                                    localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
                                }

                                setUser(googleUser);
                                localStorage.setItem('budgetown-current-user', JSON.stringify(googleUser));
                            } catch (error) {
                                console.error('Failed to get user info:', error);
                            }
                        }
                    },
                });
                client.requestAccessToken({ prompt: 'select_account' });
            } catch (error) {
                console.error('Error initializing Google OAuth:', error);
            }
        } else {
            console.error('Google OAuth2 not loaded yet');
            setTimeout(() => {
                if (window.google?.accounts?.oauth2) {
                    loginWithGoogle();
                } else {
                    alert('Google Sign-In is not available. Please refresh the page and try again.');
                }
            }, 1000);
        }
    }, []);

    // Register with email/password
    const register = async (username, email, password) => {
        const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');
        if (existingUsers[email]) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            provider: 'local',
            createdAt: new Date().toISOString()
        };

        existingUsers[email] = { ...newUser, password: btoa(password) };
        localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
        localStorage.setItem(`budgetown-data-${newUser.id}`, JSON.stringify({
            transactions: [],
            budgets: {},
            startingBalance: 0,
            merchantCategories: {},
            fixedCosts: []
        }));

        setUser(newUser);
        localStorage.setItem('budgetown-current-user', JSON.stringify(newUser));
        return newUser;
    };

    // Login with email/password
    const login = async (email, password) => {
        const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');
        const userData = existingUsers[email];

        if (!userData) throw new Error('User not found');
        if (userData.provider === 'google' && !userData.password) {
            throw new Error('This account uses Google Sign-In. Please use the Google button to login.');
        }
        if (userData.password !== btoa(password)) throw new Error('Invalid password');

        const { password: _, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
        localStorage.setItem('budgetown-current-user', JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
    };

    // Logout
    const logout = async () => {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('budgetown-current-user');
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
        try {
            await supabase.auth.signOut();
        } catch (e) { }
    };

    // Update user profile
    const updateUser = async (updates) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('budgetown-current-user', JSON.stringify(updatedUser));

        const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');
        if (existingUsers[user.email]) {
            existingUsers[user.email] = { ...existingUsers[user.email], ...updates };
            localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
        }

        // Try to sync with Supabase
        if (user.supabaseId) {
            try {
                const updatedProfile = await updateProfileDb(user.supabaseId, updates);
                if (updatedProfile) setProfile(updatedProfile);
            } catch (e) {
                console.log('Profile sync skipped:', e.message);
            }
        }
    };

    // Check if user is new (hasn't completed onboarding)
    const checkNewUserData = () => {
        if (!user) return false;
        const userData = localStorage.getItem(`budgetown-data-${user.id}`);
        if (!userData) return true;
        const data = JSON.parse(userData);
        return data.transactions?.length === 0 && !data.onboardingCompleted;
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
            isAuthenticated: !!user,
            googleReady,
            isNewUser: checkNewUserData(),
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
