import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import type { Video, User } from '../../types';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/authStore';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const { user } = useAuthStore();
  
  const { ref, inView } = useInView({
    threshold: 0.7,
  });

  const handleVideoClick = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', video.userId));
        if (userDoc.exists()) {
          setCreator(userDoc.data() as User);
        }
      } catch (error) {
        console.error('Error fetching video creator:', error);
      }
    };
    fetchCreator();
  }, [video.userId]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (inView) {
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [inView]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        src={video.url}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={isMuted}
        poster={video.thumbnail}
        onClick={handleVideoClick}
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-end justify-between">
          <div className="text-white">
            <h3 className="font-semibold">{creator?.username}</h3>
            <p className="text-sm opacity-90">{creator?.bio}</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <button 
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              onClick={() => setIsMuted(prev => !prev)}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>

            <button 
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Like video"
            >
              <Heart className="w-6 h-6 text-white" />
              <span className="text-xs text-white mt-1">{video.likes}</span>
            </button>
            
            <button 
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Comment on video"
            >
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="text-xs text-white mt-1">{video.comments}</span>
            </button>
            
            <button 
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
              aria-label="Share video"
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}