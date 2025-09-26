const express = require('express');
const {
  getPublishedTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getOrganizerTours,
  enrollInTour,
  updateEnrollmentStatus,
  getUserEnrolledTours,
  updateUserProgress,
  addAnnouncement,
  submitFeedback,
  getOrganizerStats,
  getCategories
} = require('../controllers/educationalTourController');

const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/', getPublishedTours);
router.get('/categories', getCategories);
router.get('/:id', getTourById);

// Protected routes - All authenticated users
router.use(auth);

// User specific routes
router.get('/user/enrolled', getUserEnrolledTours);
router.post('/:id/enroll', enrollInTour);
router.put('/:id/progress', updateUserProgress);
router.post('/:id/feedback', submitFeedback);

// Organizer specific routes
router.get('/organizer/my-tours', authorize('organizer'), getOrganizerTours);
router.get('/organizer/stats', authorize('organizer'), getOrganizerStats);
router.post('/', authorize('organizer'), createTour);
router.put('/:id', authorize('organizer'), updateTour);
router.delete('/:id', authorize('organizer'), deleteTour);
router.post('/:id/announcements', authorize('organizer'), addAnnouncement);
router.put('/:tourId/enrollments/:userId', authorize('organizer'), updateEnrollmentStatus);

module.exports = router;
