# 🎯 Visitor Dashboard API Documentation

## 🌟 Overview
This document provides comprehensive API documentation for all visitor dashboard features, connecting super admin created content to the visitor experience.

## 🔐 Authentication
All APIs require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 👑 Super Admin Created Content

### Quizzes (Super Admin Only)
**Super admins can create quizzes that visitors can take:**

#### Create Quiz (Super Admin Only)
```http
POST /api/education-hub/quizzes
Authorization: Bearer <super-admin-token>

{
  "title": "Ethiopian Heritage Foundations",
  "description": "Test your knowledge of Ethiopian culture",
  "category": "heritage",
  "difficulty": "beginner",
  "questions": [
    {
      "question": "What is the ancient name of Ethiopia?",
      "type": "multiple-choice",
      "options": [
        { "text": "Abyssinia", "isCorrect": true, "explanation": "Historical name" },
        { "text": "Nubia", "isCorrect": false, "explanation": "Different kingdom" }
      ],
      "points": 10,
      "timeLimit": 30
    }
  ],
  "settings": {
    "timeLimit": 15,
    "attemptsAllowed": 3,
    "passingScore": 70,
    "certificateEligible": true
  }
}
```

#### Get All Quizzes (Visitor)
```http
GET /api/education-hub/quizzes?category=heritage&difficulty=beginner
```

#### Take Quiz (Visitor)
```http
POST /api/education-hub/quizzes/:id/attempt
POST /api/education-hub/quiz-attempts/:attemptId/submit
{
  "answers": [0, 1, 0] // Array of selected answer indices
}
```

### Flashcards (Admin Created)
#### Create Flashcard (Admin/Museum Admin)
```http
POST /api/education-hub/flashcards
{
  "front": { "content": "What does Ethiopia mean in Greek?" },
  "back": { "content": "Land of Burnt Faces from Aethiops" },
  "category": "heritage",
  "difficulty": "easy",
  "tags": ["etymology", "history"]
}
```

#### Get Flashcards (Visitor)
```http
GET /api/education-hub/flashcards?category=heritage&limit=20
```

### Live Sessions (Staff Created)
#### Create Live Session (Staff)
```http
POST /api/education-hub/live-sessions
{
  "title": "Ethiopian Coffee Ceremony Workshop",
  "description": "Learn the traditional ceremony",
  "category": "workshop",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "duration": 120,
  "maxParticipants": 30
}
```

#### Register for Session (Visitor)
```http
POST /api/education-hub/live-sessions/:id/register
```

---

## 📚 Education Hub APIs

### Courses
```http
GET /api/education-hub/courses
GET /api/education-hub/courses/:id
POST /api/education-hub/courses/:id/enroll
GET /api/education-hub/my-enrollments
```

### Study Guides
```http
GET /api/education-hub/study-guides?category=heritage
```

### Certificates
```http
GET /api/education-hub/certificates
```

---

## 🗂️ Collection APIs

### Bookmarks
```http
GET /api/collection/bookmarks
POST /api/collection/bookmarks
PUT /api/collection/bookmarks/:id
DELETE /api/collection/bookmarks/:id
POST /api/collection/bookmarks/:id/access
```

#### Create Bookmark Example
```json
{
  "resourceType": "museum",
  "resourceId": "64abc123def456789",
  "title": "National Museum of Ethiopia",
  "description": "Rich collection of artifacts",
  "imageUrl": "/uploads/museums/national-museum.jpg",
  "url": "/museums/64abc123def456789",
  "category": "heritage",
  "tags": ["museum", "artifacts"],
  "notes": "Must visit for heritage collection",
  "folder": "Must Visit",
  "priority": 5
}
```

### Notes
```http
GET /api/collection/notes
POST /api/collection/notes
GET /api/collection/notes/:id
PUT /api/collection/notes/:id
DELETE /api/collection/notes/:id
POST /api/collection/notes/:id/pin
```

#### Create Note Example
```json
{
  "title": "Ethiopian Calendar System",
  "content": "13 months system with Pagumē having 5-6 days",
  "category": "culture",
  "tags": ["calendar", "culture"],
  "folder": "Cultural Studies",
  "priority": 5,
  "isPinned": true,
  "reminderDate": "2024-01-20T10:00:00Z"
}
```

### Favorites
```http
GET /api/collection/favorites
POST /api/collection/favorites
DELETE /api/collection/favorites
```

### Recently Viewed & Stats
```http
GET /api/collection/recent
GET /api/collection/stats
```

---

## 👥 Community APIs

### Forums
```http
GET /api/community/forums/topics
POST /api/community/forums/topics
GET /api/community/forums/topics/:id
POST /api/community/forums/topics/:id/posts
POST /api/community/forums/topics/:topicId/posts/:postId/like
POST /api/community/forums/topics/:id/subscribe
```

#### Create Forum Topic Example
```json
{
  "title": "Best Ethiopian Heritage Sites",
  "description": "Share your favorite heritage sites",
  "category": "heritage-discussion",
  "tags": ["travel", "heritage", "recommendations"]
}
```

### Study Groups
```http
GET /api/community/study-groups
POST /api/community/study-groups
GET /api/community/study-groups/:id
POST /api/community/study-groups/:id/join
POST /api/community/study-groups/:id/leave
GET /api/community/my-study-groups
```

#### Create Study Group Example
```json
{
  "name": "Ethiopian Heritage Enthusiasts",
  "description": "Learn about Ethiopian heritage together",
  "category": "heritage",
  "tags": ["heritage", "culture"],
  "maxMembers": 50,
  "isPrivate": false,
  "settings": {
    "allowInvites": true,
    "allowFileSharing": true
  }
}
```

### Social Features
```http
GET /api/community/leaderboard?timeframe=monthly&category=learning
POST /api/community/share-progress
GET /api/community/find-friends?search=john
GET /api/community/stats
```

---

## 📊 Progress Tracking APIs

### Goals
```http
GET /api/progress/goals
POST /api/progress/goals
GET /api/progress/goals/:id
PUT /api/progress/goals/:id
POST /api/progress/goals/:id/progress
DELETE /api/progress/goals/:id
```

#### Create Goal Example
```json
{
  "title": "Complete 5 Heritage Courses",
  "description": "Finish heritage courses by year end",
  "category": "course-completion",
  "type": "yearly",
  "target": 5,
  "unit": "courses",
  "targetDate": "2024-12-31T23:59:59Z",
  "priority": "high",
  "tags": ["learning", "heritage"],
  "isPublic": true
}
```

### Achievements
```http
GET /api/progress/achievements?earned=false
```

### Activity Log
```http
GET /api/progress/activity?type=course-completion&limit=20
```

### Analytics
```http
GET /api/progress/overview?timeframe=monthly
GET /api/progress/detailed-stats
GET /api/progress/goal-templates
```

---

## 🎯 Seeded Data

When you run the seed script, it creates:

### Users
- **Super Admin**: `superadmin@heritage360.et` (password: `SuperAdmin123!`)
- **Sample Visitor**: `visitor@heritage360.et` (password: `Visitor123!`)  
- **Staff Member**: `staff@heritage360.et` (password: `Staff123!`)

### Super Admin Created Content
- **3 Quizzes**: Ethiopian Heritage Foundations, Ancient Kingdom of Axum, Ethiopian Coffee Culture
- **5 Flashcards**: Etymology, Calendar, Food, Script, Architecture
- **3 Live Sessions**: Heritage Introduction, Lalibela Tour, Coffee Workshop

### Visitor Data
- **Course Enrollments**: 3 courses with varying progress
- **Quiz Attempts**: Perfect scores on 2 quizzes
- **Bookmarks**: Museums, artifacts, and quiz bookmarks
- **Notes**: 3 detailed study notes
- **Forum Topics**: 3 discussion topics
- **Study Groups**: 2 collaborative groups
- **Goals**: 3 learning goals with progress
- **Activity Log**: 5 activity entries
- **Favorites**: Museums, artifacts, and courses

## 🚀 Quick Start

1. **Set up MongoDB connection** in your `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/heritage360
```

2. **Run the seed script**:
```bash
cd server
node scripts/seedComprehensiveFeatures.js
```

3. **Start the server**:
```bash
npm run dev
```

4. **Login as visitor** and explore the dashboard:
- Email: `visitor@heritage360.et`
- Password: `Visitor123!`

5. **Login as super admin** to create content:
- Email: `superadmin@heritage360.et` 
- Password: `SuperAdmin123!`

## 📋 Features Implemented

### ✅ Education Hub
- Course enrollment and progress tracking
- Quiz system with attempts and scoring  
- Flashcard study system
- Live session registration
- Certificate management

### ✅ My Collection
- Smart bookmarking with folders
- Rich note-taking with search
- Favorites across all content types
- Recently viewed tracking
- Collection statistics

### ✅ Community  
- Forum discussions with posts/likes
- Study group creation and management
- Leaderboards and progress sharing
- User discovery and social features

### ✅ Progress Tracking
- Goal setting with milestones
- Achievement system integration
- Comprehensive activity logging
- Analytics dashboard with trends
- Progress overview and stats

### ✅ Role-Based Content Creation
- **Super Admin**: Creates quizzes, manages all content
- **Admin/Museum Admin**: Creates flashcards and educational content
- **Staff**: Hosts live sessions and workshops
- **Visitors**: Access all learning features, create goals, join communities

## 🔗 Integration Points

The visitor dashboard seamlessly integrates:

1. **Super admin created quizzes** → Visitor quiz taking experience
2. **Admin created flashcards** → Visitor study materials
3. **Staff hosted live sessions** → Visitor learning opportunities  
4. **Museum/artifact content** → Visitor bookmarks and favorites
5. **Course content** → Visitor enrollments and progress
6. **Community features** → Social learning and collaboration
7. **Progress tracking** → Gamification and motivation

All content flows from admin creation to visitor consumption, creating a comprehensive educational ecosystem! 🎉
