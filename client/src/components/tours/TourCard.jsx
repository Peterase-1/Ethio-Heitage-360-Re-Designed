import React from 'react';
import { MapPin, Calendar, Users, DollarSign, ArrowRight } from 'lucide-react';

const TourCard = ({ tour, onViewDetails, onBookTour }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
      <img
        src={tour.image || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=250&fit=crop&crop=center'}
        alt={tour.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tour.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tour.description}</p>
        <div className="space-y-1 text-gray-700 text-sm mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-amber-600" />
            <span>{tour.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-amber-600" />
            <span>{tour.date}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-amber-600" />
            <span>Max People: {tour.maxPeople}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-amber-600" />
            <span>Price: ${tour.price}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={() => onViewDetails(tour)}
            className="flex items-center text-amber-600 hover:text-amber-700 font-medium"
          >
            View Details <ArrowRight className="h-4 w-4 ml-1" />
          </button>
          <button
            onClick={() => onBookTour(tour)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;