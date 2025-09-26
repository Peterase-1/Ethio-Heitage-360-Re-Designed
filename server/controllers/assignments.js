const Assignment = require('../models/Assignment');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/assignments');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `assignment-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|ppt|pptx|xls|xlsx|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents, images, and archives are allowed.'));
    }
  }
});

// Create new assignment
const createAssignment = async (req, res) => {
  try {
    const {
      title, description, instructions, courseId, lessonId, type, difficulty,
      totalPoints, dueDate, allowLateSubmission, latePenalty, submissionType,
      allowedFileTypes, maxFileSize, maxSubmissions, gradingType, rubric,
      groupWork, peerReview, resources, visibility, targetStudents, tags, category
    } = req.body;

    // Validate required fields
    if (!title || !description || !instructions || !courseId || !type || !totalPoints || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Create assignment
    const assignment = new Assignment({
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      courseId,
      lessonId,
      type,
      difficulty: difficulty || 'beginner',
      totalPoints: parseInt(totalPoints),
      dueDate: new Date(dueDate),
      allowLateSubmission: allowLateSubmission || false,
      latePenalty: latePenalty || 0,
      submissionType: submissionType || 'mixed',
      allowedFileTypes: allowedFileTypes || [],
      maxFileSize: maxFileSize || 10,
      maxSubmissions: maxSubmissions || 1,
      gradingType: gradingType || 'points',
      rubric: rubric || {},
      groupWork: groupWork || { enabled: false },
      peerReview: peerReview || { enabled: false },
      resources: resources || [],
      visibility: visibility || 'all_students',
      targetStudents: targetStudents || [],
      tags: tags || [],
      category: category || 'homework',
      createdBy: req.user.id
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment'
    });
  }
};

// Get all assignments for a course
const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status, type, category, page = 1, limit = 20 } = req.query;

    const filter = { courseId, isActive: true };
    if (status) {
      if (status === 'upcoming') {
        filter.dueDate = { $gt: new Date() };
      } else if (status === 'overdue') {
        filter.dueDate = { $lt: new Date() };
      }
    }
    if (type) filter.type = type;
    if (category) filter.category = category;

    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Add user-specific submission status if user is authenticated
    let assignmentsWithStatus = assignments;
    if (req.user) {
      assignmentsWithStatus = assignments.map(assignment => {
        const userSubmission = assignment.getSubmissionByStudent(req.user.id);
        return {
          ...assignment.toObject(),
          userSubmission: userSubmission ? {
            status: userSubmission.status,
            submittedAt: userSubmission.submittedAt,
            grade: userSubmission.grade
          } : null,
          canSubmit: assignment.isSubmissionAllowed(req.user.id)
        };
      });
    }

    res.json({
      success: true,
      assignments: assignmentsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: assignments.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
};

// Get single assignment details
const getAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId)
      .populate('createdBy', 'name email')
      .populate('submissions.studentId', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Add user-specific data if authenticated
    let assignmentData = assignment.toObject();
    if (req.user) {
      const userSubmission = assignment.getSubmissionByStudent(req.user.id);
      assignmentData.userSubmission = userSubmission;
      assignmentData.canSubmit = assignment.isSubmissionAllowed(req.user.id);
      assignmentData.daysUntilDue = assignment.daysUntilDue;
      assignmentData.isOverdue = assignment.isOverdue;
    }

    // Hide other students' submissions for regular users
    if (req.user && req.user.role === 'user') {
      assignmentData.submissions = assignmentData.submissions.filter(
        sub => sub.studentId._id.toString() === req.user.id
      );
    }

    res.json({
      success: true,
      assignment: assignmentData
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment'
    });
  }
};

// Submit assignment
const submitAssignment = async (req, res) => {
  upload.array('files', 10)(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${uploadError.message}`
      });
    }

    try {
      const { assignmentId } = req.params;
      const { text, links, timeSpent } = req.body;
      const studentId = req.user.id;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      // Check if submission is allowed
      if (!assignment.isSubmissionAllowed(studentId)) {
        return res.status(403).json({
          success: false,
          message: 'Submission not allowed. Check deadline and submission limits.'
        });
      }

      // Prepare file information
      const files = req.files?.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      })) || [];

      // Create submission
      const submission = {
        studentId,
        content: {
          text: text || '',
          files,
          links: links ? JSON.parse(links) : []
        },
        submittedAt: new Date(),
        timeSpent: parseInt(timeSpent) || 0,
        status: 'submitted'
      };

      // Check if resubmission
      const existingSubmissionIndex = assignment.submissions.findIndex(
        sub => sub.studentId.toString() === studentId
      );

      if (existingSubmissionIndex >= 0) {
        // Update existing submission
        assignment.submissions[existingSubmissionIndex] = {
          ...assignment.submissions[existingSubmissionIndex],
          ...submission,
          attempts: assignment.submissions[existingSubmissionIndex].attempts + 1,
          status: 'resubmitted'
        };
      } else {
        // New submission
        assignment.submissions.push(submission);
      }

      // Calculate and update stats
      await assignment.calculateStats();

      res.json({
        success: true,
        message: 'Assignment submitted successfully',
        submission: assignment.submissions[assignment.submissions.length - 1]
      });
    } catch (error) {
      console.error('Submit assignment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit assignment'
      });
    }
  });
};

// Grade assignment submission
const gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { score, feedback, rubricScores } = req.body;

    // Validate input
    if (score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Score is required'
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Find submission
    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Validate score
    if (score < 0 || score > assignment.totalPoints) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${assignment.totalPoints}`
      });
    }

    // Calculate late penalty if applicable
    const latePenalty = assignment.calculateLatePenalty(submission.submittedAt);
    const finalScore = Math.max(0, score - (score * latePenalty / 100));

    // Update submission grade
    submission.grade = {
      score: finalScore,
      feedback: feedback || '',
      rubricScores: rubricScores || [],
      gradedBy: req.user.id,
      gradedAt: new Date()
    };
    submission.status = 'graded';

    await assignment.save();

    // Create grade record
    const grade = new Grade({
      studentId: submission.studentId,
      courseId: assignment.courseId,
      itemId: assignment._id,
      itemType: 'assignment',
      itemTitle: assignment.title,
      score: finalScore,
      maxScore: assignment.totalPoints,
      feedback: feedback || '',
      rubricScores: rubricScores || [],
      gradedBy: req.user.id,
      isLate: latePenalty > 0,
      latePenalty,
      category: assignment.category,
      weight: 1
    });

    await grade.save();

    // Update assignment stats
    await assignment.calculateStats();

    res.json({
      success: true,
      message: 'Assignment graded successfully',
      grade: submission.grade
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission'
    });
  }
};

// Get assignment statistics (instructor only)
const getAssignmentStats = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId)
      .populate('submissions.studentId', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const submissions = assignment.submissions;
    const totalStudents = await User.countDocuments({ role: 'user' }); // Adjust based on your user model

    const stats = {
      basic: {
        totalSubmissions: submissions.length,
        onTimeSubmissions: assignment.stats.onTimeSubmissions,
        lateSubmissions: assignment.stats.lateSubmissions,
        submissionRate: totalStudents > 0 ? Math.round((submissions.length / totalStudents) * 100) : 0,
        averageScore: assignment.stats.averageScore,
        averageTimeSpent: assignment.stats.averageTimeSpent
      },
      grading: {
        graded: submissions.filter(s => s.status === 'graded').length,
        pending: submissions.filter(s => s.status === 'submitted').length,
        returned: submissions.filter(s => s.status === 'returned').length
      },
      performance: {
        highScores: submissions.filter(s => s.grade?.score >= assignment.totalPoints * 0.9).length,
        mediumScores: submissions.filter(s => s.grade?.score >= assignment.totalPoints * 0.7 && s.grade?.score < assignment.totalPoints * 0.9).length,
        lowScores: submissions.filter(s => s.grade?.score < assignment.totalPoints * 0.7).length
      },
      timeline: {
        dueDate: assignment.dueDate,
        daysUntilDue: assignment.daysUntilDue,
        isOverdue: assignment.isOverdue
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment statistics'
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentStats,
  upload
};
