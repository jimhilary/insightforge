const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  generateReport,
  getReports,
  getReport,
  deleteReport
} = require('../controllers/reportController');

// All routes require authentication
router.use(verifyToken);

// Generate a new report
router.post('/generate', generateReport);

// Get all reports for a project
router.get('/:projectId', getReports);

// Get a specific report
router.get('/view/:reportId', getReport);

// Delete a report
router.delete('/:reportId', deleteReport);

module.exports = router;

