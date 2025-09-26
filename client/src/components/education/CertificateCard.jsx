import React from 'react';
import { 
  Award, 
  Download, 
  Share, 
  Calendar, 
  CheckCircle, 
  Star,
  ExternalLink
} from 'lucide-react';

const CertificateCard = ({ certificate }) => {
  const handleDownload = () => {
    console.log('Download certificate:', certificate.id);
  };

  const handleShare = () => {
    console.log('Share certificate:', certificate.id);
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
        return 'text-green-600';
      case 'intermediate':
        return 'text-yellow-600';
      case 'advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header with certificate design */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-6 border-b border-dashed">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Certificate of Completion</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Verified
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(certificate.category)}`}>
              {certificate.category}
            </span>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground mb-2">
            {certificate.courseTitle}
          </h2>
          <p className="text-muted-foreground text-sm">
            {certificate.description}
          </p>
        </div>
      </div>

      {/* Certificate Details */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Certificate Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Certificate ID:</span>
              <div className="font-mono text-xs bg-muted px-2 py-1 rounded mt-1">
                {certificate.certificateId}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Completion Date:</span>
              <div className="font-medium">
                {new Date(certificate.completionDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{certificate.finalScore}%</div>
              <div className="text-muted-foreground">Final Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{Math.floor((certificate.timeSpent || 0) / 60)}h</div>
              <div className="text-muted-foreground">Study Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{certificate.lessonsCompleted}/{certificate.totalLessons}</div>
              <div className="text-muted-foreground">Lessons</div>
            </div>
          </div>

          {/* Instructor & Difficulty */}
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="text-muted-foreground">Instructor:</span>
              <div className="font-medium">{certificate.instructor}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Level:</span>
              <div className={`font-medium capitalize ${getDifficultyColor(certificate.difficulty)}`}>
                {certificate.difficulty}
              </div>
            </div>
          </div>

          {/* Skills & Achievements */}
          {certificate.metadata?.skillsAcquired && certificate.metadata.skillsAcquired.length > 0 && (
            <div>
              <span className="text-muted-foreground text-sm">Skills Acquired:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {certificate.metadata.skillsAcquired.slice(0, 3).map((skill, index) => (
                  <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
                {certificate.metadata.skillsAcquired.length > 3 && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    +{certificate.metadata.skillsAcquired.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Verification */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Verified Certificate</span>
              </div>
              <button className="text-xs text-primary hover:underline flex items-center gap-1">
                Verify
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Verification code: {certificate.verificationCode}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleDownload}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Share className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateCard;
