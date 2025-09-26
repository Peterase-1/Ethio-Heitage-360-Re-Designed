# Course Publishing Workflow Documentation

## Overview

The course publishing feature allows organizers to create courses in draft mode, then publish them to make them visible to students on the public courses page. This document outlines the complete workflow and API endpoints involved.

## Workflow Steps

### 1. Course Creation (Draft Status)

When organizers create a course, it starts in `draft` status:

```javascript
// POST /api/organizer/courses
{
  "title": "Ethiopian Heritage Course",
  "description": "A comprehensive course about Ethiopian heritage",
  "category": "Ethiopian History",
  "difficulty": "Beginner",
  "duration": 4,
  "maxStudents": 25,
  "price": 0,
  "instructor": "Dr. John Smith"
}
```

Response:
```javascript
{
  "success": true,
  "data": {
    "_id": "courseId",
    "title": "Ethiopian Heritage Course",
    "status": "draft",
    // ... other course properties
  },
  "message": "Course created successfully"
}
```

### 2. Course Publishing

Organizers can publish their draft or pending courses:

```javascript
// POST /api/organizer/courses/:id/publish
```

**Prerequisites:**
- Course must be in `draft` or `pending` status
- Organizer must own the course
- User must be authenticated with `organizer` role

**Response (Success):**
```javascript
{
  "success": true,
  "data": {
    "_id": "courseId",
    "title": "Ethiopian Heritage Course",
    "status": "published",
    "publishedAt": "2024-03-01T10:30:00Z",
    // ... other course properties
  },
  "message": "Course published successfully and is now visible to students"
}
```

**Error Responses:**
- `404`: Course not found or not owned by organizer
- `400`: Course not in draft/pending status
- `401`: Unauthorized access
- `403`: Insufficient permissions

### 3. Public Visibility

Once published, courses appear in the public courses API:

```javascript
// GET /api/education/public/courses
```

This endpoint returns only published courses (`status: 'published'`) and is accessible without authentication.

## API Endpoints

### Organizer Endpoints (Protected)

All organizer endpoints require authentication and `organizer` role:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizer/courses` | Get all courses for organizer |
| GET | `/api/organizer/courses/:id` | Get specific course |
| POST | `/api/organizer/courses` | Create new course (draft) |
| PUT | `/api/organizer/courses/:id` | Update course |
| DELETE | `/api/organizer/courses/:id` | Delete course |
| POST | `/api/organizer/courses/:id/submit-for-approval` | Submit course for approval |
| **POST** | **`/api/organizer/courses/:id/publish`** | **Publish course** |

### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/education/public/courses` | Get published courses for public view |

## Database Schema Changes

The Course model includes the following status-related fields:

```javascript
{
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
    required: false
  },
  // ... other fields
}
```

## Course Status Flow

```
draft → publish() → published
  ↓
pending → publish() → published
```

- **draft**: Course is being created/edited by organizer
- **pending**: Course submitted for approval (optional workflow)
- **published**: Course is live and visible to students
- **archived**: Course is no longer active (future feature)

## Security Considerations

1. **Authorization**: Only course owners can publish their courses
2. **Status Validation**: Prevents publishing already published courses
3. **Role-based Access**: Only organizers can access publishing endpoints
4. **Data Integrity**: publishedAt timestamp is set automatically

## Frontend Integration

### Organizer Dashboard

The organizer dashboard should display:

```javascript
// Course list with status indicators
courses.forEach(course => {
  switch(course.status) {
    case 'draft':
      // Show "Publish" button
      break;
    case 'pending':
      // Show "Publish" button and "Pending Approval" status
      break;
    case 'published':
      // Show "Published" status and publish date
      break;
  }
});
```

### Publish Button Implementation

```javascript
const publishCourse = async (courseId) => {
  try {
    const response = await fetch(`/api/organizer/courses/${courseId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update UI to show published status
      showSuccessMessage(result.message);
      refreshCourseList();
    } else {
      showErrorMessage(result.message);
    }
  } catch (error) {
    showErrorMessage('Failed to publish course');
  }
};
```

### Public Courses Page

The public courses page automatically shows only published courses:

```javascript
const loadPublicCourses = async () => {
  try {
    const response = await fetch('/api/education/public/courses');
    const result = await response.json();
    
    if (result.success) {
      displayCourses(result.data); // Only published courses
    }
  } catch (error) {
    console.error('Failed to load courses:', error);
  }
};
```

## Testing

Use the provided test file (`tests/organizer-publish-course.test.js`) to verify:

1. Course publishing functionality
2. Status validation
3. Authorization checks
4. Integration with public API
5. Error handling

Run tests with:
```bash
npm test tests/organizer-publish-course.test.js
```

## Future Enhancements

1. **Approval Workflow**: Add admin approval before publishing
2. **Scheduled Publishing**: Allow courses to be published at specific times
3. **Unpublishing**: Allow organizers to unpublish courses
4. **Course Categories**: Enhanced categorization for better discovery
5. **Analytics**: Track course visibility and engagement metrics

## Troubleshooting

### Common Issues

1. **Course not appearing in public list**
   - Check course status is 'published'
   - Verify course has `isActive: true`
   - Ensure publishedAt field is set

2. **Permission denied when publishing**
   - Verify user has 'organizer' role
   - Check course ownership (organizerId matches user ID)
   - Ensure valid authentication token

3. **Cannot publish course**
   - Course must be in 'draft' or 'pending' status
   - Check for any required fields that might be missing
   - Verify database connection

### Debug Queries

```javascript
// Check course status
db.courses.findOne({_id: ObjectId("courseId")}, {status: 1, publishedAt: 1, organizerId: 1})

// Find all published courses
db.courses.find({status: "published", isActive: true})

// Check organizer's courses
db.courses.find({organizerId: ObjectId("organizerId")})
```
