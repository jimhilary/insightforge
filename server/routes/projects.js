const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { db, admin } = require('../lib/firebaseAdmin');

// All routes require authentication
router.use(verifyToken);

// Get all projects for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.where('user_id', '==', userId).get();
    
    const projects = [];
    snapshot.forEach(doc => {
      projects.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const projectId = req.params.id;
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectData = projectDoc.data();
    
    // Verify user owns this project
    if (projectData.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ success: true, project: { id: projectDoc.id, ...projectData } });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const projectData = {
      user_id: userId,
      title,
      description: description || '',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('projects').add(projectData);
    
    res.status(201).json({ 
      success: true, 
      project: { id: docRef.id, ...projectData } 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const projectId = req.params.id;
    const { title, description } = req.body;
    
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (projectDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updateData = {
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    
    await projectRef.update(updateData);
    
    res.json({ success: true, message: 'Project updated' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.uid;
    const projectId = req.params.id;
    
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (projectDoc.data().user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await projectRef.delete();
    
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;

