import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User } from '../types';
import { ADMIN_USER } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  register: (username: string, password?: string) => boolean;
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [users, setUsers] = useLocalStorage<User[]>('users', [ADMIN_USER]);

  useEffect(() => {
    setUsers(prevUsers => {
      const adminExists = prevUsers.some(u => u.username === ADMIN_USER.username && u.isAdmin);
      if (!adminExists) {
        // If admin is missing, filter out any non-admin user named 'admin' and add the official admin user.
        const otherUsers = prevUsers.filter(u => u.username !== ADMIN_USER.username);
        return [ADMIN_USER, ...otherUsers];
      }
      return prevUsers; // No changes needed
    });
  }, [setUsers]);


  const login = (username: string, password?: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (username: string, password?: string): boolean => {
    if (username.toLowerCase() === ADMIN_USER.username) {
        return false; // Prevent registering as 'admin'
    }
    if (users.some(u => u.username === username)) {
      return false; // User already exists
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      password,
      isAdmin: false,
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
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