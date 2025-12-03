# Day 2 Setup Guide - AI Research & Document Summarizer

## ✅ What We've Built

### Backend Features:
- ✅ AI Research endpoint (`POST /api/research`)
- ✅ Research sessions management (GET, DELETE)
- ✅ Document upload & summarization (`POST /api/documents/summarize`)
- ✅ Documents management (GET, DELETE)
- ✅ PDF text extraction
- ✅ OpenAI integration for both research and summarization

### Frontend Features:
- ✅ Research tab with topic input
- ✅ Real-time AI research execution
- ✅ Display research results (overview, key findings, deep explanations, sources)
- ✅ Past research sessions sidebar
- ✅ Document upload with drag-and-drop
- ✅ Upload progress indicator
- ✅ Document summaries display (summary, key points, topics, metadata)
- ✅ Document library sidebar
- ✅ Delete functionality for both research and documents

---

## 🔑 IMPORTANT: OpenAI API Key Setup

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (you won't see it again!)

### Step 2: Add Key to Backend

Open `server/.env` and add your key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=5000
```

⚠️ **CRITICAL**: Never commit `.env` to git! It's already in `.gitignore`.

---

## 🚀 Running the Application

### Terminal 1 - Backend Server:
```bash
cd server
node index.js
```

You should see:
```
Server is running on http://localhost:5000
```

### Terminal 2 - Frontend Client:
```bash
cd client
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🧪 Testing the Features

### Testing AI Research:

1. **Login** to your account
2. **Go to a project** (or create one)
3. Click on **Research tab**
4. Enter a topic like:
   - "Artificial Intelligence in healthcare"
   - "Climate change solutions"
   - "Blockchain technology applications"
5. Click **Run Research**
6. Wait 10-30 seconds (AI is working!)
7. View results:
   - Overview paragraph
   - Key findings bullets
   - Detailed sections (collapsible)
   - Sources with links

### Testing Document Summarization:

1. Go to **Documents tab**
2. **Upload a PDF** (drag-and-drop or click)
   - Max size: 10MB
   - PDF only
3. Wait while it:
   - Extracts text from PDF
   - Sends to AI for analysis
   - Returns summary
4. View results:
   - Summary paragraph
   - Key points
   - Topics (tags)
   - Document metadata

---

## 📊 API Endpoints Reference

### Research Endpoints:

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/research` | POST | `{ topic, projectId }` | Research session with AI results |
| `/api/research/:projectId` | GET | — | All research sessions for project |
| `/api/research/session/:sessionId` | GET | — | Specific research session |
| `/api/research/session/:sessionId` | DELETE | — | Delete research session |

### Document Endpoints:

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/documents/summarize` | POST | `FormData(file, projectId)` | Document with AI summary |
| `/api/documents/:projectId` | GET | — | All documents for project |
| `/api/documents/doc/:documentId` | GET | — | Specific document |
| `/api/documents/doc/:documentId` | DELETE | — | Delete document |

---

## 🗄️ Database Schema (Firestore)

### `research_sessions` Collection:
```javascript
{
  project_id: string,
  user_id: string,
  topic: string,
  overview: string,
  deep_explanations: [
    { title: string, content: string }
  ],
  sources: [
    { title: string, url: string, description: string }
  ],
  key_findings: [string],
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### `documents` Collection:
```javascript
{
  project_id: string,
  user_id: string,
  filename: string,
  file_size: number,
  file_type: string,
  file_path: string, // Local storage path
  summary: string,
  key_points: [string],
  topics: [string],
  extracted_data: {
    type: string,
    main_subject: string,
    key_entities: [string]
  },
  text_length: number,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

---

## 🐛 Troubleshooting

### "OpenAI API error" or "Failed to run research"

**Problem**: OpenAI API key not set or invalid

**Solution**:
1. Check `server/.env` file exists
2. Verify `OPENAI_API_KEY=sk-...` is set correctly
3. Restart the backend server

---

### "Failed to parse PDF" error

**Problem**: PDF might be scanned images or corrupted

**Solution**:
- Use text-based PDFs (not scanned images)
- Try a different PDF file
- Check file size (must be < 10MB)

---

### Research takes too long (>1 minute)

**Problem**: Large topic or slow API

**Solution**:
- Try a more specific topic
- Check your internet connection
- OpenAI API can be slow during peak times

---

### 404 Error on API calls

**Problem**: Backend server not running or routes not registered

**Solution**:
1. Check backend terminal for errors
2. Restart backend: `cd server && node index.js`
3. Verify you see both routes loaded:
   ```
   Server is running on http://localhost:5000
   ```

---

## 💰 OpenAI API Costs

### Estimated Costs (GPT-4o-mini):

- **Research**: ~$0.01 - $0.05 per topic
- **Document Summary**: ~$0.005 - $0.02 per PDF (depending on length)

### Cost-Saving Tips:

1. Use `gpt-4o-mini` model (already configured) - 10x cheaper than GPT-4
2. Limit PDF sizes
3. Be specific with research topics (less tokens = less cost)
4. Set usage limits in OpenAI dashboard

---

## 🎉 Day 2 Milestone Achieved!

You can now:

✅ **Research any topic with AI**
   - Get comprehensive overviews
   - View detailed explanations
   - See credible sources
   - Save past sessions

✅ **Upload & Summarize PDFs**
   - Drag-and-drop interface
   - AI-powered summaries
   - Key points extraction
   - Topic tagging
   - Document library

---

## 🔮 What's Next?

**Day 3 Possibilities:**
- Report generation (combine research + documents)
- Export to PDF/Word
- Advanced search across all content
- Citation management
- Collaborative features
- Web search integration for research
- Cloud storage for documents (AWS S3, etc.)

---

## 📝 Notes

- All uploaded files are stored in `server/uploads/` directory
- Research sessions and documents are stored in Firestore
- File paths are not sent to the client (security)
- All routes are protected with Firebase authentication

---

**Need Help?**
- Check backend terminal for error logs
- Check browser console for frontend errors
- Verify OpenAI API key is set correctly
- Ensure both servers are running

