import type { User } from './index';

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'audio' | 'emoji';
  metadata?: {
    duration?: number;
    thumbnail?: string;
    mimeType?: string;
    fileName?: string;
    fileSize?: number;
  };
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date;
  readAt?: Date;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: Record<string, number>;
  typing: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatParticipant extends Pick<User, 'id' | 'username' | 'profilePicture'> {
  online: boolean;
  lastSeen?: Date;
  typing?: boolean;
}