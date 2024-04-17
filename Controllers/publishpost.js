const MongoClient = require('mongodb').MongoClient;
const {getToken} = require ('./fbloginserver');
// const {getpublicURL} = require('./imgupd_server');
let pageId = '';
let creationID= '';


//--------------Initial Original Code One --------------------------


const uploadpost = async (req, res) => {
  const pageUsername = req.body.pageUsername;
  //const imageBuffer = req.file.buffer;
  const caption = req.body.caption;

  console.log('Req.body:', req.body);
  console.log('Page Username:', pageUsername);
  //console.log('Image Buffer:', imageBuffer);
  console.log('Caption:', caption);
  const token = getToken(); // Get the token value
  console.log('Token:', token); // Access the token value
  // const publicurl = getpublicURL();
  // console.log('PUBLIC URL:',publicurl);
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
   

    let graph = require('fbgraph');
    //Make the first API call to get user details
    graph.post(
      `${pageId}/media?image_url=https://localhost:3001/images/image.png
      &caption=caption&access_token=${token}`,
      async (err, userResp) => {
        if (err) {
          console.error('Error:', err);
          isLoggedIn = false; // Set the flag to false if there's an error
          return;
        }

        // Handle the response from the first API call
        console.log('User details:', userResp);
        creationID= userResp.data[0].id;
        console.log("----------------------")
        console.log(creationID);
         // Respond with the retrieved pageId
        res.status(200).json({ success: true, pageId: pageId });
        // Now make the second API call to get user's Facebook pages
       
      }
    );

  
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
  // Require the necessary module
};


const publishpost = async (req, res) => {
  const token = getToken(); // Get the token value
  console.log('Token:', token); // Access the token value

  try {
    console.log('InstauserId', pageId);

    let graph = require('fbgraph');

    graph.post(
      `${pageId}/media_publish?creation_id=${creationID}&access_token=${token}`,
      async (err, resp) => {
        if (err) {
          console.error('Error:', err);
          
          isLoggedIn = false; // Set the flag to false if there's an error
          return;
        }

        // Send a success response if graph.post() completes successfully
        res.status(200).json({
          success: true,
          message: 'Post published successfully',
          responseData: resp, // You can send additional data if needed
        });
      }
    );

    console.log("PublishInstaPost function ran successfully");
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {publishpost,uploadpost};
