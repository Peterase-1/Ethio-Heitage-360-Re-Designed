const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Discussion = require('../models/Discussion');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const mongoose = require('mongoose');
const path = require('path');

// ===== COURSE MANAGEMENT =====

// Get courses for organizer
const getCourses = async (req, res) => {
  try {
    const organizerId = req.user?.id || req.query.organizerId;
    if (!organizerId) {
      return res.status(400).json({ success: false, message: 'Organizer ID required' });
    }

    const { status, category, page = 1, limit = 10 } = req.query;
    
    const filter = { organizerId: new mongoose.Types.ObjectId(organizerId), isActive: true };
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('organizerId', 'firstName lastName email')
      .lean();
    
    const total = await Course.countDocuments(filter);
    
    // Get enrollment counts from LearningProgress
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
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        duration: course.duration || 4,
        maxStudents: course.maxStudents || 30,
        enrolledStudents: enrollmentCount,
        startDate: course.startDate || new Date().toISOString().split('T')[0],
        endDate: course.endDate,
        price: course.price || 0,
        status: course.status === 'published' ? 'active' : course.status,
        instructor: course.instructor || 'Heritage Expert',
        rating: course.averageRating || 0,
        completionRate: enrollmentCount > 0 ? Math.round((completionCount / enrollmentCount) * 100) : 0,
        totalLessons: course.lessons?.length || Math.floor((course.estimatedDuration || 240) / 30),
        curriculum: course.curriculum || [],
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };
    }));
    
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
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create course
const createCourse = async (req, res) => {
  try {
    const organizerId = req.user?.id || req.body.organizerId;
    const courseData = req.body;
    
    if (!organizerId) {
      return res.status(400).json({ success: false, message: 'Organizer ID required' });
    }
    
    // Handle uploaded files
    let imageUrl = courseData.image || 'https://picsum.photos/400/300';
    let thumbnailUrl = courseData.thumbnail || 'https://picsum.photos/200/150';
    
    if (req.files) {
      if (req.files.courseImage && req.files.courseImage[0]) {
        imageUrl = `/uploads/courses/images/${req.files.courseImage[0].filename}`;
      }
      if (req.files.courseThumbnail && req.files.courseThumbnail[0]) {
        thumbnailUrl = `/uploads/courses/images/${req.files.courseThumbnail[0].filename}`;
      }
    }
    
    const newCourse = new Course({
      ...courseData,
      organizerId: new mongoose.Types.ObjectId(organizerId),
      createdBy: new mongoose.Types.ObjectId(organizerId),
      status: 'published',
      enrollmentCount: 0,
      averageRating: 0,
      isActive: true,
      image: imageUrl,
      imageUrl: imageUrl,
      thumbnail: thumbnailUrl,
      thumbnailUrl: thumbnailUrl
    });
    
    await newCourse.save();
    
    const transformedCourse = {
      id: newCourse._id.toString(),
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      difficulty: newCourse.difficulty,
      duration: newCourse.duration || 4,
      maxStudents: newCourse.maxStudents || 30,
      enrolledStudents: 0,
      startDate: newCourse.startDate,
      endDate: newCourse.endDate,
      price: newCourse.price || 0,
      status: 'active',
      instructor: newCourse.instructor,
      rating: 0,
      completionRate: 0,
      totalLessons: Math.floor((newCourse.estimatedDuration || 240) / 30),
      curriculum: newCourse.curriculum || [],
      createdAt: newCourse.createdAt,
      updatedAt: newCourse.updatedAt
    };
    
    res.json({ success: true, data: transformedCourse, message: 'Course created successfully' });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get specific course
const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id)
      .populate('organizerId', 'firstName lastName email')
      .populate('lessons')
      .lean();
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const enrollmentCount = await LearningProgress.countDocuments({
      'courses.courseId': course._id
    });
    
    const transformedCourse = {
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      duration: course.duration || 4,
      maxStudents: course.maxStudents || 30,
      enrolledStudents: enrollmentCount,
      curriculum: course.curriculum || [],
      learningOutcomes: course.learningOutcomes || [],
      instructor: course.instructor,
      rating: course.averageRating || 0,
      status: course.status,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
    
    res.json({ success: true, data: transformedCourse });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };
    
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    
    // Handle uploaded files
    if (req.files) {
      if (req.files.courseImage && req.files.courseImage[0]) {
        updateData.image = `/uploads/courses/images/${req.files.courseImage[0].filename}`;
        updateData.imageUrl = updateData.image;
      }
      if (req.files.courseThumbnail && req.files.courseThumbnail[0]) {
        updateData.thumbnail = `/uploads/courses/images/${req.files.courseThumbnail[0].filename}`;
        updateData.thumbnailUrl = updateData.thumbnail;
      }
    }
    
    const course = await Course.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    res.json({ success: true, data: course, message: 'Course updated successfully' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() });
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== ASSIGNMENT MANAGEMENT =====

// Get assignments
const getAssignments = async (req, res) => {
  try {
    const organizerId = req.user?.id || req.query.organizerId;
    const { courseId, status, page = 1, limit = 10 } = req.query;
    
    const filter = { organizerId: new mongoose.Types.ObjectId(organizerId), isActive: true };
    if (courseId) filter.courseId = new mongoose.Types.ObjectId(courseId);
    
    const assignments = await Assignment.find(filter)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Assignment.countDocuments(filter);
    
    const assignmentsWithStats = assignments.map(assignment => ({
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId._id,
      courseTitle: assignment.courseId.title,
      type: assignment.type,
      maxPoints: assignment.maxPoints,
      dueDate: assignment.dueDate,
      submissionFormat: assignment.submissionFormat,
      totalSubmissions: assignment.submissions.length,
      gradedSubmissions: assignment.submissions.filter(s => s.status === 'graded').length,
      averageGrade: assignment.submissions.length > 0 ? 
        assignment.submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / assignment.submissions.length : 0,
      status: assignment.dueDate < new Date() ? 'expired' : 'active',
      createdAt: assignment.createdAt
    }));
    
    res.json({ 
      success: true, 
      data: assignmentsWithStats,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create assignment
const createAssignment = async (req, res) => {
  try {
    const organizerId = req.user?.id || req.body.organizerId;
    const assignmentData = req.body;
    
    const newAssignment = new Assignment({
      ...assignmentData,
      organizerId: new mongoose.Types.ObjectId(organizerId)
    });
    
    await newAssignment.save();
    await newAssignment.populate('courseId', 'title');
    
    const transformedAssignment = {
      id: newAssignment._id.toString(),
      title: newAssignment.title,
      description: newAssignment.description,
      courseTitle: newAssignment.courseId.title,
      type: newAssignment.type,
      maxPoints: newAssignment.maxPoints,
      dueDate: newAssignment.dueDate,
      status: 'active',
      totalSubmissions: 0,
      gradedSubmissions: 0,
      createdAt: newAssignment.createdAt
    };
    
    res.json({ success: true, data: transformedAssignment, message: 'Assignment created successfully' });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== DISCUSSION MANAGEMENT =====

// Get discussions
const getDiscussions = async (req, res) => {
  try {
    const organizerId = req.user?.id || req.query.organizerId;
    const { courseId, type, page = 1, limit = 10 } = req.query;
    
    const filter = { organizerId: new mongoose.Types.ObjectId(organizerId), isActive: true };
    if (courseId) filter.courseId = new mongoose.Types.ObjectId(courseId);
    if (type) filter.type = type;
    
    const discussions = await Discussion.find(filter)
      .populate('courseId', 'title')
      .populate('createdBy', 'firstName lastName')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Discussion.countDocuments(filter);
    
    const discussionsWithStats = discussions.map(discussion => ({
      id: discussion._id.toString(),
      title: discussion.title,
      description: discussion.description,
      courseId: discussion.courseId._id,
      courseTitle: discussion.courseId.title,
      author: discussion.createdBy ? `${discussion.createdBy.firstName} ${discussion.createdBy.lastName}` : 'Unknown',
      type: discussion.type,
      category: discussion.category,
      totalPosts: discussion.posts.length,
      totalReplies: discussion.posts.reduce((sum, post) => sum + post.replies.length, 0),
      participants: discussion.participants.length,
      views: discussion.views,
      isPinned: discussion.isPinned,
      isLocked: discussion.isLocked,
      lastActivity: discussion.lastActivity,
      createdAt: discussion.createdAt
    }));
    
    res.json({ 
      success: true, 
      data: discussionsWithStats,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create discussion
const createDiscussion = async (req, res) => {
  try {
    const organizerId = req.user?.id || req.body.organizerId;
    const discussionData = req.body;
    
    const newDiscussion = new Discussion({
      ...discussionData,
      organizerId: new mongoose.Types.ObjectId(organizerId),
      createdBy: new mongoose.Types.ObjectId(organizerId)
    });
    
    await newDiscussion.save();
    await newDiscussion.populate('courseId', 'title');
    
    const transformedDiscussion = {
      id: newDiscussion._id.toString(),
      title: newDiscussion.title,
      description: newDiscussion.description,
      courseTitle: newDiscussion.courseId.title,
      type: newDiscussion.type,
      category: newDiscussion.category,
      totalPosts: 0,
      totalReplies: 0,
      participants: 0,
      views: 0,
      createdAt: newDiscussion.createdAt
    };
    
    res.json({ success: true, data: transformedDiscussion, message: 'Discussion created successfully' });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== FEEDBACK MANAGEMENT =====

// Get feedback
const getFeedback = async (req, res) => {
  try {
    const { courseId, status, type, page = 1, limit = 10 } = req.query;
    
    const filter = { isActive: true };
    if (courseId) filter.courseId = new mongoose.Types.ObjectId(courseId);
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const feedback = await Feedback.find(filter)
      .populate('courseId', 'title')
      .populate('userId', 'firstName lastName email')
      .populate('responses.responderId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await Feedback.countDocuments(filter);
    
    const transformedFeedback = feedback.map(item => ({
      id: item._id.toString(),
      subject: item.subject,
      message: item.message,
      type: item.type,
      category: item.category,
      priority: item.priority,
      status: item.status,
      courseTitle: item.courseId.title,
      studentName: `${item.userId.firstName} ${item.userId.lastName}`,
      studentEmail: item.userId.email,
      responseCount: item.responses.length,
      resolved: item.resolved,
      rating: item.rating,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    
    res.json({ 
      success: true, 
      data: transformedFeedback,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create feedback response
const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const responderId = req.user?.id;
    
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    
    await feedback.addResponse(responderId, message, true);
    
    res.json({ success: true, message: 'Response added successfully' });
  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit course feedback (for students)
const submitFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const feedbackData = req.body;
    
    // Handle file attachments if present
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.originalname,
          url: `/uploads/education/${courseId}/${file.filename}`,
          size: file.size
        });
      });
    }
    
    const feedback = new Feedback({
      ...feedbackData,
      courseId: new mongoose.Types.ObjectId(courseId),
      userId: new mongoose.Types.ObjectId(userId),
      attachments
    });
    
    await feedback.save();
    
    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get students enrolled in organizer's courses
const getStudents = async (req, res) => {
  try {
    const organizerId = req.user?.id || req.query.organizerId;
    const { courseId, page = 1, limit = 10 } = req.query;
    
    let courseFilter = { organizerId: new mongoose.Types.ObjectId(organizerId) };
    if (courseId) courseFilter._id = new mongoose.Types.ObjectId(courseId);
    
    const courses = await Course.find(courseFilter).select('_id title');
    const courseIds = courses.map(c => c._id);
    
    const enrollments = await LearningProgress.find({
      'courses.courseId': { $in: courseIds }
    })
    .populate('userId', 'firstName lastName email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();
    
    const total = await LearningProgress.countDocuments({
      'courses.courseId': { $in: courseIds }
    });
    
    const students = [];
    const seenUsers = new Set();
    
    enrollments.forEach(progress => {
      if (progress.userId && !seenUsers.has(progress.userId._id.toString())) {
        seenUsers.add(progress.userId._id.toString());
        
        const userCourses = progress.courses.filter(c => 
          courseIds.some(id => id.toString() === c.courseId.toString())
        );
        
        const completedAssignments = userCourses.reduce((sum, course) => 
          sum + (course.lessons?.filter(l => l.status === 'completed').length || 0), 0);
        
        students.push({
          id: progress.userId._id.toString(),
          name: `${progress.userId.firstName} ${progress.userId.lastName}`,
          email: progress.userId.email,
          enrolledCourses: userCourses.length,
          completedAssignments,
          totalAssignments: userCourses.reduce((sum, course) => sum + (course.lessons?.length || 0), 0),
          avgGrade: userCourses.length > 0 ? 
            userCourses.reduce((sum, course) => sum + (course.progressPercentage || 0), 0) / userCourses.length : 0,
          enrollmentDate: userCourses[0]?.enrolledAt || progress.createdAt,
          lastActivity: progress.updatedAt,
          status: 'active'
        });
      }
    });
    
    res.json({ 
      success: true, 
      data: students, 
      pagination: { page: parseInt(page), limit: parseInt(limit), total: students.length }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Courses
  getCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse,
  
  // Assignments
  getAssignments,
  createAssignment,
  
  // Discussions
  getDiscussions,
  createDiscussion,
  
  // Feedback
  getFeedback,
  respondToFeedback,
  submitFeedback,
  
  // Students
  getStudents
};
