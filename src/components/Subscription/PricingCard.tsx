import React from 'react';
import { Check } from 'lucide-react';
import { TIER_FEATURES } from '../../utils/constants';
import type { User } from '../../types';

interface PricingCardProps {
  tier: keyof typeof TIER_FEATURES;
  currentTier?: User['membershipTier'];
  onSelect: (tier: string) => void;
}

export default function PricingCard({ tier, currentTier, onSelect }: PricingCardProps) {
  const features = TIER_FEATURES[tier];
  const isCurrentTier = currentTier === tier;

  return (
    <div className={`card ${
      isCurrentTier ? 'border-2 border-primary-500' : ''
    }`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold capitalize mb-2">{tier}</h3>
        <p className="text-3xl font-bold">
          ${features.price}
          <span className="text-sm font-normal text-gray-500">/month</span>
        </p>
      </div>

      <ul className="space-y-4 mb-6">
        <li className="flex items-center">
          <Check className="w-5 h-5 text-primary-500 mr-2" />
          <span>
            {features.swipesPerDay === -1 
              ? 'Unlimited swipes'
              : `${features.swipesPerDay} swipes per day`}
          </span>
        </li>
        <li className="flex items-center">
          <Check className="w-5 h-5 text-primary-500 mr-2" />
          <span>
            {features.videoUploads === -1
              ? 'Unlimited video uploads'
              : `${features.videoUploads} video uploads`}
          </span>
        </li>
        <li className="flex items-center">
          <Check className="w-5 h-5 text-primary-500 mr-2" />
          <span>{features.superLikes} super likes per day</span>
        </li>
      </ul>

      <button
        onClick={() => onSelect(tier)}
        className={`w-full ${
          isCurrentTier
            ? 'btn-secondary'
            : 'btn-primary'
        }`}
        disabled={isCurrentTier}
      >
        {isCurrentTier ? 'Current Plan' : 'Select Plan'}
      </button>
    </div>
  );
}