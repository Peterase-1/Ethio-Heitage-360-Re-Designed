import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Lock, Play, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const VirtualMuseumButton = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleVirtualMuseumClick = () => {
    if (!isAuthenticated) {
      // Store the intended destination
      sessionStorage.setItem('redirectAfterLogin', '/virtual-museum');
      navigate('/auth');
    } else {
      navigate('/virtual-museum');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={handleVirtualMuseumClick}
        className="group relative w-full bg-gradient-to-r from-primary via-secondary to-accent text-white px-8 py-6 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-primary/25 transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-secondary/80 to-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Sparkle Effects */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
        </div>
        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150">
          <Sparkles className="w-3 h-3 text-yellow-200 animate-pulse" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <Lock className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <Eye className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            )}
            <span className="text-xl font-bold">Virtual Museum</span>
            <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
          
          <div className="text-center">
            <p className="text-sm opacity-90">
              {!isAuthenticated 
                ? "Login to explore 3D artifacts & book tours"
                : "Explore interactive 3D exhibitions"
              }
            </p>
          </div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-r from-primary via-secondary to-accent blur-xl -z-10"></div>
      </button>
    </div>
  );
};

export default VirtualMuseumButton;
