const MongoClient = require('mongodb').MongoClient;
// Require the necessary module
let graph = require('fbgraph');
const { getToken } = require('./fbloginserver');

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
    const facebookpageId = pageInfo.fbpageId;
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
        const pageAccessToken = page.access_token;
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }

  //   try {
  //     // Connect to MongoDB
  //     const client = await MongoClient.connect('mongodb://localhost:27017', {
  //       useNewUrlParser: true,
  //       useUnifiedTopology: true,
  //     });

  //     // Access the database
  //     const db = client.db('cre8iv'); // Replace 'your_database_name' with your actual database name

  //     // Access the collection
  //     const collection = db.collection('pageinfos');

  //     // Find the document with the matching pageUsername
  //     const pageInfo = await collection.findOne({ insta_username: pageUsername });

  //     // If pageInfo is null, no document with the given pageUsername was found
  //     if (!pageInfo) {
  //       return res
  //         .status(404)
  //         .json({ success: false, message: 'Page info not found' });
  //     }

  //     // Retrieve the pageId from the found document
  //     fbpgId = pageInfo.fbpageId;
  //     console.log('Facebook Page Id',fbpgId );
  //     const postData = {
  //       image_url:publicURL,
  //       caption: caption,
  //       access_token: token,
  //     };

  //     const response = await axios.post(
  //       `https://graph.facebook.com/v18.0/${pageId}/media`,
  //       postData
  //     );

  //     creationID = response.data.id;
  //     console.log('Creation Id inside 1st Call', creationID);
  //     console.log('Response:', response.data);

  //     // Respond to the client with success message or any other data as needed
  //     res.status(200).json({ success: true, creationID: creationID,publicURL:publicURL });

  //   }
  //   catch (error) {
  //     console.error('Error retrieving page info:', error);
  //     res.status(500).json({ success: false, message: 'Internal server error' });
  //   }
};

module.exports = { scheduling, fetchfbpgtoken };
