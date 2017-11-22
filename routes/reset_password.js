const express = require('express');
const router = express.Router();
const catchErrors = require('../lib/async-error');
const User = require('../models/user');

function validateForm(form) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return 'Name is required.';
  }

  if (!email) {
    return 'Email is required.';
  }

  return null;
}

function valiadatePassword(form) {
  
}
router.get('/', (req, res, next) => {
  res.render('reset_password');
});

router.post('/', catchErrors(async (req,res,next)=>{
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }


}));

router.post('/confirm', catchErrors(async (req, res, next) => {
  // 넘겨 받은 이름과 이메일로 유저정보를 검색
  // 존재하지 않는다면  flash 메세지로 경고.
  // 존재한다면 변경 페이지 렌더
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  var user = await User.findOne({email: req.body.email, name: req.body.name});
  console.log('USER???', user);
  if (!user) {
    req.flash('danger', 'No such Account in site. Please Sign Up');
    return res.redirect('back');
  }
  res.render('passwd_confirm');
}));

module.exports = router;
