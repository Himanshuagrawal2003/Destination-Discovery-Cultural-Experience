const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==========================================
// 1. DESTINATION COVERS MAPPING (32 Places)
// ==========================================
const DESTINATION_COVERS = {
  'indore': {
    landmark: 'Rajwada Palace, Indore (7-Story Holkar Palace)',
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

// ==========================================
// 2. DESTINATION GALLERY MAPPING
// ==========================================
const DESTINATION_GALLERY = {
  'indore': [
    { title: 'Chhappan Dukan Street', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Lal Bagh Palace Heritage', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Sarafa Night Food Walk', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80' }
  ],
  'ujjain': [
    { title: 'Mahakal Lok Mural Corridor', url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Ram Ghat Shipra Holy Dip', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Kal Bhairav Temple Path', url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1200&q=80' }
  ],
  'varanasi': [
    { title: 'Ganga Sunrise Boat Ride', url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Dashashwamedh Grand Aarti', url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Ancient Kashi Heritage Alleys', url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80' }
  ],
  'agra': [
    { title: 'Agra Fort Mughal Gateway', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Mehtab Bagh Sunset Taj Panorama', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Fatehpur Sikri Buland Darwaza', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80' }
  ],
  'goa': [
    { title: 'Palolem Beach Coconut Grove', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Fontainhas Portuguese Quarter', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Old Goa Cathedral Heritage', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' }
  ],
  'bali': [
    { title: 'Tegalalang Green Rice Terraces', url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Tanah Lot Sunset Rock', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
    { title: 'Sacred Waterfall Jungle Canyon', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' }
  ]
};

// ==========================================
// 3. EVENTS / FESTIVALS MAPPING (Folder: culturequest/events)
// ==========================================
const EVENTS_DATA = [
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
    imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1400&q=85',
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
    title: 'Indore Rangpanchami Gair Heritage Carnival',
    type: 'cultural',
    description: 'A UNESCO-recognized historical street carnival where millions gather around Rajwada Palace with colorful water cannons, bullock carts with Gulal, and traditional folk troupes.',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1400&q=85',
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
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=85',
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
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=85',
    city: 'Goa',
    country: 'India',
    venue: 'Panaji Riverfront & Miramar Beach, Goa',
    publicId: 'goa_carnival_cultural_event',
    startDate: new Date('2026-02-14T15:00:00Z'),
    endDate: new Date('2026-02-17T23:00:00Z'),
    price: { isFree: true, amount: 0, currency: 'INR' },
    tags: ['GoaCarnival', 'Goa', 'Beach', 'Parade', 'Music']
  }
];

// ==========================================
// 4. TOURS & EXPERIENCES (Folder: culturequest/tours)
// ==========================================
const TOURS_DATA = [
  {
    title: 'Varanasi Sunrise Heritage Boat Cruise & Ghat Walk',
    type: 'temple-tour',
    description: 'Sail through sacred morning mist on a private wooden boat, witness Vedic chants, visit hidden Kashi galis, and experience spiritual sunrise Ganga Puja.',
    imageUrl: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1400&q=85',
    city: 'Varanasi',
    country: 'India',
    publicId: 'varanasi_sunrise_boat_tour',
    price: { amount: 1499, currency: 'INR', per: 'person' },
    duration: { value: 3, unit: 'hours' },
    host: { name: 'Acharya Shivendra Mishra', bio: '7th generation Varanasi Vedic historian' }
  },
  {
    title: 'Indore Royal Food Trail: 56 Dukan & Sarafa Night Walk',
    type: 'food-tour',
    description: 'Explore the culinary capital of India with an insider food explorer. Taste famous poha jalebi, bhutte ka kees, khopra patties, and malpua.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=85',
    city: 'Indore',
    country: 'India',
    publicId: 'indore_night_food_walk_tour',
    price: { amount: 999, currency: 'INR', per: 'person' },
    duration: { value: 4, unit: 'hours' },
    host: { name: 'Chef Ananya Holkar', bio: 'Malwa cuisine scholar' }
  },
  {
    title: 'Ujjain Mahakal Lok Spiritual Corridor & Bhasma Aarti Guide',
    type: 'temple-tour',
    description: 'Dedicated heritage darshan guide across the grand 900-meter Mahakal Lok corridor, Ram Ghat Shipra riverside, and ancient Kal Bhairav temple.',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1400&q=85',
    city: 'Ujjain',
    country: 'India',
    publicId: 'ujjain_mahakal_corridor_tour',
    price: { amount: 1299, currency: 'INR', per: 'person' },
    duration: { value: 4, unit: 'hours' },
    host: { name: 'Pandit Rajesh Sharma', bio: 'Mahakaleshwar Sanskrit guide' }
  },
  {
    title: 'Agra Sunrise Taj Mahal & Mughal Architecture Walk',
    type: 'photography-tour',
    description: 'Early morning VIP entrance to Taj Mahal for perfect sunrise photography, followed by the red sandstone ramparts of Agra Fort and Mehtab Bagh gardens.',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1400&q=85',
    city: 'Agra',
    country: 'India',
    publicId: 'agra_sunrise_taj_tour',
    price: { amount: 1999, currency: 'INR', per: 'person' },
    duration: { value: 5, unit: 'hours' },
    host: { name: 'Farooq Qureshi', bio: 'National Tourism Gold medalist' }
  },
  {
    title: 'Bali Sacred Water Temples & Rice Terrace Expedition',
    type: 'village-tour',
    description: 'Full-day cultural safari visiting Ulun Danu Beratan water temple, Tegalalang tiered rice paddies, traditional coffee plantations, and jungle waterfalls.',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=85',
    city: 'Denpasar',
    country: 'Indonesia',
    publicId: 'bali_temple_expedition_tour',
    price: { amount: 3499, currency: 'INR', per: 'person' },
    duration: { value: 8, unit: 'hours' },
    host: { name: 'Wayan Sudarta', bio: 'Ubud cultural naturalist' }
  },
  {
    title: 'Old Delhi Heritage Rickshaw Safari & Spice Market',
    type: 'village-tour',
    description: 'Immerse yourself in 400-year-old Mughal alleys of Chandni Chowk, Asia’s largest spice market at Khari Baoli, and Jama Masjid with authentic tasting stops.',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1400&q=85',
    city: 'New Delhi',
    country: 'India',
    publicId: 'delhi_heritage_spice_tour',
    price: { amount: 1199, currency: 'INR', per: 'person' },
    duration: { value: 3, unit: 'hours' },
    host: { name: 'Imran Beg', bio: 'Shahjahanabad historian' }
  }
];

// ==========================================
// 5. HIDDEN GEMS (Folder: culturequest/gems)
// ==========================================
const GEMS_DATA = [
  {
    name: 'Gulawat Lotus Valley & Bamboo Lake',
    description: 'A serene hidden wetland canal flanked by millions of blooming pink lotus flowers and a tranquil bamboo forest near Indore.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    city: 'Indore',
    country: 'India',
    publicId: 'indore_gulawat_lotus_valley_gem',
    difficulty: 'easy',
    whyUnique: 'Asia’s largest naturally blooming lotus valley with wooden boat trails'
  },
  {
    name: 'Sandipani Ashram & Triveni Sangam',
    description: 'The ancient hermitage where Lord Krishna and Balarama studied 64 arts in 64 days under Guru Sandipani, away from the city crowd.',
    imageUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80',
    city: 'Ujjain',
    country: 'India',
    publicId: 'ujjain_sandipani_ashram_gem',
    difficulty: 'easy',
    whyUnique: '5000+ year old Vedic learning retreat with ancient Kund'
  },
  {
    name: 'Chunar Fort Overlooking Ganga',
    description: 'An ancient fortress perched over the curved bank of river Ganges with deep underground passages and Mauryan inscriptions.',
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    city: 'Varanasi',
    country: 'India',
    publicId: 'varanasi_chunar_fort_gem',
    difficulty: 'moderate',
    whyUnique: 'Medieval cliff fortress with panoramic views over the Ganges'
  },
  {
    name: 'Bhimbetka Prehistoric Rock Shelters',
    description: 'UNESCO World Heritage prehistoric rock cave paintings dating back over 30,000 years hidden within dense teak forests.',
    imageUrl: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1200&q=80',
    city: 'Bhopal',
    country: 'India',
    publicId: 'bhopal_bhimbetka_caves_gem',
    difficulty: 'easy',
    whyUnique: 'Oldest human cave art in the Indian subcontinent'
  }
];

async function masterOrganizeAndUpload() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connection active!');

  const destColl = mongoose.connection.collection('destinations');
  const eventColl = mongoose.connection.collection('events');
  const expColl = mongoose.connection.collection('experiences');
  const gemColl = mongoose.connection.collection('hiddengems');
  const userColl = mongoose.connection.collection('users');

  const adminUser = await userColl.findOne({});
  const defaultUserId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();

  // =========================================================================
  // FOLDER 1: destination_covers (Saved with place name)
  // =========================================================================
  console.log('\n===============================================================');
  console.log('1️⃣ UPLOADING DESTINATION COVERS -> [culturequest/destination_covers]');
  console.log('===============================================================');
  const allDests = await destColl.find({}).toArray();

  for (const d of allDests) {
    const slug = d.slug || (d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'dest');
    const mapping = DESTINATION_COVERS[slug] || DESTINATION_COVERS[d.name?.toLowerCase()] || DESTINATION_COVERS['destination'];

    try {
      const publicId = `${slug}_cover`;
      console.log(`[Cover] ${d.name} -> PublicID: ${publicId}`);
      const res = await cloudinary.uploader.upload(mapping.url, {
        folder: 'culturequest/destination_covers',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image'
      });

      console.log(`=> Uploaded: ${res.secure_url}`);
      await destColl.updateOne(
        { _id: d._id },
        { $set: { coverImage: res.secure_url } }
      );
    } catch (err) {
      console.error(`Error uploading cover for ${slug}: ${err.message}`);
    }
  }

  // =========================================================================
  // FOLDER 2: destination_gallery (Saved with place name & index)
  // =========================================================================
  console.log('\n===============================================================');
  console.log('2️⃣ UPLOADING DESTINATION GALLERIES -> [culturequest/destination_gallery]');
  console.log('===============================================================');

  for (const d of allDests) {
    const slug = d.slug || (d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'dest');
    const galleryList = DESTINATION_GALLERY[slug] || [
      { title: `${d.name} View 1`, url: d.coverImage || 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1200&q=80' },
      { title: `${d.name} View 2`, url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80' }
    ];

    const galleryUrls = [];
    for (let i = 0; i < galleryList.length; i++) {
      const publicId = `${slug}_gallery_${i + 1}`;
      try {
        console.log(`[Gallery] ${d.name} #${i + 1} -> PublicID: ${publicId}`);
        const res = await cloudinary.uploader.upload(galleryList[i].url, {
          folder: 'culturequest/destination_gallery',
          public_id: publicId,
          overwrite: true,
          resource_type: 'image'
        });
        galleryUrls.push(res.secure_url);
        console.log(`=> Gallery URL: ${res.secure_url}`);
      } catch (gErr) {
        console.warn(`Gallery upload failed for ${slug} #${i + 1}: ${gErr.message}`);
      }
    }

    if (galleryUrls.length > 0) {
      await destColl.updateOne(
        { _id: d._id },
        { $set: { gallery: galleryUrls, images: galleryUrls } }
      );
    }
  }

  // =========================================================================
  // FOLDER 3: events (Saved with place name & festival name)
  // =========================================================================
  console.log('\n===============================================================');
  console.log('3️⃣ UPLOADING EVENTS & FESTIVALS -> [culturequest/events]');
  console.log('===============================================================');

  await eventColl.deleteMany({}); // refresh events

  for (const ev of EVENTS_DATA) {
    let eventImgUrl = '';
    try {
      console.log(`[Event] ${ev.city} - ${ev.title} -> PublicID: ${ev.publicId}`);
      const res = await cloudinary.uploader.upload(ev.imageUrl, {
        folder: 'culturequest/events',
        public_id: ev.publicId,
        overwrite: true,
        resource_type: 'image'
      });
      eventImgUrl = res.secure_url;
      console.log(`=> Event URL: ${eventImgUrl}`);
    } catch (eErr) {
      console.warn(`Event upload err for ${ev.publicId}: ${eErr.message}`);
      eventImgUrl = ev.imageUrl;
    }

    await eventColl.insertOne({
      title: ev.title,
      type: ev.type,
      description: ev.description,
      coverImage: eventImgUrl,
      images: [eventImgUrl],
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
      viewCount: 120,
      createdBy: defaultUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // =========================================================================
  // FOLDER 4: tours (Saved with place name & tour name)
  // =========================================================================
  console.log('\n===============================================================');
  console.log('4️⃣ UPLOADING TOURS & EXPERIENCES -> [culturequest/tours]');
  console.log('===============================================================');

  await expColl.deleteMany({}); // refresh tours

  for (const tour of TOURS_DATA) {
    let tourImgUrl = '';
    try {
      console.log(`[Tour] ${tour.city} - ${tour.title} -> PublicID: ${tour.publicId}`);
      const res = await cloudinary.uploader.upload(tour.imageUrl, {
        folder: 'culturequest/tours',
        public_id: tour.publicId,
        overwrite: true,
        resource_type: 'image'
      });
      tourImgUrl = res.secure_url;
      console.log(`=> Tour URL: ${tourImgUrl}`);
    } catch (tErr) {
      console.warn(`Tour upload err for ${tour.publicId}: ${tErr.message}`);
      tourImgUrl = tour.imageUrl;
    }

    await expColl.insertOne({
      title: tour.title,
      type: tour.type,
      description: tour.description,
      coverImage: tourImgUrl,
      images: [tourImgUrl],
      price: tour.price,
      duration: tour.duration,
      host: tour.host,
      location: {
        country: tour.country,
        city: tour.city,
        address: `${tour.city} Heritage Hub`,
        lat: 0,
        lng: 0
      },
      maxGroupSize: 12,
      languages: ['English', 'Hindi'],
      includes: ['Expert Heritage Guide', 'Monument Passes', 'Local Snacks & Chai', 'Audio Kit'],
      requirements: ['Walking shoes', 'Water bottle', 'Camera'],
      rating: { average: 4.9, count: 34 },
      isActive: true,
      isFeatured: true,
      bookingCount: 52,
      createdBy: defaultUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // =========================================================================
  // FOLDER 5: gems (Saved with place name & gem name)
  // =========================================================================
  console.log('\n===============================================================');
  console.log('5️⃣ UPLOADING HIDDEN GEMS -> [culturequest/gems]');
  console.log('===============================================================');

  await gemColl.deleteMany({}); // refresh gems

  for (const gem of GEMS_DATA) {
    let gemImgUrl = '';
    try {
      console.log(`[Gem] ${gem.city} - ${gem.name} -> PublicID: ${gem.publicId}`);
      const res = await cloudinary.uploader.upload(gem.imageUrl, {
        folder: 'culturequest/gems',
        public_id: gem.publicId,
        overwrite: true,
        resource_type: 'image'
      });
      gemImgUrl = res.secure_url;
      console.log(`=> Gem URL: ${gemImgUrl}`);
    } catch (gErr) {
      console.warn(`Gem upload err for ${gem.publicId}: ${gErr.message}`);
      gemImgUrl = gem.imageUrl;
    }

    await gemColl.insertOne({
      name: gem.name,
      description: gem.description,
      image: gemImgUrl,
      images: [gemImgUrl],
      travelTips: ['Visit during morning hours for fewer crowds', 'Carry drinking water'],
      difficulty: gem.difficulty,
      location: {
        country: gem.country,
        city: gem.city,
        coordinates: { lat: 0, lng: 0 },
        address: `${gem.name}, ${gem.city}`
      },
      bestTime: 'October to March',
      whyUnique: gem.whyUnique,
      howToGet: 'Easily accessible via local cabs or public heritage buses',
      tags: [gem.city, 'Offbeat', 'HiddenGem', 'Heritage'],
      isActive: true,
      viewCount: 88,
      rating: { average: 4.8, count: 19 },
      createdBy: defaultUserId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  console.log('\n===============================================================');
  console.log('✨ ALL 5 CLOUDINARY FOLDERS CREATED & POPULATED WITH CLEAN PLACE NAMES!');
  console.log('📁 1. culturequest/destination_covers  -> <place>_cover (32 Places)');
  console.log('📁 2. culturequest/destination_gallery -> <place>_gallery_<1,2,3>');
  console.log('📁 3. culturequest/events              -> <place>_<event>_event');
  console.log('📁 4. culturequest/tours               -> <place>_<tour>_tour');
  console.log('📁 5. culturequest/gems                -> <place>_<gem>_gem');
  console.log('===============================================================');

  process.exit(0);
}

masterOrganizeAndUpload().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
