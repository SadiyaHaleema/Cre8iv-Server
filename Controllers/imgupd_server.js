
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');
const { pageinfo } = require('../models/pageInfo');
const MongoClient = require('mongodb').MongoClient;
// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const tryupload = async (req, res) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: 'File upload failed' });
      }


      // Access the file buffer
      const imageBuffer = req.file.buffer;
      console.log('Image Buffer', imageBuffer);


      const pageUsername = req.body.pageUsername;


      // Access pageUsername from form data


      // Save the image buffer to a file
      fs.writeFile('./images/image.png', imageBuffer, async (writeErr) => {
        if (writeErr) {
          console.error(writeErr);
          return res
            .status(500)
            .json({ success: false, message: 'Error saving image' });
        }


        try {
          // Process the data and send the response inside the writeFile callback
          await processData(pageUsername);
          const caption = await calldefpromptScript();
          console.log('Caption:', caption);


          res.status(200).json({
            success: true,
            message: 'Image Saved Successfully and Caption Generated',
            caption: caption, // Sending the caption back in the response
          });
        } catch (error) {
          console.error('Error during processing:', error);
          res
            .status(500)
            .json({ success: false, message: 'Error during processing' });
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


async function processData(pageUsername) {
  const message = './images/image.png';
  await callPythonScript(message, pageUsername);
  //await calldefpromptScript();
  // console.log("--------Caption---------",captionsaved);
  // return captionsaved;
}


async function callPythonScript(message, pageUsername) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(
      'python',
      ['./scripts/Final_image_analysis.py', message],
      {}
    );
    let scriptOutput = '';
    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
      //console.log(`Python Script Output: ${data}`);
    });


    // pythonProcess.stderr.on('data', (data) => {
    //   console.error(`Error from Python Script: ${data}`);
    //   reject(data);
    // });


    pythonProcess.on('close', async (code) => {
      console.log(`Python Script exited with code ${code}`);
      console.log('Scripted Output------------->', scriptOutput);
      // Parse script output (assuming it's in JSON format)
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(scriptOutput.trim());


        console.log('Parsed Output===============>', parsedOutput);
      } catch (error) {
        console.error('Error parsing script output:', error);
        reject(error);
        return;
      }


      // Access obj_string and text_string separately
      const objString = parsedOutput.obj_list || '';
      const textString = parsedOutput.text_list || '';
      console.log('------>ObjString--------', objString);
      console.log('------>TextString--------', textString);


      // Use objString and textString as needed in your code
      const client = await MongoClient.connect('mongodb://localhost:27017', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      const db = client.db('cre8iv');


      const collection = db.collection('pageinfos');
      // collection.updateMany(
      //   {
      //     // $or: [
      //     //   { imgText: { $exists: false } },
      //     //   { imgObj: { $exists: false } }
      //     // ]
      //   },
      //   {
      //     $push: {
      //       imgText: { $each: textString.split(',') },
      //       imgObj: { $each: objString.split(',') }
      //     }
      //   }
      // )
      collection
        .updateMany(
          { insta_username: pageUsername },
          {
            $set: {
              imgText: textString.split(','),
              imgObj: objString.split(','),
            },
          }
        )


        .then(() => {
          console.log('Documents updated successfully');
          resolve();
        })
        .catch((error) => {
          console.error('Error updating documents:', error);
        });
    });
  });
}


async function calldefpromptScript() {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['./openaikey/defprompt.py'], {});
    let caption = '';
    pythonProcess.stdout.on('data', (data) => {
      caption += data.toString(); // Concatenate received data to the caption string
      console.log(`Generated Caption: ${data}`);
      resolve(caption);
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


module.exports = tryupload;



