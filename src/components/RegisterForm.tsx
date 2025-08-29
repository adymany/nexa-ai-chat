'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(username, password);
      if (!result.success) {
        setError(result.error || 'Registration failed');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
            >
              sign in to your account
            </button>
          </p>
          <p className="mt-4 text-center text-xs text-gray-500">
            Made with ❤️ by <span className="text-blue-400 font-medium">Adnan Tabrezi</span>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Test Account Notice */}
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-semibold">✨ Quick Test:</span>
            </div>
            <p className="text-sm mt-1">
              Want to skip registration? Use the test account:<br/>
              <strong>Username:</strong> admin | <strong>Password:</strong> 123456
            </p>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs mt-2 text-green-400 hover:text-green-300 underline transition-colors"
            >
              Go to login page →
            </button>
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
                className="relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Username (min 3 characters)"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password (min 6 characters)"
                style={{
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  borderColor: '#374151'
                }}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative block w-full px-3 py-2 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm Password"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};