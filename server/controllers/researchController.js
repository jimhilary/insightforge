const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db, admin } = require('../lib/firebaseAdmin');

// Initialize Gemini client (lazy initialization to avoid startup errors)
let genAI = null;
let model = null;

const getGeminiModel = () => {
  if (!model) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
};

/**
 * POST /api/research
 * Runs AI research on a topic
 */
const runResearch = async (req, res) => {
  try {
    const { topic, projectId } = req.body;
    const userId = req.user.uid;

    console.log('[Research] Incoming request', { userId, projectId, topic });

    if (!topic || !projectId) {
      console.warn('[Research] Missing topic or projectId');
      return res.status(400).json({ error: 'Topic and projectId are required' });
    }

    // Verify project belongs to user
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      console.warn('[Research] Project not found', { projectId });
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projectDoc.data().user_id !== userId) {
      console.warn('[Research] Access denied for project', { projectId, userId });
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log(`🔍 Running AI research for topic: "${topic}"`);

    // Build AI prompt
    const prompt = `You are a research assistant. Given the topic "${topic}", provide comprehensive research results.

Return your response as a valid JSON object with this exact structure:
{
  "overview": "A comprehensive 2-3 paragraph overview of the topic",
  "deep_explanations": [
    {
      "title": "Section title",
      "content": "Detailed explanation of this aspect"
    }
  ],
  "sources": [
    {
      "title": "Source title",
      "url": "https://example.com",
      "description": "Brief description"
    }
  ],
  "key_findings": [
    "Key finding 1",
    "Key finding 2"
  ]
}

Make the response detailed, informative, and well-structured. Include at least 3-5 deep_explanations sections and 5-10 credible sources.`;

    // Call Gemini API
    console.log('[Research] Sending prompt to Gemini...');
    const geminiModel = getGeminiModel();
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('[Research] Gemini response received', { length: text?.length });

    // Parse response - strip markdown code blocks if present
    let researchData;
    try {
      // Remove markdown code block markers (```json ... ```)
      let cleanedText = text.trim();
      
      // Strip opening marker
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7); // Remove ```json
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.substring(3); // Remove ```
      }
      
      // Strip closing marker and anything after it
      const closingMarkerIndex = cleanedText.lastIndexOf('```');
      if (closingMarkerIndex !== -1) {
        cleanedText = cleanedText.substring(0, closingMarkerIndex);
      }
      
      cleanedText = cleanedText.trim();
      
      researchData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response (first 500 chars):', text.substring(0, 500));
      console.error('Cleaned text (first 500 chars):', cleanedText ? cleanedText.substring(0, 500) : 'undefined');
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Save to Firestore
    const researchSession = {
      project_id: projectId,
      user_id: userId,
      topic: topic,
      overview: researchData.overview || '',
      deep_explanations: researchData.deep_explanations || [],
      sources: researchData.sources || [],
      key_findings: researchData.key_findings || [],
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const researchRef = await db.collection('research_sessions').add(researchSession);

    console.log(`✅ Research session created: ${researchRef.id}`);

    res.json({
      success: true,
      session: {
        id: researchRef.id,
        ...researchSession,
        created_at: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error running research:', error?.response?.data || error);

    const status = error?.response?.status || 500;
    const message = error?.response?.data?.error?.message || error.message || 'Failed to run research';

    return res.status(status).json({
      error: 'Gemini API error',
      message,
    });
  }
};

/**
 * GET /api/research/:projectId
 * Get all research sessions for a project
 */
const getResearchSessions = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.uid;

    console.log('[Research] Fetching sessions', { userId, projectId });

    // Verify project belongs to user
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      console.warn('[Research] Sessions project not found', { projectId });
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projectDoc.data().user_id !== userId) {
      console.warn('[Research] Sessions access denied', { projectId, userId });
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all research sessions for this project
    const sessionsSnapshot = await db.collection('research_sessions')
      .where('project_id', '==', projectId)
      .orderBy('created_at', 'desc')
      .get();

    const sessions = [];
    sessionsSnapshot.forEach(doc => {
      sessions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log('[Research] Sessions fetched', { count: sessions.length });

    res.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Error fetching research sessions:', error?.response?.data || error);
    res.status(500).json({ error: 'Failed to fetch research sessions' });
  }
};

/**
 * GET /api/research/session/:sessionId
 * Get a specific research session
 */
const getResearchSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.uid;

    const sessionDoc = await db.collection('research_sessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Research session not found' });
    }

    if (sessionDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      session: {
        id: sessionDoc.id,
        ...sessionDoc.data()
      }
    });

  } catch (error) {
    console.error('Error fetching research session:', error);
    res.status(500).json({ error: 'Failed to fetch research session' });
  }
};

/**
 * DELETE /api/research/session/:sessionId
 * Delete a research session
 */
const deleteResearchSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.uid;

    const sessionRef = db.collection('research_sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Research session not found' });
    }

    if (sessionDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await sessionRef.delete();

    res.json({
      success: true,
      message: 'Research session deleted'
    });

  } catch (error) {
    console.error('Error deleting research session:', error);
    res.status(500).json({ error: 'Failed to delete research session' });
  }
};

module.exports = {
  runResearch,
  getResearchSessions,
  getResearchSession,
  deleteResearchSession
};

