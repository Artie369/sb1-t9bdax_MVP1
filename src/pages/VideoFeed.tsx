import React, { useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import Navigation from '../components/Layout/Navigation';
import ProfileCard from '../components/Feed/ProfileCard';
import { useFeedStore } from '../store/feedStore';
import { useAuthStore } from '../store/authStore';
import ErrorBoundary from '../components/ErrorBoundary';

const ProfileFeed: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    profiles,
    loading,
    error,
    hasMore,
    fetchProfiles,
    fetchMoreProfiles,
  } = useFeedStore();
  
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
    rootMargin: '100px',
  });

  const loadInitialContent = useCallback(async () => {
    if (user) {
      try {
        await fetchProfiles(user.id);
      } catch (error) {
        console.error('Error loading profiles:', error);
      }
    }
  }, [user, fetchProfiles]);

  const loadMore = useCallback(async () => {
    if (inView && hasMore && !loading && user) {
      try {
        await fetchMoreProfiles(user.id);
      } catch (error) {
        console.error('Error loading more profiles:', error);
      }
    }
  }, [inView, hasMore, loading, user, fetchMoreProfiles]);

  useEffect(() => {
    loadInitialContent();
  }, [loadInitialContent]);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  if (!user) return null;

  if (loading && !profiles.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading profiles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <p className="mb-4 text-gray-600">{error}</p>
          <button 
            onClick={loadInitialContent}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ErrorBoundary>
        <div className="min-h-screen pt-4 pb-16 px-4">
          <div className="max-w-md mx-auto space-y-4">
            {profiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
            {hasMore && <div ref={ref} className="h-20" />}
          </div>
        </div>
      </ErrorBoundary>

      <Navigation />
    </div>
  );
};

export default ProfileFeed;