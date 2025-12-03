const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db, admin } = require('../lib/firebaseAdmin');

// Initialize Gemini client (lazy initialization)
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
 * POST /api/reports/generate
 * Generate a comprehensive report from selected research sessions and documents
 */
const generateReport = async (req, res) => {
  try {
    const { projectId, title, researchSessionIds = [], documentIds = [] } = req.body;
    const userId = req.user.uid;

    console.log('[Report] Generate request', { userId, projectId, title, researchSessionIds, documentIds });

    // Validation
    if (!projectId || !title) {
      return res.status(400).json({ error: 'projectId and title are required' });
    }

    if (researchSessionIds.length === 0 && documentIds.length === 0) {
      return res.status(400).json({ error: 'Select at least one research session or document' });
    }

    // Verify project ownership
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projectDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Fetch selected research sessions
    const researchContent = [];
    for (const sessionId of researchSessionIds) {
      const sessionDoc = await db.collection('research_sessions').doc(sessionId).get();
      if (sessionDoc.exists && sessionDoc.data().project_id === projectId) {
        const data = sessionDoc.data();
        researchContent.push({
          type: 'research',
          topic: data.topic,
          overview: data.overview,
          deep_explanations: data.deep_explanations,
          sources: data.sources,
          key_findings: data.key_findings
        });
      }
    }

    // Fetch selected documents
    const documentContent = [];
    for (const docId of documentIds) {
      const docSnapshot = await db.collection('documents').doc(docId).get();
      if (docSnapshot.exists && docSnapshot.data().project_id === projectId) {
        const data = docSnapshot.data();
        documentContent.push({
          type: 'document',
          filename: data.filename,
          summary: data.summary,
          key_points: data.key_points,
          topics: data.topics
        });
      }
    }

    console.log('[Report] Fetched content', { researchCount: researchContent.length, documentCount: documentContent.length });

    // Build comprehensive prompt for AI
    const prompt = `You are an expert report writer. Generate a comprehensive, professional report based on the following content.

REPORT TITLE: "${title}"

RESEARCH SESSIONS:
${researchContent.map((r, i) => `
Research ${i + 1}: ${r.topic}
Overview: ${r.overview}
Key Findings: ${r.key_findings ? r.key_findings.join(', ') : 'N/A'}
`).join('\n')}

DOCUMENTS:
${documentContent.map((d, i) => `
Document ${i + 1}: ${d.filename}
Summary: ${d.summary}
Key Points: ${d.key_points ? d.key_points.join(', ') : 'N/A'}
`).join('\n')}

Generate a cohesive, well-structured report in JSON format with the following structure:
{
  "executive_summary": "A brief 2-3 sentence overview of the entire report",
  "introduction": "An introduction that sets the context (2-3 paragraphs)",
  "key_findings": [
    "Finding 1",
    "Finding 2",
    "Finding 3"
  ],
  "detailed_analysis": [
    {
      "section_title": "Title of analysis section 1",
      "content": "Detailed analysis content for section 1"
    },
    {
      "section_title": "Title of analysis section 2",
      "content": "Detailed analysis content for section 2"
    }
  ],
  "conclusions": "Overall conclusions drawn from the research and documents (2-3 paragraphs)",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ]
}

Make the report professional, insightful, and well-organized. Synthesize information from all sources into a cohesive narrative.
IMPORTANT: Return ONLY the JSON object, no markdown formatting or extra text.`;

    // Call Gemini API
    console.log('[Report] Calling Gemini API...');
    const geminiModel = getGeminiModel();
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    console.log('[Report] Gemini response received', { length: text?.length });

    // Clean response: remove markdown code blocks
    if (text.startsWith('```json')) {
      text = text.substring(7);
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3);
    }
    text = text.trim();

    // Parse AI response
    let reportData;
    try {
      reportData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response (first 500 chars):', text.substring(0, 500));
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Store report in Firestore
    const reportDoc = {
      project_id: projectId,
      user_id: userId,
      title: title,
      research_session_ids: researchSessionIds,
      document_ids: documentIds,
      executive_summary: reportData.executive_summary,
      introduction: reportData.introduction,
      key_findings: reportData.key_findings || [],
      detailed_analysis: reportData.detailed_analysis || [],
      conclusions: reportData.conclusions,
      recommendations: reportData.recommendations || [],
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const reportRef = await db.collection('reports').add(reportDoc);
    console.log('[Report] Stored in Firestore', { reportId: reportRef.id });

    // Return the generated report
    res.json({
      success: true,
      report: {
        id: reportRef.id,
        ...reportDoc,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report', message: error.message });
  }
};

/**
 * GET /api/reports/:projectId
 * Get all reports for a project
 */
const getReports = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.uid;

    // Verify project ownership
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projectDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all reports for this project
    const reportsSnapshot = await db.collection('reports')
      .where('project_id', '==', projectId)
      .orderBy('created_at', 'desc')
      .get();

    const reports = [];
    reportsSnapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

/**
 * GET /api/reports/view/:reportId
 * Get a specific report
 */
const getReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.uid;

    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();

    // Verify ownership through project
    const projectDoc = await db.collection('projects').doc(reportData.project_id).get();
    if (!projectDoc.exists || projectDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      report: {
        id: reportDoc.id,
        ...reportData
      }
    });

  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

/**
 * DELETE /api/reports/:reportId
 * Delete a report
 */
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const userId = req.user.uid;

    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();

    // Verify ownership through project
    const projectDoc = await db.collection('projects').doc(reportData.project_id).get();
    if (!projectDoc.exists || projectDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.collection('reports').doc(reportId).delete();

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
};

module.exports = {
  generateReport,
  getReports,
  getReport,
  deleteReport
};

