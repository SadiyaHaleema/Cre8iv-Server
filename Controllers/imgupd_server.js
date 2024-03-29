const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');
const {pageinfo}= require('../models/pageInfo');
const MongoClient = require('mongodb').MongoClient;
// Set up Multer for handling file uploads
let captionsaved;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const tryupload = async (req, res) => {
  try {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ success: false, message: 'File upload failed' });
      }

      // Access the file buffer
      const imageBuffer = req.file.buffer;
      console.log('Image Buffer', imageBuffer);

      // Save the image buffer to a file
      fs.writeFile('./images/image.png', imageBuffer, (writeErr) => {
        if (writeErr) {
          console.error(writeErr);
          return res
            .status(500)
            .json({ success: false, message: 'Error saving image' });
        }

        // Process the data and send the response inside the writeFile callback
        processData()
          .then(() => {
            
            console.log('Processing completed.');
            res.status(200).json({
              success: true,
              message: "Image Saved Successfully and Caption Generated",
            });
          })
          .catch((error) => {
            console.error('Error during processing:', error);
            res
              .status(500)
              .json({ success: false, message: 'Error during processing' });
          });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

async function processData() {
  const message = './images/image.png';
  await callPythonScript(message);
  await calldefpromptScript();
  // console.log("--------Caption---------",captionsaved);
  // return captionsaved;
}

async function callPythonScript(message) {
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

    pythonProcess.on('close',async (code) => {
      console.log(`Python Script exited with code ${code}`);
      console.log("Scripted Output------------->",scriptOutput);
    // Parse script output (assuming it's in JSON format)
      let parsedOutput;
      try {
        parsedOutput = JSON.parse(scriptOutput.trim());
       
        console.log("Parsed Output===============>",parsedOutput)
      } catch (error) {
        console.error('Error parsing script output:', error);
        reject(error);
        return;
      }

      // Access obj_string and text_string separately
      const objString = parsedOutput.obj_list || '';
      const textString = parsedOutput.text_list || '';
      console.log("------>ObjString--------",objString)
      console.log("------>TextString--------",textString)

      // Use objString and textString as needed in your code
      const client =await MongoClient.connect('mongodb://localhost:27017', {
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
        collection.updateMany(
          {},
          {
            $set: {
              imgText: textString.split(','),
              imgObj: objString.split(',')
            }
          }
        )
    
      .then(() => {
        console.log('Documents updated successfully');
        resolve();
      })
      .catch((error) => {
        console.error('Error updating documents:', error);
      })
          });
  });
}

async function calldefpromptScript() {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(
      'python',
      ['./openaikey/defprompt.py'],
      {}
    );
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Generated Caption: ${data}`);
      resolve(data);
      return data;
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python Script: ${data}`);
      reject(data);
    });

    pythonProcess.on('close',(code) => {
      console.log(`Python Script exited with code ${code}`);
    // Parse script output (assuming it's in JSON format)
     
          });
  });
}




















// const message = 'image.png';
//       // Call the Python script with the file path
//       const pythonProcess = spawn('python3', ['test.py', message], {});
//       console.log('spawn-hello');

//       // Collect the output from the Python script
//       let output = '';
//       pythonProcess.stdout.on('data', (data) => {
//         output += data.toString();
//         console.log('Output', output);
//       });

//       image_result = output;

//       //Handle the end of the Python script execution
//       pythonProcess.on('close', (code) => {
//         if (code === 0) {
//           //Successful execution
//           const results = JSON.parse(output);
//           console.log(results);
//           //res.json({ results });
//         } else {
//           //Error during execution
//           //res.status(500).json({ error: 'Error during image analysis' });
//         }
//       });

module.exports = tryupload;