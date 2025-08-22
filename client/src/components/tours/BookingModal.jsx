import { useState, useEffect } from 'react';
import { Calendar, Users, DollarSign, CreditCard, X, CheckCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import bookingService from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function BookingModal({ tour, isOpen, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    selectedDate: '',
    numberOfGuests: 1,
    guestDetails: [],
    specialRequests: '',
    email: '',
    phone: '',
    name: '',
    paymentMethod: 'credit-card',
    totalAmount: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form with user data if available
  useEffect(() => {
    if (user && isAuthenticated) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || '',
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
      }));
    }
  }, [user, isAuthenticated]);

  // Calculate total price when tour or guests change
  useEffect(() => {
    if (tour && formData.numberOfGuests) {
      const guests = parseInt(formData.numberOfGuests);
      const basePrice = tour.pricing?.adult || tour.price || 0;
      const total = basePrice * guests;
      
      setFormData(prev => ({
        ...prev,
        totalAmount: total
      }));
    }
  }, [tour, formData.numberOfGuests]);

  // Generate available dates for booking
  useEffect(() => {
    if (tour) {
      const dates = [];
      const today = new Date();
      
      // Use schedule if available
      if (tour.schedule && tour.schedule.length > 0) {
        tour.schedule.forEach(schedule => {
          if (schedule.startDate) {
            const startDate = new Date(schedule.startDate);
            if (startDate >= today) {
              dates.push(startDate.toISOString().split('T')[0]);
            }
          }
        });
      }
      
      // If no dates from schedule, generate next 30 days
      if (dates.length === 0) {
        for (let i = 1; i <= 30; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
      }
      
      setAvailableDates(dates);
      
      // Set default selected date to first available date
      if (dates.length > 0 && !formData.selectedDate) {
        setFormData(prev => ({
          ...prev,
          selectedDate: dates[0]
        }));
      }
    }
  }, [tour]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateStep = (currentStep) => {
    const errors = {};
    
    if (currentStep === 1) {
      if (!formData.selectedDate) {
        errors.selectedDate = 'Please select a date';
      }
      if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
        errors.numberOfGuests = 'Please enter a valid number of guests';
      } else if (tour.groupSize?.max && formData.numberOfGuests > tour.groupSize.max) {
        errors.numberOfGuests = `Maximum ${tour.groupSize.max} guests allowed`;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.name) {
        errors.name = 'Please enter your name';
      }
      if (!formData.email) {
        errors.email = 'Please enter your email';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Please enter a valid email';
      }
      if (!formData.phone) {
        errors.phone = 'Please enter your phone number';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(step)) {
      return;
    }
    
    if (!isAuthenticated) {
      toast.error("Please sign in to book a tour");
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const bookingData = {
        ...formData,
        selectedDate: formData.selectedDate,
        numberOfGuests: parseInt(formData.numberOfGuests),
        totalAmount: formData.totalAmount
      };
      
      const booking = await bookingService.createBooking(tour.id || tour._id, bookingData);
      
      setBookingConfirmation(booking);
      setStep(4); // Move to confirmation step
      
      toast.success('Tour booked successfully!');
      
      if (onSuccess) {
        onSuccess(booking);
      }
    } catch (error) {
      console.error('Failed to book tour:', error);
      toast.error(error.message || 'Failed to book tour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setStep(1);
      setValidationErrors({});
      setBookingConfirmation(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center justify-between">
            <span>
              {step === 4 ? 'Booking Confirmed' : `Book Tour: ${tour?.title || ''}`}
            </span>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 rounded-full"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        {step < 4 && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full border-2 ${
                      step >= stepNumber
                        ? 'border-amber-500 bg-amber-100 text-amber-700'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-10 h-0.5 mx-1 ${
                        step > stepNumber ? 'bg-amber-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Date and Number of Guests */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selectedDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Select Date
                </Label>
                <Select
                  value={formData.selectedDate}
                  onValueChange={(value) => handleInputChange('selectedDate', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a date" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {formatDate(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.selectedDate && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.selectedDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfGuests" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Number of Guests
                </Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  min="1"
                  max={tour?.groupSize?.max || 10}
                  value={formData.numberOfGuests}
                  onChange={(e) => handleInputChange('numberOfGuests', e.target.value)}
                />
                {validationErrors.numberOfGuests && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.numberOfGuests}</p>
                )}
                <p className="text-xs text-gray-500">
                  Maximum {tour?.groupSize?.max || 10} guests per booking
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mt-4">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pricing Information
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Price per person:</span>
                    <span>${tour?.pricing?.adult || tour?.price || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of guests:</span>
                    <span>{formData.numberOfGuests}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-amber-200 mt-2">
                    <span>Total Amount:</span>
                    <span>${formData.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (123) 456-7890"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any dietary requirements, accessibility needs, or other special requests..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Payment Information */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4" />
                  Booking Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tour:</span>
                    <span className="font-medium">{tour?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{formatDate(formData.selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span>{formData.numberOfGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">${formData.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="pay-later">Pay on Arrival</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.paymentMethod === 'credit-card' && (
                <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="**** **** **** ****"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM/YY" disabled={isSubmitting} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="***" disabled={isSubmitting} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    This is a demo. No actual payment will be processed.
                  </p>
                </div>
              )}

              <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-amber-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Secure Payment</p>
                  <p className="text-xs text-amber-700">
                    Your payment information is securely processed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">Booking Confirmed!</h3>
                <p className="text-green-700 text-center">
                  Your tour has been successfully booked.
                </p>
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800">Booking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono">{bookingConfirmation?.id || 'TOUR-' + Date.now().toString().slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tour:</span>
                    <span>{tour?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{formatDate(formData.selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span>{formData.numberOfGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                      {bookingConfirmation?.status || 'Confirmed'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">${formData.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>A confirmation email has been sent to {formData.email}</p>
                <p className="mt-1">
                  You can view your booking details in your{' '}
                  <a href="/dashboard" className="text-amber-600 hover:underline font-medium">
                    Dashboard
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            {step < 4 && step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            
            {step < 3 && (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Next
              </Button>
            )}
            
            {step === 3 && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? 'Processing...' : 'Complete Booking'}
              </Button>
            )}
            
            {step === 4 && (
              <Button
                type="button"
                onClick={handleClose}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Close
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BookingModal;
