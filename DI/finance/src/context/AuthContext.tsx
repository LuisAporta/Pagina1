import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
    loginAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    loginAsGuest: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                setIsGuest(false);
            } else {
                // Check if we were in guest mode before refresh
                const guestMode = localStorage.getItem('isGuestMode');
                if (guestMode === 'true') {
                    enableGuestMode();
                }
            }
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                setIsGuest(false);
                localStorage.removeItem('isGuestMode');
            } else if (!isGuest && localStorage.getItem('isGuestMode') !== 'true') {
                // Only clear user if we are NOT in guest mode
                setSession(null);
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [isGuest]);

    const enableGuestMode = () => {
        setIsGuest(true);
        localStorage.setItem('isGuestMode', 'true');
        // Create a dummy user object
        const guestUser: User = {
            id: 'guest-user',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: 'guest@demo.com',
            phone: '',
            role: 'authenticated',
            updated_at: new Date().toISOString()
        } as User;

        // Create a dummy session object
        const guestSession: Session = {
            access_token: 'guest-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'guest-refresh',
            user: guestUser
        };

        setUser(guestUser);
        setSession(guestSession);
    };

    const loginAsGuest = async () => {
        enableGuestMode();
    };

    const signOut = async () => {
        setIsGuest(false);
        localStorage.removeItem('isGuestMode');
        localStorage.removeItem('transactions'); // Optional: Clear guest data on logout? converting to keep it creates a better exp.
        // Actually, maybe keep it? Let's keep it for now so they don't lose data on refresh/logout immediately.
        // But usually sign out clears data. Let's clear user state proper.
        setUser(null);
        setSession(null);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, loginAsGuest }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
