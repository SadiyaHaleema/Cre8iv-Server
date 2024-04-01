const MongoClient = require('mongodb').MongoClient;

const uploadpost = async (req, res) => {
  const pageUsername = req.body.pageUsername;

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
      return res.status(404).json({ success: false, message: 'Page info not found' });
    }
    
    // Retrieve the pageId from the found document
    const pageId = pageInfo.pageId;
    console.log("InstauserId",pageId);
    // Respond with the retrieved pageId
    res.status(200).json({ success: true, pageId: pageId });
    
  } catch (error) {
    console.error('Error retrieving page info:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    // Close the MongoDB connection
    client.close();
  }
};

module.exports = uploadpost;
