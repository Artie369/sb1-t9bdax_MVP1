import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-purple-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-8">
          <Heart className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4">
          Find Your Perfect Match
        </h1>
        
        <p className="text-white/90 mb-8">
          Share your authentic self through short videos and connect with like-minded people in the LGBTQIA+ community.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="w-full btn-primary bg-white text-primary-500 hover:bg-white/90"
          >
            Get Started
          </button>
          
          <button
            onClick={() => navigate('/auth?mode=signin')}
            className="w-full btn-secondary border-white text-white hover:bg-white/10"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}