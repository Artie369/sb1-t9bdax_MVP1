import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMatchStore } from '../store/matchStore';
import { useMessageStore } from '../store/messageStore';
import Navigation from '../components/Layout/Navigation';
import MatchCard from '../components/Matches/MatchCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Heart, MessageCircle } from 'lucide-react';

export default function Matches() {
  const { user } = useAuthStore();
  const { matches, loading, fetchMatches } = useMatchStore();
  const { messages } = useMessageStore();
  const [activeTab, setActiveTab] = useState<'matches' | 'likes'>('matches');

  useEffect(() => {
    if (user) {
      fetchMatches(user.id);
    }
  }, [user]);

  if (!user) return null;

  const matchedProfiles = matches.filter(match => match.status === 'matched');
  const likedProfiles = matches.filter(match => match.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto p-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'matches' | 'likes')}>
          <TabsList className="w-full mb-6">
            <TabsTrigger 
              value="matches" 
              className="flex-1 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Matches ({matchedProfiles.length})
            </TabsTrigger>
            <TabsTrigger 
              value="likes" 
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Likes ({likedProfiles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            {loading ? (
              <div className="text-center text-gray-500">Loading matches...</div>
            ) : matchedProfiles.length === 0 ? (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                  <p className="text-gray-500">
                    When you match with someone, they'll appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedProfiles.map(match => {
                  const otherUserId = match.users.find(id => id !== user.id);
                  if (!otherUserId) return null;

                  const matchMessages = messages[match.id] || [];
                  const lastMessage = matchMessages[matchMessages.length - 1]?.content;

                  return (
                    <MatchCard
                      key={match.id}
                      match={match}
                      otherUserId={otherUserId}
                      lastMessage={lastMessage}
                      type="match"
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes">
            {loading ? (
              <div className="text-center text-gray-500">Loading likes...</div>
            ) : likedProfiles.length === 0 ? (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No likes yet</h3>
                  <p className="text-gray-500">
                    When someone likes your profile, they'll appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {likedProfiles.map(match => {
                  const otherUserId = match.users.find(id => id !== user.id);
                  if (!otherUserId) return null;

                  return (
                    <MatchCard
                      key={match.id}
                      match={match}
                      otherUserId={otherUserId}
                      type="like"
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Navigation />
    </div>
  );
}