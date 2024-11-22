import React from 'react';
import { useAuthStore } from '../../store/authStore';
import PricingCard from '../../components/Subscription/PricingCard';
import { MEMBERSHIP_TIERS } from '../../utils/constants';

export default function Subscription() {
  const { user } = useAuthStore();

  const handleSelectTier = async (tier: string) => {
    // Implement Stripe payment flow
    console.log(`Selected tier: ${tier}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock premium features and enhance your dating experience with our subscription plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(MEMBERSHIP_TIERS).map((tier) => (
            <PricingCard
              key={tier}
              tier={tier}
              currentTier={user.membershipTier}
              onSelect={handleSelectTier}
            />
          ))}
        </div>
      </div>
    </div>
  );
}