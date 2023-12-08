const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const passport = require('passport');
const { loginUser, restoreUser } = require('../../config/passport');
const { isProduction } = require('../../config/keys');
const validateRegisterInput = require('../../validations/register');
const validateLoginInput = require('../../validations/login');
const { singleFileUpload, singleMulterUpload, retrievePrivateFile } = require("../../awsS3");


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    message: "GET /api/users"
  });
});

// POST /api/users/register
router.post('/register', singleMulterUpload("image"), validateRegisterInput, async (req, res, next) => {
  // Check to make sure no one has already registered with the proposed email or
  // name.
  const user = await User.findOne({
    $or: [{ email: req.body.email }]
  });

  if (user) {
    // Throw a 400 error if the email address and/or email already exists
    const err = new Error("Validation Error");
    err.statusCode = 400;
    const errors = {};
    if (user.email === req.body.email) {
      errors.email = "A user has already registered with this email";
    }
    err.errors = errors;
    return next(err);
  }

  // Otherwise create a new user

  const profileImageUrl = req.file ?
      await singleFileUpload({ file: req.file, public: false}) :
      'https://pet-network-seeds.s3.us-west-1.amazonaws.com/purple-profile.jpg';
  const newUser = new User({
    name: req.body.name,
    profileImageUrl,
    email: req.body.email,
    company_id: req.body.company_id,  });

  // Salt password and save
  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(req.body.password, salt, async (err, hashedPassword) => {
      if (err) throw err;
      try {
        newUser.hashedPassword = hashedPassword;
        const user = await newUser.save();
        return res.json(await loginUser(user));
      }
      catch(err) {
        next(err);
      }
    })
  });
});

router.post('/login', singleMulterUpload(""), validateLoginInput, async (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 400;
      err.errors = { email: "Invalid credentials" };
      return next(err);
    }
    return res.json(await loginUser(user));
  })(req, res, next);
});

router.get('/current', restoreUser, async (req, res) => {
  if (!isProduction) {
    // In development, allow React server to gain access to the CSRF token
    const csrfToken = req.csrfToken();
    res.cookie("CSRF-TOKEN", csrfToken);
  }
  if (!req.user) return res.json(null);

  // Retrieve the private file URL if needed and await its resolution
  let profileImageUrl = req.user.profileImageUrl;
  if (!req.user.profileImageUrl.includes('aws')) {
    profileImageUrl = await retrievePrivateFile(req.user.profileImageUrl);
  }

  res.json({
    _id: req.user._id,
    name: req.user.name,
    profileImageUrl: profileImageUrl,
    email: req.user.email,
    company_id: req.body.company_id
  });
});

module.exports = router;
