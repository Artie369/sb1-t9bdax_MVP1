import React, { useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import Navigation from '../components/Layout/Navigation';
import ProfileCard from '../components/Feed/ProfileCard';
import { useFeedStore } from '../store/feedStore';
import { useAuthStore } from '../store/authStore';
import ErrorBoundary from '../components/ErrorBoundary';
import { toast } from 'react-hot-toast';

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
        toast.error('Failed to load profiles. Please try again.');
      }
    }
  }, [user, fetchProfiles]);

  const loadMore = useCallback(async () => {
    if (inView && hasMore && !loading && user) {
      try {
        await fetchMoreProfiles(user.id);
      } catch (error) {
        console.error('Error loading more profiles:', error);
        toast.error('Failed to load more profiles. Please try again.');
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

  return (
    <div className="min-h-screen bg-gray-100">
      <ErrorBoundary>
        <div className="min-h-screen pt-4 pb-16 px-4">
          <div className="max-w-md mx-auto space-y-4">
            {loading && !profiles.length ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse text-gray-600">Loading profiles...</div>
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <p className="text-gray-600 mb-4">No profiles available at the moment</p>
                <button 
                  onClick={loadInitialContent}
                  className="btn-primary"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <>
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
                {hasMore && <div ref={ref} className="h-20" />}
              </>
            )}

            {error && (
              <div className="fixed bottom-20 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="text-center">{error}</p>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>

      <Navigation />
    </div>
  );
};

export default ProfileFeed;