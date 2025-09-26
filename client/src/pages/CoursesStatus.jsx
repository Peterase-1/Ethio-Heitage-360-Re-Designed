import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, CheckCircle } from 'lucide-react';

const CoursesStatus = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Course Detail Functionality Removed
        </h1>
        
        <div className="space-y-4 text-muted-foreground text-lg mb-8">
          <p>✅ All CourseDetail components have been successfully removed</p>
          <p>✅ Course detail routes have been cleaned up</p>
          <p>✅ Navigation links have been updated</p>
          <p>✅ Course cards now show basic information via alerts</p>
        </div>
        
        <div className="bg-muted rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">What's Available Now:</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div>
              <h3 className="font-medium text-foreground">✅ Working Features:</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Course listing page</li>
                <li>• Course filtering and search</li>
                <li>• Course information (via alerts)</li>
                <li>• API integration with fallbacks</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground">🚫 Removed Features:</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Course detail pages</li>
                <li>• Course detail routes</li>
                <li>• Course navigation</li>
                <li>• Lesson functionality</li>
                <li>• Course enrollment</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/learning')}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Browse Courses
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto ml-0 sm:ml-4 px-8 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            Back to Home
          </button>
        </div>
        
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Status:</strong> Course detail functionality has been completely removed as requested.<br />
            All course interactions now show information via simple alerts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoursesStatus;
