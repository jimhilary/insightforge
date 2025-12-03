# Account Deletion API Documentation

## Endpoint

```
DELETE /api/auth/delete-account
```

## Description

Permanently deletes a user account and all associated data from the InsightForge application. This includes:

- All user projects
- All research sessions
- All uploaded documents
- All generated reports
- Firebase Authentication account

**⚠️ WARNING: This action is irreversible!**

## Authentication

Requires a valid Firebase ID token in the Authorization header.

```
Authorization: Bearer <firebase_id_token>
```

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Firebase ID token: `Bearer <token>` |
| `Content-Type` | Yes | `application/json` |

### Body

No request body required.

## Response

### Success Response (200 OK)

```json
{
  "message": "Account and all associated data deleted successfully",
  "deletedProjects": 2,
  "deletedUserId": "8xZz6wK1HpgdYc1pNv1Yq8nQukI2",
  "deletedUserEmail": "user@example.com"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```
or
```json
{
  "error": "Invalid token"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to delete account",
  "details": "Error message details"
}
```

## What Gets Deleted

1. **Firestore Collections:**
   - `projects` - All projects owned by the user
   - `research_sessions` - All research sessions for user's projects
   - `documents` - All uploaded documents for user's projects
   - `reports` - All generated reports for user's projects

2. **Firebase Authentication:**
   - User account is permanently deleted from Firebase Auth

## Implementation Details

### Backend Flow

1. **Token Verification** - Middleware verifies the Firebase ID token
2. **Extract User ID** - Gets `uid` from decoded token
3. **Delete Firestore Data:**
   - Query all projects by `user_id`
   - For each project, delete related research sessions, documents, and reports
   - Delete all projects
4. **Delete Firebase Auth Account:**
   - Uses Firebase Admin SDK to delete the user
   - Verifies deletion by attempting `getUser()` (should fail with `user-not-found`)

### Frontend Flow

1. User confirms deletion by typing "DELETE"
2. Frontend calls `DELETE /api/auth/delete-account` with auth token
3. On success:
   - Clears Zustand auth store
   - Signs out from Firebase Auth
   - Clears localStorage
   - Redirects to `/auth` page

## Security Considerations

- **Authentication Required:** Only authenticated users can delete their own account
- **Token Validation:** Backend verifies token before processing
- **User Isolation:** Users can only delete their own account (enforced by token `uid`)
- **No Recovery:** Deleted accounts cannot be recovered

## Example Usage

### cURL

```bash
curl -X DELETE http://localhost:5000/api/auth/delete-account \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript (Frontend)

```javascript
const token = useAuthStore.getState().token;

await axios.delete('http://localhost:5000/api/auth/delete-account', {
  headers: { 
    Authorization: `Bearer ${token}` 
  }
});
```

## Related Files

- **Backend Route:** `server/routes/auth.js`
- **Middleware:** `server/middleware/authMiddleware.js`
- **Firebase Admin:** `server/lib/firebaseAdmin.js`
- **Frontend UI:** `client/src/pages/ProfilePage.jsx`
- **Auth Store:** `client/src/store/authStore.js`

## Notes

- Account deletion is immediate and permanent
- All data is deleted synchronously
- Firebase Auth deletion uses Admin SDK (server-side only)
- After deletion, user tokens become invalid
- User will be automatically logged out after successful deletion

