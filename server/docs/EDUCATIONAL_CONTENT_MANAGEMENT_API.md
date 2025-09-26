# EthioHeritage360 Educational Content Management API Documentation

## Overview
This document provides comprehensive documentation for the Educational Content Management System APIs in EthioHeritage360. These APIs enable administrators and content managers to fully manage courses, lessons, enrollments, achievements, certificates, and educational content.

## Base URL
```
http://localhost:5000/api/learning
```

## Authentication
All admin endpoints require authentication via JWT token and admin role privileges.

### Headers Required:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## API Endpoints

---

## 1. Course Management APIs

### 1.1 Create Course
**Endpoint:** `POST /admin/courses`  
**Access:** Admin, Super Admin  
**Description:** Create a new course

#### Request Body:
```json
{
  "title": "Advanced Ethiopian History",
  "description": "Comprehensive course on Ethiopian history from ancient times to modern era",
  "category": "history",
  "difficulty": "advanced",
  "estimatedDuration": 120,
  "image": "https://example.com/course-image.jpg",
  "thumbnail": "https://example.com/course-thumbnail.jpg",
  "instructor": "Dr. Haile Selassie",
  "tags": ["history", "culture", "ancient civilization"],
  "prerequisites": ["Basic Ethiopian History", "Archaeological Foundations"]
}
```

#### Response:
```json
{
  "success": true,
  "message": "Course created successfully",
  "course": {
    "_id": "courseId",
    "title": "Advanced Ethiopian History",
    "description": "Comprehensive course...",
    "category": "history",
    "difficulty": "advanced",
    "estimatedDuration": 120,
    "isActive": true,
    "createdBy": "adminUserId",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 1.2 Get All Courses (Admin View)
**Endpoint:** `GET /admin/courses`  
**Access:** Admin, Super Admin  
**Description:** Get all courses with admin details and statistics

#### Query Parameters:
- `category` (string): Filter by category
- `difficulty` (string): Filter by difficulty level
- `status` (string): Filter by status ('active' or 'inactive')
- `search` (string): Search in title, description, instructor, tags
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)
- `sortBy` (string): Sort field (default: 'createdAt')
- `sortOrder` (string): Sort direction ('asc' or 'desc', default: 'desc')

#### Response:
```json
{
  "success": true,
  "courses": [
    {
      "_id": "courseId",
      "title": "Advanced Ethiopian History",
      "description": "Comprehensive course...",
      "category": "history",
      "difficulty": "advanced",
      "estimatedDuration": 120,
      "lessons": ["lessonId1", "lessonId2"],
      "createdBy": {
        "_id": "adminId",
        "name": "Admin Name",
        "email": "admin@example.com"
      },
      "stats": {
        "enrollments": 45,
        "completions": 12,
        "completionRate": 27,
        "totalLessons": 8
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "totalCourses": 45,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 1.3 Update Course
**Endpoint:** `PUT /admin/courses/:courseId`  
**Access:** Admin, Super Admin  
**Description:** Update an existing course

### 1.4 Delete Course
**Endpoint:** `DELETE /admin/courses/:courseId`  
**Access:** Admin, Super Admin  
**Description:** Delete or deactivate a course  
**Query Parameters:**
- `permanent` (string): Set to 'true' for permanent deletion

---

## 2. Lesson Management APIs

### 2.1 Create Lesson
**Endpoint:** `POST /admin/courses/:courseId/lessons`  
**Access:** Admin, Super Admin  
**Description:** Create a new lesson for a course

#### Request Body:
```json
{
  "title": "Introduction to Axum Civilization",
  "description": "Explore the ancient Axumite kingdom and its significance",
  "order": 1,
  "estimatedDuration": 45,
  "content": [
    {
      "type": "text",
      "content": "The Axumite Empire was a trading nation..."
    },
    {
      "type": "video",
      "url": "https://example.com/video.mp4",
      "title": "Axum Archaeological Sites"
    },
    {
      "type": "image",
      "url": "https://example.com/axum-stelae.jpg",
      "caption": "The famous Axum Stelae"
    }
  ],
  "objectives": [
    "Understand the historical significance of Axum",
    "Identify key archaeological findings",
    "Analyze Axum's role in ancient trade"
  ],
  "resources": [
    {
      "title": "Axum Research Paper",
      "type": "pdf",
      "url": "https://example.com/axum-research.pdf"
    }
  ],
  "quiz": {
    "questions": [
      {
        "question": "In which century did the Axumite Empire reach its peak?",
        "type": "multiple_choice",
        "options": [
          "3rd century CE",
          "4th century CE",
          "5th century CE",
          "6th century CE"
        ],
        "correctAnswer": 1,
        "points": 10
      }
    ],
    "passingScore": 70
  }
}
```

### 2.2 Get All Lessons (Admin View)
**Endpoint:** `GET /admin/lessons`  
**Access:** Admin, Super Admin  
**Description:** Get all lessons with filtering and statistics

#### Query Parameters:
- `courseId` (string): Filter by course ID
- `status` (string): Filter by status
- `search` (string): Search in title, description, objectives
- `page`, `limit`, `sortBy`, `sortOrder`: Pagination and sorting

### 2.3 Get Single Lesson (Admin View)
**Endpoint:** `GET /admin/lessons/:lessonId`  
**Access:** Admin, Super Admin  
**Description:** Get detailed lesson information with statistics

### 2.4 Bulk Update Lessons
**Endpoint:** `PATCH /admin/lessons/bulk`  
**Access:** Admin, Super Admin  
**Description:** Perform bulk operations on lessons

#### Request Body:
```json
{
  "lessonIds": ["lessonId1", "lessonId2", "lessonId3"],
  "operation": "activate", // or "deactivate", "delete", "update"
  "updateData": {
    "isActive": true
  }
}
```

### 2.5 Reorder Lessons
**Endpoint:** `PATCH /admin/courses/:courseId/lessons/reorder`  
**Access:** Admin, Super Admin  
**Description:** Reorder lessons within a course

#### Request Body:
```json
{
  "lessonOrders": [
    {
      "lessonId": "lessonId1",
      "newOrder": 1
    },
    {
      "lessonId": "lessonId2",
      "newOrder": 2
    }
  ]
}
```

---

## 3. Enrollment Management APIs

### 3.1 Get All Enrollments (Admin View)
**Endpoint:** `GET /admin/enrollments`  
**Access:** Admin, Super Admin  
**Description:** Get all enrollments with detailed filtering

#### Query Parameters:
- `courseId` (string): Filter by course
- `userId` (string): Filter by user
- `status` (string): Filter by enrollment status
- `enrollmentDate` (string): Filter by enrollment date (YYYY-MM-DD)
- `search` (string): Search in course title, user name/email
- `page`, `limit`, `sortBy`, `sortOrder`: Pagination and sorting

#### Response:
```json
{
  "success": true,
  "enrollments": [
    {
      "enrollmentId": "enrollmentId",
      "userId": "userId",
      "courseId": "courseId",
      "status": "in_progress",
      "enrolledAt": "2024-01-15T10:00:00.000Z",
      "progress": 65,
      "totalLessonsCompleted": 4,
      "user": {
        "_id": "userId",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      "course": {
        "_id": "courseId",
        "title": "Ethiopian History",
        "category": "history",
        "difficulty": "intermediate",
        "instructor": "Dr. Haile"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalEnrollments": 89
  }
}
```

### 3.2 Get Enrollment Analytics
**Endpoint:** `GET /admin/enrollments/analytics`  
**Access:** Admin, Super Admin  
**Description:** Get detailed enrollment analytics and trends

#### Query Parameters:
- `courseId` (string): Filter by course
- `timeRange` (string): Time range ('7d', '30d', '90d', '1y')

#### Response:
```json
{
  "success": true,
  "analytics": {
    "timeRange": "30d",
    "enrollmentTrends": [
      {
        "_id": "2024-01-15",
        "enrollments": 12,
        "completions": 3
      }
    ],
    "completionRates": [
      {
        "_id": "courseId",
        "courseTitle": "Ethiopian History",
        "totalEnrollments": 45,
        "completions": 12,
        "completionRate": 26.67,
        "averageProgress": 68.5
      }
    ],
    "userEngagement": {
      "totalActiveUsers": 245,
      "averageCoursesPerUser": 2.3,
      "averageCompletionRate": 0.34,
      "averageUserProgress": 72.1
    },
    "statusDistribution": [
      {
        "_id": "enrolled",
        "count": 120
      },
      {
        "_id": "in_progress",
        "count": 89
      },
      {
        "_id": "completed",
        "count": 45
      }
    ]
  }
}
```

### 3.3 Bulk Enrollment Operations
**Endpoint:** `PATCH /admin/enrollments/bulk`  
**Access:** Admin, Super Admin  
**Description:** Perform bulk operations on enrollments

#### Request Body Examples:

**Bulk Enroll Users:**
```json
{
  "operation": "enroll",
  "userIds": ["userId1", "userId2", "userId3"],
  "courseIds": ["courseId1", "courseId2"]
}
```

**Change Status:**
```json
{
  "operation": "changeStatus",
  "enrollmentIds": ["enrollmentId1", "enrollmentId2"],
  "newStatus": "completed"
}
```

**Reset Progress:**
```json
{
  "operation": "resetProgress",
  "enrollmentIds": ["enrollmentId1", "enrollmentId2"]
}
```

### 3.4 Get Enrollment Details
**Endpoint:** `GET /admin/enrollments/:userId/:courseId`  
**Access:** Admin, Super Admin  
**Description:** Get detailed enrollment information for specific user/course combination

---

## 4. Achievement Management APIs

### 4.1 Get All Achievements (Admin View)
**Endpoint:** `GET /admin/achievements`  
**Access:** Admin, Super Admin  
**Description:** Get all achievements with usage statistics

### 4.2 Create Achievement
**Endpoint:** `POST /admin/achievements`  
**Access:** Admin, Super Admin  
**Description:** Create a new achievement

#### Request Body:
```json
{
  "title": "Heritage Explorer",
  "description": "Complete 5 heritage-related courses",
  "type": "course_completion",
  "category": "heritage",
  "difficulty": "intermediate",
  "criteria": {
    "type": "course_completion",
    "requiredCount": 5,
    "categoryFilter": "heritage"
  },
  "reward": {
    "points": 100,
    "badge": "Heritage Explorer Badge",
    "certificate": false
  },
  "icon": "https://example.com/achievement-icon.svg",
  "badge": "https://example.com/achievement-badge.png"
}
```

### 4.3 Update Achievement
**Endpoint:** `PUT /admin/achievements/:achievementId`  
**Access:** Admin, Super Admin

### 4.4 Delete Achievement
**Endpoint:** `DELETE /admin/achievements/:achievementId`  
**Access:** Admin, Super Admin  
**Query Parameters:**
- `permanent` (string): Set to 'true' for permanent deletion

---

## 5. Certificate Management APIs

### 5.1 Get All Certificates (Admin View)
**Endpoint:** `GET /admin/certificates`  
**Access:** Admin, Super Admin  
**Description:** Get all certificates with detailed information

#### Query Parameters:
- `userId` (string): Filter by user
- `courseId` (string): Filter by course
- `status` (string): Filter by certificate status
- `issuedDate` (string): Filter by issued date
- `search` (string): Search in user name/email, course title, certificate ID

### 5.2 Revoke Certificate
**Endpoint:** `PATCH /admin/certificates/:certificateId/revoke`  
**Access:** Admin, Super Admin  
**Description:** Revoke an issued certificate

#### Request Body:
```json
{
  "reason": "Policy violation - plagiarism detected"
}
```

### 5.3 Regenerate Certificate
**Endpoint:** `PATCH /admin/certificates/:certificateId/regenerate`  
**Access:** Admin, Super Admin  
**Description:** Regenerate certificate with new verification hash

---

## 6. Category Management APIs

### 6.1 Get Category Management Data
**Endpoint:** `GET /admin/categories`  
**Access:** Admin, Super Admin  
**Description:** Get category statistics and management data

#### Response:
```json
{
  "success": true,
  "categories": {
    "courses": [
      {
        "_id": "history",
        "totalCourses": 15,
        "averageDifficulty": 2.1,
        "averageDuration": 95
      }
    ],
    "enrollments": [
      {
        "_id": "history",
        "totalEnrollments": 245,
        "completions": 87,
        "completionRate": 35.5
      }
    ],
    "achievements": [
      {
        "_id": "heritage",
        "totalAchievements": 8,
        "averageDifficulty": 1.8
      }
    ]
  }
}
```

---

## 7. Dashboard Statistics API

### 7.1 Get Admin Statistics
**Endpoint:** `GET /admin/stats`  
**Access:** Admin, Super Admin  
**Description:** Get comprehensive dashboard statistics

#### Response:
```json
{
  "success": true,
  "stats": {
    "courses": {
      "total": 45,
      "active": 42,
      "inactive": 3
    },
    "lessons": {
      "total": 287,
      "active": 275,
      "inactive": 12
    },
    "users": {
      "total": 1245,
      "activeThisWeek": 234
    },
    "enrollments": {
      "total": 2856,
      "completed": 945,
      "completionRate": 33
    },
    "distribution": {
      "byCategory": [
        {
          "_id": "history",
          "count": 15
        },
        {
          "_id": "culture",
          "count": 12
        }
      ],
      "byDifficulty": [
        {
          "_id": "beginner",
          "count": 18
        },
        {
          "_id": "intermediate",
          "count": 20
        },
        {
          "_id": "advanced",
          "count": 7
        }
      ]
    }
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: title, description, category, estimatedDuration"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin role required.",
  "userRole": "user"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Course not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Course with this title already exists"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many admin requests. Maximum 100 requests per 15 minutes.",
  "retryAfter": 120
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to create course"
}
```

---

## Rate Limiting

Admin endpoints are rate-limited to prevent abuse:
- **Default Limit:** 100 requests per 15 minutes per user/IP
- **Headers:** Rate limit information is provided in response headers
- **Exceeded Limit:** Returns 429 status with retry information

---

## Audit Logging

All admin actions are automatically logged for audit purposes:
- User information (ID, email, role)
- Action performed
- Timestamp
- IP address and user agent
- Request details
- Response status

---

## Data Validation

### Course Data Validation:
- `title`: Required, string, 1-200 characters
- `description`: Required, string, 10-2000 characters
- `category`: Required, string, predefined categories
- `difficulty`: Optional, enum: ['beginner', 'intermediate', 'advanced']
- `estimatedDuration`: Required, number, 1-1000 minutes
- `tags`: Optional, array of strings
- `prerequisites`: Optional, array of strings

### Lesson Data Validation:
- `title`: Required, string, 1-200 characters
- `description`: Required, string, 10-2000 characters
- `order`: Required, number, positive integer
- `estimatedDuration`: Required, number, 1-300 minutes
- `content`: Optional, array of content objects
- `objectives`: Optional, array of strings
- `quiz`: Optional, quiz object with questions

### Achievement Data Validation:
- `title`: Required, string, 1-100 characters
- `description`: Required, string, 10-500 characters
- `type`: Required, string, predefined types
- `criteria`: Required, object with validation rules
- `reward`: Optional, reward object

---

## Best Practices

1. **Authentication**: Always include valid JWT token in Authorization header
2. **Error Handling**: Check response status and handle errors appropriately
3. **Pagination**: Use pagination for large datasets to improve performance
4. **Filtering**: Use query parameters to filter results and reduce bandwidth
5. **Rate Limiting**: Respect rate limits and implement retry logic with exponential backoff
6. **Data Validation**: Validate data on client-side before sending to API
7. **Bulk Operations**: Use bulk endpoints for multiple operations to improve efficiency
8. **Audit Trail**: All admin actions are logged - be mindful of sensitive operations

---

## Support

For API support or questions, contact the development team or refer to the project documentation.

Last Updated: January 2024  
Version: 1.0.0
