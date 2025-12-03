const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const { db, admin } = require('../lib/firebaseAdmin');
const fs = require('fs').promises;
const path = require('path');

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
 * POST /api/documents/summarize
 * Upload and summarize a PDF document
 */
const summarizeDocument = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user.uid;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify project belongs to user
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projectDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log(`📄 Processing document: ${req.file.originalname}`);

    // Extract text from PDF
    let extractedText;
    try {
      const dataBuffer = await fs.readFile(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;

      // Limit text length (Gemini has token limits)
      if (extractedText.length > 30000) {
        extractedText = extractedText.substring(0, 30000) + '... [truncated]';
      }

      console.log(`✅ Extracted ${extractedText.length} characters from PDF`);
    } catch (pdfError) {
      console.error('Error parsing PDF:', pdfError);
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: 'Failed to parse PDF. Make sure it\'s a valid PDF file.' });
    }

    if (!extractedText || extractedText.trim().length < 100) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: 'PDF appears to be empty or contains too little text' });
    }

    // Build AI prompt
    const prompt = `Analyze and summarize the following document. Return your response as valid JSON with this structure:
{
  "summary": "A concise 2-3 paragraph summary of the document",
  "key_points": ["Key point 1", "Key point 2", "Key point 3", ...],
  "topics": ["Topic 1", "Topic 2", ...],
  "extracted_data": {
    "type": "Type of document (e.g., research paper, report, article)",
    "main_subject": "Main subject area",
    "key_entities": ["Entity 1", "Entity 2", ...]
  }
}

Document content:
${extractedText}`;

    console.log('🤖 Calling Gemini for summarization...');

    // Call Gemini API
    const geminiModel = getGeminiModel();
    const result = await geminiModel.generateContent(prompt);
    const aiResponse = await result.response;
    const completion = { choices: [{ message: { content: aiResponse.text() } }] };

    // Parse AI response - strip markdown code blocks if present
    let summaryData;
    try {
      let content = completion.choices[0].message.content.trim();
      
      // Strip opening marker
      if (content.startsWith('```json')) {
        content = content.substring(7); // Remove ```json
      } else if (content.startsWith('```')) {
        content = content.substring(3); // Remove ```
      }
      
      // Strip closing marker and anything after it
      const closingMarkerIndex = content.lastIndexOf('```');
      if (closingMarkerIndex !== -1) {
        content = content.substring(0, closingMarkerIndex);
      }
      
      content = content.trim();
      
      summaryData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    console.log('✅ Document summarized successfully');

    // Save document record to Firestore
    const documentRecord = {
      project_id: projectId,
      user_id: userId,
      filename: req.file.originalname,
      file_size: req.file.size,
      file_type: req.file.mimetype,
      file_path: req.file.path, // Store local path (in production, use cloud storage)
      summary: summaryData.summary || '',
      key_points: summaryData.key_points || [],
      topics: summaryData.topics || [],
      extracted_data: summaryData.extracted_data || {},
      text_length: extractedText.length,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('documents').add(documentRecord);

    console.log(`✅ Document record saved: ${docRef.id}`);

    res.json({
      success: true,
      document: {
        id: docRef.id,
        ...documentRecord,
        created_at: new Date()
      }
    });

  } catch (error) {
    console.error('Error summarizing document:', error);

    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    // Handle OpenAI API errors
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'OpenAI API error',
        message: error.response.data?.error?.message || 'Unknown error'
      });
    }

    res.status(500).json({ error: 'Failed to summarize document' });
  }
};

/**
 * GET /api/documents/:projectId
 * Get all documents for a project
 */
const getDocuments = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.uid;

    // Verify project belongs to user
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (projectDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all documents for this project
    const docsSnapshot = await db.collection('documents')
      .where('project_id', '==', projectId)
      .orderBy('created_at', 'desc')
      .get();

    const documents = [];
    docsSnapshot.forEach(doc => {
      const data = doc.data();
      // Don't send file_path to client (security)
      const { file_path, ...safeData } = data;
      documents.push({
        id: doc.id,
        ...safeData
      });
    });

    res.json({
      success: true,
      documents
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

/**
 * GET /api/documents/doc/:documentId
 * Get a specific document
 */
const getDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.uid;

    const docSnapshot = await db.collection('documents').doc(documentId).get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (docSnapshot.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = docSnapshot.data();
    const { file_path, ...safeData } = data;

    res.json({
      success: true,
      document: {
        id: docSnapshot.id,
        ...safeData
      }
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

/**
 * DELETE /api/documents/doc/:documentId
 * Delete a document
 */
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.uid;

    const docRef = db.collection('documents').doc(documentId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (docSnapshot.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete physical file
    const filePath = docSnapshot.data().file_path;
    if (filePath) {
      await fs.unlink(filePath).catch(err => {
        console.warn('Could not delete file:', err.message);
      });
    }

    // Delete Firestore record
    await docRef.delete();

    res.json({
      success: true,
      message: 'Document deleted'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
};

module.exports = {
  summarizeDocument,
  getDocuments,
  getDocument,
  deleteDocument
};

