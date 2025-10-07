const VirtualMuseum = require('../models/VirtualMuseum');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');

/**
 * Get all virtual museum artifacts
 */
const getVirtualMuseumArtifacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, museum, featured, sortBy = 'views' } = req.query;

    const query = { status: 'active' };

    if (category) query.category = category;
    if (museum) query.museum = museum;
    if (featured === 'true') query.featured = true;

    const sort = {};
    sort[sortBy] = -1;

    const [artifacts, total] = await Promise.all([
      VirtualMuseum.find(query)
        .populate('artifact', 'name description images category period origin')
        .populate('museum', 'name location')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      VirtualMuseum.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        artifacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get virtual museum artifacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual museum artifacts',
      error: error.message
    });
  }
};

/**
 * Get featured artifacts
 */
const getFeaturedArtifacts = async (req, res) => {
  try {
    const artifacts = await VirtualMuseum.getFeatured();

    res.json({
      success: true,
      data: artifacts
    });
  } catch (error) {
    console.error('Get featured artifacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured artifacts',
      error: error.message
    });
  }
};

/**
 * Get popular artifacts
 */
const getPopularArtifacts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const artifacts = await VirtualMuseum.getPopular(limit);

    res.json({
      success: true,
      data: artifacts
    });
  } catch (error) {
    console.error('Get popular artifacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular artifacts',
      error: error.message
    });
  }
};

/**
 * Get artifacts by museum
 */
const getArtifactsByMuseum = async (req, res) => {
  try {
    const { museumId } = req.params;
    const artifacts = await VirtualMuseum.getByMuseum(museumId);

    res.json({
      success: true,
      data: artifacts
    });
  } catch (error) {
    console.error('Get artifacts by museum error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museum artifacts',
      error: error.message
    });
  }
};

/**
 * Get single artifact details
 */
const getArtifactDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const artifact = await VirtualMuseum.findById(id)
      .populate('artifact', 'name description images category period origin tags')
      .populate('museum', 'name location description')
      .populate('rentalRequest', 'requestId requestType status');

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found in virtual museum'
      });
    }

    // Increment views
    await artifact.incrementViews();

    res.json({
      success: true,
      data: artifact
    });
  } catch (error) {
    console.error('Get artifact details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifact details',
      error: error.message
    });
  }
};

/**
 * Like an artifact
 */
const likeArtifact = async (req, res) => {
  try {
    const { id } = req.params;

    const artifact = await VirtualMuseum.findById(id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }

    await artifact.addLike();

    res.json({
      success: true,
      message: 'Artifact liked successfully',
      data: { likes: artifact.likes }
    });
  } catch (error) {
    console.error('Like artifact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like artifact',
      error: error.message
    });
  }
};

/**
 * Rate an artifact
 */
const rateArtifact = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5'
      });
    }

    const artifact = await VirtualMuseum.findById(id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }

    await artifact.updateRating(rating);

    res.json({
      success: true,
      message: 'Artifact rated successfully',
      data: { rating: artifact.rating }
    });
  } catch (error) {
    console.error('Rate artifact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate artifact',
      error: error.message
    });
  }
};

/**
 * Get virtual museum statistics
 */
const getVirtualMuseumStats = async (req, res) => {
  try {
    const totalArtifacts = await VirtualMuseum.countDocuments({ status: 'active' });
    const totalViews = await VirtualMuseum.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const totalLikes = await VirtualMuseum.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);

    const featuredCount = await VirtualMuseum.countDocuments({
      status: 'active',
      featured: true
    });

    res.json({
      success: true,
      data: {
        totalArtifacts,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        featuredCount
      }
    });
  } catch (error) {
    console.error('Get virtual museum stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual museum statistics',
      error: error.message
    });
  }
};

module.exports = {
  getVirtualMuseumArtifacts,
  getFeaturedArtifacts,
  getPopularArtifacts,
  getArtifactsByMuseum,
  getArtifactDetails,
  likeArtifact,
  rateArtifact,
  getVirtualMuseumStats
};