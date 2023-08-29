const { google } = require('googleapis');
const xml2js = require('xml2js');

const generateRSSMiddleware = async (req, res, next) => {
  try {
    // Authenticate with Google Photos API
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/photoslibrary.readonly'],
    });
    const client = await auth.getClient();
    const photos = google.photoslibrary({
      version: 'v1',
      auth: client,
    });

    // Get album ID from request body
    const { albumId } = req.body;

    // Get photos from album using Google Photos API
    const response = await photos.mediaItems.search({
      albumId,
      pageSize: 10,
    });
    
    // Parse photo data into RSS format
    const rssData = {
      rss: {
        '@version': '2.0',
        channel: {
          title: 'My Photos RSS Feed',
          link: 'http://example.com/photos/rss',
          description: 'A collection of my favorite photos',
          item: response.data.mediaItems.map((mediaItem) => ({
            title: mediaItem.filename,
            description: mediaItem.description || '',
            pubDate: new Date(mediaItem.creationTime).toUTCString(),
            enclosure: {
              '@url': mediaItem.baseUrl,
              '@type': mediaItem.mimeType,
            },
          })),
        },
      },
    };

    // Convert RSS data to XML
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(rssData);

    // Set response headers and send XML
    res.set('Content-Type', 'application/rss+xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
};

module.exports = generateRSSMiddleware;
