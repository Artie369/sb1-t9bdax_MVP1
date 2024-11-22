export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  age: number;
  genderIdentity: string;
  sexualOrientation: string;
  bio: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  interests: string[];
  preferredAgeRange: {
    min: number;
    max: number;
  };
  preferredDistance: number;
  membershipTier: 'free' | 'premium' | 'elite';
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  userId: string;
  url: string;
  duration: number;
  thumbnail: string;
  likes: number;
  comments: number;
  views: number;
  createdAt: Date;
}

export interface Match {
  id: string;
  users: [string, string];
  status: 'pending' | 'matched' | 'rejected';
  createdAt: Date;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'gif';
  read: boolean;
  createdAt: Date;
}