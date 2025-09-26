import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, Star, Globe, Phone, Mail, Heart, Share2, 
  Download, ExternalLink, Bookmark, User, DollarSign, Info, Award, 
  Accessibility, Camera, Play, Volume2, Eye, Users, Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const ExhibitionDetailModal = ({ exhibition, isOpen, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  if (!isOpen || !exhibition) return null;

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setIsReviewing(true);
    try {
      const response = await fetch(`/api/visitor/exhibitions/${exhibition._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating,
          comment: reviewComment
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Review submitted successfully!');
        setRating(0);
        setReviewComment('');
        // Refresh exhibition data
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsReviewing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      'closing_soon': 'bg-orange-100 text-orange-800',
      ended: 'bg-gray-100 text-gray-800',
      closed: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.ongoing;
  };

  const galleryImages = exhibition.galleryImages || exhibition.media?.images || [];
  const documents = exhibition.media?.documents || [];
  const audioGuides = exhibition.media?.audioGuide || [];
  const videos = exhibition.media?.videos || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          {galleryImages.length > 0 && (
            <div className="h-64 md:h-80 relative overflow-hidden rounded-t-lg">
              <img
                src={galleryImages[activeImageIndex]?.url}
                alt={exhibition.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image navigation */}
              {galleryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === activeImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Gallery button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="absolute top-4 right-16 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md flex items-center text-sm"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  {galleryImages.length} Photos
                </button>
              )}
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Title and Status */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{exhibition.title}</h1>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(exhibition.exhibitionStatus)}>
                  {exhibition.exhibitionStatus?.replace('_', ' ').toUpperCase()}
                </Badge>
                {exhibition.featured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {exhibition.isClosingSoon && (
                  <Badge className="bg-orange-500 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    Ending Soon
                  </Badge>
                )}
                <Badge variant="outline">{exhibition.type?.replace('_', ' ')}</Badge>
                <Badge variant="outline">{exhibition.category}</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">
                      {exhibition.type === 'permanent' ? 'Permanent' : 'Duration'}
                    </p>
                    <p className="font-semibold">{formatDate(exhibition.schedule.startDate)}</p>
                    {exhibition.schedule.endDate && exhibition.type !== 'permanent' && (
                      <p className="text-sm text-gray-600">to {formatDate(exhibition.schedule.endDate)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{exhibition.location?.gallery}</p>
                    <p className="text-sm text-gray-600">{exhibition.museum?.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-semibold">
                      {exhibition.statistics?.averageRating?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {exhibition.statistics?.totalReviews || 0} reviews
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Visitors</p>
                    <p className="font-semibold">{exhibition.statistics?.totalVisitors || 0}</p>
                    <p className="text-sm text-gray-600">{exhibition.statistics?.totalViews || 0} views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Days Remaining Alert */}
          {exhibition.daysRemaining && exhibition.daysRemaining <= 30 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Limited Time</h3>
                    <p className="text-sm text-orange-700">
                      This exhibition ends in {exhibition.daysRemaining} days. Don't miss it!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
              <TabsTrigger value="multimedia">Multimedia</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              {exhibition.reviews?.length > 0 && <TabsTrigger value="reviews">Reviews</TabsTrigger>}
              <TabsTrigger value="add-review">Write Review</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">{exhibition.description}</p>
              </div>

              {/* Highlights */}
              {exhibition.processedHighlights?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Exhibition Highlights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exhibition.processedHighlights.map((highlight, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          {highlight.image && (
                            <img
                              src={highlight.image}
                              alt={highlight.title}
                              className="w-full h-32 object-cover rounded mb-3"
                            />
                          )}
                          <h4 className="font-medium mb-2">{highlight.title}</h4>
                          <p className="text-sm text-gray-600">{highlight.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Themes */}
              {exhibition.themes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {exhibition.themes.map((theme, index) => (
                      <Badge key={index} variant="outline">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {exhibition.tags?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {exhibition.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="artifacts" className="mt-6">
              {exhibition.artifacts?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exhibition.artifacts.map((artifactItem, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        {artifactItem.artifact?.images?.[0] && (
                          <img
                            src={artifactItem.artifact.images[0].url}
                            alt={artifactItem.artifact.name}
                            className="w-full h-48 object-cover rounded mb-3"
                          />
                        )}
                        <h3 className="font-semibold mb-2">{artifactItem.artifact?.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{artifactItem.artifact?.description}</p>
                        {artifactItem.displayNote && (
                          <p className="text-xs text-blue-600 italic">{artifactItem.displayNote}</p>
                        )}
                        {artifactItem.isHighlight && (
                          <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Highlight
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No artifacts information available</p>
              )}
            </TabsContent>

            <TabsContent value="multimedia" className="mt-6">
              <div className="space-y-6">
                {/* Videos */}
                {videos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((video, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
                              <Play className="w-12 h-12 text-gray-400" />
                            </div>
                            <h4 className="font-medium mb-2">{video.title}</h4>
                            <p className="text-sm text-gray-600">{video.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {video.type?.replace('_', ' ')}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Guides */}
                {audioGuides.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Audio Guides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {audioGuides.map((audio, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <Volume2 className="w-8 h-8 text-blue-500 mr-3" />
                              <div>
                                <h4 className="font-medium">{audio.language} Audio Guide</h4>
                                <p className="text-sm text-gray-600">{audio.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Duration: {Math.floor(audio.duration / 60)}:{audio.duration % 60} min
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Virtual Tour */}
                {exhibition.media?.virtualTour && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Virtual Tour</h3>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center">
                          <Globe className="w-8 h-8 text-green-500 mr-3" />
                          <div className="flex-1">
                            <h4 className="font-medium">360° Virtual Tour</h4>
                            <p className="text-sm text-gray-600">{exhibition.media.virtualTour.description}</p>
                            <Badge variant="outline" className="mt-2">
                              {exhibition.media.virtualTour.provider}
                            </Badge>
                          </div>
                          <Button variant="outline" className="ml-4">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Start Tour
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Museum Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Museum Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Museum</p>
                        <p className="text-gray-600">{exhibition.museum?.name}</p>
                      </div>
                      <div>
                        <p className="font-medium">Gallery</p>
                        <p className="text-gray-600">{exhibition.location?.gallery}</p>
                      </div>
                      {exhibition.location?.floor && (
                        <div>
                          <p className="font-medium">Floor</p>
                          <p className="text-gray-600">{exhibition.location.floor}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Curator Information */}
                {exhibition.curator && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Curator</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <User className="w-8 h-8 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium">{exhibition.curator.name}</p>
                          {exhibition.curator.title && (
                            <p className="text-sm text-gray-600">{exhibition.curator.title}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Accessibility */}
                {exhibition.accessibility && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Accessibility</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(exhibition.accessibility).map(([key, value]) => 
                          value === true && (
                            <div key={key} className="flex items-center">
                              <Accessibility className="w-4 h-4 mr-2 text-green-500" />
                              <span className="text-sm">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Educational Information */}
                {exhibition.educational && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Educational Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {exhibition.educational.targetAudience?.length > 0 && (
                        <div className="mb-3">
                          <p className="font-medium">Target Audience</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {exhibition.educational.targetAudience.map((audience, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {audience.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {exhibition.educational.learningObjectives?.length > 0 && (
                        <div>
                          <p className="font-medium">Learning Objectives</p>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            {exhibition.educational.learningObjectives.map((objective, index) => (
                              <li key={index}>• {objective}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Documents */}
              {documents.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4 mr-3 text-gray-400" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {exhibition.reviews?.length > 0 && (
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {exhibition.reviews.map((review, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <Avatar className="w-10 h-10 mr-3">
                            <AvatarImage src={review.user?.profileImage} />
                            <AvatarFallback>
                              {review.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{review.user?.name || 'Anonymous'}</h4>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 mt-2">{review.comment}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                              {review.isVerified && (
                                <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                                  Verified Visit
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="add-review" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-1 ${
                              star <= rating ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400`}
                          >
                            <Star className="w-6 h-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your thoughts about this exhibition..."
                        className="w-full p-3 border rounded-lg resize-none h-24"
                        maxLength={1000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {reviewComment.length}/1000 characters
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleReviewSubmit}
                      disabled={isReviewing || rating === 0}
                      className="w-full"
                    >
                      {isReviewing ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionDetailModal;
