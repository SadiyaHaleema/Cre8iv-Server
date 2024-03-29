const { spawn } = require('child_process');

let image_result = '';
//receiving image message from client
app.post('/send-message', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No file path provided' });
  }

  // Log the received message
  console.log('Received message:', message);

  // Send a response back to the client
  res.json({ received: true, message: `Server received: ${message}` });

  // Call the Python script with the file path
  const pythonProcess = spawn('python3', ['test.py', message], {});
  console.log('spawn-hello');
  //console.log(pythonProcess);

  // Collect the output from the Python script

  let output = '';
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
    //console.log(output);
  });

  // Handle the end of the Python script execution
  pythonProcess.on('close', (code) => {
    console.log('Python script execution finished');
    console.log('Final output:', output);
  });

  image_result = output;

  //Handle the end of the Python script execution
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      //Successful execution
      const results = JSON.parse(output);
      console.log(results);
      res.json({ results });
    } else {
      //Error during execution
      res.status(500).json({ error: 'Error during image analysis' });
    }
  });
});

console.log('Image Result: ', image_result);

//receiving prompt category from client
app.post('send-category', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No file path provided' });
  }

  // Log the received message
  console.log('Received message:', message);

  // Send a response back to the client
  res.json({ received: true, message: `Server received: ${message}` });

  // Call the Python script with the file path
  const pythonProcess = spawn('python3', ['promt_Engineering', message], {
    // Additional options if needed
  });
  console.log('spawn-hello');
  console.log(pythonProcess);
  // Collect the output from the Python script

  let output = '';
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
    //console.log(output);
  });

  // Handle the end of the Python script execution
  pythonProcess.on('close', (code) => {
    console.log('Python script execution finished');
    console.log('Final output:', output);
  });

  // Handle the end of the Python script execution
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      // Successful execution
      const results = JSON.parse(output);
      console.log(results);
      //res.json({ results });
    } else {
      // Error during execution
      res.status(500).json({ error: 'Error during image analysis' });
    }
  });
});
