const mongoose = require("mongoose");
const { mongoURI: db } = require('../config/keys.js');
const User = require('../models/User');
const Post = require('../models/Post');

const DEFAULT_PROFILE_IMAGE_URL = 'https://pet-network-seeds.s3.us-west-1.amazonaws.com/leo_on_couch.JPG'; // <- Insert the S3 URL that you copied above here

// Connect to database
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    initializeImages();
  })
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  });

// Initialize image fields in db
const initializeImages = async () => {
  console.log("Initializing profile avatars...");
  await User.updateMany({}, { profileImageUrl: DEFAULT_PROFILE_IMAGE_URL });
    
  console.log("Initializing Post image URLs...");
  await Post.updateMany({}, { imageUrls: [] });

  console.log("Done!");
  mongoose.disconnect();
}