import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Star, Clock, Users, Eye, ChevronRight, Grid, List, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import EventDetailModal from '../../components/events/EventDetailModal';
import ExhibitionDetailModal from '../../components/exhibitions/ExhibitionDetailModal';

const EventsExhibitions = () => {
  const [events, setEvents] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [featuredExhibitions, setFeaturedExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [filters, setFilters] = useState({
    types: [],
    categories: [],
    museums: [],
    cities: []
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
    fetchFilters();
  }, [currentPage, searchTerm, selectedCategory, selectedType, selectedCity, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedCity !== 'all' && { city: selectedCity })
      });

      if (activeTab === 'events' || activeTab === 'all') {
        const eventsResponse = await fetch(`/api/visitor/events?${params}`);
        const eventsData = await eventsResponse.json();
        
        if (eventsData.success) {
          setEvents(eventsData.data);
          setTotalPages(eventsData.pagination.pages);
        }

        // Fetch featured events
        const featuredEventsResponse = await fetch('/api/visitor/events/featured?limit=6');
        const featuredEventsData = await featuredEventsResponse.json();
        if (featuredEventsData.success) {
          setFeaturedEvents(featuredEventsData.data);
        }
      }

      if (activeTab === 'exhibitions' || activeTab === 'all') {
        const exhibitionsResponse = await fetch(`/api/visitor/exhibitions?${params}`);
        const exhibitionsData = await exhibitionsResponse.json();
        
        if (exhibitionsData.success) {
          setExhibitions(exhibitionsData.data);
          setTotalPages(Math.max(totalPages, exhibitionsData.pagination.pages));
        }

        // Fetch featured exhibitions
        const featuredExhibitionsResponse = await fetch('/api/visitor/exhibitions/featured?limit=6');
        const featuredExhibitionsData = await featuredExhibitionsResponse.json();
        if (featuredExhibitionsData.success) {
          setFeaturedExhibitions(featuredExhibitionsData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [eventsFilters, exhibitionsFilters] = await Promise.all([
        fetch('/api/visitor/events/filters').then(r => r.json()),
        fetch('/api/visitor/exhibitions/filters').then(r => r.json())
      ]);

      const combinedFilters = {
        types: [...(eventsFilters.data?.types || []), ...(exhibitionsFilters.data?.types || [])],
        categories: [...(eventsFilters.data?.categories || []), ...(exhibitionsFilters.data?.categories || [])],
        museums: [...(eventsFilters.data?.museums || []), ...(exhibitionsFilters.data?.museums || [])],
        cities: [...(eventsFilters.data?.cities || []), ...(exhibitionsFilters.data?.cities || [])]
      };

      // Remove duplicates
      combinedFilters.types = combinedFilters.types.filter((item, index, self) => 
        index === self.findIndex(t => t.value === item.value));
      combinedFilters.categories = combinedFilters.categories.filter((item, index, self) => 
        index === self.findIndex(t => t.value === item.value));
      combinedFilters.cities = [...new Set(combinedFilters.cities)];

      setFilters(combinedFilters);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (item, type = 'event') => {
    const status = type === 'event' ? item.eventStatus : item.exhibitionStatus;
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      'closing_soon': 'bg-orange-100 text-orange-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={colors[status] || colors.ongoing}>
        {status?.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const EventCard = ({ event }) => (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedEvent(event)}>
      <div className="relative">
        {event.media?.images?.[0] && (
          <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            <img 
              src={event.media.images[0].url} 
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        {event.featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600">
            {event.title}
          </CardTitle>
          {getStatusBadge(event, 'event')}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {event.shortDescription || event.description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.schedule.startDate)}
            {event.schedule.endDate && event.schedule.endDate !== event.schedule.startDate && 
              ` - ${formatDate(event.schedule.endDate)}`}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {event.museum?.name}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {event.registration?.currentRegistrations || 0} registered
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {event.statistics?.totalViews || 0}
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {event.type?.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {event.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const ExhibitionCard = ({ exhibition }) => (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedExhibition(exhibition)}>
      <div className="relative">
        {exhibition.primaryImage && (
          <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
            <img 
              src={exhibition.primaryImage.url} 
              alt={exhibition.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        {exhibition.featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
        {exhibition.isClosingSoon && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-orange-500 text-white">
              <Clock className="w-3 h-3 mr-1" />
              Ending Soon
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600">
            {exhibition.title}
          </CardTitle>
          {getStatusBadge(exhibition, 'exhibition')}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {exhibition.shortDescription || exhibition.description}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(exhibition.schedule.startDate)}
            {exhibition.schedule.endDate && exhibition.type !== 'permanent' && 
              ` - ${formatDate(exhibition.schedule.endDate)}`}
            {exhibition.type === 'permanent' && <span className="ml-1">(Permanent)</span>}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {exhibition.museum?.name} - {exhibition.location?.gallery}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2" />
              {exhibition.statistics?.averageRating?.toFixed(1) || 'N/A'} 
              ({exhibition.statistics?.totalReviews || 0})
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {exhibition.statistics?.totalViews || 0}
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            {exhibition.type?.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {exhibition.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const FeaturedSection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2" />
        Featured Events & Exhibitions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredEvents.slice(0, 3).map((event) => (
          <EventCard key={`event-${event._id}`} event={event} />
        ))}
        {featuredExhibitions.slice(0, 3).map((exhibition) => (
          <ExhibitionCard key={`exhibition-${exhibition._id}`} exhibition={exhibition} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events & Exhibitions</h1>
          <p className="text-lg text-gray-600">
            Discover exciting events and exhibitions at museums across Ethiopia
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="md:col-span-2 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events and exhibitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filters.categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {filters.types.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {filters.cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <FeaturedSection />

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <EventCard key={`event-${event._id}`} event={event} />
                    ))}
                    {exhibitions.map((exhibition) => (
                      <ExhibitionCard key={`exhibition-${exhibition._id}`} exhibition={exhibition} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="events">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="exhibitions">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exhibitions.map((exhibition) => (
                      <ExhibitionCard key={exhibition._id} exhibition={exhibition} />
                    ))}
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      
      {selectedExhibition && (
        <ExhibitionDetailModal
          exhibition={selectedExhibition}
          isOpen={!!selectedExhibition}
          onClose={() => setSelectedExhibition(null)}
        />
      )}
    </div>
  );
};

export default EventsExhibitions;
