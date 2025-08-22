import React from 'react';
import FeedItem from './FeedItem';

const FeedGrid = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No feed items to display.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default FeedGrid;