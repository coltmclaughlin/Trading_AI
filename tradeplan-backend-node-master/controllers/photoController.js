const dotenv=require('dotenv');
const Photo  = require('../models/Photo');
const User = require('../models/User');
const RSS = require('rss');
const path = require("path");
const sharp = require("sharp");

dotenv.config();

const addTextWatermark = async (filepath, text) => {
  const img = await sharp(filepath).toBuffer();
  const metadata = await sharp(img).metadata();
  await sharp(img)
    .composite([
      {
        input: Buffer.from(
          `<svg viewBox="0 0 ${metadata.width} ${
            metadata.height
          }" xmlns="http://www.w3.org/2000/svg">
            <style>
              .title {
                fill: #000;
                font-size: ${metadata.width / 10}px;
                font-weight: bold;
                font-family: Helvetica, sans-serif;
                text-shadow: 0.1em 0.1em #aaa;
                opacity: 100%;
              }
            </style>
            <text x="50%" y="80%" text-anchor="middle" class="title">${text}</text>
          </svg>`
        ),
        gravity: "center",
        blend: "overlay",
      },
    ])
    .toFile(filepath);

  console.log("Successfully added copyright");
};

exports.uploads = async (req, res) => {
  try {
    const files = req.files;
    const userid = req.headers.userid;
    const watermark = req.headers.watermarktext;

    const promises = files.map(async (file) => {
      const uploadDir = `uploads/${req.headers.userid}`;
      await mkdirp(uploadDir);
      const filePath = path.join(uploadDir, file.originalname);

      // await removeGPSInfo(filePath);
      await addTextWatermark(filePath, watermark);

      const fileDoc = new Photo({
        filename: file.originalname,
        userID: userid,
        dateUploaded: Date.now(),
      });
      await fileDoc.save();
    });

    try {
      await Promise.all(promises);
      res.status(200).send("Images uploaded and watermarked successfully.");
    } catch (error) {
      res.status(500).send("Error processing images.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
}


exports.rssfeed = async (req, res)=>{
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
        console.log(user.name);
        console.log(userId)
        // Retrieve the user's uploaded photos from MongoDB
        const myphotos = await Photo.find({userID:userId}).exec();

        const feed = new RSS({
            title: `My Photo Feed - User ${user.name}`,
            description: 'A photo feed for my website',
            feed_url: `https://photorss.picstr.live/rss/${userId}`,
            site_url: 'https://photorss.picstr.live/',
            language: 'en',
            custom_namespaces: {
                content: 'http://purl.org/rss/1.0/modules/content/',
                wfw: 'http://wellformedweb.org/CommentAPI/',
                dc: 'http://purl.org/dc/elements/1.1/',
                atom: 'http://www.w3.org/2005/Atom',
                sy: 'http://purl.org/rss/1.0/modules/syndication/',
                slash: 'http://purl.org/rss/1.0/modules/slash/',
                georss: 'http://www.georss.org/georss',
                geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#'
              }
        });

        myphotos.forEach((photo) => {
            const item = {
            title: photo.filename,
            description: `<a href="https://127.0.0.1/public/image/${photo.userID}/${photo.filename}" title="Beginner basics: What is a prime lens?" rel="nofollow"><img width="640" height"32" src="https://127.0.0.1/public/image/${photo.userID}/${photo.filename}"/></a>`,
            url: `https://127.0.0.1/public/image/${photo.userID}/${photo.filename}`,
            guid: photo._id,
            date: photo.uploadDate
            };
            feed.item(item);
        });
        // Generate the RSS feed XML using a third-party library like rss or feed

        // Return the generated XML as a response
        const xml = feed.xml({ indent: true });
        res.type('application/xml');
        res.send(xml);

    } catch(err){
        console.error(err);
        res.status(500).json({ message: err });
    }
};

exports.photoview = async (req, res) => {
  const photos = await Photo.find();
  res.send(photos);
}

exports.photosearch = async (req, res) => {
  console.log('search');
}

exports.display = async (req, res) => {
  const filePath = path.join(
    '/home/ubuntu/Project/node-backend/',
    `uploads/${req.params.imgid}`
  ); 
  console.log(filePath)
  res.sendFile(filePath);
}