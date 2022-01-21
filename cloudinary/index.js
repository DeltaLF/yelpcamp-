const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: async (req, file) => {
      return "YelpCamp";
    },
    format: async (req, file) => {
      return "jpg";
    },
    //public_id: (req, file) => Math.random().toString(),
  },
});
// const storage = new CloudinaryStorage({
//   cloudinary,
//   folder: "YelpCamp", // folder in Cloudinary
//   allowedFormats: ["jpeg", "png", "jpg"],
// });

module.exports = {
  cloudinary,
  storage,
};
