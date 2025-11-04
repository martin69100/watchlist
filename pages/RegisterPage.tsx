import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { APP_ROUTES } from '../constants';


export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (register(username, password)) {
      navigate(APP_ROUTES.HOME);
    } else {
      setError('Username already taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <h2 className="text-center text-3xl font-extrabold text-text-main mb-8">
          Create an account
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
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label htmlFor="password-register" className="block text-sm font-medium text-text-secondary">
                Password
              </label>
              <Input
                id="password-register"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Choose a password"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
           <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to={APP_ROUTES.LOGIN} className="font-medium text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
