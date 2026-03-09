import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../pages/utils/supabaseConfig';
import { User } from '@supabase/supabase-js';

export type UserRole = 'administrator' | 'deliverer' | 'seller' | 'accountant' | 'manager' | 'pending';

export interface Profile {
    id: string;
    email: string;
    role: UserRole;
    full_name?: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    loading: boolean;
    isAdmin: boolean;
    isManager: boolean;
    isPending: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data as Profile);
        } catch (err) {
            console.error('[Auth] Error fetching profile:', err);
            setProfile(null);
        }
    };

    useEffect(() => {
        let active = true;

        // Hard failsafe: if onAuthStateChange never fires, unblock after 5s
        const failsafe = setTimeout(() => {
            if (active) {
                console.warn('[Auth] 5s failsafe - onAuthStateChange never fired, setting loading=false');
                setLoading(false);
            }
        }, 5000);

        // onAuthStateChange fires immediately with the current session (INITIAL_SESSION or SIGNED_IN/OUT)
        // This is the ONLY source of truth we need - no need to call getSession() separately
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!active) return;
            console.log('[Auth] State Change:', event);

            clearTimeout(failsafe);

            if (session?.user) {
                setUser(session.user);
                // Fetch profile without blocking the loading state
                fetchProfile(session.user.id).finally(() => {
                    if (active) setLoading(false);
                });
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            active = false;
            clearTimeout(failsafe);
            subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const value = useMemo(() => ({
        user,
        profile,
        isAuthenticated: !!user,
        loading,
        isAdmin: profile?.role === 'administrator',
        isManager: profile?.role === 'manager' || profile?.role === 'administrator',
        isPending: !profile?.role || profile?.role === 'pending',
        logout
    }), [user, profile, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
