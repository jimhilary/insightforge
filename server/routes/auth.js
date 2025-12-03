const express = require('express');
const router = express.Router();
const { db, admin } = require('../lib/firebaseAdmin');
const { verifyToken } = require('../middleware/authMiddleware');

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Verify token
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name,
    },
  });
});

// Delete account and all associated data
router.delete('/delete-account', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const userEmail = req.user.email;

  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🗑️ STARTING ACCOUNT DELETION`);
    console.log(`📧 User Email: ${userEmail}`);
    console.log(`🆔 User UID: ${userId}`);
    console.log('═══════════════════════════════════════════════════════');

    // 1. Delete all projects
    const projectsSnapshot = await db.collection('projects')
      .where('user_id', '==', userId)
      .get();
    
    const projectIds = projectsSnapshot.docs.map(doc => doc.id);
    console.log(`📁 Found ${projectIds.length} projects to delete`);

    // 2. Delete all research sessions for these projects
    for (const projectId of projectIds) {
      const researchSnapshot = await db.collection('research_sessions')
        .where('project_id', '==', projectId)
        .get();
      
      console.log(`🔬 Deleting ${researchSnapshot.docs.length} research sessions for project ${projectId}`);
      for (const doc of researchSnapshot.docs) {
        await doc.ref.delete();
      }
    }

    // 3. Delete all documents for these projects
    for (const projectId of projectIds) {
      const docsSnapshot = await db.collection('documents')
        .where('project_id', '==', projectId)
        .get();
      
      console.log(`📄 Deleting ${docsSnapshot.docs.length} documents for project ${projectId}`);
      for (const doc of docsSnapshot.docs) {
        await doc.ref.delete();
      }
    }

    // 4. Delete all reports for these projects
    for (const projectId of projectIds) {
      const reportsSnapshot = await db.collection('reports')
        .where('project_id', '==', projectId)
        .get();
      
      console.log(`📊 Deleting ${reportsSnapshot.docs.length} reports for project ${projectId}`);
      for (const doc of reportsSnapshot.docs) {
        await doc.ref.delete();
      }
    }

    // 5. Delete all projects
    for (const doc of projectsSnapshot.docs) {
      await doc.ref.delete();
    }
    console.log(`✅ Deleted all ${projectIds.length} projects`);

    // 6. Delete user from Firebase Auth using Admin SDK
    try {
      console.log('─────────────────────────────────────────────────────');
      console.log(`🔐 STEP 6: Deleting Firebase Auth account`);
      console.log(`🆔 Target UID: ${userId}`);
      console.log(`📧 Target Email: ${userEmail}`);
      
      // Verify user exists first
      console.log(`🔍 Checking if user exists before deletion...`);
      let userRecord;
      try {
        userRecord = await admin.auth().getUser(userId);
        console.log(`✅ User EXISTS before deletion:`);
        console.log(`   📧 Email: ${userRecord.email}`);
        console.log(`   🆔 UID: ${userRecord.uid}`);
        console.log(`   📅 Created: ${new Date(userRecord.metadata.creationTime).toISOString()}`);
        console.log(`   🔐 Providers: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);
      } catch (getError) {
        console.error(`❌ User NOT FOUND before deletion attempt!`);
        console.error(`   Error: ${getError.message}`);
        console.error(`   Code: ${getError.code}`);
        throw new Error(`User not found: ${getError.message}`);
      }
      
      // Delete the user
      console.log(`🗑️ Calling admin.auth().deleteUser(${userId})...`);
      await admin.auth().deleteUser(userId);
      console.log(`✅ deleteUser() call completed successfully`);
      
      // Verify deletion immediately
      console.log(`🔍 Verifying deletion by attempting getUser()...`);
      try {
        const verifyUser = await admin.auth().getUser(userId);
        console.error(`❌❌❌ CRITICAL: getUser() STILL SUCCEEDS AFTER DELETE!`);
        console.error(`   This means deletion FAILED or we're hitting wrong project!`);
        console.error(`   Retrieved UID: ${verifyUser.uid}`);
        console.error(`   Retrieved Email: ${verifyUser.email}`);
        throw new Error('User still exists after deletion - deletion failed!');
      } catch (verifyError) {
        if (verifyError.code === 'auth/user-not-found') {
          console.log(`✅✅✅ VERIFIED: User successfully deleted!`);
          console.log(`   getUser() correctly returns 'user-not-found'`);
        } else {
          console.error(`⚠️ Unexpected error during verification: ${verifyError.message}`);
          throw verifyError;
        }
      }
      
      console.log('─────────────────────────────────────────────────────');
    } catch (authError) {
      console.error('═══════════════════════════════════════════════════════');
      console.error(`❌ FAILED to delete Firebase Auth account`);
      console.error(`🆔 UID: ${userId}`);
      console.error(`📧 Email: ${userEmail}`);
      console.error(`❌ Error Code: ${authError.code}`);
      console.error(`❌ Error Message: ${authError.message}`);
      console.error(`❌ Full Error:`, authError);
      console.error('═══════════════════════════════════════════════════════');
      // Don't continue - throw error so frontend knows
      throw new Error(`Failed to delete Firebase Auth account: ${authError.message}`);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅✅✅ ACCOUNT DELETION COMPLETE ✅✅✅`);
    console.log(`📧 Email: ${userEmail}`);
    console.log(`🆔 UID: ${userId}`);
    console.log(`📁 Deleted Projects: ${projectIds.length}`);
    console.log('═══════════════════════════════════════════════════════');
    
    res.json({
      message: 'Account and all associated data deleted successfully',
      deletedProjects: projectIds.length,
      deletedUserId: userId,
      deletedUserEmail: userEmail,
    });

  } catch (error) {
    console.error('❌ Error deleting account:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      details: error.message,
    });
  }
});

module.exports = router;
