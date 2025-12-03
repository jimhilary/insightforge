const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  summarizeDocument,
  getDocuments,
  getDocument,
  deleteDocument
} = require('../controllers/documentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Only accept PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// All routes require authentication
router.use(verifyToken);

// POST /api/documents/summarize - Upload and summarize PDF
router.post('/summarize', upload.single('file'), summarizeDocument);

// GET /api/documents/:projectId - Get all documents for a project
router.get('/:projectId', getDocuments);

// GET /api/documents/doc/:documentId - Get specific document
router.get('/doc/:documentId', getDocument);

// DELETE /api/documents/doc/:documentId - Delete document
router.delete('/doc/:documentId', deleteDocument);

module.exports = router;

