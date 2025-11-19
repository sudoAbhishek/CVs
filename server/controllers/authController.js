const jwt = require('jsonwebtoken');
const User = require('../models/User.model..js');
const { OAuth2Client } = require('google-auth-library');

const jwtSecret = process.env.JWT_SECRET;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// ==================== REGISTER ====================
exports.register = async (req, res) => {
  try {
    const { username, email, contactNumber, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email and password are required' });
    }

    // if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      contactNumber,
      password
    });

    return res
      .status(201)
      .json({ message: 'User registered successfully', userId: user._id });

  } catch (err) {
    console.error('Register Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


// ==================== LOGIN ====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email/username and password are required' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: '7h'
    });

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        contactNumber: user.contactNumber,
      },
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// ==================== Auth Google ====================
exports.authGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload; // sub = Google unique user ID

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new google user (NO PASSWORD)
      user = await User.create({
        username: name,
        email: email,
        picture: picture,
        googleId: sub,
        password: null,
        contactNumber: null,
      });
    }

    // Generate our own JWT
    const appToken = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: "7h" }
    );

    return res.status(200).json({
      token: appToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture,
        contactNumber: user.contactNumber,
      },
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    return res.status(401).json({ message: "Invalid Google token" });
  }
};