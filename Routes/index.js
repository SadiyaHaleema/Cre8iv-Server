const router = require('express-promise-router')();
module.exports = router;

const {
  getFacebookLoginUrl,
  getFbToken,
  getUserFbPages,
  getPgData,
} = require('../Controllers/fbloginserver');

const {
  uploadpost,
  publishpost,
  fetchinstafbpagetoken,
} = require('../Controllers/cloudinaryinstapublish');
const tryupload = require('../Controllers/imgupd_server');
const chatbot = require('../Controllers/chatbot_server');
const {
  scheduling,
  fetchfbpgtoken,
} = require('../Controllers/schedule_server');
const {
  fetchfbpagetoken,
  fbpostpublish,
} = require('../Controllers/facebookpublish_server');

router.route('/fblogin').get(getFacebookLoginUrl);
router.route('/fbtoken').get(getFbToken);

router.route('/fbpages').get(getUserFbPages);
router.route('/fbpagesdata').get(getPgData);
router.route('/uploadimg').post(tryupload);

router.route('/token').post(fetchinstafbpagetoken);
router.route('/uploadpost').post(uploadpost);
router.route('/publishpost').post(publishpost);

router.route('/chatbot').post(chatbot);

router.route('/getfbpgtoken').post(fetchfbpgtoken);
router.route('/schedulepost').post(scheduling);
//Facebook Post Publishing Function Calls : 1-Retrieve FbToken , 2- Fb Post Publish
router.route('/retreivefbpgtoken').post(fetchfbpagetoken);
router.route('/fbpublishpost').post(fbpostpublish);
