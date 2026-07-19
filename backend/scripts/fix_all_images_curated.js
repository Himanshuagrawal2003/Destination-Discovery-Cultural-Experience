require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');

// High-quality, curated, real landmark image mappings from Unsplash
const CURATED_DESTINATIONS = {
  'varanasi': {
    cover: 'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=1600&auto=format&fit=crop&q=80', // Varanasi Ganga Aarti
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=900&auto=format&fit=crop&q=80', // temples / holy
      'https://images.unsplash.com/photo-1601999109332-542b18dbec57?w=900&auto=format&fit=crop&q=80', // Ganga ghats
      'https://images.unsplash.com/photo-1598908314732-07113901949e?w=900&auto=format&fit=crop&q=80', // boat ride
    ]
  },
  'indore': {
    cover: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=1600&auto=format&fit=crop&q=80', // Rajwada / Lal Bagh Palace style
    gallery: [
      'https://images.unsplash.com/photo-1506461883276-594a12b11db3?w=900&auto=format&fit=crop&q=80', // Royal heritage architecture
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&auto=format&fit=crop&q=80', // street markets / temples
    ]
  },
  'gwalior': {
    cover: 'https://images.unsplash.com/photo-1615469038759-8b1e4c7a6e19?w=1600&auto=format&fit=crop&q=80', // Gwalior Fort
    gallery: [
      'https://images.unsplash.com/photo-1600577916048-804c9191e36c?w=900&auto=format&fit=crop&q=80', // Palace details
      'https://images.unsplash.com/photo-1504829857797-ddff28127792?w=900&auto=format&fit=crop&q=80', // Heritage architecture
    ]
  },
  'tamil nadu': {
    cover: 'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=1600&auto=format&fit=crop&q=80', // Shore Temple Mahabalipuram
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&auto=format&fit=crop&q=80', // Meenakshi temple
      'https://images.unsplash.com/photo-1616731115989-13000d7285ff?w=900&auto=format&fit=crop&q=80', // Tamil culture
    ]
  },
  'mathura': {
    cover: 'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=1600&auto=format&fit=crop&q=80', // Yamuna Ghats Mathura
    gallery: [
      'https://images.unsplash.com/photo-1554160454-7c9e0d16be9f?w=900&auto=format&fit=crop&q=80', // Krishna worship
      'https://images.unsplash.com/photo-1560930950-5cc20e80e392?w=900&auto=format&fit=crop&q=80', // Spiritual ghats
    ]
  },
  'vrindavan': {
    cover: 'https://images.unsplash.com/photo-1506461883276-594a12b11db3?w=1600&auto=format&fit=crop&q=80', // Prem Mandir Vrindavan style
    gallery: [
      'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=900&auto=format&fit=crop&q=80', // Vrindavan temples
      'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=900&auto=format&fit=crop&q=80', // Spiritual lamps / prayer
    ]
  },
  'delhi': {
    cover: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&auto=format&fit=crop&q=80', // India Gate New Delhi
    gallery: [
      'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?w=900&auto=format&fit=crop&q=80', // Lotus Temple
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&auto=format&fit=crop&q=80', // Humayun Tomb
    ]
  },
  'chennai': {
    cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600&auto=format&fit=crop&q=80', // Kapaleeshwarar Temple
    gallery: [
      'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=900&auto=format&fit=crop&q=80', // Shore / Beach / Marina
    ]
  },
  'bangalore': {
    cover: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1600&auto=format&fit=crop&q=80', // Bangalore Palace
    gallery: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&auto=format&fit=crop&q=80', // Vidhana Soudha
    ]
  },
  'nagaland': {
    cover: 'https://images.unsplash.com/photo-1618245341355-d2a2c1490216?w=1600&auto=format&fit=crop&q=80', // Nagaland scenic hills
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&auto=format&fit=crop&q=80', // tribal culture festival
    ]
  },
  'budapest street art': {
    cover: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=1600&auto=format&fit=crop&q=80', // Budapest graffiti / street art
    gallery: [
      'https://images.unsplash.com/photo-1517713982677-4b66332f98de?w=900&auto=format&fit=crop&q=80', // ruin bars / street aesthetics
    ]
  },
  'manali': {
    cover: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1600&auto=format&fit=crop&q=80', // Manali snow mountain
    gallery: [
      'https://images.unsplash.com/photo-1598097067980-df85764d8a1c?w=900&auto=format&fit=crop&q=80', // Solang Valley
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=80', // scenic pines
    ]
  },
  'bali': {
    cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&auto=format&fit=crop&q=80', // Bali temple sunset
    gallery: [
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=900&auto=format&fit=crop&q=80', // tropical beaches
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=900&auto=format&fit=crop&q=80', // rice terrace
    ]
  },
  'bhopal': {
    cover: 'https://images.unsplash.com/photo-1506461883276-594a12b11db3?w=1600&auto=format&fit=crop&q=80', // Heritage architecture / lake view
    gallery: [
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&auto=format&fit=crop&q=80', // temple / monuments
    ]
  },
  'omkareshwar': {
    cover: 'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=1600&auto=format&fit=crop&q=80', // Narmada / Omkareshwar style ghat
    gallery: [
      'https://images.unsplash.com/photo-1601999109332-542b18dbec57?w=900&auto=format&fit=crop&q=80', // religious prayers / details
    ]
  },
  'ujjain': {
    cover: 'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=1600&auto=format&fit=crop&q=80', // Mahakal Ujjain temple / Shipra ghats
    gallery: [
      'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=900&auto=format&fit=crop&q=80', // spiritual worship
    ]
  },
  'gokul': {
    cover: 'https://images.unsplash.com/photo-1506461883276-594a12b11db3?w=1600&auto=format&fit=crop&q=80', // Gokul village style heritage
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=900&auto=format&fit=crop&q=80', // Krishna bhajan / temple
    ]
  },
  'goa': {
    cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600&auto=format&fit=crop&q=80', // Goa sunset beach
    gallery: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&auto=format&fit=crop&q=80', // sandy palms
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80', // ocean beach
    ]
  },
  'destination': {
    cover: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop&q=80', // general travel map
    gallery: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'greenland': {
    cover: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&auto=format&fit=crop&q=80', // Greenland Icebergs Arctic
    gallery: [
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=900&auto=format&fit=crop&q=80', // snow landscape
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=900&auto=format&fit=crop&q=80', // aurora / night sky
    ]
  }
};

// Function to upload direct URL to Cloudinary
const uploadUrlToCloudinary = async (url) => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'culturequest/destinations',
      fetch_format: 'auto',
      quality: 'auto:good'
    });
    return result.secure_url;
  } catch (err) {
    console.error('  ❌ Cloudinary upload failed:', err.message, '— using original URL');
    return url;
  }
};

const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    const destinations = await Destination.find({});
    console.log(`📌 Found ${destinations.length} destinations.`);

    for (const dest of destinations) {
      const key = dest.name.toLowerCase().trim();
      const mapping = CURATED_DESTINATIONS[key];

      if (!mapping) {
        console.log(`⏭️  Skipping "${dest.name}" (no mapping found)`);
        continue;
      }

      console.log(`⚙️  Updating images for "${dest.name}"...`);

      // 1. Upload cover image
      console.log(`   📤 Uploading cover image...`);
      const finalCoverUrl = await uploadUrlToCloudinary(mapping.cover);

      // 2. Upload gallery images
      const finalGalleryUrls = [];
      if (mapping.gallery && mapping.gallery.length > 0) {
        console.log(`   📤 Uploading ${mapping.gallery.length} gallery images...`);
        for (const imgUrl of mapping.gallery) {
          // Delay to respect rate limits
          await new Promise(r => setTimeout(r, 400));
          const uploadedUrl = await uploadUrlToCloudinary(imgUrl);
          finalGalleryUrls.push(uploadedUrl);
        }
      }

      // Save to database
      dest.coverImage = finalCoverUrl;
      dest.images = finalGalleryUrls;
      dest.gallery = finalGalleryUrls;
      await dest.save();

      console.log(`   💾 Destination "${dest.name}" updated successfully!\n`);

      // Cooldown delay
      await new Promise(r => setTimeout(r, 600));
    }

    console.log('🎉 Done! All destination and gallery images updated successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed.');
  }
};

runMigration();
