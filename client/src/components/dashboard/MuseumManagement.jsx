import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
  Eye,
  RefreshCw,
  Plus,
  Landmark,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

const MuseumManagement = ({ museums, onAdd, onUpdate, onDelete, loading = false, setMuseums }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    imageUrl: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFormChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleAddClick = () => {
    setSelectedMuseum(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      imageUrl: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
    });
    setEditDialogOpen(true);
  };

  const handleEditClick = (museum) => {
    setSelectedMuseum(museum);
    setFormData({
      name: museum.name,
      location: museum.location,
      description: museum.description,
      imageUrl: museum.imageUrl || '',
      contactEmail: museum.contactEmail || '',
      contactPhone: museum.contactPhone || '',
      website: museum.website || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (museum) => {
    setSelectedMuseum(museum);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedMuseum) {
        await onUpdate(selectedMuseum.id, formData);
        toast.success('Museum updated successfully!');
      } else {
        await onAdd(formData);
        toast.success('Museum added successfully!');
      }
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving museum:', error);
      toast.error('Operation failed!');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(selectedMuseum.id);
      setDeleteDialogOpen(false);
      toast.success('Museum deleted successfully!');
    } catch (error) {
      console.error('Error deleting museum:', error);
      toast.error('Deletion failed!');
    }
  };

  const filteredMuseums = museums.filter(museum =>
    museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    museum.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    museum.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedMuseums = filteredMuseums.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalPages = Math.ceil(filteredMuseums.length / rowsPerPage);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">Museum Management</CardTitle>
        <Button onClick={handleAddClick} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add New Museum
        </Button>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Museums..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredMuseums.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No museums found matching your criteria.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMuseums.map((museum) => (
                  <TableRow key={museum.id}>
                    <TableCell>
                      <img
                        src={museum.imageUrl || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=60&h=60&fit=crop&crop=center'}
                        alt={museum.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{museum.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {museum.description?.substring(0, 50)}...
                      </div>
                    </TableCell>
                    <TableCell>{museum.location}</TableCell>
                    <TableCell>
                      <div className="text-sm">{museum.contactEmail}</div>
                      <div className="text-xs text-muted-foreground">{museum.contactPhone}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditClick(museum)}
                        >
                          <Edit2 className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteClick(museum)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredMuseums.length > 0 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground flex-1">
              Page {page + 1} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>

      {/* Add/Edit Museum Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMuseum ? 'Edit Museum' : 'Add New Museum'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Museum Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. National Museum"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                placeholder="e.g. Addis Ababa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={3}
                placeholder="Brief description of the museum"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleFormChange}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleFormChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleFormChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {selectedMuseum ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Museum Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Museum</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete <span className="font-semibold">{selectedMuseum?.name}</span>? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MuseumManagement;

