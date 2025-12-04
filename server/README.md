# InsightForge Backend Server

Express.js backend server for the InsightForge application.

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `server` directory (see `.env.example` for reference):
   ```env
   PORT=5000
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key
   FRONTEND_URL=http://localhost:5173
   
   # Firebase Admin (use environment variables or serviceAccountKey.json)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
   ```

3. **Or use Firebase service account file:**
   - Download `serviceAccountKey.json` from Firebase Console
   - Place it in `server/config/serviceAccountKey.json`
   - (Note: This file is git-ignored for security)

4. **Start the server:**
   ```bash
   npm run dev  # Development mode with auto-reload
   # or
   npm start    # Production mode
   ```

5. **Test the server:**
   ```bash
   curl http://localhost:5000/api/health
   ```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/auth/health` - Auth service health check
- `POST /api/auth/verify` - Verify Firebase token
- `POST /api/projects` - Create/get projects
- `POST /api/research` - Create research sessions
- `POST /api/documents` - Upload documents
- `POST /api/reports` - Generate reports

See `routes/` directory for full API documentation.

## Deployment

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Render deployment instructions.**

Quick checklist:
- ✅ Server listens on `process.env.PORT` (Render compatible)
- ✅ Environment variables configured
- ✅ CORS configured for production frontend
- ✅ Health check endpoint available

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key for AI features |
| `FRONTEND_URL` | **Yes** (production) | Frontend URL for CORS |
| `FIREBASE_PROJECT_ID` | **Yes** | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | **Yes** | Firebase service account private key |
| `FIREBASE_CLIENT_EMAIL` | **Yes** | Firebase service account email |
| `FIREBASE_CLIENT_ID` | Yes | Firebase service account client ID |
| `FIREBASE_PRIVATE_KEY_ID` | Yes | Firebase private key ID |
| `FIREBASE_CLIENT_X509_CERT_URL` | Yes | Firebase X509 cert URL |

## Project Structure

```
server/
├── config/          # Configuration files (serviceAccountKey.json)
├── controllers/     # Route controllers
├── lib/            # Shared libraries (Firebase Admin)
├── middleware/     # Express middleware (auth)
├── models/         # Data models (if any)
├── routes/         # API route definitions
├── uploads/        # Uploaded files (PDFs, etc.)
├── index.js        # Server entry point
└── package.json    # Dependencies
```

## Troubleshooting

**Server won't start:**
- Check that PORT is available
- Verify all required environment variables are set
- Check Firebase credentials are valid

**CORS errors:**
- Make sure `FRONTEND_URL` matches your frontend URL exactly
- In development, localhost is allowed automatically

**Firebase errors:**
- Verify service account key is valid
- Check that Firebase Admin SDK is initialized correctly

**Gemini API errors:**
- Verify `GEMINI_API_KEY` is correct and has quota remaining

