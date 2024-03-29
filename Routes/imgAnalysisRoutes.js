// imageRoutes.js
const express = require('express');
const imageController = require('../Controllers/imgAnalysisController');

const router = express.Router();

router.post('/send-message', async (req, res) => {
  const { message } = req.body;

  try {
    const result = await imageController.processImage(message);
    res.json({ received: true, message: `Server received: ${message}`, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
