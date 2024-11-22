import React, { useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClickOutside: () => void;
}

export default function EmojiPicker({ onSelect, onClickOutside }: EmojiPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClickOutside();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClickOutside]);

  return (
    <div ref={containerRef} className="absolute bottom-full mb-2">
      <div className="shadow-xl rounded-lg overflow-hidden">
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => onSelect(emoji.native)}
          theme="light"
          set="native"
          showPreview={false}
          showSkinTones={false}
          emojiSize={20}
          emojiButtonSize={28}
          maxFrequentRows={2}
        />
      </div>
    </div>
  );
}