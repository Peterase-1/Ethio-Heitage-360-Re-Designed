const Museum = require('../models/Museum');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Create a new museum
 * @route   POST /api/museums
 * @access  Private (superAdmin, museumAdmin)
 */
exports.createMuseum = async (req, res) => {
  try {
    // Check validation errors
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

    const {
      name,
      location,
      description,
      contactEmail,
      contactPhone,
      website,
      address,
      operatingHours,
      settings,
      socialMedia
    } = req.body;

    // Check if museum with email already exists
    const existingMuseum = await Museum.findOne({ contactEmail });
    if (existingMuseum) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'MUSEUM_EXISTS',
          message: 'Museum with this email already exists'
        }
      });
    }

    // Create museum
    const museum = new Museum({
      name,
      location,
      description,
      contactEmail,
      contactPhone,
      website,
      address,
      operatingHours,
      settings: {
        allowRentals: settings?.allowRentals ?? true,
        maxRentalDuration: settings?.maxRentalDuration ?? 30,
        requireInsurance: settings?.requireInsurance ?? true,
        autoApproveRentals: settings?.autoApproveRentals ?? false
      },
      socialMedia,
      admin: req.user.userId
    });

    await museum.save();

    res.status(201).json({
      success: true,
      data: museum,
      message: 'Museum created successfully'
    });

  } catch (error) {
    console.error('Create museum error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Get single museum by ID
 * @route   GET /api/museums/:id
 * @access  Public
 */
exports.getMuseum = async (req, res) => {
  try {
    const { id } = req.params;

    const museum = await Museum.findById(id)
      .populate('admin', 'name email')
      .select('-__v');

    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: museum
    });

  } catch (error) {
    console.error('Get museum error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MUSEUM_ID',
          message: 'Invalid museum ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Update museum
 * @route   PUT /api/museums/:id
 * @access  Private (superAdmin, museumAdmin for own museum)
 */
exports.updateMuseum = async (req, res) => {
  try {
    // Check validation errors
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

    const { id } = req.params;
    const updateData = req.body;

    // Find the museum first
    const museum = await Museum.findById(id);
    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    // Check authorization (superAdmin can edit any museum, museumAdmin can edit only their own)
    if (req.user.role !== 'superAdmin') {
      if (req.user.role !== 'museumAdmin' || req.user.museum !== id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only update your own museum'
          }
        });
      }
    }

    // Check if email is being changed and if it already exists
    if (updateData.contactEmail && updateData.contactEmail !== museum.contactEmail) {
      const existingMuseum = await Museum.findOne({
        contactEmail: updateData.contactEmail,
        _id: { $ne: id }
      });

      if (existingMuseum) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Museum with this email already exists'
          }
        });
      }
    }

    // Update museum
    const updatedMuseum = await Museum.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('admin', 'name email');

    res.status(200).json({
      success: true,
      data: updatedMuseum,
      message: 'Museum updated successfully'
    });

  } catch (error) {
    console.error('Update museum error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MUSEUM_ID',
          message: 'Invalid museum ID format'
        }
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Museum with this email already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Delete museum (soft delete)
 * @route   DELETE /api/museums/:id
 * @access  Private (superAdmin only)
 */
exports.deleteMuseum = async (req, res) => {
  try {
    const { id } = req.params;

    // Only superAdmin can delete museums
    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Only super administrators can delete museums'
        }
      });
    }

    const museum = await Museum.findById(id);
    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    // Soft delete by adding deleted flag and timestamp
    museum.deleted = true;
    museum.deletedAt = new Date();
    museum.updatedAt = new Date();
    await museum.save();

    res.status(200).json({
      success: true,
      message: 'Museum deleted successfully'
    });

  } catch (error) {
    console.error('Delete museum error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MUSEUM_ID',
          message: 'Invalid museum ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Get all museums with pagination, search, and filtering
 * @route   GET /api/museums
 * @access  Public
 */
exports.listMuseums = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'name',
      sortOrder = 'asc',
      location = '',
      allowRentals = ''
    } = req.query;

    // Build search query
    let searchQuery = { deleted: { $ne: true } }; // Exclude soft-deleted museums

    // Text search across name, location, and description
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    // Rental settings filter
    if (allowRentals !== '') {
      searchQuery['settings.allowRentals'] = allowRentals === 'true';
    }

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query with pagination
    const [museums, totalCount] = await Promise.all([
      Museum.find(searchQuery)
        .populate('admin', 'name email')
        .select('-__v')
        .sort(sortObject)
        .skip(skip)
        .limit(limitNum),
      Museum.countDocuments(searchQuery)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        museums,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? parseInt(page) + 1 : null,
          prevPage: hasPrevPage ? parseInt(page) - 1 : null
        }
      }
    });

  } catch (error) {
    console.error('List museums error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Upload museum images
 * @route   POST /api/museums/:id/images
 * @access  Private (superAdmin, museumAdmin for own museum)
 */
exports.uploadMuseumImages = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the museum first
    const museum = await Museum.findById(id);
    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    // Check authorization
    if (req.user.role !== 'superAdmin') {
      if (req.user.role !== 'museumAdmin' || req.user.museum !== id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only upload images to your own museum'
          }
        });
      }
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES',
          message: 'No image files uploaded'
        }
      });
    }

    // Process uploaded images
    const uploadedImages = req.files.map(file => ({
      url: `/uploads/museums/images/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date()
    }));

    // Update museum with new images (append to existing images)
    museum.images = museum.images || [];
    museum.images.push(...uploadedImages);
    museum.updatedAt = new Date();

    await museum.save();

    res.status(200).json({
      success: true,
      data: {
        uploadedImages,
        totalImages: museum.images.length
      },
      message: 'Images uploaded successfully'
    });

  } catch (error) {
    console.error('Upload museum images error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MUSEUM_ID',
          message: 'Invalid museum ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Delete museum image
 * @route   DELETE /api/museums/:id/images/:imageId
 * @access  Private (superAdmin, museumAdmin for own museum)
 */
exports.deleteMuseumImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Find the museum first
    const museum = await Museum.findById(id);
    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    // Check authorization
    if (req.user.role !== 'superAdmin') {
      if (req.user.role !== 'museumAdmin' || req.user.museum !== id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only delete images from your own museum'
          }
        });
      }
    }

    // Find the image to delete
    const imageIndex = museum.images.findIndex(img => img._id.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: 'Image not found'
        }
      });
    }

    const imageToDelete = museum.images[imageIndex];

    // Delete the physical file
    const imagePath = path.join(__dirname, '../../uploads/museums/images', imageToDelete.filename);
    try {
      await fs.unlink(imagePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError.message);
      // Continue with database cleanup even if file deletion fails
    }

    // Remove image from museum record
    museum.images.splice(imageIndex, 1);
    museum.updatedAt = new Date();

    await museum.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: {
        remainingImages: museum.images.length
      }
    });

  } catch (error) {
    console.error('Delete museum image error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid museum or image ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Get museum statistics
 * @route   GET /api/museums/:id/stats
 * @access  Private (superAdmin, museumAdmin for own museum, staff)
 */
exports.getMuseumStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the museum first
    const museum = await Museum.findById(id);
    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    // Check authorization
    if (req.user.role !== 'superAdmin') {
      if (req.user.role !== 'museumAdmin' || req.user.museum !== id) {
        if (req.user.role !== 'staff' || req.user.museum !== id) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'ACCESS_DENIED',
              message: 'You can only view statistics for your own museum'
            }
          });
        }
      }
    }

    // Get related statistics (using dynamic imports to avoid circular dependencies)
    const [
      Artifact,
      Event,
      Staff,
      RentalRequest
    ] = await Promise.all([
      require('../models/Artifact'),
      require('../models/Event'),
      require('../models/Staff'),
      require('../models/RentalRequest')
    ]);

    const [
      totalArtifacts,
      onDisplayArtifacts,
      featuredArtifacts,
      totalEvents,
      activeEvents,
      totalStaff,
      activeStaff,
      totalRentals,
      pendingRentals
    ] = await Promise.all([
      Artifact.countDocuments({ museum: id }),
      Artifact.countDocuments({ museum: id, status: 'on_display' }),
      Artifact.countDocuments({ museum: id, featured: true }),
      Event.countDocuments({ museum: id }),
      Event.countDocuments({ museum: id, status: 'active' }),
      Staff.countDocuments({ museum: id }),
      Staff.countDocuments({ museum: id, status: 'active' }),
      RentalRequest.countDocuments({ museum: id }),
      RentalRequest.countDocuments({ museum: id, status: 'pending' })
    ]);

    const stats = {
      artifacts: {
        total: totalArtifacts,
        onDisplay: onDisplayArtifacts,
        featured: featuredArtifacts,
        inStorage: totalArtifacts - onDisplayArtifacts
      },
      events: {
        total: totalEvents,
        active: activeEvents,
        completed: totalEvents - activeEvents
      },
      staff: {
        total: totalStaff,
        active: activeStaff,
        inactive: totalStaff - activeStaff
      },
      rentals: {
        total: totalRentals,
        pending: pendingRentals,
        processed: totalRentals - pendingRentals
      }
    };

    res.status(200).json({
      success: true,
      data: {
        museum: {
          id: museum._id,
          name: museum.name,
          location: museum.location
        },
        stats
      }
    });

  } catch (error) {
    console.error('Get museum stats error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MUSEUM_ID',
          message: 'Invalid museum ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Get museum profile (for museum admin's own museum)
 * @route   GET /api/museums/profile
 * @access  Private (museumAdmin, staff)
 */
exports.getMuseumProfile = async (req, res) => {
  try {
    console.log('=== GET MUSEUM PROFILE DEBUG ===');
    console.log('User:', req.user);

    // Get museum ID from user's profile
    let museumId = req.user.museumId;

    // If museumId is not directly available, try to find it from the Museum collection
    if (!museumId) {
      console.log('No museumId in user, searching by admin field...');
      const museum = await Museum.findOne({ admin: req.user._id });
      if (museum) {
        museumId = museum._id;
        console.log('Found museum by admin:', museumId);
      }
    }

    console.log('Using museumId:', museumId);

    if (!museumId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_MUSEUM_ASSOCIATED',
          message: 'User is not associated with any museum'
        }
      });
    }

    // Find the museum
    const museum = await Museum.findById(museumId)
      .populate('admin', 'name email')
      .select('-__v');

    console.log('Found museum:', museum);

    if (!museum) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MUSEUM_NOT_FOUND',
          message: 'Museum not found'
        }
      });
    }

    // Check if user has access to this museum
    if (req.user.role !== 'superAdmin' &&
      req.user.role !== 'museumAdmin' &&
      req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to access this museum profile'
        }
      });
    }

    // Format the response to match frontend expectations
    const profileData = {
      name: museum.name,
      description: museum.description,
      location: museum.location?.address || '',
      phone: museum.contactInfo?.phone || '',
      email: museum.contactInfo?.email || '',
      website: museum.contactInfo?.website || '',
      openingHours: museum.operatingHours ?
        `${museum.operatingHours.monday?.open || '9:00 AM'} - ${museum.operatingHours.monday?.close || '6:00 PM'}` :
        '9:00 AM - 6:00 PM',
      admissionFee: museum.admissionFee?.adult || 0,
      capacity: museum.capacity || 0,
      founded: museum.founded || '',
      languages: museum.languages || [],
      facilities: museum.facilities || [],
      logo: museum.logo || null,
      images: museum.images || [],
      features: museum.features || {},
      statistics: museum.statistics || {}
    };

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Get museum profile error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MUSEUM_ID',
          message: 'Invalid museum ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Update museum profile (for museum admin's own museum)
 * @route   PUT /api/museums/profile
 * @access  Private (museumAdmin, staff)
 */
exports.updateMuseumProfile = async (req, res) => {
  try {
    console.log('=== UPDATE MUSEUM PROFILE DEBUG ===');
    console.log('User:', req.user);

    // Get museum ID from user's profile
    let museumId = req.user.museumId;

    // If museumId is not directly available, try to find it from the Museum collection
    if (!museumId) {
      console.log('No museumId in user, searching by admin field...');
      const museum = await Museum.findOne({ admin: req.user._id });
      if (museum) {
        museumId = museum._id;
        console.log('Found museum by admin:', museumId);
      }
    }

    console.log('Using museumId:', museumId);

    if (!museumId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_MUSEUM_ASSOCIATED',
          message: 'User is not associated with any museum'
        }
      });
    }

    // Find the museum
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

    // Check if user has permission to update this museum
    if (req.user.role !== 'superAdmin' &&
      req.user.role !== 'museumAdmin' &&
      req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to update this museum profile'
        }
      });
    }

    const {
      name,
      description,
      location,
      phone,
      email,
      website,
      openingHours,
      admissionFee,
      capacity,
      founded,
      languages,
      facilities
    } = req.body;

    console.log('=== UPDATE MUSEUM PROFILE DEBUG ===');
    console.log('Museum ID:', museumId);
    console.log('User:', req.user);
    console.log('Request body:', req.body);

    // Update museum fields
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) {
      updateData['location.address'] = location;
    }
    if (phone !== undefined) updateData['contactInfo.phone'] = phone;
    if (email !== undefined) updateData['contactInfo.email'] = email;
    if (website !== undefined) updateData['contactInfo.website'] = website;
    if (admissionFee !== undefined) updateData['admissionFee.adult'] = admissionFee;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (founded !== undefined) updateData.founded = founded;
    if (languages !== undefined) updateData.languages = languages;
    if (facilities !== undefined) updateData.facilities = facilities;

    // Parse opening hours if provided
    if (openingHours !== undefined) {
      // Simple parsing - assumes format like "9:00 AM - 6:00 PM"
      const [openTime, closeTime] = openingHours.split(' - ');
      if (openTime && closeTime) {
        updateData['operatingHours.monday.open'] = openTime.trim();
        updateData['operatingHours.monday.close'] = closeTime.trim();
        updateData['operatingHours.monday.closed'] = false;
        // Apply same hours to all days for simplicity
        ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
          updateData[`operatingHours.${day}.open`] = openTime.trim();
          updateData[`operatingHours.${day}.close`] = closeTime.trim();
          updateData[`operatingHours.${day}.closed`] = false;
        });
      }
    }

    console.log('Update data:', updateData);

    // Update the museum
    try {
      const updatedMuseum = await Museum.findByIdAndUpdate(
        museumId,
        updateData,
        {
          new: true,
          runValidators: false  // Disable validators to avoid issues with required fields
        }
      ).populate('admin', 'name email');

      console.log('Updated museum:', updatedMuseum);

      if (!updatedMuseum) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MUSEUM_NOT_FOUND',
            message: 'Museum not found after update'
          }
        });
      }

      res.status(200).json({
        success: true,
        data: updatedMuseum,
        message: 'Museum profile updated successfully'
      });
    } catch (updateError) {
      console.error('Database update error:', updateError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update museum profile',
          details: updateError.message
        }
      });
    }

  } catch (error) {
    console.error('Update museum profile error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MUSEUM_ID',
          message: 'Invalid museum ID format'
        }
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Museum with this email already exists'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};

/**
 * @desc    Upload museum logo
 * @route   POST /api/museums/profile/logo
 * @access  Private (museumAdmin, staff)
 */
exports.uploadMuseumLogo = async (req, res) => {
  try {
    console.log('=== UPLOAD MUSEUM LOGO DEBUG ===');
    console.log('User:', req.user);

    // Get museum ID from user's profile
    let museumId = req.user.museumId;

    // If museumId is not directly available, try to find it from the Museum collection
    if (!museumId) {
      console.log('No museumId in user, searching by admin field...');
      const museum = await Museum.findOne({ admin: req.user._id });
      if (museum) {
        museumId = museum._id;
        console.log('Found museum by admin:', museumId);
      }
    }

    console.log('Using museumId:', museumId);

    if (!museumId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_MUSEUM_ASSOCIATED',
          message: 'User is not associated with any museum'
        }
      });
    }

    // Find the museum
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

    // Check if user has permission to update this museum
    if (req.user.role !== 'superAdmin' &&
      req.user.role !== 'museumAdmin' &&
      req.user.role !== 'staff') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You do not have permission to update this museum logo'
        }
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No logo file uploaded'
        }
      });
    }

    // Delete old logo file if it exists
    if (museum.logo && museum.logo.filename) {
      const oldLogoPath = path.join(__dirname, '../../uploads/museums/logos', museum.logo.filename);
      try {
        await fs.unlink(oldLogoPath);
      } catch (fileError) {
        console.warn('Could not delete old logo file:', fileError.message);
      }
    }

    // Update museum with new logo
    museum.logo = {
      url: `/uploads/museums/logos/${req.file.filename}`,
      filename: req.file.filename,
      uploadedAt: new Date()
    };

    await museum.save();

    res.status(200).json({
      success: true,
      data: {
        logo: museum.logo
      },
      message: 'Museum logo uploaded successfully'
    });

  } catch (error) {
    console.error('Upload museum logo error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MUSEUM_ID',
          message: 'Invalid museum ID format'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error'
      }
    });
  }
};