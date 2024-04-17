const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const {getToken} = require ('./fbloginserver');
// const {getpublicURL} = require('./imgupd_server');
let pageId = '';
let creationID= '';


//--------------Initial Original Code One --------------------------
const imagePath = './images/image.jpeg'; // Assuming the image is saved with this path
    // Generate public URL for the saved image
const publicURL = `https://localhost:3001/${imagePath}`;

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
    imageurl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png";
    //let graph = require('fbgraph');
    //Make the first API call to get user details
    const token = getToken(); // Get the token value
  console.log('--------Before Graph Call ----------Token-----------:', token); 




const postData = {
  image_url: 'https://i.pinimg.com/originals/94/6f/d2/946fd20c35c6a575fdbc8a836627abd9.jpg',
  caption: 'Sampleposting',
  access_token: token
};

axios.post(`https://graph.facebook.com/v18.0/${pageId}/media`, postData)
  .then(response => {
    creationID= response.data.id;
    console.log("Creation Id inside 1st Call",creationID);
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response.data);
  });
    // graph.post(
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

  
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
  // Require the necessary module
};


const publishpost = async (req, res) => {
 console.log("Inside PublishPost");
  try {
    console.log('InstauserId', pageId);

   
    const token = getToken(); // Get the token value
    console.log('Token:', token); // Access the token value
    console.log("Creation Id Inside Publish Post 2nd Call",creationID);


    const postData = {
      creation_id : creationID,
      access_token: token
    };
    
    axios.post(`https://graph.facebook.com/v18.0/${pageId}/media_publish`, postData)
      .then(response => {
        console.log('Response:', response.data);
      })
      .catch(error => {
        console.error('Error:', error.response.data);
      });



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

    console.log("PublishInstaPost function ran successfully");
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {publishpost,uploadpost};
