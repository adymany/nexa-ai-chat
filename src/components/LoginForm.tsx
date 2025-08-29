'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-white">
            Sign in to Nexa AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
            >
              create a new account
            </button>
          </p>
          <p className="mt-3 sm:mt-4 text-center text-xs text-gray-500">
            Made with ❤️ by <span className="text-blue-400 font-medium">Adnan Tabrezi</span>
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Test Account Notice */}
          <div className="bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-300 px-3 sm:px-4 py-3 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 font-semibold">🧪 Test Account:</span>
                </div>
                <p className="text-sm mt-1">
                  <strong>Username:</strong> admin<br/>
                  <strong>Password:</strong> 123456
                </p>
                <p className="text-xs mt-2 opacity-75">
                  Use these credentials to test the application!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('123456');
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm rounded transition-colors whitespace-nowrap"
              >
                Auto Fill
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="relative block w-full px-3 py-3 sm:py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
                placeholder="Username"
                style={{
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  borderColor: '#374151'
                }}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-3 sm:py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
                placeholder="Password"
                style={{
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  borderColor: '#374151'
                }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};