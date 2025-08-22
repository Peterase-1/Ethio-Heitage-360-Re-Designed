import React from 'react';
import { Calendar, MapPin, Eye, Heart, Share2 } from 'lucide-react';

const FeedItem = ({ item }) => {
  const renderContent = () => {
    switch (item.type) {
      case 'artifact':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{item.origin}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{item.period}</span>
            </div>
          </div>
        );
      case 'tour':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{item.date}</span>
            </div>
          </div>
        );
      case 'news':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{item.date}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center'}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-amber-600 text-white text-xs font-medium rounded-full capitalize">
            {item.type}
          </span>
        </div>
      </div>
      {renderContent()}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          <span className="flex items-center"><Eye className="h-3 w-3 mr-1" /> {item.views || 0}</span>
          <span className="flex items-center"><Heart className="h-3 w-3 mr-1" /> {item.likes || 0}</span>
        </div>
        <button className="flex items-center space-x-1 hover:text-gray-700">
          <Share2 className="h-3 w-3" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default FeedItem;