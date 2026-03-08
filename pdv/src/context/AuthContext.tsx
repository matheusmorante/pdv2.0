import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (pass: string) => boolean;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Check if user is already logged in and if session is valid
        const auth = localStorage.getItem('pdv_auth');
        const expiry = localStorage.getItem('pdv_auth_expiry');
        
        if (auth === 'true' && expiry) {
            const now = new Date().getTime();
            if (now < parseInt(expiry)) {
                setIsAuthenticated(true);
            } else {
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (pass: string): boolean => {
        // Standard creds requested: password 'morante123'
        if (pass === 'morante123') {
            const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
            const expiry = new Date().getTime() + twoDaysInMs;
            
            setIsAuthenticated(true);
            localStorage.setItem('pdv_auth', 'true');
            localStorage.setItem('pdv_auth_expiry', expiry.toString());
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('pdv_auth');
        localStorage.removeItem('pdv_auth_expiry');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
