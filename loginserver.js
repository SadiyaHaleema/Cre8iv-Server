const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/cre8iv', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const projectSchema = new mongoose.Schema({
  username: String,
  password: String,
});


const Project = mongoose.model('projects', projectSchema);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/login', async (req, res) => {
  console.log('Inside login');

  try {
    const { username, password } = req.body;
    console.log('Username from request:', username);
    const user = await Project.findOne({ username });

    console.log('User from database:', user);
    if (!user) {
      // User not found
      res.status(401).json({ success: false, message: 'User not found' });
    } else {
      //const passwordMatch = await bcrypt.compare(password, user.password);

      if (password === user.password) {
        // Successful login
        res.status(200).json({ success: true, message: 'Login successful' });
      } else {
        // Incorrect password
        res
          .status(401)
          .json({ success: false, message: 'Invalid username or password' });
      }
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
