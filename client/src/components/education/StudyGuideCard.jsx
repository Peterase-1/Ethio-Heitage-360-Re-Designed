import React from 'react';
import { 
  FileText, 
  Download, 
  Clock, 
  Star, 
  Eye, 
  Calendar 
} from 'lucide-react';

const StudyGuideCard = ({ guide }) => {
  const handleDownload = (e) => {
    e.stopPropagation();
    // Handle download logic here
    console.log('Download guide:', guide.id);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryColor = (category) => {
    const colors = {
      history: 'bg-blue-100 text-blue-800',
      culture: 'bg-purple-100 text-purple-800',
      archaeology: 'bg-amber-100 text-amber-800',
      language: 'bg-emerald-100 text-emerald-800',
      art: 'bg-pink-100 text-pink-800',
      traditions: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex gap-2 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(guide.category)}`}>
              {guide.category}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(guide.difficulty)}`}>
              {guide.difficulty}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
            {guide.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {guide.description}
          </p>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Topics */}
      {guide.topics && guide.topics.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Topics covered:</h4>
          <div className="flex flex-wrap gap-1">
            {guide.topics.slice(0, 3).map((topic, index) => (
              <span key={index} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                {topic}
              </span>
            ))}
            {guide.topics.length > 3 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                +{guide.topics.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {guide.estimatedTime} min read
        </div>
        <div className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          {guide.downloadCount || 0} downloads
        </div>
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4" />
          {(guide.rating || 0).toFixed(1)}
        </div>
      </div>

      {/* File info */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {guide.fileType?.toUpperCase()} • {formatFileSize(guide.fileSize)}
        </div>
        <div className="text-sm text-muted-foreground">
          By {guide.author}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
        <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors">
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default StudyGuideCard;
