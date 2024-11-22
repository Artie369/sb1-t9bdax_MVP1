import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMatchStore } from '../../store/matchStore';

interface ChatHeaderProps {
  matchId: string;
}

export default function ChatHeader({ matchId }: ChatHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { matches } = useMatchStore();
  
  if (!user || !matchId) return null;

  const match = matches.find(m => m.id === matchId);
  if (!match) return null;

  const otherUserId = match.users.find(id => id !== user.id);
  if (!otherUserId) return null;

  // Generate a consistent color based on userId
  const getInitialBgColor = (userId: string) => {
    const colors = [
      'bg-primary-500',
      'bg-secondary-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
      <button
        onClick={() => navigate('/matches')}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
        aria-label="Back to matches"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <div className="flex-1 flex items-center">
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getInitialBgColor(otherUserId)}`}>
            <span className="text-lg font-bold text-white">
              {otherUserId.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="ml-3">
          <h2 className="font-semibold">Chat</h2>
        </div>
      </div>

      <button 
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="More options"
      >
        <MoreVertical className="w-6 h-6" />
      </button>
    </div>
  );
}