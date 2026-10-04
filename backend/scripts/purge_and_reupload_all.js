const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Accurate iconic landmark image URLs (High-res Unsplash direct CDNs with optimal parameters)
const DESTINATION_LANDMARKS = {
  'indore': {
    landmark: 'Rajwada Palace, Indore (7-Story Holkar Palace)',
    url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85'
  },
  'ujjain': {
    landmark: 'Shree Mahakaleshwar Temple & Mahakal Lok, Ujjain',
    url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85'
  },
  'agra': {
    landmark: 'Taj Mahal & Agra Fort, Agra',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85'
  },
  'taj-mahal': {
    landmark: 'Taj Mahal Front Reflection Pool, Agra',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85'
  },
  'varanasi': {
    landmark: 'Kashi Vishwanath & Varanasi Ganga Ghats Evening Aarti',
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1600&q=85'
  },
  'delhi': {
    landmark: 'India Gate & Red Fort, New Delhi',
    url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1597040663450-4d43615d8f63?auto=format&fit=crop&w=1600&q=85'
  },
  'gwalior': {
    landmark: 'Gwalior Fort (Man Mandir Palace)',
    url: 'https://images.unsplash.com/photo-1606298246186-08868ab77562?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85'
  },
  'bhopal': {
    landmark: 'Upper Lake (Bada Talab) & VIP Road, Bhopal',
    url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  },
  'omkareshwar': {
    landmark: 'Omkareshwar Jyotirlinga Temple on Mandhata Island',
    url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=85'
  },
  'mathura': {
    landmark: 'Shri Krishna Janmabhoomi Temple Complex, Mathura',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1600&q=85'
  },
  'vrindavan': {
    landmark: 'Prem Mandir & Banke Bihari, Vrindavan',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85'
  },
  'gokul': {
    landmark: 'Raman Reti & Gokul Temple Dham',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=85'
  },
  'kedarnath': {
    landmark: 'Kedarnath Temple with snow Himalayan background',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85'
  },
  'manali': {
    landmark: 'Solang Valley & Rohtang Snow Mountains, Manali',
    url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85'
  },
  'mussoorie': {
    landmark: 'Mussoorie Hills & Gun Hill Valley',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85'
  },
  'kasol': {
    landmark: 'Parvati Valley & Pine Mountains River, Kasol',
    url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  },
  'goa': {
    landmark: 'Goa Golden Beaches & Coastal Palm Shores',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85'
  },
  'bangalore': {
    landmark: 'Bangalore Palace & Vidhana Soudha, Bengaluru',
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85'
  },
  'chennai': {
    landmark: 'Kapaleeshwarar Temple Gopuram, Chennai',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=85'
  },
  'tamil-nadu': {
    landmark: 'Meenakshi Amman & Mahabalipuram Shore Temple',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1600&q=85'
  },
  'nagaland': {
    landmark: 'Dzukou Valley & Hornbill Heritage, Nagaland',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85'
  },
  'bali': {
    landmark: 'Ulun Danu Beratan Temple & Tanah Lot, Bali',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1600&q=85'
  },
  'phuket': {
    landmark: 'Maya Bay & Phi Phi Islands, Phuket',
    url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85'
  },
  'new-york': {
    landmark: 'Manhattan Skyline & Empire State Building, NYC',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=85'
  },
  'new-york-city': {
    landmark: 'New York City Skyline & Central Park View',
    url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=85'
  },
  'new-zealand': {
    landmark: 'Milford Sound Fiordland Peaks, New Zealand',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  },
  'greenland': {
    landmark: 'Ilulissat Icebergs & Nuuk Fjord, Greenland',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85'
  },
  'spiti': {
    landmark: 'Key Monastery & Spiti Valley Mountain Heights',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85'
  },
  'chhattisgarh': {
    landmark: 'Chitrakote Waterfalls, Bastar (Niagara of India)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85'
  },
  'gayaji': {
    landmark: 'Mahabodhi & Vishnupad Temple Heritage, Gaya',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=85'
  },
  'budapest-street-art': {
    landmark: 'Budapest Ruin Bars & Historic Architecture',
    url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=85'
  },
  'destination': {
    landmark: 'Scenic Global Cultural Heritage Discovery',
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  }
};

async function purgeAllCloudinaryResources() {
  console.log('=== STEP 1: Deleting ALL existing resources from Cloudinary ===');
  let nextCursor = null;
  let totalDeleted = 0;

  do {
    try {
      const res = await cloudinary.api.resources({
        max_results: 100,
        next_cursor: nextCursor,
        type: 'upload'
      });

      if (res.resources && res.resources.length > 0) {
        const publicIds = res.resources.map(r => r.public_id);
        console.log(`Deleting batch of ${publicIds.length} assets...`);
        const delRes = await cloudinary.api.delete_resources(publicIds);
        totalDeleted += publicIds.length;
        console.log(`Deleted batch results:`, delRes.deleted);
      }

      nextCursor = res.next_cursor;
    } catch (err) {
      console.error('Error in deletion batch:', err.message);
      break;
    }
  } while (nextCursor);

  console.log(`Total Cloudinary assets deleted: ${totalDeleted}`);
}

async function uploadAndSyncDestinations() {
  console.log('=== STEP 2: Re-uploading authentic iconic images and syncing DB ===');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB database');

  const collection = mongoose.connection.collection('destinations');
  const dests = await collection.find({}).toArray();
  console.log(`Found ${dests.length} destinations in DB to update`);

  let successCount = 0;
  for (const d of dests) {
    const slug = d.slug || (d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'dest');
    const mapping = DESTINATION_LANDMARKS[slug] || DESTINATION_LANDMARKS[d.name?.toLowerCase()] || DESTINATION_LANDMARKS['destination'];

    console.log(`\nProcessing: [${d.name}] (${slug})`);
    console.log(`Target Landmark: ${mapping.landmark}`);

    let uploadedUrl = null;
    try {
      const uploadRes = await cloudinary.uploader.upload(mapping.url, {
        folder: 'culturequest/destinations',
        public_id: `${slug}_cover`,
        overwrite: true,
        resource_type: 'image'
      });
      uploadedUrl = uploadRes.secure_url;
      console.log(`=> Uploaded: ${uploadedUrl}`);
    } catch (err) {
      console.warn(`Primary failed for ${slug} (${err.message}). Trying fallback...`);
      try {
        const fallbackRes = await cloudinary.uploader.upload(mapping.fallbackUrl, {
          folder: 'culturequest/destinations',
          public_id: `${slug}_cover`,
          overwrite: true,
          resource_type: 'image'
        });
        uploadedUrl = fallbackRes.secure_url;
        console.log(`=> Fallback Uploaded: ${uploadedUrl}`);
      } catch (fbErr) {
        console.error(`Fallback failed for ${slug}: ${fbErr.message}`);
      }
    }

    if (uploadedUrl) {
      await collection.updateOne(
        { _id: d._id },
        { $set: { coverImage: uploadedUrl } }
      );
      successCount++;
    }
  }

  console.log(`\n========================================`);
  console.log(`Successfully processed ${successCount}/${dests.length} destinations!`);
  console.log(`========================================`);
  process.exit(0);
}

async function main() {
  try {
    await purgeAllCloudinaryResources();
    await uploadAndSyncDestinations();
  } catch (err) {
    console.error('Fatal execution error:', err);
    process.exit(1);
  }
}

main();
