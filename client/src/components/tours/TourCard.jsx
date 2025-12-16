import React from 'react';
import { MapPin, Calendar, Users, DollarSign, ArrowRight } from 'lucide-react';

const TourCard = ({ tour, onViewDetails, onBookTour }) => {
  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 border border-border">
      <img
        src={tour.image || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=250&fit=crop&crop=center'}
        alt={tour.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-card-foreground mb-2">{tour.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{tour.description}</p>
        <div className="space-y-1 text-muted-foreground text-sm mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span>{tour.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span>{tour.date}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-primary" />
            <span>Max People: {tour.maxPeople}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span>Price: ${tour.price}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={() => onViewDetails(tour)}
            className="flex items-center text-primary hover:text-primary/80 font-medium"
          >
            View Details <ArrowRight className="h-4 w-4 ml-1" />
          </button>
          <button
            onClick={() => onBookTour(tour)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;