// Test file for organizer publishCourse functionality
// This demonstrates the workflow for publishing courses

const request = require('supertest');
const app = require('../server'); // Adjust path as needed
const Course = require('../models/Course');
const User = require('../models/User');

describe('Organizer Course Publishing', () => {
  let organizerToken;
  let organizerId;
  let courseId;

  beforeAll(async () => {
    // Create a test organizer user
    const organizer = new User({
      firstName: 'Test',
      lastName: 'Organizer',
      email: 'test.organizer@example.com',
      password: 'password123',
      role: 'organizer',
      isActive: true
    });
    await organizer.save();
    organizerId = organizer._id;

    // Create a test course in draft status
    const course = new Course({
      title: 'Ethiopian Heritage Course',
      description: 'A comprehensive course about Ethiopian heritage',
      category: 'Ethiopian History',
      difficulty: 'Beginner',
      organizerId: organizerId,
      status: 'draft',
      price: 0,
      duration: 4,
      maxStudents: 25
    });
    await course.save();
    courseId = course._id;
  });

  describe('POST /api/organizer/courses/:id/publish', () => {
    test('should publish a draft course successfully', async () => {
      // Mock authentication (in real scenario, you'd get this from login)
      const mockAuth = {
        user: {
          _id: organizerId,
          role: 'organizer'
        }
      };

      const response = await request(app)
        .post(`/api/organizer/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${organizerToken}`) // Would be real token
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Course published successfully and is now visible to students');
      expect(response.body.data.status).toBe('published');
      expect(response.body.data.publishedAt).toBeDefined();

      // Verify course was actually published in database
      const updatedCourse = await Course.findById(courseId);
      expect(updatedCourse.status).toBe('published');
      expect(updatedCourse.publishedAt).toBeDefined();
    });

    test('should allow publishing from pending status', async () => {
      // Update course to pending status
      await Course.findByIdAndUpdate(courseId, { status: 'pending' });

      const response = await request(app)
        .post(`/api/organizer/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('published');
    });

    test('should reject publishing already published course', async () => {
      // Course is already published from previous test
      const response = await request(app)
        .post(`/api/organizer/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('must be in draft or pending status');
    });

    test('should reject publishing non-existent course', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await request(app)
        .post(`/api/organizer/courses/${fakeId}/publish`)
        .set('Authorization', `Bearer ${organizerToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Course not found');
    });

    test('should reject unauthorized organizer', async () => {
      // Create another organizer
      const anotherOrganizer = new User({
        firstName: 'Another',
        lastName: 'Organizer',
        email: 'another.organizer@example.com',
        password: 'password123',
        role: 'organizer'
      });
      await anotherOrganizer.save();

      // Try to publish course with wrong organizer
      const response = await request(app)
        .post(`/api/organizer/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${/* another organizer token */}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Course not found');
    });
  });

  describe('Integration with Public Courses API', () => {
    test('published course should appear in public courses API', async () => {
      const response = await request(app)
        .get('/api/education/public/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Find our published course in the results
      const publishedCourse = response.body.data.find(
        course => course.id === courseId.toString()
      );
      
      expect(publishedCourse).toBeDefined();
      expect(publishedCourse.title).toBe('Ethiopian Heritage Course');
      expect(publishedCourse.category).toBe('Ethiopian History');
    });

    test('draft courses should not appear in public courses API', async () => {
      // Create a draft course
      const draftCourse = new Course({
        title: 'Draft Course',
        description: 'This is a draft course',
        category: 'Test Category',
        difficulty: 'Beginner',
        organizerId: organizerId,
        status: 'draft',
        price: 0
      });
      await draftCourse.save();

      const response = await request(app)
        .get('/api/education/public/courses')
        .expect(200);

      const draftInResults = response.body.data.find(
        course => course.id === draftCourse._id.toString()
      );
      
      expect(draftInResults).toBeUndefined();
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Course.deleteMany({ organizerId });
    await User.deleteMany({ email: { $in: ['test.organizer@example.com', 'another.organizer@example.com'] } });
  });
});
