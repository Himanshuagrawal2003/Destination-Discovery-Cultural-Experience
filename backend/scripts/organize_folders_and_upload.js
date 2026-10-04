const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 1. Destination Covers Data
const DESTINATION_COVERS = {
  'indore': {
    landmark: 'Rajwada Palace, Indore',
    url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1600&q=85'
  },
  'ujjain': {
    landmark: 'Shree Mahakaleshwar Temple & Mahakal Lok, Ujjain',
    url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1600&q=85'
  },
  'agra': {
    landmark: 'Taj Mahal & Agra Fort, Agra',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85'
  },
  'taj-mahal': {
    landmark: 'Taj Mahal Front Reflection Pool, Agra',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85'
  },
  'varanasi': {
    landmark: 'Kashi Vishwanath & Ganga Ghats Evening Aarti',
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=85'
  },
  'delhi': {
    landmark: 'India Gate & Red Fort, New Delhi',
    url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=85'
  },
  'gwalior': {
    landmark: 'Gwalior Fort (Man Mandir Palace)',
    url: 'https://images.unsplash.com/photo-1606298246186-08868ab77562?auto=format&fit=crop&w=1600&q=85'
  },
  'bhopal': {
    landmark: 'Upper Lake (Bada Talab) & VIP Road, Bhopal',
    url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1600&q=85'
  },
  'omkareshwar': {
    landmark: 'Omkareshwar Jyotirlinga Temple & Narmada River',
    url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1600&q=85'
  },
  'mathura': {
    landmark: 'Shri Krishna Janmabhoomi Temple Complex, Mathura',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85'
  },
  'vrindavan': {
    landmark: 'Prem Mandir & Banke Bihari, Vrindavan',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85'
  },
  'gokul': {
    landmark: 'Raman Reti & Gokul Temple Dham',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85'
  },
  'kedarnath': {
    landmark: 'Kedarnath Temple with snow Himalayan background',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85'
  },
  'manali': {
    landmark: 'Solang Valley & Rohtang Snow Mountains, Manali',
    url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85'
  },
  'mussoorie': {
    landmark: 'Mussoorie Hills & Gun Hill Valley',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  },
  'kasol': {
    landmark: 'Parvati Valley River & Pine Forests',
    url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85'
  },
  'goa': {
    landmark: 'Goa Coastal Beaches & Palm Shores',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85'
  },
  'bangalore': {
    landmark: 'Bangalore Palace & Vidhana Soudha, Bengaluru',
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=85'
  },
  'chennai': {
    landmark: 'Kapaleeshwarar Temple Gopuram, Chennai',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85'
  },
  'tamil-nadu': {
    landmark: 'Meenakshi Amman & Mahabalipuram Shore Temple',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85'
  },
  'nagaland': {
    landmark: 'Dzukou Valley & Hornbill Heritage, Nagaland',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  },
  'bali': {
    landmark: 'Ulun Danu Beratan Temple & Tanah Lot, Bali',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85'
  },
  'phuket': {
    landmark: 'Maya Bay & Phi Phi Islands, Phuket',
    url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1600&q=85'
  },
  'new-york': {
    landmark: 'Manhattan Skyline & Empire State Building, NYC',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=85'
  },
  'new-york-city': {
    landmark: 'New York City Skyline & Central Park View',
    url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=85'
  },
  'new-zealand': {
    landmark: 'Milford Sound Fiordland Peaks, New Zealand',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85'
  },
  'greenland': {
    landmark: 'Ilulissat Icebergs & Nuuk Fjord, Greenland',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=85'
  },
  'spiti': {
    landmark: 'Key Monastery & Spiti Valley Mountain Heights',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85'
  },
  'chhattisgarh': {
    landmark: 'Chitrakote Waterfalls, Bastar (Niagara of India)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  },
  'gayaji': {
    landmark: 'Mahabodhi & Vishnupad Temple Heritage, Gaya',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85'
  },
  'budapest-street-art': {
    landmark: 'Budapest Ruin Bars & Historic Architecture',
    url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1600&q=85'
  },
  'destination': {
    landmark: 'Scenic Global Cultural Heritage Discovery',
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=85'
  }
};

// 2. Destination Gallery Multi-image Sets
const DESTINATION_GALLERY = {
  'indore': [
    { title: 'Chhappan Dukan Food Street', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Lal Bagh Palace Heritage', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Sarafa Bazaar Night Trail', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80' }
  ],
  'ujjain': [
    { title: 'Mahakal Lok Corridor Statues', url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Ram Ghat Shipra Evening Aarti', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Kal Bhairav Temple Sacred Walk', url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1200&q=80' }
  ],
  'varanasi': [
    { title: 'Ganga Sunrise Boat Cruise', url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Dashashwamedh Ghat Grand Aarti', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Ancient Kashi Old City Alleys', url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80' }
  ],
  'agra': [
    { title: 'Agra Fort Red Sandstone Architecture', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Mehtab Bagh Sunset Taj View', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Fatehpur Sikri Royal Courtyard', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80' }
  ],
  'goa': [
    { title: 'Palolem Beach Sunset Bay', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Fontainhas Latin Quarter Colors', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Basilica of Bom Jesus Heritage', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' }
  ],
  'bali': [
    { title: 'Tegalalang Rice Terraces Ubud', url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Tanah Lot Sunset Rock Temple', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Nungnung Waterfall Jungle Trail', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' }
  ]
};

// 3. Tours / Experiences Packages
const TOURS_DATA = [
  {
    title: 'Varanasi Sunrise Heritage Boat Tour & Ghat Walk',
    type: 'temple-tour',
    description: 'Witness magical dawn over the sacred Ganges, glide past historic bathing ghats with a local priest, explore the holy Kashi corridor, and partake in spiritual morning rituals.',
    coverImageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1400&q=85',
    city: 'Varanasi',
    country: 'India',
    price: { amount: 1499, currency: 'INR', per: 'person' },
    duration: { value: 3, unit: 'hours' },
    host: { name: 'Acharya Shivendra Mishra', bio: '7th generation Varanasi local historian and Vedic Sanskrit scholar' },
    slugId: 'varanasi_sunrise_boat_tour'
  },
  {
    title: 'Indore Royal Food Trail: 56 Dukan & Sarafa Night Walk',
    type: 'food-tour',
    description: 'Taste authentic Indori poha-jalebi, bhutte ka kees, garadu, and rabri kulfi with an insider culinary guide through India’s cleanest food capital.',
    coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=85',
    city: 'Indore',
    country: 'India',
    price: { amount: 999, currency: 'INR', per: 'person' },
    duration: { value: 4, unit: 'hours' },
    host: { name: 'Chef Ananya Holkar', bio: 'Traditional Malwa chef & food writer' },
    slugId: 'indore_royal_food_trail'
  },
  {
    title: 'Ujjain Mahakal Lok Spiritual Corridor & Bhasma Aarti Guide',
    type: 'temple-tour',
    description: 'Guided darshan experience through the magnificent Mahakal Lok mural corridor, Shipra riverfront holy ghats, and ancient Tantric Kal Bhairav temple.',
    coverImageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1400&q=85',
    city: 'Ujjain',
    country: 'India',
    price: { amount: 1299, currency: 'INR', per: 'person' },
    duration: { value: 4, unit: 'hours' },
    host: { name: 'Pandit Rajesh Sharma', bio: 'Expert temple architect and Mahakaleshwar guide' },
    slugId: 'ujjain_mahakal_lok_spiritual_tour'
  },
  {
    title: 'Agra Sunrise Taj Mahal & Mughal Heritage Walk',
    type: 'photography-tour',
    description: 'Capture early golden hour lighting at the Taj Mahal before the crowds, followed by an architectural breakdown of Agra Fort and Mehtab Bagh gardens.',
    coverImageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1400&q=85',
    city: 'Agra',
    country: 'India',
    price: { amount: 1999, currency: 'INR', per: 'person' },
    duration: { value: 5, unit: 'hours' },
    host: { name: 'Farooq Qureshi', bio: 'Certified National Tourism Guide & Heritage Photographer' },
    slugId: 'agra_sunrise_taj_tour'
  },
  {
    title: 'Bali Sacred Temples, Rice Terraces & Waterfall Expedition',
    type: 'village-tour',
    description: 'Discover the water temple of Ulun Danu Beratan, lush Tegalalang rice paddies, traditional coffee plantations, and secluded sacred waterfalls.',
    coverImageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=85',
    city: 'Denpasar',
    country: 'Indonesia',
    price: { amount: 3499, currency: 'INR', per: 'person' },
    duration: { value: 8, unit: 'hours' },
    host: { name: 'Wayan Sudarta', bio: 'Balinese cultural storyteller and Ubud explorer' },
    slugId: 'bali_sacred_temples_tour'
  },
  {
    title: 'Old Delhi Heritage & Spice Market Rickshaw Safari',
    type: 'village-tour',
    description: 'Navigate the vibrant 400-year-old lanes of Chandni Chowk, Khari Baoli spice bazaar, and Jama Masjid with authentic street delicacy stops.',
    coverImageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1400&q=85',
    city: 'New Delhi',
    country: 'India',
    price: { amount: 1199, currency: 'INR', per: 'person' },
    duration: { value: 3, unit: 'hours' },
    host: { name: 'Imran Beg', bio: 'Shahjahanabad historian and cycling tour pioneer' },
    slugId: 'delhi_heritage_spice_tour'
  }
];

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB!');

  const destColl = mongoose.connection.collection('destinations');
  const expColl = mongoose.connection.collection('experiences');
  const userColl = mongoose.connection.collection('users');

  let adminUser = await userColl.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await userColl.findOne({});
  }
  const defaultUserId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

  // ==========================================
  // FOLDER 1: destination_covers
  // ==========================================
  console.log('\n======================================================');
  console.log('📁 FOLDER 1: Uploading Destination Covers -> [culturequest/destination_covers]');
  console.log('======================================================');
  const allDests = await destColl.find({}).toArray();

  for (const d of allDests) {
    const slug = d.slug || (d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'dest');
    const mapping = DESTINATION_COVERS[slug] || DESTINATION_COVERS[d.name?.toLowerCase()] || DESTINATION_COVERS['destination'];

    try {
      console.log(`Uploading Cover: [${d.name}] (${slug})`);
      const uploadRes = await cloudinary.uploader.upload(mapping.url, {
        folder: 'culturequest/destination_covers',
        public_id: `${slug}_cover`,
        overwrite: true,
        resource_type: 'image'
      });

      console.log(`=> Cover URL: ${uploadRes.secure_url}`);
      await destColl.updateOne(
        { _id: d._id },
        { $set: { coverImage: uploadRes.secure_url } }
      );
    } catch (err) {
      console.error(`Failed cover for ${slug}:`, err.message);
    }
  }

  // ==========================================
  // FOLDER 2: destination_gallery
  // ==========================================
  console.log('\n======================================================');
  console.log('📁 FOLDER 2: Uploading Gallery Images -> [culturequest/destination_gallery]');
  console.log('======================================================');

  for (const d of allDests) {
    const slug = d.slug || (d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'dest');
    const galleryItems = DESTINATION_GALLERY[slug] || [
      { title: `${d.name} Scenic Sight`, url: d.coverImage || 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1200&q=80' },
      { title: `${d.name} Heritage View`, url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' }
    ];

    const uploadedGalleryUrls = [];
    for (let i = 0; i < galleryItems.length; i++) {
      const item = galleryItems[i];
      try {
        const uploadRes = await cloudinary.uploader.upload(item.url, {
          folder: 'culturequest/destination_gallery',
          public_id: `${slug}_gallery_${i + 1}`,
          overwrite: true,
          resource_type: 'image'
        });
        uploadedGalleryUrls.push(uploadRes.secure_url);
        console.log(`Uploaded Gallery Image [${d.name} #${i + 1}]: ${uploadRes.secure_url}`);
      } catch (gErr) {
        console.warn(`Gallery upload err for ${slug}: ${gErr.message}`);
      }
    }

    if (uploadedGalleryUrls.length > 0) {
      await destColl.updateOne(
        { _id: d._id },
        { $set: { gallery: uploadedGalleryUrls, images: uploadedGalleryUrls } }
      );
    }
  }

  // ==========================================
  // FOLDER 3: tours
  // ==========================================
  console.log('\n======================================================');
  console.log('📁 FOLDER 3: Uploading Tours & Experiences -> [culturequest/tours]');
  console.log('======================================================');

  await expColl.deleteMany({}); // refresh experiences

  for (const tour of TOURS_DATA) {
    let tourCoverUrl = '';
    try {
      const uploadRes = await cloudinary.uploader.upload(tour.coverImageUrl, {
        folder: 'culturequest/tours',
        public_id: `${tour.slugId}_tour`,
        overwrite: true,
        resource_type: 'image'
      });
      tourCoverUrl = uploadRes.secure_url;
      console.log(`Uploaded Tour [${tour.title}]: ${tourCoverUrl}`);
    } catch (tErr) {
      console.warn(`Tour upload error for ${tour.slugId}: ${tErr.message}`);
      tourCoverUrl = tour.coverImageUrl;
    }

    await expColl.insertOne({
      title: tour.title,
      type: tour.type,
      description: tour.description,
      coverImage: tourCoverUrl,
      images: [tourCoverUrl],
      price: tour.price,
      duration: tour.duration,
      host: tour.host,
      location: {
        country: tour.country,
        city: tour.city,
        address: `${tour.city} Heritage Center`,
        lat: 0,
        lng: 0
      },
      maxGroupSize: 12,
      languages: ['English', 'Hindi'],
      includes: ['Local Expert Guide', 'Entry Tickets', 'Cultural Refreshments', 'Safety Gear'],
      requirements: ['Comfortable walking shoes', 'Modest attire for temples', 'Camera'],
      rating: { average: 4.9, count: 28 },
      isActive: true,
      isFeatured: true,
      bookingCount: 45,
      createdBy: defaultUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log('\n======================================================');
  console.log('✅ ALL 3 FOLDERS PROCESSED & SYNCED TO MONGODB SUCCESSFULLY!');
  console.log('1. culturequest/destination_covers -> All Destination Cover Images');
  console.log('2. culturequest/destination_gallery -> All Destination Multi-photo Galleries');
  console.log('3. culturequest/tours -> All Cultural Tours & Experience Packages');
  console.log('======================================================');

  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error during folder organization:', err);
  process.exit(1);
});
