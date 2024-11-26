const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.C_NAME,
  api_key: process.env.C_KEY,
  api_secret: process.env.C_SECRET,
});

exports.upload = multer({ storage: multer.diskStorage({}) });
