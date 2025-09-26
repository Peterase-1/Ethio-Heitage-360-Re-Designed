const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Custom validation functions
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

const isValidPhoneNumber = (value) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(value);
};

const isValidTimeFormat = (value) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(value);
};

const isValidDateString = (value) => {
  return !isNaN(Date.parse(value));
};

// Error formatter
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value
  }));
};

/**
 * Middleware to validate request data using express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Debug log
    console.log('Request body:', req.body); // Debug log

    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }

  next();
};

// Validation result handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid input data provided',
      details: formatValidationErrors(errors.array()),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

// Museum validation rules
const validateMuseum = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Museum name must be between 2 and 200 characters')
    .notEmpty()
    .withMessage('Museum name is required'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 500 })
    .withMessage('Location cannot exceed 500 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('contactEmail')
    .trim()
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('contactPhone')
    .optional()
    .trim()
    .custom(value => {
      if (value && !isValidPhoneNumber(value)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),

  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid website URL')
];

// Artifact validation rules
const validateArtifact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Artifact name must be between 2 and 200 characters')
    .notEmpty()
    .withMessage('Artifact name is required'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .notEmpty()
    .withMessage('Description is required'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'pottery', 'jewelry', 'tools', 'weapons', 'manuscripts',
      'coins', 'textiles', 'sculptures', 'paintings',
      'religious-items', 'household-items', 'musical-instruments', 'other'
    ])
    .withMessage('Invalid category selected'),

  body('period')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Period cannot exceed 200 characters'),

  body('material')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Material cannot exceed 200 characters'),

  body('origin')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Origin cannot exceed 200 characters'),

  body('condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'fragile'])
    .withMessage('Invalid condition value'),

  body('status')
    .optional()
    .isIn(['on_display', 'in_storage', 'under_conservation', 'on_loan'])
    .withMessage('Invalid status value'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),

  body('museum')
    .optional()
    .custom(value => {
      if (value && !isValidObjectId(value)) {
        throw new Error('Invalid museum ID');
      }
      return true;
    })
];

// Event validation rules
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event title must be between 3 and 200 characters')
    .notEmpty()
    .withMessage('Event title is required'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .notEmpty()
    .withMessage('Description is required'),

  body('type')
    .notEmpty()
    .withMessage('Event type is required')
    .isIn(['Exhibition', 'Workshop', 'Lecture', 'Special Event', 'Tour', 'Cultural Program'])
    .withMessage('Invalid event type'),

  body('category')
    .notEmpty()
    .withMessage('Event category is required')
    .isIn(['Educational', 'Cultural', 'Permanent', 'Temporary', 'Community', 'Professional'])
    .withMessage('Invalid event category'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .custom(value => {
      if (!isValidDateString(value)) {
        throw new Error('Invalid start date format');
      }
      return true;
    }),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .custom((value, { req }) => {
      if (!isValidDateString(value)) {
        throw new Error('Invalid end date format');
      }
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate < startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('time')
    .optional()
    .trim()
    .matches(/^[0-9]{1,2}:[0-9]{2}(-[0-9]{1,2}:[0-9]{2})?$/)
    .withMessage('Invalid time format. Use HH:MM or HH:MM-HH:MM'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 300 })
    .withMessage('Location cannot exceed 300 characters'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be between 1 and 10000'),

  body('ticketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be a positive number'),

  body('museum')
    .optional()
    .custom(value => {
      if (value && !isValidObjectId(value)) {
        throw new Error('Invalid museum ID');
      }
      return true;
    })
];

// Staff validation rules
const validateStaff = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .optional()
    .trim()
    .custom(value => {
      if (value && !isValidPhoneNumber(value)) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn([
      'Senior Curator', 'Education Coordinator', 'Conservation Specialist',
      'Digital Archivist', 'Security Officer', 'Tour Guide', 'Registrar',
      'Collections Manager', 'Exhibitions Coordinator', 'Marketing Coordinator',
      'Administrative Assistant', 'Other'
    ])
    .withMessage('Invalid role selected'),

  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isIn([
      'Collections', 'Education', 'Conservation', 'Digital',
      'Security', 'Administration', 'Marketing', 'Research', 'Operations'
    ])
    .withMessage('Invalid department selected'),

  body('hireDate')
    .notEmpty()
    .withMessage('Hire date is required')
    .custom(value => {
      if (!isValidDateString(value)) {
        throw new Error('Invalid hire date format');
      }
      const hireDate = new Date(value);
      const now = new Date();
      if (hireDate > now) {
        throw new Error('Hire date cannot be in the future');
      }
      return true;
    }),

  body('museum')
    .notEmpty()
    .withMessage('Museum assignment is required')
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid museum ID');
      }
      return true;
    })
];

// Rental validation rules
const validateRental = [
  body('artifactId')
    .notEmpty()
    .withMessage('Artifact ID is required')
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error('Invalid artifact ID');
      }
      return true;
    }),

  body('requester')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Requester name must be between 2 and 200 characters')
    .notEmpty()
    .withMessage('Requester name is required'),

  body('requesterEmail')
    .trim()
    .notEmpty()
    .withMessage('Requester email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('purpose')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Purpose must be between 10 and 500 characters')
    .notEmpty()
    .withMessage('Purpose is required'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .custom(value => {
      if (!isValidDateString(value)) {
        throw new Error('Invalid start date format');
      }
      const startDate = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Set to beginning of today
      if (startDate < now) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .custom((value, { req }) => {
      if (!isValidDateString(value)) {
        throw new Error('Invalid end date format');
      }
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }

      // Check maximum rental period (e.g., 6 months)
      const maxDays = 180;
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > maxDays) {
        throw new Error(`Rental period cannot exceed ${maxDays} days`);
      }

      return true;
    }),

  body('organization')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Organization name cannot exceed 200 characters')
];

// ID parameter validation
const validateObjectId = (paramName = 'id', fieldName = 'ID') => [
  param(paramName)
    .custom(value => {
      if (!isValidObjectId(value)) {
        throw new Error(`Invalid ${fieldName}`);
      }
      return true;
    })
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Query parameter validation for search and filtering
const validateSearchQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Sort field must be between 1 and 50 characters'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc', '1', '-1'])
    .withMessage('Sort order must be asc, desc, 1, or -1'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),

  query('museum')
    .optional()
    .custom(value => {
      if (value && !isValidObjectId(value)) {
        throw new Error('Invalid museum ID in query');
      }
      return true;
    })
];

// Update validation (partial validation for PATCH requests)
const validatePartialUpdate = (validationRules) => {
  return validationRules.map(rule => rule.optional());
};

module.exports = {
  // Original function
  validateRequest,

  // Core validation handlers
  handleValidationErrors,

  // Entity validation rules
  validateMuseum,
  validateArtifact,
  validateEvent,
  validateStaff,
  validateRental,

  // Parameter validation
  validateObjectId,
  validatePagination,

  // Query validation
  validateSearchQuery,

  // Update validation
  validatePartialUpdate,

  // Custom validators
  isValidObjectId,
  isValidEmail,
  isValidPhoneNumber,
  isValidTimeFormat,
  isValidDateString,

  // Utility functions
  formatValidationErrors,

  // Compound validation chains (commonly used combinations)
  validateMuseumCreation: [...validateMuseum, handleValidationErrors],
  validateMuseumUpdate: [...validatePartialUpdate(validateMuseum), handleValidationErrors],

  validateArtifactCreation: [...validateArtifact, handleValidationErrors],
  validateArtifactUpdate: [...validatePartialUpdate(validateArtifact), handleValidationErrors],

  validateEventCreation: [...validateEvent, handleValidationErrors],
  validateEventUpdate: [...validatePartialUpdate(validateEvent), handleValidationErrors],

  validateStaffCreation: [...validateStaff, handleValidationErrors],
  validateStaffUpdate: [...validatePartialUpdate(validateStaff), handleValidationErrors],

  validateRentalCreation: [...validateRental, handleValidationErrors],

  validateIdParam: [...validateObjectId(), handleValidationErrors],
  validateSearchParams: [...validateSearchQuery, handleValidationErrors]
};
