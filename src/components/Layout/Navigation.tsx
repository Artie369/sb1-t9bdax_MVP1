import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Heart, Video, Users, User, LogOut } from 'lucide-react';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  if (!user) return null;

  const navItems = [
    { path: '/', icon: Video, label: 'Feed' },
    { path: '/matches', icon: Heart, label: 'Matches' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors
                ${location.pathname === path 
                  ? 'text-primary-500' 
                  : 'text-gray-500 hover:text-primary-400'}`}
              aria-label={label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center p-2 text-gray-500 hover:text-primary-400 rounded-lg transition-colors"
            aria-label="Sign Out"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}