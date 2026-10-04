const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ACCURATE_EVENTS = [
  {
    publicId: 'indore_rangpanchami_gair_event',
    title: 'Indore Rangpanchami Gair Heritage Carnival',
    city: 'Indore',
    // Genuine vibrant Holi/Rangpanchami gulal powder celebration in heritage square
    url: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?auto=format&fit=crop&w=1400&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1576487247299-e2e4b47f6cfb?auto=format&fit=crop&w=1400&q=85'
  },
  {
    publicId: 'nagaland_hornbill_festival_event',
    title: 'Hornbill Festival: Festival of Festivals, Nagaland',
    city: 'Nagaland',
    // Authentic traditional cultural tribal warrior dance and festival celebration
    url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=85'
  },
  {
    publicId: 'goa_carnival_cultural_event',
    title: 'Goa Sun, Sea & Cultural Carnival Parade',
    city: 'Goa',
    // Vibrant street carnival parade with colorful costumes and music celebration
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85'
  },
  {
    publicId: 'varanasi_dev_deepawali_event',
    title: 'Dev Deepawali: Festival of Lights on Ganga Ghats',
    city: 'Varanasi',
    // Millions of diyas & grand Ganga Aarti at Varanasi Ghats
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1400&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1400&q=85'
  },
  {
    publicId: 'mathura_vrindavan_holi_event',
    title: 'Braj Lathmar Holi & Phoolon Ki Holi Celebration',
    city: 'Mathura',
    // Sacred Holi flower celebration and gulal colors in Braj temples
    url: 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?auto=format&fit=crop&w=1400&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1400&q=85'
  },
  {
    publicId: 'ujjain_mahashivratri_event',
    title: 'Mahashivratri Grand Mahotsav & Bhasma Aarti',
    city: 'Ujjain',
    // Sacred temple lamps, Mahakal devotional festival night
    url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1400&q=85',
    fallbackUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1400&q=85'
  }
];

async function fixEvents() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const eventColl = mongoose.connection.collection('events');

  for (const item of ACCURATE_EVENTS) {
    console.log(`\nUploading accurate image for [${item.title}] (${item.city})...`);
    let finalUrl = '';
    try {
      const res = await cloudinary.uploader.upload(item.url, {
        folder: 'culturequest/events',
        public_id: item.publicId,
        overwrite: true,
        resource_type: 'image'
      });
      finalUrl = res.secure_url;
      console.log(`=> Success: ${finalUrl}`);
    } catch (err) {
      console.warn(`Primary failed (${err.message}), trying fallback...`);
      const fbRes = await cloudinary.uploader.upload(item.fallbackUrl, {
        folder: 'culturequest/events',
        public_id: item.publicId,
        overwrite: true,
        resource_type: 'image'
      });
      finalUrl = fbRes.secure_url;
      console.log(`=> Fallback Success: ${finalUrl}`);
    }

    const updateRes = await eventColl.updateMany(
      { $or: [{ title: item.title }, { 'location.city': item.city }] },
      { $set: { coverImage: finalUrl, images: [finalUrl] } }
    );
    console.log(`DB updated for ${item.title}: matched ${updateRes.matchedCount}`);
  }

  console.log('\nAll events have been fixed with accurate festival photos!');
  process.exit(0);
}

fixEvents().catch(err => {
  console.error(err);
  process.exit(1);
});
