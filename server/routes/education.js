const express = require('express');
const router = express.Router();
const educationController = require('../controllers/education');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const { courseId, assignmentId, discussionId } = req.params;
    const owner = courseId || assignmentId || discussionId || 'general';
    let uploadPath;
    
    if (file.fieldname === 'courseImage' || file.fieldname === 'courseThumbnail') {
      uploadPath = path.join(__dirname, '../uploads/courses', 'images');
    } else if (file.fieldname === 'lessonImage' || file.fieldname === 'lessonVideo' || file.fieldname === 'lessonAudio') {
      uploadPath = path.join(__dirname, '../uploads/lessons', file.fieldname.replace('lesson', '').toLowerCase());
    } else {
      uploadPath = path.join(__dirname, '../uploads/education', owner);
    }
    
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types for education
  const allowedTypes = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/mp3'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error(`Unsupported file type: ${file.mimetype}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB for education files
    files: 10 // Max 10 files per upload
  }
});

// ===== ASSIGNMENT SUBMISSIONS (Student) =====

// Submit an assignment with optional files/links/text
router.post('/assignments/:assignmentId/submit', upload.array('files', 10), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user?.id || req.body.studentId;
    const { text, links = [] } = req.body;

    if (!studentId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const Assignment = require('../models/Assignment');
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    // Check if submission allowed
    if (!assignment.isSubmissionAllowed(studentId)) {
      return res.status(400).json({ success: false, message: 'Submission not allowed (limit reached or past due date)' });
    }

    // Prepare files
    const files = (req.files || []).map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/education/${assignmentId}/${file.filename}`
    }));

    // Create submission
    const submission = {
      studentId,
      content: { text: text || '', links: Array.isArray(links) ? links : [links], files },
      submittedAt: new Date(),
      status: 'submitted'
    };

    assignment.submissions.push(submission);
    await assignment.calculateStats();

    res.status(201).json({ success: true, message: 'Submission created', submission: assignment.submissions[assignment.submissions.length - 1] });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// List submissions for an assignment (organizer/instructor)
router.get('/assignments/:assignmentId/submissions', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const Assignment = require('../models/Assignment');
    const assignment = await Assignment.findById(assignmentId).populate('submissions.studentId', 'firstName lastName email');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, submissions: assignment.submissions });
  } catch (error) {
    console.error('List submissions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Grade a submission (organizer/instructor)
router.put('/assignments/:assignmentId/submissions/:submissionId/grade', async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { score, feedback, rubricScores = [] } = req.body;
    const graderId = req.user?.id;

    const Assignment = require('../models/Assignment');
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const sub = assignment.submissions.id(submissionId);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });

    sub.grade = { score, feedback, rubricScores, gradedBy: graderId, gradedAt: new Date() };
    sub.status = 'graded';
    await assignment.calculateStats();

    res.json({ success: true, message: 'Submission graded', submission: sub });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a submission (admin/instructor)
router.delete('/assignments/:assignmentId/submissions/:submissionId', async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const Assignment = require('../models/Assignment');
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    const sub = assignment.submissions.id(submissionId);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });
    sub.deleteOne();
    await assignment.calculateStats();
    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== DISCUSSION POSTS & REPLIES =====

// Add a post to discussion (with attachments)
router.post('/discussions/:discussionId/posts', upload.array('files', 10), async (req, res) => {
  try {
    const { discussionId } = req.params;
    const authorId = req.user?.id || req.body.authorId;
    const { content } = req.body;
    if (!authorId) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const Discussion = require('../models/Discussion');
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const attachments = (req.files || []).map(file => ({
      filename: file.originalname,
      url: `/uploads/education/${discussionId}/${file.filename}`,
      type: file.mimetype
    }));

    discussion.posts.push({ author: authorId, content, attachments });
    discussion.stats.totalPosts = (discussion.stats.totalPosts || 0) + 1;
    discussion.stats.lastActivity = new Date();
    await discussion.save();

    res.status(201).json({ success: true, message: 'Post added', post: discussion.posts[discussion.posts.length - 1] });
  } catch (error) {
    console.error('Add post error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reply to a post
router.post('/discussions/:discussionId/posts/:postId/replies', async (req, res) => {
  try {
    const { discussionId, postId } = req.params;
    const authorId = req.user?.id || req.body.authorId;
    const { content } = req.body;
    if (!authorId) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const Discussion = require('../models/Discussion');
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const post = discussion.posts.id(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.replies.push({ author: authorId, content, createdAt: new Date() });
    discussion.stats.lastActivity = new Date();
    await discussion.save();

    res.status(201).json({ success: true, message: 'Reply added', post });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like/Unlike a post
router.post('/discussions/:discussionId/posts/:postId/like', async (req, res) => {
  try {
    const { discussionId, postId } = req.params;
    const userId = req.user?.id || req.body.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

    const Discussion = require('../models/Discussion');
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const post = discussion.posts.id(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const existing = (post.likes || []).find(l => l.user.toString() === userId.toString());
    if (existing) {
      post.likes = post.likes.filter(l => l.user.toString() !== userId.toString());
    } else {
      post.likes.push({ user: userId, likedAt: new Date() });
    }
    await discussion.save();

    res.json({ success: true, message: 'Like state toggled', likes: post.likes.length });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ===== COURSE ROUTES =====

// Get all courses for organizer
router.get('/courses', educationController.getCourses);

// Get specific course
router.get('/courses/:id', educationController.getCourse);

// Create new course with image upload
router.post('/courses', upload.fields([{ name: 'courseImage', maxCount: 1 }, { name: 'courseThumbnail', maxCount: 1 }]), educationController.createCourse);

// Update course with image upload
router.put('/courses/:id', upload.fields([{ name: 'courseImage', maxCount: 1 }, { name: 'courseThumbnail', maxCount: 1 }]), educationController.updateCourse);

// Upload course image separately
router.post('/courses/:id/image', upload.single('courseImage'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    
    const Course = require('../models/Course');
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const imageUrl = `/uploads/courses/images/${req.file.filename}`;
    course.image = imageUrl;
    course.imageUrl = imageUrl;
    await course.save();
    
    res.json({ 
      success: true, 
      message: 'Course image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Upload course image error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload course thumbnail separately
router.post('/courses/:id/thumbnail', upload.single('courseThumbnail'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No thumbnail file provided' });
    }
    
    const Course = require('../models/Course');
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const thumbnailUrl = `/uploads/courses/images/${req.file.filename}`;
    course.thumbnail = thumbnailUrl;
    course.thumbnailUrl = thumbnailUrl;
    await course.save();
    
    res.json({ 
      success: true, 
      message: 'Course thumbnail uploaded successfully',
      thumbnailUrl: thumbnailUrl
    });
  } catch (error) {
    console.error('Upload course thumbnail error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete course (soft delete)
router.delete('/courses/:id', educationController.deleteCourse);

// Public route to get limited course info (for homepage and course listing)
router.get('/public/courses', async (req, res) => {
  try {
    const { category, limit = 6, page = 1 } = req.query;

    const Course = require('../models/Course');
    const LearningProgress = require('../models/LearningProgress');

    const filter = { isActive: true, status: 'published' };
    if (category && category !== 'all') filter.category = category;

    // Prioritize super admin courses first, then sort by enrollment count and creation date
    const courses = await Course.find(filter)
      .sort({ isSuperAdminCourse: -1, enrollmentCount: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('organizerId', 'firstName lastName')
      .lean();

    const coursesWithStats = await Promise.all(courses.map(async (course) => {
      const enrollmentCount = await LearningProgress.countDocuments({
        'courses.courseId': course._id
      });

      const completionCount = await LearningProgress.countDocuments({
        'courses.courseId': course._id,
        'courses.status': 'completed'
      });

      return {
        id: course._id.toString(),
        title: course.title,
        description: course.description.length > 150 ?
          course.description.substring(0, 150) + '...' : course.description,
        category: course.category,
        difficulty: course.difficulty,
        duration: course.duration || 4,
        enrolledStudents: enrollmentCount,
        price: course.price || 0,
        instructor: course.instructor ||
          (course.organizerId ? `${course.organizerId.firstName} ${course.organizerId.lastName}` : 'Heritage Expert'),
        rating: course.averageRating || 0,
        totalLessons: course.lessons?.length || Math.floor((course.estimatedDuration || 240) / 30),
        image: course.imageUrl || '/images/course-placeholder.jpg',
        completionRate: enrollmentCount > 0 ? Math.round((completionCount / enrollmentCount) * 100) : 0,
        isSuperAdminCourse: course.isSuperAdminCourse || false
      };
    }));

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: coursesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: coursesWithStats.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get public courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ASSIGNMENT ROUTES =====

// Get assignments
router.get('/assignments', educationController.getAssignments);

// Create assignment
router.post('/assignments', educationController.createAssignment);

// Upload assignment files
router.post('/assignments/:assignmentId/files', upload.array('files', 5), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    const Assignment = require('../models/Assignment');
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    
    const uploadedFiles = req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/education/${req.params.courseId || req.params.assignmentId || 'general'}/${file.filename}`,
      size: file.size,
      type: file.mimetype,
      uploadedAt: new Date()
    }));
    
    // Add files to assignment
    assignment.attachments = assignment.attachments || [];
    assignment.attachments.push(...uploadedFiles);
    await assignment.save();
    
    res.json({ 
      success: true, 
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload assignment files error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== DISCUSSION ROUTES =====

// Get discussions
router.get('/discussions', educationController.getDiscussions);

// Create discussion
router.post('/discussions', educationController.createDiscussion);

// ===== FEEDBACK ROUTES =====

// Get feedback
router.get('/feedback', educationController.getFeedback);

// Respond to feedback
router.post('/feedback/:id/respond', educationController.respondToFeedback);

// Submit feedback with file attachments
router.post('/courses/:courseId/feedback', upload.array('attachments', 3), educationController.submitFeedback);

// ===== STUDENT MANAGEMENT ROUTES =====

// Get students
router.get('/students', educationController.getStudents);

// ===== UPLOAD ROUTES =====

// Upload course materials
router.post('/courses/:courseId/upload', upload.array('materials', 10), async (req, res) => {
  try {
    const { courseId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    
    const Course = require('../models/Course');
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const uploadedFiles = req.files.map(file => ({
      filename: file.originalname,
      url: `/uploads/education/${courseId}/${file.filename}`,
      size: file.size,
      type: file.mimetype,
      uploadedAt: new Date()
    }));
    
    // Add files to course materials
    course.materials = course.materials || [];
    course.materials.push(...uploadedFiles);
    await course.save();
    
    res.json({ 
      success: true, 
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload course materials error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get uploaded files for a course
router.get('/courses/:courseId/files', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const Course = require('../models/Course');
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    res.json({ 
      success: true, 
      data: course.materials || []
    });
  } catch (error) {
    console.error('Get course files error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== ENROLLMENT ROUTES =====

// Enroll in course
router.post('/courses/:courseId/enroll', async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }
    
    const Course = require('../models/Course');
    const LearningProgress = require('../models/LearningProgress');
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if already enrolled
    const existingProgress = await LearningProgress.findOne({
      userId: userId,
      'courses.courseId': courseId
    });
    
    if (existingProgress) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }
    
    // Create or update learning progress
    let progress = await LearningProgress.findOne({ userId: userId });
    
    if (!progress) {
      progress = new LearningProgress({
        userId: userId,
        courses: []
      });
    }
    
    progress.courses.push({
      courseId: courseId,
      enrolledAt: new Date(),
      progressPercentage: 0,
      status: 'enrolled',
      lessons: []
    });
    
    await progress.save();
    
    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
    
    res.json({ success: true, message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get enrollment status
router.get('/courses/:courseId/enrollment/:userId', async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    
    const LearningProgress = require('../models/LearningProgress');
    
    const progress = await LearningProgress.findOne({
      userId: userId,
      'courses.courseId': courseId
    });
    
    const isEnrolled = !!progress;
    const courseProgress = progress?.courses.find(c => c.courseId.toString() === courseId);
    
    res.json({ 
      success: true, 
      data: {
        isEnrolled,
        progressPercentage: courseProgress?.progressPercentage || 0,
        status: courseProgress?.status || 'not_enrolled',
        enrolledAt: courseProgress?.enrolledAt,
        completedLessons: courseProgress?.lessons.filter(l => l.status === 'completed').length || 0
      }
    });
  } catch (error) {
    console.error('Get enrollment status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== VISITOR LEARNING STATS =====

// Get visitor learning statistics for dashboard
router.get('/learning-stats', async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
      // Return empty stats for non-authenticated users
      return res.json({
        success: true,
        stats: {
          coursesEnrolled: 0,
          coursesCompleted: 0,
          certificatesEarned: 0,
          totalStudyHours: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalQuizzesTaken: 0,
          averageQuizScore: 0,
          flashcardsStudied: 0,
          gamesPlayed: 0,
          achievementsEarned: 0,
          favoriteCategory: 'heritage',
          recentActivities: [],
          progressOverview: {
            weeklyProgress: [],
            categoryProgress: {}
          },
          learningGoals: {
            dailyGoal: 30,
            weeklyGoal: 210,
            currentWeekProgress: 0
          }
        }
      });
    }
    
    const LearningProgress = require('../models/LearningProgress');
    const QuizAttempt = require('../models/QuizAttempt');
    const Certificate = require('../models/Certificate');
    const Course = require('../models/Course');
    
    // Get learning progress
    const progress = await LearningProgress.findOne({ userId })
      .populate('courses.courseId', 'title category image')
      .lean();
    
    // Get quiz attempts
    const quizAttempts = await QuizAttempt.find({ user: userId })
      .populate('quiz', 'title category')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    // Get certificates
    const certificates = await Certificate.find({ 
      recipient: userId, 
      isActive: true 
    }).populate('course', 'title').lean();
    
    let stats = {
      coursesEnrolled: 0,
      coursesCompleted: 0,
      certificatesEarned: certificates.length,
      totalStudyHours: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalQuizzesTaken: quizAttempts.length,
      averageQuizScore: 0,
      flashcardsStudied: 0,
      gamesPlayed: 0,
      achievementsEarned: 0,
      favoriteCategory: 'heritage',
      recentActivities: [],
      progressOverview: {
        weeklyProgress: [],
        categoryProgress: {}
      },
      learningGoals: {
        dailyGoal: 30, // minutes
        weeklyGoal: 210, // minutes
        currentWeekProgress: 0
      }
    };
    
    if (progress) {
      stats.coursesEnrolled = progress.courses.length;
      stats.coursesCompleted = progress.courses.filter(c => c.status === 'completed').length;
      stats.totalStudyHours = Math.round((progress.overallStats.totalTimeSpent || 0) / 60);
      stats.currentStreak = progress.overallStats.currentStreak || 0;
      stats.longestStreak = progress.overallStats.longestStreak || 0;
      stats.achievementsEarned = progress.achievements?.length || 0;
      
      // Calculate favorite category
      const categoryCount = {};
      progress.courses.forEach(course => {
        if (course.courseId && course.courseId.category) {
          categoryCount[course.courseId.category] = (categoryCount[course.courseId.category] || 0) + 1;
        }
      });
      
      stats.favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, 'heritage'
      ) || 'heritage';
      
      // Calculate category progress
      const categoryProgress = {};
      progress.courses.forEach(course => {
        if (course.courseId && course.courseId.category) {
          const category = course.courseId.category;
          if (!categoryProgress[category]) {
            categoryProgress[category] = { completed: 0, total: 0, progress: 0 };
          }
          categoryProgress[category].total++;
          if (course.status === 'completed') {
            categoryProgress[category].completed++;
          }
          categoryProgress[category].progress += course.progressPercentage || 0;
        }
      });
      
      // Calculate average progress per category
      Object.keys(categoryProgress).forEach(category => {
        const cat = categoryProgress[category];
        cat.averageProgress = cat.total > 0 ? Math.round(cat.progress / cat.total) : 0;
      });
      
      stats.progressOverview.categoryProgress = categoryProgress;
      
      // Recent activities (last 10)
      const recentActivities = [];
      
      // Add course enrollments
      progress.courses.forEach(course => {
        if (course.enrolledAt && course.courseId) {
          recentActivities.push({
            type: 'course_enrolled',
            title: `Enrolled in ${course.courseId.title}`,
            description: `Started learning ${course.courseId.category}`,
            date: course.enrolledAt,
            icon: 'book',
            category: course.courseId.category
          });
        }
        
        if (course.completedAt && course.courseId) {
          recentActivities.push({
            type: 'course_completed',
            title: `Completed ${course.courseId.title}`,
            description: `Finished course in ${course.courseId.category}`,
            date: course.completedAt,
            icon: 'trophy',
            category: course.courseId.category
          });
        }
      });
      
      // Add recent quiz attempts
      quizAttempts.slice(0, 5).forEach(attempt => {
        if (attempt.submittedAt && attempt.quiz) {
          recentActivities.push({
            type: 'quiz_completed',
            title: `Completed ${attempt.quiz.title}`,
            description: `Scored ${attempt.percentage || 0}% in ${attempt.quiz.category} quiz`,
            date: attempt.submittedAt,
            icon: 'puzzle',
            category: attempt.quiz.category,
            score: attempt.percentage
          });
        }
      });
      
      // Add certificates earned
      certificates.forEach(cert => {
        recentActivities.push({
          type: 'certificate_earned',
          title: `Certificate Earned: ${cert.course?.title || cert.title}`,
          description: `Achievement unlocked in ${cert.category || 'general'}`,
          date: cert.issuedAt,
          icon: 'award',
          category: cert.category || 'general'
        });
      });
      
      // Sort by date and take last 10
      stats.recentActivities = recentActivities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
      
      // Calculate weekly progress for the chart
      const weeklyProgress = [];
      const today = new Date();
      let currentWeekProgress = 0;
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Calculate progress for this day (simplified)
        const dayProgress = progress.courses.reduce((total, course) => {
          const dayLessons = course.lessons.filter(lesson => {
            const lessonDate = new Date(lesson.completedAt || lesson.lastAccessedAt);
            return lessonDate.toDateString() === date.toDateString();
          });
          return total + dayLessons.reduce((time, lesson) => time + (lesson.timeSpent || 0), 0);
        }, 0);
        
        const dayMinutes = Math.round(dayProgress / 60);
        weeklyProgress.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          minutes: dayMinutes,
          sessions: dayProgress > 0 ? 1 : 0
        });
        
        // Add to current week progress
        currentWeekProgress += dayMinutes;
      }
      
      stats.progressOverview.weeklyProgress = weeklyProgress;
      stats.learningGoals.currentWeekProgress = currentWeekProgress;
    }
    
    // Calculate quiz statistics
    if (quizAttempts.length > 0) {
      const completedQuizzes = quizAttempts.filter(q => q.status === 'submitted');
      if (completedQuizzes.length > 0) {
        const totalScore = completedQuizzes.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0);
        stats.averageQuizScore = Math.round(totalScore / completedQuizzes.length);
      }
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get learning stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== DASHBOARD & SUMMARY ROUTES =====

// Get education dashboard summary for homepage/top bar
router.get('/dashboard/summary', async (req, res) => {
  try {
    const { userId, role } = req.query;
    
    const Course = require('../models/Course');
    const Assignment = require('../models/Assignment');
    const LearningProgress = require('../models/LearningProgress');
    const Discussion = require('../models/Discussion');
    const Feedback = require('../models/Feedback');
    
    let summary = {};
    
    if (role === 'organizer' || role === 'admin' || role === 'super-admin') {
      // Instructor/Admin Dashboard Summary
      const totalCourses = await Course.countDocuments({
        ...(role === 'organizer' && userId ? { organizerId: userId } : {}),
        isActive: true
      });
      
      const activeCourses = await Course.countDocuments({
        ...(role === 'organizer' && userId ? { organizerId: userId } : {}),
        isActive: true,
        status: 'published'
      });
      
      const totalAssignments = await Assignment.countDocuments({
        ...(role === 'organizer' && userId ? { organizerId: userId } : {}),
        isActive: true
      });
      
      // Get total enrolled students across all courses
      const courseIds = userId && role === 'organizer' 
        ? (await Course.find({ organizerId: userId, isActive: true }).select('_id')).map(c => c._id)
        : (await Course.find({ isActive: true }).select('_id')).map(c => c._id);
      
      const enrolledStudents = await LearningProgress.countDocuments({
        'courses.courseId': { $in: courseIds }
      });
      
      const pendingFeedback = await Feedback.countDocuments({
        status: 'pending',
        ...(userId && role === 'organizer' ? { 
          courseId: { $in: courseIds } 
        } : {})
      });
      
      const activeDiscussions = await Discussion.countDocuments({
        ...(userId && role === 'organizer' ? { organizerId: userId } : {}),
        isActive: true,
        'stats.lastActivity': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      });
      
      // Recent activities
      const recentEnrollments = await LearningProgress.find({
        'courses.courseId': { $in: courseIds },
        'courses.enrolledAt': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .populate('userId', 'firstName lastName')
      .populate('courses.courseId', 'title')
      .limit(5)
      .sort({ 'courses.enrolledAt': -1 });
      
      summary = {
        role: role,
        totals: {
          courses: totalCourses,
          activeCourses: activeCourses,
          enrolledStudents: enrolledStudents,
          assignments: totalAssignments,
          pendingFeedback: pendingFeedback,
          activeDiscussions: activeDiscussions
        },
        recentActivity: {
          enrollments: recentEnrollments.map(progress => {
            const recentCourse = progress.courses.find(c => 
              c.enrolledAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            );
            return {
              studentName: `${progress.userId.firstName} ${progress.userId.lastName}`,
              courseName: recentCourse?.courseId?.title || 'Unknown Course',
              enrolledAt: recentCourse?.enrolledAt
            };
          }).filter(item => item.courseName !== 'Unknown Course')
        },
        quickStats: {
          avgCourseCompletion: activeCourses > 0 ? 
            Math.round((enrolledStudents / activeCourses) * 100) / 100 : 0,
          totalHoursContent: totalCourses * 4, // Rough estimate
          thisWeekEnrollments: recentEnrollments.length
        }
      };
      
    } else {
      // Student Dashboard Summary
      const studentId = userId;
      
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'User ID required for student dashboard' });
      }
      
      const learningProgress = await LearningProgress.findOne({ userId: studentId })
        .populate('courses.courseId', 'title category')
        .lean();
      
      if (!learningProgress) {
        summary = {
          role: 'student',
          totals: {
            enrolledCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            totalLessonsCompleted: 0,
            totalTimeSpent: 0,
            currentStreak: 0,
            averageScore: 0
          },
          recentActivity: { courses: [], achievements: [] },
          quickStats: { completionRate: 0, hoursThisWeek: 0 }
        };
      } else {
        const enrolledCourses = learningProgress.courses.length;
        const completedCourses = learningProgress.courses.filter(c => c.status === 'completed').length;
        const inProgressCourses = learningProgress.courses.filter(c => c.status === 'in_progress').length;
        
        const recentCourses = learningProgress.courses
          .filter(c => c.enrolledAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .slice(0, 5)
          .map(course => ({
            id: course.courseId._id,
            name: course.courseId.title,
            category: course.courseId.category,
            progress: course.progressPercentage,
            status: course.status,
            enrolledAt: course.enrolledAt
          }));
        
        summary = {
          role: 'student',
          totals: {
            enrolledCourses: enrolledCourses,
            completedCourses: completedCourses,
            inProgressCourses: inProgressCourses,
            totalLessonsCompleted: learningProgress.overallStats.totalLessonsCompleted || 0,
            totalTimeSpent: learningProgress.overallStats.totalTimeSpent || 0,
            currentStreak: learningProgress.overallStats.currentStreak || 0,
            averageScore: learningProgress.overallStats.averageScore || 0
          },
          recentActivity: {
            courses: recentCourses,
            achievements: learningProgress.achievements.slice(-5).reverse()
          },
          quickStats: {
            completionRate: enrolledCourses > 0 ? 
              Math.round((completedCourses / enrolledCourses) * 100) : 0,
            hoursThisWeek: Math.round((learningProgress.overallStats.totalTimeSpent || 0) / 60),
            favoriteCategory: learningProgress.preferences.preferredCategories[0] || 'history'
          }
        };
      }
    }
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Get education dashboard summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get education quick stats for homepage widgets
router.get('/stats/quick', async (req, res) => {
  try {
    const Course = require('../models/Course');
    const LearningProgress = require('../models/LearningProgress');
    
    const [totalCourses, totalStudents, totalCompletions] = await Promise.all([
      Course.countDocuments({ isActive: true, status: 'published' }),
      LearningProgress.countDocuments({}),
      LearningProgress.countDocuments({ 'courses.status': 'completed' })
    ]);
    
    const popularCategories = await Course.aggregate([
      { $match: { isActive: true, status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);
    
    const recentCourses = await Course.find({ 
      isActive: true, 
      status: 'published' 
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .select('title category image enrollmentCount averageRating')
    .lean();
    
    res.json({
      success: true,
      data: {
        totals: {
          courses: totalCourses,
          students: totalStudents,
          completions: totalCompletions
        },
        popularCategories: popularCategories.map(cat => ({
          name: cat._id,
          count: cat.count
        })),
        recentCourses: recentCourses.map(course => ({
          id: course._id,
          title: course.title,
          category: course.category,
          image: course.image || '/images/course-placeholder.jpg',
          students: course.enrollmentCount || 0,
          rating: course.averageRating || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get education quick stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== LESSON MANAGEMENT ROUTES =====

// Get all lessons for a course
router.get('/courses/:courseId/lessons', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const Lesson = require('../models/Lesson');
    const Course = require('../models/Course');
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const lessons = await Lesson.find({ courseId, isActive: true })
      .sort({ order: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'firstName lastName')
      .lean();
    
    const total = await Lesson.countDocuments({ courseId, isActive: true });
    
    const lessonsWithStats = lessons.map(lesson => ({
      id: lesson._id.toString(),
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      estimatedDuration: lesson.estimatedDuration,
      contentTypes: lesson.content.map(c => c.type),
      totalContent: lesson.content.length,
      hasQuiz: lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0,
      objectives: lesson.objectives || [],
      resources: lesson.resources || [],
      image: lesson.image,
      thumbnail: lesson.thumbnail,
      createdBy: lesson.createdBy ? `${lesson.createdBy.firstName} ${lesson.createdBy.lastName}` : 'Unknown',
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    }));
    
    res.json({
      success: true,
      data: lessonsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: lessonsWithStats.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get course lessons error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific lesson with full content
router.get('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const Lesson = require('../models/Lesson');
    const lesson = await Lesson.findById(id)
      .populate('courseId', 'title')
      .populate('createdBy', 'firstName lastName')
      .lean();
    
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    const transformedLesson = {
      id: lesson._id.toString(),
      title: lesson.title,
      description: lesson.description,
      courseId: lesson.courseId._id,
      courseTitle: lesson.courseId.title,
      order: lesson.order,
      estimatedDuration: lesson.estimatedDuration,
      content: lesson.content,
      objectives: lesson.objectives || [],
      resources: lesson.resources || [],
      quiz: lesson.quiz || { questions: [], passingScore: 70 },
      prerequisites: lesson.prerequisites || [],
      image: lesson.image,
      thumbnail: lesson.thumbnail,
      createdBy: lesson.createdBy ? `${lesson.createdBy.firstName} ${lesson.createdBy.lastName}` : 'Unknown',
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    };
    
    res.json({ success: true, data: transformedLesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new lesson with media upload support
router.post('/courses/:courseId/lessons', upload.fields([
  { name: 'lessonImage', maxCount: 1 },
  { name: 'lessonVideo', maxCount: 5 },
  { name: 'lessonAudio', maxCount: 5 },
  { name: 'materials', maxCount: 10 }
]), async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessonData = req.body;
    const creatorId = req.user?.id || req.body.creatorId;
    
    if (!creatorId) {
      return res.status(400).json({ success: false, message: 'Creator ID required' });
    }
    
    const Course = require('../models/Course');
    const Lesson = require('../models/Lesson');
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Handle file uploads
    let imageUrl = lessonData.image || 'https://picsum.photos/400/300';
    if (req.files && req.files.lessonImage && req.files.lessonImage[0]) {
      imageUrl = `/uploads/lessons/images/${req.files.lessonImage[0].filename}`;
    }
    
    // Process lesson content with uploaded media
    let content = [];
    if (lessonData.content) {
      try {
        content = Array.isArray(lessonData.content) ? lessonData.content : JSON.parse(lessonData.content);
      } catch (e) {
        content = [];
      }
    }
    
    // Add uploaded videos to content
    if (req.files && req.files.lessonVideo) {
      req.files.lessonVideo.forEach((file, index) => {
        content.push({
          type: 'video',
          title: `Video ${index + 1}`,
          content: `/uploads/lessons/video/${file.filename}`,
          duration: 0,
          order: content.length + 1
        });
      });
    }
    
    // Add uploaded audios to content
    if (req.files && req.files.lessonAudio) {
      req.files.lessonAudio.forEach((file, index) => {
        content.push({
          type: 'audio',
          title: `Audio ${index + 1}`,
          content: `/uploads/lessons/audio/${file.filename}`,
          duration: 0,
          order: content.length + 1
        });
      });
    }
    
    // Determine next order number
    const lastLesson = await Lesson.findOne({ courseId }).sort({ order: -1 });
    const nextOrder = lastLesson ? lastLesson.order + 1 : 1;
    
    const newLesson = new Lesson({
      ...lessonData,
      courseId: courseId,
      createdBy: creatorId,
      order: lessonData.order || nextOrder,
      content: content,
      image: imageUrl,
      thumbnail: imageUrl,
      objectives: lessonData.objectives ? 
        (Array.isArray(lessonData.objectives) ? lessonData.objectives : JSON.parse(lessonData.objectives)) : [],
      resources: lessonData.resources ?
        (Array.isArray(lessonData.resources) ? lessonData.resources : JSON.parse(lessonData.resources)) : [],
      quiz: lessonData.quiz ? 
        (typeof lessonData.quiz === 'object' ? lessonData.quiz : JSON.parse(lessonData.quiz)) : { questions: [], passingScore: 70 }
    });
    
    await newLesson.save();
    
    // Add lesson to course
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { lessons: newLesson._id }
    });
    
    const transformedLesson = {
      id: newLesson._id.toString(),
      title: newLesson.title,
      description: newLesson.description,
      order: newLesson.order,
      estimatedDuration: newLesson.estimatedDuration,
      contentTypes: newLesson.content.map(c => c.type),
      totalContent: newLesson.content.length,
      hasQuiz: newLesson.quiz && newLesson.quiz.questions && newLesson.quiz.questions.length > 0,
      objectives: newLesson.objectives || [],
      resources: newLesson.resources || [],
      createdAt: newLesson.createdAt
    };
    
    res.status(201).json({ success: true, data: transformedLesson, message: 'Lesson created successfully' });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lesson with media upload support
router.put('/lessons/:id', upload.fields([
  { name: 'lessonImage', maxCount: 1 },
  { name: 'lessonVideo', maxCount: 5 },
  { name: 'lessonAudio', maxCount: 5 },
  { name: 'materials', maxCount: 10 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    const Lesson = require('../models/Lesson');
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    // Handle file uploads
    if (req.files && req.files.lessonImage && req.files.lessonImage[0]) {
      updateData.image = `/uploads/lessons/images/${req.files.lessonImage[0].filename}`;
      updateData.thumbnail = updateData.image;
    }
    
    // Process updated content
    if (updateData.content) {
      try {
        updateData.content = Array.isArray(updateData.content) ? updateData.content : JSON.parse(updateData.content);
      } catch (e) {
        // Keep existing content if parsing fails
        delete updateData.content;
      }
    }
    
    // Add new uploaded videos to existing content
    if (req.files && req.files.lessonVideo && updateData.content) {
      req.files.lessonVideo.forEach((file, index) => {
        updateData.content.push({
          type: 'video',
          title: `New Video ${index + 1}`,
          content: `/uploads/lessons/video/${file.filename}`,
          duration: 0,
          order: updateData.content.length + 1
        });
      });
    }
    
    // Add new uploaded audios to existing content
    if (req.files && req.files.lessonAudio && updateData.content) {
      req.files.lessonAudio.forEach((file, index) => {
        updateData.content.push({
          type: 'audio',
          title: `New Audio ${index + 1}`,
          content: `/uploads/lessons/audio/${file.filename}`,
          duration: 0,
          order: updateData.content.length + 1
        });
      });
    }
    
    // Parse other fields if they're strings
    if (updateData.objectives && typeof updateData.objectives === 'string') {
      try {
        updateData.objectives = JSON.parse(updateData.objectives);
      } catch (e) {
        delete updateData.objectives;
      }
    }
    
    if (updateData.resources && typeof updateData.resources === 'string') {
      try {
        updateData.resources = JSON.parse(updateData.resources);
      } catch (e) {
        delete updateData.resources;
      }
    }
    
    if (updateData.quiz && typeof updateData.quiz === 'string') {
      try {
        updateData.quiz = JSON.parse(updateData.quiz);
      } catch (e) {
        delete updateData.quiz;
      }
    }
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.courseId;
    
    const updatedLesson = await Lesson.findByIdAndUpdate(id, updateData, { new: true });
    
    res.json({ success: true, data: updatedLesson, message: 'Lesson updated successfully' });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete lesson (soft delete)
router.delete('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const Lesson = require('../models/Lesson');
    const Course = require('../models/Course');
    
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    // Soft delete lesson
    await Lesson.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
    
    // Remove from course lessons array
    await Course.findByIdAndUpdate(lesson.courseId, {
      $pull: { lessons: id }
    });
    
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reorder lessons within a course
router.put('/courses/:courseId/lessons/reorder', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonOrders } = req.body; // Array of { lessonId, order }
    
    if (!lessonOrders || !Array.isArray(lessonOrders)) {
      return res.status(400).json({ success: false, message: 'Lesson orders array is required' });
    }
    
    const Lesson = require('../models/Lesson');
    
    // Update each lesson's order
    const updatePromises = lessonOrders.map(({ lessonId, order }) => 
      Lesson.findByIdAndUpdate(lessonId, { order, updatedAt: new Date() })
    );
    
    await Promise.all(updatePromises);
    
    res.json({ success: true, message: 'Lessons reordered successfully' });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Duplicate lesson
router.post('/lessons/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;
    const { newTitle } = req.body;
    
    const Lesson = require('../models/Lesson');
    const originalLesson = await Lesson.findById(id);
    
    if (!originalLesson) {
      return res.status(404).json({ success: false, message: 'Original lesson not found' });
    }
    
    // Find next order number
    const lastLesson = await Lesson.findOne({ courseId: originalLesson.courseId }).sort({ order: -1 });
    const nextOrder = lastLesson ? lastLesson.order + 1 : 1;
    
    // Create duplicate
    const duplicateLesson = new Lesson({
      ...originalLesson.toObject(),
      _id: undefined,
      title: newTitle || `${originalLesson.title} (Copy)`,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await duplicateLesson.save();
    
    // Add to course
    const Course = require('../models/Course');
    await Course.findByIdAndUpdate(originalLesson.courseId, {
      $addToSet: { lessons: duplicateLesson._id }
    });
    
    res.status(201).json({ success: true, data: duplicateLesson, message: 'Lesson duplicated successfully' });
  } catch (error) {
    console.error('Duplicate lesson error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== PROGRESS TRACKING ROUTES =====

// Get student progress for a specific course
router.get('/courses/:courseId/progress/:userId', async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    
    const LearningProgress = require('../models/LearningProgress');
    const Course = require('../models/Course');
    const Lesson = require('../models/Lesson');
    
    // Get course info
    const course = await Course.findById(courseId).populate('lessons').lean();
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Get student progress
    const progress = await LearningProgress.findOne({ userId });
    const courseProgress = progress?.courses.find(c => c.courseId.toString() === courseId);
    
    if (!courseProgress) {
      return res.json({
        success: true,
        data: {
          courseId: courseId,
          userId: userId,
          status: 'not_enrolled',
          progressPercentage: 0,
          completedLessons: 0,
          totalLessons: course.lessons.length,
          lessons: [],
          enrolledAt: null,
          lastActivity: null
        }
      });
    }
    
    // Get lesson progress details
    const lessons = await Lesson.find({ courseId, isActive: true }).sort({ order: 1 }).lean();
    const lessonProgress = lessons.map(lesson => {
      const lessonProg = courseProgress.lessons.find(l => l.lessonId.toString() === lesson._id.toString());
      return {
        lessonId: lesson._id,
        title: lesson.title,
        order: lesson.order,
        estimatedDuration: lesson.estimatedDuration,
        status: lessonProg?.status || 'not_started',
        startedAt: lessonProg?.startedAt || null,
        completedAt: lessonProg?.completedAt || null,
        timeSpent: lessonProg?.timeSpent || 0,
        score: lessonProg?.score || null,
        attempts: lessonProg?.attempts || 0,
        lastAccessedAt: lessonProg?.lastAccessedAt || null
      };
    });
    
    res.json({
      success: true,
      data: {
        courseId: courseId,
        userId: userId,
        status: courseProgress.status,
        progressPercentage: courseProgress.progressPercentage,
        completedLessons: courseProgress.lessons.filter(l => l.status === 'completed').length,
        totalLessons: lessons.length,
        lessons: lessonProgress,
        enrolledAt: courseProgress.enrolledAt,
        startedAt: courseProgress.startedAt,
        completedAt: courseProgress.completedAt,
        lastActivity: progress.overallStats.lastActivityDate
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark lesson as started
router.post('/lessons/:lessonId/start', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }
    
    const Lesson = require('../models/Lesson');
    const LearningProgress = require('../models/LearningProgress');
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    // Find or create learning progress
    let progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      progress = new LearningProgress({ userId, courses: [] });
    }
    
    // Find course progress
    let courseProgress = progress.courses.find(c => c.courseId.toString() === lesson.courseId.toString());
    if (!courseProgress) {
      courseProgress = {
        courseId: lesson.courseId,
        status: 'in_progress',
        enrolledAt: new Date(),
        startedAt: new Date(),
        progressPercentage: 0,
        lessons: []
      };
      progress.courses.push(courseProgress);
    }
    
    // Find or create lesson progress
    let lessonProgress = courseProgress.lessons.find(l => l.lessonId.toString() === lessonId);
    if (!lessonProgress) {
      lessonProgress = {
        lessonId: lessonId,
        status: 'in_progress',
        startedAt: new Date(),
        timeSpent: 0,
        attempts: 1,
        lastAccessedAt: new Date()
      };
      courseProgress.lessons.push(lessonProgress);
    } else if (lessonProgress.status === 'not_started') {
      lessonProgress.status = 'in_progress';
      lessonProgress.startedAt = new Date();
      lessonProgress.lastAccessedAt = new Date();
      lessonProgress.attempts += 1;
    } else {
      lessonProgress.lastAccessedAt = new Date();
    }
    
    // Update course status
    if (courseProgress.status === 'not_started' || courseProgress.status === 'enrolled') {
      courseProgress.status = 'in_progress';
      courseProgress.startedAt = new Date();
    }
    
    // Update overall stats
    progress.updateStreak();
    
    await progress.save();
    
    res.json({ success: true, message: 'Lesson started', lessonProgress });
  } catch (error) {
    console.error('Start lesson error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark lesson as completed
router.post('/lessons/:lessonId/complete', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId, timeSpent = 0, quizScore = null } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }
    
    const Lesson = require('../models/Lesson');
    const LearningProgress = require('../models/LearningProgress');
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    // Find learning progress
    let progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Learning progress not found' });
    }
    
    // Find course progress
    const courseProgress = progress.courses.find(c => c.courseId.toString() === lesson.courseId.toString());
    if (!courseProgress) {
      return res.status(404).json({ success: false, message: 'Course progress not found' });
    }
    
    // Find lesson progress
    let lessonProgress = courseProgress.lessons.find(l => l.lessonId.toString() === lessonId);
    if (!lessonProgress) {
      lessonProgress = {
        lessonId: lessonId,
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        timeSpent: timeSpent,
        score: quizScore,
        attempts: 1,
        lastAccessedAt: new Date()
      };
      courseProgress.lessons.push(lessonProgress);
    } else {
      lessonProgress.status = 'completed';
      lessonProgress.completedAt = new Date();
      lessonProgress.timeSpent += timeSpent;
      if (quizScore !== null) {
        lessonProgress.score = quizScore;
      }
      lessonProgress.lastAccessedAt = new Date();
    }
    
    // Update course progress
    progress.updateCourseProgress(lesson.courseId);
    
    // Update overall stats
    progress.overallStats.totalLessonsCompleted = (progress.overallStats.totalLessonsCompleted || 0) + 1;
    progress.overallStats.totalTimeSpent = (progress.overallStats.totalTimeSpent || 0) + timeSpent;
    
    // Update streak
    progress.updateStreak();
    
    // Check for achievements
    if (lessonProgress.score && lessonProgress.score >= 90) {
      progress.achievements.push({
        achievementId: `high_score_${lessonId}`,
        type: 'score',
        earnedAt: new Date()
      });
    }
    
    // Check if course is completed
    if (courseProgress.status === 'completed') {
      progress.achievements.push({
        achievementId: `course_complete_${lesson.courseId}`,
        type: 'course_complete',
        earnedAt: new Date()
      });
    }
    
    await progress.save();
    
    res.json({ 
      success: true, 
      message: 'Lesson completed', 
      lessonProgress,
      courseProgress: {
        progressPercentage: courseProgress.progressPercentage,
        status: courseProgress.status,
        completedLessons: courseProgress.lessons.filter(l => l.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lesson progress (time spent, score, etc.)
router.put('/lessons/:lessonId/progress', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId, timeSpent = 0, score = null, status = null } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }
    
    const Lesson = require('../models/Lesson');
    const LearningProgress = require('../models/LearningProgress');
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    let progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Learning progress not found' });
    }
    
    const courseProgress = progress.courses.find(c => c.courseId.toString() === lesson.courseId.toString());
    if (!courseProgress) {
      return res.status(404).json({ success: false, message: 'Course progress not found' });
    }
    
    let lessonProgress = courseProgress.lessons.find(l => l.lessonId.toString() === lessonId);
    if (!lessonProgress) {
      lessonProgress = {
        lessonId: lessonId,
        status: status || 'in_progress',
        startedAt: new Date(),
        timeSpent: timeSpent,
        score: score,
        attempts: 1,
        lastAccessedAt: new Date()
      };
      courseProgress.lessons.push(lessonProgress);
    } else {
      if (timeSpent > 0) {
        lessonProgress.timeSpent += timeSpent;
      }
      if (score !== null) {
        lessonProgress.score = score;
      }
      if (status) {
        lessonProgress.status = status;
        if (status === 'completed' && !lessonProgress.completedAt) {
          lessonProgress.completedAt = new Date();
        }
      }
      lessonProgress.lastAccessedAt = new Date();
    }
    
    // Update course progress
    progress.updateCourseProgress(lesson.courseId);
    
    // Update overall stats
    if (timeSpent > 0) {
      progress.overallStats.totalTimeSpent = (progress.overallStats.totalTimeSpent || 0) + timeSpent;
      progress.updateStreak();
    }
    
    await progress.save();
    
    res.json({ success: true, message: 'Progress updated', lessonProgress });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get overall student progress across all courses
router.get('/students/:userId/progress/overall', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const LearningProgress = require('../models/LearningProgress');
    
    const progress = await LearningProgress.findOne({ userId })
      .populate('courses.courseId', 'title category image')
      .lean();
    
    if (!progress) {
      return res.json({
        success: true,
        data: {
          userId: userId,
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalLessonsCompleted: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageScore: 0,
          courses: [],
          achievements: []
        }
      });
    }
    
    const coursesWithProgress = progress.courses.map(course => ({
      courseId: course.courseId._id,
      title: course.courseId.title,
      category: course.courseId.category,
      image: course.courseId.image,
      status: course.status,
      progressPercentage: course.progressPercentage,
      enrolledAt: course.enrolledAt,
      startedAt: course.startedAt,
      completedAt: course.completedAt,
      completedLessons: course.lessons.filter(l => l.status === 'completed').length,
      totalLessons: course.lessons.length
    }));
    
    res.json({
      success: true,
      data: {
        userId: userId,
        totalCourses: progress.courses.length,
        completedCourses: progress.courses.filter(c => c.status === 'completed').length,
        inProgressCourses: progress.courses.filter(c => c.status === 'in_progress').length,
        totalLessonsCompleted: progress.overallStats.totalLessonsCompleted || 0,
        totalTimeSpent: progress.overallStats.totalTimeSpent || 0,
        currentStreak: progress.overallStats.currentStreak || 0,
        longestStreak: progress.overallStats.longestStreak || 0,
        averageScore: progress.overallStats.averageScore || 0,
        lastActivity: progress.overallStats.lastActivityDate,
        courses: coursesWithProgress,
        achievements: progress.achievements.slice(-10).reverse(),
        preferences: progress.preferences
      }
    });
  } catch (error) {
    console.error('Get overall progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset lesson progress (for retaking)
router.post('/lessons/:lessonId/reset', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }
    
    const Lesson = require('../models/Lesson');
    const LearningProgress = require('../models/LearningProgress');
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    
    const progress = await LearningProgress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Learning progress not found' });
    }
    
    const courseProgress = progress.courses.find(c => c.courseId.toString() === lesson.courseId.toString());
    if (!courseProgress) {
      return res.status(404).json({ success: false, message: 'Course progress not found' });
    }
    
    const lessonProgressIndex = courseProgress.lessons.findIndex(l => l.lessonId.toString() === lessonId);
    if (lessonProgressIndex !== -1) {
      // Reset lesson progress but keep attempts count
      const attempts = courseProgress.lessons[lessonProgressIndex].attempts || 0;
      courseProgress.lessons[lessonProgressIndex] = {
        lessonId: lessonId,
        status: 'not_started',
        startedAt: null,
        completedAt: null,
        timeSpent: 0,
        score: null,
        attempts: attempts + 1,
        lastAccessedAt: new Date()
      };
    }
    
    // Recalculate course progress
    progress.updateCourseProgress(lesson.courseId);
    
    await progress.save();
    
    res.json({ success: true, message: 'Lesson progress reset successfully' });
  } catch (error) {
    console.error('Reset lesson progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get progress analytics for instructor/admin
router.get('/courses/:courseId/analytics/progress', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const Course = require('../models/Course');
    const LearningProgress = require('../models/LearningProgress');
    const Lesson = require('../models/Lesson');
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const lessons = await Lesson.find({ courseId, isActive: true }).sort({ order: 1 }).lean();
    
    // Get all students enrolled in this course
    const enrolledStudents = await LearningProgress.find({
      'courses.courseId': courseId
    }).populate('userId', 'firstName lastName email').lean();
    
    const progressAnalytics = {
      totalEnrolled: enrolledStudents.length,
      completedCount: 0,
      inProgressCount: 0,
      notStartedCount: 0,
      averageProgress: 0,
      averageTimeSpent: 0,
      lessonCompletionRates: {},
      studentProgress: []
    };
    
    let totalProgress = 0;
    let totalTimeSpent = 0;
    
    enrolledStudents.forEach(student => {
      const courseProgress = student.courses.find(c => c.courseId.toString() === courseId);
      if (courseProgress) {
        // Count status
        if (courseProgress.status === 'completed') progressAnalytics.completedCount++;
        else if (courseProgress.status === 'in_progress') progressAnalytics.inProgressCount++;
        else progressAnalytics.notStartedCount++;
        
        totalProgress += courseProgress.progressPercentage;
        
        const studentTimeSpent = courseProgress.lessons.reduce((sum, lesson) => sum + (lesson.timeSpent || 0), 0);
        totalTimeSpent += studentTimeSpent;
        
        // Track lesson completion rates
        courseProgress.lessons.forEach(lessonProg => {
          const lessonId = lessonProg.lessonId.toString();
          if (!progressAnalytics.lessonCompletionRates[lessonId]) {
            progressAnalytics.lessonCompletionRates[lessonId] = { completed: 0, total: 0 };
          }
          progressAnalytics.lessonCompletionRates[lessonId].total++;
          if (lessonProg.status === 'completed') {
            progressAnalytics.lessonCompletionRates[lessonId].completed++;
          }
        });
        
        progressAnalytics.studentProgress.push({
          studentId: student.userId._id,
          studentName: `${student.userId.firstName} ${student.userId.lastName}`,
          studentEmail: student.userId.email,
          status: courseProgress.status,
          progressPercentage: courseProgress.progressPercentage,
          completedLessons: courseProgress.lessons.filter(l => l.status === 'completed').length,
          totalLessons: lessons.length,
          timeSpent: studentTimeSpent,
          enrolledAt: courseProgress.enrolledAt,
          lastActivity: courseProgress.lessons.reduce((latest, lesson) => {
            return lesson.lastAccessedAt > latest ? lesson.lastAccessedAt : latest;
          }, courseProgress.enrolledAt)
        });
      }
    });
    
    progressAnalytics.averageProgress = enrolledStudents.length > 0 ? 
      Math.round(totalProgress / enrolledStudents.length) : 0;
    progressAnalytics.averageTimeSpent = enrolledStudents.length > 0 ? 
      Math.round(totalTimeSpent / enrolledStudents.length) : 0;
    
    // Convert lesson completion rates to percentages
    Object.keys(progressAnalytics.lessonCompletionRates).forEach(lessonId => {
      const data = progressAnalytics.lessonCompletionRates[lessonId];
      const lesson = lessons.find(l => l._id.toString() === lessonId);
      progressAnalytics.lessonCompletionRates[lessonId] = {
        lessonTitle: lesson?.title || 'Unknown Lesson',
        completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        completed: data.completed,
        total: data.total
      };
    });
    
    res.json({ success: true, data: progressAnalytics });
  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
