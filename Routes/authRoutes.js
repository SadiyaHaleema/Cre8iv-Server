// authRoutes.js
const express = require('express');
const authController = require('../Controllers/authController'); // Adjust the path based on your project structure

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await authController.loginUser(username, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
