// Importing required modules
const graph = require('fbgraph');
const { spawn } = require('child_process');
const { pageinfo } = require('../models/pageInfo');
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
let fbuser_id, fbuser_name;

//const pageTokens = [];
const instapageIds = [];
const fbpageIds = [];
const fbpagenames = [];

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
      let isLoggedIn = true;
      res.redirect(`https://localhost:3000/?stateloggedIn=${isLoggedIn}`);
    }
  );
};

const getUserFbPages = async (req, res) => {
  // Set a flag to indicate that the user is logged in
  let isLoggedIn = true;

  // Require the necessary module
  let graph = require('fbgraph');

  // Make the first API call to get user details
  graph.get(
    `me?fields=name,id,email,picture&access_token=${token}`,
    async (err, userResp) => {
      if (err) {
        res.status(404).json({
          message: err.message || 'Error in getting user details.',
        });
        isLoggedIn = false; // Set the flag to false if there's an error
        return;
      }

      // Handle the response from the first API call
      console.log('User details:', userResp);

      // Now make the second API call to get user's Facebook pages
      graph.get(
        `me/accounts?fields=name,id,access_token,instagram_business_account{id,username,biography},category&access_token=${token}`,
        async (err, resp) => {
          if (err) {
            res.status(404).json({
              message: err.message || 'Error in getting user facebook pages.',
            });
            isLoggedIn = false; // Set the flag to false if there's an error
            return;
          }

          // Handle the response from the second API call
          console.log('User Facebook pages:', resp);

          // Send the response back to the client
          // very important to send data to frontend
          res.json({ isLoggedIn: true, data: resp.data, user: userResp });

          no_Objects = resp.data.length;
          // Loop through each object in resp.data

          // Process page data
          const pageData = resp.data;
          pageData.forEach(async (page) => {
            const fbpgid = page.id;
            const fbpgname = page.name;
            const instapgId = page.instagram_business_account.id;
            const category = page.category;
            const insta_username = page.instagram_business_account.username;
            const biography = page.instagram_business_account.biography;

            // Check if the pageinfo already exists in MongoDB
            //console.log("User Response",userResp.id)
            const pageInfoExists = await pageinfo.findOne({
              pageId: instapgId,
              userId: userResp.id,
            });
            console.log('-------------User Response', userResp);

            if (pageInfoExists) {
              console.log(
                `pageinfo with pageId ${instapgId} already exists. Skipping.`
              );
            } else {
              // Save pageinfo to MongoDB
              const newpageinfo = new pageinfo({
                pageId: instapgId,
                fbpageId: fbpgid,
                fbpagename: fbpgname,
                userId: userResp.id, // Assuming userResp contains user details
                user_name: userResp.name, // Assuming userResp contains user details
                user_picture: userResp.picture.data.url,
                user_email: userResp.email, // Assuming userResp contains user details
                category,
                insta_username: insta_username,
                biography,
                keywords: null,
                // Add other pageinfo fields
              });

              try {
                await newpageinfo.save();
                console.log('pageinfo saved to MongoDB:', newpageinfo);
              } catch (error) {
                console.error(
                  'Error saving pageinfo to MongoDB:',
                  error.message
                );
              }
            }

            // Store values in arrays

            instapageIds.push(instapgId);
            fbpageIds.push(fbpgid);
            fbpagenames.push(fbpgname);
            categories.push(category);
            usenames.push(insta_username);
            biographies.push(biography);
          });

          console.log('---------------->>>> Instapageids:', instapageIds);
        }
      );
    }
  );
};

const getPgData = async (req, res) => {
  try {
    for (let i = 0; i < no_Objects; i++) {
      const instapgId = instapageIds[i];
      const category = categories[i];
      const biography = biographies[i];

      try {
        const response = await getGraphData(instapgId, token);
        console.log('Data:response from graph Data ', response.data);
        responses.push({ instapgId, category, biography, data: response });
      } catch (err) {
        console.log(`Error in fb getpgdata api for Page ID ${instapgId}:`, err);
      }
    }

    // Send the accumulated responses as a single response
    res.json(responses);
    console.log('Responses from graphapi:', responses);

    // Call processData after all responses have been processed
    await processData(responses);
    console.log('Processing completed.');
  } catch (error) {
    console.error('Error in getPgData:', error);
  }
};

async function processData(responses) {
  console.log('Inside Process Data responses :', responses);
  try {
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
          console.log(
            `pageinfo with PostId ${post_id} already exists. Skipping.`
          );
        } else {
          const newpost = new post({
            postid: post_id,
            instaPageId: instapgId,
            captionText: caption,
            mediaurl: media_url,
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

    await extractkeywords(); // Wait for extractKeywords to complete
    console.log('Keywords extraction completed.');
  } catch (error) {
    console.error('Error in processData:', error);
    // Handle error appropriately
  }
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
      ['./scripts/keywordextraction.py'],
      {}
    );

    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`Python Script Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      // Log non-critical errors or warnings
      console.error(`Error from Python Script: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      console.log(`Python Script exited with code ${code}`);

      if (code === 0) {
        try {
          const parsedOutput = JSON.parse(output);
          const pageKey = Object.keys(parsedOutput)[0];

          const client = await MongoClient.connect(
            'mongodb://localhost:27017',
            {
              useNewUrlParser: true,
              useUnifiedTopology: true,
            }
          );

          const db = client.db('cre8iv');
          const collection = db.collection('pageinfos');

          const existingDocument = await collection.findOne({
            pageId: pageKey,
          });

          if (existingDocument) {
            if (!existingDocument.keywords) {
              await collection.updateOne(
                { pageId: pageKey },
                { $set: { keywords: parsedOutput[pageKey] } }
              );
            } else {
              console.log(`Keywords already exist for pageId: ${pageKey}`);
            }
          } else {
            await collection.insertOne({
              pageId: pageKey,
              keywords: parsedOutput[pageKey],
            });
          }

          resolve();
        } catch (parseError) {
          console.error('Error parsing Python script output:', parseError);
          reject(parseError);
        }
      } else {
        reject(`Python script exited with non-zero code: ${code}`);
      }
    });
  });
}

// Export a function that returns the token value
const getToken = () => token;

module.exports = {
  getFacebookLoginUrl,
  getFbToken,
  getUserFbPages,
  getPgData,
  getToken,
};
