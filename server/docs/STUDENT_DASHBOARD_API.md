# Student Dashboard API Documentation

This document describes the comprehensive student dashboard API endpoints that integrate learning management with user profile functionality.

## Overview

The Student Dashboard API provides comprehensive learning analytics, progress tracking, achievements, and personalized recommendations for students using the EthioHeritage360 platform.

## Base URL
```
http://localhost:5000/api/student
```

## Authentication
All endpoints require authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Main Student Dashboard

**GET** `/dashboard/:userId`

Retrieves comprehensive dashboard data for a student including profile, learning statistics, current courses, recent activity, achievements, and recommendations.

#### Parameters
- `userId` (string, required) - The student's user ID

#### Response Structure
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar": "string",
      "bio": "string",
      "interests": ["string"],
      "memberSince": "datetime",
      "lastLogin": "datetime",
      "profileViews": "number"
    },
    "learningStats": {
      "totalCourses": "number",
      "completedCourses": "number", 
      "inProgressCourses": "number",
      "totalLessonsCompleted": "number",
      "totalTimeSpent": "number",
      "currentStreak": "number",
      "longestStreak": "number",
      "averageScore": "number",
      "totalAchievements": "number",
      "learningLevel": "number",
      "nextLevelProgress": "number"
    },
    "currentCourses": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "category": "string",
        "difficulty": "string",
        "image": "string",
        "instructor": "string",
        "progress": "number",
        "status": "string",
        "enrolledAt": "datetime",
        "lastAccessed": "datetime",
        "nextLesson": "string",
        "completedLessons": "number",
        "totalLessons": "number",
        "estimatedTimeToComplete": "number"
      }
    ],
    "upcomingDeadlines": [
      {
        "id": "string",
        "title": "string",
        "courseTitle": "string",
        "dueDate": "datetime",
        "type": "string",
        "points": "number",
        "daysUntilDue": "number",
        "isSubmitted": "boolean"
      }
    ],
    "recommendations": {
      "courses": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "category": "string",
          "difficulty": "string",
          "image": "string",
          "instructor": "string",
          "rating": "number",
          "enrollmentCount": "number",
          "estimatedDuration": "number",
          "price": "number",
          "matchReason": "string"
        }
      ],
      "topics": ["string"]
    },
    "recentActivity": {
      "courses": [
        {
          "id": "string",
          "title": "string",
          "action": "string",
          "date": "datetime",
          "progress": "number"
        }
      ],
      "achievements": [
        {
          "type": "string",
          "title": "string",
          "description": "string",
          "earnedAt": "datetime",
          "badge": "string"
        }
      ],
      "completedLessons": [
        {
          "lessonId": "string",
          "courseId": "string",
          "courseTitle": "string",
          "completedAt": "datetime",
          "score": "number",
          "timeSpent": "number"
        }
      ]
    },
    "weeklyGoals": {
      "lessonsTarget": "number",
      "lessonsCompleted": "number",
      "timeTarget": "number",
      "timeSpent": "number",
      "progressPercentage": "number"
    },
    "achievements": [
      {
        "type": "string",
        "title": "string",
        "description": "string",
        "earnedAt": "datetime",
        "category": "string"
      }
    ]
  }
}
```

#### Example Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60a7b1234567890123456789",
      "name": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "avatar": "https://example.com/avatars/sarah.jpg",
      "bio": "Passionate learner interested in Ethiopian heritage and culture",
      "interests": ["Ancient History", "Art & Culture", "Archaeology"],
      "memberSince": "2023-01-15T10:30:00Z",
      "lastLogin": "2024-01-20T15:45:30Z",
      "profileViews": 156
    },
    "learningStats": {
      "totalCourses": 3,
      "completedCourses": 1,
      "inProgressCourses": 2,
      "totalLessonsCompleted": 23,
      "totalTimeSpent": 840,
      "currentStreak": 5,
      "longestStreak": 12,
      "averageScore": 85.5,
      "totalAchievements": 8,
      "learningLevel": 3,
      "nextLevelProgress": 30
    }
  }
}
```

### 2. Learning Analytics

**GET** `/analytics/:userId?period=30d`

Retrieves detailed learning analytics and performance data for a specified time period.

#### Parameters
- `userId` (string, required) - The student's user ID
- `period` (string, optional) - Time period for analytics. Options: `7d`, `30d`, `90d`, `1y`. Default: `30d`

#### Response Structure
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTime": "number",
      "completedLessons": "number", 
      "averageScore": "number",
      "activeStreak": "number",
      "totalCourses": "number",
      "completedCourses": "number",
      "inProgressCourses": "number"
    },
    "timeSpent": {
      "daily": [
        {
          "date": "string",
          "timeSpent": "number",
          "lessonsCompleted": "number"
        }
      ]
    },
    "performance": {
      "byCategory": {
        "categoryName": {
          "timeSpent": "number",
          "averageScore": "number",
          "courses": "number",
          "completedLessons": "number"
        }
      },
      "byDifficulty": {
        "difficultyLevel": {
          "timeSpent": "number",
          "averageScore": "number", 
          "courses": "number",
          "completedLessons": "number"
        }
      }
    },
    "engagement": {
      "studyDays": "number",
      "averageSessionTime": "number",
      "mostActiveHour": "string",
      "consistencyScore": "number"
    },
    "courses": [
      {
        "id": "string",
        "title": "string",
        "category": "string",
        "difficulty": "string",
        "progress": "number",
        "status": "string",
        "timeSpent": "number",
        "averageScore": "number",
        "completedLessons": "number",
        "totalLessons": "number"
      }
    ]
  }
}
```

### 3. Enhanced Student Profile

**GET** `/profile/:userId`

Retrieves enhanced student profile with integrated learning data.

#### Parameters
- `userId` (string, required) - The student's user ID

#### Response Structure
```json
{
  "success": true,
  "data": {
    "personal": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "fullName": "string",
      "email": "string",
      "phone": "string",
      "avatar": "string",
      "bio": "string",
      "dateOfBirth": "datetime",
      "nationality": "string",
      "languages": ["string"],
      "interests": ["string"],
      "memberSince": "datetime",
      "lastLogin": "datetime"
    },
    "learning": {
      "stats": {
        "totalCourses": "number",
        "completedCourses": "number",
        "inProgressCourses": "number",
        "totalLessonsCompleted": "number",
        "totalTimeSpent": "number",
        "averageScore": "number",
        "currentStreak": "number",
        "longestStreak": "number",
        "level": "number"
      },
      "preferences": {
        "preferredCategories": ["string"],
        "difficulty": "string",
        "studyReminders": "boolean",
        "weeklyGoal": "number"
      },
      "recentCourses": [
        {
          "id": "string",
          "title": "string",
          "category": "string",
          "image": "string",
          "progress": "number",
          "status": "string",
          "enrolledAt": "datetime"
        }
      ],
      "achievements": [
        {
          "type": "string",
          "title": "string", 
          "description": "string",
          "earnedAt": "datetime"
        }
      ]
    },
    "social": {
      "profileViews": "number",
      "followers": "number",
      "following": "number",
      "isPublicProfile": "boolean"
    },
    "preferences": {
      "language": "string",
      "timezone": "string",
      "notifications": {
        "email": "boolean",
        "push": "boolean",
        "reminders": "boolean"
      },
      "privacy": {
        "profileVisibility": "string",
        "showEmail": "boolean",
        "showPhone": "boolean"
      },
      "dashboard": {
        "theme": "string",
        "defaultView": "string"
      }
    }
  }
}
```

### 4. Update Learning Preferences

**PUT** `/profile/:userId/learning-preferences`

Updates student's learning preferences including categories, difficulty, goals, and notifications.

#### Parameters
- `userId` (string, required) - The student's user ID

#### Request Body
```json
{
  "preferredCategories": ["string"],
  "difficulty": "string",
  "weeklyGoal": "number",
  "studyReminders": "boolean",
  "notifications": {
    "email": "boolean",
    "push": "boolean",
    "reminders": "boolean"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Learning preferences updated successfully"
}
```

### 5. Achievements and Gamification

**GET** `/achievements/:userId`

Retrieves student achievements, badges, and gamification progress.

#### Parameters
- `userId` (string, required) - The student's user ID

#### Response Structure
```json
{
  "success": true,
  "data": {
    "learning": [
      {
        "type": "string",
        "title": "string",
        "description": "string",
        "earnedAt": "datetime",
        "category": "string",
        "badge": "string"
      }
    ],
    "platform": [
      {
        "type": "string",
        "title": "string",
        "description": "string",
        "earnedAt": "datetime",
        "category": "string"
      }
    ],
    "stats": {
      "totalAchievements": "number",
      "recentAchievements": [
        {
          "type": "string",
          "title": "string",
          "earnedAt": "datetime",
          "source": "string"
        }
      ],
      "categories": {
        "learning": "number",
        "social": "number",
        "exploration": "number",
        "achievement": "number"
      }
    },
    "progress": {
      "nextMilestones": [
        {
          "type": "string",
          "current": "number",
          "target": "number",
          "reward": "string"
        }
      ]
    }
  }
}
```

### 6. Study Planner

**GET** `/study-plan/:userId`

Generates personalized weekly study plan based on enrolled courses and learning goals.

#### Parameters
- `userId` (string, required) - The student's user ID

#### Response Structure
```json
{
  "success": true,
  "data": {
    "weeklyPlan": [
      {
        "day": "string",
        "course": {
          "id": "string",
          "title": "string",
          "category": "string"
        },
        "suggestedDuration": "number",
        "tasks": ["string"],
        "priority": "string"
      }
    ],
    "goals": {
      "weekly": {
        "timeGoal": "number",
        "lessonsGoal": "number",
        "coursesToFocus": "number"
      },
      "progress": {
        "completedThisWeek": "number",
        "timeSpentThisWeek": "number",
        "onTrack": "boolean"
      }
    },
    "recommendations": {
      "action": "string",
      "message": "string",
      "suggestedCourses": ["object"],
      "studyTips": ["string"]
    }
  }
}
```

## Enhanced User Profile Routes

The existing `/api/user` routes have been enhanced to include learning data:

### GET `/api/user/profile`
Returns user profile with integrated learning statistics.

### PUT `/api/user/profile` 
Updates user profile with validation.

### GET `/api/user/dashboard`
Returns basic dashboard with learning data if available.

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user/resource not found)
- `500` - Internal Server Error

## Usage Examples

### Getting Student Dashboard Data
```javascript
const response = await fetch('/api/student/dashboard/60a7b1234567890123456789', {
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json'
  }
});
const dashboardData = await response.json();
```

### Updating Learning Preferences
```javascript
const response = await fetch('/api/student/profile/60a7b1234567890123456789/learning-preferences', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    preferredCategories: ['history', 'art'],
    difficulty: 'intermediate',
    weeklyGoal: 240,
    studyReminders: true
  })
});
```

### Fetching Learning Analytics
```javascript
const response = await fetch('/api/student/analytics/60a7b1234567890123456789?period=30d', {
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json'
  }
});
const analytics = await response.json();
```

## Integration with Frontend

These APIs are designed to work with modern frontend frameworks like React, Vue, or Angular. The comprehensive data structures provide everything needed for:

- Student dashboard components
- Learning progress visualizations
- Achievement displays
- Course recommendation systems
- Study planning interfaces
- Analytics dashboards

## Notes

- All datetime fields are in ISO 8601 format
- User authentication is required for all endpoints
- The API supports CORS for localhost development
- Rate limiting is applied (100 requests per 15 minutes per IP)
- All responses include success/error status for consistent handling
