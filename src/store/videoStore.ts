import { create } from 'zustand';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, addDoc, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Video } from '../types';
import { MAX_VIDEO_DURATION, TIER_FEATURES } from '../utils/constants';

interface VideoState {
  videos: Video[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  fetchVideos: (userId?: string) => Promise<void>;
  uploadVideo: (file: File, userId: string, membershipTier: string) => Promise<void>;
  likeVideo: (videoId: string, userId: string) => Promise<void>;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  uploadProgress: 0,

  fetchVideos: async (userId?: string) => {
    try {
      set({ loading: true, error: null });
      let videosQuery;
      
      if (userId) {
        videosQuery = query(
          collection(db, 'videos'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        videosQuery = query(
          collection(db, 'videos'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      }
      
      const snapshot = await getDocs(videosQuery);
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];
      
      set({ videos, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  uploadVideo: async (file: File, userId: string, membershipTier: string) => {
    try {
      set({ loading: true, error: null, uploadProgress: 0 });

      // Validate video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(video.duration);
      });

      const maxDuration = MAX_VIDEO_DURATION.LONG;
      if (video.duration > maxDuration) {
        throw new Error(`Video must be ${maxDuration} seconds or less`);
      }

      // Check upload limits based on membership tier
      const userVideosQuery = query(
        collection(db, 'videos'),
        where('userId', '==', userId)
      );
      const userVideos = await getDocs(userVideosQuery);
      const uploadLimit = TIER_FEATURES[membershipTier].videoUploads;
      
      if (uploadLimit !== -1 && userVideos.size >= uploadLimit) {
        throw new Error(`You've reached your upload limit for your ${membershipTier} membership`);
      }

      // Upload video
      const videoRef = ref(storage, `videos/${userId}/${Date.now()}-${file.name}`);
      await uploadBytes(videoRef, file);
      const videoUrl = await getDownloadURL(videoRef);

      // Generate thumbnail (you might want to implement a proper thumbnail generation service)
      const thumbnailUrl = videoUrl;

      // Save video metadata
      const videoData: Omit<Video, 'id'> = {
        userId,
        url: videoUrl,
        thumbnail: thumbnailUrl,
        duration: video.duration,
        likes: 0,
        comments: 0,
        views: 0,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'videos'), videoData);
      await get().fetchVideos(userId);
      set({ loading: false, uploadProgress: 100 });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  likeVideo: async (videoId: string, userId: string) => {
    try {
      // Implementation for liking videos will be added
      // This will involve updating the likes collection and the video document
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));