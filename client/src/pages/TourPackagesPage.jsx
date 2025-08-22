import { useState } from "react"; 
import { Plus, Edit, Trash2, Eye, MapPin, Users, Clock, DollarSign, Search, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useDashboard } from "../../context/DashboardContext";
import { toast } from "sonner";

export function TourPackagesPage() {
  const { tourPackages, setShowCreateTourModal, deleteTourPackage } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  
  const filteredPackages = tourPackages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pkg.status === statusFilter;
    const matchesRegion = regionFilter === "all" || pkg.region.toLowerCase() === regionFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesRegion;
  });
  
  const handleDelete = (tourId) => {
    try {
      deleteTourPackage(tourId);
      toast.success("Tour package deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tour package");
    }
  };
  
  const handleEdit = (tourId) => {
    toast.info(`Edit functionality for tour ${tourId} would open here`);
  };
  
  const handleView = (tourId) => {
    toast.info(`Detailed view for tour ${tourId} would open here`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tour Packages</h1>
          <p className="text-gray-600">Manage your tour offerings</p>
        </div>
        <Button 
          onClick={() => setShowCreateTourModal(true)}
          className="h-12 bg-primary hover:bg-primary text-white shadow-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Tour
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="bg-white rounded-lg shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-gray-800">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-gray-300 focus:ring-green-500 focus:border-green-500">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="border-gray-300 focus:ring-green-500 focus:border-green-500">
                <SelectValue placeholder="Filter by region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="amhara">Amhara</SelectItem>
                <SelectItem value="afar">Afar</SelectItem>
                <SelectItem value="snnpr">SNNPR</SelectItem>
                <SelectItem value="oromia">Oromia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Tour Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((tour) => (
          <Card 
            key={tour.id} 
            className="hover:shadow-md transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Image Preview */}
            {tour.images && tour.images.length > 0 ? (
              <img
                src={tour.images[0]}
                alt={tour.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                No image
              </div>
            )}

            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-800 mb-2">
                    {tour.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      className={`${
                        tour.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : tour.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      } px-2 py-1 rounded-full text-xs`}
                    >
                      {tour.status.charAt(0).toUpperCase() + tour.status.slice(1)}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {tour.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {tour.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{tour.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{tour.duration}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>Max {tour.maxGuests} guests</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span>${tour.price} per person</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(tour.id)}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(tour.id)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-gray-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border border-gray-200 rounded-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-800">Delete Tour Package</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-600">
                        Are you sure you want to delete "{tour.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(tour.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredPackages.length === 0 && (
        <Card className="text-center p-8 bg-white border border-gray-200 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No tour packages found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" || regionFilter !== "all" 
              ? "Try adjusting your filters"
              : "Create your first tour package to get started"
            }
          </p>
          {!searchTerm && statusFilter === "all" && regionFilter === "all" && (
            <Button 
              onClick={() => setShowCreateTourModal(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Tour
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}