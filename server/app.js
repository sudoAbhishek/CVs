const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require("path");
const authRoutes = require('./routes/authRoutes.js');
const resumeRoutes = require("./routes/resumeRoutes.js")
const paymentRoute = require('./routes/payment.js');
const { authenticateJWT } = require('./middleware/auth.js');
const { getSharedResume } = require('./controllers/resumeController.js');


const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
    });
});
// Serve uploaded files publicly (for shared CVs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.get('/api/resume/shared/:shareToken', getSharedResume);
app.use('/api/resume', authenticateJWT, resumeRoutes);
app.use('/api/payment', authenticateJWT, paymentRoute);


//  404 handler
app.use((req, res) => {
    res.status(404).json({
        status: "fail",
        message: `Route ${req.originalUrl} not found`,
    });
});

// Global Error Handler (basic)
app.use((err, req, res, next) => {
    console.error('ERROR 💥', err);

    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
    });
});

module.exports = app;