import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import learningService from '../../services/learningService';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip
} from '@mui/material';
import {
  School as EnrollIcon,
  Check as EnrolledIcon,
  ExitToApp as UnenrollIcon
} from '@mui/icons-material';

const CourseEnrollmentButton = ({ 
  course,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  showStatus = true,
  onEnrollmentChange
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isAuthenticated && course?._id) {
      checkEnrollmentStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [course?._id, isAuthenticated]);

  const checkEnrollmentStatus = async () => {
    try {
      setCheckingStatus(true);
      const enrolled = await learningService.isEnrolledInCourse(course._id);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      setMessage({ 
        text: 'Please log in to enroll in courses.', 
        type: 'warning' 
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await learningService.enrollInCourse(course._id);
      
      if (response.success) {
        setIsEnrolled(true);
        setMessage({ 
          text: 'Successfully enrolled in the course!', 
          type: 'success' 
        });
        onEnrollmentChange?.(true);
      } else {
        setMessage({ 
          text: response.message || 'Failed to enroll in course.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      setMessage({ 
        text: 'An error occurred while enrolling in the course.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const handleUnenroll = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await learningService.unenrollFromCourse(course._id);
      
      if (response.success) {
        setIsEnrolled(false);
        setMessage({ 
          text: 'Successfully unenrolled from the course.', 
          type: 'info' 
        });
        onEnrollmentChange?.(false);
      } else {
        setMessage({ 
          text: response.message || 'Failed to unenroll from course.', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Unenrollment error:', error);
      setMessage({ 
        text: 'An error occurred while unenrolling from the course.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const openConfirmDialog = (action) => {
    setConfirmDialog({ open: true, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, action: null });
  };

  const executeAction = () => {
    if (confirmDialog.action === 'enroll') {
      handleEnroll();
    } else if (confirmDialog.action === 'unenroll') {
      handleUnenroll();
    }
  };

  if (checkingStatus) {
    return (
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled
        startIcon={<CircularProgress size={16} />}
      >
        Checking...
      </Button>
    );
  }

  return (
    <Box>
      {/* Enrollment Status Chip */}
      {showStatus && isEnrolled && (
        <Box sx={{ mb: 1 }}>
          <Chip
            icon={<EnrolledIcon />}
            label="Enrolled"
            color="success"
            size="small"
            variant="outlined"
          />
        </Box>
      )}

      {/* Main Action Button */}
      {!isEnrolled ? (
        <Button
          variant={variant}
          color="primary"
          size={size}
          fullWidth={fullWidth}
          onClick={() => openConfirmDialog('enroll')}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <EnrollIcon />}
        >
          {loading ? 'Enrolling...' : 'Enroll Now'}
        </Button>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, flexDirection: fullWidth ? 'column' : 'row' }}>
          <Button
            variant="outlined"
            color="primary"
            size={size}
            fullWidth={fullWidth}
            startIcon={<EnrolledIcon />}
            href={`/learning/courses/${course._id}`}
          >
            Continue Learning
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size={size}
            onClick={() => openConfirmDialog('unenroll')}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <UnenrollIcon />}
          >
            {loading ? 'Unenrolling...' : 'Unenroll'}
          </Button>
        </Box>
      )}

      {/* Message Display */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mt: 2 }}
          onClose={() => setMessage({ text: '', type: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {confirmDialog.action === 'enroll' ? 'Enroll in Course' : 'Unenroll from Course'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {confirmDialog.action === 'enroll' ? (
              <>
                Are you sure you want to enroll in <strong>{course?.title}</strong>?
              </>
            ) : (
              <>
                Are you sure you want to unenroll from <strong>{course?.title}</strong>?
                This will remove all your progress in this course.
              </>
            )}
          </Typography>
          {course && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Course Details:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {course.estimatedDuration || course.duration || 'Not specified'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Difficulty: {course.difficulty}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Category: {course.category}
              </Typography>
              {course.lessons && (
                <Typography variant="body2" color="text.secondary">
                  Lessons: {course.lessons.length || course.totalLessons || 'Multiple'}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={executeAction}
            color={confirmDialog.action === 'enroll' ? 'primary' : 'secondary'}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? 'Processing...' : (
              confirmDialog.action === 'enroll' ? 'Enroll' : 'Unenroll'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseEnrollmentButton;
