import React from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { useAuthStore } from '../../store/authStore';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-purple-500 flex items-center justify-center">
        <div className="text-white text-center">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-purple-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {mode === 'signin' ? <SignIn /> : <SignUp />}
      </div>
    </div>
  );
}