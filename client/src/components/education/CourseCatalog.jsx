import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Filter, X, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CourseCard from './CourseCard';
import { educationApi } from '../../services/educationApi';
import api from '../../utils/api';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    sortBy: 'createdAt'
  });
  const [bookmarkedCourses, setBookmarkedCourses] = useState(new Set());

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        category: filters.category,
        difficulty: filters.difficulty,
        limit: 20,
        // search: filters.search // Assuming API supports search, otherwise we filter client-side as before
      };

      const result = await educationApi.getCourses(params);

      if (result.success) {
        setCourses(result.courses || []);
      } else if (result.data) {
        // handle case where result structure might be different
        setCourses(result.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (courseId) => {
    try {
      const isBookmarked = bookmarkedCourses.has(courseId);
      const method = isBookmarked ? 'DELETE' : 'POST';

      // Using direct API call since it's not in educationApi yet
      await api.request(`/education-hub/courses/${courseId}/bookmark`, { method });

      const newBookmarked = new Set(bookmarkedCourses);
      if (isBookmarked) {
        newBookmarked.delete(courseId);
        toast.success('Removed from bookmarks');
      } else {
        newBookmarked.add(courseId);
        toast.success('Added to bookmarks');
      }
      setBookmarkedCourses(newBookmarked);

    } catch (error) {
      console.error('Error bookmarking course:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    course.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  const clearFilters = () => {
    setFilters({ search: '', category: '', difficulty: '', sortBy: 'createdAt' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-primary/10 rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-3">
          Ethiopian Heritage Learning Center
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the rich history and culture of Ethiopia through our comprehensive courses
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground"
            />
          </div>

          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground appearance-none"
            >
              <option value="">All Categories</option>
              <option value="history">History</option>
              <option value="culture">Culture</option>
              <option value="archaeology">Archaeology</option>
              <option value="language">Language</option>
              <option value="art">Art</option>
              <option value="traditions">Traditions</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground appearance-none"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <button
            onClick={clearFilters}
            className="flex items-center justify-center px-4 py-2 border border-input rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 h-[350px] animate-pulse">
              <div className="h-48 bg-muted rounded-lg mb-4" />
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2 mb-4" />
              <div className="flex justify-between mt-auto">
                <div className="h-8 bg-muted rounded w-20" />
                <div className="h-8 bg-muted rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search criteria or check back later for new courses.
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id || course.id}
              course={course}
              isBookmarked={bookmarkedCourses.has(course._id || course.id)}
              onToggleBookmark={handleBookmark}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredCourses.length > 0 && filteredCourses.length % 20 === 0 && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={fetchCourses}
            className="px-6 py-3 border border-input rounded-lg hover:bg-muted text-foreground font-medium transition-colors"
          >
            Load More Courses
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
