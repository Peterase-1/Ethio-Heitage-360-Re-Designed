const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createDirectories = () => {
  const dirs = [
    'uploads/',
    'uploads/artifacts/',
    'uploads/artifacts/images/',
    'uploads/artifacts/models/',
    'uploads/artifacts/documents/',
    'uploads/museums/',
    'uploads/museums/images/',
    'uploads/museums/logos/',
    'uploads/events/',
    'uploads/events/images/',
    'uploads/staff/',
    'uploads/staff/avatars/',
    'uploads/courses/',
    'uploads/courses/images/',
    'uploads/courses/thumbnails/',
    'uploads/lessons/',
    'uploads/lessons/images/',
    'uploads/lessons/videos/',
    'uploads/lessons/documents/',
    'uploads/lessons/audio/'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${fullPath}`);
    }
  });
};

// Initialize directories
createDirectories();

// File type configurations
const fileTypes = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
    destination: 'uploads/artifacts/images/'
  },
  models: {
    mimeTypes: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
    extensions: ['.glb', '.gltf', '.obj', '.fbx', '.dae'],
    maxSize: 100 * 1024 * 1024, // 100MB
    destination: 'uploads/artifacts/models/'
  },
  documents: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    maxSize: 25 * 1024 * 1024, // 25MB
    destination: 'uploads/artifacts/documents/'
  },
  museumImages: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: 'uploads/museums/images/'
  },
  museumLogos: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    destination: 'uploads/museums/logos/'
  },
  eventImages: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: 'uploads/events/images/'
  },
  staffAvatars: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    destination: 'uploads/staff/avatars/'
  },
  courseImages: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: 'uploads/courses/images/'
  },
  courseThumbnails: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    destination: 'uploads/courses/thumbnails/'
  },
  lessonImages: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: 'uploads/lessons/images/'
  },
  lessonVideos: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.ogg', '.mov', '.avi'],
    maxSize: 200 * 1024 * 1024, // 200MB
    destination: 'uploads/lessons/videos/'
  },
  lessonAudio: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    extensions: ['.mp3', '.wav', '.ogg', '.m4a'],
    maxSize: 50 * 1024 * 1024, // 50MB
    destination: 'uploads/lessons/audio/'
  },
  lessonDocuments: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ],
    extensions: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'],
    maxSize: 25 * 1024 * 1024, // 25MB
    destination: 'uploads/lessons/documents/'
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';

    // Determine upload path based on file field and context
    // Check URL to determine if it's a museum image upload
    const isMuseumUpload = req.route && req.route.path.includes('/museums/');

    if (file.fieldname === 'images') {
      if (isMuseumUpload) {
        uploadPath = fileTypes.museumImages.destination;
      } else {
        uploadPath = fileTypes.images.destination;
      }
    } else if (file.fieldname === 'artifactImages') {
      uploadPath = fileTypes.images.destination;
    } else if (file.fieldname === 'model' || file.fieldname === 'model3D') {
      uploadPath = fileTypes.models.destination;
    } else if (file.fieldname === 'documents') {
      uploadPath = fileTypes.documents.destination;
    } else if (file.fieldname === 'museumImage' || file.fieldname === 'museumImages') {
      uploadPath = fileTypes.museumImages.destination;
    } else if (file.fieldname === 'logo') {
      uploadPath = fileTypes.museumLogos.destination;
    } else if (file.fieldname === 'eventImage' || file.fieldname === 'eventImages') {
      uploadPath = fileTypes.eventImages.destination;
    } else if (file.fieldname === 'avatar' || file.fieldname === 'staffAvatar') {
      uploadPath = fileTypes.staffAvatars.destination;
    } else if (file.fieldname === 'courseImage' || file.fieldname === 'courseImages') {
      uploadPath = fileTypes.courseImages.destination;
    } else if (file.fieldname === 'courseThumbnail') {
      uploadPath = fileTypes.courseThumbnails.destination;
    } else if (file.fieldname === 'lessonImage' || file.fieldname === 'lessonImages') {
      uploadPath = fileTypes.lessonImages.destination;
    } else if (file.fieldname === 'lessonVideo' || file.fieldname === 'lessonVideos') {
      uploadPath = fileTypes.lessonVideos.destination;
    } else if (file.fieldname === 'lessonAudio') {
      uploadPath = fileTypes.lessonAudio.destination;
    } else if (file.fieldname === 'lessonDocument' || file.fieldname === 'lessonDocuments') {
      uploadPath = fileTypes.lessonDocuments.destination;
    }

    // Create directory if it doesn't exist
    const fullPath = path.join(__dirname, '..', uploadPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype.toLowerCase();

    let allowedTypes = null;

    // Determine allowed types based on field name and context
    const isMuseumUpload = req.route && req.route.path.includes('/museums/');

    if (file.fieldname === 'images') {
      if (isMuseumUpload) {
        allowedTypes = fileTypes.museumImages;
      } else {
        allowedTypes = fileTypes.images;
      }
    } else if (file.fieldname === 'artifactImages') {
      allowedTypes = fileTypes.images;
    } else if (file.fieldname === 'model' || file.fieldname === 'model3D') {
      allowedTypes = fileTypes.models;
    } else if (file.fieldname === 'documents') {
      allowedTypes = fileTypes.documents;
    } else if (file.fieldname === 'museumImage' || file.fieldname === 'museumImages') {
      allowedTypes = fileTypes.museumImages;
    } else if (file.fieldname === 'logo') {
      allowedTypes = fileTypes.museumLogos;
    } else if (file.fieldname === 'eventImage' || file.fieldname === 'eventImages') {
      allowedTypes = fileTypes.eventImages;
    } else if (file.fieldname === 'avatar' || file.fieldname === 'staffAvatar') {
      allowedTypes = fileTypes.staffAvatars;
    }

    if (!allowedTypes) {
      return cb(new Error(`Unknown file field: ${file.fieldname}`), false);
    }

    // Check file extension
    if (!allowedTypes.extensions.includes(ext)) {
      return cb(new Error(`Invalid file extension. Allowed: ${allowedTypes.extensions.join(', ')}`), false);
    }

    // Check MIME type (more flexible for 3D models)
    if (file.fieldname === 'model' || file.fieldname === 'model3D') {
      // For 3D models, we're more lenient with MIME types as they can vary
      const validModel = allowedTypes.extensions.includes(ext);
      if (!validModel) {
        return cb(new Error('Invalid 3D model file. Allowed: .glb, .gltf, .obj, .fbx, .dae'), false);
      }
    } else {
      // For other files, check MIME type strictly
      if (!allowedTypes.mimeTypes.includes(mimetype)) {
        return cb(new Error(`Invalid file type. Allowed: ${allowedTypes.mimeTypes.join(', ')}`), false);
      }
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Size limits function
const getLimits = (fieldname) => {
  let maxSize = 10 * 1024 * 1024; // Default 10MB

  if (fieldname === 'images' || fieldname === 'artifactImages') {
    maxSize = fileTypes.images.maxSize;
  } else if (fieldname === 'model' || fieldname === 'model3D') {
    maxSize = fileTypes.models.maxSize;
  } else if (fieldname === 'documents') {
    maxSize = fileTypes.documents.maxSize;
  } else if (fieldname === 'museumImage' || fieldname === 'museumImages') {
    maxSize = fileTypes.museumImages.maxSize;
  } else if (fieldname === 'logo') {
    maxSize = fileTypes.museumLogos.maxSize;
  } else if (fieldname === 'eventImage' || fieldname === 'eventImages') {
    maxSize = fileTypes.eventImages.maxSize;
  } else if (fieldname === 'avatar' || fieldname === 'staffAvatar') {
    maxSize = fileTypes.staffAvatars.maxSize;
  }

  return {
    fileSize: maxSize,
    files: 10, // Max 10 files per request
    fields: 10, // Max 10 fields
    parts: 20 // Max 20 parts
  };
};

// Create multer instances for different use cases
const artifactUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: getLimits('images')
});

const modelUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: getLimits('model')
});

const documentUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: getLimits('documents')
});

const museumUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: getLimits('museumImage')
});

const museumLogoUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: getLimits('logo')
});

const eventUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: getLimits('eventImage')
});

const staffUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: getLimits('avatar')
});

// Generic upload with dynamic limits
const dynamicUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
    files: 10,
    fields: 10,
    parts: 20
  }
});

// Error handling middleware
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large',
          message: 'The uploaded file exceeds the size limit.',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files',
          message: 'Too many files uploaded at once.',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field',
          message: 'An unexpected file field was encountered.',
          code: 'UNEXPECTED_FILE'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'Upload error',
          message: error.message || 'An error occurred during file upload.',
          code: 'UPLOAD_ERROR'
        });
    }
  } else if (error) {
    // Custom validation errors
    return res.status(400).json({
      success: false,
      error: 'File validation error',
      message: error.message || 'File validation failed.',
      code: 'VALIDATION_ERROR'
    });
  }

  next();
};

// Utility functions
const getFileUrl = (filename, type = 'images') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  let path = '';

  switch (type) {
    case 'images':
      path = '/uploads/artifacts/images/';
      break;
    case 'models':
      path = '/uploads/artifacts/models/';
      break;
    case 'documents':
      path = '/uploads/artifacts/documents/';
      break;
    case 'museumImages':
      path = '/uploads/museums/images/';
      break;
    case 'museumLogos':
      path = '/uploads/museums/logos/';
      break;
    case 'eventImages':
      path = '/uploads/events/images/';
      break;
    case 'staffAvatars':
      path = '/uploads/staff/avatars/';
      break;
    default:
      path = '/uploads/';
  }

  return `${baseUrl}${path}${filename}`;
};

const deleteFile = (filename, type = 'images') => {
  try {
    let filePath = '';

    switch (type) {
      case 'images':
        filePath = path.join(__dirname, '..', fileTypes.images.destination, filename);
        break;
      case 'models':
        filePath = path.join(__dirname, '..', fileTypes.models.destination, filename);
        break;
      case 'documents':
        filePath = path.join(__dirname, '..', fileTypes.documents.destination, filename);
        break;
      case 'museumImages':
        filePath = path.join(__dirname, '..', fileTypes.museumImages.destination, filename);
        break;
      case 'museumLogos':
        filePath = path.join(__dirname, '..', fileTypes.museumLogos.destination, filename);
        break;
      case 'eventImages':
        filePath = path.join(__dirname, '..', fileTypes.eventImages.destination, filename);
        break;
      case 'staffAvatars':
        filePath = path.join(__dirname, '..', fileTypes.staffAvatars.destination, filename);
        break;
      default:
        return false;
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// File info extractor
const extractFileInfo = (file, type = 'images') => {
  return {
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: getFileUrl(file.filename, type),
    uploadedAt: new Date()
  };
};

module.exports = {
  // Upload instances
  artifactUpload,
  modelUpload,
  documentUpload,
  museumUpload,
  museumLogoUpload,
  uploadMuseumImages: museumUpload, // Alias for museum routes
  uploadMuseumLogo: museumLogoUpload, // Alias for museum logo routes
  uploadArtifactImages: artifactUpload, // Alias for artifact image routes
  upload3DModels: modelUpload, // Alias for 3D model routes
  eventUpload,
  staffUpload,
  dynamicUpload,

  // Middleware
  handleUploadErrors,

  // Utilities
  getFileUrl,
  deleteFile,
  extractFileInfo,
  fileTypes,

  // Field configurations for different upload types
  fields: {
    artifact: [
      { name: 'images', maxCount: 10 },
      { name: 'model', maxCount: 1 },
      { name: 'documents', maxCount: 5 }
    ],
    museum: [
      { name: 'images', maxCount: 10 } // Changed from 'museumImages' to 'images' to match route expectation
    ],
    event: [
      { name: 'eventImages', maxCount: 5 }
    ],
    staff: [
      { name: 'avatar', maxCount: 1 }
    ]
  }
};
