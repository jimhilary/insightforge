# Day 2 Architecture - AI Research & Document Summarizer

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ProjectDetail.jsx                                           │
│  ├── Research Tab                                            │
│  │   ├── Topic Input Form                                   │
│  │   ├── Research Results Display                           │
│  │   └── Past Sessions Sidebar                              │
│  │                                                           │
│  └── Documents Tab                                           │
│      ├── File Upload (Drag & Drop)                          │
│      ├── Upload Progress                                    │
│      ├── Documents List with Summaries                      │
│      └── Document Library Sidebar                           │
│                                                              │
│  Services:                                                   │
│  ├── researchService.js → API calls for research            │
│  └── documentService.js → API calls for documents           │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ HTTP Requests (Axios)
                   │ + Firebase Auth Token
                   │
┌──────────────────▼───────────────────────────────────────────┐
│                  BACKEND (Express.js)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Routes:                                                     │
│  ├── /api/research (research.js)                            │
│  │   ├── POST /                                             │
│  │   ├── GET /:projectId                                    │
│  │   ├── GET /session/:sessionId                            │
│  │   └── DELETE /session/:sessionId                         │
│  │                                                           │
│  └── /api/documents (documents.js)                          │
│      ├── POST /summarize (+ multer middleware)              │
│      ├── GET /:projectId                                    │
│      ├── GET /doc/:documentId                               │
│      └── DELETE /doc/:documentId                            │
│                                                              │
│  Middleware:                                                 │
│  └── authMiddleware.js → Verify Firebase token              │
│                                                              │
│  Controllers:                                                │
│  ├── researchController.js                                  │
│  │   ├── Build AI prompt                                    │
│  │   ├── Call OpenAI API                                    │
│  │   └── Save to Firestore                                  │
│  │                                                           │
│  └── documentController.js                                  │
│      ├── Receive PDF upload                                 │
│      ├── Extract text (pdf-parse)                           │
│      ├── Call OpenAI API                                    │
│      └── Save to Firestore                                  │
│                                                              │
└──────────┬──────────────────────────┬────────────────────────┘
           │                          │
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│   OpenAI API         │   │   Firestore DB       │
│   (GPT-4o-mini)      │   │                      │
│                      │   │  Collections:        │
│  • Research topics   │   │  ├── projects        │
│  • Document analysis │   │  ├── research_sessions│
│  • JSON responses    │   │  └── documents       │
└──────────────────────┘   └──────────────────────┘
```

---

## 🔄 Data Flow - Research Feature

```
USER ACTION: "I want to research: AI in Healthcare"
│
├─> 1. Frontend (ProjectDetail.jsx)
│   └─> handleRunResearch() triggered
│       └─> researchService.runResearch()
│           └─> POST /api/research
│               Body: { topic: "AI in Healthcare", projectId: "123" }
│               Headers: { Authorization: "Bearer <firebase-token>" }
│
├─> 2. Backend (server/routes/research.js)
│   └─> Receives request
│       └─> authMiddleware.verifyToken()
│           ├─> Verifies Firebase token
│           └─> Attaches user to req.user
│       └─> researchController.runResearch()
│
├─> 3. Controller (researchController.js)
│   ├─> Verify project ownership
│   ├─> Build AI prompt:
│   │   "You are a research assistant. Given the topic 'AI in Healthcare'..."
│   ├─> Call OpenAI API:
│   │   └─> openai.chat.completions.create({
│   │       model: "gpt-4o-mini",
│   │       messages: [...],
│   │       response_format: { type: "json_object" }
│   │     })
│   ├─> Parse JSON response:
│   │   {
│   │     overview: "...",
│   │     deep_explanations: [...],
│   │     sources: [...],
│   │     key_findings: [...]
│   │   }
│   └─> Save to Firestore (research_sessions collection)
│
├─> 4. Response to Frontend
│   └─> { success: true, session: { id, topic, overview, ... } }
│
└─> 5. Frontend Updates
    ├─> setCurrentResearch(data.session)
    ├─> Reload sessions list
    └─> Display results:
        ├─> Overview paragraph
        ├─> Key findings bullets
        ├─> Collapsible deep explanations
        └─> Sources with clickable links
```

---

## 📄 Data Flow - Document Upload & Summarization

```
USER ACTION: "Upload research-paper.pdf"
│
├─> 1. Frontend (ProjectDetail.jsx)
│   └─> handleFileUpload() triggered
│       └─> documentService.summarizeDocument()
│           └─> POST /api/documents/summarize
│               Body: FormData {
│                 file: <pdf-file>,
│                 projectId: "123"
│               }
│               Headers: {
│                 Authorization: "Bearer <token>",
│                 Content-Type: "multipart/form-data"
│               }
│
├─> 2. Backend (server/routes/documents.js)
│   └─> Receives request
│       └─> multer middleware processes file:
│           ├─> Saves to server/uploads/
│           ├─> Validates (PDF only, <10MB)
│           └─> Attaches file info to req.file
│       └─> authMiddleware.verifyToken()
│       └─> documentController.summarizeDocument()
│
├─> 3. Controller (documentController.js)
│   ├─> Verify project ownership
│   ├─> Extract text from PDF:
│   │   └─> pdfParse(fileBuffer)
│   │       └─> Returns: { text: "..." }
│   ├─> Truncate if too long (50,000 chars max)
│   ├─> Build AI prompt:
│   │   "Analyze and summarize the following document..."
│   ├─> Call OpenAI API:
│   │   └─> openai.chat.completions.create({
│   │       model: "gpt-4o-mini",
│   │       messages: [...],
│   │       response_format: { type: "json_object" }
│   │     })
│   ├─> Parse JSON response:
│   │   {
│   │     summary: "...",
│   │     key_points: [...],
│   │     topics: [...],
│   │     extracted_data: {...}
│   │   }
│   └─> Save to Firestore (documents collection)
│       ├─> filename, file_size, file_path
│       └─> summary, key_points, topics
│
├─> 4. Response to Frontend
│   └─> { success: true, document: { id, filename, summary, ... } }
│
└─> 5. Frontend Updates
    ├─> Reload documents list
    ├─> Display document card:
    │   ├─> Filename & metadata
    │   ├─> Summary paragraph
    │   ├─> Key points (bullets)
    │   └─> Topics (badges)
    └─> Add to document library sidebar
```

---

## 🗂️ File Structure - Day 2 Additions

```
insightForge/
│
├── client/
│   └── src/
│       ├── pages/
│       │   └── ProjectDetail.jsx ✨ UPDATED (Research & Docs tabs)
│       │
│       ├── services/
│       │   ├── researchService.js ✨ NEW
│       │   ├── documentService.js ✨ NEW
│       │   └── index.js (updated exports)
│       │
│       └── components/ui/
│           ├── textarea.jsx ✨ NEW (Shadcn)
│           ├── badge.jsx ✨ NEW (Shadcn)
│           ├── skeleton.jsx ✨ NEW (Shadcn)
│           ├── accordion.jsx ✨ NEW (Shadcn)
│           └── progress.jsx ✨ NEW (Shadcn)
│
└── server/
    ├── controllers/
    │   ├── researchController.js ✨ NEW
    │   └── documentController.js ✨ NEW
    │
    ├── routes/
    │   ├── research.js ✨ NEW
    │   └── documents.js ✨ NEW
    │
    ├── uploads/ ✨ NEW (PDF storage)
    │   └── .gitkeep
    │
    ├── index.js (updated with new routes)
    └── .env (OPENAI_API_KEY added)
```

---

## 🔐 Security Flow

```
Every Request:
│
├─> 1. Frontend attaches Firebase token
│   └─> axios interceptor adds: Authorization: "Bearer <token>"
│
├─> 2. Backend receives request
│   └─> authMiddleware.verifyToken()
│       ├─> Extracts token from header
│       ├─> Verifies with Firebase Admin SDK
│       ├─> If valid: attach user to req.user
│       └─> If invalid: return 401 Unauthorized
│
├─> 3. Controller checks ownership
│   └─> Verify project belongs to req.user.uid
│       ├─> If yes: proceed
│       └─> If no: return 403 Forbidden
│
└─> 4. Action performed
    └─> User can only access their own data
```

---

## 💾 Database Schema Details

### Research Sessions Schema:
```javascript
{
  // IDs
  id: "auto-generated",
  project_id: "ref-to-projects",
  user_id: "firebase-uid",
  
  // Content
  topic: "AI in Healthcare",
  overview: "Comprehensive 2-3 paragraphs...",
  
  // Structured data
  deep_explanations: [
    {
      title: "Machine Learning in Diagnostics",
      content: "Detailed explanation..."
    },
    // ... more sections
  ],
  
  sources: [
    {
      title: "Research Paper Title",
      url: "https://...",
      description: "Brief summary"
    },
    // ... more sources
  ],
  
  key_findings: [
    "Key finding 1",
    "Key finding 2",
    // ... more findings
  ],
  
  // Metadata
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Documents Schema:
```javascript
{
  // IDs
  id: "auto-generated",
  project_id: "ref-to-projects",
  user_id: "firebase-uid",
  
  // File info
  filename: "research-paper.pdf",
  file_size: 2456789, // bytes
  file_type: "application/pdf",
  file_path: "uploads/file-123456789.pdf",
  
  // AI Analysis
  summary: "This document discusses...",
  
  key_points: [
    "Main point 1",
    "Main point 2",
    // ... more points
  ],
  
  topics: [
    "Machine Learning",
    "Healthcare",
    "Diagnostics"
  ],
  
  extracted_data: {
    type: "Research Paper",
    main_subject: "AI in Medical Imaging",
    key_entities: ["CNN", "Neural Networks", "MRI"]
  },
  
  // Metadata
  text_length: 45678, // characters
  created_at: Timestamp,
  updated_at: Timestamp
}
```

---

## 🎨 UI Components Breakdown

### Research Tab:
```
┌─────────────────────────────────────────────────────────┐
│ Research Form Card                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Topic Input (Textarea)                              │ │
│ │ [Run Research Button] ← Sparkles icon + loading    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Research Results Card (if currentResearch exists)        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📄 Overview Section                                 │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Comprehensive overview text...                  │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ 🔑 Key Findings                                     │ │
│ │ • Finding 1                                         │ │
│ │ • Finding 2                                         │ │
│ │                                                     │ │
│ │ 📚 Detailed Analysis (Accordion)                    │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ ▶ Section 1 Title                               │ │ │
│ │ │ ▼ Section 2 Title (expanded)                    │ │ │
│ │ │   Detailed content here...                      │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ 🔗 Sources & References                             │ │
│ │ [Source 1 Card] → Link                              │ │
│ │ [Source 2 Card] → Link                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

SIDEBAR:
┌───────────────────────┐
│ Past Sessions         │
│ ┌───────────────────┐ │
│ │ Session 1    [X]  │ │
│ │ Topic here        │ │
│ │ Date              │ │
│ └───────────────────┘ │
│ ┌───────────────────┐ │
│ │ Session 2    [X]  │ │
│ └───────────────────┘ │
└───────────────────────┘
```

### Documents Tab:
```
┌─────────────────────────────────────────────────────────┐
│ Upload Card                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │        📤 Drag & Drop Zone                          │ │
│ │        Click to upload                              │ │
│ │        PDF files only, up to 10MB                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Progress Bar] ████████░░░░ 80%                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Document Card                                   [Delete]│
│ 📄 research-paper.pdf                                   │
│ Uploaded on Jan 1, 2024 • 2.5 MB                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Summary:                                            │ │
│ │ This document discusses...                          │ │
│ │                                                     │ │
│ │ Key Points:                                         │ │
│ │ • Point 1                                           │ │
│ │ • Point 2                                           │ │
│ │                                                     │ │
│ │ Topics: [AI] [Healthcare] [Research]                │ │
│ │                                                     │ │
│ │ Document Info:                                      │ │
│ │ Type: Research Paper                                │ │
│ │ Subject: Medical AI                                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

SIDEBAR:
┌───────────────────────┐
│ Document Library      │
│ ┌───────────────────┐ │
│ │ 📄 doc1.pdf       │ │
│ │ 2.5 MB            │ │
│ └───────────────────┘ │
│ ┌───────────────────┐ │
│ │ 📄 doc2.pdf       │ │
│ │ 1.2 MB            │ │
│ └───────────────────┘ │
└───────────────────────┘
```

---

## 🚀 Performance Considerations

### OpenAI API Calls:
- **Research**: 10-30 seconds (depends on topic complexity)
- **Document**: 15-45 seconds (depends on PDF length)
- Uses `gpt-4o-mini` for cost efficiency
- Truncates very long PDFs (50k characters max)

### File Storage:
- PDFs stored locally in `server/uploads/`
- For production: migrate to AWS S3, Google Cloud Storage, or Firebase Storage
- Current limit: 10MB per file

### Database Queries:
- Firestore queries are optimized with `.where()` filters
- Only fetch data for current user's projects
- Timestamps indexed for sorting

---

## 🔮 Future Enhancements

### Possible Improvements:
1. **Web Search Integration**: Real-time web search for research
2. **Cloud Storage**: AWS S3 for PDFs instead of local storage
3. **Streaming Responses**: Stream AI responses for faster UX
4. **Batch Processing**: Upload multiple PDFs at once
5. **Citation Export**: Export citations in APA/MLA format
6. **Document Chat**: Ask questions about uploaded documents
7. **Report Generation**: Combine research + documents into reports
8. **Collaborative Research**: Share research sessions with team

---

This architecture provides a solid foundation for AI-powered research and document management!

