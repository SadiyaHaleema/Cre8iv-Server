const fs = require('fs');
const { spawn } = require('child_process');

const chatbot = async (req, res) => {
  try {
    const message = req.body.message;
    console.log('Message:', message);

    const response = await callchatbot_prompt(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

async function callchatbot_prompt(message) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(
      'python',
      ['./openaikey/chatbot_prompt.py', message],
      {}
    );
    let ideas = '';
    pythonProcess.stdout.on('data', (data) => {
      ideas += data.toString(); // Concatenate received data to the ideas string
      console.log(`Generated Ideas: ${data}`);
      resolve(ideas);
      //return data;
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python Script: ${data}`);
      reject(data);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python Script exited with code ${code}`);

      // Parse script output (assuming it's in JSON format)
    });
  });
}

module.exports = chatbot;
