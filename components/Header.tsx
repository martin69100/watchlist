import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { APP_ROUTES } from '../constants';

const NavLinkItem: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => {
    const activeClass = "bg-primary text-white";
    const inactiveClass = "text-text-secondary hover:bg-secondary hover:text-text-main";
    
    return (
        <NavLink 
            to={to} 
            className={({ isActive }) => `${isActive ? activeClass : inactiveClass} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
        >
            {children}
        </NavLink>
    )
};


export const Header: React.FC = () => {
  const { currentUser, logout, users } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(APP_ROUTES.HOME);
  };
  
  return (
    <header className="bg-secondary shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={APP_ROUTES.HOME} className="text-2xl font-bold text-primary">
              AnimeVerse
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLinkItem to={APP_ROUTES.HOME}>Home</NavLinkItem>
                {currentUser && <NavLinkItem to={APP_ROUTES.PROFILE}>My Profile</NavLinkItem>}
                {currentUser?.isAdmin && <NavLinkItem to={APP_ROUTES.ADMIN}>Admin</NavLinkItem>}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-text-secondary hidden sm:block">Welcome, {currentUser.username}</span>
                <Button onClick={handleLogout} variant="secondary">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-x-2">
                <Button onClick={() => navigate(APP_ROUTES.LOGIN)} variant="ghost">Login</Button>
                <Button onClick={() => navigate(APP_ROUTES.REGISTER)}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
