require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');

// Specific Wikipedia page titles for each destination to extract real landmark/scenic images
const LANDMARK_PAGES = {
  'varanasi': 'Ghats in Varanasi',
  'indore': 'Rajwada',
  'gwalior': 'Gwalior Fort',
  'tamil nadu': 'Shore Temple',
  'mathura': 'Krishna Janmasthan Temple Complex',
  'vrindavan': 'Prem Mandir, Vrindavan',
  'delhi': 'Qutub Minar',
  'chennai': 'Kapaleeshwarar Temple',
  'bangalore': 'Bangalore Palace',
  'nagaland': 'Hornbill Festival',
  'budapest street art': 'Ruin pub',
  'manali': 'Solang Valley',
  'bali': 'Pura Ulun Danu Bratan',
  'bhopal': 'Taj-ul-Masajid',
  'omkareshwar': 'Omkareshwar temple',
  'ujjain': 'Ujjain Mahakaleshwar Jyotirlinga',
  'gokul': 'Gokul',
  'goa': 'Basilica of Bom Jesus',
  'greenland': 'Ilulissat Icefjord',
  'destination': 'Sanchi Stupa' // fallback for placeholder
};

// Helper for fetching image list from a specific Wikipedia page
const getImagesFromWikiPage = async (pageTitle, limit = 5) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${encodeURIComponent(pageTitle)}&imlimit=50&origin=*`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CultureQuestAI/1.0 (himanshuagrawal7766@gmail.com; developer)'
      }
    });

    if (!response.ok) return [];
    const data = await response.ok ? await response.json() : null;
    if (!data || !data.query || !data.query.pages) return [];

    const pages = Object.values(data.query.pages);
    if (pages.length === 0 || !pages[0].images) return [];

    const noiseKeywords = ['flag', 'map', 'logo', 'icon', 'portal', 'shield', 'stub', 'wikimedia-logo', 'svg', 'location'];
    const imageFiles = pages[0].images
      .map(img => img.title)
      .filter(title => {
        const lower = title.toLowerCase();
        const hasValidExt = /\.(jpg|jpeg|png)$/i.test(lower);
        const isNoise = noiseKeywords.some(keyword => lower.includes(keyword));
        return hasValidExt && !isNoise;
      });

    return imageFiles.slice(0, limit);
  } catch (err) {
    console.error(`  ❌ Error fetching images list for "${pageTitle}":`, err.message);
    return [];
  }
};

// Helper to get direct URL of a file from Wikipedia
const getDirectWikiUrl = async (fileName) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=${encodeURIComponent(fileName)}&iiprop=url&origin=*`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CultureQuestAI/1.0 (himanshuagrawal7766@gmail.com; developer)'
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});
    return pages[0]?.imageinfo?.[0]?.url || null;
  } catch (err) {
    return null;
  }
};

// Helper to download image and upload to Cloudinary via base64 buffer
const uploadToCloudinary = async (imgUrl) => {
  if (!imgUrl || !imgUrl.startsWith('http')) return imgUrl;
  try {
    const response = await fetch(imgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    const res = await cloudinary.uploader.upload(dataUrl, {
      folder: 'culturequest/destinations',
      resource_type: 'image'
    });
    return res.secure_url;
  } catch (err) {
    console.warn(`  ⚠️ Cloudinary upload failed for ${imgUrl.slice(0, 50)}...:`, err.message);
    return imgUrl;
  }
};

// Main execution function
const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    const destinations = await Destination.find({});
    console.log(`📌 Found ${destinations.length} destinations to verify/update.`);

    for (const dest of destinations) {
      const key = dest.name.toLowerCase().trim();
      const pageTitle = LANDMARK_PAGES[key];

      if (!pageTitle) {
        console.log(`⏭️  No landmark page title for "${dest.name}" — skipping.`);
        continue;
      }

      console.log(`\n⚙️  Processing "${dest.name}" using Wikipedia page: "${pageTitle}"`);

      // 1. Get raw image filenames from Wikipedia page
      const imageFiles = await getImagesFromWikiPage(pageTitle, 4);
      if (imageFiles.length === 0) {
        console.log(`  ⚠️ No landmark images found on Wikipedia for "${pageTitle}"`);
        continue;
      }

      console.log(`  Found ${imageFiles.length} files. Fetching direct URLs...`);

      // 2. Fetch direct URLs and upload to Cloudinary
      const finalUrls = [];
      for (const fileName of imageFiles) {
        // Sleep to avoid rate limits
        await new Promise(r => setTimeout(r, 600));
        const rawUrl = await getDirectWikiUrl(fileName);
        if (rawUrl) {
          console.log(`  Uploading: ${fileName.replace('File:', '')}`);
          const cloudinaryUrl = await uploadToCloudinary(rawUrl);
          if (cloudinaryUrl) {
            finalUrls.push(cloudinaryUrl);
          }
        }
      }

      if (finalUrls.length > 0) {
        // 3. Set the first gallery image as the cover image
        const coverImage = finalUrls[0];

        // 4. Update the destination document
        dest.coverImage = coverImage;
        dest.images = finalUrls;
        dest.gallery = finalUrls;
        await dest.save();

        console.log(`  💾 Updated database for "${dest.name}":`);
        console.log(`     Cover Image: ${coverImage}`);
        console.log(`     Gallery Count: ${finalUrls.length}`);
      } else {
        console.log(`  ❌ Failed to upload any images for "${dest.name}"`);
      }

      // Cool-off period before starting the next destination
      await new Promise(r => setTimeout(r, 1500));
    }

    console.log('\n🎉 Done! All destinations updated successfully with proper landmark galleries and cover images.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

runMigration();
