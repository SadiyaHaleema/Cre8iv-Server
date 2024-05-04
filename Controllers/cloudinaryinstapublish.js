const MongoClient = require('mongodb').MongoClient;
const { getToken } = require('./fbloginserver');
let graph = require('fbgraph');
let pageId = '';
let creationID = '';
let publicURL = '';

// Generate public URL for the saved image

const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: 'dyt0gdlvt',
  api_key: '379622244345538',
  api_secret: 'L23_2Gcj7Ujk1FmwWJdjvfreEJ8',
});

async function uploadImageToCloudinary() {
  try {
    const imagePath = './images/image.jpeg'; // Path to your local image
    // const imageBuffer = fs.readFileSync(imagePath); // Read the image file as a buffer
    const result = await cloudinary.uploader.upload(imagePath, {
      // Upload the image buffer to Cloudinary
      resource_type: 'auto', // Automatically detect the resource type (image/video/raw)
    });

    const public_URL = result.secure_url;
    console.log('Public URL:', public_URL); // Output the public URL to console

    return public_URL;
  } catch (error) {
    console.error(error);
  }
}

const fetchinstafbpagetoken = async (req, res) => {
  try {
    const instaUsername = req.body.pageUsername;

    // Connect to MongoDB
    const client = await MongoClient.connect('mongodb+srv://cre8iv:cre8iv#2023@cluster0.uxwdbzv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Access the database
    const db = client.db('cre8iv'); // Replace 'your_database_name' with your actual database name

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

    let graph = require('fbgraph');
    const token = getToken(); // Get the token value
    console.log('InstafBPublishFIleToken', token);
    const resp = await new Promise((resolve, reject) => {
      graph.get(
        `me/accounts?fields=name,id,access_token&access_token=${token}`,
        (err, responseData) => {
          if (err) {
            console.error('Error in Graph API call:', err);
            reject(err);
          } else {
            console.log(
              'Graph Api retrieval of Facebook Id completed Successfully'
            );
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
    res.status(200).json({
      success: true,
      data: resp.data,
      facebookpageName: facebookpageName,
    });
  } catch {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const uploadpost = async (req, res) => {
  const pageUsername = req.body.pageUsername;
  const caption = req.body.caption;
  // Upload the image to Azure Blob Storage and get the public URL
  try {
    // Upload the image to Azure Blob Storage and get the public URL
    publicURL = await uploadImageToCloudinary();
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
    const client = await MongoClient.connect('mongodb+srv://cre8iv:cre8iv#2023@cluster0.uxwdbzv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
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
        access_token: pageAccessToken,
      };
      graph.post(`${pageId}/media`, postData, (err, responseData) => {
        if (err) {
          console.error('Error in Graph API call:', err);
          reject(err);
        } else {
          console.log('Graph Api Media Container Id Received Successfully');
          resolve(responseData);
        }
      });
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
    // console.log('Token:', token); // Access the token value
    console.log('Creation Id Inside Publish Post 2nd Call', creationID);

    const respublish = await new Promise((resolve, reject) => {
      const postData = {
        creation_id: creationID,
        access_token: token,
      };
      graph.post(`${pageId}/media_publish`, postData, (err, responseData) => {
        if (err) {
          console.error('Error in Graph API call:', err);
          reject(err);
        } else {
          console.log('Graph Api completed Successfully');
          resolve(responseData);
          // Reset publicURL to null after successful publishing
          publicURL = '';
        }
      });
    });
    res.status(200).json({ success: true, data: respublish.data });
    console.log('PublishInstaPost function ran successfully', respublish);
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getPublicUrl = () => publicURL;

module.exports = {
  publishpost,
  uploadpost,
  getPublicUrl,
  fetchinstafbpagetoken,
};
