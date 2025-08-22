import React from 'react';
import { Eye, MapPin, Heart, Share2, Star } from 'lucide-react';

const ArtifactCard = ({ artifact, onView, onFavorite, onShare }) => {
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavorite(artifact.id, !artifact.isFavorited);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    onShare(artifact);
  };

  const handleViewClick = () => {
    onView(artifact);
  };

  return (
    <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={artifact.image || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center'}
          alt={artifact.imageTitle || artifact.name}
          title={artifact.imageTitle || artifact.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center';
          }}
        />
        
        {/* Overlay with quick actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleFavoriteClick}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
                artifact.isFavorited 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${artifact.isFavorited ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={handleShareClick}
              className="w-8 h-8 rounded-full bg-white/90 text-gray-700 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* 3D Badge */}
        {artifact.has3DModel && (
          <div className="absolute top-3 left-3">
            <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              3D View
            </span>
          </div>
        )}
        
        {/* Rating */}
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
            <span className="text-xs font-medium text-gray-700">{artifact.rating}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header with category */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
            {artifact.name}
          </h3>
          <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ml-2">
            {artifact.category}
          </span>
        </div>

        {/* Origin and Period */}
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{artifact.origin}</span>
          <span className="mx-2">•</span>
          <span>{artifact.period}</span>
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {artifact.description}
        </p>

        {/* Additional Information */}
        {artifact.material && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Material:</span>
                <p className="font-medium text-card-foreground">{artifact.material}</p>
              </div>
              {artifact.dimensions && (
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium text-card-foreground">{artifact.dimensions}</p>
                </div>
              )}
            </div>
            {artifact.condition && (
              <div className="mt-2">
                <span className="text-muted-foreground">Condition:</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  artifact.condition === 'Excellent' || artifact.condition === 'Pristine' 
                    ? 'bg-green-100 text-green-800' 
                    : artifact.condition === 'Good' || artifact.condition === 'Very Good'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>{artifact.condition}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
          <div className="flex items-center gap-4">
            <span>{artifact.views} views</span>
            <span>{artifact.likes} likes</span>
          </div>
          <span className="text-muted-foreground/70">{artifact.museum}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleViewClick}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-full font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center group/btn group-hover:translate-x-2 transition-transform duration-300"
        >
          <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
          {artifact.has3DModel ? 'Explore in 3D' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default ArtifactCard;
