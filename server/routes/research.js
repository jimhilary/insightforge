const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  runResearch,
  getResearchSessions,
  getResearchSession,
  deleteResearchSession
} = require('../controllers/researchController');

// All routes require authentication
router.use(verifyToken);

// POST /api/research - Run AI research
router.post('/', runResearch);

// GET /api/research/:projectId - Get all research sessions for a project
router.get('/:projectId', getResearchSessions);

// GET /api/research/session/:sessionId - Get specific research session
router.get('/session/:sessionId', getResearchSession);

// DELETE /api/research/session/:sessionId - Delete research session
router.delete('/session/:sessionId', deleteResearchSession);

module.exports = router;

