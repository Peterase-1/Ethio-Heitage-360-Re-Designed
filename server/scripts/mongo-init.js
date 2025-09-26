// MongoDB initialization script for EthioHeritage360
// This script runs when the MongoDB container starts for the first time

print('Starting MongoDB initialization for EthioHeritage360...');

// Switch to the ethioheritage360 database
db = db.getSiblingDB('ethioheritage360');

// Create application user with read/write permissions
db.createUser({
  user: 'ethioheritage_user',
  pwd: 'ethioheritage_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ethioheritage360'
    }
  ]
});

// Create indexes for better performance
print('Creating database indexes...');

// User collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "createdAt": -1 });

// Educational Tours collection indexes
db.educationaltours.createIndex({ "title": "text", "description": "text" });
db.educationaltours.createIndex({ "organizer": 1 });
db.educationaltours.createIndex({ "status": 1 });
db.educationaltours.createIndex({ "category": 1 });
db.educationaltours.createIndex({ "startDate": 1 });
db.educationaltours.createIndex({ "endDate": 1 });
db.educationaltours.createIndex({ "isActive": 1 });
db.educationaltours.createIndex({ "createdAt": -1 });

// Courses collection indexes
db.courses.createIndex({ "title": "text", "description": "text" });
db.courses.createIndex({ "instructor": 1 });
db.courses.createIndex({ "category": 1 });
db.courses.createIndex({ "level": 1 });
db.courses.createIndex({ "isPublished": 1 });
db.courses.createIndex({ "createdAt": -1 });

// Enrollments collection indexes
db.enrollments.createIndex({ "userId": 1 });
db.enrollments.createIndex({ "courseId": 1 });
db.enrollments.createIndex({ "tourId": 1 });
db.enrollments.createIndex({ "status": 1 });
db.enrollments.createIndex({ "enrollmentDate": -1 });
db.enrollments.createIndex({ "userId": 1, "courseId": 1 }, { unique: true });
db.enrollments.createIndex({ "userId": 1, "tourId": 1 }, { unique: true });

// Artifacts collection indexes
db.artifacts.createIndex({ "name": "text", "description": "text" });
db.artifacts.createIndex({ "museum": 1 });
db.artifacts.createIndex({ "category": 1 });
db.artifacts.createIndex({ "period": 1 });
db.artifacts.createIndex({ "region": 1 });
db.artifacts.createIndex({ "isActive": 1 });
db.artifacts.createIndex({ "createdAt": -1 });

// Museums collection indexes
db.museums.createIndex({ "name": "text", "description": "text" });
db.museums.createIndex({ "location.coordinates": "2dsphere" });
db.museums.createIndex({ "region": 1 });
db.museums.createIndex({ "isActive": 1 });

// Create sample collections if they don't exist
print('Creating initial collections...');

db.createCollection('users');
db.createCollection('educationaltours');
db.createCollection('courses');
db.createCollection('lessons');
db.createCollection('enrollments');
db.createCollection('artifacts');
db.createCollection('museums');
db.createCollection('reviews');
db.createCollection('bookings');

print('✅ MongoDB initialization completed successfully!');
print('Database: ethioheritage360');
print('Application user: ethioheritage_user');
print('Collections created with appropriate indexes');
