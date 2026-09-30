import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
} from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  unauthorizedEmail: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearUnauthorizedNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(
      (authorizedUser) => {
        setUser(authorizedUser);
        setIsAdmin(Boolean(authorizedUser));
        setLoading(false);
      },
      (deniedEmail) => {
        setUser(null);
        setIsAdmin(false);
        setUnauthorizedEmail(deniedEmail);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    setUnauthorizedEmail(null);
    try {
      const authorizedUser = await loginWithGoogle();
      setUser(authorizedUser);
      setIsAdmin(true);
    } catch (err) {
      setUser(null);
      setIsAdmin(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setIsAdmin(false);
      setUnauthorizedEmail(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUnauthorizedNotice = () => {
    setUnauthorizedEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        unauthorizedEmail,
        login,
        logout,
        clearUnauthorizedNotice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
