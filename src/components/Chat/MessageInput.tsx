import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMessageStore } from '../../store/messageStore';
import { toast } from 'react-hot-toast';

interface MessageInputProps {
  matchId: string;
}

export default function MessageInput({ matchId }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();
  const { sendMessage } = useMessageStore();

  if (!user || !matchId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    try {
      await sendMessage(matchId, user.id, message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-gray-300 focus:border-primary-500
            focus:ring-2 focus:ring-primary-200 p-3"
        />
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="p-3 bg-primary-500 text-white rounded-full disabled:opacity-50
            hover:bg-primary-600 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}