# InsightForge API Documentation

## Overview

InsightForge is an AI-powered research assistant application that helps users conduct research, analyze documents, and generate comprehensive reports.

## API Endpoints

### Authentication

- `GET /api/auth/health` - Health check
- `GET /api/auth/verify` - Verify authentication token
- `DELETE /api/auth/delete-account` - Delete user account and all data

### Projects

- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Research

- `POST /api/research` - Run AI research on a topic
- `GET /api/research/:projectId` - Get all research sessions for a project
- `DELETE /api/research/:sessionId` - Delete research session

### Documents

- `POST /api/documents/upload` - Upload and summarize PDF document
- `GET /api/documents/:projectId` - Get all documents for a project
- `DELETE /api/documents/:documentId` - Delete document

### Reports

- `POST /api/reports/generate` - Generate report from research and documents
- `GET /api/reports/:projectId` - Get all reports for a project
- `GET /api/reports/view/:reportId` - Get specific report
- `DELETE /api/reports/:reportId` - Delete report

## Detailed Documentation

- [Account Deletion API](./API_DELETE_ACCOUNT.md) - Complete documentation for the account deletion endpoint

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## Base URL

- Development: `http://localhost:5000`
- Production: Set via `VITE_API_URL` environment variable

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

