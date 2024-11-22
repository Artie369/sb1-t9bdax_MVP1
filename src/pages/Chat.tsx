import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMatchStore } from '../store/matchStore';
import { useMessageStore } from '../store/messageStore';
import ChatHeader from '../components/Chat/ChatHeader';
import MessageList from '../components/Chat/MessageList';
import MessageInput from '../components/Chat/MessageInput';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { matches, fetchMatches } = useMatchStore();
  const { subscribeToMessages } = useMessageStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId || !user) {
      navigate('/matches');
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const initChat = async () => {
      try {
        setLoading(true);
        await fetchMatches(user.id);
        unsubscribe = subscribeToMessages(matchId);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to load chat. Please try again.');
        navigate('/matches');
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [matchId, user, navigate, fetchMatches, subscribeToMessages]);

  if (!matchId || !user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center">
        <Heart className="w-12 h-12 animate-pulse text-white" />
      </div>
    );
  }

  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-gray-600 mb-4">Chat not found or no longer available</p>
          <button 
            onClick={() => navigate('/matches')}
            className="btn-primary"
          >
            Return to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gray-50">
        <ChatHeader matchId={matchId} />
        
        <div className="flex-1 overflow-y-auto">
          <MessageList matchId={matchId} />
        </div>

        <MessageInput matchId={matchId} />
      </div>
    </ErrorBoundary>
  );
}