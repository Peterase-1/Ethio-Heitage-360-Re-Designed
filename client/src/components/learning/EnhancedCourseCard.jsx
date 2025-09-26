import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Play, 
  Award,
  ChevronRight,
  Zap
} from 'lucide-react';

const EnhancedCourseCard = ({ course, onStartCourse }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': 
        return 'bg-edu-success/20 text-edu-success border-edu-success/30';
      case 'intermediate': 
        return 'bg-edu-warning/20 text-edu-warning border-edu-warning/30';
      case 'advanced': 
        return 'bg-edu-info/20 text-edu-info border-edu-info/30';
      default: 
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category) => {
    // Map categories to appropriate icons
    const iconMap = {
      'Islamic Heritage': '🕌',
      'Islamic Architecture': '🏛️',
      'Ethiopian Scripts': '📜',
      'Traditional Arts': '🎨',
      'Religious Heritage': '⛪',
      'Cultural Festivals': '🎉',
      'Culinary Heritage': '☕',
      'Musical Heritage': '🎵',
      'Cultural Heritage': '🏺',
      'Traditional Knowledge': '📚',
      'Natural Heritage': '🏔️',
      'Modern Heritage': '🏙️'
    };
    return iconMap[category] || '📚';
  };

  const formatDuration = (duration) => {
    if (typeof duration === 'string') return duration;
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    return '30 min';
  };

  return (
    <div className="group relative bg-edu-course-bg border border-edu-course-border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-edu-primary/30">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-edu-primary/10 to-edu-accent/10">
        <img 
          src={course.image || `https://picsum.photos/400/200?random=${course.id}`}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback for missing images */}
        <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-edu-primary/30 to-edu-accent/30">
          <div className="text-center text-white p-4">
            <div className="text-4xl mb-2">{getCategoryIcon(course.category)}</div>
            <div className="text-sm font-medium opacity-90">{course.category}</div>
          </div>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Difficulty Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty?.charAt(0).toUpperCase() + course.difficulty?.slice(1)}
          </span>
        </div>
        
        {/* Course Stats Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>{course.lessons} lessons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Category and Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-lg mr-2">{getCategoryIcon(course.category)}</span>
            <span className="bg-edu-primary/10 text-edu-primary px-3 py-1 rounded-full text-sm font-semibold">
              {course.category}
            </span>
          </div>
          <div className="flex items-center text-edu-accent">
            <Star className="w-4 h-4 mr-1 fill-current" />
            <span className="font-semibold">{course.rating || '4.8'}</span>
          </div>
        </div>

        {/* Course Title */}
        <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-edu-primary transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {/* Enrollment and Instructor */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Users className="w-4 h-4 mr-2" />
            <span>{course.enrolled || '1,200+'} enrolled</span>
          </div>
          <div className="flex items-center text-edu-secondary">
            <Award className="w-4 h-4 mr-2" />
            <span className="font-medium">Certificate</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onStartCourse ? onStartCourse(course) : null}
          className="group/btn w-full bg-edu-primary hover:bg-edu-hover text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
        >
          <Play className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
          <span>Start Learning</span>
          <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </button>

        {/* Quick Features */}
        <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            <span>Interactive</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <div className="flex items-center">
            <Award className="w-3 h-3 mr-1" />
            <span>Certified</span>
          </div>
          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          <span>Mobile Friendly</span>
        </div>
      </div>

      {/* Hover Effect Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-edu-primary/0 via-edu-primary/0 to-edu-accent/0 group-hover:from-edu-primary/5 group-hover:to-edu-accent/5 transition-all duration-500 pointer-events-none rounded-2xl"></div>
    </div>
  );
};

export default EnhancedCourseCard;
