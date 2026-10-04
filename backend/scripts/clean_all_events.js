const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const CURATED_EVENTS = [
  {
    title: 'Indore Rangpanchami Gair Heritage Carnival',
    type: 'cultural',
    description: 'A UNESCO-recognized historical street carnival where millions gather around Rajwada Palace with colorful water cannons, bullock carts with Gulal, and traditional folk troupes.',
    imageUrl: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?auto=format&fit=crop&w=1400&q=85',
    city: 'Indore',
    country: 'India',
    venue: 'Rajwada Square to Sarafa, Indore',
    publicId: 'indore_rangpanchami_gair_event',
    startDate: new Date('2026-03-30T09:00:00Z'),
    endDate: new Date('2026-03-30T17:00:00Z'),
    price: { isFree: true, amount: 0, currency: 'INR' },
    tags: ['Rangpanchami', 'Gair', 'Indore', 'Rajwada', 'Culture']
  },
  {
    title: 'Hornbill Festival: Festival of Festivals, Nagaland',
    type: 'traditional-performance',
    description: 'A 10-day celebration of Naga tribal culture, traditional warrior dances, indigenous crafts, archery competitions, and authentic Northeastern cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=85',
    city: 'Nagaland',
    country: 'India',
    venue: 'Naga Heritage Village, Kisama, Kohima',
    publicId: 'nagaland_hornbill_festival_event',
    startDate: new Date('2026-12-01T09:00:00Z'),
    endDate: new Date('2026-12-10T20:00:00Z'),
    price: { isFree: false, amount: 200, currency: 'INR' },
    tags: ['Hornbill', 'Nagaland', 'TribalHeritage', 'Dance', 'Northeast']
  },
  {
    title: 'Goa Sun, Sea & Cultural Carnival Parade',
    type: 'festival',
    description: 'Four days of dazzling float processions led by King Momo, street masquerades, vibrant samba rhythms, Goan fado singing, and seaside coastal culinary fairs.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85',
    city: 'Goa',
    country: 'India',
    venue: 'Panaji Riverfront & Miramar Beach, Goa',
    publicId: 'goa_carnival_cultural_event',
    startDate: new Date('2026-02-14T15:00:00Z'),
    endDate: new Date('2026-02-17T23:00:00Z'),
    price: { isFree: true, amount: 0, currency: 'INR' },
    tags: ['GoaCarnival', 'Goa', 'Beach', 'Parade', 'Music']
  },
  {
    title: 'Mahashivratri Grand Mahotsav & Bhasma Aarti',
    type: 'religious',
    description: 'Millions of devotees gather at the sacred Mahakaleshwar Jyotirlinga temple for continuous 44-hour worship, grand Shiv Barat processions, and deep spiritual celebrations on the banks of Shipra river.',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1400&q=85',
    city: 'Ujjain',
    country: 'India',
    venue: 'Shree Mahakaleshwar Temple & Mahakal Lok Corridor',
    publicId: 'ujjain_mahashivratri_event',
    startDate: new Date('2026-03-08T04:00:00Z'),
    endDate: new Date('2026-03-10T23:00:00Z'),
    price: { isFree: true, amount: 0, currency: 'INR' },
    tags: ['Mahashivratri', 'Mahakal', 'Ujjain', 'Jyotirlinga', 'Aarti']
  },
  {
    title: 'Dev Deepawali: Festival of Lights on Ganga Ghats',
    type: 'festival',
    description: 'Witness all 84 ghats of Varanasi illuminated with over 1.5 million oil lamps (diyas), accompanied by Vedic chanting, synchronized laser shows, and majestic Ganga Aarti on Kartik Purnima.',
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1400&q=85',
    city: 'Varanasi',
    country: 'India',
    venue: 'Dashashwamedh & Assi Ghats, Varanasi',
    publicId: 'varanasi_dev_deepawali_event',
    startDate: new Date('2026-11-24T17:00:00Z'),
    endDate: new Date('2026-11-25T23:00:00Z'),
    price: { isFree: true, amount: 0, currency: 'INR' },
    tags: ['DevDeepawali', 'Varanasi', 'GangaGhats', 'Diyas', 'Heritage']
  },
  {
    title: 'Braj Lathmar Holi & Phoolon Ki Holi Celebration',
    type: 'festival',
    description: 'Experience traditional Braj Holi with vibrant herbal colors, flower showers at Bankey Bihari temple, devotional Rasleela performances, and traditional folk dances.',
    imageUrl: 'https://images.unsplash.com/photo-1583083527882-4bee9aba2eea?auto=format&fit=crop&w=1400&q=85',
    city: 'Mathura',
    country: 'India',
    venue: 'Barsana & Prem Mandir, Mathura-Vrindavan',
    publicId: 'mathura_vrindavan_holi_event',
    startDate: new Date('2026-03-22T08:00:00Z'),
    endDate: new Date('2026-03-25T18:00:00Z'),
    price: { isFree: true, amount: 0, currency: 'INR' },
    tags: ['Holi', 'Braj', 'Mathura', 'Vrindavan', 'Krishna']
  },
  {
    title: 'Taj Mahotsav: 10-Day Art, Craft & Classical Music Fair',
    type: 'cultural',
    description: 'A grand 10-day cultural celebration near the eastern gate of Taj Mahal featuring classical Hindustani musicians, Mughal handicrafts, and culinary heritage from across India.',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1400&q=85',
    city: 'Agra',
    country: 'India',
    venue: 'Shilpgram, Eastern Gate, Taj Mahal, Agra',
    publicId: 'agra_taj_mahotsav_event',
    startDate: new Date('2026-02-18T10:00:00Z'),
    endDate: new Date('2026-02-27T22:00:00Z'),
    price: { isFree: false, amount: 50, currency: 'INR' },
    tags: ['TajMahotsav', 'Agra', 'TajMahal', 'Handicrafts', 'Culture']
  }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  const eventColl = mongoose.connection.collection('events');
  const userColl = mongoose.connection.collection('users');

  const adminUser = await userColl.findOne({});
  const defaultUserId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

  await eventColl.deleteMany({}); // clean out all old mismatched events
  console.log('Old events collection purged');

  for (const ev of CURATED_EVENTS) {
    console.log(`Processing [${ev.title}] (${ev.city})...`);
    let finalUrl = '';
    try {
      const res = await cloudinary.uploader.upload(ev.imageUrl, {
        folder: 'culturequest/events',
        public_id: ev.publicId,
        overwrite: true,
        resource_type: 'image'
      });
      finalUrl = res.secure_url;
      console.log(`=> Uploaded Cloudinary URL: ${finalUrl}`);
    } catch (err) {
      console.warn(`Upload err for ${ev.publicId}: ${err.message}`);
      finalUrl = ev.imageUrl;
    }

    await eventColl.insertOne({
      title: ev.title,
      type: ev.type,
      description: ev.description,
      coverImage: finalUrl,
      images: [finalUrl],
      startDate: ev.startDate,
      endDate: ev.endDate,
      time: '09:00 AM - 10:00 PM',
      location: {
        country: ev.country,
        city: ev.city,
        venue: ev.venue,
        address: `${ev.venue}, ${ev.city}`,
        lat: 0,
        lng: 0
      },
      price: ev.price,
      organizer: {
        name: `${ev.city} Cultural Tourism Department`,
        website: 'https://culturequest.travel',
        contact: '+91 1800 233 456'
      },
      tags: ev.tags,
      highlights: ['Traditional Rituals', 'Cultural Performances', 'Local Food Stalls', 'Photography Walks'],
      dressCode: 'Modest / Traditional attire recommended',
      culturalNote: 'Respect local customs, photography permits, and sanctum rules.',
      isActive: true,
      isFeatured: true,
      viewCount: 150,
      createdBy: defaultUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log('\nAll curated events have been inserted and linked to Cloudinary folder culturequest/events!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
