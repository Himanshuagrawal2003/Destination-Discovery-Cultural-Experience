require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');

// ─── Curated landmark-specific images for each destination ───────────────────
const LANDMARK_IMAGES = {
  'varanasi': {
    cover: 'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=900&q=80',
      'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=900&q=80',
      'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=900&q=80',
    ]
  },
  'indore': {
    // Rajwada Palace / Sarafa Bazaar style
    cover: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=80',
      'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=900&q=80',
    ]
  },
  'gwalior': {
    // Gwalior Fort
    cover: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=80',
    ]
  },
  'tamil nadu': {
    // Meenakshi Amman Temple
    cover: 'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=80',
    ]
  },
  'mathura': {
    // Krishna Janmabhoomi / Dwarkadhish
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=900&q=80',
    ]
  },
  'vrindavan': {
    // ISKCON / Prem Mandir
    cover: 'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=900&q=80',
    ]
  },
  'delhi': {
    // India Gate / Red Fort
    cover: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=900&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&q=80',
    ]
  },
  'chennai': {
    // Marina Beach / Kapaleeshwarar Temple
    cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=900&q=80',
    ]
  },
  'bangalore': {
    // Lalbagh / Vidhana Soudha
    cover: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=900&q=80',
      'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=900&q=80',
    ]
  },
  'nagaland': {
    // Hornbill Festival / tribal culture
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80',
    ]
  },
  'budapest street art': {
    // Budapest colorful street art
    cover: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?w=900&q=80',
    ]
  },
  'manali': {
    // Rohtang Pass / Solang Valley snow
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
      'https://images.unsplash.com/photo-1592890288564-76628a30a657?w=900&q=80',
    ]
  },
  'bali': {
    // Tanah Lot / Tegalalang rice terrace
    cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=900&q=80',
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=900&q=80',
    ]
  },
  'bhopal': {
    // Upper Lake / Sanchi style
    cover: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&q=80',
    ]
  },
  'omkareshwar': {
    // Omkareshwar Jyotirlinga island temple
    cover: 'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=900&q=80',
    ]
  },
  'ujjain': {
    // Mahakal temple / Kshipra ghat
    cover: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=900&q=80',
    ]
  },
  'gokul': {
    // Krishna birthplace / Nandgaon
    cover: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=900&q=80',
    ]
  },
  'goa': {
    // Baga beach / Basilica of Bom Jesus
    cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80',
    ]
  },
  'greenland': {
    // Ilulissat Icefjord / Northern Lights
    cover: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=900&q=80',
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=900&q=80',
    ]
  },
};

// ─── Upload to Cloudinary ─────────────────────────────────────────────────────
const uploadToCloudinary = async (url) => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'culturequest/destinations',
      fetch_format: 'auto',
      quality: 'auto:good',
    });
    return result.secure_url;
  } catch (err) {
    console.error('  ❌ Cloudinary upload failed:', err.message, '— using original URL');
    return url;
  }
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const fixImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected!\n');

    const destinations = await Destination.find({});
    console.log(`📌 Found ${destinations.length} destinations.\n`);

    let fixed = 0, skipped = 0;

    for (const dest of destinations) {
      const key = dest.name.toLowerCase().trim();
      const mapping = LANDMARK_IMAGES[key];

      if (!mapping) {
        console.log(`⏭️  No landmark mapping for "${dest.name}" — skipping.`);
        skipped++;
        continue;
      }

      console.log(`🏛️  Fixing "${dest.name}"...`);

      // Upload cover to Cloudinary
      console.log(`   📤 Uploading cover...`);
      const finalCover = await uploadToCloudinary(mapping.cover);
      console.log(`   ✅ Cover: ${finalCover.slice(0, 60)}...`);

      // Upload gallery images
      const finalGallery = [];
      if (mapping.gallery && mapping.gallery.length > 0) {
        console.log(`   📤 Uploading ${mapping.gallery.length} gallery images...`);
        for (const imgUrl of mapping.gallery) {
          await new Promise(r => setTimeout(r, 400));
          const uploaded = await uploadToCloudinary(imgUrl);
          finalGallery.push(uploaded);
        }
      }

      // Save to DB
      const freshDest = await Destination.findById(dest._id);
      if (freshDest) {
        freshDest.coverImage = finalCover;
        if (finalGallery.length > 0) {
          freshDest.images  = finalGallery;
          freshDest.gallery = finalGallery;
        }
        await freshDest.save();
        console.log(`   💾 Saved "${dest.name}" successfully!\n`);
        fixed++;
      }

      // Throttle between destinations
      await new Promise(r => setTimeout(r, 600));
    }

    console.log(`\n========================================`);
    console.log(`🎉 Done! Fixed: ${fixed} | Skipped: ${skipped}`);
  } catch (err) {
    console.error('❌ Script failed:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

fixImages();
