"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 
  | 'superadmin' 
  | 'codificador' 
  | 'jefe-codificador' 
  | 'finanzas' 
  | 'jefe-finanzas'
  | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios mock para la demostración
const MOCK_USERS: Record<string, User> = {
  superadmin: { id: '1', name: 'Super Admin', role: 'superadmin' },
  codificador: { id: '2', name: 'Juan Pérez (Codificador)', role: 'codificador' },
  'jefe-codificador': { id: '3', name: 'María González (Jefe Codificador)', role: 'jefe-codificador' },
  finanzas: { id: '4', name: 'Carlos Díaz (Finanzas)', role: 'finanzas' },
  'jefe-finanzas': { id: '5', name: 'Ana Martínez (Jefe Finanzas)', role: 'jefe-finanzas' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error loading user from localStorage', e);
      }
    }
  }, []);

  const login = (role: UserRole) => {
    if (!role) return;
    const user = MOCK_USERS[role];
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('mockUser', JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mockUser');
  };

  const isAuthenticated = currentUser !== null;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated }}>
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
