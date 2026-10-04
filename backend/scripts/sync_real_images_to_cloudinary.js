const https = require('https');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to fetch with proper User-Agent
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CultureQuest/1.0 (contact@culturequest.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// Helper to get image from Wikipedia API
async function getWikiImageUrl(wikiTitle) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const data = await fetchBuffer(url);
    const json = JSON.parse(data.toString());
    // prefer 1200px thumbnail or original
    if (json.originalimage && json.originalimage.source) {
      return json.originalimage.source;
    }
    if (json.thumbnail && json.thumbnail.source) {
      return json.thumbnail.source;
    }
    return null;
  } catch (err) {
    console.warn(`Wiki fetch failed for ${wikiTitle}:`, err.message);
    return null;
  }
}

// Upload buffer directly to Cloudinary
function uploadToCloudinary(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image'
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// Mapping of Destination Slugs -> Real Wikipedia landmark articles
const destinationLandmarks = {
  'indore': {
    cover: 'Rajwada',
    gallery: ['Rajwada', 'Lal_Bagh_Palace', 'Khajrana_Ganesh_Temple']
  },
  'gwalior': {
    cover: 'Gwalior_Fort',
    gallery: ['Gwalior_Fort', 'Jai_Vilas_Mahal', 'Sas_Bahu_Temples,_Gwalior']
  },
  'ujjain': {
    cover: 'Mahakaleshwar_Jyotirlinga',
    gallery: ['Mahakaleshwar_Jyotirlinga', 'Ram_Ghat,_Ujjain', 'Kal_Bhairav_Temple,_Ujjain']
  },
  'omkareshwar': {
    cover: 'Omkareshwar_Temple',
    gallery: ['Omkareshwar_Temple', 'Narmada_River', 'Mamleshwar_temple']
  },
  'bhopal': {
    cover: 'Taj-ul-Masajid',
    gallery: ['Taj-ul-Masajid', 'Bhojeshwar_Temple', 'Upper_Lake_(Bhopal)']
  },
  'agra': {
    cover: 'Taj_Mahal',
    gallery: ['Taj_Mahal', 'Agra_Fort', 'Fatehpur_Sikri']
  },
  'taj-mahal': {
    cover: 'Taj_Mahal',
    gallery: ['Taj_Mahal', 'Mehtab_Bagh', 'Agra_Fort']
  },
  'mathura': {
    cover: 'Krishna_Janmasthan_Temple_Complex',
    gallery: ['Krishna_Janmasthan_Temple_Complex', 'Dwarkadhish_Temple,_Mathura', 'Vishram_Ghat']
  },
  'vrindavan': {
    cover: 'Prem_Mandir,_Vrindavan',
    gallery: ['Prem_Mandir,_Vrindavan', 'Bankey_Bihari_Temple', 'ISKCON_Temple_Vrindavan']
  },
  'gokul': {
    cover: 'Gokul',
    gallery: ['Gokul', 'Nanda_Maharaj_Temple', 'Brahmand_Ghat']
  },
  'delhi': {
    cover: 'India_Gate',
    gallery: ['India_Gate', 'Red_Fort', 'Humayun\'s_Tomb']
  },
  'varanasi': {
    cover: 'Dashashwamedh_Ghat',
    gallery: ['Dashashwamedh_Ghat', 'Kashi_Vishwanath_Temple', 'Manikarnika_Ghat']
  },
  'kedarnath': {
    cover: 'Kedarnath_Temple',
    gallery: ['Kedarnath_Temple', 'Mandakini_River', 'Chorabari_Glacier']
  },
  'manali': {
    cover: 'Solang_Valley',
    gallery: ['Solang_Valley', 'Hadimba_Temple', 'Rohtang_Pass']
  },
  'mussoorie': {
    cover: 'Kempty_Falls',
    gallery: ['Kempty_Falls', 'Gun_Hill,_Mussoorie', 'Lal_Tibba']
  },
  'kasol': {
    cover: 'Parvati_Valley',
    gallery: ['Parvati_Valley', 'Manikaran', 'Tosh,_Himachal_Pradesh']
  },
  'spiti': {
    cover: 'Key_Monastery',
    gallery: ['Key_Monastery', 'Spiti_Valley', 'Chandratal']
  },
  'chennai': {
    cover: 'Kapaleeshwarar_Temple',
    gallery: ['Kapaleeshwarar_Temple', 'Marina_Beach', 'San_Thome_Basilica']
  },
  'tamil-nadu': {
    cover: 'Meenakshi_Temple',
    gallery: ['Meenakshi_Temple', 'Shore_Temple', 'Brihadisvara_Temple,_Thanjavur']
  },
  'bangalore': {
    cover: 'Bangalore_Palace',
    gallery: ['Bangalore_Palace', 'Vidhana_Soudha', 'Lalbagh_Botanical_Garden']
  },
  'goa': {
    cover: 'Palolem_Beach',
    gallery: ['Palolem_Beach', 'Basilica_of_Bom_Jesus', 'Dudhsagar_Falls']
  },
  'udaipur': {
    cover: 'City_Palace,_Udaipur',
    gallery: ['City_Palace,_Udaipur', 'Lake_Pichola', 'Jag_Mandir']
  },
  'manipur': {
    cover: 'Loktak_Lake',
    gallery: ['Loktak_Lake', 'Kangla_Fort', 'Keibul_Lamjao_National_Park']
  },
  'nagaland': {
    cover: 'Dzükou_Valley',
    gallery: ['Dzükou_Valley', 'Kohima_War_Cemetery', 'Hornbill_Festival']
  },
  'chhattisgarh': {
    cover: 'Chitrakote_Falls',
    gallery: ['Chitrakote_Falls', 'Bastar_palace', 'Tirathgarh_Falls']
  },
  'gayaji': {
    cover: 'Mahabodhi_Temple',
    gallery: ['Mahabodhi_Temple', 'Vishnupad_Temple,_Gaya', 'Bodh_Gaya']
  },
  'bali': {
    cover: 'Ulun_Danu_Beratan_Temple',
    gallery: ['Ulun_Danu_Beratan_Temple', 'Tanah_Lot', 'Ubud_Monkey_Forest']
  },
  'phuket': {
    cover: 'Phi_Phi_Islands',
    gallery: ['Phi_Phi_Islands', 'Phang_Nga_Bay', 'Big_Buddha,_Phuket']
  },
  'new-york': {
    cover: 'Manhattan',
    gallery: ['Manhattan', 'Central_Park', 'Statue_of_Liberty']
  },
  'new-york-city': {
    cover: 'Times_Square',
    gallery: ['Times_Square', 'Brooklyn_Bridge', 'Empire_State_Building']
  },
  'new-zealand': {
    cover: 'Milford_Sound',
    gallery: ['Milford_Sound', 'Aoraki_/_Mount_Cook', 'Rotorua']
  },
  'greenland': {
    cover: 'Ilulissat_Icefjord',
    gallery: ['Ilulissat_Icefjord', 'Nuuk', 'Disko_Island']
  },
  'budapest-street-art': {
    cover: 'Hungarian_Parliament_Building',
    gallery: ['Hungarian_Parliament_Building', 'Buda_Castle', 'Széchenyi_thermal_bath']
  },
  'destination': {
    cover: 'Hampi',
    gallery: ['Hampi', 'Ellora_Caves', 'Ajanta_Caves']
  }
};

// Real Event Landmark Mapping
const eventLandmarks = [
  { match: /Mahashivratri/i, wiki: 'Mahakaleshwar_Jyotirlinga', folder: 'events/ujjain' },
  { match: /Dev Deepawali/i, wiki: 'Dev_Deepawali_(Varanasi)', folder: 'events/varanasi' },
  { match: /Braj Lathmar|Holi/i, wiki: 'Lathmar_Holi', folder: 'events/braj' },
  { match: /Rangpanchami|Gair/i, wiki: 'Rajwada', folder: 'events/indore' },
  { match: /Hornbill/i, wiki: 'Hornbill_Festival', folder: 'events/nagaland' },
  { match: /Goa.*Carnival/i, wiki: 'Goa_Carnival', folder: 'events/goa' },
  { match: /Taj Mahotsav/i, wiki: 'Taj_Mahal', folder: 'events/agra' },
  { match: /Eid-ul-Fitr.*Taj/i, wiki: 'Taj_Mahal', folder: 'events/agra' },
  { match: /Uttarayan|Kite/i, wiki: 'International_Kite_Festival_in_Gujarat_–_Uttarayan', folder: 'events/gujarat' },
  { match: /Agra Food|Mughal Food/i, wiki: 'Mughal_cuisine', folder: 'events/agra' },
  { match: /Shivratri at Mankameshwar/i, wiki: 'Agra_Fort', folder: 'events/agra' },
  { match: /Mughal Heritage/i, wiki: 'Fatehpur_Sikri', folder: 'events/agra' },
  { match: /Agra Handicrafts/i, wiki: 'Agra_Fort', folder: 'events/agra' },
  { match: /Moti Masjid/i, wiki: 'Moti_Masjid_(Agra_Fort)', folder: 'events/agra' },
  { match: /Mewar Festival/i, wiki: 'City_Palace,_Udaipur', folder: 'events/udaipur' },
  { match: /Shilpgram/i, wiki: 'Shilpgram,_Udaipur', folder: 'events/udaipur' },
  { match: /Gangaur/i, wiki: 'Gangaur', folder: 'events/rajasthan' },
  { match: /Matariki/i, wiki: 'Matariki', folder: 'events/new-zealand' },
  { match: /Auckland Lantern/i, wiki: 'Auckland_Lantern_Festival', folder: 'events/auckland' },
  { match: /Christchurch/i, wiki: 'Christchurch', folder: 'events/christchurch' },
  { match: /Pasifika/i, wiki: 'Pasifika_Festival', folder: 'events/auckland' },
  { match: /WearableArt|WOW/i, wiki: 'World_of_WearableArt', folder: 'events/new-zealand' },
  { match: /Yaoshang/i, wiki: 'Yaoshang', folder: 'events/manipur' },
  { match: /Lai Haraoba/i, wiki: 'Lai_Haraoba', folder: 'events/manipur' },
  { match: /Sangai/i, wiki: 'Sangai_festival', folder: 'events/manipur' }
];

async function syncAllRealImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB. Starting 100% Real Image Synchronization...');

  const destCollection = mongoose.connection.db.collection('destinations');
  const eventCollection = mongoose.connection.db.collection('events');

  const dests = await destCollection.find({}).toArray();
  console.log(`Processing ${dests.length} Destinations...`);

  for (const dest of dests) {
    const slug = dest.slug || dest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const mapping = destinationLandmarks[slug] || {
      cover: dest.name,
      gallery: [dest.name]
    };

    console.log(`\n========================================`);
    console.log(`Destination: ${dest.name} (${slug})`);
    console.log(`Cover Landmark: ${mapping.cover}`);

    let updatedCover = null;
    let updatedGallery = [];

    // 1. Process Cover Image
    try {
      const coverImgUrl = await getWikiImageUrl(mapping.cover);
      if (coverImgUrl) {
        console.log(`Downloading real cover photo for ${mapping.cover} from ${coverImgUrl.slice(0, 60)}...`);
        const coverBuf = await fetchBuffer(coverImgUrl);
        const folder = `culturequest/destinations/${slug}`;
        const pubId = `${slug}_cover_real`;
        const res = await uploadToCloudinary(coverBuf, folder, pubId);
        updatedCover = res.secure_url;
        console.log(`✔ Cover uploaded to Cloudinary: ${updatedCover}`);
      } else {
        console.warn(`No wiki image found for ${mapping.cover}`);
      }
    } catch (err) {
      console.error(`Error uploading cover for ${slug}:`, err.message);
    }

    // 2. Process Gallery Images
    for (let i = 0; i < mapping.gallery.length; i++) {
      const gItem = mapping.gallery[i];
      try {
        const gUrl = await getWikiImageUrl(gItem);
        if (gUrl) {
          console.log(`Downloading real gallery photo for ${gItem}...`);
          const gBuf = await fetchBuffer(gUrl);
          const folder = `culturequest/destinations/${slug}/gallery`;
          const pubId = `${slug}_gallery_${i + 1}_real`;
          const gRes = await uploadToCloudinary(gBuf, folder, pubId);
          updatedGallery.push(gRes.secure_url);
          console.log(`✔ Gallery ${i + 1} uploaded: ${gRes.secure_url}`);
        }
      } catch (err) {
        console.error(`Error uploading gallery ${gItem}:`, err.message);
      }
    }

    // Update MongoDB
    const updateDoc = {};
    if (updatedCover) updateDoc.coverImage = updatedCover;
    if (updatedGallery.length > 0) updateDoc.gallery = updatedGallery;

    if (Object.keys(updateDoc).length > 0) {
      await destCollection.updateOne({ _id: dest._id }, { $set: updateDoc });
      console.log(`✔ MongoDB updated for destination: ${dest.name}`);
    }
  }

  // 3. Process Events
  console.log(`\n========================================`);
  console.log(`Processing Events with Real Photos...`);
  const events = await eventCollection.find({}).toArray();

  for (const ev of events) {
    const matchRule = eventLandmarks.find(r => r.match.test(ev.title));
    const wikiQuery = matchRule ? matchRule.wiki : ev.title;
    const folder = matchRule ? `culturequest/${matchRule.folder}` : 'culturequest/events';

    console.log(`\nEvent: ${ev.title} -> Wiki: ${wikiQuery}`);
    try {
      const imgUrl = await getWikiImageUrl(wikiQuery);
      if (imgUrl) {
        console.log(`Downloading real event photo for ${wikiQuery}...`);
        const buf = await fetchBuffer(imgUrl);
        const evSlug = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
        const res = await uploadToCloudinary(buf, folder, `${evSlug}_real`);
        console.log(`✔ Event photo uploaded: ${res.secure_url}`);
        await eventCollection.updateOne({ _id: ev._id }, { $set: { image: res.secure_url } });
      }
    } catch (err) {
      console.error(`Error processing event ${ev.title}:`, err.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 ALL REAL IMAGES DOWNLOADED & SYNCED TO CLOUDINARY & MONGO!`);
  process.exit(0);
}

syncAllRealImages().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
