import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, X, Check, Trash2 } from 'lucide-react';
import type { Match } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useMatchStore } from '../../store/matchStore';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface MatchCardProps {
  match: Match;
  otherUserId: string;
  lastMessage?: string;
  type: 'match' | 'like';
}

export default function MatchCard({ match, otherUserId, lastMessage, type }: MatchCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { updateMatchStatus, deleteMatch } = useMatchStore();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUser();
  }, [otherUserId]);

  if (!user || loading) return null;

  const handleAcceptLike = async () => {
    try {
      await updateMatchStatus(match.id, 'matched');
      toast.success('Match accepted!', {
        icon: '💖',
        duration: 2000
      });
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('Failed to accept match. Please try again.');
    }
  };

  const handleRejectLike = async () => {
    try {
      await updateMatchStatus(match.id, 'rejected');
      toast.success('Like declined', {
        icon: '👋',
        duration: 2000
      });
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast.error('Failed to decline. Please try again.');
    }
  };

  const handleDeleteMatch = async () => {
    try {
      await deleteMatch(match.id);
      toast.success('Match deleted successfully', {
        icon: '🗑️',
        duration: 2000
      });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error('Failed to delete match. Please try again.');
    }
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg
        ${type === 'like' ? 'bg-gradient-to-r from-pink-50 to-purple-50' : ''}`}
    >
      {showDeleteConfirm ? (
        <div className="p-4">
          <p className="mb-4 text-center text-gray-700">
            Are you sure you want to delete this {type}? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMatch}
              className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="relative h-14 w-14 overflow-hidden rounded-full">
              <img
                src={otherUser?.profilePicture || `https://ui-avatars.com/api/?name=${otherUser?.username}&background=random`}
                alt={otherUser?.username}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            {type === 'like' && (
              <div className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-1.5">
                <Heart className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">
              {otherUser?.username}
            </h3>
            {type === 'match' && lastMessage && (
              <p className="text-sm text-gray-500 truncate">
                {lastMessage}
              </p>
            )}
            {type === 'like' && (
              <p className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                Liked your profile
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {type === 'match' ? (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Delete match"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate(`/chat/${match.id}`)}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                  aria-label="Open chat"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRejectLike}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Decline like"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={handleAcceptLike}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-500"
                  aria-label="Accept like"
                >
                  <Check className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}