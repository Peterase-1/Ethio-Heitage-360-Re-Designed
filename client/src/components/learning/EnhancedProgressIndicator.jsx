import React from 'react';
import { 
  Trophy, 
  Star, 
  Clock, 
  TrendingUp, 
  Award, 
  Target, 
  Zap,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

const EnhancedProgressIndicator = ({ progress }) => {
  if (!progress) {
    return (
      <div className="bg-edu-course-bg border border-edu-course-border rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-edu-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-edu-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Start Your Journey</h3>
        <p className="text-muted-foreground">Begin learning to track your progress</p>
      </div>
    );
  }

  const completionPercentage = Math.round((progress.completedLessons / (progress.totalLessons || 1)) * 100);
  const circumference = 2 * Math.PI * 60; // radius of 60
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  const getMotivationalMessage = (percentage) => {
    if (percentage >= 90) return "🎉 Almost there, champion!";
    if (percentage >= 70) return "🔥 You're on fire!";
    if (percentage >= 50) return "💪 Keep up the great work!";
    if (percentage >= 25) return "🌟 Great start!";
    return "🚀 Begin your journey!";
  };

  const getLevelColor = (level) => {
    if (level >= 10) return 'text-edu-accent bg-edu-accent/10';
    if (level >= 5) return 'text-edu-warning bg-edu-warning/10';
    return 'text-edu-primary bg-edu-primary/10';
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Circle */}
      <div className="bg-edu-course-bg border border-edu-course-border rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="relative w-40 h-40 mx-auto mb-6">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
              <circle
                cx="72"
                cy="72"
                r="60"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              {/* Progress Circle */}
              <circle
                cx="72"
                cy="72"
                r="60"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                style={{
                  strokeDasharray: strokeDasharray,
                  strokeDashoffset: strokeDashoffset,
                  transition: 'stroke-dashoffset 1s ease-in-out'
                }}
              />
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--educational-primary)" />
                  <stop offset="100%" stopColor="var(--educational-accent)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-edu-primary mb-1">
                  {completionPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
                <div className="mt-2">
                  <Trophy className="w-6 h-6 text-edu-accent mx-auto" />
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-2">
            {getMotivationalMessage(completionPercentage)}
          </h3>
          <p className="text-muted-foreground">
            You've completed {progress.completedLessons} out of {progress.totalLessons || 0} lessons
          </p>
        </div>

        {/* Progress Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current Streak */}
          <div className="text-center p-4 bg-edu-success/10 border border-edu-success/20 rounded-xl">
            <div className="w-12 h-12 bg-edu-success/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-edu-success" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {progress.currentStreak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>

          {/* Time Spent */}
          <div className="text-center p-4 bg-edu-info/10 border border-edu-info/20 rounded-xl">
            <div className="w-12 h-12 bg-edu-info/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-edu-info" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {Math.round((progress.totalTimeSpent || 0) / 60)}h
            </div>
            <div className="text-sm text-muted-foreground">Time Spent</div>
          </div>

          {/* Current Level */}
          <div className="text-center p-4 bg-edu-warning/10 border border-edu-warning/20 rounded-xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${getLevelColor(progress.level)}`}>
              <Award className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {progress.level || 1}
            </div>
            <div className="text-sm text-muted-foreground">Current Level</div>
          </div>

          {/* Total Points */}
          <div className="text-center p-4 bg-edu-accent/10 border border-edu-accent/20 rounded-xl">
            <div className="w-12 h-12 bg-edu-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-edu-accent" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {progress.points || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
        </div>

        {/* Achievement Preview */}
        {progress.recentAchievements && progress.recentAchievements.length > 0 && (
          <div className="mt-6 p-4 bg-edu-primary/5 border border-edu-primary/10 rounded-xl">
            <div className="flex items-center mb-3">
              <Trophy className="w-5 h-5 text-edu-primary mr-2" />
              <span className="font-semibold text-edu-primary">Recent Achievement</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="w-6 h-6 text-edu-success mr-3" />
              <div>
                <div className="font-semibold text-foreground">
                  {progress.recentAchievements[0].name}
                </div>
                <div className="text-sm text-muted-foreground">
                  +{progress.recentAchievements[0].points} points earned
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar for Next Level */}
      <div className="bg-edu-course-bg border border-edu-course-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-edu-primary mr-2" />
            <span className="font-semibold text-foreground">Level Progress</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Level {progress.level || 1} → {(progress.level || 1) + 1}
          </span>
        </div>
        
        <div className="relative">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-edu-primary to-edu-accent rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${((progress.points || 0) % 1000) / 10}%` // Assuming 1000 points per level
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{(progress.points || 0) % 1000} points</span>
            <span>1000 points needed</span>
          </div>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="bg-edu-course-bg border border-edu-course-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-edu-accent mr-2" />
            <span className="font-semibold text-foreground">Weekly Goal</span>
          </div>
          <span className="text-sm text-edu-accent font-medium">
            {Math.min(progress.weeklyProgress || 0, 7)}/7 days
          </span>
        </div>
        
        <div className="flex space-x-1">
          {[...Array(7)].map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index < (progress.weeklyProgress || 0)
                  ? 'bg-edu-accent'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Keep your learning streak alive! Study for 7 days this week.
        </p>
      </div>
    </div>
  );
};

export default EnhancedProgressIndicator;
