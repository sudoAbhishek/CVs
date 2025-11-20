const express = require('express')
const { createOrder, verifyPayment } = require('../controllers/paymentController.js');
const { authenticateJWT } = require('../middleware/auth.js');

const router = express.Router();

router.post("/order", authenticateJWT, createOrder);
router.post("/verify", authenticateJWT, verifyPayment);

module.exports = router
