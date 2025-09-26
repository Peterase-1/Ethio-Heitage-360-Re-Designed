import React from 'react';
import { 
  BookOpen, 
  Users, 
  Award, 
  FileText,
  Brain,
  Video,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

const EducationNavigation = ({ activeSection, onSectionChange, user }) => {
  const sections = [
    {
      id: 'browse-courses',
      label: 'Browse Courses',
      icon: BookOpen,
      description: 'Explore available courses',
      public: true
    },
    {
      id: 'my-learning',
      label: 'My Learning',
      icon: GraduationCap,
      description: 'Track your progress',
      public: false
    },
    {
      id: 'study-guides',
      label: 'Study Guides',
      icon: FileText,
      description: 'Downloadable materials',
      public: true
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: Award,
      description: 'Your achievements',
      public: false
    },
    {
      id: 'quizzes',
      label: 'Quizzes',
      icon: Brain,
      description: 'Test your knowledge',
      public: true,
      comingSoon: true
    },
    {
      id: 'live-sessions',
      label: 'Live Sessions',
      icon: Video,
      description: 'Interactive learning',
      public: true,
      comingSoon: true
    }
  ];

  const handleSectionClick = (sectionId, requiresAuth, comingSoon) => {
    if (comingSoon) {
      return; // Don't allow navigation to coming soon features
    }
    if (requiresAuth && !user) {
      return; // Don't allow navigation to auth-required sections
    }
    onSectionChange(sectionId);
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Education Hub</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Learn Ethiopian heritage
        </p>
      </div>

      <nav className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isDisabled = (!section.public && !user) || section.comingSoon;
          
          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section.id, !section.public, section.comingSoon)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : isDisabled
                  ? 'text-muted-foreground cursor-not-allowed opacity-60'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {section.label}
                    {section.comingSoon && (
                      <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        Soon
                      </span>
                    )}
                  </span>
                  {!isDisabled && (
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  )}
                </div>
                <p className="text-sm opacity-75 mt-1">{section.description}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {!user && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Sign in required</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Sign in to access your learning progress, certificates, and personalized content.
          </p>
        </div>
      )}

      {/* Quick Stats for authenticated users */}
      {user && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium text-sm mb-3">Your Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Enrolled Courses</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Certificates Earned</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Study Time</span>
              <span className="font-medium">0h</span>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
        <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Getting Started
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          New to Ethiopian heritage learning? Start with our beginner courses.
        </p>
        <button
          onClick={() => onSectionChange('browse-courses')}
          className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors"
        >
          Browse Courses
        </button>
      </div>
    </div>
  );
};

export default EducationNavigation;
