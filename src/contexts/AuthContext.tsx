import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Consultant JMO' | 'Medical Officer' | 'Forensic Support Staff' | 'Data Entry Operator' | 'Hospital Administration' | 'System Administrator';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Simulate checking for an existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('forensic_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('forensic_user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Authentication failed');
    }

    const dbUser: User = await response.json();
    setUser(dbUser);
    localStorage.setItem('forensic_user', JSON.stringify(dbUser));
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('forensic_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
