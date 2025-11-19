
const dotenv = require('dotenv').config();

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');
const connectDB = require('./config/db.js');

const PORT = process.env.PORT || 5000;



// Start Server Function
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.log(`✔ Server running on port ${PORT}...`);
        });

        // Handle Unhandled Promise Rejections
        process.on('unhandledRejection', (err) => {
            console.log('UNHANDLED REJECTION! 💥 Shutting down...');
            console.log(err.name, err.message);
            server.close(() => process.exit(1));
        });

    } catch (err) {
        console.error('Server startup failed:', err);
        process.exit(1);
    }
};

startServer();
