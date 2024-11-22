import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import { useMessageStore } from '../../store/messageStore';
import { Heart } from 'lucide-react';

interface MessageListProps {
  matchId: string;
}

export default function MessageList({ matchId }: MessageListProps) {
  const { user } = useAuthStore();
  const { messages, loading } = useMessageStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    scrollToBottom();
    // Add a small delay to ensure messages are rendered
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [messages[matchId]]);

  if (!user || !matchId) return null;

  const matchMessages = messages[matchId] || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Heart className="w-8 h-8 animate-pulse text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {matchMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        matchMessages.map((message) => {
          const isSender = message.senderId === user.id;
          
          return (
            <div
              key={message.id}
              className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isSender
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  isSender ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {format(new Date(message.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}