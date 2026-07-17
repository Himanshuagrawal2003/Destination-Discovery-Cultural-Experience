const mongoose = require('mongoose');

const fetchRealUnsplashImage = async (query) => {
  try {
    const response = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`);
    if (!response.ok) return null;
    const html = await response.text();
    const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+/g);
    if (matches && matches.length > 0) {
      const uniqueMatches = Array.from(new Set(matches));
      const picked = uniqueMatches[0];
      return `${picked}?q=80&w=1200`;
    }
  } catch (err) {
    console.error('Error fetching Unsplash search page:', err.message);
  }
  return null;
};

const fetchMultipleUnsplashImages = async (query, limit = 5) => {
  try {
    const response = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const html = await response.text();
    const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+/g);
    if (matches && matches.length > 0) {
      const uniqueMatches = Array.from(new Set(matches)).map(url => `${url}?q=80&w=1200`);
      return uniqueMatches.slice(0, limit);
    }
  } catch (err) {
    console.error('Error fetching multiple Unsplash images:', err.message);
  }
  return [];
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Dynamically heal any broken cover images in the database on startup
    const Destination = require('../models/Destination');
    const CATEGORY_FALLBACKS = {
      beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
      mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200',
      city: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200',
      desert: 'https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?q=80&w=1200',
      forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200',
      historical: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
      adventure: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?q=80&w=1200',
      cultural: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200',
      wildlife: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1200',
      other: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200'
    };

    const list = await Destination.find({});
    const VERIFIED_FALLBACKS = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200',
      'https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?q=80&w=1200',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
      'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?q=80&w=1200',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200',
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1200',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200'
    ];

    const { cloudinary } = require('./cloudinary');
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_API_SECRET && 
      !process.env.CLOUDINARY_API_SECRET.startsWith('your_');

    let healedCount = 0;
    for (const dest of list) {
      const isUnsplashBroken = dest.coverImage && 
                               dest.coverImage.includes('images.unsplash.com') && 
                               !VERIFIED_FALLBACKS.includes(dest.coverImage);
      
      const isMissing = !dest.coverImage || !dest.coverImage.startsWith('http');

      const isGenericCloudinary = dest.coverImage && dest.coverImage.includes('cloudinary');

      const hasNoImages = !dest.images || dest.images.length === 0;

      if (isUnsplashBroken || isMissing || isGenericCloudinary || hasNoImages) {
        const categoryKey = (dest.category || 'other').toLowerCase();
        const fallbackUrl = CATEGORY_FALLBACKS[categoryKey] || CATEGORY_FALLBACKS.other;
        
        let coverUrl = dest.coverImage;
        if (isUnsplashBroken || isMissing || isGenericCloudinary) {
          console.log(`🔍 Searching Unsplash for a real cover image of "${dest.name}" to heal...`);
          const scraped = await fetchRealUnsplashImage(dest.name);
          const imageUrl = scraped || fallbackUrl;

          coverUrl = imageUrl;
          if (isCloudinaryConfigured) {
            try {
              console.log(`📤 Uploading healed cover image for ${dest.name} to Cloudinary...`);
              const resUpload = await cloudinary.uploader.upload(imageUrl, {
                folder: 'culturequest/destinations',
                resource_type: 'image'
              });
              coverUrl = resUpload.secure_url;
            } catch (uploadErr) {
              console.warn(`⚠️ Cloudinary upload failed during startup healing for ${dest.name}:`, uploadErr.message);
              if (imageUrl !== fallbackUrl) {
                try {
                  const resUploadFallback = await cloudinary.uploader.upload(fallbackUrl, {
                    folder: 'culturequest/destinations',
                    resource_type: 'image'
                  });
                  coverUrl = resUploadFallback.secure_url;
                } catch (fallbackErr) {
                  coverUrl = fallbackUrl;
                }
              }
            }
          }
          dest.coverImage = coverUrl;
        }

        if (hasNoImages) {
          console.log(`🔍 Searching Unsplash for gallery images of "${dest.name}" to heal...`);
          const galleryUrls = await fetchMultipleUnsplashImages(dest.name, 6);
          let uploadedImages = [];
          if (isCloudinaryConfigured && galleryUrls.length > 0) {
            console.log(`📤 Uploading healed gallery images for ${dest.name} to Cloudinary...`);
            for (const imgUrl of galleryUrls) {
              try {
                const resUpload = await cloudinary.uploader.upload(imgUrl, {
                  folder: 'culturequest/destinations',
                  resource_type: 'image'
                });
                uploadedImages.push(resUpload.secure_url);
              } catch (uploadErr) {
                uploadedImages.push(imgUrl);
              }
            }
          } else {
            uploadedImages = galleryUrls;
          }
          dest.images = uploadedImages;
          dest.gallery = uploadedImages;
        }

        await dest.save();
        healedCount++;
      }
    }
    if (healedCount > 0) {
      console.log(`🩺 Database healing complete: Fixed cover images for ${healedCount} destinations.`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection/Healing Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
