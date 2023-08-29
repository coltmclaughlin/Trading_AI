const { google } = require('googleapis');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/photoslibrary'];
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

exports.authenticateWithGoogle = async () => {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  return authUrl;
};

exports.getAccessTokenFromCode = async (code) => {
  const { tokens } = await client.getToken(code);
  return tokens.access_token;
};

exports.uploadImageToGooglePhotos = async (imageBuffer) => {
  // Get access token
  const accessToken = await client.getAccessToken();

  // Upload image to Google Photos
  const uploadResponse = await axios.post('https://photoslibrary.googleapis.com/v1/uploads', imageBuffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${accessToken}`,
      'X-Goog-Upload-Content-Type': 'image/jpeg',
      'X-Goog-Upload-Protocol': 'raw'
    }
  });

  // Create media item from uploaded image
  const createResponse = await axios.post('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', {
    albumId: process.env.GOOGLE_ALBUM_ID,
    newMediaItems: [{
      description: '',
      simpleMediaItem: {
        fileName: 'photo.jpg',
        uploadToken: uploadResponse.data
      }
    }]
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // Return URL of uploaded photo
  return createResponse.data.newMediaItemResults[0].mediaItem.productUrl;
};
