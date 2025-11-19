const express = require('express');
const { register, login, authGoogle } = require('../controllers/authController.js');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', authGoogle);


module.exports = router;
