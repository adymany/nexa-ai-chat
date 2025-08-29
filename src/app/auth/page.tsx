'use client';

import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <ProtectedRoute requireAuth={false}>
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </ProtectedRoute>
  );
}