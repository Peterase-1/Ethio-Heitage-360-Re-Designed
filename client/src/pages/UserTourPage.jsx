import { useState, useEffect } from "react";
import { 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Search, 
  Filter,
  Star,
  MessageSquare,
  Calendar,
  Heart,
  Share2,
  ArrowLeft
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { useDashboard } from "../context/DashboardContext";
import { toast } from "sonner";

function BookingModal({ tour, isOpen, onClose }) {
  const { createBookingFromUser } = useDashboard();
  const [bookingData, setBookingData] = useState({
    guests: 1,
    date: '',
    customerName: '',
    customerEmail: '',
    phone: '',
    specialRequests: ''
  });

  const handleBooking = () => {
    if (!bookingData.customerName || !bookingData.customerEmail || !bookingData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    const totalAmount = tour.price * bookingData.guests;

    createBookingFromUser({
      tourPackageId: tour.id,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      guests: bookingData.guests,
      tourDate: bookingData.date,
      status: 'pending',
      totalAmount,
      specialRequests: bookingData.specialRequests || undefined
    });

    toast.success(`Booking request sent for ${tour.title}!`);
    onClose();
    setBookingData({
      guests: 1,
      date: '',
      customerName: '',
      customerEmail: '',
      phone: '',
      specialRequests: ''
    });
  };

  const totalAmount = tour.price * bookingData.guests;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Book {tour.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tour Summary */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <img 
              src={tour.images[0]} 
              alt={tour.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{tour.title}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {tour.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {tour.duration}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  ${tour.price} per person
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={bookingData.customerName}
                onChange={(e) => setBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address *</Label>
              <Input
                id="customerEmail"
                type="email"
                value={bookingData.customerEmail}
                onChange={(e) => setBookingData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={bookingData.phone}
                onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date *</Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <Select 
                value={bookingData.guests.toString()} 
                onValueChange={(value) => setBookingData(prev => ({ ...prev, guests: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: tour.maxGuests }, (_, i) => i + 1).map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              value={bookingData.specialRequests}
              onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Any dietary restrictions, accessibility needs, or special requests..."
              rows={3}
            />
          </div>

          {/* Pricing Summary */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Price per person:</span>
              <span className="font-medium">${tour.price}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Number of guests:</span>
              <span className="font-medium">{bookingData.guests}</span>
            </div>
            <div className="border-t border-green-300 pt-2 flex justify-between items-center">
              <span className="font-semibold text-green-800">Total Amount:</span>
              <span className="text-xl font-semibold text-green-800">${totalAmount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleBooking}
              className="bg-primary hover:bg-primary"
            >
              Send Booking Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function MessageModal({ tour, isOpen, onClose }) {
  const { addCustomerMessage } = useDashboard();
  const [messageData, setMessageData] = useState({
    customerName: '',
    customerEmail: '',
    subject: '',
    message: ''
  });

  const handleSendMessage = () => {
    if (!messageData.customerName || !messageData.customerEmail || !messageData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    addCustomerMessage({
      customerName: messageData.customerName,
      customerEmail: messageData.customerEmail,
      subject: messageData.subject || `Inquiry about ${tour.title}`,
      message: messageData.message,
      status: 'unread'
    });

    toast.success("Message sent to tour organizer!");
    onClose();
    setMessageData({
      customerName: '',
      customerEmail: '',
      subject: '',
      message: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Contact Tour Organizer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tour Reference */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Regarding:</p>
            <p className="font-medium text-gray-800">{tour.title}</p>
          </div>

          {/* Message Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="msgName">Your Name *</Label>
                <Input
                  id="msgName"
                  value={messageData.customerName}
                  onChange={(e) => setMessageData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="msgEmail">Email Address *</Label>
                <Input
                  id="msgEmail"
                  type="email"
                  value={messageData.customerEmail}
                  onChange={(e) => setMessageData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="msgSubject">Subject</Label>
              <Input
                id="msgSubject"
                value={messageData.subject}
                onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Question about itinerary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msgMessage">Message *</Label>
              <Textarea
                id="msgMessage"
                value={messageData.message}
                onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Write your message here..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary"
            >
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UserTourPage() {
  const { loadPublicTours } = useDashboard();
  const [tourPackages, setTourPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTour, setSelectedTour] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Load public tours on mount
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const tours = await loadPublicTours();
        setTourPackages(tours || []);
      } catch (error) {
        console.error('Failed to load tours:', error);
        setTourPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [loadPublicTours]);

  // Filter tours
  const filteredTours = tourPackages
    .filter(tour => tour.status === 'active')
    .filter(tour => {
      const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tour.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tour.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = regionFilter === "all" || tour.region.toLowerCase() === regionFilter.toLowerCase();
      const matchesCategory = categoryFilter === "all" || tour.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === "all" || tour.difficulty === difficultyFilter;
      
      return matchesSearch && matchesRegion && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'duration':
          return a.duration.localeCompare(b.duration);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleBookTour = (tour) => {
    setSelectedTour(tour);
    setShowBookingModal(true);
  };

  const handleMessageOrganizer = (tour) => {
    setSelectedTour(tour);
    setShowMessageModal(true);
  };

  const handleShare = (tour) => {
    if (navigator.share) {
      navigator.share({
        title: tour.title,
        text: tour.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Tour link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Discover Ethiopian Heritage Tours</h1>
            <p className="text-xl text-green-100 mb-8">
              Explore ancient cultures, breathtaking landscapes, and unforgettable experiences
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search tours, destinations, or activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white text-gray-800 border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Filter Tours</h2>
              <p className="text-gray-600">{filteredTours.length} tours available</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="amhara">Amhara</SelectItem>
                  <SelectItem value="afar">Afar</SelectItem>
                  <SelectItem value="snnpr">SNNPR</SelectItem>
                  <SelectItem value="oromia">Oromia</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Religious & Historical">Religious & Historical</SelectItem>
                  <SelectItem value="Adventure & Nature">Adventure & Nature</SelectItem>
                  <SelectItem value="Cultural & Tribal">Cultural & Tribal</SelectItem>
                  <SelectItem value="Wildlife & Safari">Wildlife & Safari</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeInUp">
          {filteredTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="relative">
                <img
                  src={tour.images[0] || "https://images.unsplash.com/photo-1571419654798-3d7d9c8a5e9e?w=400&h=300&fit=crop"}
                  alt={tour.title}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-white/90 text-gray-800"
                  >
                    {tour.difficulty}
                  </Badge>
                  <Badge 
                    variant="default" 
                    className="bg-primary text-white"
                  >
                    {tour.category}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                  onClick={() => handleShare(tour)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{tour.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{tour.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{tour.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{tour.duration}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Max {tour.maxGuests} guests</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">{tour.price}</span>
                      <span className="text-gray-600">/person</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">4.9 (24)</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessageOrganizer(tour)}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      onClick={() => handleBookTour(tour)}
                      className="flex-1 bg-primary hover:bg-primary text-white"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && (
          <Card className="text-center p-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No tours found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse our featured tours
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setRegionFilter("all");
                setCategoryFilter("all");
                setDifficultyFilter("all");
              }}
              className="bg-primary hover:bg-primary"
            >
              View All Tours
            </Button>
          </Card>
        )}
      </div>

      {/* Booking Modal */}
      {selectedTour && (
        <BookingModal
          tour={selectedTour}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedTour(null);
          }}
        />
      )}

      {/* Message Modal */}
      {selectedTour && (
        <MessageModal
          tour={selectedTour}
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedTour(null);
          }}
        />
      )}
    </div>
  );
}