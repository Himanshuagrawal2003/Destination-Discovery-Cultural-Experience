require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');

const USER_AGENT = 'CultureQuestAI/1.0 (himanshuagrawal7766@gmail.com; developer)';

// Multiple Wikipedia page titles per destination for richer gallery (6 images)
const LANDMARK_PAGES = {
  'varanasi':            ['Ghats in Varanasi', 'Varanasi'],
  'indore':              ['Rajwada', 'Indore'],
  'gwalior':             ['Gwalior Fort', 'Gwalior'],
  'tamil nadu':          ['Shore Temple', 'Meenakshi Temple'],
  'mathura':             ['Krishna Janmasthan Temple Complex', 'Mathura'],
  'vrindavan':           ['Prem Mandir, Vrindavan', 'Vrindavan'],
  'delhi':               ['Red Fort', 'India Gate, New Delhi'],
  'chennai':             ['Kapaleeshwarar Temple', 'Marina Beach'],
  'bangalore':           ['Vidhana Soudha', 'Bangalore'],
  'nagaland':            ['Hornbill Festival', 'Nagaland'],
  'budapest street art': ['Budapest', 'Ruin bar'],
  'manali':              ['Hadimba Temple', 'Manali, Himachal Pradesh'],
  'bali':                ['Pura Ulun Danu Bratan', 'Bali'],
  'bhopal':              ['Taj-ul-Masajid', 'Bhopal'],
  'omkareshwar':         ['Omkareshwar', 'Omkareshwar Jyotirlinga'],
  'ujjain':              ['Mahakaleshwar Jyotirlinga', 'Ujjain'],
  'gokul':               ['Gokul', 'Vrindavan'],
  'goa':                 ['Basilica of Bom Jesus', 'Goa'],
  'destination':         ['Sanchi Stupa', 'Sanchi'],
  'greenland':           ['Ilulissat Icefjord', 'Greenland']
};

// Get clean image file names from a Wikipedia page (up to `limit`)
const getWikiImages = async (pageTitle, limit = 6) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${encodeURIComponent(pageTitle)}&imlimit=50&origin=*`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return [];
    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});
    if (!pages[0]?.images) return [];

    const noiseKeywords = ['flag', 'map', 'logo', 'icon', 'portal', 'shield', 'stub', 'wikimedia-logo', 'location', 'red pog', 'blank', 'seal'];
    return pages[0].images
      .map(img => img.title)
      .filter(title => {
        const lower = title.toLowerCase();
        return /\.(jpg|jpeg|png)$/i.test(lower) && !noiseKeywords.some(k => lower.includes(k));
      })
      .slice(0, limit);
  } catch (err) {
    return [];
  }
};

// Get direct image URL from file name
const getDirectUrl = async (fileName) => {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=${encodeURIComponent(fileName)}&iiprop=url&origin=*`;
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) return null;
    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});
    return pages[0]?.imageinfo?.[0]?.url || null;
  } catch (err) {
    return null;
  }
};

// Download with custom User-Agent, compress and upload as base64 to Cloudinary
const uploadToCloudinary = async (imgUrl) => {
  if (!imgUrl?.startsWith('http')) return null;
  try {
    const response = await fetch(imgUrl, { headers: { 'User-Agent': USER_AGENT } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Check content-length to skip files > 8MB
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    if (contentLength > 8 * 1024 * 1024) {
      console.log(`  ⏭️ Skipping large file (${Math.round(contentLength / 1024 / 1024)}MB): ${imgUrl.split('/').pop().slice(0,40)}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const actualSize = buffer.byteLength;
    if (actualSize > 9 * 1024 * 1024) {
      console.log(`  ⏭️ Skipping large file (${Math.round(actualSize / 1024 / 1024)}MB)`);
      return null;
    }

    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    const res = await cloudinary.uploader.upload(dataUrl, {
      folder: 'culturequest/destinations',
      resource_type: 'image',
      quality: 'auto:good',
      fetch_format: 'auto'
    });
    return res.secure_url;
  } catch (err) {
    console.warn(`  ⚠️ Upload failed: ${err.message}`);
    return null;
  }
};

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    const destinations = await Destination.find({});
    console.log(`📌 Found ${destinations.length} destinations.\n`);

    for (const dest of destinations) {
      const key = dest.name.toLowerCase().trim();
      const pages = LANDMARK_PAGES[key];
      if (!pages) { console.log(`⏭️  Skipping "${dest.name}"`); continue; }

      console.log(`\n🏛️  Processing "${dest.name}" → pages: ${pages.join(', ')}`);

      let allFiles = [];

      // Gather images from multiple Wikipedia pages
      for (const pageTitle of pages) {
        await new Promise(r => setTimeout(r, 500));
        const files = await getWikiImages(pageTitle, 4);
        allFiles = [...allFiles, ...files.map(f => ({ file: f, page: pageTitle }))];
        if (allFiles.length >= 8) break; // stop early if we have enough
      }

      // Deduplicate by file name
      const seen = new Set();
      allFiles = allFiles.filter(({ file }) => {
        if (seen.has(file)) return false;
        seen.add(file);
        return true;
      }).slice(0, 8); // max 8 candidates

      console.log(`  Found ${allFiles.length} candidate images. Uploading to Cloudinary...`);

      const uploadedUrls = [];
      for (const { file } of allFiles) {
        await new Promise(r => setTimeout(r, 700));
        const rawUrl = await getDirectUrl(file);
        if (!rawUrl) continue;

        const cloudUrl = await uploadToCloudinary(rawUrl);
        if (cloudUrl) {
          console.log(`  ✅ ${file.replace('File:', '').slice(0, 50)}`);
          uploadedUrls.push(cloudUrl);
          if (uploadedUrls.length >= 6) break; // stop once we have 6
        }
      }

      if (uploadedUrls.length > 0) {
        dest.coverImage = uploadedUrls[0];
        dest.images  = uploadedUrls;
        dest.gallery = uploadedUrls;
        await dest.save();
        console.log(`  💾 Saved! Gallery: ${uploadedUrls.length} images | Cover: ${uploadedUrls[0].slice(0, 50)}...`);
      } else {
        console.log(`  ❌ No images uploaded for "${dest.name}"`);
      }

      await new Promise(r => setTimeout(r, 1500));
    }

    console.log('\n🎉 All destinations updated with 5-6 Cloudinary gallery images!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB disconnected.');
  }
};

runMigration();
