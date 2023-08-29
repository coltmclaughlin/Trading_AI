// // server/routes/photos.js

const express = require("express");
const multer = require("multer");
const mkdirp = require("mkdirp");
const PhotoController = require("../controllers/photoController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = `uploads/${req.headers.userid}`;
    console.log(uploadDir);
    mkdirp(uploadDir, (err) => {
      if (err) {
        return cb(err);
      }
      cb(null, uploadDir);
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.get("/rss/:userId", PhotoController.rssfeed);
router.get("/photos", PhotoController.photoview);
router.get("/search", PhotoController.photosearch);
router.get("/public/image/:imgid", PhotoController.display);
router.post("/upload", upload.array("files"), PhotoController.uploads);

module.exports = router;
