//import {getFacebookLoginUrl} from '../Controllers/latestfbloginserver';

//console.log('In routes');
const router = require('express-promise-router')();
module.exports = router;

const {
  getFacebookLoginUrl,
  getFbToken,
  getUserFbPages,
  getPgData,
  } = require('../Controllers/fbloginserver');

const uploadpost = require('../Controllers/publishpost');   
const tryupload = require('../Controllers/imgupd_server');

router.route('/fblogin').get(getFacebookLoginUrl);

router.route('/fbtoken').get(getFbToken);

router.route('/fbpages').get(getUserFbPages);
router.route('/fbpagesdata').get(getPgData);
router.route('/uploadimg').post(tryupload);
router.route('/publishpost').post(uploadpost);