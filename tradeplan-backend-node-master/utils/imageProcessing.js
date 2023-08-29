const sharp = require('sharp');

exports.resizeImage = async (imageBuffer, width, height) => {
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize(width, height)
    .toBuffer();
  return resizedImageBuffer;
};

exports.compressImage = async (imageBuffer) => {
  const compressedImageBuffer = await sharp(imageBuffer)
    .jpeg({ quality: 80 })
    .toBuffer();
  return compressedImageBuffer;
};
