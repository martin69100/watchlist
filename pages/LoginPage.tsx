import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { APP_ROUTES } from '../constants';


export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate(APP_ROUTES.HOME);
    } else {
      setError('Invalid username or password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <h2 className="text-center text-3xl font-extrabold text-text-main mb-8">
          Sign in to your account
        </h2>
        <Card className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-secondary">
                Username
              </label>
              <Input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password-login" className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <Input
                id="password-login"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
           <p className="text-center text-sm text-text-secondary">
            Don't have an account?{' '}
            <Link to={APP_ROUTES.REGISTER} className="font-medium text-primary hover:text-primary-hover">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};