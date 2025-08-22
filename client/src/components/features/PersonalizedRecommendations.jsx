import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Skeleton,
  Avatar,
  Rating,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Recommend as RecommendIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const PersonalizedRecommendations = ({ userId }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    fetchRecommendations();
    fetchUserInterests();
  }, [userId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI-powered recommendations based on user behavior
      const mockRecommendations = [
        {
          id: 1,
          title: "Ancient Axum Obelisks",
          description: "Explore the magnificent stone obelisks of ancient Axum, symbols of Ethiopian civilization.",
          imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center",
          type: "heritage_site",
          category: "Ancient Architecture",
          rating: 4.8,
          views: 1250,
          recommendationReason: "Based on your interest in ancient architecture",
          tags: ["Ancient", "Architecture", "Axum", "UNESCO"],
          estimatedTime: "15 minutes",
          difficulty: "Beginner",
        },
        {
          id: 2,
          title: "Ethiopian Orthodox Church Art",
          description: "Discover the rich artistic traditions of Ethiopian Orthodox Christianity.",
          imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center",
          type: "artifact_collection",
          category: "Religious Art",
          rating: 4.9,
          views: 980,
          recommendationReason: "Popular among users with similar interests",
          tags: ["Religious", "Art", "Orthodox", "Manuscripts"],
          estimatedTime: "25 minutes",
          difficulty: "Intermediate",
        },
        {
          id: 3,
          title: "Traditional Ethiopian Textiles",
          description: "Learn about the intricate weaving traditions and cultural significance of Ethiopian textiles.",
          imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center",
          type: "virtual_tour",
          category: "Traditional Crafts",
          rating: 4.7,
          views: 756,
          recommendationReason: "Trending in your region",
          tags: ["Textiles", "Crafts", "Traditional", "Culture"],
          estimatedTime: "20 minutes",
          difficulty: "Beginner",
        },
        {
          id: 4,
          title: "Rock-Hewn Churches of Lalibela",
          description: "Experience the architectural marvel of Lalibela's rock-hewn churches.",
          imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center",
          type: "3d_tour",
          category: "Religious Architecture",
          rating: 4.9,
          views: 2100,
          recommendationReason: "Highly rated by users like you",
          tags: ["Lalibela", "Churches", "Architecture", "UNESCO"],
          estimatedTime: "35 minutes",
          difficulty: "Advanced",
        },
        {
          id: 5,
          title: "Ethiopian Coffee Culture",
          description: "Explore the origins and cultural significance of coffee in Ethiopian society.",
          imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center",
          type: "cultural_experience",
          category: "Cultural Traditions",
          rating: 4.6,
          views: 1890,
          recommendationReason: "New addition to your favorite categories",
          tags: ["Coffee", "Culture", "Traditions", "Ceremony"],
          estimatedTime: "18 minutes",
          difficulty: "Beginner",
        },
        {
          id: 6,
          title: "Ancient Ethiopian Scripts",
          description: "Discover the evolution of Ethiopian writing systems from ancient to modern times.",
          imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=300&h=200&fit=crop&crop=center",
          type: "educational_content",
          category: "Language & Literature",
          rating: 4.5,
          views: 634,
          recommendationReason: "Based on your recent searches",
          tags: ["Scripts", "Language", "History", "Ge'ez"],
          estimatedTime: "22 minutes",
          difficulty: "Intermediate",
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInterests = async () => {
    try {
      // Simulate fetching user interests
      const mockInterests = [
        "Ancient Architecture",
        "Religious Art",
        "Traditional Crafts",
        "UNESCO Sites",
        "Cultural Traditions"
      ];
      setUserInterests(mockInterests);
    } catch (error) {
      console.error('Error fetching user interests:', error);
    }
  };

  const handleFavorite = (itemId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const handleShare = (item) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      // You could show a snackbar here indicating the link was copied
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'heritage_site':
        return '🏛️';
      case 'artifact_collection':
        return '🏺';
      case 'virtual_tour':
        return '🎭';
      case '3d_tour':
        return '🌐';
      case 'cultural_experience':
        return '☕';
      case 'educational_content':
        return '📚';
      default:
        return '📖';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Personalized Recommendations
        </Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RecommendIcon color="primary" />
          Personalized Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Curated content based on your interests and browsing history
        </Typography>
        
        {userInterests.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Your Interests:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userInterests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {recommendations.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl}
                  alt={item.title}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {getTypeIcon(item.type)}
                  {item.type.replace('_', ' ').toUpperCase()}
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleFavorite(item.id)}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    }}
                  >
                    {favorites.has(item.id) ? (
                      <FavoriteIcon color="error" fontSize="small" />
                    ) : (
                      <FavoriteBorderIcon fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleShare(item)}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    }}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {item.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {item.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={item.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {item.rating} ({item.views} views)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      ⏱️ {item.estimatedTime}
                    </Typography>
                    <Chip
                      label={item.difficulty}
                      size="small"
                      color={getDifficultyColor(item.difficulty)}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingUpIcon fontSize="small" />
                    {item.recommendationReason}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {item.tags.length > 3 && (
                      <Chip
                        label={`+${item.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<VisibilityIcon />}
                  sx={{ mt: 'auto' }}
                >
                  Explore Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="outlined" size="large">
          Load More Recommendations
        </Button>
      </Box>
    </Box>
  );
};

export default PersonalizedRecommendations;

