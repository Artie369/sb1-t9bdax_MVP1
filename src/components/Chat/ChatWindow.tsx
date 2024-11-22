import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../../store/chatStore';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { useInView } from 'react-intersection-observer';

export default function ChatWindow() {
  const { roomId } = useParams<{ roomId: string }>();
  const { messages, loadRoom } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { ref: bottomRef, inView } = useInView();

  useEffect(() => {
    if (roomId) {
      const unsubscribe = loadRoom(roomId);
      return () => {
        unsubscribe();
      };
    }
  }, [roomId]);

  useEffect(() => {
    if (!inView) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, inView]);

  if (!roomId) return null;

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader roomId={roomId} />
      
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <MessageList
          messages={messages[roomId] || []}
          bottomRef={bottomRef}
        />
        <div ref={messagesEndRef} />
      </div>

      <MessageInput roomId={roomId} />
    </div>
  );
}