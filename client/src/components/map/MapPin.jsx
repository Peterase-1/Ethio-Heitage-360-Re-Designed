import React from 'react';
import { MapPin as MapPinIcon } from 'lucide-react';

const MapPin = ({ location, onClick }) => {
  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer"
      onClick={() => onClick(location)}
    >
      <MapPinIcon className="h-8 w-8 text-red-600 animate-bounce" />
      <div className="absolute -top-6 bg-white text-gray-800 text-xs font-semibold px-2 py-1 rounded-md shadow-md whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300">
        {location.name}
      </div>
    </div>
  );
};

export default MapPin;