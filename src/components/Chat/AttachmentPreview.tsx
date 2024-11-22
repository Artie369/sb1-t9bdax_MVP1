import React from 'react';
import { X, File } from 'lucide-react';

interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
}

export default function AttachmentPreview({ file, onRemove }: AttachmentPreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="relative group">
      {isImage ? (
        <img
          src={URL.createObjectURL(file)}
          alt="attachment"
          className="h-20 w-20 object-cover rounded"
        />
      ) : isVideo ? (
        <video
          src={URL.createObjectURL(file)}
          className="h-20 w-20 object-cover rounded"
        />
      ) : isAudio ? (
        <div className="h-20 w-20 bg-gray-100 rounded flex items-center justify-center">
          <audio
            src={URL.createObjectURL(file)}
            controls
            className="w-full h-8"
          />
        </div>
      ) : (
        <div className="h-20 w-20 bg-gray-100 rounded flex flex-col items-center justify-center p-2">
          <File className="w-8 h-8 text-gray-400" />
          <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
            {file.name}
          </span>
        </div>
      )}

      <div className="absolute -top-2 -right-2">
        <button
          onClick={onRemove}
          className="bg-red-500 text-white rounded-full p-1
            opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b">
        {formatFileSize(file.size)}
      </div>
    </div>
  );
}