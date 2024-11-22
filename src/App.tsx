import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Heart } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Import components directly to avoid lazy loading issues
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import ProfileFeed from './pages/ProfileFeed';
import Matches from './pages/Matches';
import Chat from './pages/Chat';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center">
    <Heart className="w-12 h-12 animate-pulse text-white" />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, initialized, loading } = useAuthStore();
  
  if (!initialized || loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

// Public Route Component (redirects to feed if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, initialized, loading } = useAuthStore();
  
  if (!initialized || loading) {
    return <LoadingSpinner />;
  }
  
  if (user) return <Navigate to="/feed" replace />;
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          } />
          <Route path="/auth" element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          } />
          <Route path="/feed" element={
            <ProtectedRoute>
              <ProfileFeed />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          } />
          <Route path="/chat/:matchId" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </Router>
  );
}

export default App;