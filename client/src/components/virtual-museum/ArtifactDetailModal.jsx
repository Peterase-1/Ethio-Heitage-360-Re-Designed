import React from 'react';
import { X, MapPin, Calendar, Scale, Palette, Award, Info, Heart, Share2, Eye } from 'lucide-react';

const ArtifactDetailModal = ({ artifact, isOpen, onClose, onFavorite, onShare }) => {
  if (!isOpen || !artifact) return null;

  const handleFavoriteClick = () => {
    onFavorite(artifact.id, !artifact.isFavorited);
  };

  const handleShareClick = () => {
    onShare(artifact);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{artifact.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{artifact.imageTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={artifact.image}
                  alt={artifact.imageTitle || artifact.name}
                  className="w-full h-80 lg:h-96 object-cover"
                />
                {artifact.has3DModel && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      3D Available
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleFavoriteClick}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center ${artifact.isFavorited
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : 'bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${artifact.isFavorited ? 'fill-current' : ''}`} />
                  {artifact.isFavorited ? 'Favorited' : 'Add to Favorites'}
                </button>
                <button
                  onClick={handleShareClick}
                  className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Information Section */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                    {artifact.category}
                  </span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{artifact.views} views</span>
                    <span className="mx-2">•</span>
                    <span>{artifact.likes} likes</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-2 text-muted-foreground/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{artifact.origin}</p>
                      <p className="text-xs text-muted-foreground">Origin</p>
                    </div>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-5 h-5 mr-2 text-muted-foreground/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{artifact.period}</p>
                      <p className="text-xs text-muted-foreground">Period</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{artifact.description}</p>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artifact.material && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Palette className="w-5 h-5 text-muted-foreground/60 mr-2" />
                      <h4 className="font-medium text-foreground">Material</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{artifact.material}</p>
                  </div>
                )}

                {artifact.dimensions && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Scale className="w-5 h-5 text-muted-foreground/60 mr-2" />
                      <h4 className="font-medium text-foreground">Dimensions</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{artifact.dimensions}</p>
                  </div>
                )}

                {artifact.weight && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Scale className="w-5 h-5 text-muted-foreground/60 mr-2" />
                      <h4 className="font-medium text-foreground">Weight</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{artifact.weight}</p>
                  </div>
                )}

                {artifact.condition && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Award className="w-5 h-5 text-muted-foreground/60 mr-2" />
                      <h4 className="font-medium text-foreground">Condition</h4>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${artifact.condition === 'Excellent' || artifact.condition === 'Pristine'
                        ? 'bg-green-500/10 text-green-500'
                        : artifact.condition === 'Good' || artifact.condition === 'Very Good'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                      {artifact.condition}
                    </span>
                  </div>
                )}
              </div>

              {/* Historical Significance */}
              {artifact.significance && (
                <div>
                  <div className="flex items-center mb-3">
                    <Info className="w-5 h-5 text-muted-foreground/60 mr-2" />
                    <h3 className="text-lg font-semibold text-foreground">Historical Significance</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed bg-secondary/5 p-4 rounded-lg border-l-4 border-secondary/50">
                    {artifact.significance}
                  </p>
                </div>
              )}

              {/* Museum Information */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Museum Collection</h3>
                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
                  <div>
                    <p className="font-medium text-foreground">{artifact.museum}</p>
                    <p className="text-sm text-muted-foreground">Current Location</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-muted-foreground">On Display</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtifactDetailModal;
