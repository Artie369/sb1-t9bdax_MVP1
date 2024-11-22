import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { GENDER_IDENTITIES, SEXUAL_ORIENTATIONS } from '../../utils/constants';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditProfileForm {
  username: string;
  bio: string;
  genderIdentity: string;
  sexualOrientation: string;
}

const MAX_IMAGE_SIZE = 800;
const JPEG_QUALITY = 0.7;

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EditProfileForm>();

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      reset({
        username: user.username || '',
        bio: user.bio || '',
        genderIdentity: user.genderIdentity || '',
        sexualOrientation: user.sexualOrientation || '',
      });
    }
  }, [isOpen, user, reset]);

  if (!isOpen || !user) return null;

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_IMAGE_SIZE) {
              height *= MAX_IMAGE_SIZE / width;
              width = MAX_IMAGE_SIZE;
            }
          } else {
            if (height > MAX_IMAGE_SIZE) {
              width *= MAX_IMAGE_SIZE / height;
              height = MAX_IMAGE_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          resolve(optimizedDataUrl);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      const optimizedDataUrl = await optimizeImage(file);
      setPreviewUrl(optimizedDataUrl);
      setError(null);
    } catch (err) {
      console.error('Error optimizing image:', err);
      setError('Failed to process image. Please try again.');
    }
  };

  const onSubmit = async (data: EditProfileForm) => {
    if (!user) return;

    try {
      setUploading(true);
      setError(null);

      const userRef = doc(db, 'users', user.id);
      const updateData = {
        ...data,
        profilePicture: previewUrl || user.profilePicture,
        updatedAt: new Date()
      };

      await updateDoc(userRef, updateData);

      useAuthStore.setState(state => ({
        user: state.user ? {
          ...state.user,
          ...updateData
        } : null
      }));

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div
                  onClick={handleImageClick}
                  className="w-24 h-24 rounded-full overflow-hidden cursor-pointer group relative"
                >
                  <img
                    src={previewUrl || user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  }
                })}
                className="input-primary"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                {...register('bio')}
                className="input-primary min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender Identity
              </label>
              <select {...register('genderIdentity')} className="input-primary">
                {GENDER_IDENTITIES.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexual Orientation
              </label>
              <select {...register('sexualOrientation')} className="input-primary">
                {SEXUAL_ORIENTATIONS.map((orientation) => (
                  <option key={orientation} value={orientation}>{orientation}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}