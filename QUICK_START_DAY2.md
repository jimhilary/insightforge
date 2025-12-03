# 🚀 Quick Start Guide - Day 2

## ⚡ 5-Minute Setup

### Step 1: Add OpenAI API Key (REQUIRED!)

Open `server/.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
PORT=5000
```

> **Where to get an OpenAI API key?**
> 1. Go to https://platform.openai.com/api-keys
> 2. Create account or login
> 3. Click "Create new secret key"
> 4. Copy and paste it above

---

### Step 2: Start Backend Server

Open Terminal 1:

```bash
cd server
node index.js
```

✅ You should see:
```
Server is running on http://localhost:5000
```

---

### Step 3: Start Frontend

Open Terminal 2:

```bash
cd client
npm run dev
```

✅ You should see:
```
➜  Local:   http://localhost:5173/
```

---

### Step 4: Login & Test

1. Open http://localhost:5173 in your browser
2. Login with your account (or create one)
3. Click on any project (or create a new one)

---

## 🧪 Test AI Research

1. Go to **Research tab**
2. Type a topic:
   ```
   Artificial Intelligence in healthcare
   ```
3. Click **Run Research**
4. Wait 10-30 seconds
5. See magic happen! ✨

**What you'll see:**
- Overview paragraph
- Key findings
- Detailed sections (click to expand)
- Sources with links

---

## 📄 Test Document Summarization

1. Go to **Documents tab**
2. Find a PDF on your computer (any research paper, article, etc.)
3. Drag and drop it (or click to upload)
4. Wait 15-45 seconds
5. See AI summary! 🤖

**What you'll see:**
- Summary paragraph
- Key points (bullets)
- Topics (tags)
- Document metadata

---

## ❌ Troubleshooting

### Error: "Failed to run research"

**Problem**: OpenAI API key not set

**Fix**:
1. Check `server/.env` file
2. Make sure it has: `OPENAI_API_KEY=sk-...`
3. Restart backend server

---

### Error: "Failed to parse PDF"

**Problem**: PDF is scanned images or corrupted

**Fix**:
- Use text-based PDFs (not scanned documents)
- Try a different PDF
- Check file size (< 10MB)

---

### Backend not starting

**Problem**: Port 5000 already in use

**Fix**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

### Frontend not connecting to backend

**Problem**: CORS or wrong URL

**Fix**:
1. Make sure backend is running
2. Check URL in `client/src/services/api.js`:
   ```javascript
   baseURL: 'http://localhost:5000/api'
   ```
3. Restart both servers

---

## 📊 What's Working Now

### ✅ Completed Features:

**Day 1:**
- ✅ User authentication (Firebase)
- ✅ Project management (Create, Read, Update, Delete)
- ✅ Dashboard with projects list
- ✅ Protected routes

**Day 2:**
- ✅ AI Research Assistant
  - Enter any topic
  - Get comprehensive research
  - View past sessions
  - Delete sessions
- ✅ PDF Document Summarizer
  - Upload PDFs (drag & drop)
  - AI-powered summaries
  - Key points extraction
  - Topic tagging
  - Document library

---

## 🎯 Next Steps (Optional)

Want to enhance your app? Try adding:

1. **Export Functionality**
   - Export research as PDF
   - Export citations

2. **Search Feature**
   - Search across all research sessions
   - Filter by topics

3. **Report Generation**
   - Combine multiple research sessions
   - Include document summaries
   - Generate comprehensive reports

4. **Collaboration**
   - Share projects with teammates
   - Comments on research
   - Real-time updates

---

## 💰 Cost Awareness

### OpenAI API Usage:

**Per Research Session:**
- Cost: ~$0.01 - $0.05
- Tokens: ~1,000 - 5,000

**Per PDF Summary:**
- Cost: ~$0.005 - $0.02
- Tokens: ~500 - 2,000

**Using gpt-4o-mini** (10x cheaper than GPT-4)

**Budget Tips:**
- Set usage limits in OpenAI dashboard
- Monitor usage at https://platform.openai.com/usage
- Start with $5-10 credit (plenty for testing)

---

## 📝 Testing Checklist

### Research Feature:
- [ ] Can enter topic
- [ ] Research runs successfully
- [ ] Overview displays
- [ ] Key findings show
- [ ] Detailed sections are collapsible
- [ ] Sources have clickable links
- [ ] Past sessions appear in sidebar
- [ ] Can click past session to view
- [ ] Can delete session

### Document Feature:
- [ ] Can drag and drop PDF
- [ ] Upload progress shows
- [ ] Summary displays correctly
- [ ] Key points appear as bullets
- [ ] Topics show as badges
- [ ] Document metadata visible
- [ ] Document appears in library sidebar
- [ ] Can delete document

---

## 🎉 You're All Set!

Your AI-powered research assistant is ready to use!

**Key Features:**
- 🔍 Research any topic with AI
- 📄 Summarize PDFs automatically
- 💾 Save all sessions and documents
- 🔒 Secure with Firebase authentication
- ⚡ Fast and responsive UI

---

**Need help?**
- Check backend terminal for logs
- Check browser console for errors
- Read `DAY_2_SETUP.md` for detailed guide
- Read `DAY_2_ARCHITECTURE.md` for technical details

