import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GOOGLE_CONFIG } from '../config/googleConfig';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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

        // Check if script is already loaded
        if (window.google?.accounts?.id) {
            initGoogle();
        } else {
            // Wait for script to load
            const checkGoogle = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(checkGoogle);
                    initGoogle();
                }
            }, 100);

            // Cleanup after 10 seconds
            setTimeout(() => clearInterval(checkGoogle), 10000);
        }
    }, []);

    // Handle Google OAuth callback
    const handleGoogleCallback = useCallback((response) => {
        try {
            // Decode JWT token from Google
            const payload = JSON.parse(atob(response.credential.split('.')[1]));

            const googleUser = {
                id: `google_${payload.sub}`,
                username: payload.name,
                email: payload.email,
                avatar: payload.picture,
                provider: 'google',
                createdAt: new Date().toISOString()
            };

            // Check if user exists in our storage
            const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');

            if (!existingUsers[googleUser.email]) {
                // Register new Google user
                existingUsers[googleUser.email] = googleUser;
                localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));

                // Initialize user data storage
                localStorage.setItem(`budgetown-data-${googleUser.id}`, JSON.stringify({
                    transactions: [],
                    budgets: {},
                    startingBalance: 0,
                    merchantCategories: {}
                }));
            } else {
                // Update existing user with latest Google info
                existingUsers[googleUser.email] = {
                    ...existingUsers[googleUser.email],
                    avatar: googleUser.avatar,
                    username: googleUser.username
                };
                localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
            }

            // Log in the user
            setUser(googleUser);
            localStorage.setItem('budgetown-current-user', JSON.stringify(googleUser));
        } catch (error) {
            console.error('Google Sign-In error:', error);
        }
    }, []);

    // Trigger Google Sign-In popup using OAuth2
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
                                // Fetch user info from Google
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

                                // Check if user exists in our storage
                                const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');

                                if (!existingUsers[googleUser.email]) {
                                    existingUsers[googleUser.email] = googleUser;
                                    localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
                                    localStorage.setItem(`budgetown-data-${googleUser.id}`, JSON.stringify({
                                        transactions: [],
                                        budgets: {},
                                        startingBalance: 0,
                                        merchantCategories: {}
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
                // Request access token - this triggers the popup
                client.requestAccessToken({ prompt: 'select_account' });
            } catch (error) {
                console.error('Error initializing Google OAuth:', error);
            }
        } else {
            console.error('Google OAuth2 not loaded yet');
            // Fallback: wait a bit and retry
            setTimeout(() => {
                if (window.google?.accounts?.oauth2) {
                    loginWithGoogle();
                } else {
                    alert('Google Sign-In is not available. Please refresh the page and try again.');
                }
            }, 1000);
        }
    }, []);

    useEffect(() => {
        // Check for existing session
        const savedUser = localStorage.getItem('budgetown-current-user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('budgetown-current-user');
            }
        }
        setLoading(false);
    }, []);

    const register = (username, email, password) => {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');

        if (existingUsers[email]) {
            throw new Error('Email already registered');
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            provider: 'local',
            createdAt: new Date().toISOString()
        };

        // Store user credentials (password hashed in production)
        existingUsers[email] = {
            ...newUser,
            password: btoa(password) // Simple encoding, use proper hashing in production
        };
        localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));

        // Initialize user data storage
        localStorage.setItem(`budgetown-data-${newUser.id}`, JSON.stringify({
            transactions: [],
            budgets: {},
            startingBalance: 0,
            merchantCategories: {}
        }));

        // Log in the user
        setUser(newUser);
        localStorage.setItem('budgetown-current-user', JSON.stringify(newUser));

        return newUser;
    };

    const login = (email, password) => {
        const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');
        const userData = existingUsers[email];

        if (!userData) {
            throw new Error('User not found');
        }

        // Check if this is a Google user trying to login with password
        if (userData.provider === 'google' && !userData.password) {
            throw new Error('This account uses Google Sign-In. Please use the Google button to login.');
        }

        if (userData.password !== btoa(password)) {
            throw new Error('Invalid password');
        }

        const { password: _, ...userWithoutPassword } = userData;
        setUser(userWithoutPassword);
        localStorage.setItem('budgetown-current-user', JSON.stringify(userWithoutPassword));

        return userWithoutPassword;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('budgetown-current-user');
        // Also revoke Google token if applicable
        if (window.google?.accounts?.id) {
            window.google.accounts.id.disableAutoSelect();
        }
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('budgetown-current-user', JSON.stringify(updatedUser));

        // Update in users list too
        const existingUsers = JSON.parse(localStorage.getItem('budgetown-users') || '{}');
        if (existingUsers[user.email]) {
            existingUsers[user.email] = { ...existingUsers[user.email], ...updates };
            localStorage.setItem('budgetown-users', JSON.stringify(existingUsers));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            register,
            login,
            loginWithGoogle,
            logout,
            updateUser,
            isAuthenticated: !!user,
            googleReady
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

