import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MessageCircle, Heart, Camera } from 'lucide-react';
import type { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useFeedStore } from '../../store/feedStore';
import { useMatchStore } from '../../store/matchStore';
import { toast } from 'react-hot-toast';

interface ProfileCardProps {
  profile: User;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { blockUser } = useFeedStore();
  const { createMatch } = useMatchStore();

  if (!user) return null;

  const handleMessage = async () => {
    try {
      const matchId = await createMatch(user.id, profile.id);
      navigate(`/chat/${matchId}`);
      toast.success('Chat started!');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Unable to start chat. Please try again.');
    }
  };

  const handleLike = async () => {
    try {
      await createMatch(user.id, profile.id);
      toast.success('Profile liked!', {
        icon: '❤️',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error liking profile:', error);
      toast.error('Unable to like profile. Please try again.');
    }
  };

  const handleBlock = async () => {
    try {
      await blockUser(user.id, profile.id);
      toast.success('User blocked', {
        icon: '🚫',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Unable to block user. Please try again.');
    }
  };

  // Generate a consistent gradient based on username
  const getProfileGradient = (username: string) => {
    const gradients = [
      'from-primary-500 to-secondary-500',
      'from-purple-500 to-pink-500',
      'from-blue-500 to-teal-500',
      'from-rose-500 to-orange-500',
      'from-emerald-500 to-cyan-500'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[index % gradients.length];
  };

  return (
    <div className="relative h-[70vh] w-full overflow-hidden rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      
      {profile.profilePicture ? (
        <img
          src={profile.profilePicture}
          alt={profile.username}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getProfileGradient(profile.username)}`}>
          <div className="flex flex-col items-center">
            <Camera className="mb-4 h-16 w-16 text-white/80" />
            <span className="text-6xl font-bold text-white">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="mb-6">
          <h3 className="mb-2 text-3xl font-bold">
            {profile.username}, {profile.age}
          </h3>
          
          <p className="mb-4 line-clamp-2 text-lg text-white/90">
            {profile.bio || "No bio yet"}
          </p>
          
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
              {profile.genderIdentity}
            </span>
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
              {profile.sexualOrientation}
            </span>
          </div>
        </div>
        
        <div className="flex justify-center gap-6">
          <button
            onClick={handleBlock}
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-red-500"
            aria-label="Block user"
          >
            <X className="h-6 w-6 transition-transform group-hover:scale-110" />
          </button>
          
          <button
            onClick={handleMessage}
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-blue-500"
            aria-label="Send message"
          >
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
          </button>
          
          <button
            onClick={handleLike}
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-pink-500"
            aria-label="Like profile"
          >
            <Heart className="h-6 w-6 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>
  );
}