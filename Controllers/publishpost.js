const MongoClient = require('mongodb').MongoClient;
const {getToken} = require ('./fbloginserver');
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
    const pageId = pageInfo.pageId;
    console.log('InstauserId', pageId);
    // Respond with the retrieved pageId
    res.status(200).json({ success: true, pageId: pageId });

    //let graph = require('fbgraph');
    // Make the first API call to get user details
    // graph.get(
    //   `${pageId}/media?image_url=https://www.example.com/images/bronz-fonz.jpg
    //   &caption=caption&access_token=${token}`,
    //   async (err, userResp) => {
    //     if (err) {
    //       res.status(404).json({
    //         message: err.message || 'Error in getting user details.',
    //       });
    //       isLoggedIn = false; // Set the flag to false if there's an error
    //       return;
    //     }

    //     // Handle the response from the first API call
    //     console.log('User details:', userResp);
    //     creationID= userResp.id;

    //     // Now make the second API call to get user's Facebook pages
    //     graph.get(
    //       `${pageId}/media_publish?creation_id=creationID&access_token=${token}`,
    //       async (err, resp) => {
    //         if (err) {
    //           res.status(404).json({
    //             message: err.message || 'Error in getting user facebook pages.',
    //           });
    //           isLoggedIn = false; // Set the flag to false if there's an error
    //           return;
    //         }
    //       }
    //     );
    //   }
    // );
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
  // Require the necessary module
};

module.exports = uploadpost;
