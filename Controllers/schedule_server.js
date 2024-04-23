const MongoClient = require('mongodb').MongoClient;
// Require the necessary module
let graph = require('fbgraph');
const { getToken } = require('./fbloginserver');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
let unixdatetime,facebookpageId,pageAccessToken,publicURL = '';

// Generate public URL for the saved image

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
const fetchfbpgtoken = async (req, res) => {
  try {
    const instaUsername = req.body.pageUsername;
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
    console.log('facebook Page Id', facebookpageId);

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
            console.log('Graph Api completed Successfully');
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
    res.status(200).json({ success: true, data: resp.data });
  } catch {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const scheduling = async (req, res) => {
  try {
    console.log('Req.body:', req.body);
    unixdatetime = req.body.UnixDateTime;
    caption = req.body.caption;
    console.log("UnixDateTime ISO",unixdatetime);
    console.log("hello");
    
    console.log("Inside Scheduling Public URL ", publicURL);
    console.log("Inside Scheduling Facebook ID",facebookpageId);
    console.log("Inside Scheduling PageAccessToeken",pageAccessToken);
        // Convert the human-readable time string to a Date object
    var datetimeObject = new Date(unixdatetime);

    // Convert the Date object to epoch time (Unix timestamp)
    var epochTime = Math.floor(datetimeObject.getTime() / 1000);

    console.log("UTC TIME in Epoch INT",epochTime);
 // Upload the image to Azure Blob Storage and get the public URL
    publicURL = await uploadImageToBlobStorage();
    const resp = await new Promise((resolve, reject) => {
      const postData = {
        caption: caption,
        published:false,
        scheduled_publish_time:epochTime,
        url: publicURL,
        access_token: pageAccessToken,
      };

      //?caption=${caption}&published=false&scheduled_publish_time=${epochTime}&url=${publicURL}&access_token=${pageAccessToken}
      graph.post(
        `${facebookpageId}/photos`,
        postData,
        (err, responseData) => {
          if (err) {
            console.error('Error in Graph API call:', err);
            reject(err);
          } else {
            console.log('Graph Api completed Successfully');
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

  
    //if this doesnt work
    //caption, published, scheduled_publish_time(1713691754),url
    //epoch time conversion

    //then do this
    // curl -X POST "https://graph.facebook.com/v19.0/page_id/feed" \
    //  -H "Content-Type: application/json" \
    //  -d '{
    //        "message":"your_message_text",
    //        "link":"your_url",
    //        "published":"false",
    //        "scheduled_publish_time":"unix_time_stamp_of_a_future_date",
    //      }'

   
    //graph.post(${facebookpageId}/photos?caption=${caption}&published=false&scheduled_publish_time=${epochdatetime}&link=${publicURL}&access_token=${pageAccessToken})
  
};

module.exports = { scheduling, fetchfbpgtoken };
