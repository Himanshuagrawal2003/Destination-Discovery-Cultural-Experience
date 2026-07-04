const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
let apiKey = process.env.CLOUDINARY_API_KEY;
let apiSecret = process.env.CLOUDINARY_API_SECRET;

// Automatically parse cloudinary:// connection URI if passed in any field
const cloudinaryUrl = [apiSecret, apiKey, cloudName].find(v => v && v.startsWith('cloudinary://'));
if (cloudinaryUrl) {
  const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.*)/);
  if (match) {
    apiKey = match[1];
    apiSecret = match[2];
    cloudName = match[3];
  }
}

const isCloudinaryConfigured = 
  cloudName && 
  !cloudName.startsWith('your_') &&
  apiKey && 
  !apiKey.startsWith('your_') &&
  apiSecret && 
  !apiSecret.startsWith('your_');

let storageDestination;
let storageAvatar;
let storageGeneral;

if (isCloudinaryConfigured) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key:    apiKey,
    api_secret: apiSecret,
  });

  console.log('☁️ Cloudinary configured successfully.');

  storageDestination = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         'culturequest/destinations',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    },
  });

  storageAvatar = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         'culturequest/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
    },
  });

  storageGeneral = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:         'culturequest/uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1200, quality: 'auto' }],
    },
  });
} else {
  console.log('📁 Cloudinary not configured. Falling back to local disk storage in "uploads/"');

  // Custom storage wrapper to return public URLs instead of local file paths
  class LocalUrlStorage {
    constructor(folderName) {
      const uploadDir = path.join(__dirname, '../../uploads', folderName);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      this.diskStorage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        }
      });
      this.folderName = folderName;
    }

    _handleFile(req, file, cb) {
      this.diskStorage._handleFile(req, file, (err, info) => {
        if (err) return cb(err);
        const host = req.get('host') || 'localhost:5000';
        // Format path as a full URL to the static assets route
        info.path = `${req.protocol}://${host}/uploads/${this.folderName}/${info.filename}`;
        cb(null, info);
      });
    }

    _removeFile(req, file, cb) {
      this.diskStorage._removeFile(req, file, cb);
    }
  }

  storageDestination = new LocalUrlStorage('destinations');
  storageAvatar      = new LocalUrlStorage('avatars');
  storageGeneral     = new LocalUrlStorage('general');
}

// Multer upload instances
const uploadDestination = multer({ storage: storageDestination });
const uploadAvatar      = multer({ storage: storageAvatar });
const uploadGeneral     = multer({ storage: storageGeneral });

module.exports = { cloudinary, uploadDestination, uploadAvatar, uploadGeneral };
