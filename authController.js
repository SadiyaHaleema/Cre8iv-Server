// authController.js
const Project = require('../models/projectsModel'); // Adjust the path based on your project structure

const loginUser = async (username, password) => {
  try {
    const user = await Project.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    if (password === user.password) {
      return { success: true, message: 'Login successful' };
    } else {
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    throw new Error('Error during login');
  }
};

module.exports = {
  loginUser,
};
