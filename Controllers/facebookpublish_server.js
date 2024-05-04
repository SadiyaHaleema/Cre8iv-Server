const MongoClient = require('mongodb').MongoClient;
// Require the necessary module
let graph = require('fbgraph');
const { getToken } = require('./fbloginserver');
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


const fetchfbpagetoken = async (req, res) => {
    try {
      const instaUsername = req.body.pageUsername;

      // Connect to MongoDB
      const client = await MongoClient.connect('mongodb+srv://cre8iv:cre8iv#2023@cluster0.uxwdbzv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  
      // Access the database
      const db = client.db('cre8iv'); 
  
      // Access the collection
      const collection = db.collection('pageinfos');
  
      // Find the document with the matching pageUsername
      const pageInfo = await collection.findOne({
        insta_username: instaUsername,
      });
  
      // If pageInfo is null, no document with the given pageUsername was found
      if (!pageInfo) {
        return res
          .status(404)
          .json({ success: false, message: 'Page info not found' });
      }
  
      // Retrieve the pageId from the found document
      facebookpageId = pageInfo.fbpageId;
      facebookpageName = pageInfo.fbpagename;
      console.log('facebook Page Id', facebookpageId);
      console.log('facebook Page Name', facebookpageName);

      console.log('INSIDE 2nd Api Graph Call:: ');
      let graph = require('fbgraph');
      const token = getToken(); // Get the token value
      const resp = await new Promise((resolve, reject) => {
         graph.get(
          `me/accounts?fields=name,id,access_token&access_token=${token}`,
          (err, responseData) => {
            if (err) {
              console.error('Error in Graph API call:', err);
              reject(err);
            } else {
              console.log('Graph Api retrieval of Facebook Id completed Successfully');
              resolve(responseData);
            }
          }
        );
      });
  
      console.log('After 2nd Api Graph Call:: ');
  
      // Handle the response from the second API call
      console.log('User Facebook pages Tokens:', resp);
  
      // Loop through the pages obtained from Facebook Graph API response
      for (const page of resp.data) {
        console.log('Inside Loop Page Id', page.id);
        // Match the facebookPageId with the page ID from the loop
        if (page.id == facebookpageId) {
          // Retrieve the page token for the matched page
          pageAccessToken = page.access_token;
          console.log('Page Access Token:', pageAccessToken);
        }
      }
  
      // Respond to the client based on whether user is logged in or not
      res.status(200).json({ success: true, data: resp.data, facebookpageName:facebookpageName });
    } catch {
      console.error('Error retrieving page info:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
  
  const fbpostpublish = async (req, res) => {
    try {

      console.log('Req:', req.body);
     
      caption = req.body.caption;
        
      console.log("Inside Facebook Post Publish ID",facebookpageId);
      console.log("Inside FacebookPostPublish PageAccessToeken",pageAccessToken);
          // Convert the human-readable time string to a Date object
       
       // Upload the image to Azure Blob Storage and get the public URL
      publicURL = await uploadImageToBlobStorage();
      console.log("Inside Facebook Publish Post Ftn Public URL ", publicURL);
      const resp = await new Promise((resolve, reject) => {
        const postData = {
          name: caption,
          url: publicURL,
          access_token: pageAccessToken,
        };
  
        graph.post(
          `${facebookpageId}/photos`,
          postData,
          (err, responseData) => {
            if (err) {
              console.error('Error in Graph API call:', err);
              reject(err);
            } else {
              console.log('Graph Api Fb Publish Post completed Successfully');
              resolve(responseData);
            }
          }
        );
      });
  
      // Respond to the client based on whether user is logged in or not
      res.status(200).json({ success: true, data: resp.data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  
  
    
  };

  module.exports = { fetchfbpagetoken,fbpostpublish };
