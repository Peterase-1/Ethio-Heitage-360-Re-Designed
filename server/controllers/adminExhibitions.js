const Exhibition = require('../models/Exhibition');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');

/**
 * @desc    Get all exhibitions for admin
 * @route   GET /api/admin/exhibitions
 * @access  Museum Admin, Super Admin
 */
const getAdminExhibitions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      type,
      category,
      search,
      museumId
    } = req.query;

    // Build query based on user role
    let query = {};
    
    // If museum admin, only show their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    } else if (museumId && req.user.role === 'super_admin') {
      query.museum = museumId;
    }

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const exhibitions = await Exhibition.find(query)
      .populate('museum', 'name location')
      .populate('curator', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Exhibition.countDocuments(query);

    res.json({
      success: true,
      data: exhibitions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin exhibitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibitions',
      error: error.message
    });
  }
};

/**
 * @desc    Get single exhibition for admin
 * @route   GET /api/admin/exhibitions/:id
 * @access  Museum Admin, Super Admin
 */
const getAdminExhibition = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If museum admin, ensure they can only access their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    }

    const exhibition = await Exhibition.findOne(query)
      .populate('museum', 'name location contact')
      .populate('curator', 'name email title')
      .populate('staff.assistantCurators', 'name email title')
      .populate({
        path: 'artifacts.artifact',
        select: 'name description images category'
      })
      .populate('relatedExhibitions', 'title schedule museum')
      .populate('relatedEvents', 'title schedule museum');

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    res.json({
      success: true,
      data: exhibition
    });
  } catch (error) {
    console.error('Get admin exhibition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Create new exhibition
 * @route   POST /api/admin/exhibitions
 * @access  Museum Admin, Super Admin
 */
const createExhibition = async (req, res) => {
  try {
    const exhibitionData = {
      ...req.body,
      curator: req.user._id,
      museum: req.user.role === 'museum_admin' ? req.user.museum : req.body.museum
    };

    // Validate museum exists
    const museum = await Museum.findById(exhibitionData.museum);
    if (!museum) {
      return res.status(400).json({
        success: false,
        message: 'Museum not found'
      });
    }

    // Validate artifacts if provided
    if (exhibitionData.artifacts && exhibitionData.artifacts.length > 0) {
      const artifactIds = exhibitionData.artifacts.map(a => a.artifact);
      const artifacts = await Artifact.find({ _id: { $in: artifactIds } });
      
      if (artifacts.length !== artifactIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some artifacts not found'
        });
      }
    }

    const exhibition = new Exhibition(exhibitionData);
    await exhibition.save();

    const populatedExhibition = await Exhibition.findById(exhibition._id)
      .populate('museum', 'name location')
      .populate('curator', 'name email');

    res.status(201).json({
      success: true,
      data: populatedExhibition,
      message: 'Exhibition created successfully'
    });
  } catch (error) {
    console.error('Create exhibition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Update exhibition
 * @route   PUT /api/admin/exhibitions/:id
 * @access  Museum Admin, Super Admin
 */
const updateExhibition = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If museum admin, ensure they can only update their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    }

    const exhibition = await Exhibition.findOne(query);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Validate artifacts if provided
    if (req.body.artifacts && req.body.artifacts.length > 0) {
      const artifactIds = req.body.artifacts.map(a => a.artifact);
      const artifacts = await Artifact.find({ _id: { $in: artifactIds } });
      
      if (artifacts.length !== artifactIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some artifacts not found'
        });
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        exhibition[key] = req.body[key];
      }
    });

    await exhibition.save();

    const updatedExhibition = await Exhibition.findById(exhibition._id)
      .populate('museum', 'name location')
      .populate('curator', 'name email');

    res.json({
      success: true,
      data: updatedExhibition,
      message: 'Exhibition updated successfully'
    });
  } catch (error) {
    console.error('Update exhibition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Delete exhibition
 * @route   DELETE /api/admin/exhibitions/:id
 * @access  Museum Admin, Super Admin
 */
const deleteExhibition = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If museum admin, ensure they can only delete their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    }

    const exhibition = await Exhibition.findOne(query);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Check if exhibition can be deleted (e.g., not active with visitors)
    if (exhibition.status === 'active' && exhibition.statistics.totalVisitors > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete active exhibition with recorded visitors. Consider archiving instead.'
      });
    }

    await Exhibition.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Exhibition deleted successfully'
    });
  } catch (error) {
    console.error('Delete exhibition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Archive exhibition
 * @route   PATCH /api/admin/exhibitions/:id/archive
 * @access  Museum Admin, Super Admin
 */
const archiveExhibition = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If museum admin, ensure they can only archive their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    }

    const exhibition = await Exhibition.findOneAndUpdate(
      query,
      { status: 'archived' },
      { new: true }
    ).populate('museum', 'name location');

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    res.json({
      success: true,
      data: exhibition,
      message: 'Exhibition archived successfully'
    });
  } catch (error) {
    console.error('Archive exhibition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Publish exhibition
 * @route   PATCH /api/admin/exhibitions/:id/publish
 * @access  Museum Admin, Super Admin
 */
const publishExhibition = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If museum admin, ensure they can only publish their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    }

    const exhibition = await Exhibition.findOne(query);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Validate required fields for publishing
    const requiredFields = ['title', 'description', 'location.gallery'];
    const missingFields = [];

    requiredFields.forEach(field => {
      const fieldPath = field.split('.');
      let value = exhibition;
      
      for (const path of fieldPath) {
        value = value?.[path];
      }
      
      if (!value) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Exhibition missing required fields for publishing',
        missingFields
      });
    }

    exhibition.status = 'active';
    exhibition.visibility = 'public';
    await exhibition.save();

    const updatedExhibition = await Exhibition.findById(exhibition._id)
      .populate('museum', 'name location');

    res.json({
      success: true,
      data: updatedExhibition,
      message: 'Exhibition published successfully'
    });
  } catch (error) {
    console.error('Publish exhibition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Add artifact to exhibition
 * @route   POST /api/admin/exhibitions/:id/artifacts
 * @access  Museum Admin, Super Admin
 */
const addArtifactToExhibition = async (req, res) => {
  try {
    const { artifactId, displayOrder, displayNote, isHighlight, section } = req.body;

    let query = { _id: req.params.id };
    
    // If museum admin, ensure they can only modify their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    }

    const exhibition = await Exhibition.findOne(query);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Verify artifact exists
    const artifact = await Artifact.findById(artifactId);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }

    // Check if artifact is already in exhibition
    const existingArtifact = exhibition.artifacts.find(
      a => a.artifact.toString() === artifactId
    );
    
    if (existingArtifact) {
      return res.status(400).json({
        success: false,
        message: 'Artifact is already in this exhibition'
      });
    }

    exhibition.artifacts.push({
      artifact: artifactId,
      displayOrder: displayOrder || 0,
      displayNote,
      isHighlight: isHighlight || false,
      section
    });

    await exhibition.save();

    const updatedExhibition = await Exhibition.findById(exhibition._id)
      .populate({
        path: 'artifacts.artifact',
        select: 'name description images category'
      });

    res.json({
      success: true,
      data: updatedExhibition,
      message: 'Artifact added to exhibition successfully'
    });
  } catch (error) {
    console.error('Add artifact to exhibition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add artifact to exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Remove artifact from exhibition
 * @route   DELETE /api/admin/exhibitions/:id/artifacts/:artifactId
 * @access  Museum Admin, Super Admin
 */
const removeArtifactFromExhibition = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If museum admin, ensure they can only modify their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    }

    const exhibition = await Exhibition.findOne(query);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Remove artifact
    exhibition.artifacts = exhibition.artifacts.filter(
      a => a.artifact.toString() !== req.params.artifactId
    );

    await exhibition.save();

    res.json({
      success: true,
      message: 'Artifact removed from exhibition successfully'
    });
  } catch (error) {
    console.error('Remove artifact from exhibition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove artifact from exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Get exhibition statistics
 * @route   GET /api/admin/exhibitions/:id/statistics
 * @access  Museum Admin, Super Admin
 */
const getExhibitionStatistics = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // If museum admin, ensure they can only access their museum's exhibitions
    if (req.user.role === 'museum_admin') {
      query.museum = req.user.museum;
    }

    const exhibition = await Exhibition.findOne(query)
      .select('statistics schedule status type');

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Calculate additional statistics
    const stats = {
      ...exhibition.statistics.toObject(),
      daysActive: exhibition.type === 'permanent' ? 'Permanent' : 
                  Math.ceil((new Date() - exhibition.schedule.startDate) / (1000 * 60 * 60 * 24)),
      status: exhibition.status
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get exhibition statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibition statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAdminExhibitions,
  getAdminExhibition,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  archiveExhibition,
  publishExhibition,
  addArtifactToExhibition,
  removeArtifactFromExhibition,
  getExhibitionStatistics
};
