import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArtifactDetailsModal } from '../components/virtual-museum/ArtifactDetail';

const ArtifactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // Mock data - replace with API call to fetch artifact by ID
  const mockArtifacts = [
    {
      id: '1',
      title: 'Ancient Ethiopian Cross',
      description: 'A beautifully crafted cross from the 12th century, representing the rich Christian heritage of Ethiopia.',
      longDescription: 'This magnificent cross represents one of the finest examples of Ethiopian religious craftsmanship from the medieval period. Carved from a single piece of wood and adorned with intricate geometric patterns, it showcases the sophisticated artistic traditions that flourished in the Ethiopian highlands during the 12th century.',
      images: ['https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center'],
      category: 'Religious Artifacts',
      period: '12th Century',
      culture: 'Ethiopian',
      region: 'Lalibela',
      materials: ['Wood', 'Silver inlay'],
      dimensions: '45cm × 30cm × 5cm',
      condition: 'Good',
      currentLocation: 'National Museum of Ethiopia',
      dateDiscovered: '1892',
      audioGuide: true,
      featured: true,
      tags: ['Religious', 'Medieval', 'Craftsmanship', 'Christianity'],
      significance: 'This cross is believed to have been used in ancient religious ceremonies in the rock-hewn churches of Lalibela. Its intricate design reflects the advanced craftsmanship of the era and the deep religious devotion of Ethiopian Christians.',
      relatedArtifacts: ['2', '3']
    },
    {
      id: '2',
      title: 'Traditional Coffee Ceremony Set',
      description: 'Complete set used in traditional Ethiopian coffee ceremonies, showcasing the cultural significance of coffee.',
      longDescription: 'This traditional coffee ceremony set represents the heart of Ethiopian social and cultural life. The jebena (coffee pot), cups, and incense burner are all essential components of the elaborate ritual that brings families and communities together.',
      images: ['https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center'],
      category: 'Cultural Artifacts',
      period: '19th Century',
      culture: 'Ethiopian',
      region: 'Kaffa Region',
      materials: ['Clay', 'Wood'],
      dimensions: '25cm × 15cm × 15cm',
      condition: 'Excellent',
      currentLocation: 'Ethnological Museum',
      dateDiscovered: '1920',
      audioGuide: true,
      featured: false,
      tags: ['Coffee', 'Ceremony', 'Traditional', 'Social'],
      significance: 'The coffee ceremony is a fundamental part of Ethiopian social and cultural life. This set includes a jebena (coffee pot), cups, and an incense burner, all essential for the ritual that can last several hours and serves as a time for community bonding.',
      relatedArtifacts: ['1', '6']
    },
    {
      id: '3',
      name: 'Ancient Manuscript',
      description: 'Rare illuminated manuscript written in Ge\'ez, containing religious texts and historical records.',
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center',
      category: 'Manuscripts',
      period: '15th Century',
      origin: 'Gondar',
      museum: 'Institute of Ethiopian Studies',
      has3DModel: false,
      views: 756,
      likes: 45,
      rating: 4.9,
      isFavorited: false,
      historicalContext: 'Ge\'ez is an ancient South Semitic language of Ethiopia. Manuscripts like this one are crucial for understanding the history, religion, and literature of the region.'
    },
    {
      id: '4',
      name: 'Royal Crown of Menelik II',
      description: 'Ornate crown worn by Emperor Menelik II, symbolizing the imperial power of Ethiopia.',
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center',
      category: 'Royal Artifacts',
      period: '19th Century',
      origin: 'Addis Ababa',
      museum: 'National Museum of Ethiopia',
      has3DModel: true,
      views: 2100,
      likes: 156,
      rating: 4.9,
      isFavorited: false,
      historicalContext: 'Emperor Menelik II was a pivotal figure in Ethiopian history, known for his military victories and modernization efforts. This crown represents his reign and the Solomonic dynasty.'
    },
    {
      id: '5',
      name: 'Ancient Stone Tablet',
      description: 'Stone tablet with inscriptions in ancient Ethiopian script, providing insights into early civilization.',
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center',
      category: 'Archaeological',
      period: '8th Century',
      origin: 'Axum',
      museum: 'Axum Museum',
      has3DModel: true,
      views: 834,
      likes: 72,
      rating: 4.7,
      isFavorited: true,
      historicalContext: 'Axum was an ancient kingdom and trading nation. Stone tablets with inscriptions are vital archaeological finds that shed light on the language, governance, and daily life of the Axumite civilization.'
    },
    {
      id: '6',
      name: 'Traditional Weaving Tools',
      description: 'Set of traditional tools used for weaving Ethiopian textiles, showcasing ancient craftsmanship.',
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=400&fit=crop&crop=center',
      category: 'Tools & Crafts',
      period: '18th Century',
      origin: 'Dorze',
      museum: 'Cultural Heritage Museum',
      has3DModel: false,
      views: 567,
      likes: 38,
      rating: 4.4,
      isFavorited: false,
      historicalContext: 'Ethiopian textiles are renowned for their vibrant colors and intricate patterns. These tools represent the traditional weaving techniques passed down through generations, particularly from communities like the Dorze.'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Simulate API call
    setTimeout(() => {
      const foundArtifact = mockArtifacts.find(art => art.id === id);
      if (foundArtifact) {
        setArtifact(foundArtifact);
      } else {
        setError('Artifact not found.');
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleToggleFavorite = (artifactId) => {
    setIsFavorited(!isFavorited);
    // Here you would also update the backend/localStorage
  };

  const handleShare = (artifact) => {
    if (navigator.share) {
      navigator.share({
        title: artifact.title,
        text: artifact.description,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading artifact details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/virtual-museum')}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Virtual Museum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <ArtifactDetailsModal 
        artifact={artifact} 
        isOpen={true} 
        onClose={() => navigate('/virtual-museum')}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
        isFavorited={isFavorited}
      />
    </div>
  );
};

export default ArtifactDetail;
