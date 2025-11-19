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

const router = express.Router();


router
    .route('/')
    .get(getAllResumes)   // GET all resumes
    .post(upload.single("image"), createResume);  // Create a resume
router
    .route('/:id')
    .get(getResumeById)     // Get resume by ID
    .put(upload.single("image"), updateResume)  // Update + image
    .delete(deleteResume);  // Delete resume

router.get('/:id/download', downloadResumePDF);

module.exports = router;
