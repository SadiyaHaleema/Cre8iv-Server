const MongoClient = require('mongodb').MongoClient;
const { getToken } = require('./fbloginserver');
let graph = require('fbgraph');
let pageId = '';
let creationID = '';
let publicURL = '';

// Generate public URL for the saved image

const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

const connectionString =
  'DefaultEndpointsProtocol=https;AccountName=cre8ivimages;AccountKey=AaAE6uRME7B5KXL2FSxjCUTL9m2dMSKOwvcoEa/vyHuZc8cmGSGOxc35zJkfY9c++uRFMdIE3hcK+AStnMp+qg==;EndpointSuffix=core.windows.net';
const containerName = 'cre8ivimages'; // Specify the name of your container
const imagePath = './images/image.jpeg'; // Path to your local image

async function uploadImageToBlobStorage() {
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
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
  } catch (error) {
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
    console.log('Azure Returned Public Url', publicURL);
    //Make the first API call to get user details
    const token = getToken(); // Get the token value
    console.log('--------Before Graph Call ----------Token-----------:', token);

    
    const resp = await new Promise((resolve, reject) => {
      const postData = {
        image_url: publicURL,
        caption: caption,
        access_token: token,
      };  
      graph.post(
         `${pageId}/media`,
         postData,
         (err, responseData) => {
           if (err) {
             console.error('Error in Graph API call:', err);
             reject(err);
           } else {
             console.log('Graph Api Media Container Id Received Successfully');
             resolve(responseData);
           }
         }
       );
     });
   
    creationID = resp.id;
   
    console.log('Creation Id inside 1st Call', creationID);
    console.log('Response:', resp);

    // Respond to the client with success message or any other data as needed
    res
      .status(200)
      .json({ success: true, creationID: creationID, publicURL: publicURL });
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

 
};

const publishpost = async (req, res) => {
  console.log('Inside PublishPost');
  try {
    console.log('InstauserId', pageId);

    const token = getToken(); // Get the token value
    console.log('Token:', token); // Access the token value
    console.log('Creation Id Inside Publish Post 2nd Call', creationID);

    const respublish = await new Promise((resolve, reject) => {
      
    const postData = {
      creation_id: creationID,
      access_token: token,
    };
      graph.post(
       `${pageId}/media_publish`,
       postData,
       (err, responseData) => {
         if (err) {
           console.error('Error in Graph API call:', err);
           reject(err);
         } else {
           console.log('Graph Api completed Successfully');
           resolve(responseData);
          // Reset publicURL to null after successful publishing
            publicURL = '';     
            }
       }
     );
   });
   res.status(200).json({ success: true, data: respublish.data });
    console.log('PublishInstaPost function ran successfully',respublish);
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getPublicUrl = () => publicURL;

module.exports = { publishpost, uploadpost, getPublicUrl };

