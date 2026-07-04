require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Destination = require('./models/Destination');
const HiddenGem = require('./models/HiddenGem');
const Experience = require('./models/Experience');
const Event = require('./models/Event');
const Review = require('./models/Review');
const { cloudinary } = require('./config/cloudinary');

// Dynamic Cloudinary Uploader Helper
const uploadToCloudinary = async (url, folder = 'culturequest/seed') => {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) return url;
  try {
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_API_SECRET && 
      !process.env.CLOUDINARY_API_SECRET.startsWith('your_');
    if (!isCloudinaryConfigured) {
      return url; // Skip upload and keep the unsplash link if Cloudinary is not configured
    }
    console.log(`📤 Uploading to Cloudinary: ${url.substring(0, 60)}...`);
    const res = await cloudinary.uploader.upload(url, {
      folder: folder,
      resource_type: 'image'
    });
    return res.secure_url;
  } catch (err) {
    console.error(`⚠️ Cloudinary upload failed for ${url}:`, err.message);
    return url;
  }
};

const uploadMultipleToCloudinary = async (urls, folder = 'culturequest/seed') => {
  if (!urls || !Array.isArray(urls)) return [];
  const results = [];
  for (const url of urls) {
    const resUrl = await uploadToCloudinary(url, folder);
    results.push(resUrl);
  }
  return results;
};

const seedData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/culturequest');
    console.log('✅ Connected to MongoDB.');

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await Destination.deleteMany({});
    await HiddenGem.deleteMany({});
    await Experience.deleteMany({});
    await Event.deleteMany({});
    await Review.deleteMany({});
    
    try {
      await Review.collection.dropIndexes();
      console.log('✅ Review indexes dropped.');
    } catch (err) {
      console.log('ℹ️ No review indexes to drop.');
    }
    console.log('✅ Collections cleared.');

    // ─── 1. Create Users ───────────────────────────────────────────────────────
    console.log('👤 Seeding users...');
    const adminPassword = 'adminpassword123';
    const userPassword = 'userpassword123';

    const admin = await User.create({
      name: 'CQ Admin',
      email: 'admin@culturequest.ai',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      bio: 'CultureQuest Platform Administrator & Cultural Curator.',
      country: 'United States',
      travelInterests: ['History', 'Art', 'Culinary', 'Architecture']
    });

    const user = await User.create({
      name: 'John Doe',
      email: 'user@culturequest.ai',
      password: userPassword,
      role: 'user',
      isVerified: true,
      bio: 'Passionate globetrotter looking for local foods and historical places.',
      country: 'Canada',
      travelInterests: ['Food', 'Hidden Gems', 'Adventure']
    });

    console.log('✅ Users seeded successfully:');
    console.log(`   - Admin: ${admin.email} (Password: ${adminPassword})`);
    console.log(`   - User:  ${user.email} (Password: ${userPassword})`);

    // ─── 2. Create Destinations ────────────────────────────────────────────────
    console.log('🗺️ Seeding destinations...');
    const destinationData = [
      {
        name: 'Kyoto Imperial Heritage',
        country: 'Japan',
        city: 'Kyoto',
        category: 'historical',
        description: 'Kyoto, once the capital of Japan, is a city on the island of Honshu. It is famous for its thousands of classical Buddhist temples, as well as gardens, imperial palaces, Shinto shrines, and traditional wooden houses.',
        history: 'Kyoto was founded in 794 as Heian-kyo and served as the capital of Japan and the emperor\'s residence for over a millennium until 1869, when the capital moved to Tokyo. Because it was spared from major destruction during World War II, it retains an unparalleled amount of pre-war cultural heritage.',
        culture: 'Kyoto is the heart of Japanese traditional culture. From geisha culture in Gion to tea ceremonies (chado), floral arrangement (ikebana), and traditional architecture, it represents the aesthetic soul of Japan.',
        location: { coordinates: [135.7681, 35.0116] },
        budget: { min: 60, max: 250, level: 'mid-range' },
        bestSeason: ['spring', 'autumn'],
        coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200',
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1200'
        ],
        rating: { average: 4.8, count: 5 },
        openingHours: '24/7 (Temple hours vary)',
        entryFee: { amount: 0, notes: 'Temples typically charge $3-$6 entry.' },
        highlights: ['Gion District Walk', 'Fushimi Inari-taisha Shrines', 'Kinkaku-ji Golden Pavilion'],
        travelTips: ['Buy an IC card for subways and buses.', 'Carry cash, as small temples do not accept credit cards.', 'Please do not photograph Geishas without permission.'],
        tags: ['temples', 'history', 'tea', 'gardens'],
        isFeatured: true,
        isTrending: true,
        createdBy: admin._id
      },
      {
        name: 'Oaxaca de Juárez',
        country: 'Mexico',
        city: 'Oaxaca',
        category: 'cultural',
        description: 'Oaxaca is a vibrant city known for its colonial architecture, indigenous cultures, and rich culinary history. Surrounded by mountains, it showcases incredible art, lively zocalos, and world-class street markets.',
        history: 'Originally a Zapotec and Mixtec heartland, the city was officially founded by Spanish settlers in 1529. Its historical center is a UNESCO World Heritage site featuring stunning Baroque and Renaissance architecture built from local green volcanic stone.',
        culture: 'The city boasts a rich syncretic culture where Catholic traditions merge with indigenous rituals. It is world-renowned for its handicrafts, including black pottery, alebrijes, and hand-woven textiles, alongside its unparalleled culinary scene.',
        location: { coordinates: [-96.7266, 17.0732] },
        budget: { min: 40, max: 150, level: 'budget' },
        bestSeason: ['autumn', 'winter'],
        coverImage: 'https://images.unsplash.com/photo-1465256410760-10485d5be681?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1465256410760-10485d5be681?q=80&w=1200',
          'https://images.unsplash.com/photo-1512813583145-acaa58633afe?q=80&w=1200'
        ],
        rating: { average: 4.7, count: 4 },
        openingHours: '24/7',
        entryFee: { amount: 0, notes: 'Free public spaces, museums charge $4-$6.' },
        highlights: ['Tasting Mole at local markets', 'Exploring Monte Albán Ruins', 'Día de los Muertos celebration'],
        travelTips: ['Tipping 10-15% is standard.', 'Drink bottled water only.', 'Visit the food markets early in the morning for the freshest food.'],
        tags: ['food', 'indigenous', 'colonial', 'art'],
        isFeatured: true,
        isTrending: true,
        createdBy: admin._id
      },
      {
        name: 'Florence Renaissance Center',
        country: 'Italy',
        city: 'Florence',
        category: 'historical',
        description: 'Florence, capital of Italy’s Tuscany region, is home to many masterpieces of Renaissance art and architecture. One of its most iconic sights is the Duomo, a cathedral with a terracotta-tiled dome engineered by Brunelleschi.',
        history: 'Established as a Roman military settlement, Florence rose to power in the late middle ages under the rule of the Medici family. It became the birthplace of the Italian Renaissance, sponsoring artists like Michelangelo, Leonardo da Vinci, and Botticelli.',
        culture: 'Art, literature, and architecture define Florentine culture. It is also famous for Tuscan leather crafts, high fashion, and regional cuisine based on simple, rustic ingredients paired with world-class Chianti wine.',
        location: { coordinates: [11.2558, 43.7696] },
        budget: { min: 90, max: 350, level: 'luxury' },
        bestSeason: ['spring', 'autumn'],
        coverImage: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200',
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200'
        ],
        rating: { average: 4.9, count: 6 },
        openingHours: '24/7',
        entryFee: { amount: 0, notes: 'City is free; galleries require advanced booking ($12-$30).' },
        highlights: ['Climbing Brunelleschi’s Dome', 'Visiting Michelangelo’s David at the Accademia', 'Strolling Ponte Vecchio at sunset'],
        travelTips: ['Book Uffizi and Accademia tickets weeks in advance.', 'Wear clothing that covers shoulders and knees to enter churches.', 'Validate your train tickets at the station before boarding.'],
        tags: ['art', 'renaissance', 'architecture', 'wine'],
        isFeatured: true,
        isTrending: false,
        createdBy: admin._id
      },
      {
        name: 'Cape Town & Peninsula',
        country: 'South Africa',
        city: 'Cape Town',
        category: 'adventure',
        description: 'Cape Town is a port city on South Africa’s southwest coast, on a peninsula beneath the imposing Table Mountain. Rotating cable cars climb to the mountain’s flat top, from which there are sweeping views of the city and harbor.',
        history: 'Originally inhabited by the Khoisan people, Cape Town was developed by the Dutch East India Company as a victualling station for Dutch ships. It grew into the legislative capital of South Africa and was a focal point in the struggle against apartheid.',
        culture: 'A rich melting pot of African, Dutch, British, Malay, and French influences. The colorful Bo-Kaap neighborhood showcases Cape Malay cultural heritage, and the city’s creative art, music, and food scenes are globally recognized.',
        location: { coordinates: [18.4241, -33.9249] },
        budget: { min: 50, max: 200, level: 'mid-range' },
        bestSeason: ['summer', 'spring'],
        coverImage: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200',
          'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?q=80&w=1200'
        ],
        rating: { average: 4.6, count: 3 },
        openingHours: '24/7',
        entryFee: { amount: 0, notes: 'Table Mountain National Park requires fees.' },
        highlights: ['Hiking Lion\'s Head at sunrise', 'Visiting Robben Island Museum', 'Bo-Kaap colorful houses walk'],
        travelTips: ['Be cautious of your surroundings, especially at night.', 'Use Uber or local reliable tour operators.', 'Weather changes quickly - dress in layers.'],
        tags: ['hiking', 'beach', 'history', 'nature'],
        isFeatured: false,
        isTrending: true,
        createdBy: admin._id
      }
    ];

    // Upload Destination Images to Cloudinary
    for (const d of destinationData) {
      d.coverImage = await uploadToCloudinary(d.coverImage, 'culturequest/destinations');
      d.images = await uploadMultipleToCloudinary(d.images, 'culturequest/destinations');
    }

    const destinations = await Destination.create(destinationData);
    console.log(`✅ ${destinations.length} Destinations seeded.`);

    // Link some nearby attractions (Florence and Kyoto)
    destinations[2].nearbyAttractions = [];
    await destinations[2].save();

    // ─── 3. Create Hidden Gems ────────────────────────────────────────────────
    console.log('💎 Seeding hidden gems...');
    const gemData = [
      {
        name: 'Otagi Nenbutsu-ji Temple',
        description: 'A whimsical and serene Buddhist temple on the outskirts of Arashiyama, Kyoto. It is famous for its collection of 1,200 stone statues representing the Rakan (disciples of Buddha), each with a unique, often humorous facial expression.',
        difficulty: 'easy',
        location: {
          country: 'Japan',
          city: 'Kyoto',
          address: '2-1 Sagatoriimoto Fukutani-cho, Ukyo-ku, Kyoto',
          coordinates: { lat: 35.0322, lng: 135.6601 }
        },
        bestTime: 'Autumn (mid-November) or Spring (April)',
        whyUnique: 'Unlike quiet, formal temples, the statues here were carved by amateurs under the guidance of sculptor Kocho Nishimura, giving them a delightful, warm, and highly personal charm.',
        howToGet: 'Take Kyoto City Bus 94 from Hankyu Arashiyama Station, getting off at Otagi-dera-mae.',
        tags: ['temple', 'sculpture', 'quirky', 'zen'],
        travelTips: ['Walk from Adashino Nenbutsu-ji Temple down the preserved historic street.', 'Look for the statues holding a tennis racket or sake cup.'],
        image: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=1200',
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200'
        ],
        createdBy: admin._id
      },
      {
        name: 'Santiago Apoala Valley',
        description: 'A hidden emerald canyon located in the Mixteca region of Oaxaca, Mexico. Apoala offers breathtaking hiking trails, massive limestone cliffs, natural caves, and a striking 30-meter waterfall that pools into clean turquoise swimming basins.',
        difficulty: 'moderate',
        location: {
          country: 'Mexico',
          city: 'Oaxaca',
          address: 'Santiago Apoala, Nochixtlán, Oaxaca',
          coordinates: { lat: 17.6500, lng: -97.1333 }
        },
        bestTime: 'Dry Season (November to April)',
        whyUnique: 'An untouched indigenous ecological reserve managed directly by the local Mixtec community, preserving raw nature and pre-Hispanic legends of origin.',
        howToGet: 'Take a passenger van (colectivo) from Nochixtlán (a town 1.5 hours from Oaxaca City) directly into Apoala.',
        tags: ['waterfall', 'canyon', 'nature', 'hiking'],
        travelTips: ['Hire a local indigenous guide at the tourist office.', 'Bring warm layers as nights in the canyon are cold.', 'Cash only.'],
        image: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1508873696983-2df519f0397e?q=80&w=1200',
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200'
        ],
        createdBy: admin._id
      },
      {
        name: 'Procida Pastel Island',
        description: 'Procida is the smallest island in the Bay of Naples. Spared from the heavy commercial tourism of neighboring Capri and Ischia, it maintains a nostalgic, working-class fisherman vibe highlighted by Marina Corricella\'s colorful pastel houses.',
        difficulty: 'easy',
        location: {
          country: 'Italy',
          city: 'Procida',
          address: 'Marina Corricella, Procida Island',
          coordinates: { lat: 40.7635, lng: 14.0298 }
        },
        bestTime: 'May, June, or September',
        whyUnique: 'A preserved slice of Italian island life where fishermen mend nets on the harbor docks and children play in traffic-free stone alleys.',
        howToGet: 'Take a ferry or hydrofoil from Naples (Molo Beverello) or Pozzuoli.',
        tags: ['island', 'pastel', 'seaside', 'calm'],
        travelTips: ['Climb up to Terra Murata for the iconic postcard view of Marina Corricella.', 'Try the local lemon salad (insalata di limone) or lemon pastries.'],
        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200',
          'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200'
        ],
        createdBy: admin._id
      }
    ];

    // Upload Hidden Gem Images to Cloudinary
    for (const g of gemData) {
      g.image = await uploadToCloudinary(g.image, 'culturequest/gems');
      g.images = await uploadMultipleToCloudinary(g.images, 'culturequest/gems');
    }

    const gems = await HiddenGem.create(gemData);
    console.log(`✅ ${gems.length} Hidden Gems seeded.`);

    // ─── 4. Create Experiences ────────────────────────────────────────────────
    console.log('🏛️ Seeding cultural experiences...');
    const experienceData = [
      {
        title: 'Zen Tea Ceremony & Calligraphy in Kyoto Garden',
        type: 'temple-tour',
        description: 'Step into a centuries-old wooden machiya tea house in Kyoto. Learn the meticulous philosophy behind preparing Matcha tea (chado) and practice Japanese Zen calligraphy (shodo) under the instruction of a licensed master.',
        price: { amount: 65, currency: 'USD', per: 'person' },
        duration: { value: 2.5, unit: 'hours' },
        host: {
          name: 'Soyoko Tanaka',
          bio: 'Urasenke Tea Master with over 25 years of teaching experience, passionate about sharing zen arts with travelers.',
          contact: '+81-75-123-4567'
        },
        location: {
          country: 'Japan',
          city: 'Kyoto',
          address: 'Gion-machi Minamigawa, Higashiyama-ku, Kyoto',
          lat: 35.0037,
          lng: 135.7782
        },
        maxGroupSize: 6,
        languages: ['English', 'Japanese'],
        includes: ['Matcha Tea & Seasonal Wagashi Sweets', 'Calligraphy Brush and Paper to keep', 'Kimono dressing trial'],
        requirements: ['Please wear clean white socks for sitting on tatami mats.', 'Inability to sit on knees is okay (chairs provided).'],
        isFeatured: true,
        coverImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=1200',
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200'
        ],
        createdBy: admin._id
      },
      {
        title: 'Authentic 7-Mole Culinary Class',
        type: 'cooking-class',
        description: 'Unlock the complex secrets of Oaxacan gastronomy. You will start with a guided trip to the bustling Mercado Central to source ingredients (chilies, seeds, chocolate, herbs), then return to a private garden kitchen to grind paste on a traditional volcanic stone metate and simmer the legendary Mole sauce.',
        price: { amount: 80, currency: 'USD', per: 'person' },
        duration: { value: 5, unit: 'hours' },
        host: {
          name: 'Chef Reyna Mendoza',
          bio: 'Traditional Zapotec cook featured in international food documentaries, preserving ancestral cooking secrets.',
          contact: '+52-951-789-0123'
        },
        location: {
          country: 'Mexico',
          city: 'Oaxaca',
          address: 'Teotitlán del Valle, Oaxaca',
          lat: 17.0272,
          lng: -96.5186
        },
        maxGroupSize: 10,
        languages: ['English', 'Spanish'],
        includes: ['Guided market shopping tour', '4-course lunch with homemade mezcal pairing', 'Printed recipe book'],
        requirements: ['Comfortable walking shoes for market tour.', 'Inform host in advance of food allergies.'],
        isFeatured: true,
        coverImage: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1200',
          'https://images.unsplash.com/photo-1512813583145-acaa58633afe?q=80&w=1200'
        ],
        createdBy: admin._id
      },
      {
        title: 'Renaissance Fresco Painting Workshop',
        type: 'craft-workshop',
        description: 'Immerse yourself in authentic Renaissance art techniques in an artisan studio in Florence. Learn how to mix slaked lime plaster, apply it to a support, and paint directly onto the wet surface (buon fresco) using natural pigments, exactly as Michelangelo did on the Sistine Chapel.',
        price: { amount: 95, currency: 'USD', per: 'person' },
        duration: { value: 3, unit: 'hours' },
        host: {
          name: 'Maestro Alan Pascuzzi',
          bio: 'Art historian, sculptor, and painter specializing in reproducing visual arts using historic methods.',
          contact: '+39-055-987-6543'
        },
        location: {
          country: 'Italy',
          city: 'Florence',
          address: 'Via de\' Neri, 12, 50122 Firenze',
          lat: 43.7687,
          lng: 11.2581
        },
        maxGroupSize: 8,
        languages: ['English', 'Italian'],
        includes: ['All plaster and pigment materials', 'Your finished fresco block to take home', 'Art history lecture'],
        requirements: ['Wear clothing you do not mind getting plaster on.'],
        isFeatured: false,
        coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200',
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200'
        ],
        createdBy: admin._id
      }
    ];

    // Upload Experience Images to Cloudinary
    for (const exp of experienceData) {
      exp.coverImage = await uploadToCloudinary(exp.coverImage, 'culturequest/experiences');
      exp.images = await uploadMultipleToCloudinary(exp.images, 'culturequest/experiences');
    }

    const experiences = await Experience.create(experienceData);
    console.log(`✅ ${experiences.length} Experiences seeded.`);

    // ─── 5. Create Events ─────────────────────────────────────────────────────
    console.log('📅 Seeding cultural events...');
    const today = new Date();
    
    // Helper to add days
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const eventData = [
      {
        title: 'Día de los Muertos (Day of the Dead)',
        type: 'festival',
        description: 'The Day of the Dead is a beautiful, deeply spiritual Mexican festival celebrating the memory of deceased ancestors. Families build home altars decorated with yellow marigolds, sugar skulls, and favorite meals.',
        startDate: new Date(today.getFullYear(), 9, 31), // October 31
        endDate: new Date(today.getFullYear(), 10, 2),   // November 2
        time: 'All Day & Night',
        location: {
          country: 'Mexico',
          city: 'Oaxaca',
          venue: 'Panteón General & streets of Historic Center',
          address: 'Centro Histórico, Oaxaca de Juárez, Mexico',
          lat: 17.0618,
          lng: -96.7198
        },
        price: { isFree: true, amount: 0 },
        organizer: {
          name: 'Oaxaca Municipal Tourism Board',
          website: 'https://oaxaca.travel'
        },
        tags: ['day of the dead', 'tradition', 'spiritual', 'parades'],
        highlights: ['Panteón General graveyard vigils', 'Comparsas neighborhood night parades'],
        dressCode: 'Casual. Face painting is welcome.',
        culturalNote: 'Remember that this is a celebratory but intimate reunion with lost loved ones.',
        isFeatured: true,
        coverImage: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=1200',
          'https://images.unsplash.com/photo-1512813583145-acaa58633afe?q=80&w=1200'
        ],
        createdBy: admin._id
      },
      {
        title: 'Kyoto Gion Matsuri Festival',
        type: 'festival',
        description: 'Dating back to 869 AD, Gion Matsuri is Japan\'s famous festival, held throughout July. Floats decorated with historic tapestries parade through downtown Kyoto.',
        startDate: new Date(today.getFullYear(), 6, 1),  // July 1
        endDate: new Date(today.getFullYear(), 6, 31), // July 31
        time: 'Float parade starts at 9:00 AM',
        location: {
          country: 'Japan',
          city: 'Kyoto',
          venue: 'Shijo and Kawaramachi streets',
          address: 'Shimogyo-ku, Kyoto, Japan',
          lat: 35.0038,
          lng: 135.7645
        },
        price: { isFree: true, amount: 0 },
        organizer: {
          name: 'Gion Matsuri Float Association',
          website: 'https://gionmatsuri.or.jp'
        },
        tags: ['matsuri', 'floats', 'parade', 'summer'],
        highlights: ['Yamaboko Junko Float Parade (July 17 & 24)', 'Yoiyama Festive Nights (street food, lanterns, yukatas)'],
        dressCode: 'Light summer clothing. Traditional Yukata is popular.',
        culturalNote: 'Yoiyama nights can get crowded. Keep track of belongings.',
        isFeatured: true,
        coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200',
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1200'
        ],
        createdBy: admin._id
      },
      {
        title: 'Florence Biennale Art & Design Expo',
        type: 'cultural',
        description: 'Florence Biennale is a major international contemporary art and design exhibition held in the historic Fortezza da Basso.',
        startDate: addDays(today, 10), // Starts in 10 days
        endDate: addDays(today, 18),   // Ends in 18 days
        time: '10:00 AM - 7:00 PM',
        location: {
          country: 'Italy',
          city: 'Florence',
          venue: 'Fortezza da Basso',
          address: 'Viale Filippo Strozzi, 1, 50129 Firenze FI, Italy',
          lat: 43.7821,
          lng: 11.2486
        },
        price: { isFree: false, amount: 15, currency: 'EUR' },
        organizer: {
          name: 'Arte Studio SRL',
          website: 'https://www.florencebiennale.org'
        },
        tags: ['art', 'exhibition', 'contemporary', 'design'],
        highlights: ['International art gallery walk', 'Artist roundtables and talks'],
        dressCode: 'Smart casual / Art chic.',
        culturalNote: 'Photography of art pieces is allowed unless indicated otherwise.',
        isFeatured: false,
        coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200',
        images: [
          'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200',
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200'
        ],
        createdBy: admin._id
      }
    ];

    // Upload Event Images to Cloudinary
    for (const ev of eventData) {
      ev.coverImage = await uploadToCloudinary(ev.coverImage, 'culturequest/events');
      ev.images = await uploadMultipleToCloudinary(ev.images, 'culturequest/events');
    }

    const events = await Event.create(eventData);
    console.log(`✅ ${events.length} Events seeded.`);

    // ─── 6. Create Reviews ────────────────────────────────────────────────────
    console.log('⭐️ Seeding reviews...');
    await Review.create([
      {
        user: user._id,
        itemType: 'destination',
        destination: destinations[0]._id,
        rating: 5,
        comment: 'Kyoto was absolute magic. The temples are beautiful and walking through Gion at dusk felt like going back in time. Strongly recommend doing a tea ceremony!',
        likes: [admin._id],
        replies: [
          {
            user: admin._id,
            comment: 'So glad you enjoyed Kyoto, John! It is indeed a cultural sanctuary.',
            createdAt: new Date()
          }
        ]
      },
      {
        user: user._id,
        itemType: 'destination',
        destination: destinations[1]._id,
        rating: 5,
        comment: 'The food in Oaxaca is unbelievable! I had Tlayudas at the market and the mole course is a must. The people are incredibly warm and welcoming.',
        likes: []
      }
    ]);
    console.log('✅ Reviews seeded.');

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('💥 Database seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
