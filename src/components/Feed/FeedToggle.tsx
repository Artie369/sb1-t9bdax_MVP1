import React from 'react';
import { Users, Video } from 'lucide-react';
import { useFeedStore } from '../../store/feedStore';

export default function FeedToggle() {
  const { feedType, setFeedType } = useFeedStore();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-full shadow-lg p-1">
      <div className="flex">
        <button
          onClick={() => setFeedType('profiles')}
          className={`flex items-center px-4 py-2 rounded-full transition-colors ${
            feedType === 'profiles'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users className="w-5 h-5 mr-2" />
          <span>Profiles</span>
        </button>
        
        <button
          onClick={() => setFeedType('videos')}
          className={`flex items-center px-4 py-2 rounded-full transition-colors ${
            feedType === 'videos'
              ? 'bg-primary-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Video className="w-5 h-5 mr-2" />
          <span>Videos</span>
        </button>
      </div>
    </div>
  );
}