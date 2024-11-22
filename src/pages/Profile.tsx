import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Navigation from '../components/Layout/Navigation';
import EditProfileModal from '../components/Profile/EditProfileModal';
import { Pencil } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-lg mx-auto p-4">
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <img
                  src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}`}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-gray-600">{user.age} years old</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Edit profile"
            >
              <Pencil className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">About Me</h2>
          </div>
          <p className="text-gray-700">{user.bio || 'No bio yet'}</p>
        </div>

        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Details</h2>
          </div>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-gray-600">Gender Identity</dt>
              <dd className="font-medium">{user.genderIdentity}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Sexual Orientation</dt>
              <dd className="font-medium">{user.sexualOrientation}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Membership</dt>
              <dd className="font-medium capitalize">{user.membershipTier}</dd>
            </div>
          </dl>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      
      <Navigation />
    </div>
  );
}