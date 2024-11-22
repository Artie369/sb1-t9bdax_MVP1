import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage } from '../../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showTime: boolean;
}

export default function MessageBubble({ message, isOwn, showTime }: MessageBubbleProps) {
  const renderContent = () => {
    switch (message.contentType) {
      case 'image':
        return (
          <img
            src={message.content}
            alt="attachment"
            className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.content, '_blank')}
          />
        );
      case 'video':
        return (
          <video
            src={message.content}
            controls
            className="max-w-[200px] rounded-lg"
            poster={message.metadata?.thumbnail}
          />
        );
      case 'audio':
        return (
          <audio src={message.content} controls className="max-w-[200px]" />
        );
      default:
        return <p className="break-words">{message.content}</p>;
    }
  };

  const renderStatus = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4" />;
      case 'delivered':
      case 'read':
        return <CheckCheck className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col ${
        isOwn ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwn
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        {renderContent()}
        <div className={`flex items-center justify-end gap-1 mt-1 ${
          isOwn ? 'text-white/70' : 'text-gray-500'
        }`}>
          <span className="text-xs">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isOwn && renderStatus()}
        </div>
      </div>
      {showTime && (
        <div className="text-xs text-gray-500 my-2">
          {format(new Date(message.createdAt), 'MMM d, yyyy')}
        </div>
      )}
    </div>
  );
}