import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Share,
  Bookmark,
  Collections as CollectionsIcon,
  Person,
  School,
  Public
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [createModal, setCreateModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [viewModal, setViewModal] = useState(false);

  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    type: 'custom',
    category: 'mixed',
    isPublic: false
  });

  // Mock data for collections
  const mockCollections = [
    {
      _id: '1',
      name: 'My Ethiopian History Favorites',
      description: 'Collection of artifacts and resources about Ethiopian history',
      type: 'favorites',
      category: 'history',
      isPublic: true,
      owner: {
        firstName: 'John',
        lastName: 'Doe',
        avatar: '/avatars/user1.jpg'
      },
      stats: {
        totalItems: 25,
        completedItems: 18,
        averageScore: 87
      },
      items: [
        {
          itemType: 'artifact',
          itemTitle: 'Ancient Ethiopian Coin',
          itemDescription: 'Gold coin from the Aksumite Empire',
          addedAt: '2024-01-15',
          progress: { completed: true, score: 95 }
        },
        {
          itemType: 'course',
          itemTitle: 'Ethiopian Dynasties',
          itemDescription: 'Learn about the royal dynasties of Ethiopia',
          addedAt: '2024-01-10',
          progress: { completed: false, score: null }
        }
      ],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      _id: '2',
      name: 'Traditional Arts Study Guide',
      description: 'Resources for learning about Ethiopian traditional arts',
      type: 'learning-path',
      category: 'art',
      isPublic: false,
      owner: {
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: '/avatars/user2.jpg'
      },
      stats: {
        totalItems: 12,
        completedItems: 5,
        averageScore: 78
      },
      items: [],
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12'
    }
  ];

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      // Mock API call
      setTimeout(() => {
        setCollections(mockCollections);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Error loading collections');
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      const collection = {
        ...newCollection,
        _id: Date.now().toString(),
        owner: {
          firstName: 'Current',
          lastName: 'User'
        },
        stats: {
          totalItems: 0,
          completedItems: 0,
          averageScore: 0
        },
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCollections([...collections, collection]);
      setCreateModal(false);
      setNewCollection({
        name: '',
        description: '',
        type: 'custom',
        category: 'mixed',
        isPublic: false
      });

      toast.success('Collection created successfully!');
    } catch (error) {
      toast.error('Error creating collection');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      const updatedCollections = collections.filter(c => c._id !== collectionId);
      setCollections(updatedCollections);
      toast.success('Collection deleted successfully');
    } catch (error) {
      toast.error('Error deleting collection');
    }
  };

  const handleViewCollection = (collection) => {
    setSelectedCollection(collection);
    setViewModal(true);
  };

  const getTypeColor = (type) => {
    const colors = {
      'learning-path': 'primary',
      'favorites': 'secondary',
      'wishlist': 'warning',
      'completed': 'success',
      'custom': 'default'
    };
    return colors[type] || 'default';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      history: <School />,
      culture: <Person />,
      art: <CollectionsIcon />,
      mixed: <Public />
    };
    return icons[category] || <CollectionsIcon />;
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && collection.type === filterType;
  });

  const sortedCollections = filteredCollections.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'items':
        return b.stats.totalItems - a.stats.totalItems;
      default:
        return 0;
    }
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Collections
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateModal(true)}
        >
          New Collection
        </Button>
      </Box>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="learning-path">Learning Path</MenuItem>
                <MenuItem value="favorites">Favorites</MenuItem>
                <MenuItem value="wishlist">Wishlist</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="updated">Last Updated</MenuItem>
                <MenuItem value="created">Date Created</MenuItem>
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="items">Item Count</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Collections Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sortedCollections.map((collection) => (
            <Grid item xs={12} md={6} lg={4} key={collection._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2 }}>
                      {getCategoryIcon(collection.category)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" noWrap>
                        {collection.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={collection.type} 
                          color={getTypeColor(collection.type)}
                          size="small"
                        />
                        {collection.isPublic && (
                          <Chip label="Public" color="info" size="small" />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {collection.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">
                        {collection.stats.completedItems}/{collection.stats.totalItems}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={collection.stats.totalItems > 0 ? 
                        (collection.stats.completedItems / collection.stats.totalItems) * 100 : 0}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {collection.stats.totalItems} items
                      </Typography>
                      {collection.stats.averageScore > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          • {collection.stats.averageScore}% avg
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Updated {new Date(collection.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewCollection(collection)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small">
                    <Share />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteCollection(collection._id)}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Collection Modal */}
      <Dialog
        open={createModal}
        onClose={() => setCreateModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Collection Name"
                value={newCollection.name}
                onChange={(e) => setNewCollection({
                  ...newCollection,
                  name: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newCollection.description}
                onChange={(e) => setNewCollection({
                  ...newCollection,
                  description: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newCollection.type}
                  onChange={(e) => setNewCollection({
                    ...newCollection,
                    type: e.target.value
                  })}
                >
                  <MenuItem value="custom">Custom</MenuItem>
                  <MenuItem value="learning-path">Learning Path</MenuItem>
                  <MenuItem value="favorites">Favorites</MenuItem>
                  <MenuItem value="wishlist">Wishlist</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newCollection.category}
                  onChange={(e) => setNewCollection({
                    ...newCollection,
                    category: e.target.value
                  })}
                >
                  <MenuItem value="mixed">Mixed</MenuItem>
                  <MenuItem value="history">History</MenuItem>
                  <MenuItem value="culture">Culture</MenuItem>
                  <MenuItem value="art">Art</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateCollection}
            disabled={!newCollection.name}
          >
            Create Collection
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Collection Modal */}
      <Dialog
        open={viewModal}
        onClose={() => setViewModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Collection Details
          {selectedCollection && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedCollection.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedCollection && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedCollection.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Collection Items ({selectedCollection.items.length})
                </Typography>
                {selectedCollection.items.length > 0 ? (
                  <List>
                    {selectedCollection.items.map((item, index) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={item.itemTitle}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {item.itemDescription}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Type: {item.itemType} • Added: {new Date(item.addedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {item.progress.completed ? (
                            <Chip label={`${item.progress.score}%`} color="success" size="small" />
                          ) : (
                            <Chip label="In Progress" color="warning" size="small" />
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No items in this collection yet.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Collections;
