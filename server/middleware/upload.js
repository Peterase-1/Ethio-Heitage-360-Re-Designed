const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const ROOT_DIR = path.join(process.cwd(), 'uploads', 'education');
ensureDir(ROOT_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const courseId = req.params.courseId || 'general';
    const subDir = path.join(ROOT_DIR, courseId);
    ensureDir(subDir);
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}_${name}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common types: images, pdf, docs, videos up to caller-enforced limits
  const allowed = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'video/mp4', 'video/quicktime'
  ];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Unsupported file type'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

module.exports = { upload };

