import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password?: string) => Promise<boolean>;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const { users } = useData(); // Get users from DataContext, which fetches from backend

  const login = async (username: string, password?: string): Promise<boolean> => {
    try {
        const response = await fetch(`/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            const user = await response.json();
            setCurrentUser(user);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = async (username: string, password?: string): Promise<boolean> => {
    try {
        const response = await fetch(`/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            const newUser = await response.json();
            setCurrentUser(newUser);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Registration failed:', error);
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, users }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};