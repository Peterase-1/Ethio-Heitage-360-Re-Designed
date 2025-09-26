# Museum Backend Implementation Plan

## Project Overview

This document outlines the comprehensive backend implementation plan for the Museum Admin Dashboard functionality in the EthioHeritage360 project. The plan is based on the analysis of existing frontend components and provides detailed specifications for all required backend APIs and functionality.

## Frontend Components Analysis

Based on the analysis of the frontend Museum admin dashboard, the following key components have been identified:

### 1. Museum Management Component
- **File**: `src/components/dashboard/MuseumManagement.jsx`
- **Functionality**: CRUD operations for museum profiles, contact information, and basic settings
- **Features**: Search, pagination, form validation, image upload

### 2. Artifact Management Component
- **File**: `src/components/museum/ArtifactManagement.jsx`
- **Functionality**: Complete artifact lifecycle management
- **Features**: 
  - Grid/Table view modes
  - Status tracking (on_display, in_storage, under_conservation, on_loan)
  - Condition monitoring (excellent, good, fair, fragile)
  - Featured artifact marking
  - Category and period filtering

### 3. Artifact Upload Component
- **File**: `src/components/dashboard/MuseumArtifactUpload.jsx`
- **Functionality**: Multi-step artifact upload process
- **Features**:
  - 3D model upload (GLB, GLTF, OBJ)
  - Image upload with drag-and-drop
  - Comprehensive metadata collection
  - Step-by-step wizard interface

### 4. Event Management Component
- **File**: `src/components/museum/EventManagement.jsx`
- **Functionality**: Events, exhibitions, and workshops management
- **Features**:
  - Event scheduling and capacity management
  - Registration tracking
  - Revenue calculation
  - Multiple event types and categories

### 5. Staff Management Component
- **File**: `src/components/museum/StaffManagement.jsx`
- **Functionality**: Staff and role management
- **Features**:
  - Role-based permissions
  - Schedule management
  - Performance tracking
  - Department organization

### 6. Rental Management Component
- **File**: `src/components/museum/RentalManagement.jsx`
- **Functionality**: Artifact rental request system
- **Features**:
  - Rental request approval workflow
  - Fee and deposit calculation
  - Insurance tracking
  - Contract management

### 7. Analytics Dashboard Component
- **File**: `src/components/museum/MuseumAnalytics.jsx`
- **Functionality**: Comprehensive reporting and insights
- **Features**:
  - Visitor analytics
  - Artifact performance metrics
  - Revenue tracking
  - Export functionality

## Database Schema Design

### Museum Model
```javascript
const museumSchema = {
  _id: ObjectId,
  name: String (required),
  location: String (required),
  description: String,
  imageUrl: String,
  contactEmail: String (required, unique),
  contactPhone: String,
  website: String,
  
  // Additional fields for comprehensive management
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  
  settings: {
    allowRentals: Boolean (default: true),
    maxRentalDuration: Number (default: 30),
    requireInsurance: Boolean (default: true),
    autoApproveRentals: Boolean (default: false)
  },
  
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String
  },
  
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Artifact Model
```javascript
const artifactSchema = {
  _id: ObjectId,
  name: String (required),
  description: String (required),
  category: String (required, enum: ['Sculpture', 'Pottery', 'Jewelry', 'Tool', 'Weapon', 'Textile', 'Religious Artifacts', 'Documents', 'Other']),
  period: String (required),
  material: String (required),
  origin: String (required),
  
  // Status and condition
  status: String (required, enum: ['on_display', 'in_storage', 'under_conservation', 'on_loan'], default: 'in_storage'),
  condition: String (required, enum: ['excellent', 'good', 'fair', 'fragile'], default: 'good'),
  isFragile: Boolean (default: false),
  isOnDisplay: Boolean (default: false),
  featured: Boolean (default: false),
  
  // Location and physical details
  location: String,
  dimensions: {
    height: Number,
    width: Number,
    depth: Number,
    weight: Number,
    unit: String (default: 'cm')
  },
  
  // Acquisition details
  acquisitionMethod: String (enum: ['donation', 'purchase', 'loan', 'excavation', 'other'], default: 'donation'),
  acquisitionDate: Date,
  donor: String,
  value: Number,
  insuranceInfo: String,
  
  // Media files
  images: [{
    url: String,
    filename: String,
    size: Number,
    uploadedAt: Date
  }],
  
  model3D: {
    url: String,
    filename: String,
    size: Number,
    format: String (enum: ['glb', 'gltf', 'obj']),
    uploadedAt: Date
  },
  
  documents: [{
    url: String,
    filename: String,
    type: String,
    uploadedAt: Date
  }],
  
  // Analytics
  viewCount: Number (default: 0),
  lastViewed: Date,
  
  // Metadata
  tags: [String],
  notes: String,
  museum: ObjectId (ref: 'Museum', required),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Event Model
```javascript
const eventSchema = {
  _id: ObjectId,
  title: String (required),
  description: String (required),
  type: String (required, enum: ['Exhibition', 'Workshop', 'Lecture', 'Special Event', 'Tour', 'Cultural Program']),
  category: String (required, enum: ['Educational', 'Cultural', 'Permanent', 'Temporary', 'Community', 'Professional']),
  
  // Scheduling
  startDate: Date (required),
  endDate: Date (required),
  time: String (required),
  
  // Location and capacity
  location: String (required),
  capacity: Number (required),
  registrations: Number (default: 0),
  
  // Pricing
  ticketPrice: Number (required),
  currency: String (default: 'ETB'),
  
  // Status
  status: String (enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming'),
  
  // Registration management
  registeredUsers: [{
    user: ObjectId (ref: 'User'),
    registrationDate: Date,
    status: String (enum: ['confirmed', 'pending', 'cancelled'])
  }],
  
  // Media
  images: [String],
  
  // Metadata
  museum: ObjectId (ref: 'Museum', required),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Staff Model
```javascript
const staffSchema = {
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  phone: String,
  
  // Employment details
  role: String (required, enum: ['Senior Curator', 'Education Coordinator', 'Conservation Specialist', 'Digital Archivist', 'Security Officer', 'Tour Guide']),
  department: String (required, enum: ['Collections', 'Education', 'Conservation', 'Digital', 'Security', 'Administration']),
  status: String (enum: ['active', 'on_leave', 'inactive'], default: 'active'),
  hireDate: Date (required),
  
  // Permissions
  permissions: [String],
  
  // Schedule
  schedule: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  
  // Performance tracking
  performance: {
    rating: Number (min: 0, max: 5, default: 0),
    completedTasks: Number (default: 0),
    onTimeRate: Number (default: 100)
  },
  
  // Emergency contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  
  // Metadata
  museum: ObjectId (ref: 'Museum', required),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Rental Request Model
```javascript
const rentalSchema = {
  _id: ObjectId,
  
  // Artifact and requester info
  artifact: ObjectId (ref: 'Artifact', required),
  requester: String (required),
  requesterEmail: String (required),
  requesterPhone: String,
  organization: String,
  
  // Request details
  purpose: String (required),
  requestDate: Date (default: Date.now),
  startDate: Date (required),
  endDate: Date (required),
  duration: Number (required), // in days
  
  // Status
  status: String (enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'overdue'], default: 'pending'),
  
  // Financial details
  rentalFee: Number (required),
  securityDeposit: Number (required),
  totalAmount: Number (required),
  paymentStatus: String (enum: ['pending', 'partial', 'paid', 'refunded'], default: 'pending'),
  
  // Insurance and legal
  insurance: {
    required: Boolean (default: true),
    provider: String,
    policyNumber: String,
    coverage: Number,
    certificate: String // file URL
  },
  
  contract: {
    signed: Boolean (default: false),
    signedDate: Date,
    contractUrl: String,
    terms: String
  },
  
  // Approval workflow
  reviewedBy: ObjectId (ref: 'User'),
  reviewDate: Date,
  reviewNotes: String,
  
  // Delivery and return
  deliveryMethod: String (enum: ['pickup', 'delivery', 'courier']),
  deliveryAddress: String,
  deliveryDate: Date,
  returnDate: Date,
  condition: {
    atDelivery: String,
    atReturn: String,
    damageNotes: String
  },
  
  // Metadata
  museum: ObjectId (ref: 'Museum', required),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### Analytics Model
```javascript
const analyticsSchema = {
  _id: ObjectId,
  museum: ObjectId (ref: 'Museum', required),
  date: Date (required),
  type: String (enum: ['daily', 'weekly', 'monthly'], required),
  
  // Visitor data
  visitors: {
    total: Number (default: 0),
    unique: Number (default: 0),
    returning: Number (default: 0),
    demographics: {
      local: Number (default: 0),
      international: Number (default: 0),
      students: Number (default: 0)
    }
  },
  
  // Artifact engagement
  artifacts: {
    totalViews: Number (default: 0),
    uniqueViews: Number (default: 0),
    averageViewTime: Number (default: 0),
    mostViewed: [{
      artifact: ObjectId (ref: 'Artifact'),
      views: Number
    }]
  },
  
  // Revenue tracking
  revenue: {
    admissions: Number (default: 0),
    rentals: Number (default: 0),
    events: Number (default: 0),
    merchandise: Number (default: 0),
    total: Number (default: 0)
  },
  
  // Engagement metrics
  engagement: {
    averageVisitDuration: Number (default: 0),
    socialShares: Number (default: 0),
    reviews: Number (default: 0),
    averageRating: Number (default: 0)
  },
  
  createdAt: Date (default: Date.now)
}
```

## API Endpoints Specification

### Museum Management APIs

#### Create Museum
```
POST /api/museums
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "name": "Ethiopian Heritage Museum",
  "location": "Addis Ababa, Ethiopia",
  "description": "A comprehensive collection of Ethiopian cultural heritage",
  "contactEmail": "info@museum.et",
  "contactPhone": "+251-11-555-0100",
  "website": "https://museum.et",
  "address": {
    "street": "Africa Avenue",
    "city": "Addis Ababa",
    "state": "Addis Ababa",
    "country": "Ethiopia"
  }
}

Response: {
  "success": true,
  "data": { /* museum object */ },
  "message": "Museum created successfully"
}
```

#### Get Museum
```
GET /api/museums/:id
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": { /* museum object */ }
}
```

#### Update Museum
```
PUT /api/museums/:id
Content-Type: application/json
Authorization: Bearer <token>

Body: { /* fields to update */ }

Response: {
  "success": true,
  "data": { /* updated museum object */ },
  "message": "Museum updated successfully"
}
```

#### Delete Museum
```
DELETE /api/museums/:id
Authorization: Bearer <token>

Response: {
  "success": true,
  "message": "Museum deleted successfully"
}
```

#### List Museums
```
GET /api/museums
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - search: string
  - sortBy: string (default: 'name')
  - sortOrder: 'asc' | 'desc' (default: 'asc')

Response: {
  "success": true,
  "data": {
    "museums": [ /* array of museum objects */ ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "limit": 10
    }
  }
}
```

### Artifact Management APIs

#### Create Artifact
```
POST /api/artifacts
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "name": "Ancient Ethiopian Vase",
  "description": "A beautiful ceramic vase from ancient Ethiopia",
  "category": "Pottery",
  "period": "3rd Century BCE",
  "material": "Ceramic",
  "origin": "Aksum",
  "condition": "excellent",
  "status": "on_display",
  "location": "Hall A - Section 1",
  "museum": "museum_id"
}

Response: {
  "success": true,
  "data": { /* artifact object */ },
  "message": "Artifact created successfully"
}
```

#### Upload Artifact Images
```
POST /api/artifacts/:id/images
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
  - images: File[] (multiple image files)

Response: {
  "success": true,
  "data": {
    "uploadedImages": [
      {
        "url": "https://storage.example.com/artifacts/image1.jpg",
        "filename": "image1.jpg",
        "size": 245760
      }
    ]
  },
  "message": "Images uploaded successfully"
}
```

#### Upload 3D Model
```
POST /api/artifacts/:id/model
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
  - model: File (GLB, GLTF, or OBJ file)

Response: {
  "success": true,
  "data": {
    "model3D": {
      "url": "https://storage.example.com/artifacts/model.glb",
      "filename": "model.glb",
      "format": "glb",
      "size": 2457600
    }
  },
  "message": "3D model uploaded successfully"
}
```

#### Search Artifacts
```
GET /api/artifacts/search
Query Parameters:
  - q: string (search query)
  - category: string
  - status: string
  - condition: string
  - period: string
  - featured: boolean
  - page: number
  - limit: number

Response: {
  "success": true,
  "data": {
    "artifacts": [ /* array of artifact objects */ ],
    "pagination": { /* pagination info */ },
    "filters": {
      "categories": ["Pottery", "Jewelry", ...],
      "periods": ["3rd Century BCE", ...],
      "conditions": ["excellent", "good", ...]
    }
  }
}
```

### Event Management APIs

#### Create Event
```
POST /api/events
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "title": "Ancient Ethiopian Civilizations Exhibition",
  "description": "Explore the rich history...",
  "type": "Exhibition",
  "category": "Permanent",
  "startDate": "2024-09-15",
  "endDate": "2024-12-15",
  "time": "09:00-17:00",
  "location": "Main Gallery",
  "capacity": 200,
  "ticketPrice": 75,
  "museum": "museum_id"
}

Response: {
  "success": true,
  "data": { /* event object */ },
  "message": "Event created successfully"
}
```

#### Register for Event
```
POST /api/events/:id/register
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "userId": "user_id"
}

Response: {
  "success": true,
  "data": {
    "registrationId": "registration_id",
    "event": { /* event object */ }
  },
  "message": "Successfully registered for event"
}
```

### Staff Management APIs

#### Get All Staff Members
```
GET /api/staff
Authorization: Bearer <token>
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - department: string (Collections, Education, Conservation, etc.)
  - role: string (Senior Curator, Education Coordinator, etc.)
  - status: string (active, on_leave, inactive, terminated)
  - search: string (search by name, email, role)
  - sortBy: string (name, email, role, department, hireDate, status)
  - sortOrder: string (asc, desc)

Response: {
  "success": true,
  "data": {
    "staff": [ /* array of staff objects */ ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "limit": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Staff Member by ID
```
GET /api/staff/:id
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": { /* complete staff object with populated data */ }
}
```

#### Add Staff Member
```
POST /api/staff
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "name": "Dr. Sarah Johnson",
  "email": "sarah@museum.et",
  "phone": "+251-11-555-0101",
  "role": "Senior Curator",
  "department": "Collections",
  "hireDate": "2020-03-15",
  "userId": "user_id_optional",
  "permissions": ["view_artifacts", "edit_artifacts", "approve_submissions"],
  "schedule": {
    "monday": "9:00-17:00",
    "tuesday": "9:00-17:00",
    "wednesday": "9:00-17:00",
    "thursday": "9:00-17:00",
    "friday": "9:00-17:00"
  },
  "emergencyContact": {
    "name": "John Johnson",
    "phone": "+251-11-555-0102",
    "relationship": "Spouse"
  }
}

Response: {
  "success": true,
  "data": { /* staff object */ },
  "message": "Staff member created successfully"
}
```

#### Update Staff Member
```
PUT /api/staff/:id
Content-Type: application/json
Authorization: Bearer <token>

Body: { /* fields to update */ }

Response: {
  "success": true,
  "data": { /* updated staff object */ },
  "message": "Staff member updated successfully"
}
```

#### Delete Staff Member
```
DELETE /api/staff/:id
Authorization: Bearer <token>

Response: {
  "success": true,
  "message": "Staff member deleted successfully"
}
```

#### Update Staff Permissions
```
PUT /api/staff/:id/permissions
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "permissions": ["view_artifacts", "edit_artifacts", "approve_submissions"]
}

Response: {
  "success": true,
  "data": { /* updated staff object */ },
  "message": "Staff permissions updated successfully"
}
```

#### Update Staff Schedule
```
PUT /api/staff/:id/schedule
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "schedule": {
    "monday": "9:00-17:00",
    "tuesday": "9:00-17:00",
    "wednesday": "9:00-17:00",
    "thursday": "9:00-17:00",
    "friday": "9:00-17:00",
    "saturday": "10:00-14:00",
    "sunday": "off"
  }
}

Response: {
  "success": true,
  "data": { /* updated staff object */ },
  "message": "Staff schedule updated successfully"
}
```

#### Get Staff Performance
```
GET /api/staff/:id/performance
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "rating": 4.8,
    "completedTasks": 145,
    "onTimeRate": 96,
    "attendance": {
      "totalDays": 250,
      "presentDays": 240,
      "absentDays": 5,
      "lateDays": 5
    },
    "achievements": ["Employee of the Month", "Excellence Award"],
    "lastReview": "2024-01-15T00:00:00.000Z",
    "nextReview": "2024-07-15T00:00:00.000Z"
  }
}
```

#### Record Staff Attendance
```
POST /api/staff/:id/attendance
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "date": "2024-01-15",
  "status": "present",
  "checkInTime": "2024-01-15T09:00:00.000Z",
  "checkOutTime": "2024-01-15T17:00:00.000Z",
  "notes": "On time"
}

Response: {
  "success": true,
  "data": { /* attendance record */ },
  "message": "Attendance recorded successfully"
}
```

#### Submit Leave Request
```
POST /api/staff/:id/leave
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "type": "vacation",
  "reason": "Family vacation",
  "emergencyContact": {
    "name": "John Johnson",
    "phone": "+251-11-555-0102"
  }
}

Response: {
  "success": true,
  "data": { /* leave request object */ },
  "message": "Leave request submitted successfully"
}
```

#### Approve/Reject Leave Request
```
PUT /api/staff/leave/:leaveId/approve
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "status": "approved",
  "comments": "Approved for vacation"
}

Response: {
  "success": true,
  "data": { /* updated leave request */ },
  "message": "Leave request approved successfully"
}
```

#### Get Staff Statistics
```
GET /api/staff/stats
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "overview": {
      "totalStaff": 25,
      "activeStaff": 23,
      "onLeaveStaff": 2,
      "inactiveStaff": 0,
      "avgRating": 4.7,
      "avgOnTimeRate": 95
    },
    "departmentBreakdown": [
      { "_id": "Collections", "count": 8 },
      { "_id": "Education", "count": 5 },
      { "_id": "Conservation", "count": 4 }
    ],
    "roleBreakdown": [
      { "_id": "Senior Curator", "count": 3 },
      { "_id": "Education Coordinator", "count": 2 },
      { "_id": "Tour Guide", "count": 6 }
    ]
  }
}
```

#### Get Roles and Permissions
```
GET /api/staff/roles-permissions
Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "roles": [
      "Senior Curator",
      "Education Coordinator",
      "Conservation Specialist",
      "Digital Archivist",
      "Security Officer",
      "Tour Guide",
      "Registrar",
      "Collections Manager",
      "Exhibitions Coordinator",
      "Marketing Coordinator",
      "Administrative Assistant",
      "Other"
    ],
    "permissions": [
      "view_artifacts",
      "edit_artifacts",
      "delete_artifacts",
      "upload_artifacts",
      "approve_artifacts",
      "view_events",
      "edit_events",
      "delete_events",
      "manage_events",
      "view_staff",
      "edit_staff",
      "delete_staff",
      "manage_permissions",
      "view_rentals",
      "approve_rentals",
      "reject_rentals",
      "view_analytics",
      "export_analytics",
      "edit_museum",
      "manage_system"
    ],
    "departments": [
      "Collections",
      "Education",
      "Conservation",
      "Digital",
      "Security",
      "Administration",
      "Marketing",
      "Research",
      "Operations"
    ]
  }
}
```

### Rental Management APIs

#### Create Rental Request
```
POST /api/rentals
Content-Type: application/json

Body: {
  "artifactId": "artifact_id",
  "requester": "University of Addis Ababa",
  "requesterEmail": "museum@aau.edu.et",
  "purpose": "Educational Exhibition",
  "startDate": "2024-09-01",
  "endDate": "2024-09-30",
  "organization": "University of Addis Ababa"
}

Response: {
  "success": true,
  "data": { /* rental request object */ },
  "message": "Rental request submitted successfully"
}
```

#### Approve Rental Request
```
PUT /api/rentals/:id/approve
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "reviewNotes": "Approved for educational purposes",
  "rentalFee": 5000,
  "securityDeposit": 15000
}

Response: {
  "success": true,
  "data": { /* updated rental object */ },
  "message": "Rental request approved"
}
```

### Analytics APIs

#### Get Visitor Analytics
```
GET /api/analytics/visitors
Query Parameters:
  - museum: string (museum ID)
  - period: 'daily' | 'weekly' | 'monthly'
  - startDate: string (ISO date)
  - endDate: string (ISO date)

Authorization: Bearer <token>

Response: {
  "success": true,
  "data": {
    "summary": {
      "totalVisitors": 12450,
      "uniqueVisitors": 8920,
      "growthRate": 15
    },
    "demographics": {
      "local": 60,
      "international": 25,
      "students": 15
    },
    "trends": [ /* time series data */ ]
  }
}
```

#### Export Analytics Report
```
GET /api/analytics/export
Query Parameters:
  - museum: string
  - type: 'visitors' | 'artifacts' | 'revenue' | 'all'
  - format: 'csv' | 'pdf' | 'xlsx'
  - startDate: string
  - endDate: string

Authorization: Bearer <token>

Response: File download or {
  "success": true,
  "data": {
    "downloadUrl": "https://storage.example.com/reports/analytics.pdf"
  }
}
```

## File Upload Configuration

### Multer Setup
```javascript
const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'images') {
      uploadPath += 'artifacts/images/';
    } else if (file.fieldname === 'model') {
      uploadPath += 'artifacts/models/';
    } else if (file.fieldname === 'documents') {
      uploadPath += 'artifacts/documents/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  } else if (file.fieldname === 'model') {
    const allowedFormats = ['.glb', '.gltf', '.obj'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedFormats.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only GLB, GLTF, and OBJ files are allowed'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});
```

## Authentication & Authorization

### JWT Token Structure
```javascript
const tokenPayload = {
  userId: 'user_id',
  email: 'user@example.com',
  role: 'museum_admin',
  museum: 'museum_id',
  permissions: ['manage_artifacts', 'manage_staff', 'view_analytics'],
  iat: timestamp,
  exp: timestamp
};
```

### Permission System
```javascript
const permissions = {
  // Artifact permissions
  'view_artifacts': 'View artifacts',
  'edit_artifacts': 'Edit artifacts',
  'delete_artifacts': 'Delete artifacts',
  'upload_artifacts': 'Upload artifacts',
  'approve_artifacts': 'Approve artifact submissions',
  
  // Event permissions
  'view_events': 'View events',
  'edit_events': 'Edit events',
  'delete_events': 'Delete events',
  'manage_registrations': 'Manage event registrations',
  
  // Staff permissions
  'view_staff': 'View staff',
  'edit_staff': 'Edit staff',
  'delete_staff': 'Delete staff',
  'manage_permissions': 'Manage staff permissions',
  
  // Rental permissions
  'view_rentals': 'View rental requests',
  'approve_rentals': 'Approve rental requests',
  'reject_rentals': 'Reject rental requests',
  
  // Analytics permissions
  'view_analytics': 'View analytics',
  'export_analytics': 'Export analytics reports',
  
  // Museum permissions
  'edit_museum': 'Edit museum settings',
  'delete_museum': 'Delete museum'
};
```

## Real-time Features with Socket.IO

### Event Types
```javascript
// Server-side events
socket.emit('rental_request_created', rentalData);
socket.emit('rental_status_updated', { rentalId, status });
socket.emit('staff_activity', activityData);
socket.emit('visitor_count_updated', { museum, count });
socket.emit('artifact_status_changed', { artifactId, status });

// Client-side listeners
socket.on('rental_request_created', handleNewRental);
socket.on('rental_status_updated', updateRentalStatus);
socket.on('staff_activity', logStaffActivity);
socket.on('visitor_count_updated', updateVisitorCount);
socket.on('artifact_status_changed', updateArtifactStatus);
```

## Error Handling & Validation

### Error Response Format
```javascript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Validation Rules
```javascript
const artifactValidation = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  category: {
    required: true,
    enum: ['Sculpture', 'Pottery', 'Jewelry', 'Tool', 'Weapon', 'Textile', 'Religious Artifacts', 'Documents', 'Other']
  },
  condition: {
    required: true,
    enum: ['excellent', 'good', 'fair', 'fragile']
  },
  status: {
    required: true,
    enum: ['on_display', 'in_storage', 'under_conservation', 'on_loan']
  }
};
```

## Search & Filtering Implementation

### MongoDB Text Search Setup
```javascript
// Create text index on artifacts
db.artifacts.createIndex({
  name: "text",
  description: "text",
  category: "text",
  period: "text",
  material: "text",
  origin: "text"
});

// Search query
const searchArtifacts = async (query, filters) => {
  const searchQuery = {
    $and: [
      query ? { $text: { $search: query } } : {},
      filters.category ? { category: filters.category } : {},
      filters.status ? { status: filters.status } : {},
      filters.condition ? { condition: filters.condition } : {},
      filters.featured !== undefined ? { featured: filters.featured } : {}
    ].filter(condition => Object.keys(condition).length > 0)
  };
  
  return await Artifact.find(searchQuery)
    .populate('museum')
    .sort({ score: { $meta: "textScore" } })
    .skip((page - 1) * limit)
    .limit(limit);
};
```

## Performance Optimization

### Database Indexing Strategy
```javascript
// Artifacts collection indexes
db.artifacts.createIndex({ museum: 1, status: 1 });
db.artifacts.createIndex({ museum: 1, category: 1 });
db.artifacts.createIndex({ museum: 1, featured: 1 });
db.artifacts.createIndex({ createdAt: -1 });
db.artifacts.createIndex({ viewCount: -1 });

// Events collection indexes
db.events.createIndex({ museum: 1, status: 1 });
db.events.createIndex({ museum: 1, startDate: 1 });
db.events.createIndex({ museum: 1, type: 1 });

// Staff collection indexes
db.staff.createIndex({ museum: 1, status: 1 });
db.staff.createIndex({ museum: 1, department: 1 });
db.staff.createIndex({ email: 1 }, { unique: true });

// Rentals collection indexes
db.rentals.createIndex({ museum: 1, status: 1 });
db.rentals.createIndex({ artifact: 1 });
db.rentals.createIndex({ requesterEmail: 1 });
```

### Caching Strategy
```javascript
// Redis caching for frequently accessed data
const cacheStrategies = {
  // Cache museum data for 1 hour
  museum: { ttl: 3600, key: 'museum:' },
  
  // Cache artifact lists for 30 minutes
  artifacts: { ttl: 1800, key: 'artifacts:' },
  
  // Cache analytics for 15 minutes
  analytics: { ttl: 900, key: 'analytics:' },
  
  // Cache search results for 10 minutes
  search: { ttl: 600, key: 'search:' }
};
```

## Testing Strategy

### Unit Tests
```javascript
// Test artifact creation
describe('Artifact Management', () => {
  test('should create artifact with valid data', async () => {
    const artifactData = {
      name: 'Test Artifact',
      category: 'Pottery',
      condition: 'good',
      museum: museumId
    };
    
    const response = await request(app)
      .post('/api/artifacts')
      .send(artifactData)
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Artifact');
  });
});
```

### Integration Tests
```javascript
// Test complete rental workflow
describe('Rental Workflow', () => {
  test('should complete rental approval workflow', async () => {
    // 1. Create rental request
    const rentalRequest = await createRentalRequest();
    
    // 2. Admin approves request
    const approval = await approveRental(rentalRequest.id);
    
    // 3. Verify status change
    const updatedRental = await getRental(rentalRequest.id);
    expect(updatedRental.status).toBe('approved');
    
    // 4. Verify notification sent
    expect(mockEmailService.sendApprovalEmail).toHaveBeenCalled();
  });
});
```

## Deployment Considerations

### Environment Variables
```
# Database
MONGODB_URI=mongodb://localhost:27017/ethioheritage360
MONGODB_TEST_URI=mongodb://localhost:27017/ethioheritage360_test

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=52428800
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
ALLOWED_MODEL_TYPES=.glb,.gltf,.obj

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Cloud Storage (optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
AWS_REGION=us-east-1
```

### Production Optimization
- Enable MongoDB connection pooling
- Implement rate limiting per API endpoint
- Set up proper logging with Winston
- Enable gzip compression
- Implement health checks
- Set up monitoring with tools like New Relic or DataDog

## Implementation Phases

### ✅ Phase 1: Core Infrastructure (COMPLETED)
**Status**: ✅ **COMPLETED** - Foundation ready for API implementation

**Completed Components:**
1. ✅ **Database Models & Schemas**
   - Enhanced Artifact model with frontend-aligned fields
   - New comprehensive Staff model with roles, permissions, schedules
   - Existing User, Museum, Event models validated
   - Proper indexes and relationships established

2. ✅ **File Upload & Media Management**
   - Complete multer configuration for all file types
   - Support for images, 3D models, documents
   - File validation and error handling
   - Directory structure auto-creation
   - Utility functions for file management

3. ✅ **Authentication & Authorization**
   - Enhanced existing JWT-based auth middleware
   - Role-based access control (superAdmin, museumAdmin, staff, user)
   - Permission system for fine-grained access
   - Museum-specific access control

4. ✅ **Data Validation & Error Handling**
   - Comprehensive express-validator rules for all entities
   - Custom validators for ObjectId, email, phone, dates
   - Standardized error response format
   - Validation middleware chains

**Files Created/Enhanced:**
- `server/models/Staff.js` (NEW)
- `server/config/fileUpload.js` (NEW)
- `server/models/Artifact.js` (ENHANCED)
- `server/middleware/validation.js` (ENHANCED)
- Upload directories auto-created

---

### 🔄 Phase 2: Core Museum Management APIs (IN PROGRESS)
**Status**: 🔄 **NEXT** - Ready to implement
**Duration**: 2-3 days

**Components to Implement:**

#### 2.1 Museum Management API
- `POST /api/museums` - Create museum with validation
- `GET /api/museums` - List museums (paginated, searchable, filterable)
- `GET /api/museums/:id` - Get museum details
- `PUT /api/museums/:id` - Update museum profile
- `DELETE /api/museums/:id` - Soft delete museum
- `POST /api/museums/:id/images` - Upload museum images
- Museum settings management endpoints

#### 2.2 Basic Artifact Management API
- `POST /api/artifacts` - Create artifact with basic info
- `GET /api/artifacts` - List artifacts (paginated, searchable)
- `GET /api/artifacts/:id` - Get artifact details
- `PUT /api/artifacts/:id` - Update artifact
- `DELETE /api/artifacts/:id` - Soft delete artifact
- `PUT /api/artifacts/:id/status` - Update artifact status
- `PUT /api/artifacts/:id/featured` - Toggle featured status

#### 2.3 File Upload Integration
- `POST /api/artifacts/:id/images` - Upload artifact images
- `POST /api/artifacts/:id/model` - Upload 3D models
- `DELETE /api/artifacts/:id/media/:mediaId` - Delete media files
- Image optimization and processing

**Files to Create:**
- `server/routes/museums.js`
- `server/controllers/museums.js`  
- `server/routes/artifacts.js`
- `server/controllers/artifacts.js`

**Expected Deliverables:**
- Fully functional Museum CRUD API
- Basic Artifact management API
- File upload endpoints working
- Integration with frontend Museum Management component
- Integration with frontend Artifact Management component

---

### ✅ Phase 3: Staff & Event Management APIs
**Status**: ✅ **COMPLETED** - Staff Management fully implemented
**Duration**: 2-3 days
**Dependencies**: Phase 2 completion

**Completed Components:**

#### ✅ 3.1 Staff Management API (COMPLETED)
- ✅ `POST /api/staff` - Add staff member with comprehensive validation
- ✅ `GET /api/staff` - List staff with filtering, pagination, and search
- ✅ `GET /api/staff/:id` - Get staff details with populated data
- ✅ `PUT /api/staff/:id` - Update staff information with validation
- ✅ `DELETE /api/staff/:id` - Soft delete staff member
- ✅ `PUT /api/staff/:id/permissions` - Update staff permissions
- ✅ `PUT /api/staff/:id/schedule` - Set/update work schedule
- ✅ `GET /api/staff/:id/performance` - Get performance metrics
- ✅ `POST /api/staff/:id/attendance` - Record attendance
- ✅ `POST /api/staff/:id/leave` - Submit leave request
- ✅ `PUT /api/staff/leave/:leaveId/approve` - Approve/reject leave
- ✅ `GET /api/staff/stats` - Get staff statistics and analytics
- ✅ `GET /api/staff/roles-permissions` - Get available roles and permissions

#### 3.2 Event Management API (PENDING)
- `POST /api/events` - Create event/exhibition
- `GET /api/events` - List events (with date filtering)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Cancel/delete event
- `POST /api/events/:id/register` - Register user for event
- `GET /api/events/:id/attendees` - Get event attendee list
- `PUT /api/events/:id/capacity` - Update event capacity
- `POST /api/events/:id/images` - Upload event images

#### 3.3 Role & Permission Management (INTEGRATED)
- ✅ Role-based permissions integrated into Staff Management
- ✅ Comprehensive permission system with validation
- ✅ Department and role management
- ✅ Permission inheritance and validation

**Files Created:**
- ✅ `server/routes/staff.js` (NEW - Complete implementation)
- ✅ `server/controllers/staff.js` (NEW - Complete implementation)
- ✅ Staff routes integrated into `server/server.js`

**Staff Management Features Implemented:**
- ✅ Complete CRUD operations with validation
- ✅ Advanced filtering and search capabilities
- ✅ Pagination and sorting
- ✅ Role-based access control
- ✅ Permission management system
- ✅ Schedule management
- ✅ Performance tracking and analytics
- ✅ Attendance recording system
- ✅ Leave request workflow
- ✅ Staff statistics and reporting
- ✅ Comprehensive error handling
- ✅ Data validation and sanitization

**Expected Deliverables:**
- ✅ Complete Staff Management API matching frontend requirements
- ✅ Integration with frontend Staff Management component
- ⏳ Enhanced Event Management API (Next Phase)
- ✅ Role-based permission system

---

### 💼 Phase 4: Rental Management & Workflow APIs
**Status**: ⏳ **PENDING**
**Duration**: 2-3 days
**Dependencies**: Phase 2-3 completion

**Components to Implement:**

#### 4.1 Rental Request System
- `POST /api/rentals` - Submit rental request
- `GET /api/rentals` - List rental requests (with status filtering)
- `GET /api/rentals/:id` - Get rental request details
- `PUT /api/rentals/:id/approve` - Approve rental request
- `PUT /api/rentals/:id/reject` - Reject rental request
- `PUT /api/rentals/:id/status` - Update rental status
- `POST /api/rentals/:id/contract` - Generate rental contract
- `PUT /api/rentals/:id/payment` - Update payment status

#### 4.2 Rental Workflow Management
- `GET /api/rentals/pending` - Get pending approvals
- `POST /api/rentals/:id/notes` - Add rental notes
- `GET /api/rentals/calendar` - Get rental calendar view
- `POST /api/rentals/:id/reminder` - Send rental reminders
- `PUT /api/rentals/:id/extend` - Extend rental period
- `POST /api/rentals/:id/return` - Process artifact return

#### 4.3 Contract & Payment Integration
- PDF contract generation
- Email notification system
- Payment tracking
- Insurance validation

**Files to Create:**
- `server/routes/rentals.js` (enhance existing)
- `server/controllers/rentals.js` (enhance existing)
- `server/services/contractService.js`
- `server/services/emailService.js`
- `server/utils/pdfGenerator.js`

**Expected Deliverables:**
- Complete rental request workflow
- Approval/rejection system
- Contract generation
- Email notifications
- Integration with frontend Rental Management component

---

### 📊 Phase 5: Analytics & Reporting APIs
**Status**: ⏳ **PENDING**
**Duration**: 2-3 days
**Dependencies**: Phase 2-4 completion

**Components to Implement:**

#### 5.1 Analytics Data Collection
- `POST /api/analytics/visit` - Record visitor interaction
- `POST /api/analytics/artifact-view` - Track artifact views
- `POST /api/analytics/event-engagement` - Track event engagement
- Automated data aggregation jobs

#### 5.2 Analytics API Endpoints
- `GET /api/analytics/visitors` - Visitor analytics
- `GET /api/analytics/artifacts` - Artifact performance metrics
- `GET /api/analytics/revenue` - Revenue tracking
- `GET /api/analytics/staff-performance` - Staff analytics
- `GET /api/analytics/events` - Event performance metrics
- `GET /api/analytics/rentals` - Rental statistics

#### 5.3 Reporting & Export
- `GET /api/analytics/dashboard` - Dashboard summary
- `GET /api/analytics/export` - Export analytics data
- `POST /api/reports/generate` - Generate custom reports
- `GET /api/reports/:id/download` - Download generated reports

**Files to Create:**
- `server/routes/analytics.js`
- `server/controllers/analytics.js`
- `server/services/analyticsService.js`
- `server/services/reportingService.js`
- `server/jobs/analyticsAggregation.js`

**Expected Deliverables:**
- Comprehensive analytics system
- Real-time dashboard data
- Report generation and export
- Integration with frontend Analytics Dashboard component

---

### 🔄 Phase 6: Real-time Features & WebSocket Integration
**Status**: ⏳ **PENDING**
**Duration**: 2 days
**Dependencies**: Phase 2-5 completion

**Components to Implement:**

#### 6.1 Real-time Notifications
- Rental request notifications
- Staff activity updates
- Event registration notifications
- System alerts and warnings
- Museum visitor count updates

#### 6.2 Socket.IO Event System
```javascript
// Example events to implement:
'rental:new-request'
'rental:status-updated' 
'staff:check-in'
'staff:check-out'
'visitor:count-updated'
'artifact:status-changed'
'event:registration'
'system:alert'
```

#### 6.3 Live Dashboard Updates
- Real-time visitor counters
- Live staff status
- Immediate rental notifications
- Dynamic analytics updates

**Files to Enhance:**
- `server/server.js` (enhance existing Socket.IO)
- `server/services/notificationSocket.js` (enhance existing)
- Add real-time events to all controllers

**Expected Deliverables:**
- Real-time notifications working
- Live dashboard updates
- WebSocket events for all major actions
- Integration with all frontend components

---

### 🧪 Phase 7: Testing, Documentation & Optimization
**Status**: ⏳ **PENDING**
**Duration**: 2-3 days
**Dependencies**: Phase 2-6 completion

**Components to Implement:**

#### 7.1 Testing Suite
- Unit tests for all controllers
- Integration tests for API endpoints
- Authentication/authorization tests
- File upload tests
- Database operation tests

#### 7.2 API Documentation
- Swagger/OpenAPI 3.0 documentation
- Postman collection with examples
- API endpoint documentation
- Authentication guide
- Error code reference

#### 7.3 Performance Optimization
- Database query optimization
- API response caching
- File upload optimization
- Memory usage optimization
- Load testing and optimization

#### 7.4 Production Readiness
- Environment configuration
- Logging enhancement
- Error monitoring
- Health checks
- Security audit

**Files to Create:**
- `server/tests/` directory with test suites
- `server/docs/` directory with documentation
- `swagger.yaml` or `openapi.json`
- `postman-collection.json`
- Performance optimization scripts

**Expected Deliverables:**
- Complete test coverage
- Full API documentation
- Performance optimized system
- Production-ready configuration
- Monitoring and logging setup

---

## Phase Progress Tracking

| Phase | Status | Progress | Estimated Days | Dependencies |
|-------|--------|----------|----------------|-------------|
| **1. Core Infrastructure** | ✅ **COMPLETED** | 100% | 3 days | - |
| **2. Museum & Artifact APIs** | 🔄 **NEXT** | 0% | 2-3 days | Phase 1 |
| **3. Staff & Event APIs** | ✅ **COMPLETED** | 100% | 2-3 days | Phase 2 |
| **4. Rental Management** | ⏳ **PENDING** | 0% | 2-3 days | Phase 2-3 |
| **5. Analytics & Reporting** | ⏳ **PENDING** | 0% | 2-3 days | Phase 2-4 |
| **6. Real-time Features** | ⏳ **PENDING** | 0% | 2 days | Phase 2-5 |
| **7. Testing & Documentation** | ⏳ **PENDING** | 0% | 2-3 days | Phase 2-6 |
| **TOTAL** | | **~43%** | **15-20 days** | |

## Current Status Summary

### ✅ What's Ready:
- All database models and schemas
- File upload system with validation
- Authentication and authorization
- Comprehensive validation middleware
- Error handling and response standardization
- Upload directory structure
- **Complete Staff Management API with all features**
- **Staff CRUD operations with validation**
- **Staff permissions and role management**
- **Staff schedule and performance tracking**
- **Staff attendance and leave management**
- **Staff analytics and reporting**

### 🔄 Next Immediate Steps (Phase 2):
1. Create Museum Management routes and controllers
2. Create basic Artifact Management routes and controllers
3. Integrate file upload endpoints
4. Test with frontend Museum Management component
5. Test with frontend Artifact Management component

### ✅ Phase 3 Completed:
1. ✅ Complete Staff Management API implementation
2. ✅ Staff CRUD operations with comprehensive validation
3. ✅ Staff permissions and role management system
4. ✅ Staff schedule management functionality
5. ✅ Staff performance tracking and analytics
6. ✅ Staff attendance recording system
7. ✅ Staff leave request workflow
8. ✅ Staff statistics and reporting
9. ✅ Integration with frontend Staff Management component

### 🎯 Success Criteria for Each Phase:
- **Phase 2**: Museum and Artifact CRUD fully functional with frontend integration
- **Phase 3**: ✅ **COMPLETED** - Staff management matching all frontend features
- **Phase 4**: Complete rental workflow from request to return
- **Phase 5**: Analytics dashboard showing real data
- **Phase 6**: Real-time updates working across all components
- **Phase 7**: Production-ready system with full test coverage

## API Documentation

### Swagger/OpenAPI Specification
The API will be fully documented using Swagger/OpenAPI 3.0 specification, including:
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Error codes and messages

### Postman Collection
A comprehensive Postman collection will be provided with:
- All API endpoints
- Environment variables
- Test scripts
- Authentication flows
- Sample data

## Security Considerations

### Data Protection
- All sensitive data encrypted at rest
- HTTPS enforcement in production
- Input sanitization and validation
- SQL injection prevention
- XSS protection with proper headers

### Access Control
- JWT-based authentication
- Role-based authorization
- Permission-based access control
- Session management
- Password hashing with bcrypt

### File Security
- File type validation
- File size limits
- Virus scanning (recommended)
- Secure file storage
- Access control for uploaded files

---

This comprehensive plan provides the foundation for implementing a robust museum management backend system. Each component is designed to support the frontend functionality while providing scalability, security, and maintainability.
