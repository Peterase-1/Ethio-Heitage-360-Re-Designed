# 🚀 EthioHeritage360 API Documentation

## 📋 **Table of Contents**
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Format](#requestresponse-format)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Examples](#api-examples)
8. [Testing Guide](#testing-guide)

---

## 🎯 **API Overview**

**Base URL**: `http://localhost:5000/api` (Development)  
**Production URL**: `https://api.ethioheritage360.com` (Production)  
**API Version**: v1  
**Response Format**: JSON  
**Authentication**: JWT Bearer Token

### **Supported HTTP Methods**
- `GET` - Retrieve data
- `POST` - Create new resources
- `PUT` - Update existing resources
- `PATCH` - Partial updates
- `DELETE` - Delete resources

### **API Features**
- 🔐 **JWT Authentication**
- 📄 **Pagination Support**
- 🔍 **Advanced Filtering**
- 📊 **Analytics Tracking**
- 🚫 **Rate Limiting**
- 📱 **Mobile Optimized**

---

## 🔐 **Authentication**

### **Authentication Flow**

#### **1. User Registration**
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "role": "visitor"
}
```

#### **2. User Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

#### **3. Login Response**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8b1234567890abcdef123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "visitor",
      "isActive": true,
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": "24h"
  }
}
```

### **Using Authentication**

Include JWT token in request headers:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Role-Based Access Control**

| Role | Permissions |
|------|-------------|
| `superAdmin` | Full platform access, user management, system settings |
| `museumAdmin` | Museum management, artifact approval, staff management |
| `staff` | Content creation, basic museum operations |
| `visitor` | View content, book tours, submit rentals |

---

## 🛣️ **API Endpoints**

### **🔐 Authentication Endpoints**

#### **Register User**
```http
POST /api/auth/register
```
**Body Parameters:**
- `firstName` (string, required) - User's first name
- `lastName` (string, required) - User's last name
- `email` (string, required) - Valid email address
- `password` (string, required) - Minimum 8 characters
- `role` (string, optional) - Default: "visitor"

#### **Login User**
```http
POST /api/auth/login
```
**Body Parameters:**
- `email` (string, required) - User's email
- `password` (string, required) - User's password

#### **Refresh Token**
```http
POST /api/auth/refresh
```
**Body Parameters:**
- `refreshToken` (string, required) - Valid refresh token

#### **Logout User**
```http
POST /api/auth/logout
```
**Headers:** `Authorization: Bearer <token>`

#### **Forgot Password**
```http
POST /api/auth/forgot-password
```
**Body Parameters:**
- `email` (string, required) - User's email address

#### **Reset Password**
```http
POST /api/auth/reset-password/:token
```
**Body Parameters:**
- `password` (string, required) - New password
- `confirmPassword` (string, required) - Password confirmation

---

### **👤 User Management Endpoints**

#### **Get Current User Profile**
```http
GET /api/users/profile
```
**Headers:** `Authorization: Bearer <token>`

#### **Update User Profile**
```http
PUT /api/users/profile
```
**Headers:** `Authorization: Bearer <token>`
**Body Parameters:**
- `firstName` (string, optional)
- `lastName` (string, optional)
- `phone` (string, optional)
- `bio` (string, optional)
- `preferences` (object, optional)

#### **Upload Profile Avatar**
```http
POST /api/users/avatar
```
**Headers:** `Authorization: Bearer <token>`
**Body:** Form-data with `avatar` file

#### **Get All Users** (Admin Only)
```http
GET /api/users
```
**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Results per page
- `role` (string, optional) - Filter by role
- `search` (string, optional) - Search by name/email

#### **Get User by ID** (Admin Only)
```http
GET /api/users/:id
```

#### **Update User** (Admin Only)
```http
PUT /api/users/:id
```

#### **Delete User** (Admin Only)
```http
DELETE /api/users/:id
```

---

### **🏛️ Museum Management Endpoints**

#### **Get All Museums**
```http
GET /api/museums
```
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string, optional) - Filter by status
- `type` (string, optional) - Filter by type
- `city` (string, optional) - Filter by city
- `search` (string, optional) - Search by name

#### **Get Museum by ID**
```http
GET /api/museums/:id
```

#### **Create Museum** (Admin Only)
```http
POST /api/museums
```
**Headers:** `Authorization: Bearer <token>`
**Body Parameters:**
- `name` (string, required) - Museum name
- `description` (string, required) - Museum description
- `type` (string, required) - Museum type
- `category` (string, required) - Museum category
- `email` (string, required) - Contact email
- `phone` (string, required) - Contact phone
- `address` (object, required) - Address details
- `operatingHours` (object, optional) - Operating hours

#### **Update Museum**
```http
PUT /api/museums/:id
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin or Super Admin

#### **Delete Museum** (Super Admin Only)
```http
DELETE /api/museums/:id
```

#### **Get Museum Statistics**
```http
GET /api/museums/:id/stats
```

#### **Approve/Reject Museum** (Super Admin Only)
```http
PATCH /api/museums/:id/approval
```
**Body Parameters:**
- `status` (string, required) - "approved" or "rejected"
- `comments` (string, optional) - Approval/rejection comments

---

### **🏺 Artifact Management Endpoints**

#### **Get All Artifacts**
```http
GET /api/artifacts
```
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 12)
- `category` (string, optional) - Filter by category
- `museumId` (string, optional) - Filter by museum
- `search` (string, optional) - Search by name/description
- `isPublic` (boolean, optional) - Filter public artifacts
- `isForRent` (boolean, optional) - Filter rentable artifacts
- `sortBy` (string, optional) - Sort field
- `sortOrder` (string, optional) - "asc" or "desc"

#### **Get Artifact by ID**
```http
GET /api/artifacts/:id
```

#### **Create Artifact**
```http
POST /api/artifacts
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Staff
**Body Parameters:**
- `name` (string, required) - Artifact name
- `description` (string, required) - Detailed description
- `category` (string, required) - Artifact category
- `subcategory` (string, optional) - Subcategory
- `historicalPeriod` (string, required) - Historical period
- `origin` (object, required) - Origin information
- `dimensions` (object, optional) - Physical dimensions
- `materials` (array, optional) - Materials used
- `images` (array, optional) - Image URLs
- `isPublic` (boolean, default: false)
- `isForRent` (boolean, default: false)

#### **Update Artifact**
```http
PUT /api/artifacts/:id
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Staff

#### **Delete Artifact**
```http
DELETE /api/artifacts/:id
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin

#### **Approve/Reject Artifact**
```http
PATCH /api/artifacts/:id/approval
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Super Admin
**Body Parameters:**
- `status` (string, required) - "approved" or "rejected"
- `comments` (string, optional) - Review comments
- `level` (string, required) - "museumAdmin" or "superAdmin"

#### **Upload Artifact Images**
```http
POST /api/artifacts/:id/images
```
**Headers:** `Authorization: Bearer <token>`
**Body:** Form-data with image files

#### **Like/Unlike Artifact**
```http
POST /api/artifacts/:id/like
```
**Headers:** `Authorization: Bearer <token>`

#### **Bookmark/Unbookmark Artifact**
```http
POST /api/artifacts/:id/bookmark
```
**Headers:** `Authorization: Bearer <token>`

#### **Get Artifact Analytics**
```http
GET /api/artifacts/:id/analytics
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Super Admin

---

### **💰 Rental Management Endpoints**

#### **Get All Rentals**
```http
GET /api/rentals
```
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string, optional) - Filter by status
- `museumId` (string, optional) - Filter by museum
- `startDate` (date, optional) - Filter by start date
- `endDate` (date, optional) - Filter by end date

#### **Get Rental by ID**
```http
GET /api/rentals/:id
```

#### **Create Rental Request**
```http
POST /api/rentals
```
**Headers:** `Authorization: Bearer <token>`
**Body Parameters:**
- `artifactId` (string, required) - Artifact ID
- `renterInfo` (object, required) - Renter information
- `rentalPeriod` (object, required) - Rental period details
- `purpose` (string, required) - Rental purpose

#### **Update Rental**
```http
PUT /api/rentals/:id
```
**Headers:** `Authorization: Bearer <token>`

#### **Approve/Reject Rental** (Museum Admin)
```http
PATCH /api/rentals/:id/museum-approval
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin
**Body Parameters:**
- `status` (string, required) - "approved" or "rejected"
- `comments` (string, optional) - Review comments
- `conditions` (string, optional) - Special conditions

#### **Final Approval/Rejection** (Super Admin)
```http
PATCH /api/rentals/:id/super-approval
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Super Admin
**Body Parameters:**
- `status` (string, required) - "approved" or "rejected"
- `comments` (string, optional) - Final comments

#### **Mark Rental as Returned**
```http
PATCH /api/rentals/:id/return
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin

#### **Get Rental Analytics**
```http
GET /api/rentals/analytics
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Super Admin

---

### **🎭 Event Management Endpoints**

#### **Get All Events**
```http
GET /api/events
```
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `type` (string, optional) - Filter by event type
- `museumId` (string, optional) - Filter by museum
- `status` (string, optional) - Filter by status
- `startDate` (date, optional) - Events starting from date
- `endDate` (date, optional) - Events ending before date
- `featured` (boolean, optional) - Featured events only

#### **Get Event by ID**
```http
GET /api/events/:id
```

#### **Create Event**
```http
POST /api/events
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Staff
**Body Parameters:**
- `title` (string, required) - Event title
- `description` (string, required) - Event description
- `type` (string, required) - Event type
- `schedule` (object, required) - Event schedule
- `venue` (object, required) - Venue information
- `ticketing` (object, optional) - Ticketing details

#### **Update Event**
```http
PUT /api/events/:id
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Staff

#### **Delete Event**
```http
DELETE /api/events/:id
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin

#### **Register for Event**
```http
POST /api/events/:id/register
```
**Headers:** `Authorization: Bearer <token>`
**Body Parameters:**
- `attendeeInfo` (object, required) - Attendee information
- `ticketType` (string, required) - Ticket type
- `quantity` (number, default: 1) - Number of tickets

#### **Get Event Registrations**
```http
GET /api/events/:id/registrations
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Staff

---

### **📍 Heritage Sites Endpoints**

#### **Get All Heritage Sites**
```http
GET /api/heritage-sites
```
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `type` (string, optional) - Filter by type
- `region` (string, optional) - Filter by region
- `designation` (string, optional) - Filter by designation
- `search` (string, optional) - Search by name
- `near` (string, optional) - Find sites near coordinates

#### **Get Heritage Site by ID**
```http
GET /api/heritage-sites/:id
```

#### **Create Heritage Site** (Admin Only)
```http
POST /api/heritage-sites
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Super Admin

#### **Update Heritage Site** (Admin Only)
```http
PUT /api/heritage-sites/:id
```

#### **Delete Heritage Site** (Admin Only)
```http
DELETE /api/heritage-sites/:id
```

#### **Get Nearby Sites**
```http
GET /api/heritage-sites/nearby
```
**Query Parameters:**
- `lat` (number, required) - Latitude
- `lng` (number, required) - Longitude
- `radius` (number, default: 50) - Radius in kilometers

---

### **🎫 Tour Management Endpoints**

#### **Get All Tours**
```http
GET /api/tours
```
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `type` (string, optional) - Filter by tour type
- `providerId` (string, optional) - Filter by provider
- `status` (string, optional) - Filter by status
- `minPrice` (number, optional) - Minimum price filter
- `maxPrice` (number, optional) - Maximum price filter
- `duration` (number, optional) - Filter by duration

#### **Get Tour by ID**
```http
GET /api/tours/:id
```

#### **Create Tour**
```http
POST /api/tours
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Staff

#### **Update Tour**
```http
PUT /api/tours/:id
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Staff

#### **Delete Tour**
```http
DELETE /api/tours/:id
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin

#### **Book Tour**
```http
POST /api/tours/:id/book
```
**Headers:** `Authorization: Bearer <token>`
**Body Parameters:**
- `customerInfo` (object, required) - Customer information
- `participants` (number, required) - Number of participants
- `date` (date, required) - Tour date
- `timeSlot` (string, required) - Selected time slot

#### **Get Tour Bookings**
```http
GET /api/tours/:id/bookings
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Staff

---

### **📊 Analytics Endpoints**

#### **Get Dashboard Analytics**
```http
GET /api/analytics/dashboard
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Museum Admin, Super Admin

#### **Get Visitor Analytics**
```http
GET /api/analytics/visitors
```
**Query Parameters:**
- `period` (string) - "day", "week", "month", "year"
- `startDate` (date, optional) - Start date
- `endDate` (date, optional) - End date
- `museumId` (string, optional) - Filter by museum

#### **Get Revenue Analytics**
```http
GET /api/analytics/revenue
```
**Query Parameters:**
- `period` (string) - "day", "week", "month", "year"
- `startDate` (date, optional) - Start date
- `endDate` (date, optional) - End date
- `museumId` (string, optional) - Filter by museum

#### **Get Artifact Analytics**
```http
GET /api/analytics/artifacts
```
**Query Parameters:**
- `period` (string) - "day", "week", "month", "year"
- `museumId` (string, optional) - Filter by museum
- `category` (string, optional) - Filter by category

#### **Get Popular Content**
```http
GET /api/analytics/popular
```
**Query Parameters:**
- `type` (string) - "artifacts", "events", "tours"
- `limit` (number, default: 10) - Number of results

---

### **🔔 Notification Endpoints**

#### **Get User Notifications**
```http
GET /api/notifications
```
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `read` (boolean, optional) - Filter by read status
- `priority` (string, optional) - Filter by priority
- `category` (string, optional) - Filter by category

#### **Mark Notification as Read**
```http
PATCH /api/notifications/:id/read
```
**Headers:** `Authorization: Bearer <token>`

#### **Mark All Notifications as Read**
```http
PATCH /api/notifications/read-all
```
**Headers:** `Authorization: Bearer <token>`

#### **Delete Notification**
```http
DELETE /api/notifications/:id
```
**Headers:** `Authorization: Bearer <token>`

#### **Get Notification Count**
```http
GET /api/notifications/count
```
**Headers:** `Authorization: Bearer <token>`

---

### **🔍 Search Endpoints**

#### **Global Search**
```http
GET /api/search
```
**Query Parameters:**
- `q` (string, required) - Search query
- `type` (string, optional) - "artifacts", "museums", "events", "heritage-sites"
- `page` (number, default: 1)
- `limit` (number, default: 10)

#### **Advanced Search**
```http
POST /api/search/advanced
```
**Body Parameters:**
- `query` (string, optional) - Text search
- `filters` (object, optional) - Advanced filters
- `sortBy` (string, optional) - Sort field
- `sortOrder` (string, optional) - Sort direction

#### **Search Suggestions**
```http
GET /api/search/suggestions
```
**Query Parameters:**
- `q` (string, required) - Partial search query
- `limit` (number, default: 5) - Number of suggestions

#### **Popular Searches**
```http
GET /api/search/popular
```
**Query Parameters:**
- `limit` (number, default: 10) - Number of results

---

### **⚙️ System Settings Endpoints** (Super Admin Only)

#### **Get All Settings**
```http
GET /api/settings
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Super Admin

#### **Get Setting by Key**
```http
GET /api/settings/:key
```

#### **Update Setting**
```http
PUT /api/settings/:key
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Super Admin
**Body Parameters:**
- `value` (mixed, required) - Setting value

#### **Reset Setting to Default**
```http
PATCH /api/settings/:key/reset
```
**Headers:** `Authorization: Bearer <token>`
**Required Role:** Super Admin

---

## 📤 **Request/Response Format**

### **Standard Success Response**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **Standard Error Response**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {
      // Additional error details
    }
  }
}
```

### **Validation Error Response**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "statusCode": 422,
    "details": {
      "fieldErrors": {
        "email": ["Email is required", "Email format is invalid"],
        "password": ["Password must be at least 8 characters"]
      }
    }
  }
}
```

---

## ⚠️ **Error Handling**

### **HTTP Status Codes**

| Status Code | Description |
|-------------|-------------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `204` | No Content - Request successful, no content returned |
| `400` | Bad Request - Invalid request parameters |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Resource already exists |
| `422` | Unprocessable Entity - Validation failed |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |

### **Common Error Codes**

| Error Code | Description |
|------------|-------------|
| `AUTH_REQUIRED` | Authentication token required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Request validation failed |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## 🚦 **Rate Limiting**

### **Rate Limits**

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| Search | 50 requests | 15 minutes |
| File Upload | 10 requests | 15 minutes |

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 📝 **API Examples**

### **Complete Artifact Creation Example**

```javascript
// 1. Login to get token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@museum.com',
    password: 'SecurePassword123!'
  })
});
const { data } = await loginResponse.json();
const token = data.token;

// 2. Create artifact
const artifactData = {
  name: "Ancient Ethiopian Cross",
  description: "A beautifully crafted bronze cross from the 15th century...",
  category: "Religious",
  subcategory: "Crosses",
  historicalPeriod: "Medieval",
  era: "Zara Yaqob Dynasty",
  century: "15th Century",
  estimatedAge: 600,
  origin: {
    region: "Tigray",
    city: "Axum",
    site: "Church of Our Lady Mary of Zion",
    discoveryDate: "1965-03-15T00:00:00.000Z",
    discoveredBy: "Dr. Alemayehu Haile"
  },
  dimensions: {
    height: 25,
    width: 18,
    depth: 3,
    weight: 450
  },
  materials: ["Bronze", "Silver inlay"],
  techniques: ["Lost-wax casting", "Engraving"],
  condition: "Excellent",
  isPublic: true,
  isForRent: true,
  rentalPrice: 500
};

const artifactResponse = await fetch('/api/artifacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(artifactData)
});

const artifact = await artifactResponse.json();
console.log('Created artifact:', artifact.data);
```

### **Search with Filters Example**

```javascript
// Advanced search for pottery artifacts from Axum
const searchParams = new URLSearchParams({
  q: 'pottery',
  category: 'Pottery',
  origin: 'Axum',
  minAge: 1000,
  maxAge: 2000,
  isPublic: true,
  sortBy: 'estimatedAge',
  sortOrder: 'desc',
  page: 1,
  limit: 12
});

const searchResponse = await fetch(`/api/artifacts?${searchParams}`);
const searchResults = await searchResponse.json();
console.log('Search results:', searchResults);
```

### **Rental Workflow Example**

```javascript
// Complete rental request workflow
const rentalData = {
  artifactId: "64f8b3456789012cdefg345",
  renterInfo: {
    name: "Dr. Sarah Johnson",
    organization: "University of California Museum Studies",
    email: "s.johnson@ucmuseum.edu",
    phone: "+1-555-0123",
    address: "123 University Ave, Berkeley, CA 94720",
    purpose: "Academic research and educational exhibition",
    credentials: "PhD in Art History, Museum Studies Certificate"
  },
  rentalPeriod: {
    startDate: "2024-06-01T00:00:00.000Z",
    endDate: "2024-08-31T00:00:00.000Z",
    duration: 92
  },
  insurance: {
    required: true,
    provider: "University Insurance Corp",
    coverage: 50000
  }
};

// 1. Submit rental request
const rentalResponse = await fetch('/api/rentals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${visitorToken}`
  },
  body: JSON.stringify(rentalData)
});

const rental = await rentalResponse.json();
const rentalId = rental.data._id;

// 2. Museum admin approval
const museumApproval = await fetch(`/api/rentals/${rentalId}/museum-approval`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${museumAdminToken}`
  },
  body: JSON.stringify({
    status: 'approved',
    comments: 'Approved for academic use',
    conditions: 'Climate-controlled environment required'
  })
});

// 3. Super admin final approval
const superApproval = await fetch(`/api/rentals/${rentalId}/super-approval`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${superAdminToken}`
  },
  body: JSON.stringify({
    status: 'approved',
    comments: 'Final approval granted'
  })
});
```

### **Analytics Dashboard Example**

```javascript
// Fetch comprehensive dashboard analytics
const analyticsResponse = await fetch('/api/analytics/dashboard', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const analytics = await analyticsResponse.json();

// Analytics data structure
console.log({
  visitorStats: analytics.data.visitors,
  revenueStats: analytics.data.revenue,
  popularArtifacts: analytics.data.popularArtifacts,
  recentActivity: analytics.data.recentActivity,
  geographicData: analytics.data.geographic
});
```

---

## 🧪 **Testing Guide**

### **Testing with Postman**

1. **Import Collection**: Import the Postman collection from `/docs/postman/`
2. **Set Environment**: Configure base URL and authentication tokens
3. **Run Tests**: Execute requests and validate responses

### **Environment Variables for Postman**
```json
{
  "baseUrl": "http://localhost:5000/api",
  "authToken": "{{token}}",
  "superAdminToken": "{{superAdminToken}}",
  "museumAdminToken": "{{museumAdminToken}}"
}
```

### **cURL Examples**

#### **Get All Museums**
```bash
curl -X GET "http://localhost:5000/api/museums" \
  -H "Accept: application/json"
```

#### **Create Artifact with Authentication**
```bash
curl -X POST "http://localhost:5000/api/artifacts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Artifact",
    "description": "A test artifact for API documentation",
    "category": "Pottery",
    "historicalPeriod": "Ancient"
  }'
```

### **JavaScript/Node.js Testing**

```javascript
// Test helper function
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response.json();
}

// Usage examples
try {
  const museums = await apiRequest('/museums');
  const artifact = await apiRequest('/artifacts/123');
  const newRental = await apiRequest('/rentals', {
    method: 'POST',
    body: JSON.stringify(rentalData)
  });
} catch (error) {
  console.error('API request failed:', error.message);
}
```

---

## 📚 **Additional Resources**

### **OpenAPI/Swagger Documentation**
- **Interactive API Explorer**: `/docs/swagger`
- **OpenAPI Specification**: `/docs/openapi.json`

### **SDK and Libraries**
- **JavaScript SDK**: Available in `/sdk/javascript/`
- **Python SDK**: Available in `/sdk/python/`
- **PHP SDK**: Available in `/sdk/php/`

### **Webhooks**
- **Event Notifications**: Configure webhooks for real-time updates
- **Webhook Documentation**: `/docs/webhooks.md`

### **GraphQL Alternative**
- **GraphQL Endpoint**: `/graphql`
- **GraphQL Playground**: `/graphql/playground`
- **GraphQL Schema**: `/docs/schema.graphql`

---

## 🤝 **Support & Feedback**

### **Getting Help**
- 📧 **API Support**: api-support@ethioheritage360.com
- 💬 **Developer Chat**: [Discord Community](https://discord.gg/ethioheritage360)
- 📚 **Documentation**: [Full API Docs](https://docs.ethioheritage360.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Summer-Camp-Project/Project-for-G25/issues)

### **API Status**
- **Status Page**: [status.ethioheritage360.com](https://status.ethioheritage360.com)
- **Uptime Monitor**: 99.9% SLA
- **Planned Maintenance**: Announced 24 hours in advance

---

*This API documentation is automatically generated and updated. Last updated: 2024-01-15*