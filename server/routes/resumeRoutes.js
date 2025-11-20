const express = require('express');
const {
    createResume,
    getAllResumes,
    getResumeById,
    updateResume,
    deleteResume,
    downloadResumePDF,
    getSharedResume
} = require('../controllers/resumeController.js');
const upload = require('../middleware/upload.js');
const { authenticateJWT } = require('../middleware/auth.js');

const router = express.Router();


router
.route('/')
.get(authenticateJWT, getAllResumes)   // GET all resumes
.post(authenticateJWT, upload.single("image"), createResume);  // Create a resume
router
.route('/:id')
.get(authenticateJWT, getResumeById)     // Get resume by ID
.put(authenticateJWT, upload.single("image"), updateResume)  // Update + image
.delete(authenticateJWT, deleteResume);  // Delete resume

router.get('/:id/download', authenticateJWT, downloadResumePDF); // Download resume as PDF
router.get('/shared/:shareToken', getSharedResume);  // Public route to get shared resume


module.exports = router;
