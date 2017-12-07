const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchErrors = require('../lib/async-error');
const needAuth = require('../lib/needAuthentication.js');

/* GET users listing. */
router.get('/', needAuth, catchErrors(async (req, res, next) => {
  if(req.user.admin){
    const users = await User.find({});
    res.render('users/index', {users: users});
  }else{
    res.redirect('/');
  }

}));

module.exports = router;
