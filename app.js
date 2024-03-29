const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

//console.log('IN APP>JS');
const app = express();
const middlewares = require('./middlewares');
const corsOptions = {
  origin: 'https://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200,
};
// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/cre8iv', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
   // Start the server once the database connection is established
   
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});

/* app.use('/', (req, res) => {
    res.send('Welcome to Shadiyana');
  }); */

const index = require('./Routes/index');
app.use(express.json()); // Enable JSON parsing
app.use(cors(corsOptions));

//app.use(express.json({ extended: false, limit: '50mb' }));
//app.use(express.urlencoded({ limit: '50mb', extended: false, parameterLimit: 50000 }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(index);
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);
module.exports = index;
module.exports = app;
