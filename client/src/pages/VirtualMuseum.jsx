import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Eye, Heart, Share2, Box, Calendar, Clock, Users, Star, Play, ArrowRight, Lock } from 'lucide-react';
import ArtifactCard from '../components/virtual-museum/ArtifactCard';
import FilterPanel from '../components/virtual-museum/FilterPanel';
import ARVRViewer from '../components/virtual-museum/SimpleARVRViewer';
import ArtifactDetailModal from '../components/virtual-museum/ArtifactDetailModal';
import { useAuth } from '../hooks/useAuth';

const VirtualMuseum = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [artifacts, setArtifacts] = useState([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [showARVR, setShowARVR] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    period: '',
    origin: '',
    museum: '',
    has3D: false
  });

  // Comprehensive Ethiopian Heritage Artifact Collection
  const mockArtifacts = [
    {
      id: 1,
      name: 'Ancient Ethiopian Orthodox Cross',
      description: 'A beautifully crafted ancient Ethiopian Orthodox cross made of silver and gold, dating back to the 14th century. Features intricate Ge\'ez inscriptions and traditional Ethiopian religious motifs representing the deep Christian heritage of Ethiopia.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Ancient Ethiopian Orthodox Cross - 14th Century Religious Artifact',
      category: 'Religious Artifacts',
      period: '14th Century',
      origin: 'Lalibela, Ethiopia',
      museum: 'National Museum of Ethiopia',
      has3DModel: true,
      views: 1250,
      likes: 89,
      rating: 4.8,
      isFavorited: false,
      material: 'Silver, Gold, Copper',
      dimensions: '25cm x 18cm',
      weight: '450g',
      condition: 'Excellent',
      significance: 'Used in religious ceremonies and represents Ethiopian Orthodox faith'
    },
    {
      id: 2,
      name: 'Traditional Coffee Ceremony Set',
      description: 'Complete traditional Ethiopian coffee ceremony set including the iconic jebena (clay coffee pot), cups, roasting pan, and incense burner. Central to Ethiopian hospitality and social culture, the coffee ceremony is a sacred ritual in Ethiopian culture.',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Traditional Ethiopian Coffee Ceremony Set - Cultural Heritage',
      category: 'Cultural Heritage',
      period: 'Traditional (19th Century)',
      origin: 'Kaffa Region, Ethiopia',
      museum: 'Ethnological Museum',
      has3DModel: true,
      views: 980,
      likes: 67,
      rating: 4.6,
      isFavorited: true,
      material: 'Clay, Wood, Natural Fibers',
      dimensions: 'Jebena: 30cm height',
      weight: '2.1kg (complete set)',
      condition: 'Very Good',
      significance: 'Ethiopia is the birthplace of coffee, ceremony represents hospitality'
    },
    {
      id: 3,
      name: 'Emperor Haile Selassie Imperial Crown',
      description: 'Ornate ceremonial crown worn by Emperor Haile Selassie I, the last emperor of Ethiopia. Adorned with precious gems, pearls, and intricate Ethiopian imperial designs featuring the Lion of Judah. Symbol of Ethiopian sovereignty and independence.',
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Emperor Haile Selassie Imperial Crown - Last Crown of Ethiopia',
      category: 'Royal Heritage',
      period: '20th Century (1930-1974)',
      origin: 'Addis Ababa, Ethiopia',
      museum: 'Imperial Palace Museum',
      has3DModel: true,
      views: 2100,
      likes: 156,
      rating: 4.9,
      isFavorited: false,
      material: 'Gold, Diamonds, Emeralds, Pearls',
      dimensions: '28cm diameter, 20cm height',
      weight: '1.8kg',
      condition: 'Pristine',
      significance: 'Last imperial crown of Ethiopia, symbol of independence from colonialism'
    },
    {
      id: 4,
      name: 'Aksum Obelisk Miniature',
      description: 'Scale replica of the famous Aksum Obelisks, ancient monuments from the Kingdom of Aksum. These granite stelae are among the tallest single pieces of stone ever quarried by humans, representing the ancient Kingdom of Aksum.',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Aksum Obelisk Miniature - Ancient Kingdom Monument',
      category: 'Archaeological',
      period: '4th Century AD',
      origin: 'Aksum, Tigray Region',
      museum: 'Aksum Archaeological Museum',
      has3DModel: true,
      views: 834,
      likes: 72,
      rating: 4.7,
      isFavorited: true,
      material: 'Granite Stone',
      dimensions: '45cm height (1:50 scale)',
      weight: '12kg',
      condition: 'Excellent',
      significance: 'Represents the ancient Kingdom of Aksum, UNESCO World Heritage site'
    },
    {
      id: 5,
      name: 'Queen of Sheba Jewelry Collection',
      description: 'Replica jewelry collection inspired by the legendary Queen of Sheba. Features traditional Ethiopian designs with gold filigree work and precious stones, representing the legendary Queen of Sheba\'s connection to Ethiopia.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Queen of Sheba Jewelry Collection - Legendary Royal Artifacts',
      category: 'Royal Jewelry',
      period: '10th Century BC (Replica)',
      origin: 'Tigray Region',
      museum: 'Sheba Heritage Museum',
      has3DModel: true,
      views: 756,
      likes: 45,
      rating: 4.9,
      isFavorited: false,
      material: 'Gold, Silver, Amber, Coral',
      dimensions: 'Various pieces',
      weight: '850g (complete set)',
      condition: 'Mint',
      significance: 'Represents the legendary Queen of Sheba\'s connection to Ethiopia'
    },
    {
      id: 6,
      name: 'Ancient Ge\'ez Manuscript',
      description: 'A rare manuscript written in ancient Ge\'ez script, containing religious hymns and biblical texts from the 13th century. Features beautiful illuminated letters and represents Ethiopia\'s ancient literary tradition.',
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Ancient Ge\'ez Manuscript - 13th Century Religious Text',
      category: 'Manuscripts',
      period: '13th Century',
      origin: 'Gondar',
      museum: 'Institute of Ethiopian Studies',
      has3DModel: false,
      views: 1156,
      likes: 78,
      rating: 4.8,
      isFavorited: true,
      material: 'Vellum, Natural Pigments',
      dimensions: '35cm x 25cm',
      weight: '1.2kg',
      condition: 'Good',
      significance: 'Represents ancient Ethiopian literary and religious traditions'
    },
    {
      id: 7,
      name: 'Lucy Australopithecus Fossil Replica',
      description: 'Detailed replica of Lucy (Australopithecus afarensis), one of the most complete early human ancestor fossils ever discovered, found in the Afar region of Ethiopia in 1974. A cornerstone of human evolutionary history.',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Lucy Fossil Replica - Human Evolution Milestone',
      category: 'Fossil Artifacts',
      period: '3.2 Million Years Ago',
      origin: 'Hadar, Ethiopia',
      museum: 'National Museum of Ethiopia',
      has3DModel: true,
      views: 3200,
      likes: 245,
      rating: 4.9,
      isFavorited: false,
      material: 'Fossilized Bone',
      dimensions: '105cm height (40% complete)',
      weight: 'Original: ~29kg',
      condition: 'Museum Quality Replica',
      significance: 'One of the most important human ancestor discoveries, found in Ethiopia'
    },
    {
      id: 8,
      name: 'Traditional Ethiopian Weaving Loom',
      description: 'Complete traditional Ethiopian weaving loom and tools used to create the famous shamma (traditional cotton garments) and other textiles. Showcases ancient craftsmanship and textile traditions.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Traditional Ethiopian Weaving Loom - Ancient Textile Craft',
      category: 'Tools & Crafts',
      period: 'Traditional',
      origin: 'Dorze',
      museum: 'Ethiopian Craft Museum',
      has3DModel: false,
      views: 567,
      likes: 38,
      rating: 4.4,
      isFavorited: false,
      material: 'Wood, Cotton, Natural Fibers',
      dimensions: '180cm x 120cm x 60cm',
      weight: '25kg',
      condition: 'Good',
      significance: 'Represents traditional Ethiopian textile craftsmanship'
    },
    {
      id: 9,
      name: 'Emperor Tewodros II Ceremonial Sword',
      description: 'Ornate ceremonial sword belonging to Emperor Tewodros II, featuring intricate engravings, royal insignia, and the Lion of Judah emblem. Symbol of Ethiopian imperial power and resistance against colonial forces.',
      image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Emperor Tewodros II Ceremonial Sword - Imperial Weapon',
      category: 'Royal Artifacts',
      period: '19th Century (1855-1868)',
      origin: 'Magdala',
      museum: 'Imperial Palace Museum',
      has3DModel: true,
      views: 1450,
      likes: 98,
      rating: 4.7,
      isFavorited: true,
      material: 'Steel, Silver, Gold Inlay',
      dimensions: '95cm length',
      weight: '1.3kg',
      condition: 'Excellent',
      significance: 'Symbol of Ethiopian resistance and imperial authority'
    },
    {
      id: 10,
      name: 'Lalibela Church Stone Carving',
      description: 'Intricate stone carving from one of the famous rock-hewn churches of Lalibela. Features traditional Ethiopian Christian motifs and architectural elements representing the New Jerusalem.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center',
      imageTitle: 'Lalibela Church Stone Carving - Rock-Hewn Architecture',
      category: 'Architectural',
      period: '12th-13th Century',
      origin: 'Lalibela',
      museum: 'Lalibela Heritage Site',
      has3DModel: true,
      views: 2890,
      likes: 187,
      rating: 4.8,
      isFavorited: false,
      material: 'Volcanic Rock (Basalt)',
      dimensions: '120cm x 80cm x 15cm',
      weight: '450kg',
      condition: 'Good',
      significance: 'Part of UNESCO World Heritage rock-hewn churches'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArtifacts(mockArtifacts);
      setFilteredArtifacts(mockArtifacts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = artifacts.filter(artifact => {
      const matchesSearch = artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artifact.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filters.category || artifact.category === filters.category;
      const matchesPeriod = !filters.period || artifact.period === filters.period;
      const matchesOrigin = !filters.origin || artifact.origin === filters.origin;
      const matchesMuseum = !filters.museum || artifact.museum === filters.museum;
      const matches3D = !filters.has3D || artifact.has3DModel;

      return matchesSearch && matchesCategory && matchesPeriod && matchesOrigin && matchesMuseum && matches3D;
    });

    setFilteredArtifacts(filtered);
  }, [searchTerm, filters, artifacts]);

  const handleArtifactView = (artifact) => {
    setSelectedArtifact(artifact);
    if (artifact.has3DModel) {
      setShowARVR(true);
    } else {
      setShowDetailModal(true);
    }
  };

  const handleFavorite = (artifactId, isFavorited) => {
    setArtifacts(prev => prev.map(artifact => 
      artifact.id === artifactId ? { ...artifact, isFavorited } : artifact
    ));
  };

  const handleShare = (artifact) => {
    if (navigator.share) {
      navigator.share({
        title: artifact.name,
        text: artifact.description,
        url: window.location.href + '/' + artifact.id
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href + '/' + artifact.id);
      alert('Link copied to clipboard!');
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      period: '',
      origin: '',
      museum: '',
      has3D: false
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading virtual museum...</p>
        </div>
      </div>
    );
  }

  // Virtual Tours Data
  const virtualTours = [
    {
      id: 1,
      title: "Ancient Ethiopia: Aksum to Lalibela",
      description: "Journey through 3000 years of Ethiopian civilization",
      duration: "45 minutes",
      price: 15,
      maxParticipants: 20,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d4d795?w=300&h=200&fit=crop&crop=center',
      features: ['3D Artifacts', 'Expert Guide', 'Interactive Q&A']
    },
    {
      id: 2,
      title: "Royal Treasures of Ethiopia",
      description: "Explore the imperial collections and royal regalia",
      duration: "30 minutes", 
      price: 20,
      maxParticipants: 15,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center',
      features: ['3D Crown Viewing', 'Historical Context', 'Royal Stories']
    }
  ];

  const handleBookTour = (tour) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/virtual-museum');
      navigate('/auth');
      return;
    }
    setSelectedTour(tour);
    setShowBookingModal(true);
  };

  // Booking Modal Component
  const BookingModal = ({ tour, isOpen, onClose }) => {
    const [bookingData, setBookingData] = useState({
      date: '',
      time: '',
      participants: 1,
      email: user?.email || '',
      phone: '',
      specialRequests: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Process booking
      alert(`Booking confirmed for ${tour.title}!\nDate: ${bookingData.date}\nTime: ${bookingData.time}\nParticipants: ${bookingData.participants}`);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book Virtual Tour</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">{tour.title}</h3>
              <p className="text-gray-600">{tour.description}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {tour.duration} • ${tour.price} per person
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    required
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
                <input
                  type="number"
                  min="1"
                  max={tour.maxParticipants}
                  required
                  value={bookingData.participants}
                  onChange={(e) => setBookingData({...bookingData, participants: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${(tour.price * bookingData.participants).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Featured 3D Artifacts Hero Section */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-current rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-current rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-current rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center bg-primary-foreground/10 text-primary-foreground rounded-full px-4 py-2 mb-6">
              <Eye className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Immersive Heritage Experience</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              <span className="block mb-2">Virtual Museum</span>
              <span className="block bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">Experience</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-4xl mx-auto leading-relaxed">
              Explore Ethiopia's heritage in stunning 3D detail with virtual and augmented reality support. 
              Walk through ancient temples and examine artifacts up close.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
              <div className="flex items-center bg-primary-foreground/20 backdrop-blur-sm px-6 py-3 rounded-full border border-primary-foreground/30">
                <Box className="w-5 h-5 mr-2" />
                Interactive 3D Models
              </div>
              <div className="flex items-center bg-primary-foreground/20 backdrop-blur-sm px-6 py-3 rounded-full border border-primary-foreground/30">
                <Users className="w-5 h-5 mr-2" />
                Live Virtual Tours
              </div>
              <div className="flex items-center bg-primary-foreground/20 backdrop-blur-sm px-6 py-3 rounded-full border border-primary-foreground/30">
                <Calendar className="w-5 h-5 mr-2" />
                Book Guided Tours
              </div>
            </div>
          </div>

          {/* Featured 3D Artifacts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {artifacts.filter(artifact => artifact.has3DModel).slice(0, 3).map(artifact => (
              <div key={artifact.id} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 group">
                <div className="relative">
                  <img
                    src={artifact.image}
                    alt={artifact.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Box className="w-4 h-4 mr-1" />
                      3D View
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleArtifactView(artifact)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Explore in 3D
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{artifact.name}</h3>
                  <p className="text-white/80 mb-4 line-clamp-2">{artifact.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">{artifact.origin}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-white/80">{artifact.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Search Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Discover Ethiopian Heritage
          </h2>
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search artifacts, museums, or cultural events..."
              className="w-full pl-16 pr-32 py-6 rounded-2xl text-lg bg-card border border-border focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-lg"
            />
            <button className="absolute right-3 top-3 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Search
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
                showFilters 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-card border border-border hover:bg-muted text-muted-foreground'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
            
            <div className="flex border border-border rounded-full overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-64">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
                artifacts={artifacts}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {filteredArtifacts.length} of {artifacts.length} artifacts
              </p>
              
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <button
                  onClick={clearFilters}
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Artifacts Grid/List */}
            {filteredArtifacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artifacts found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
              }>
                {filteredArtifacts.map(artifact => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    onView={handleArtifactView}
                    onFavorite={handleFavorite}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AR/VR Viewer Modal */}
      {showARVR && selectedArtifact && (
        <ARVRViewer
          artifact={selectedArtifact}
          onClose={() => {
            setShowARVR(false);
            setSelectedArtifact(null);
          }}
        />
      )}

      {/* Artifact Detail Modal */}
      {showDetailModal && selectedArtifact && (
        <ArtifactDetailModal
          artifact={selectedArtifact}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedArtifact(null);
          }}
          onFavorite={handleFavorite}
          onShare={handleShare}
        />
      )}

      {/* Booking Modal */}
      <BookingModal
        tour={selectedTour}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedTour(null);
        }}
      />
    </div>
  );
};

export default VirtualMuseum;
