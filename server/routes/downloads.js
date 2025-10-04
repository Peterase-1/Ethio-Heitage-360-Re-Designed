const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');

// Middleware to check if file exists
const checkFileExists = (req, res, next) => {
  const filePath = req.filePath || req.query.path;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  req.filePath = filePath;
  next();
};

/**
 * @route   GET /api/downloads/artifact/:id
 * @desc    Download artifact files (images, documents, etc.)
 * @access  Public (for images) / Private (for restricted documents)
 */
router.get('/artifact/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'image' } = req.query; // image, document, model

    const artifact = await Artifact.findById(id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }

    let filePath;
    let fileName;

    switch (type) {
      case 'image':
        if (!artifact.images || artifact.images.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No images available for this artifact'
          });
        }
        filePath = artifact.images[0].path;
        fileName = artifact.images[0].filename;
        break;

      case 'document':
        if (!artifact.documents || artifact.documents.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No documents available for this artifact'
          });
        }
        filePath = artifact.documents[0].path;
        fileName = artifact.documents[0].filename;
        break;

      case 'model':
        if (!artifact.models || artifact.models.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No 3D models available for this artifact'
          });
        }
        filePath = artifact.models[0].path;
        fileName = artifact.models[0].filename;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid file type requested'
        });
    }

    // Construct absolute file path
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(__dirname, '..', filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Get file stats
    const stats = fs.statSync(absolutePath);
    const fileSize = stats.size;

    // Set appropriate headers
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.glb': 'model/gltf-binary',
      '.gltf': 'model/gltf+json',
      '.obj': 'application/octet-stream',
      '.zip': 'application/zip'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // For downloads instead of inline viewing, use:
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    }

    // Stream the file
    const readStream = fs.createReadStream(absolutePath);
    readStream.pipe(res);

    // Log the download
    console.log(`📥 File download: ${fileName} (${fileSize} bytes) - Artifact: ${artifact.name}`);

  } catch (error) {
    console.error('Error downloading artifact file:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/downloads/museum/:id/logo
 * @desc    Download museum logo
 * @access  Public
 */
router.get('/museum/:id/logo', async (req, res) => {
  try {
    const { id } = req.params;

    const museum = await Museum.findById(id);
    if (!museum || !museum.logo) {
      return res.status(404).json({
        success: false,
        message: 'Museum logo not found'
      });
    }

    const absolutePath = path.isAbsolute(museum.logo.path) 
      ? museum.logo.path 
      : path.join(__dirname, '..', museum.logo.path);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'Logo file not found on server'
      });
    }

    const stats = fs.statSync(absolutePath);
    const ext = path.extname(museum.logo.filename).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    const readStream = fs.createReadStream(absolutePath);
    readStream.pipe(res);

  } catch (error) {
    console.error('Error downloading museum logo:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/downloads/export/artifacts
 * @desc    Export artifacts data as CSV/JSON
 * @access  Private (Admin only)
 */
router.get('/export/artifacts', [auth], async (req, res) => {
  try {
    const { format = 'json', museumId } = req.query;

    // Check if user has admin access
    if (!['admin', 'super_admin', 'museum_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Build query
    let query = { isActive: true };
    if (museumId) {
      query.museum = museumId;
    }

    // Fetch artifacts
    const artifacts = await Artifact.find(query)
      .populate('museum', 'name')
      .populate('createdBy', 'name email')
      .select('-__v -updatedAt');

    if (artifacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No artifacts found for export'
      });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let filename, content, contentType;

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID', 'Name', 'Description', 'Category', 'Museum', 
        'Origin', 'Period', 'Material', 'Created Date', 'Created By'
      ];
      
      const csvRows = artifacts.map(artifact => [
        artifact._id,
        artifact.name,
        artifact.description?.replace(/"/g, '""') || '',
        artifact.category,
        artifact.museum?.name || '',
        artifact.origin || '',
        artifact.historicalPeriod || '',
        artifact.material || '',
        artifact.createdAt?.toISOString() || '',
        artifact.createdBy?.name || ''
      ]);

      content = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      filename = `artifacts-export-${timestamp}.csv`;
      contentType = 'text/csv';

    } else {
      // Generate JSON
      content = JSON.stringify({
        exportDate: new Date().toISOString(),
        totalArtifacts: artifacts.length,
        artifacts: artifacts
      }, null, 2);

      filename = `artifacts-export-${timestamp}.json`;
      contentType = 'application/json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

    console.log(`📊 Data export: ${filename} (${artifacts.length} artifacts) by ${req.user.name}`);

  } catch (error) {
    console.error('Error exporting artifacts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/downloads/backup/database
 * @desc    Create and download database backup
 * @access  Private (Super Admin only)
 */
router.get('/backup/database', [auth], async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    // This is a simplified backup - in production, you'd use mongodump
    const collections = ['users', 'museums', 'artifacts', 'tours', 'bookings'];
    const backup = {
      backupDate: new Date().toISOString(),
      version: '1.0.0',
      collections: {}
    };

    // Export each collection
    for (const collectionName of collections) {
      try {
        const Model = require(`../models/${collectionName.charAt(0).toUpperCase() + collectionName.slice(1, -1)}`);
        const data = await Model.find({}).lean();
        backup.collections[collectionName] = data;
      } catch (error) {
        console.warn(`Could not backup collection ${collectionName}:`, error.message);
      }
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `ethioheritage360-backup-${timestamp}.json`;
    const content = JSON.stringify(backup, null, 2);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

    console.log(`💾 Database backup created: ${filename} by ${req.user.name}`);

  } catch (error) {
    console.error('Error creating database backup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/downloads/reports/:type
 * @desc    Download various reports (visitor analytics, artifact stats, etc.)
 * @access  Private (Admin only)
 */
router.get('/reports/:type', [auth], async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'pdf', startDate, endDate } = req.query;

    // Check admin access
    if (!['admin', 'super_admin', 'museum_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // For now, return a placeholder response
    // In a full implementation, you'd generate actual reports
    const reportData = {
      reportType: type,
      generatedDate: new Date().toISOString(),
      generatedBy: req.user.name,
      dateRange: {
        start: startDate || null,
        end: endDate || null
      },
      message: `${type} report generation is not yet implemented. Coming soon!`
    };

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${type}-report-${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(reportData);

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/downloads/health
 * @desc    Check download service health
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Download service is operational',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /api/downloads/artifact/:id',
      'GET /api/downloads/museum/:id/logo',
      'GET /api/downloads/export/artifacts',
      'GET /api/downloads/backup/database',
      'GET /api/downloads/reports/:type'
    ]
  });
});

module.exports = router;
