import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, UserRole } from '../types';

interface AuthContextType {
  user: AdminUser | null;
  role: UserRole;
  isLoggedIn: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
}

const DEFAULT_SUPER_ADMIN: AdminUser = {
  id: 'user-super-1',
  name: 'Gurinder Singh',
  email: 'editor-in-chief@groundzeronews.org',
  role: 'super_admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('gz_auth_user');
        return saved ? JSON.parse(saved) : DEFAULT_SUPER_ADMIN;
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_SUPER_ADMIN;
  });

  const [role, setRole] = useState<UserRole>(user?.role || 'super_admin');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          localStorage.setItem('gz_auth_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('gz_auth_user');
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    if (user) {
      setRole(user.role);
    }
  }, [user]);

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      setRole(newRole);
    }
  };

  const login = (email: string, targetRole: UserRole = 'editor') => {
    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      role: targetRole,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoggedIn: !!user,
        switchRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
