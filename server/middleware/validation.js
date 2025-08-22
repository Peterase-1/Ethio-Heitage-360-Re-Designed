const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data using express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
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

module.exports = {
  validateRequest
};
