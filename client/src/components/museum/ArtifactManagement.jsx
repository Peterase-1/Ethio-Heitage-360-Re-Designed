import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Delete,
  Star,
  Archive,
  Camera,
  Upload,
  Calendar,
  MapPin,
  Tag,
  RefreshCw,
  Sparkles,
  Award,
  Shield,
  Grid3X3,
  List,
  X,
  Trash2,
  Lock,
  MoreVertical
} from 'lucide-react';
import api from '../../utils/api.js';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { toast } from 'sonner';

const ArtifactManagement = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentMuseumId, setCurrentMuseumId] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedArtifactForUpload, setSelectedArtifactForUpload] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artifactToDelete, setArtifactToDelete] = useState(null);

  const [newArtifact, setNewArtifact] = useState({
    name: '',
    category: 'sculptures', // Default to valid enum value
    period: 'ancient', // Default to valid enum value
    material: '',
    origin: '',
    status: 'in_storage',
    condition: 'good',
    description: 'This artifact represents...', // Default description to meet validation
    location: ''
  });

  // Image upload states for create/update forms
  const [formImages, setFormImages] = useState([]);
  const [uploadingFormImages, setUploadingFormImages] = useState(false);

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || artifact.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      'on_display': 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
      'in_storage': 'bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200',
      'under_conservation': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
      'on_loan': 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200'
    };
    return <Badge className={`${styles[status] || styles['in_storage']} border`}>{status.replace('_', ' ')}</Badge>;
  };

  const getConditionBadge = (condition) => {
    const styles = {
      'excellent': 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
      'good': 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
      'fair': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
      'fragile': 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200'
    };
    return <Badge className={`${styles[condition] || styles['good']} border`}>{condition}</Badge>;
  };


  const fetchArtifacts = async () => {
    setLoading(true);
    try {
      // Force fresh data by adding timestamp to prevent caching
      const response = await api.getArtifacts({ _t: Date.now() });

      // Handle the correct response structure: { success: true, data: { artifacts: [...] } }
      const list = response?.data?.artifacts || response?.artifacts || [];
      setArtifacts(list);
    } catch (e) {
      console.error('Failed to load artifacts', e);
      toast.error('Failed to load artifacts: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
    (async () => {
      try {
        // First try to get current user to extract museumId
        const userData = await api.getCurrentUser();
        if (userData?.user?.museumId) {
          setCurrentMuseumId(userData.user.museumId);
        } else {
          // Fallback: try to get museum profile
          const profile = await api.getMuseumProfile();
          const museum = profile?.data?.museum || profile?.data || profile?.museum || profile;
          const id = museum?._id || museum?.id;
          if (id) {
            setCurrentMuseumId(id);
          }
        }
      } catch (e) {
        console.warn('Could not fetch museum information:', e.message);
      }
    })();
  }, []);

  const resetForm = () => {
    setNewArtifact({
      name: '',
      category: 'sculptures',
      period: 'ancient',
      material: '',
      origin: '',
      status: 'in_storage',
      condition: 'good',
      description: 'This artifact represents...',
      location: ''
    });
    setFormImages([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSaveArtifact = async () => {
    if (!newArtifact.name || !newArtifact.category || !newArtifact.description || newArtifact.description.length < 10) {
      toast.error('Please fill required fields: name, category, and description (min 10 characters)');
      return;
    }
    setSaving(true);
    setUploadingFormImages(true);
    try {
      const payload = {
        name: newArtifact.name,
        category: newArtifact.category,
        period: newArtifact.period,
        material: newArtifact.material,
        origin: newArtifact.origin,
        status: newArtifact.status,
        condition: newArtifact.condition,
        description: newArtifact.description,
        location: newArtifact.location,
        ...(currentMuseumId ? { museum: currentMuseumId } : {}),
      };

      let artifactId;
      if (isEditing && editingId) {
        await api.updateArtifact(editingId, payload);
        artifactId = editingId;
      } else {
        const response = await api.createArtifact(payload);
        artifactId = response.data._id || response.data.id;
      }

      // Upload images if any were selected
      if (formImages.length > 0 && artifactId) {
        await api.uploadArtifactImages(artifactId, formImages);
      }

      await fetchArtifacts();
      resetForm();
      setOpenDialog(false);
      toast.success(isEditing ? 'Artifact updated' : 'Artifact created');
    } catch (e) {
      console.error('Save artifact failed', e);
      toast.error(e.message || 'Save failed');
    } finally {
      setSaving(false);
      setUploadingFormImages(false);
    }
  };

  const handleToggleFeatured = async (artifact) => {
    try {
      const id = artifact._id || artifact.id;
      await api.toggleArtifactFeatured(id, !artifact.featured);
      setArtifacts(prev => prev.map(a => ((a._id || a.id) === id ? { ...a, featured: !artifact.featured } : a)));
      toast.success(`Artifact ${!artifact.featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (e) {
      console.error('Toggle featured failed', e);
      toast.error('Failed to update featured status: ' + e.message);
    }
  };

  const handleDeleteArtifact = (artifact) => {
    // Check if artifact is under conservation
    if (artifact.status === 'conservation') {
      toast.warning('Cannot delete artifact under conservation. Please wait for conservation to complete.');
      return;
    }

    setArtifactToDelete(artifact);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteArtifact = async () => {
    if (!artifactToDelete) return;

    try {
      const id = artifactToDelete._id || artifactToDelete.id;

      await api.deleteArtifact(id);
      setArtifacts(prev => prev.filter(a => (a._id || a.id) !== id));
      toast.success('Artifact deleted successfully');
      setDeleteDialogOpen(false);
      setArtifactToDelete(null);
    } catch (e) {
      console.error('Delete artifact failed', e);
      toast.error('Failed to delete artifact: ' + e.message);
    }
  };

  const handleImageUpload = async (artifact) => {
    if (selectedImages.length === 0) {
      toast.warning('Please select images to upload');
      return;
    }

    setUploadingImages(true);
    try {
      const id = artifact._id || artifact.id;
      await api.uploadArtifactImages(id, selectedImages);
      toast.success('Images uploaded successfully');
      setSelectedImages([]);
      // Refresh artifacts to show updated images
      await fetchArtifacts();
      setUploadDialogOpen(false);
    } catch (e) {
      console.error('Image upload failed', e);
      toast.error('Failed to upload images: ' + e.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);
  };

  // Image upload handlers for create/update forms
  const handleFormImageSelect = (event) => {
    const files = Array.from(event.target.files);
    setFormImages(files);
  };

  const startEditArtifact = (artifact) => {
    setIsEditing(true);
    setEditingId(artifact._id || artifact.id);
    setNewArtifact({
      name: artifact.name || '',
      category: artifact.category || '',
      period: artifact.period || '',
      material: artifact.material || '',
      origin: artifact.origin || '',
      status: artifact.status || 'in_storage',
      condition: artifact.condition || 'good',
      description: artifact.description || '',
      location: artifact.location || '',
    });
    setOpenDialog(true);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredArtifacts.map((artifact) => (
        <Card key={artifact._id || artifact.id} className="group overflow-hidden border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {/* Image Section */}
          <div className="relative h-64 overflow-hidden">
            {artifact.media?.images && artifact.media.images.length > 0 ? (
              (() => {
                const imageUrl = artifact.media.images[0].url.startsWith('http')
                  ? artifact.media.images[0].url
                  : `${api.baseURL.replace('/api', '')}${artifact.media.images[0].url}`;

                return (
                  <img
                    src={imageUrl}
                    alt={artifact.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.src = '/placeholder-artifact.png'; }}
                  />
                );
              })()
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Camera size={48} className="text-muted-foreground" />
              </div>
            )}

            {/* Featured Badge */}
            {artifact.featured && (
              <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                <Star size={12} fill="currentColor" />
                Featured
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {getStatusBadge(artifact.status)}
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                {artifact.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span className="capitalize">{artifact.category}</span>
              <span>•</span>
              <span>{artifact.period?.era || artifact.period || 'Unknown'}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {getConditionBadge(artifact.condition)}
            </div>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {artifact.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedArtifact(artifact)}
                  className="hover:text-primary hover:bg-primary/10"
                  title="View Details"
                >
                  <Eye size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditArtifact(artifact)}
                  className="hover:text-primary hover:bg-primary/10"
                  title="Edit"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedArtifactForUpload(artifact);
                    setUploadDialogOpen(true);
                  }}
                  className="hover:text-primary hover:bg-primary/10"
                  title="Upload Images"
                >
                  <Upload size={16} />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFeatured(artifact)}
                  className={artifact.featured ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50" : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50"}
                  title="Toggle Featured"
                >
                  <Star size={16} fill={artifact.featured ? 'currentColor' : 'none'} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteArtifact(artifact)}
                  className="hover:text-destructive hover:bg-destructive/10"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredArtifacts.map((artifact) => (
            <TableRow key={artifact._id || artifact.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {artifact.name}
                  {artifact.featured && (
                    <Star size={14} className="text-yellow-500" fill="currentColor" />
                  )}
                </div>
              </TableCell>
              <TableCell className="capitalize">{artifact.category}</TableCell>
              <TableCell>{artifact.period?.era || artifact.period || 'Unknown'}</TableCell>
              <TableCell>
                {getStatusBadge(artifact.status)}
              </TableCell>
              <TableCell>
                {getConditionBadge(artifact.condition)}
              </TableCell>
              <TableCell>{artifact.origin?.region || artifact.location || 'Unknown'}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFeatured(artifact)}
                  className={artifact.featured ? "text-yellow-500" : "text-muted-foreground"}
                >
                  <Star size={16} fill={artifact.featured ? 'currentColor' : 'none'} />
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedArtifact(artifact)}
                    title="View"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditArtifact(artifact)}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteArtifact(artifact)}
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <MuseumAdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <MuseumAdminSidebar />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center mb-2">
              <Package className="mr-3 h-8 w-8 text-primary" />
              Artifact Management
            </h1>
            <p className="text-muted-foreground text-lg">
              Preserve and showcase your museum's precious artifacts with our comprehensive management system
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center">
                <Package className="h-10 w-10 mr-4 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Total Artifacts</p>
                  <h3 className="text-3xl font-bold">{artifacts.length}</h3>
                  <p className="text-xs opacity-60">In Collection</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center">
                <Eye className="h-10 w-10 mr-4 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">On Display</p>
                  <h3 className="text-3xl font-bold">
                    {artifacts.filter(a => a.status === 'on_display').length}
                  </h3>
                  <p className="text-xs opacity-60">Currently Exhibited</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center">
                <Shield className="h-10 w-10 mr-4 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Under Conservation</p>
                  <h3 className="text-3xl font-bold">
                    {artifacts.filter(a => a.status === 'under_conservation').length}
                  </h3>
                  <p className="text-xs opacity-60">Being Restored</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center">
                <Star className="h-10 w-10 mr-4 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Featured</p>
                  <h3 className="text-3xl font-bold">
                    {artifacts.filter(a => a.featured).length}
                  </h3>
                  <p className="text-xs opacity-60">Highlighted Items</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search artifacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="on_display">On Display</SelectItem>
                      <SelectItem value="in_storage">In Storage</SelectItem>
                      <SelectItem value="under_conservation">Under Conservation</SelectItem>
                      <SelectItem value="on_loan">On Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" /> Grid
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4 mr-2" /> Table
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => fetchArtifacts()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button onClick={() => setOpenDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Artifact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artifacts Display */}
          {filteredArtifacts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No artifacts found</h3>
              <p className="text-muted-foreground">
                {artifacts.length === 0 ? 'Start by adding your first artifact' : 'Try adjusting your search or filter criteria'}
              </p>
            </div>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderTableView()
          )}
        </div>
      </div>

      {/* Add Artifact Dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => { if (!open) resetForm(); setOpenDialog(open); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Artifact' : 'Add New Artifact'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Artifact Name</Label>
              <Input
                id="name"
                value={newArtifact.name}
                onChange={(e) => setNewArtifact({ ...newArtifact, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newArtifact.category} onValueChange={(value) => setNewArtifact({ ...newArtifact, category: value })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sculptures">Sculptures</SelectItem>
                  <SelectItem value="pottery">Pottery</SelectItem>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="weapons">Weapons</SelectItem>
                  <SelectItem value="textiles">Textiles</SelectItem>
                  <SelectItem value="religious-items">Religious Items</SelectItem>
                  <SelectItem value="manuscripts">Manuscripts</SelectItem>
                  <SelectItem value="coins">Coins</SelectItem>
                  <SelectItem value="paintings">Paintings</SelectItem>
                  <SelectItem value="household-items">Household Items</SelectItem>
                  <SelectItem value="musical-instruments">Musical Instruments</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Historical Period</Label>
              <Select value={newArtifact.period} onValueChange={(value) => setNewArtifact({ ...newArtifact, period: value })}>
                <SelectTrigger><SelectValue placeholder="Period" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="prehistoric">Prehistoric</SelectItem>
                  <SelectItem value="ancient">Ancient</SelectItem>
                  <SelectItem value="medieval">Medieval</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="contemporary">Contemporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Input
                value={newArtifact.material}
                onChange={(e) => setNewArtifact({ ...newArtifact, material: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Origin</Label>
              <Input
                value={newArtifact.origin}
                onChange={(e) => setNewArtifact({ ...newArtifact, origin: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={newArtifact.location}
                onChange={(e) => setNewArtifact({ ...newArtifact, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newArtifact.status} onValueChange={(value) => setNewArtifact({ ...newArtifact, status: value })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_storage">In Storage</SelectItem>
                  <SelectItem value="on_display">On Display</SelectItem>
                  <SelectItem value="under_conservation">Under Conservation</SelectItem>
                  <SelectItem value="on_loan">On Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={newArtifact.condition} onValueChange={(value) => setNewArtifact({ ...newArtifact, condition: value })}>
                <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="fragile">Fragile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newArtifact.description}
                onChange={(e) => setNewArtifact({ ...newArtifact, description: e.target.value })}
                rows={4}
                placeholder="Min 10 characters required"
              />
              <p className="text-xs text-muted-foreground text-right pl-2">
                {newArtifact.description.length}/2000
              </p>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFormImageSelect}
                style={{ display: 'none' }}
                id="form-image-upload-input"
              />
              <Label htmlFor="form-image-upload-input" className="cursor-pointer block">
                <div className="border-2 border-dashed border-input rounded-md p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium">
                    {formImages.length > 0 ? `Selected ${formImages.length} image(s)` : 'Click to select images'}
                  </span>
                </div>
              </Label>
              {formImages.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {formImages.map((f, i) => <div key={i}>• {f.name}</div>)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveArtifact} disabled={saving || uploadingFormImages}>
              {saving ? (uploadingFormImages ? 'Uploading...' : 'Saving...') : (isEditing ? 'Save Changes' : 'Add Artifact')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Artifact Detail Dialog */}
      <Dialog open={!!selectedArtifact} onOpenChange={(open) => !open && setSelectedArtifact(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedArtifact?.name}</DialogTitle>
          </DialogHeader>
          {selectedArtifact && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedArtifact.media?.images && selectedArtifact.media.images.length > 0 ? (
                  <div className="rounded-md overflow-hidden h-64 border bg-muted">
                    <img
                      src={selectedArtifact.media.images[0].url.startsWith('http')
                        ? selectedArtifact.media.images[0].url
                        : `${api.baseURL.replace('/api', '')}${selectedArtifact.media.images[0].url}`}
                      alt={selectedArtifact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-md overflow-hidden h-64 border bg-muted flex items-center justify-center">
                    <Camera className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Category:</span> {selectedArtifact.category}</p>
                    <p><span className="font-medium">Period:</span> {selectedArtifact.period?.era || selectedArtifact.period || 'Unknown'}</p>
                    <p><span className="font-medium">Origin:</span> {selectedArtifact.origin?.region || selectedArtifact.origin || 'Unknown'}</p>
                    <p><span className="font-medium">Added:</span> {new Date(selectedArtifact.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(selectedArtifact.status)}
                  {getConditionBadge(selectedArtifact.condition)}
                  {selectedArtifact.featured && <Badge className="bg-yellow-500 hover:bg-yellow-600 border-0">Featured</Badge>}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground max-h-32 overflow-y-auto">{selectedArtifact.description}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedArtifact(null)}>Close</Button>
            <Button onClick={() => { startEditArtifact(selectedArtifact); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              id="image-upload-input"
            />
            <Label htmlFor="image-upload-input" className="cursor-pointer block">
              <div className="border-2 border-dashed border-input rounded-md p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">
                  {selectedImages.length > 0 ? `Selected ${selectedImages.length} image(s)` : 'Click to select images'}
                </span>
              </div>
            </Label>
            {selectedImages.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {selectedImages.map((f, i) => <div key={i}>• {f.name}</div>)}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => handleImageUpload(selectedArtifactForUpload)} disabled={selectedImages.length === 0 || uploadingImages}>
              {uploadingImages ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete the artifact <span className="font-semibold">"{artifactToDelete?.name}"</span>?
            This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteArtifact}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ArtifactManagement;
