// Importing required modules
const graph = require('fbgraph');
const { spawn } = require('child_process');
const {pageinfo }= require('../models/pageInfo');
// const {fbuserinfo} = require('../models/fbuserinfo')
const post = require('../models/post');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
// Constants
const CLIENT_ID = '1303786660331996';
//const CONFIG_ID = '810365901107808';
const CONFIG_ID = '1341274536576744';
const CLIENT_SECRET = '3d3274e3174916feafaee66fd84d4e95';
const REDIRECT_URI = 'https://localhost:3001/fbtoken';

let token, no_Objects;
let fbuser_id,fbuser_name; 

//const pageTokens = [];
const instapageIds = [];
// const fbpageIds = [];
// const fbpagenames =[];

const categories = [];
const usenames = [];
const biographies = [];
let responses = []; // Array to store responsess

const getFacebookLoginUrl = async (req, res) => {
  const authUrl = graph.getOauthUrl({
    client_id: CLIENT_ID,
    config_id: CONFIG_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'email',
  });

  res.json({ url: authUrl });
};

const getFbToken = async (req, res) => {
  graph.authorize(
    {
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      client_secret: CLIENT_SECRET,
      code: req.query.code,
    },
    function (err, fbRes) {
      //console.log('this is my fb token =============> ', fbRes, err);
      if (err) {
        return res.json(err);
      }

      token = fbRes.access_token;
      //fbRes.access_token = null;
      //res.json(fbRes);
      res.redirect('https://localhost:3000/');
    }
  );
};






const getUserFbPages = async (req, res) => {
  //await getFbUserDetails();
    let graph = require('fbgraph');
  // const userAccessToken = req.headers.authorization;
  /* if (!userAccessToken) {
    res.status(401).json({
      message: 'Unauthorized: Access token not provided.',
    });
    return;
  } */

  graph.get(
    `me/accounts?fields=name,id,access_token,instagram_business_account{id,username,biography},category&access_token=${token}`,
    //17841403823915540/insights/?metric=follower_count,reach,impressions&period=day&since2021-01-11&until=2021-01-18    -----> To get Insights of the Insta Account
    //17841424820010573/media?fields=username,caption,media_url,timestamp    ----> This is the main Data We have to fetch

    async (err, resp) => {
      if (err) {
         res.status(404).json({
          message: err.message || 'Error in getting user facebook pages.',
        });
        return;
      }
    res.json({ data: resp.data });

    console.log("Accounts API",resp)
      
      no_Objects = resp.data.length;
      // Loop through each object in resp.data
      for (let i = 0; i < no_Objects; i++) {
        //const pageToken = resp.data[i].access_token;
        //const fbpg_Id = resp.data[i].id;
        //const fbpg_name = resp.data[i].name;
        const instapgId = resp.data[i].instagram_business_account.id;
        const category = resp.data[i].category;
        const username = resp.data[i].instagram_business_account.username;
        const biography = resp.data[i].instagram_business_account.biography;


          // Check if the pageinfo already exists in MongoDB
        const pageInfoExists = await pageinfo.findOne({ pageId: instapgId });

        if (pageInfoExists) {
          console.log(`pageinfo with pageId ${instapgId} already exists. Skipping.`);
        } else {
          // Save pageinfo to MongoDB
          const newpageinfo = new pageinfo({
            pageId: instapgId,
            fbuserid:fbuser_id,
            fbusername:fbuser_name,
            category,
            username,
            biography,
            keywords:null
            // Add other pageinfo fields
          });

          try {
            await newpageinfo.save();
            console.log('pageinfo saved to MongoDB:', newpageinfo);
          } catch (error) {
            console.error('Error saving pageinfo to MongoDB:', error.message);
          }
      
        }
        // Store values in arrays

        instapageIds.push(instapgId);
        categories.push(category);
        usenames.push(username);
        biographies.push(biography);
      }

      //console.log('Page Tokens:', pageTokens);
      //console.log('Page IDs:', pageIds);

      // page_token = resp.data[1].access_token;
      //page_id = resp.data[1].id;
    }
  );
};

const getPgData = async (req, res) => {
  for (let i = 0; i < no_Objects; i++) {
    //const pageToken = pageTokens[i]; // Access page token from the array
    const instapgId = instapageIds[i];
    const category = categories[i];
    const biography = biographies[i];

    try {
      const response = await getGraphData(instapgId, token);

      responses.push({ instapgId, category, biography, data: response });
    } catch (err) {
      console.log(`Error in fb getpgdata api for Page ID ${instapgId}:`, err);
    }
  }

  // Send the accumulated responses as a single response
  res.json(responses);
  //console.log('Responses from graphapi: -----', responses);

  processData()
    .then(() => {
      console.log('Processing completed.');
    })
    .catch((error) => {
      console.error('Error during processing:', error);
    });
};

async function processData() {
  for (const item of responses) {
    const dataArray = item.data.data;

    for (const dataItem of dataArray) {
      const category = item.category;
      const biography = item.biography;
      const instapgId = item.instapgId;
      const username = dataItem.username;
      const caption = dataItem.caption;
      const media_url = dataItem.media_url;
      const timestamp = dataItem.timestamp;
      const post_id = dataItem.id;



      // Save Captions to MongoDB
      const postinfo = await post.findOne({ postid: post_id });

      

        if (postinfo) {
          console.log(`pageinfo with pageId ${post_id} already exists. Skipping.`);
        } else {
        const newpost = new post({
          instaPageId: instapgId,
          postid:post_id,
          captionText : caption,
          mediaurl:media_url,
          timestamp: timestamp,


          // Add other Caption fields
        });

        try {
          await newpost.save();
          console.log('Caption saved to MongoDB:', newpost);
        } catch (error) {
          console.error('Error saving Caption to MongoDB:', error.message);
        }
      }
    }
  }

  await extractkeywords();
}


//Function to make the graph.get call and return a Promise
function getGraphData(instapagId, token) {
  return new Promise((resolve, reject) => {
    let graph = require('fbgraph');
    //Use Post Method 
        //`${instapagId}/media?fields=caption,media_url{"https://dejhdjejdijk"}`

    graph.get(
      `${instapagId}/media?fields=username,caption,media_url,timestamp&access_token=${token}`,
      (err, resp) => {
        if (err) {
          reject(err);
        } else {
          resolve(resp);
        }
      }
    );
  });
}

let pythonScriptOutput = ''; 

async function extractkeywords() {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(
      'python',
      [
        './scripts/keywordextraction.py',
      ],
      {}
    );
   
    let output ;
    pythonProcess.stdout.on('data', (data) => {
      output = data.toString();
      console.log(`Python Script --------> Output: ${data}`);

      // console.log(`Python Script Output: ${data}`);
    
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python Script: ${data}`);
      reject(data);
    });

    pythonProcess.on('close', async (code) => {
      console.log(`Python Script exited with code ${code}`);

      try {
        const parsedOutput = JSON.parse(output);

        // Assuming the dictionary key is stored in the variable 'page'
        const pageKey = Object.keys(parsedOutput)[0];
        console.log('-------->Page Key',pageKey);    
        const client = await MongoClient.connect('mongodb://localhost:27017', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        const db = client.db('cre8iv');
       
        const collection = db.collection('pageinfos');

        // Search for the document with the key
        const existingDocument = await collection.findOne({ pageId: pageKey });

        // Update or insert the document with the key and keywords
        if (existingDocument) {
          if (!existingDocument.keywords) {
        
          await collection.updateOne({ pageId: pageKey }, { $set: { keywords: parsedOutput[pageKey] } });
           }
           else {
            console.log(`Keywords already exist for pageId: ${pageKey}`);
            // Handle the case where keywords already exist for the pageId
          }
          }
           else {
          await collection.insertOne({ pageId: pageKey, keywords: parsedOutput[pageKey] });
        }
        resolve();
      } catch (parseError) {
        console.error('Error parsing Python script output:', parseError);
        reject(parseError);
      } 
      
    });
   
  });
}




module.exports = { getFacebookLoginUrl, getFbToken, getUserFbPages, getPgData };