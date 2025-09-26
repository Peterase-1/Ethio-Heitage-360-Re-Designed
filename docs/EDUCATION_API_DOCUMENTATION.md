# EthioHeritage360 - Educational API Endpoints Documentation

This document provides a comprehensive guide to all educational API endpoints in the EthioHeritage360 platform.

## Overview

The educational system consists of multiple route files providing different functionality:

1. **`/api`** - New education API routes matching frontend `educationService`
2. **`/api/education`** - Comprehensive education management API
3. **`/api/learning`** - Learning and progress tracking API
4. **`/api/visitor`** - Public visitor educational content
5. **`/api/student`** - Student dashboard and analytics

## 1. Frontend Education Service API Routes (`/api`)

These endpoints match exactly with the frontend `educationService.js` expectations:

### Courses

#### GET `/api/courses`
Get all courses with filters
- **Query Parameters:**
  - `category` (optional) - Filter by category
  - `difficulty` (optional) - Filter by difficulty  
  - `search` (optional) - Search in title/description/instructor
  - `limit` (optional, default: 12) - Number of courses per page
  - `page` (optional, default: 1) - Page number
- **Authentication:** Not required
- **Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": "course_id",
      "title": "Course Title",
      "description": "Course description",
      "category": "history",
      "difficulty": "beginner",
      "image": "/images/course.jpg",
      "instructor": "Dr. John Smith",
      "rating": 4.5,
      "enrollmentCount": 150,
      "price": 0,
      "duration": 240,
      "isFeatured": false
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3,
  "message": "Courses retrieved successfully"
}
```

#### GET `/api/courses/featured`
Get featured courses
- **Authentication:** Not required
- **Response:**
```json
{
  "success": true,
  "courses": [...],
  "message": "Featured courses retrieved successfully"
}
```

#### GET `/api/courses/categories`
Get course categories with counts
- **Authentication:** Not required
- **Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "history",
      "name": "History",
      "description": "Explore Ethiopia's rich historical heritage",
      "icon": "history",
      "color": "#8B4513",
      "courseCount": 12,
      "averageRating": 4.3
    }
  ],
  "message": "Categories retrieved successfully"
}
```

#### GET `/api/courses/:courseId`
Get single course details
- **Authentication:** Not required
- **Response:**
```json
{
  "success": true,
  "course": {
    "id": "course_id",
    "title": "Course Title",
    "description": "Detailed description",
    "category": "history",
    "difficulty": "intermediate",
    "image": "/images/course.jpg",
    "instructor": "Dr. Jane Doe",
    "instructorEmail": "jane@example.com",
    "rating": 4.7,
    "enrollmentCount": 85,
    "price": 0,
    "duration": 360,
    "lessonsCount": 12,
    "objectives": ["Learn about...", "Understand..."],
    "prerequisites": ["Basic knowledge of..."],
    "materials": [...],
    "completionRate": 78,
    "language": "English",
    "certificate": true,
    "status": "published",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  },
  "message": "Course retrieved successfully"
}
```

#### POST `/api/courses/:courseId/enroll`
Enroll in a course
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "enrollment": {
    "courseId": "course_id",
    "userId": "user_id",
    "enrolledAt": "2024-01-20T00:00:00.000Z",
    "status": "enrolled"
  },
  "message": "Successfully enrolled in course"
}
```

#### PUT `/api/courses/:courseId/progress`
Update course progress
- **Authentication:** Required
- **Body:**
```json
{
  "progress": 75
}
```
- **Response:**
```json
{
  "success": true,
  "progress": {
    "courseId": "course_id",
    "progressPercentage": 75,
    "status": "in_progress",
    "completedAt": null
  },
  "message": "Progress updated successfully"
}
```

### User Learning Data

#### GET `/api/user/courses/enrolled`
Get user's enrolled courses
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": "course_id",
      "title": "Course Title",
      "description": "Course description",
      "category": "history",
      "difficulty": "beginner",
      "image": "/images/course.jpg",
      "instructor": "Dr. Smith",
      "rating": 4.5,
      "duration": 240,
      "progress": 45,
      "status": "in_progress",
      "enrolledAt": "2024-01-15T00:00:00.000Z",
      "lastAccessed": "2024-01-20T00:00:00.000Z",
      "completedLessons": 5,
      "totalLessons": 12
    }
  ],
  "message": "Enrolled courses retrieved successfully"
}
```

#### GET `/api/user/courses/completed`
Get user's completed courses
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": "course_id",
      "title": "Course Title",
      "description": "Course description",
      "category": "history",
      "difficulty": "beginner",
      "image": "/images/course.jpg",
      "instructor": "Dr. Smith",
      "rating": 4.5,
      "duration": 240,
      "progress": 100,
      "status": "completed",
      "enrolledAt": "2024-01-01T00:00:00.000Z",
      "completedAt": "2024-01-15T00:00:00.000Z",
      "completedLessons": 12,
      "totalLessons": 12,
      "finalScore": 87.5
    }
  ],
  "message": "Completed courses retrieved successfully"
}
```

#### GET `/api/user/learning/stats`
Get user learning statistics
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "stats": {
    "totalCoursesEnrolled": 5,
    "completedCourses": 2,
    "certificatesEarned": 2,
    "totalHoursLearned": 12.5,
    "averageProgress": 68,
    "currentStreak": 5,
    "totalLessonsCompleted": 45,
    "averageScore": 82.3,
    "lastActivityDate": "2024-01-20T00:00:00.000Z",
    "longestStreak": 12,
    "totalTimeSpent": 750
  },
  "message": "Learning statistics retrieved successfully"
}
```

### Certificates

#### GET `/api/user/certificates`
Get user's certificates
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "certificates": [
    {
      "id": "cert_id",
      "courseId": "course_id",
      "courseTitle": "Ethiopian History Fundamentals",
      "courseCategory": "history",
      "instructor": "Dr. Smith",
      "earnedDate": "2024-01-15T00:00:00.000Z",
      "verificationCode": "EH360-CERT-ABC123",
      "certificateUrl": "/certificates/cert_id",
      "grade": "Pass",
      "validUntil": null,
      "skills": ["Historical Research", "Critical Thinking"]
    }
  ],
  "message": "Certificates retrieved successfully"
}
```

#### GET `/api/certificates/:certificateId/download`
Download certificate
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "certificate": {
    "id": "cert_id",
    "courseTitle": "Ethiopian History Fundamentals",
    "studentName": "John Doe",
    "earnedDate": "2024-01-15T00:00:00.000Z",
    "verificationCode": "EH360-CERT-ABC123",
    "instructor": "Dr. Smith"
  },
  "message": "Certificate data retrieved for download"
}
```

### Study Guides

#### GET `/api/study-guides`
Get study guides
- **Authentication:** Optional
- **Response:**
```json
{
  "success": true,
  "guides": [
    {
      "id": "1",
      "title": "Ethiopian History Study Guide",
      "description": "Comprehensive guide covering ancient to modern Ethiopian history",
      "category": "history",
      "topics": ["Ancient Civilizations", "Medieval Period", "Modern History"],
      "difficulty": "intermediate",
      "estimatedTime": 120,
      "downloadUrl": "/downloads/ethiopian-history-guide.pdf",
      "lastUpdated": "2024-01-15T00:00:00.000Z"
    }
  ],
  "message": "Study guides retrieved successfully"
}
```

### Educational Tours

#### GET `/api/tours/educational`
Get educational tours
- **Authentication:** Optional
- **Response:**
```json
{
  "success": true,
  "tours": [
    {
      "id": "tour_id",
      "title": "Lalibela Heritage Tour",
      "description": "Explore the rock churches of Lalibela",
      "category": "historical",
      "duration": "3 days",
      "price": 2500,
      "difficulty": "moderate",
      "highlights": ["Rock Churches", "Local Culture", "Historical Sites"],
      "images": ["/images/lalibela1.jpg"],
      "rating": 4.8,
      "bookingCount": 45,
      "type": "educational"
    }
  ],
  "message": "Educational tours retrieved successfully"
}
```

## 2. Existing Education Management API (`/api/education`)

Comprehensive backend education management with advanced features:

### Course Management
- `GET /api/education/courses` - Get courses for organizer
- `GET /api/education/courses/:id` - Get specific course  
- `POST /api/education/courses` - Create new course (with image upload)
- `PUT /api/education/courses/:id` - Update course (with image upload)
- `DELETE /api/education/courses/:id` - Delete course (soft delete)
- `GET /api/education/public/courses` - Public course listing

### Lesson Management
- `GET /api/education/courses/:courseId/lessons` - Get course lessons
- `GET /api/education/lessons/:id` - Get specific lesson
- `POST /api/education/courses/:courseId/lessons` - Create lesson (with media upload)
- `PUT /api/education/lessons/:id` - Update lesson (with media upload)
- `DELETE /api/education/lessons/:id` - Delete lesson
- `PUT /api/education/courses/:courseId/lessons/reorder` - Reorder lessons
- `POST /api/education/lessons/:id/duplicate` - Duplicate lesson

### Progress Tracking
- `GET /api/education/courses/:courseId/progress/:userId` - Get course progress
- `POST /api/education/lessons/:lessonId/start` - Mark lesson as started
- `POST /api/education/lessons/:lessonId/complete` - Mark lesson as completed
- `PUT /api/education/lessons/:lessonId/progress` - Update lesson progress
- `POST /api/education/lessons/:lessonId/reset` - Reset lesson progress
- `GET /api/education/students/:userId/progress/overall` - Get overall progress

### Assignments
- `POST /api/education/assignments/:assignmentId/submit` - Submit assignment
- `GET /api/education/assignments/:assignmentId/submissions` - List submissions
- `PUT /api/education/assignments/:assignmentId/submissions/:submissionId/grade` - Grade submission

### Discussions
- `POST /api/education/discussions/:discussionId/posts` - Add discussion post
- `POST /api/education/discussions/:discussionId/posts/:postId/replies` - Reply to post
- `POST /api/education/discussions/:discussionId/posts/:postId/like` - Like/unlike post

### Enrollment
- `POST /api/education/courses/:courseId/enroll` - Enroll in course
- `GET /api/education/courses/:courseId/enrollment/:userId` - Get enrollment status

### Dashboard & Analytics
- `GET /api/education/dashboard/summary` - Get dashboard summary
- `GET /api/education/stats/quick` - Get quick stats
- `GET /api/education/courses/:courseId/analytics/progress` - Get progress analytics

## 3. Learning API (`/api/learning`)

Public and authenticated learning features:

### Course Access
- `GET /api/learning/courses` - Get available courses
- `GET /api/learning/courses/:courseId` - Get course details
- `GET /api/learning/courses/:courseId/lessons` - Get course lessons
- `GET /api/learning/lessons/:lessonId` - Get lesson details

### Progress & Achievements
- `GET /api/learning/progress` - Get learning progress (optional auth)
- `GET /api/learning/achievements` - Get achievements (optional auth)
- `GET /api/learning/recommendations` - Get course recommendations (optional auth)
- `GET /api/learning/stats` - Get dashboard statistics (optional auth)

### Authenticated Learning
- `POST /api/learning/lessons/:lessonId/start` - Start lesson (auth required)
- `POST /api/learning/lessons/:lessonId/complete` - Complete lesson (auth required)
- `POST /api/learning/quizzes/:quizId/submit` - Submit quiz (auth required)

### Enrollment
- `POST /api/learning/courses/:courseId/enroll` - Enroll in course (auth required)
- `GET /api/learning/enrollments` - Get user enrollments (auth required)
- `DELETE /api/learning/courses/:courseId/unenroll` - Unenroll from course (auth required)

### Certificates
- `POST /api/learning/courses/:courseId/certificate` - Generate certificate (auth required)
- `GET /api/learning/certificates` - Get user certificates (auth required)
- `GET /api/learning/verify/:verificationCode` - Verify certificate (public)

## 4. Visitor API (`/api/visitor`)

Public educational content for visitors:

### Dashboard
- `GET /api/visitor/dashboard` - Public visitor dashboard with:
  - Featured courses, museums, artifacts, tours
  - Upcoming events
  - Platform statistics
  - Categories exploration
  - Quick actions
  - Testimonials

### Content Exploration  
- `GET /api/visitor/explore` - Explore content by category/type
- `GET /api/visitor/search` - Search across all content
- `GET /api/visitor/featured` - Get featured content

## 5. Student Dashboard API (`/api/student`)

Comprehensive student analytics and management:

### Dashboard
- `GET /api/student/dashboard/:userId` - Complete student dashboard with:
  - User profile and learning stats
  - Current courses and progress
  - Recent activity and achievements
  - Upcoming deadlines
  - Course recommendations
  - Weekly goals tracking

### Analytics
- `GET /api/student/analytics/:userId` - Detailed learning analytics
- `GET /api/student/profile/:userId` - Enhanced student profile
- `PUT /api/student/profile/:userId/learning-preferences` - Update learning preferences

### Achievements
- `GET /api/student/achievements/:userId` - Student achievements and badges

### Study Planning
- `GET /api/student/study-plan/:userId` - Personalized study plan

## Authentication & Authorization

### Authentication Requirements:
- **Public Routes:** Course listing, visitor dashboard, public course details
- **Optional Auth:** Learning progress, achievements (shows mock data if not authenticated)  
- **Required Auth:** Enrollment, progress updates, certificates, user-specific data

### Authorization Levels:
- **Visitor:** Public content access
- **User:** Course enrollment, progress tracking, certificates
- **Organizer:** Course creation and management
- **Admin:** Full system access and analytics

## Error Handling

All endpoints follow consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)",
  "code": "ERROR_CODE (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., already enrolled)
- `500` - Internal Server Error

## Rate Limiting

All API endpoints are subject to rate limiting:
- 100 requests per 15-minute window per IP address
- Authenticated requests may have higher limits

## CORS Configuration

The API accepts requests from:
- `http://localhost:5173-5176` (development)
- `http://127.0.0.1:5173-5176` (development)

## Data Models

### Course Object
```json
{
  "id": "string",
  "title": "string", 
  "description": "string",
  "category": "string",
  "difficulty": "beginner|intermediate|advanced",
  "image": "string",
  "instructor": "string",
  "rating": "number",
  "enrollmentCount": "number",
  "price": "number",
  "duration": "number (minutes)",
  "lessonsCount": "number",
  "objectives": ["string"],
  "prerequisites": ["string"],
  "status": "draft|published|archived"
}
```

### Learning Progress Object
```json
{
  "courseId": "string",
  "progressPercentage": "number",
  "status": "enrolled|in_progress|completed",
  "enrolledAt": "date",
  "completedAt": "date|null",
  "completedLessons": "number",
  "totalLessons": "number"
}
```

### Certificate Object  
```json
{
  "id": "string",
  "courseId": "string",
  "courseTitle": "string",
  "earnedDate": "date",
  "verificationCode": "string",
  "grade": "string",
  "skills": ["string"]
}
```

This comprehensive API documentation covers all educational functionality in the EthioHeritage360 platform, ensuring seamless integration between frontend and backend systems.
