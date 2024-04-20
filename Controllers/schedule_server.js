const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
 // Require the necessary module
 let graph = require('fbgraph');
const { getToken } = require('./fbloginserver');
const token = getToken(); // Get the token value

const fetchfbpgtoken = async (req, res) => {

  try{
    const instaUsername = req.body.pageUsername;
    // Connect to MongoDB
    const client =await MongoClient.connect('mongodb://localhost:27017', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Access the database
    const db = client.db('cre8iv'); // Replace 'your_database_name' with your actual database name

    // Access the collection
    const collection = db.collection('pageinfos');

    // Find the document with the matching pageUsername
    const pageInfo = await collection.findOne({ insta_username: instaUsername });

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
      graph.get(
        `me/accounts?fields=name,id,access_token&access_token=${token}`,
        async (err, resp) => {
          if (err) {
            isLoggedIn = false; // Set the flag to false if there's an error
            return;
          }

         
          
          console.log('After 2nd Api Graph Call:: ');
  
          // Handle the response from the second API call
          console.log('User Facebook pages Tokens:', resp);
  
         // Loop through the pages obtained from Facebook Graph API response
        for (const page of resp.data) {
          console.log("Inside Loop Page Id",page.id);
          // Match the facebookPageId with the page ID from the loop
          if (page.id === facebookPageId) {
            // Retrieve the page token for the matched page
            const pageAccessToken = page.access_token;
            console.log('Page Access Token:', pageAccessToken);
  
            // Send the response back to the client
            // res.json({ isLoggedIn: true, data: resp.data });
            return; // Break the loop since we found the matching page
          }
        }
         
           
       
        }
      );
           
     // Respond to the client with success message or any other data as needed
     res.status(200).json({ success: true });

  }
  catch{
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
   
};

const scheduling = async (req, res) => {
   
  //   try {
      
  //     console.log('Req.body:', req.body);
      
       
  //        } 
  //   catch (error) {
  //     console.error('Error uploading image to Azure Blob Storage:', error);
  //     res.status(500).json({ success: false, message: 'Internal server error' });
  // }
    
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
  
  //   // Add unhandledRejection event listener here
  //   process.on('unhandledRejection', (reason, promise) => {
  //     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  //     // Handle or log the unhandled rejection as needed
  //   });
    // Require the necessary module
  };


  module.exports = {scheduling,fetchfbpgtoken}; 