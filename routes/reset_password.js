const express = require('express');
const router = express.Router();
const catchErrors = require('../lib/async-error');
const User = require('../models/user');

function validateForm(form) {
  if (!form.password && options.needPassword) {
    return 'Password is required.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}
function valiadatePassword(form) {
  if (!form.password && options.needPassword) {
    return 'Password is required.';
  }

  if (form.password !== form.password_confirmation) {
    return 'Passsword do not match.';
  }

  if (form.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}
router.get('/', (req, res, next) => {
  res.render('user/reset_password');
});

router.post('/confirm', catchErrors(async (req, res, next) => {
  // 넘겨 받은 이름과 이메일로 유저정보를 검색
  // 존재하지 않는다면  flash 메세지로 경고.
  // 존재한다면 변경 페이지 렌더
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  var __pass = bcrypt.hash(req.password, 10);
  user = await User.findOne({password : __pass});
  console.log('USER???', user);
  if (!user) {
    req.flash('danger', 'No such Account in site. Please Sign Up');
    return res.redirect('back');
  }
  res.render('user/passwd_confirm');
}));

router.post('/complete', catchErrors(async (req, res, next)=>{
  const err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  user.password = await user.generateHash(req.body.password);
  await user.update();
  return res.redirect('user/info');
}));
module.exports = router;
