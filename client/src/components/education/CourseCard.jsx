import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Play, 
  CheckCircle,
  ArrowRight,
  Calendar,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { educationApi } from '../../services/educationApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const CourseCard = ({ course, viewMode = 'grid', showProgress = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      await educationApi.enrollInCourse(course.id);
      toast.success('Successfully enrolled in course!');
      // Optionally refresh the course data or redirect
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewCourse = () => {
    navigate(`/education/courses/${course.id}`);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  if (viewMode === 'list') {
    return (
      <div className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Course Image */}
          <div className="md:w-48 flex-shrink-0">
            <img
              src={course.image || course.thumbnail || 'https://picsum.photos/300/200'}
              alt={course.title}
              className="w-full h-32 md:h-24 object-cover rounded-lg"
              loading="lazy"
            />
          </div>

          {/* Course Info */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(course.category)}`}>
                {course.category}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </span>
              {course.featured && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                  Featured
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
              {course.title}
            </h3>

            <p className="text-muted-foreground mb-4 line-clamp-2">
              {course.description}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(course.estimatedDuration || 120)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.enrollmentCount || 0} enrolled
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {(course.averageRating || 0).toFixed(1)}
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.instructor || 'Heritage Expert'}
              </div>
            </div>

            {showProgress && course.progressPercentage !== undefined && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{course.progressPercentage || 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progressPercentage || 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{course.lessonsCompleted || 0} of {course.totalLessons || 0} lessons</span>
                  <span>Last accessed: {course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col justify-between md:w-32 flex-shrink-0">
            <div className="text-right mb-4">
              {course.price > 0 ? (
                <span className="text-lg font-bold text-foreground">
                  ${course.price}
                </span>
              ) : (
                <span className="text-sm font-medium text-green-600">Free</span>
              )}
            </div>

            <div className="space-y-2">
              {showProgress ? (
                <button
                  onClick={handleViewCourse}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Continue
                </button>
              ) : course.isEnrolled ? (
                <button
                  onClick={handleViewCourse}
                  className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Access
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {enrolling ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      Enroll
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleViewCourse}
                className="w-full border border-border px-4 py-2 rounded-md hover:bg-muted transition-colors text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Course Image */}
      <div className="relative overflow-hidden">
        <img
          src={course.image || course.thumbnail || 'https://picsum.photos/400/250'}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(course.category)}`}>
            {course.category}
          </span>
          {course.featured && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              Featured
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border bg-white/90 ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>

        {course.isEnrolled && (
          <div className="absolute bottom-3 right-3">
            <div className="bg-green-500 text-white p-1.5 rounded-full">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(course.estimatedDuration || 120)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.enrollmentCount || 0}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {(course.averageRating || 0).toFixed(1)}
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.instructor || 'Heritage Expert'}
          </div>
        </div>

        {/* Progress Bar for enrolled courses */}
        {showProgress && course.progressPercentage !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{course.progressPercentage || 0}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progressPercentage || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            {course.price > 0 ? (
              <span className="text-lg font-bold text-foreground">
                ${course.price}
              </span>
            ) : (
              <span className="text-sm font-medium text-green-600">Free</span>
            )}
          </div>

          <div className="flex gap-2">
            {showProgress ? (
              <button
                onClick={handleViewCourse}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Continue
              </button>
            ) : course.isEnrolled ? (
              <button
                onClick={handleViewCourse}
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Access
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {enrolling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Enroll
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
