# Day 3 - Firestore Index Fix for Reports

## Issue
The `/api/reports/:projectId` endpoint is failing with:
```
Error: 9 FAILED_PRECONDITION: The query requires an index.
```

## Solution: Create Composite Index

### Quick Link (Recommended):
Click this link to automatically create the index:
https://console.firebase.google.com/v1/r/project/insightforge-828ee/firestore/indexes?create_composite=ClJwcm9qZWN0cy9pbnNpZ2h0Zm9yZ2UtODI4ZWUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3JlcG9ydHMvaW5kZXhlcy9fEAEaDgoKcHJvamVjdF9pZBABGg4KCmNyZWF0ZWRfYXQQAhoMCghfX25hbWVfXxAC

### Manual Steps:
1. Go to: https://console.firebase.google.com/project/insightforge-828ee/firestore/indexes
2. Click **"Create Index"** button
3. Configure the index:
   - **Collection ID**: `reports`
   - **Field 1**: `project_id` → **Ascending** ⬆️
   - **Field 2**: `created_at` → **Descending** ⬇️
   - **Query scope**: Collection
4. Click **"Create Index"**
5. Wait 2-5 minutes for index to build (status will change from "Building" to "Enabled")

### Index Configuration Details:
```
Collection: reports
Fields:
  - project_id: Ascending
  - created_at: Descending
```

### Why This Index is Needed:
The `getReports` function in `server/controllers/reportController.js` queries:
```javascript
db.collection('reports')
  .where('project_id', '==', projectId)
  .orderBy('created_at', 'desc')
  .get();
```

Firestore requires a composite index for queries that:
1. Filter on one field (`project_id`)
2. AND sort on another field (`created_at`)

## After Creating Index:
- Wait 2-5 minutes for the index to build
- Refresh your frontend Reports tab
- The "Report Library" sidebar should now load successfully

