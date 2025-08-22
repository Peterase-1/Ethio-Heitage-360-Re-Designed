# Super Admin API Documentation

## Overview

The Super Admin system provides comprehensive access and control over the entire EthioHeritage360 platform. Super Admins have the highest level of privileges and can manage all aspects of the system.

## Authentication & Authorization

All Super Admin endpoints require:
1. Valid JWT token in Authorization header: `Bearer <token>`
2. User role must be `super_admin`

```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

## Base URL

All Super Admin endpoints are prefixed with `/api/super-admin`

## Dashboard & Analytics

### Get Dashboard Data
```http
GET /api/super-admin/dashboard
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "overview": {
      "totalUsers": 1250,
      "activeUsers": 892,
      "totalMuseums": 45,
      "verifiedMuseums": 38,
      "pendingMuseums": 7,
      "totalArtifacts": 3420,
      "publishedArtifacts": 3150,
      "pendingArtifacts": 85,
      "totalRentals": 234,
      "activeRentals": 12,
      "pendingRentals": 8
    },
    "growth": {
      "thisMonthUsers": 127,
      "lastMonthUsers": 98,
      "userGrowth": 29.6,
      "monthlyRevenue": 45000
    },
    "topContent": {
      "artifacts": [...]
    },
    "recentActivity": {
      "users": [...],
      "rentals": [...]
    }
  }
}
```

### Get Analytics Data
```http
GET /api/super-admin/analytics?type=platform&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `type`: platform | user_engagement | revenue | top_artifacts
- `startDate`: Start date (ISO string)
- `endDate`: End date (ISO string)
- `museum`: Museum ID (optional filter)

## User Management

### Get All Users
```http
GET /api/super-admin/users?page=1&limit=20&role=all&status=active&search=john
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `role`: Filter by role (all, visitor, museum, admin, etc.)
- `status`: active | inactive | all
- `search`: Search in name/email
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: desc | asc (default: desc)

### Create User
```http
POST /api/super-admin/users
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "museum_admin",
  "isActive": true,
  "profile": {
    "bio": "Museum administrator",
    "phone": "+251911234567"
  }
}
```

### Update User
```http
PUT /api/super-admin/users/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "super_admin",
  "isActive": false
}
```

### Delete User
```http
DELETE /api/super-admin/users/:id
```

## Museum Oversight

### Get All Museums
```http
GET /api/super-admin/museums?status=pending&verified=false
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: pending | approved | rejected | suspended
- `verified`: true | false
- `search`: Search in name/description

### Update Museum Status
```http
PUT /api/super-admin/museums/:id/status
```

**Request Body:**
```json
{
  "status": "approved",
  "reason": "Museum meets all verification criteria"
}
```

**Valid Status Values:**
- `pending`: Museum registration is under review
- `approved`: Museum is approved and can operate
- `rejected`: Museum application rejected
- `suspended`: Museum temporarily suspended

## Heritage Sites Oversight

### Get Heritage Site Suggestions
```http
GET /api/super-admin/heritage-sites/suggestions
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: pending | approved | rejected
- `museum`: Filter by suggesting museum
- `region`: Filter by region

### Review Heritage Site Suggestion
```http
PUT /api/super-admin/heritage-sites/suggestions/:id/review
```

**Request Body:**
```json
{
  "status": "approved",
  "feedback": "Heritage site meets national significance criteria and is approved for inclusion.",
  "classification": "national",
  "reviewNotes": "Well-documented historical significance with adequate supporting evidence."
}
```

### Get All Heritage Sites (National Level)
```http
GET /api/super-admin/heritage-sites
```

### Update Heritage Site Status
```http
PUT /api/super-admin/heritage-sites/:id/status
```

## Content Oversight (High-Level)

### Get Escalated Content
```http
GET /api/super-admin/content/escalated?type=all&page=1&limit=20
```

**Query Parameters:**
- `type`: all | artifacts | museums | heritage_sites
- `page`, `limit`: Pagination
- `priority`: high | critical

**Response:**
```json
{
  "success": true,
  "escalatedContent": {
    "culturallySensitive": {
      "items": [...],
      "total": 5
    },
    "disputed": {
      "items": [...],
      "total": 3
    },
    "highValue": {
      "items": [...],
      "total": 2
    }
  }
}
```

### Review Escalated Content
```http
PUT /api/super-admin/content/escalated/:id/review
```

**Request Body:**
```json
{
  "decision": "approved",
  "culturalAuthenticityNotes": "Content meets national cultural authenticity standards",
  "platformImpact": "low",
  "additionalReviewRequired": false
}
```

## Rental System Management

### Get All Rentals
```http
GET /api/super-admin/rentals?status=pending_review
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by rental status
- `search`: Search in artifact/renter names
- `sortBy`, `sortOrder`: Sorting options

### Approve/Reject Rental
```http
PUT /api/super-admin/rentals/:id/approve
```

**Request Body:**
```json
{
  "status": "approved",
  "comments": "Rental request approved. Insurance documentation is adequate."
}
```

## System Settings Management

### Get System Settings
```http
GET /api/super-admin/settings?category=branding
```

**Query Parameters:**
- `category`: Filter by category (general, branding, security, etc.)

### Update System Setting
```http
PUT /api/super-admin/settings/:key
```

**Request Body:**
```json
{
  "value": "#FF5733",
  "reason": "Updated brand color as per new design guidelines"
}
```

### Create System Setting
```http
POST /api/super-admin/settings
```

**Request Body:**
```json
{
  "category": "features",
  "key": "new_feature_enabled",
  "value": true,
  "dataType": "boolean",
  "description": "Enable new experimental feature",
  "isPublic": false,
  "isEditable": true,
  "validation": {
    "required": true
  }
}
```

## Additional Endpoints

### System Health Check
```http
GET /api/super-admin/system/health
```

**Response:**
```json
{
  "success": true,
  "health": {
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "database": {
      "connected": true,
      "state": 1
    },
    "memory": {
      "rss": 45678592,
      "heapTotal": 18874368,
      "heapUsed": 12345678
    },
    "uptime": 86400
  }
}
```

### Export Data
```http
GET /api/super-admin/reports/export?type=users&format=csv
```

**Query Parameters:**
- `type`: users | museums | artifacts | rentals
- `format`: csv | excel

### Create System Backup
```http
POST /api/super-admin/system/backup
```

### Broadcast Notification
```http
POST /api/super-admin/notifications/broadcast
```

**Request Body:**
```json
{
  "title": "System Maintenance Notice",
  "message": "The platform will undergo maintenance on Sunday at 2 AM UTC",
  "recipients": "all",
  "urgent": false
}
```

**Recipients Options:**
- `all`: All users
- `role:museum`: All museum users
- `role:visitor`: All visitor users
- `user:12345`: Specific user ID

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Setting Up Super Admin

1. Run the seeder script to create initial settings and super admin:
```bash
node server/scripts/seedSystemSettings.js
```

2. Default super admin credentials:
   - Email: `admin@ethioheritage360.com`
   - Password: `SuperAdmin123!`

3. **Important:** Change the default password immediately after first login.

## Security Considerations

1. **Strong Passwords**: Enforce strong password policies for super admin accounts
2. **Rate Limiting**: Super admin endpoints have higher rate limits but are still protected
3. **Audit Logging**: All super admin actions should be logged for security auditing
4. **IP Restrictions**: Consider implementing IP whitelist for super admin access
5. **Two-Factor Authentication**: Implement 2FA for super admin accounts (recommended)

## System Settings Categories

### General
- Platform name and description
- Default language and supported languages
- Timezone settings

### Branding
- Logo and favicon URLs
- Primary, secondary, and accent colors
- Theme customization

### Security
- Password requirements
- Login attempt limits
- Session timeout settings
- Email verification requirements

### Features
- Enable/disable platform features
- User registration controls
- Rental system toggles

### Notifications
- Email and push notification settings
- SMTP configuration

### API
- Rate limiting settings
- Upload size limits

### Analytics
- Data tracking toggles
- Data retention policies

### Maintenance
- Maintenance mode controls
- Maintenance messages

This comprehensive Super Admin system provides full control over the EthioHeritage360 platform while maintaining security and auditability.
