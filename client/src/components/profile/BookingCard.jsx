import React from 'react';
import { Calendar, MapPin, Users, DollarSign, CheckCircle, Clock } from 'lucide-react';

export default function BookingCard({ booking, tourTitle }) {
  const statusColor = {
    confirmed: 'text-green-700 bg-green-50 border-green-200',
    pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    completed: 'text-blue-700 bg-blue-50 border-blue-200',
    cancelled: 'text-red-700 bg-red-50 border-red-200',
  }[booking.status] || 'text-gray-700 bg-gray-50 border-gray-200';

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-gray-900">{tourTitle || 'Tour'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(booking.tourDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>${booking.totalAmount}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{booking.location || 'Ethiopia'}</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${statusColor}`}>
          <div className="flex items-center gap-1">
            {booking.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5" />}
            {booking.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
            <span className="capitalize">{booking.status}</span>
          </div>
        </div>
      </div>

      {booking.specialRequests && (
        <div className="mt-4 pt-3 border-t text-sm text-gray-600">
          <span className="font-medium">Special Requests: </span>
          {booking.specialRequests}
        </div>
      )}
    </div>
  );
}
