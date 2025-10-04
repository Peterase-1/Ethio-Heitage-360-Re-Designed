const express = require('express');
const { body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const openaiService = require('../services/openaiService');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Check if OpenAI is configured
const checkOpenAI = (req, res, next) => {
  if (!openaiService.isConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'OpenAI service is not properly configured'
    });
  }
  next();
};

/**
 * @route   GET /api/openai/test
 * @desc    Test OpenAI connection
 * @access  Private (Admin only)
 */
router.get('/test', [auth, checkOpenAI], async (req, res) => {
  try {
    const result = await openaiService.testConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'OpenAI connection successful',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'OpenAI connection failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('OpenAI test error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/openai/generate-artifact-description
 * @desc    Generate AI description for an artifact
 * @access  Private (Museum Admin or higher)
 */
router.post('/generate-artifact-description', [
  auth,
  checkOpenAI,
  body('artifactName').trim().isLength({ min: 1, max: 200 }).withMessage('Artifact name is required'),
  body('category').trim().isLength({ min: 1, max: 100 }).withMessage('Category is required'),
  body('historicalPeriod').trim().isLength({ min: 1, max: 100 }).withMessage('Historical period is required'),
  validateRequest
], async (req, res) => {
  try {
    const { artifactName, category, historicalPeriod } = req.body;
    
    const result = await openaiService.generateArtifactDescription(
      artifactName, 
      category, 
      historicalPeriod
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Artifact description generated successfully',
        data: {
          description: result.description,
          artifactName,
          category,
          historicalPeriod,
          generatedAt: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate artifact description',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Generate artifact description error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/openai/generate-tour-guide
 * @desc    Generate AI tour guide content
 * @access  Private (Museum Admin or higher)
 */
router.post('/generate-tour-guide', [
  auth,
  checkOpenAI,
  body('museumName').trim().isLength({ min: 1, max: 200 }).withMessage('Museum name is required'),
  body('exhibits').isArray().withMessage('Exhibits must be an array'),
  body('exhibits.*').trim().isLength({ min: 1, max: 100 }).withMessage('Each exhibit name must be valid'),
  body('targetAudience').optional().isIn(['general', 'children', 'students', 'adults', 'scholars']).withMessage('Invalid target audience'),
  validateRequest
], async (req, res) => {
  try {
    const { museumName, exhibits, targetAudience = 'general' } = req.body;
    
    const result = await openaiService.generateTourGuide(
      museumName,
      exhibits,
      targetAudience
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Tour guide content generated successfully',
        data: {
          tourGuide: result.tourGuide,
          museumName,
          exhibits,
          targetAudience,
          generatedAt: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate tour guide content',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Generate tour guide error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/openai/generate-educational-content
 * @desc    Generate AI educational content
 * @access  Private
 */
router.post('/generate-educational-content', [
  auth,
  checkOpenAI,
  body('topic').trim().isLength({ min: 1, max: 200 }).withMessage('Topic is required'),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level'),
  body('contentType').optional().isIn(['lesson', 'quiz', 'summary']).withMessage('Invalid content type'),
  validateRequest
], async (req, res) => {
  try {
    const { topic, difficulty = 'intermediate', contentType = 'lesson' } = req.body;
    
    const result = await openaiService.generateEducationalContent(
      topic,
      difficulty,
      contentType
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Educational content generated successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate educational content',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Generate educational content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/openai/chat
 * @desc    AI chatbot for visitor questions
 * @access  Public
 */
router.post('/chat', [
  checkOpenAI,
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be under 1000 characters'),
  body('context').optional().isLength({ max: 500 }).withMessage('Context must be under 500 characters'),
  validateRequest
], async (req, res) => {
  try {
    const { message, context = '' } = req.body;
    
    const result = await openaiService.generateChatResponse(message, context);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Chat response generated successfully',
        data: {
          response: result.response,
          userMessage: message,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate chat response',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Generate chat response error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/openai/recommendations
 * @desc    Generate personalized recommendations
 * @access  Private
 */
router.post('/recommendations', [
  auth,
  checkOpenAI,
  body('preferences').isObject().withMessage('Preferences must be an object'),
  body('visitHistory').optional().isArray().withMessage('Visit history must be an array'),
  validateRequest
], async (req, res) => {
  try {
    const { preferences, visitHistory = [] } = req.body;
    
    const result = await openaiService.generateRecommendations(preferences, visitHistory);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Recommendations generated successfully',
        data: {
          recommendations: result.recommendations,
          preferences,
          visitHistory,
          generatedAt: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate recommendations',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/openai/translate
 * @desc    Translate content to different languages
 * @access  Private
 */
router.post('/translate', [
  auth,
  checkOpenAI,
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content is required and must be under 5000 characters'),
  body('targetLanguage').trim().isLength({ min: 2, max: 50 }).withMessage('Target language is required'),
  validateRequest
], async (req, res) => {
  try {
    const { content, targetLanguage } = req.body;
    
    const result = await openaiService.translateContent(content, targetLanguage);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Content translated successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to translate content',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Translate content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/openai/status
 * @desc    Get OpenAI service status
 * @access  Private
 */
router.get('/status', [auth], (req, res) => {
  try {
    const isConfigured = openaiService.isConfigured();
    
    res.json({
      success: true,
      data: {
        configured: isConfigured,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
        available: isConfigured,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('OpenAI status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
