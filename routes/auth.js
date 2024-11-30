const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authenticate = require('../middleware/auth');


// Password strength check using regex (you can customize this)
const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();
passwordSchema
  .is().min(8)                                 // Minimum length 8
  .has().uppercase()                           // Must have uppercase letter
  .has().lowercase()                           // Must have lowercase letter
  .has().digits()                              // Must have digits
  .has().not().spaces();                       // Should not have spaces

// Signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields (username, email, and password) are required' });
  }

  // Validate password strength
  if (!passwordSchema.validate(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long, include uppercase, lowercase, and digits, and cannot have spaces.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email is already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, passwordHash: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/save', authenticate, async (req, res) => {
    const { listName, responseCodes, images } = req.body;
  
    // Ensure userId is passed and validated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
  
    try {
      const newList = new List({
        name: listName,
        createdBy: req.user.id, // Use the authenticated user's ID
        createdDate: new Date(),
        responseCodes,
        images,
      });
  
      await newList.save();
      res.status(201).json({ message: 'List saved successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
module.exports = router;
