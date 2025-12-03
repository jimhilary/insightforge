# 📁 Complete Folder Structure Explained - Days 1 & 2

## 🎯 Quick Reference: "What Does Each Folder Do?"

```
insightForge/
│
├── 📁 client/                  ➔ FRONTEND (What users see)
│   │
│   ├── 📁 src/
│   │   │
│   │   ├── 📁 pages/           ➔ "The Screens"
│   │   │   ├── AuthPage.jsx         → Login/Signup screen
│   │   │   ├── Dashboard.jsx        → Projects list
│   │   │   └── ProjectDetail.jsx    → Research + Documents tabs
│   │   │
│   │   ├── 📁 components/      ➔ "Reusable UI Pieces"
│   │   │   ├── RequireAuth.jsx      → Protects routes
│   │   │   └── ui/                  → Shadcn components
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── input.jsx
│   │   │       ├── textarea.jsx
│   │   │       ├── badge.jsx
│   │   │       ├── skeleton.jsx
│   │   │       ├── accordion.jsx
│   │   │       ├── progress.jsx
│   │   │       └── alert-dialog.jsx
│   │   │
│   │   ├── 📁 services/        ➔ "API Callers" (talk to backend)
│   │   │   ├── api.js               → Axios setup
│   │   │   ├── authService.js       → Auth API calls
│   │   │   ├── projectService.js    → Project CRUD
│   │   │   ├── researchService.js   → Research API calls ✨
│   │   │   ├── documentService.js   → Document API calls ✨
│   │   │   └── index.js             → Export all services
│   │   │
│   │   ├── 📁 store/           ➔ "Global State" (Zustand)
│   │   │   ├── authStore.js         → User login state
│   │   │   └── projectStore.js      → Projects state
│   │   │
│   │   ├── 📁 context/         ➔ "React Context" (alt. state)
│   │   │   └── AuthContext.jsx      → Firebase auth listener
│   │   │
│   │   ├── 📁 lib/             ➔ "Utilities"
│   │   │   ├── firebase.js          → Firebase client setup
│   │   │   └── utils.js             → Helper functions
│   │   │
│   │   ├── App.jsx             ➔ "Main Router"
│   │   ├── main.jsx            ➔ "Entry Point"
│   │   └── index.css           ➔ "Global Styles"
│   │
│   ├── 📁 public/
│   │   └── vite.svg                 → Vite logo
│   │
│   ├── index.html              ➔ "HTML Entry"
│   ├── package.json            ➔ "Dependencies"
│   ├── vite.config.js          ➔ "Vite Config"
│   ├── tailwind.config.js      ➔ "Tailwind Config"
│   ├── jsconfig.json           ➔ "Path Aliases"
│   └── components.json         ➔ "Shadcn Config"
│
│
└── 📁 server/                  ➔ BACKEND (The Kitchen)
    │
    ├── 📁 controllers/         ➔ "Business Logic"
    │   ├── researchController.js    → AI research logic ✨
    │   └── documentController.js    → PDF processing logic ✨
    │
    ├── 📁 routes/              ➔ "API Endpoints"
    │   ├── auth.js                  → /api/auth/*
    │   ├── projects.js              → /api/projects/*
    │   ├── research.js              → /api/research/* ✨
    │   └── documents.js             → /api/documents/* ✨
    │
    ├── 📁 middleware/          ➔ "Request Processors"
    │   └── authMiddleware.js        → Token verification
    │
    ├── 📁 lib/                 ➔ "Backend Utilities"
    │   └── firebaseAdmin.js         → Firebase Admin SDK
    │
    ├── 📁 config/              ➔ "Configuration Files"
    │   └── serviceAccountKey.json   → Firebase credentials
    │
    ├── 📁 uploads/             ➔ "PDF Storage" ✨
    │   └── .gitkeep
    │
    ├── 📁 models/              ➔ "Data Models" (empty for now)
    │
    ├── index.js                ➔ "Server Entry Point"
    ├── .env                    ➔ "Environment Variables" ✨
    ├── package.json            ➔ "Dependencies"
    └── .gitignore              ➔ "Git Ignore Rules"
```

---

## 🔄 How Files Connect (Day 2 Focus)

### Research Feature Flow:

```
1. USER TYPES TOPIC
   └─> ProjectDetail.jsx (Research Tab)
       └─> handleRunResearch()

2. FRONTEND SERVICE CALL
   └─> researchService.js
       └─> runResearch({ topic, projectId })

3. API LAYER
   └─> services/api.js
       └─> Adds auth token
       └─> POST http://localhost:5000/api/research

4. BACKEND ROUTES
   └─> server/routes/research.js
       └─> Receives request
       └─> authMiddleware.verifyToken()
       └─> researchController.runResearch()

5. CONTROLLER LOGIC
   └─> server/controllers/researchController.js
       ├─> Verify project ownership
       ├─> Build AI prompt
       ├─> Call OpenAI API
       ├─> Parse JSON response
       └─> Save to Firestore (research_sessions)

6. RESPONSE BACK TO FRONTEND
   └─> ProjectDetail.jsx
       └─> setCurrentResearch(data)
       └─> Display results
```

### Document Upload Flow:

```
1. USER UPLOADS PDF
   └─> ProjectDetail.jsx (Documents Tab)
       └─> handleFileUpload()

2. FRONTEND SERVICE CALL
   └─> documentService.js
       └─> summarizeDocument(projectId, file)
       └─> Sends FormData

3. API LAYER
   └─> services/api.js
       └─> Adds auth token
       └─> POST http://localhost:5000/api/documents/summarize

4. BACKEND ROUTES
   └─> server/routes/documents.js
       └─> multer middleware processes file
       └─> Saves to uploads/
       └─> authMiddleware.verifyToken()
       └─> documentController.summarizeDocument()

5. CONTROLLER LOGIC
   └─> server/controllers/documentController.js
       ├─> Extract text (pdf-parse)
       ├─> Build AI prompt with text
       ├─> Call OpenAI API
       ├─> Parse summary JSON
       └─> Save to Firestore (documents)

6. RESPONSE BACK TO FRONTEND
   └─> ProjectDetail.jsx
       └─> Reload documents
       └─> Display summary
```

---

## 📊 File Purposes (Quick Reference)

### Frontend Files:

| File | Purpose | Memory Trick |
|------|---------|--------------|
| `main.jsx` | Entry point | "Front door" |
| `App.jsx` | Router & manager | "Restaurant manager" |
| `AuthPage.jsx` | Login/signup | "Bouncer at door" |
| `Dashboard.jsx` | Projects list | "Main hall" |
| `ProjectDetail.jsx` | Research & docs | "Private dining room" |
| `RequireAuth.jsx` | Route guard | "Security guard" |
| `api.js` | HTTP client | "Phone to kitchen" |
| `authService.js` | Auth API calls | "Auth waiter" |
| `projectService.js` | Project API calls | "Project waiter" |
| `researchService.js` | Research API calls | "Research waiter" ✨ |
| `documentService.js` | Document API calls | "Document waiter" ✨ |
| `authStore.js` | User state | "Customer registry" |
| `projectStore.js` | Projects state | "Table reservations" |
| `firebase.js` | Firebase client | "Fire extinguisher" |
| `utils.js` | Helper functions | "Swiss Army knife" |

### Backend Files:

| File | Purpose | Memory Trick |
|------|---------|--------------|
| `index.js` | Server entry | "Head chef" |
| `auth.js` (routes) | Auth endpoints | "ID verification station" |
| `projects.js` (routes) | Project endpoints | "Project order desk" |
| `research.js` (routes) | Research endpoints | "Research order desk" ✨ |
| `documents.js` (routes) | Document endpoints | "Document order desk" ✨ |
| `authMiddleware.js` | Token verifier | "Token bouncer" |
| `researchController.js` | AI research logic | "Research chef" ✨ |
| `documentController.js` | PDF processing | "Document chef" ✨ |
| `firebaseAdmin.js` | Firebase backend | "Backend fire ext." |
| `serviceAccountKey.json` | Firebase key | "Master key" |

---

## 🎨 Component Hierarchy (Frontend)

```
App.jsx
└── BrowserRouter
    └── AuthProvider
        └── Routes
            ├── /auth
            │   └── AuthPage
            │       ├── Card
            │       ├── Input
            │       ├── Label
            │       └── Button
            │
            ├── /dashboard
            │   └── RequireAuth
            │       └── Dashboard
            │           ├── Card
            │           ├── Button
            │           └── AlertDialog
            │
            └── /projects/:id
                └── RequireAuth
                    └── ProjectDetail
                        ├── Header
                        │   ├── Button
                        │   ├── Input
                        │   └── Textarea
                        │
                        ├── Tabs
                        │
                        ├── Research Tab
                        │   ├── Form
                        │   │   ├── Textarea
                        │   │   └── Button
                        │   │
                        │   ├── Results
                        │   │   ├── Card
                        │   │   ├── Accordion ✨
                        │   │   └── Badge ✨
                        │   │
                        │   └── Sidebar
                        │       ├── Card
                        │       └── Skeleton ✨
                        │
                        └── Documents Tab
                            ├── Upload
                            │   ├── Input[file]
                            │   └── Progress ✨
                            │
                            ├── Documents List
                            │   ├── Card
                            │   └── Badge ✨
                            │
                            └── Sidebar
                                ├── Card
                                └── Skeleton ✨
```

---

## 🗄️ Database Collections (Firestore)

```
Firestore Database
│
├── 📁 projects
│   └── {projectId}
│       ├── title: string
│       ├── description: string
│       ├── user_id: string
│       ├── created_at: Timestamp
│       └── updated_at: Timestamp
│
├── 📁 research_sessions ✨ NEW
│   └── {sessionId}
│       ├── project_id: string → links to projects
│       ├── user_id: string
│       ├── topic: string
│       ├── overview: string
│       ├── deep_explanations: array
│       ├── sources: array
│       ├── key_findings: array
│       ├── created_at: Timestamp
│       └── updated_at: Timestamp
│
└── 📁 documents ✨ NEW
    └── {documentId}
        ├── project_id: string → links to projects
        ├── user_id: string
        ├── filename: string
        ├── file_size: number
        ├── file_path: string
        ├── summary: string
        ├── key_points: array
        ├── topics: array
        ├── extracted_data: object
        ├── created_at: Timestamp
        └── updated_at: Timestamp
```

---

## 🔐 Security Chain

```
Every Request:

1. Frontend (api.js)
   └─> Adds: Authorization: "Bearer <firebase-token>"

2. Backend (authMiddleware.js)
   └─> Verifies token with Firebase Admin
   └─> Extracts user info
   └─> Attaches to req.user

3. Controller (researchController.js / documentController.js)
   └─> Checks: project.user_id === req.user.uid
   └─> Only allows access to own data

4. Response
   └─> Success: 200 with data
   └─> Unauthorized: 401
   └─> Forbidden: 403
```

---

## 📦 Dependencies Summary

### Frontend (`client/package.json`):
```javascript
{
  // Framework
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.9.6",
  
  // State Management
  "zustand": "^5.0.8",
  
  // API & Firebase
  "axios": "^1.13.2",
  "firebase": "^12.6.0",
  
  // UI Components
  "lucide-react": "^0.554.0",  // Icons
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  
  // Build Tools
  "@vitejs/plugin-react": "^5.1.0",
  "@tailwindcss/vite": "^4.0.0",
  "tailwindcss": "^4.0.0",
  "vite": "^7.2.2"
}
```

### Backend (`server/package.json`):
```javascript
{
  // Framework
  "express": "^4.21.2",
  "cors": "^2.8.5",
  
  // Firebase
  "firebase-admin": "^13.0.2",
  
  // AI & File Processing ✨ NEW
  "openai": "^4.79.4",
  "pdf-parse": "^2.4.5",
  "multer": "^1.4.5-lts.1",
  
  // Environment
  "dotenv": "^16.4.7"
}
```

---

## 🎯 What Each Folder "Owns"

### `/client/src/pages/`
**Owns**: User-facing screens
**Creates**: Visual layouts
**Uses**: Components, services, stores
**Talks to**: Backend via services

### `/client/src/components/`
**Owns**: Reusable UI elements
**Creates**: Buttons, cards, inputs
**Uses**: Tailwind CSS, Shadcn
**Talks to**: Nothing (pure UI)

### `/client/src/services/`
**Owns**: API communication
**Creates**: HTTP requests
**Uses**: Axios, auth tokens
**Talks to**: Backend endpoints

### `/client/src/store/`
**Owns**: Global state
**Creates**: Zustand stores
**Uses**: LocalStorage
**Talks to**: Components (consumed)

### `/server/routes/`
**Owns**: API endpoints
**Creates**: Express routes
**Uses**: Controllers, middleware
**Talks to**: Controllers

### `/server/controllers/`
**Owns**: Business logic
**Creates**: Data processing
**Uses**: OpenAI, Firestore, pdf-parse
**Talks to**: External APIs, database

### `/server/middleware/`
**Owns**: Request processing
**Creates**: Auth verification
**Uses**: Firebase Admin
**Talks to**: Routes (intercepts)

---

## 🚀 Startup Sequence

### When you run `npm run dev` (client):
```
1. Vite starts dev server
2. Loads index.html
3. Executes main.jsx
4. Renders App.jsx
5. Sets up React Router
6. Initializes AuthProvider
7. Checks localStorage for auth
8. Renders current route
```

### When you run `node index.js` (server):
```
1. Loads environment variables (.env)
2. Initializes Express app
3. Sets up CORS
4. Registers middleware
5. Registers routes
6. Starts listening on port 5000
7. Logs: "Server is running..."
```

---

## 📝 Key Takeaways

### For Frontend:
- **pages/** = What users see
- **components/** = Reusable UI
- **services/** = Talk to backend
- **store/** = Global state

### For Backend:
- **routes/** = API endpoints
- **controllers/** = Business logic
- **middleware/** = Security checks
- **lib/** = Shared utilities

### Day 2 Additions (✨):
- **researchService.js** - AI research API calls
- **documentService.js** - PDF upload API calls
- **researchController.js** - AI research logic
- **documentController.js** - PDF processing logic
- **research.js** (routes) - Research endpoints
- **documents.js** (routes) - Document endpoints
- **uploads/** - PDF file storage

---

This structure follows the **MVC pattern** (Model-View-Controller) and **separation of concerns** principles!

