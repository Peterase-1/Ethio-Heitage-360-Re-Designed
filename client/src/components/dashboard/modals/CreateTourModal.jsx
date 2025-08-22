import { useState, useEffect } from "react";
import { X, MapPin, Clock, Users, DollarSign, Upload, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { useDashboard } from "../../../context/DashboardContext";
import tourService from "../../../services/tourService";
import tourWebSocket from "../../../services/tourWebSocket";
import { toast } from "sonner";

export function CreateTourModal() {
  const { showCreateTourModal, setShowCreateTourModal, createTourPackage } = useDashboard();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    region: '',
    duration: '',
    price: '',
    maxGuests: '',
    difficulty: '',
    category: '',
    images: [''],
    imageUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize WebSocket connection when modal opens
  useEffect(() => {
    if (showCreateTourModal) {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token && !tourWebSocket.isConnected()) {
        tourWebSocket.connect(token);
      }
    }
  }, [showCreateTourModal]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const tourData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        region: formData.region,
        duration: formData.duration,
        price: parseFloat(formData.price) || 0,
        maxGuests: parseInt(formData.maxGuests) || 10,
        difficulty: formData.difficulty,
        category: formData.category,
        images: formData.imageUrl ? [formData.imageUrl] : formData.images.filter(img => img),
        imageUrl: formData.imageUrl,
        status: 'published', // Set to published so it appears on live tours page immediately
        type: formData.category?.toLowerCase()?.includes('cultural') ? 'cultural' :
              formData.category?.toLowerCase()?.includes('historical') ? 'historical' :
              formData.category?.toLowerCase()?.includes('archaeological') ? 'archaeological' :
              formData.category?.toLowerCase()?.includes('religious') ? 'religious' :
              formData.category?.toLowerCase()?.includes('adventure') ? 'adventure' : 'cultural',
        groupSize: {
          min: 1,
          max: parseInt(formData.maxGuests) || 10
        },
        pricing: {
          adult: parseFloat(formData.price) || 0,
          currency: 'USD'
        },
        media: {
          images: formData.imageUrl ? [{
            url: formData.imageUrl,
            isPrimary: true
          }] : []
        },
        schedule: [{
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          availableSpots: parseInt(formData.maxGuests) || 10,
          bookedSpots: 0
        }]
      };

      // Use tourService directly to create the tour with correct API endpoint
      const createdTour = await tourService.createTour(tourData);

      // Broadcast the new tour via WebSocket if connected
      if (tourWebSocket.isConnected()) {
        const tourForBroadcast = {
          ...tourData,
          id: createdTour?.id || Date.now().toString(),
          _id: createdTour?._id || Date.now().toString(),
          organizer: createdTour?.organizer || 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalBookings: 0,
          rating: {
            average: 0,
            count: 0
          }
        };
        
        tourWebSocket.notifyTourCreation(tourForBroadcast);
        console.log('Tour creation broadcasted via WebSocket:', tourForBroadcast.title);
      }

      toast.success("Tour package created successfully and is now live!");
      setShowCreateTourModal(false);

      setFormData({
        title: '',
        description: '',
        location: '',
        region: '',
        duration: '',
        price: '',
        maxGuests: '',
        difficulty: '',
        category: '',
        images: [''],
        imageUrl: ''
      });

    } catch (error) {
      console.error('Failed to create tour package:', error);
      toast.error("Failed to create tour package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowCreateTourModal(false);
  };

  return (
    <Dialog open={showCreateTourModal} onOpenChange={setShowCreateTourModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Create New Tour Package
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tour Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter tour title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your tour package..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Lalibela, Amhara"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amhara">Amhara</SelectItem>
                  <SelectItem value="tigray">Tigray</SelectItem>
                  <SelectItem value="oromia">Oromia</SelectItem>
                  <SelectItem value="snnpr">SNNPR</SelectItem>
                  <SelectItem value="afar">Afar</SelectItem>
                  <SelectItem value="somali">Somali</SelectItem>
                  <SelectItem value="benishangul">Benishangul-Gumuz</SelectItem>
                  <SelectItem value="gambela">Gambela</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tour Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration
              </Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 3 days"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGuests" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Max Guests
              </Label>
              <Input
                id="maxGuests"
                type="number"
                value={formData.maxGuests}
                onChange={(e) => handleInputChange('maxGuests', e.target.value)}
                placeholder="10"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price per Person (USD)
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="450"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Religious & Historical">Religious & Historical</SelectItem>
                <SelectItem value="Adventure & Nature">Adventure & Nature</SelectItem>
                <SelectItem value="Cultural & Tribal">Cultural & Tribal</SelectItem>
                <SelectItem value="Wildlife & Safari">Wildlife & Safari</SelectItem>
                <SelectItem value="Archaeological">Archaeological</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Tour Image URL
            </Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
            />
            <p className="text-xs text-gray-600">
              Paste an image URL from Unsplash or other image hosting service
            </p>
            {formData.imageUrl && (
              <div className="mt-2 p-2 border border-gray-200 rounded-lg">
                <img
                  src={formData.imageUrl}
                  alt="Tour preview"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary"
            >
              {isSubmitting ? 'Creating...' : 'Create Tour Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
