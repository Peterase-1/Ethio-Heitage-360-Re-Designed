import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import VisitorSidebar from '../../components/dashboard/VisitorSidebar';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Users,
  Bookmark,
  Share2,
  Filter,
  Search,
  Download,
  Bell,
  Heart,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const CulturalCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'list', 'upcoming'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const [reminders, setReminders] = useState(new Set());

  // Ethiopian cultural events and holidays
  const culturalEvents = {
    // Religious holidays (Ethiopian Orthodox)
    religious: [
      {
        id: 1,
        title: 'Genna (Ethiopian Christmas)',
        date: '2024-01-07',
        category: 'religious',
        description: 'Ethiopian Orthodox Christmas celebration',
        significance: 'Commemorates the birth of Jesus Christ according to the Ethiopian Orthodox calendar',
        traditions: ['Special church services', 'Traditional foods like doro wat', 'Gift giving', 'Family gatherings'],
        location: 'Nationwide',
        type: 'National Holiday'
      },
      {
        id: 2,
        title: 'Timkat (Ethiopian Epiphany)',
        date: '2024-01-19',
        category: 'religious',
        description: 'Ethiopian Orthodox celebration of the baptism of Jesus',
        significance: 'Celebrates the baptism of Jesus Christ in the River Jordan',
        traditions: ['Colorful processions', 'Water blessing ceremonies', 'Traditional white clothing', 'Religious dancing'],
        location: 'Nationwide, especially Lalibela and Gondar',
        type: 'National Holiday'
      },
      {
        id: 3,
        title: 'Fasika (Ethiopian Easter)',
        date: '2024-05-05',
        category: 'religious',
        description: 'Ethiopian Orthodox Easter celebration',
        significance: 'Celebrates the resurrection of Jesus Christ',
        traditions: ['Breaking of fasting period', 'Special church services', 'Traditional foods', 'Community celebrations'],
        location: 'Nationwide',
        type: 'National Holiday'
      },
      {
        id: 4,
        title: 'Meskel (Finding of the True Cross)',
        date: '2024-09-27',
        category: 'religious',
        description: 'Celebration of the discovery of the True Cross',
        significance: 'Commemorates the finding of the cross on which Jesus was crucified',
        traditions: ['Bonfire ceremonies', 'Flower decorations', 'Traditional dancing', 'Community gatherings'],
        location: 'Nationwide, especially Addis Ababa',
        type: 'National Holiday'
      }
    ],
    
    // Cultural festivals
    cultural: [
      {
        id: 5,
        title: 'Enkutatash (Ethiopian New Year)',
        date: '2024-09-11',
        category: 'cultural',
        description: 'Ethiopian New Year celebration',
        significance: 'Marks the beginning of the Ethiopian calendar year',
        traditions: ['Yellow daisy flowers', 'Traditional songs', 'Gift giving', 'Fresh start celebrations'],
        location: 'Nationwide',
        type: 'National Holiday'
      },
      {
        id: 6,
        title: 'Irreecha Festival',
        date: '2024-10-06',
        category: 'cultural',
        description: 'Oromo thanksgiving festival',
        significance: 'Oromo people give thanks to God for the blessings of the past year',
        traditions: ['Pilgrimage to lakes and rivers', 'Traditional songs and dances', 'Thanksgiving prayers', 'Colorful ceremonies'],
        location: 'Oromia Region, especially Bishoftu',
        type: 'Cultural Festival'
      },
      {
        id: 7,
        title: 'Sigd Festival',
        date: '2024-11-28',
        category: 'cultural',
        description: 'Beta Israel (Ethiopian Jewish) holiday',
        significance: 'Commemorates the giving of the Torah and renewal of covenant with God',
        traditions: ['Prayer and fasting', 'Reading of sacred texts', 'Community gatherings', 'Traditional ceremonies'],
        location: 'Jerusalem and Ethiopian Jewish communities',
        type: 'Cultural Holiday'
      }
    ],
    
    // Modern holidays
    modern: [
      {
        id: 8,
        title: 'Victory of Adwa Day',
        date: '2024-03-02',
        category: 'modern',
        description: 'Commemorates the victory over Italian forces',
        significance: 'Celebrates Ethiopias victory at the Battle of Adwa in 1896',
        traditions: ['Military parades', 'Cultural performances', 'Historical commemorations', 'National pride celebrations'],
        location: 'Nationwide, especially Adwa',
        type: 'National Holiday'
      },
      {
        id: 9,
        title: 'Ethiopian Patriots Victory Day',
        date: '2024-05-05',
        category: 'modern',
        description: 'Liberation from Italian occupation',
        significance: 'Commemorates the end of Italian occupation in 1941',
        traditions: ['Memorial services', 'Historical exhibitions', 'Patriotic songs', 'National ceremonies'],
        location: 'Nationwide',
        type: 'National Holiday'
      }
    ]
  };

  // Ethiopian months and calendar info
  const ethiopianMonths = [
    { name: 'Meskerem', gregorianStart: 'Sept 11/12', days: 30 },
    { name: 'Tikimt', gregorianStart: 'Oct 11/12', days: 30 },
    { name: 'Hidar', gregorianStart: 'Nov 10/11', days: 30 },
    { name: 'Tahsas', gregorianStart: 'Dec 10/11', days: 30 },
    { name: 'Tir', gregorianStart: 'Jan 9/10', days: 30 },
    { name: 'Yekatit', gregorianStart: 'Feb 8/9', days: 30 },
    { name: 'Megabit', gregorianStart: 'Mar 10/11', days: 30 },
    { name: 'Miazia', gregorianStart: 'Apr 9/10', days: 30 },
    { name: 'Ginbot', gregorianStart: 'May 9/10', days: 30 },
    { name: 'Sene', gregorianStart: 'Jun 8/9', days: 30 },
    { name: 'Hamle', gregorianStart: 'Jul 8/9', days: 30 },
    { name: 'Nehasse', gregorianStart: 'Aug 7/8', days: 30 },
    { name: 'Pagumen', gregorianStart: 'Sep 6/7', days: '5/6' }
  ];

  // Get all events in a flat array
  const allEvents = [...culturalEvents.religious, ...culturalEvents.cultural, ...culturalEvents.modern];

  const eventCategories = [
    { value: 'all', label: 'All Events', color: 'bg-gray-100 text-gray-800' },
    { value: 'religious', label: 'Religious', color: 'bg-blue-100 text-blue-800' },
    { value: 'cultural', label: 'Cultural', color: 'bg-green-100 text-green-800' },
    { value: 'modern', label: 'Modern', color: 'bg-purple-100 text-purple-800' }
  ];

  // Filter events based on selected category
  const filteredEvents = selectedCategory === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.category === selectedCategory);

  // Get upcoming events (next 30 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const toggleFavorite = (eventId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(eventId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const toggleReminder = (eventId) => {
    const newReminders = new Set(reminders);
    if (newReminders.has(eventId)) {
      newReminders.delete(eventId);
      toast.success('Reminder removed');
    } else {
      newReminders.add(eventId);
      toast.success('Reminder set');
    }
    setReminders(newReminders);
  };

  const EventCard = ({ event, compact = false }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-lg'}`}>
              {event.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              eventCategories.find(cat => cat.value === event.category)?.color || 'bg-gray-100 text-gray-800'
            }`}>
              {event.type}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
          <p className="text-gray-700 text-sm mb-3">{event.description}</p>
          
          {!compact && (
            <>
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">Significance:</h4>
                <p className="text-sm text-gray-700">{event.significance}</p>
              </div>
              
              {event.traditions && (
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-1">Traditions:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {event.traditions.map((tradition, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                        {tradition}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(event.id)}
            className={`p-2 rounded-lg transition-colors ${
              favorites.has(event.id)
                ? 'text-red-600 bg-red-50'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title={favorites.has(event.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 ${favorites.has(event.id) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => toggleReminder(event.id)}
            className={`p-2 rounded-lg transition-colors ${
              reminders.has(event.id)
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title={reminders.has(event.id) ? 'Remove reminder' : 'Set reminder'}
          >
            <Bell className={`h-4 w-4 ${reminders.has(event.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${event.title} - ${event.date}\n${event.description}`);
              toast.success('Event details copied to clipboard');
            }}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Share event"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Ethiopian Cultural Calendar</h1>
                  <p className="text-gray-600 mt-1">Discover Ethiopian holidays, festivals, and cultural events</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'month' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Month View
                </button>
                <button
                  onClick={() => setViewMode('upcoming')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'upcoming' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  List View
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Events</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-1">{allEvents.length}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Upcoming</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">{getUpcomingEvents().length}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-gray-600">Favorites</span>
                </div>
                <p className="text-2xl font-bold text-red-600 mt-1">{favorites.size}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Reminders</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{reminders.size}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {eventCategories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : `${category.color} hover:opacity-80`
                  }`}
                >
                  {category.label}
                  {category.value !== 'all' && (
                    <span className="ml-2 text-sm">
                      ({culturalEvents[category.value]?.length || 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Ethiopian Calendar Info */}
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-green-50 rounded-lg p-6 border border-yellow-200">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Ethiopian Calendar Information
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-green-700 mb-2">
                  The Ethiopian calendar has 13 months: 12 months of 30 days each, plus a 13th month (Pagumen) with 5 or 6 days.
                </p>
                <p className="text-green-700">
                  The Ethiopian year is about 7-8 years behind the Gregorian calendar.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">Ethiopian Months:</h4>
                <div className="grid grid-cols-2 gap-1 text-sm text-green-700">
                  {ethiopianMonths.slice(0, 6).map((month, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{month.name}</span>
                      <span>{month.gregorianStart}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === 'upcoming' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Events (Next 30 Days)</h2>
              <div className="grid gap-6">
                {getUpcomingEvents().length > 0 ? (
                  getUpcomingEvents().map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                    <p className="text-gray-600">Check back later for upcoming cultural events and holidays.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                All Events 
                {selectedCategory !== 'all' && (
                  <span className="text-blue-600 ml-2">
                    ({eventCategories.find(cat => cat.value === selectedCategory)?.label})
                  </span>
                )}
              </h2>
              <div className="grid gap-6">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {viewMode === 'month' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Calendar view coming soon!
                  </h2>
                  <p className="text-gray-600 mt-2">
                    For now, use the List View or Upcoming Events to explore Ethiopian cultural events.
                  </p>
                </div>
                
                {/* Quick preview of upcoming events */}
                <div className="grid grid-cols-2 gap-4">
                  {getUpcomingEvents().slice(0, 4).map(event => (
                    <EventCard key={event.id} event={event} compact={true} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CulturalCalendar;
