import React from 'react';
import { Clock, BookOpen, Users, Star, Play } from 'lucide-react';
import { EthiopianColors, EthiopianImageUrls } from '../../assets/EthiopianAssets';

const CourseCard = ({ course, onStartCourse }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return { backgroundColor: `${EthiopianColors.green}20`, color: EthiopianColors.green };
      case 'intermediate': return { backgroundColor: `${EthiopianColors.yellow}20`, color: '#B45309' };
      case 'advanced': return { backgroundColor: `${EthiopianColors.red}20`, color: EthiopianColors.red };
      default: return { backgroundColor: `${EthiopianColors.blue}20`, color: EthiopianColors.blue };
    }
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border-2 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2" 
         style={{ borderColor: `${EthiopianColors.green}20` }}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image || EthiopianImageUrls.ancientManuscript}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold" 
                style={getDifficultyColor(course.difficulty)}>
            {course.difficulty}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center text-white text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span className="mr-4">{course.duration}</span>
            <BookOpen className="w-4 h-4 mr-1" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 rounded-full text-sm font-semibold" 
                style={{ backgroundColor: `${EthiopianColors.green}20`, color: EthiopianColors.green }}>
            {course.category}
          </span>
          <div className="flex items-center text-muted-foreground text-sm">
            <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
            {course.rating}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 transition-colors group-hover:text-green-600" 
            style={{ color: 'inherit' }}>
          {course.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="w-4 h-4 mr-1" />
            {course.enrolled} enrolled
          </div>
          <button 
            onClick={() => onStartCourse && onStartCourse(course)}
            className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 flex items-center hover:shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${EthiopianColors.green}, ${EthiopianColors.yellow})` 
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
