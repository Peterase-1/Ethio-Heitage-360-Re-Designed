const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');
const fs = require('fs').promises;
const path = require('path');
const { validationResult } = require('express-validator');

/**
 * @desc    Create new artifact
 * @route   POST /api/artifacts
 * @access  Private
 */
exports.createArtifact = async (req, res) => {
  try {
    console.log('=== CREATE ARTIFACT DEBUG ===');
    console.log('Request user:', req.user ? {
      id: req.user._id,
      role: req.user.role,
      museumId: req.user.museumId,
      email: req.user.email
    } : 'No user');
    console.log('Request body:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    // Extract artifact data from request body
    const artifactData = {
      ...req.body,
      createdBy: req.user?.id || req.user?._id || null
    };

    // Normalize basic fields coming from UI
    if (artifactData.period && typeof artifactData.period === 'string') {
      artifactData.period = { era: artifactData.period };
    }
    if (artifactData.origin && typeof artifactData.origin === 'string') {
      artifactData.origin = { region: artifactData.origin };
    }

    // Infer museum from logged-in user if not provided
    if (!artifactData.museum && req.user && req.user.museumId) {
      artifactData.museum = req.user.museumId;
      console.log('Inferred museum from user:', req.user.museumId);
    }

    if (!artifactData.museum) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MUSEUM_REQUIRED',
          message: 'Museum is required to create an artifact. Please ensure you are logged in as a museum admin or provide a museum ID.',
          details: {
            userHasMuseumId: !!(req.user && req.user.museumId),
            userRole: req.user ? req.user.role : 'not authenticated'
          }
        }
      });
    }

    // Verify museum exists and user has access
    const museum = await Museum.findById(artifactData.museum);
    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    // Check museum access permissions
    if (req.user && req.user.role !== 'superAdmin') {
      const userMuseumId = (req.user.museumId && req.user.museumId.toString()) || null;
      const targetMuseumId = museum._id.toString();

      // Museum admin and staff must belong to the same museum
      if (!userMuseumId || userMuseumId !== targetMuseumId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Not authorized to add artifacts to this museum'
          }
        });
      }
    }

    // Generate unique accession number if not provided
    if (!artifactData.accessionNumber) {
      const count = await Artifact.countDocuments({ museum: artifactData.museum });
      const museumCode = museum.name.substring(0, 3).toUpperCase();
      artifactData.accessionNumber = `${museumCode}-${Date.now()}-${count + 1}`;
    }

    // Create new artifact
    const artifact = await Artifact.create(artifactData);

    // Populate museum information
    await artifact.populate('museum', 'name location');
    await artifact.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: artifact,
      message: 'Artifact created successfully'
    });

  } catch (error) {
    console.error('Error creating artifact:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Artifact with this accession number already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create artifact',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Get all artifacts with filtering, pagination, and search
 * @route   GET /api/artifacts
 * @access  Public
 */
exports.listArtifacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Increased limit to show more artifacts
    const skip = (page - 1) * limit;

    // Build query object - show all artifacts for authenticated users
    let query = {};

    // For public access, filter by status and visibility
    if (!req.user) {
      query.isActive = true;
      query.status = { $in: ['on_display', 'published', 'approved'] };
      query.visibility = 'public';
    }
    // For authenticated users, show ALL artifacts by default
    // No default filtering applied - user sees everything

    // Apply filters
    if (req.query.museum) query.museum = req.query.museum;
    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;
    if (req.query.condition) query.condition = req.query.condition;
    if (req.query.featured !== undefined) query.featured = req.query.featured === 'true';
    if (req.query.period) query['period.era'] = req.query.period;

    // Debug logging
    console.log('=== LIST ARTIFACTS DEBUG ===');
    console.log('User authenticated:', !!req.user);
    console.log('User role:', req.user?.role);
    console.log('Query parameters:', req.query);
    console.log('Final query:', JSON.stringify(query, null, 2));

    // Build sort object
    let sortObj = {};
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sortObj[req.query.sortBy] = sortOrder;
    } else {
      sortObj = { createdAt: -1 }; // Default sort by newest
    }

    // Execute query with pagination
    const artifacts = await Artifact.find(query)
      .populate('museum', 'name location imageUrl')
      .populate('createdBy', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalItems = await Artifact.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Get available filter options
    const filterOptions = {
      categories: await Artifact.distinct('category', { isActive: true }),
      periods: await Artifact.distinct('period.era', { isActive: true }),
      conditions: await Artifact.distinct('condition', { isActive: true }),
      museums: await Museum.find({ isActive: true }, 'name').lean()
    };

    res.status(200).json({
      success: true,
      data: {
        artifacts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: filterOptions
      }
    });

  } catch (error) {
    console.error('Error listing artifacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve artifacts',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Search artifacts with advanced filtering
 * @route   GET /api/artifacts/search
 * @access  Public
 */
exports.searchArtifacts = async (req, res) => {
  try {
    const { q, category, status, condition, period, featured, museum, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {
      isActive: true,
      status: { $in: ['on_display', 'published', 'approved'] },
      visibility: 'public'
    };

    // Text search
    if (q) {
      searchQuery.$text = { $search: q };
    }

    // Apply filters
    if (category) searchQuery.category = category;
    if (status) searchQuery.status = status;
    if (condition) searchQuery.condition = condition;
    if (period) searchQuery['period.era'] = period;
    if (featured !== undefined) searchQuery.featured = featured === 'true';
    if (museum) searchQuery.museum = museum;

    // Execute search query
    let queryBuilder = Artifact.find(searchQuery)
      .populate('museum', 'name location imageUrl')
      .populate('createdBy', 'name')
      .skip(skip)
      .limit(parseInt(limit));

    // Sort by text score if searching, otherwise by date
    if (q) {
      queryBuilder = queryBuilder.sort({ score: { $meta: 'textScore' } });
    } else {
      queryBuilder = queryBuilder.sort({ createdAt: -1 });
    }

    const artifacts = await queryBuilder.lean();
    const totalItems = await Artifact.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: {
        artifacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          limit: parseInt(limit)
        },
        searchQuery: { q, category, status, condition, period, featured, museum }
      }
    });

  } catch (error) {
    console.error('Error searching artifacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to search artifacts',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Get artifacts by museum
 * @route   GET /api/artifacts/museum/:museumId
 * @access  Public
 */
exports.getArtifactsByMuseum = async (req, res) => {
  try {
    const { museumId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Verify museum exists
    const museum = await Museum.findById(museumId);
    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    // Build query
    let query = {
      museum: museumId,
      isActive: true,
      status: { $in: ['on_display', 'published', 'approved'] },
      visibility: 'public'
    };

    // Apply additional filters
    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;
    if (req.query.featured !== undefined) query.featured = req.query.featured === 'true';

    const artifacts = await Artifact.find(query)
      .populate('museum', 'name location')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalItems = await Artifact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        museum: {
          id: museum._id,
          name: museum.name,
          location: museum.location
        },
        artifacts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error getting museum artifacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve museum artifacts',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Get single artifact
 * @route   GET /api/artifacts/:id
 * @access  Public
 */
exports.getArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id)
      .populate('museum', 'name location contactEmail contactPhone website')
      .populate('createdBy', 'name email')
      .populate('likes.user', 'name')
      .lean();

    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIFACT_NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    // Increment view count (without awaiting to improve performance)
    Artifact.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    res.status(200).json({
      success: true,
      data: artifact
    });

  } catch (error) {
    console.error('Error getting artifact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve artifact',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Update artifact
 * @route   PUT /api/artifacts/:id
 * @access  Private
 */
exports.updateArtifact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIFACT_NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    // Check permissions
    const museum = await Museum.findById(artifact.museum);
    if (req.user.role !== 'superAdmin' &&
      museum.admin.toString() !== req.user._id.toString() &&
      artifact.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Not authorized to update this artifact'
        }
      });
    }

    // Update artifact - only validate fields that are being updated
    const updateData = { ...req.body };

    // Handle period and origin normalization if they're being updated
    if (updateData.period && typeof updateData.period === 'string') {
      updateData.period = { era: updateData.period };
    }
    if (updateData.origin && typeof updateData.origin === 'string') {
      updateData.origin = { region: updateData.origin };
    }

    const updatedArtifact = await Artifact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: false } // Don't run validators for partial updates
    ).populate('museum', 'name location')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: updatedArtifact,
      message: 'Artifact updated successfully'
    });

  } catch (error) {
    console.error('Error updating artifact:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: 'Artifact with this accession number already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update artifact',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Delete artifact (soft delete)
 * @route   DELETE /api/artifacts/:id
 * @access  Private
 */
exports.deleteArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIFACT_NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    // Check permissions
    const museum = await Museum.findById(artifact.museum);
    if (req.user.role !== 'superAdmin' &&
      museum.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Not authorized to delete this artifact'
        }
      });
    }

    // Hard delete - actually remove from database
    await Artifact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Artifact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting artifact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete artifact',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Upload artifact images
 * @route   POST /api/artifacts/:id/images
 * @access  Private
 */
exports.uploadArtifactImages = async (req, res) => {
  try {
    console.log('=== UPLOAD IMAGES DEBUG ===');
    console.log('Artifact ID:', req.params.id);
    console.log('User:', req.user?.email, req.user?.role);
    console.log('Files received:', req.files?.length || 0);
    console.log('Method:', req.method);

    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIFACT_NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES_UPLOADED',
          message: 'No image files were uploaded'
        }
      });
    }

    // Debug: Check file details
    console.log('Uploaded files details:');
    req.files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        originalname: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      });
    });

    // Ensure media structure exists
    if (!artifact.media) {
      artifact.media = { images: [], videos: [] };
    }
    if (!Array.isArray(artifact.media.images)) {
      artifact.media.images = [];
    }

    // Process uploaded images
    const uploadedImages = req.files.map(file => {
      // Verify file exists and has content
      const fs = require('fs');
      const filePath = file.path;
      const stats = fs.statSync(filePath);
      console.log(`File ${file.filename} stats:`, {
        size: stats.size,
        exists: fs.existsSync(filePath),
        path: filePath
      });

      if (stats.size === 0) {
        console.error(`WARNING: File ${file.filename} has 0 bytes!`);
      }

      return {
        url: `/uploads/artifacts/images/${file.filename}`,
        caption: req.body.caption || '',
        isPrimary: false,
        uploadedAt: new Date()
      };
    });

    // Add images to artifact
    const wasEmpty = artifact.media.images.length === 0;
    artifact.media.images.push(...uploadedImages);
    if (wasEmpty && artifact.media.images.length > 0) {
      artifact.media.images[0].isPrimary = true;
    }

    console.log('Before save - artifact.media.images:', artifact.media.images);

    // Use findByIdAndUpdate to avoid validation issues with the entire document
    await Artifact.findByIdAndUpdate(
      req.params.id,
      { 'media.images': artifact.media.images },
      { new: true, runValidators: false }
    );

    console.log('After save - artifact.media.images:', artifact.media.images);

    res.status(200).json({
      success: true,
      data: {
        uploaded: uploadedImages.length,
        images: artifact.media.images.map(img => ({ url: img.url, isPrimary: img.isPrimary }))
      },
      message: 'Images uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading artifact images:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to upload images',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Upload 3D model for artifact
 * @route   POST /api/artifacts/:id/model
 * @access  Private
 */
exports.upload3DModel = async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIFACT_NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE_UPLOADED',
          message: 'No 3D model file was uploaded'
        }
      });
    }

    // Remove old 3D model file if exists
    if (artifact.media.model3D && artifact.media.model3D.url) {
      try {
        const oldFilePath = path.join(__dirname, '..', artifact.media.model3D.url);
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.error('Error deleting old 3D model:', err);
      }
    }

    // Add 3D model to artifact
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const format = fileExtension.replace('.', '');

    artifact.media.model3D = {
      url: `/uploads/artifacts/models/${req.file.filename}`,
      filename: req.file.filename,
      format: format,
      size: req.file.size,
      uploadedAt: new Date()
    };

    await artifact.save();

    res.status(200).json({
      success: true,
      data: {
        model3D: {
          url: artifact.media.model3D.url,
          filename: artifact.media.model3D.filename,
          format: artifact.media.model3D.format,
          size: artifact.media.model3D.size
        }
      },
      message: '3D model uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading 3D model:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to upload 3D model',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Delete artifact media
 * @route   DELETE /api/artifacts/:id/media/:mediaId
 * @access  Private
 */
exports.deleteArtifactMedia = async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIFACT_NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    const { mediaId } = req.params;
    let mediaDeleted = false;
    let filePath = null;

    // Try to find and remove from images
    const imageIndex = artifact.media.images.findIndex(img => img._id.toString() === mediaId);
    if (imageIndex !== -1) {
      filePath = path.join(__dirname, '..', artifact.media.images[imageIndex].url);
      artifact.media.images.splice(imageIndex, 1);
      mediaDeleted = true;
    }

    // If not found in images and mediaId matches 3D model, remove 3D model
    if (!mediaDeleted && artifact.media.model3D && artifact.media.model3D._id.toString() === mediaId) {
      filePath = path.join(__dirname, '..', artifact.media.model3D.url);
      artifact.media.model3D = undefined;
      mediaDeleted = true;
    }

    if (!mediaDeleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MEDIA_NOT_FOUND',
          message: 'Media file not found'
        }
      });
    }

    // Delete physical file
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

    await artifact.save();

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting artifact media:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete media',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Update artifact status
 * @route   PUT /api/artifacts/:id/status
 * @access  Private
 */
exports.updateArtifactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_STATUS',
          message: 'Status is required'
        }
      });
    }

    const validStatuses = ['on_display', 'in_storage', 'under_conservation', 'on_loan', 'draft', 'pending-review', 'approved', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid status value'
        }
      });
    }

    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIFACT_NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    // Update status and related fields
    artifact.status = status;
    if (status === 'on_display') {
      artifact.isOnDisplay = true;
    } else {
      artifact.isOnDisplay = false;
    }

    await artifact.save();

    res.status(200).json({
      success: true,
      data: {
        id: artifact._id,
        status: artifact.status,
        isOnDisplay: artifact.isOnDisplay
      },
      message: 'Artifact status updated successfully'
    });

  } catch (error) {
    console.error('Error updating artifact status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update artifact status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * @desc    Toggle featured status
 * @route   PUT /api/artifacts/:id/featured
 * @access  Private
 */
exports.toggleFeaturedStatus = async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ARTIFACT_NOT_FOUND',
          message: 'Artifact not found'
        }
      });
    }

    // Toggle featured status
    artifact.featured = !artifact.featured;
    await artifact.save();

    res.status(200).json({
      success: true,
      data: {
        id: artifact._id,
        featured: artifact.featured
      },
      message: `Artifact ${artifact.featured ? 'marked as featured' : 'removed from featured'}`
    });

  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update featured status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};
