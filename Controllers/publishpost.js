const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const { getToken } = require('./fbloginserver');
// const {getpublicURL} = require('./imgupd_server');
let pageId = '';
let creationID = '';
let publicURL = '';

// Generate public URL for the saved image

const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const connectionString = 'DefaultEndpointsProtocol=https;AccountName=cre8ivimages;AccountKey=AaAE6uRME7B5KXL2FSxjCUTL9m2dMSKOwvcoEa/vyHuZc8cmGSGOxc35zJkfY9c++uRFMdIE3hcK+AStnMp+qg==;EndpointSuffix=core.windows.net';
const containerName = 'cre8ivimages'; // Specify the name of your container
const imagePath = './images/image.jpeg'; // Path to your local image

async function uploadImageToBlobStorage() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = 'image.jpeg'; // Specify the name you want for the image in Azure Blob Storage

    // Upload the image file to the blob container
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const imageData = fs.readFileSync(imagePath);
    await blobClient.upload(imageData, imageData.length);

    console.log('Image uploaded to Azure Blob Storage');

    const public_URL = `${containerClient.url}/${blobName}`;
    console.log('Public URL:', public_URL); // Output the public URL to console

    return public_URL;
}

const uploadpost = async (req, res) => {
  const pageUsername = req.body.pageUsername;
  //const imageBuffer = req.file.buffer;
  const caption = req.body.caption;
  // Upload the image to Azure Blob Storage and get the public URL
  try {
    // Upload the image to Azure Blob Storage and get the public URL
    publicURL = await uploadImageToBlobStorage();

    console.log('Req.body:', req.body);
    console.log('Page Username:', pageUsername);
    console.log('Caption:', caption);
    const token = getToken(); // Get the token value
    console.log('Token:', token); // Access the token value

    // Continue with your remaining logic...

   
   
  } 
  catch (error) {
    console.error('Error uploading image to Azure Blob Storage:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
}
  
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect('mongodb://localhost:27017', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Access the database
    const db = client.db('cre8iv'); // Replace 'your_database_name' with your actual database name

    // Access the collection
    const collection = db.collection('pageinfos');

    // Find the document with the matching pageUsername
    const pageInfo = await collection.findOne({ insta_username: pageUsername });

    // If pageInfo is null, no document with the given pageUsername was found
    if (!pageInfo) {
      return res
        .status(404)
        .json({ success: false, message: 'Page info not found' });
    }

    // Retrieve the pageId from the found document
    pageId = pageInfo.pageId;
    console.log('InstauserId', pageId);
     console.log("Azure Returned Public Url",publicURL);
    //Make the first API call to get user details
    const token = getToken(); // Get the token value
    console.log('--------Before Graph Call ----------Token-----------:', token);

    const postData = {
      image_url:publicURL,
      caption: caption,
      access_token: token,
    };

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/media`,
      postData
    );

    creationID = response.data.id;
    console.log('Creation Id inside 1st Call', creationID);
    console.log('Response:', response.data);

    // Respond to the client with success message or any other data as needed
    res.status(200).json({ success: true, creationID: creationID,publicURL:publicURL });

   
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

  // Add unhandledRejection event listener here
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Handle or log the unhandled rejection as needed
  });
  // Require the necessary module
};

const publishpost = async (req, res) => {
  console.log('Inside PublishPost');
  try {
    console.log('InstauserId', pageId);

    const token = getToken(); // Get the token value
    console.log('Token:', token); // Access the token value
    console.log('Creation Id Inside Publish Post 2nd Call', creationID);

    const postData = {
      creation_id: creationID,
      access_token: token,
    };

    axios
      .post(
        `https://graph.facebook.com/v18.0/${pageId}/media_publish`,
        postData
      )
      .then((response) => {
        console.log('Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error.response.data);
      });



    console.log('PublishInstaPost function ran successfully');
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { publishpost, uploadpost };




//Graph Calls 
 //   `/${pageId}/media?image_url=${imageurl}&caption=${caption}&access_token=${token}`,

    //   async (err, userResp) => {
    //     if (err) {
    //       const token = getToken(); // Get the token value

    //       isLoggedIn = false; // Set the flag to false if there's an error
    //       return;
    //     }

    //     // Handle the response from the first API call
    //     console.log('User details:', userResp);
    //     creationID= userResp.data[0].id;
    //     console.log("----------------------")
    //     console.log(creationID);
    //      // Respond with the retrieved pageId
    //     res.status(200).json({ success: true, pageId: pageId });
    //     // Now make the second API call to get user's Facebook pages

    //   }
    // );



        // graph.post(
    //   `/${pageId}/media_publish?creation_id=${creationID}&access_token=${token}`,
    //   async (err, resp) => {
    //     if (err) {

    //                   console.error('Error:', err);

    //       isLoggedIn = false; // Set the flag to false if there's an error
    //       return;
    //     }

    //     // Send a success response if graph.post() completes successfully
    //     res.status(200).json({
    //       success: true,
    //       message: 'Post published successfully',
    //       responseData: resp, // You can send additional data if needed
    //     });
    //   }
    // );