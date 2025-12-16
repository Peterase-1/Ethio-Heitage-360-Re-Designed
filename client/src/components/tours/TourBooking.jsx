import React, { useState } from 'react';
import { Calendar, Users, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const TourBooking = ({ tour, onBookingConfirm, onBookingCancel }) => {
  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    numberOfPeople: 1,
    notes: ""
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!bookingDetails.date || !bookingDetails.numberOfPeople) {
      setError("Please fill in all required fields.");
      return;
    }
    if (bookingDetails.numberOfPeople <= 0) {
      setError("Number of people must be at least 1.");
      return;
    }

    // Simulate booking API call
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        setIsConfirmed(true);
        onBookingConfirm && onBookingConfirm({ ...tour, bookingDetails });
      } else {
        setError("Booking failed. Please try again.");
        onBookingCancel && onBookingCancel();
      }
    }, 1000);
  };

  if (isConfirmed) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-md text-center border border-border">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-card-foreground mb-2">Booking Confirmed!</h3>
        <p className="text-muted-foreground mb-4">Your tour to <strong>{tour.title}</strong> on <strong>{bookingDetails.date}</strong> for <strong>{bookingDetails.numberOfPeople} people</strong> has been successfully booked.</p>
        <button
          onClick={() => setIsConfirmed(false)} // Or navigate away
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
      <h2 className="text-2xl font-bold text-card-foreground mb-4">Book Tour: {tour.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-muted-foreground mb-1">Preferred Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={bookingDetails.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="numberOfPeople" className="block text-sm font-medium text-muted-foreground mb-1">Number of People</label>
          <input
            type="number"
            id="numberOfPeople"
            name="numberOfPeople"
            value={bookingDetails.numberOfPeople}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-muted-foreground mb-1">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={bookingDetails.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-primary focus:border-primary"
          ></textarea>
        </div>

        {error && (
          <div className="flex items-center text-destructive text-sm">
            <XCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onBookingCancel}
            className="px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Confirm Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourBooking;