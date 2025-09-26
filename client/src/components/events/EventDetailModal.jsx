import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, Users, Star, Globe, Phone, Mail, 
  Heart, Share2, Download, ExternalLink, Bookmark, User, 
  DollarSign, Info, Award, Accessibility, Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const EventDetailModal = ({ event, isOpen, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  if (!isOpen || !event) return null;

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const response = await fetch(`/api/visitor/events/${event._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ticketType: 'adult'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Successfully registered for event!');
        // Refresh event data or update UI
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.upcoming;
  };

  const images = event.media?.images || [];
  const documents = event.media?.documents || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          {images.length > 0 && (
            <div className="h-64 md:h-80 relative overflow-hidden rounded-t-lg">
              <img
                src={images[activeImageIndex]?.url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image navigation */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
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
              {images.length > 1 && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="absolute top-4 right-16 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md flex items-center text-sm"
                >
                  <Camera className="w-4 h-4 mr-1" />
                  {images.length} Photos
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(event.eventStatus)}>
                  {event.eventStatus?.replace('_', ' ').toUpperCase()}
                </Badge>
                {event.featured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline">{event.type?.replace('_', ' ')}</Badge>
                <Badge variant="outline">{event.category}</Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{formatDate(event.schedule.startDate)}</p>
                    {event.schedule.endDate && event.schedule.endDate !== event.schedule.startDate && (
                      <p className="text-sm text-gray-600">to {formatDate(event.schedule.endDate)}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">
                      {formatTime(event.schedule.startTime)} - {formatTime(event.schedule.endTime)}
                    </p>
                    <p className="text-sm text-gray-600">{event.duration?.toFixed(1)} hours</p>
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
                    <p className="font-semibold">{event.museum?.name}</p>
                    {event.location?.venue && (
                      <p className="text-sm text-gray-600">{event.location.venue}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Registration Section */}
          {event.registration?.required && event.eventStatus === 'upcoming' && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-blue-900">Registration Required</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-blue-700">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {event.registration.currentRegistrations || 0} / {event.registration.capacity || 'Unlimited'} registered
                      </div>
                      {event.availableSpots && (
                        <div className="flex items-center">
                          <Info className="w-4 h-4 mr-1" />
                          {event.availableSpots} spots left
                        </div>
                      )}
                    </div>
                    {event.registration.fees?.adult > 0 && (
                      <div className="flex items-center mt-2">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-semibold">
                          {event.registration.fees.adult} {event.registration.currency}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleRegister}
                    disabled={isRegistering || event.isFull}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isRegistering ? 'Registering...' : event.isFull ? 'Event Full' : 'Register Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              {event.speakers?.length > 0 && <TabsTrigger value="speakers">Speakers</TabsTrigger>}
              <TabsTrigger value="details">Details</TabsTrigger>
              {event.reviews?.length > 0 && <TabsTrigger value="reviews">Reviews</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>

              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Start</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.schedule.startDate)} at {formatTime(event.schedule.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">End</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(event.schedule.endDate)} at {formatTime(event.schedule.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-gray-600">{event.duration?.toFixed(1)} hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {event.speakers?.length > 0 && (
              <TabsContent value="speakers" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          {speaker.image ? (
                            <img
                              src={speaker.image}
                              alt={speaker.name}
                              className="w-16 h-16 rounded-full object-cover mr-4"
                            />
                          ) : (
                            <Avatar className="w-16 h-16 mr-4">
                              <AvatarFallback>
                                {speaker.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{speaker.name}</h3>
                            {speaker.title && (
                              <p className="text-sm text-gray-600">{speaker.title}</p>
                            )}
                            {speaker.bio && (
                              <p className="text-sm text-gray-700 mt-2">{speaker.bio}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="details" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Museum</p>
                        <p className="text-gray-600">{event.museum?.name}</p>
                      </div>
                      {event.location?.venue && (
                        <div>
                          <p className="font-medium">Venue</p>
                          <p className="text-gray-600">{event.location.venue}</p>
                        </div>
                      )}
                      {event.location?.address && (
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-gray-600">{event.location.address}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                {event.contact && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {event.contact.person && (
                          <div>
                            <p className="font-medium">Contact Person</p>
                            <p className="text-gray-600">{event.contact.person}</p>
                          </div>
                        )}
                        {event.contact.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <a href={`mailto:${event.contact.email}`} className="text-blue-600 hover:underline">
                              {event.contact.email}
                            </a>
                          </div>
                        )}
                        {event.contact.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            <a href={`tel:${event.contact.phone}`} className="text-blue-600 hover:underline">
                              {event.contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Accessibility */}
                {event.requirements?.accessibility && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Accessibility</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(event.requirements.accessibility).map(([key, value]) => 
                          value && (
                            <div key={key} className="flex items-center">
                              <Accessibility className="w-4 h-4 mr-2 text-green-500" />
                              <span className="text-sm">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Documents */}
              {documents.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
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

            {event.reviews?.length > 0 && (
              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {event.reviews.map((review, index) => (
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
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
