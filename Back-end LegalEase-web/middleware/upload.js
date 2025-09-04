const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    './uploads/documents',
    './uploads/constitutions'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadDirs();

// Set up storage for documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Set up storage for constitutions
const constitutionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/constitutions/');
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'const-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for documents
const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPEG, and PNG files are allowed'), false);
  }
};

// Create multer instances
exports.uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

exports.uploadConstitution = multer({
  storage: constitutionStorage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for constitutions
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDFs for constitutions
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for constitutions'), false);
    }
  }
});

// Error handling middleware for multer
exports.handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Please upload a smaller file.'
      });
    }
  }
  
  if (error.message.includes('Only')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'An error occurred during file upload'
  });
};