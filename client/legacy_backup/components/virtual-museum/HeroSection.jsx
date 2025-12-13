import { useState, useEffect } from "react";
import { Search, MapPin, Clock, Users, Star } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function HeroSection({ onSearch, totalArtifacts }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=800&fit=crop",
    "https://images.unsplash.com/photo-1594736797933-d0a501ba2fe6?w=1920&h=800&fit=crop",
    "https://images.unsplash.com/photo-1551854053-6632dca83b78?w=1920&h=800&fit=crop"
  ];
  
  const stats = [
    { label: "Ancient Artifacts", value: "2,847", icon: Star },
    { label: "Cultural Periods", value: "15", icon: Clock },
    { label: "Ethiopian Regions", value: "11", icon: MapPin },
    { label: "Visitors Today", value: "1,263", icon: Users },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  
  const handleSearch = () => {
    onSearch(searchQuery);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Ethiopian Heritage ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-stone-900/20" />
          </div>
        ))}
      </div>
      
      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full bg-repeat"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
        {/* Main Heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/30 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-100 text-sm font-medium">Virtual Museum Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-100 bg-clip-text text-transparent">
              EthioHeritage
            </span>
            <br />
            <span className="text-white">360°</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover the rich tapestry of Ethiopian civilization through our immersive digital collection of ancient artifacts, cultural treasures, and historical masterpieces.
          </p>
        </div>
        
        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5 z-10" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search artifacts by name, culture, period, or region..."
                className="pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-stone-300 focus:border-emerald-400 focus:ring-emerald-400/30 rounded-xl"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
              >
                Explore
              </Button>
            </div>
          </div>
          
          {/* Popular Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <span className="text-stone-300 text-sm mr-2">Popular:</span>
            {["Aksumite", "Orthodox", "Royal Regalia", "Manuscripts", "Ceremonial"].map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer transition-all"
                onClick={() => {
                  setSearchQuery(tag);
                  onSearch(tag);
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="flex items-center justify-center mb-3">
                <stat.icon className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-stone-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/70">
          <span className="text-sm mb-2">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
      
      {/* Image Navigation Dots */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-emerald-400 w-8'
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
