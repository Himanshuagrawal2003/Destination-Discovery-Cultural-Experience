const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');

// Exact iconic landmark mappings
const ICONIC_LANDMARKS = {
  'indore': {
    landmark: 'Rajwada Palace & Lal Bagh Palace',
    // Authentic Rajwada Palace, Indore
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Indore_Rajwada01.jpg/1280px-Indore_Rajwada01.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'ujjain': {
    landmark: 'Shree Mahakaleshwar Jyotirlinga Temple & Mahakal Lok',
    // Authentic Mahakaleshwar Jyotirlinga Temple, Ujjain
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Mahakaleshwar_Temple%2C_Ujjain.jpg/1280px-Mahakaleshwar_Temple%2C_Ujjain.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'varanasi': {
    landmark: 'Kashi Vishwanath Temple & Dashashwamedh Ganga Aarti Ghats',
    cover: 'https://images.unsplash.com/photo-1561361058-c24e0a14f0b2?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601999109332-542b18dbec57?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'gwalior': {
    landmark: 'Gwalior Fort & Man Mandir Palace',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/Gwalior_Fort_front.jpg/1280px-Gwalior_Fort_front.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1615469038759-8b1e4c7a6e19?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600577916048-804c9191e36c?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'agra': {
    landmark: 'Taj Mahal & Agra Fort',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg',
    gallery: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'taj-mahal': {
    landmark: 'Taj Mahal Marble Wonder of the World',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg',
    gallery: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'kedarnath': {
    landmark: 'Kedarnath Jyotirlinga Temple & Himalayan Peaks',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Kedarnath_Temple_in_Rainy_season.jpg/1280px-Kedarnath_Temple_in_Rainy_season.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'omkareshwar': {
    landmark: 'Shree Omkareshwar Jyotirlinga Temple on Mandhata Island',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Omkareswar_Jyotirlinga.jpg/1280px-Omkareswar_Jyotirlinga.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'vrindavan': {
    landmark: 'Prem Mandir & Shri Banke Bihari Temple',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/PremMandirSideViewFromCanteen.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1506461883276-594a12b11db3?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'mathura': {
    landmark: 'Shri Krishna Janmasthan Temple & Vishram Ghat',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Mathura_Temple-Mathura-India0002.JPG/1280px-Mathura_Temple-Mathura-India0002.JPG',
    gallery: [
      'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1554160454-7c9e0d16be9f?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'gokul': {
    landmark: 'Raman Reti & Nand Bhavan Gokul',
    cover: 'https://images.unsplash.com/photo-1560930950-5cc20e80e392?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1554160454-7c9e0d16be9f?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'bhopal': {
    landmark: 'Upper Lake (Bada Talab), Bhojeshwar Temple & Taj-ul-Masajid',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Shiva_Temple%2C_Bhojpur_01.jpg/1280px-Shiva_Temple%2C_Bhojpur_01.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1506461883276-594a12b11db3?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'gayaji': {
    landmark: 'Vishnupad Temple & Falgu River Ghats',
    cover: 'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1601999109332-542b18dbec57?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'delhi': {
    landmark: 'India Gate, Red Fort & Humayun Tomb',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/India_Gate_front.jpg/1280px-India_Gate_front.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'chennai': {
    landmark: 'Kapaleeshwarar Temple & Marina Beach',
    cover: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Kapaleeswarar1.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'tamil-nadu': {
    landmark: 'Meenakshi Amman Temple Madurai & Shore Temple Mahabalipuram',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg/1280px-An_aerial_view_of_Madurai_city_from_atop_of_Meenakshi_Amman_temple.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'bangalore': {
    landmark: 'Bangalore Palace & Vidhana Soudha',
    cover: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'goa': {
    landmark: 'Palolem Beach & Basilica of Bom Jesus',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Front_Elevation_of_Basilica_of_Bom_Jesus.jpg/1280px-Front_Elevation_of_Basilica_of_Bom_Jesus.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'manali': {
    landmark: 'Solang Valley, Rohtang Pass & Hidimba Devi Temple',
    cover: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598097067980-df85764d8a1c?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'kasol': {
    landmark: 'Parvati River Valley, Manikaran & Tosh',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598097067980-df85764d8a1c?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'mussoorie': {
    landmark: 'Kempty Falls, Gun Hill & Mall Road',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598097067980-df85764d8a1c?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'spiti': {
    landmark: 'Key Monastery & Spiti Valley Cold Desert',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/1000_Year_loop.jpg/1280px-1000_Year_loop.jpg',
    gallery: [
      'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'nagaland': {
    landmark: 'Hornbill Festival, Kisama Heritage & Dzukou Valley',
    cover: 'https://images.unsplash.com/photo-1618245341355-d2a2c1490216?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'chhattisgarh': {
    landmark: 'Chitrakote Waterfalls & Bhoramdeo Temple Bastar',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Chitrakot_waterfalls.JPG/1280px-Chitrakot_waterfalls.JPG',
    gallery: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'bali': {
    landmark: 'Tanah Lot, Uluwatu Temple & Tegalalang Rice Terraces',
    cover: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/TanahLot_2014.JPG/1280px-TanahLot_2014.JPG',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'phuket': {
    landmark: 'Phi Phi Islands, Big Buddha & Patong Beach',
    cover: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'new-york': {
    landmark: 'Manhattan Skyline, Statue of Liberty & Times Square',
    cover: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'new-york-city': {
    landmark: 'Central Park, Brooklyn Bridge & Empire State',
    cover: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'greenland': {
    landmark: 'Ilulissat Icefjord & Nuuk Harbor',
    cover: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'new-zealand': {
    landmark: 'Milford Sound Fjords & Mount Cook',
    cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'budapest-street-art': {
    landmark: 'Budapest Jewish Quarter Murals & Ruin Bars',
    cover: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517713982677-4b66332f98de?w=900&auto=format&fit=crop&q=80',
    ]
  },
  'destination': {
    landmark: 'Hawa Mahal Palace of Winds & Amber Fort Jaipur',
    cover: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1603288967990-28e469e38e6c?w=900&auto=format&fit=crop&q=80',
    ]
  }
};

async function uploadToCloudinary(url, publicId) {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'culturequest/destinations',
      public_id: publicId,
      overwrite: true,
      transformation: [
        { width: 1400, height: 900, crop: 'fill', gravity: 'auto', quality: 'auto:good' }
      ]
    });
    return result.secure_url;
  } catch (err) {
    console.warn(`Cloudinary upload failed for ${publicId}, using direct URL:`, err.message);
    return url;
  }
}

async function updateAllDestinationImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const destinations = await Destination.find({});
  console.log(`Found ${destinations.length} destinations in DB.`);

  for (const dest of destinations) {
    const slug = dest.slug?.toLowerCase();
    const config = ICONIC_LANDMARKS[slug] || ICONIC_LANDMARKS[dest.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')];

    if (config) {
      console.log(`\nProcessing [${dest.name}] -> Famous Landmark: ${config.landmark}`);

      // Upload cover image to Cloudinary
      const cPublicId = `${slug}_cover_landmark_${Date.now().toString().slice(-4)}`;
      const cUrl = await uploadToCloudinary(config.cover, cPublicId);

      dest.coverImage = cUrl;
      if (config.landmark) {
        dest.landmark = config.landmark;
      }

      // Upload gallery images if available
      if (config.gallery && config.gallery.length > 0) {
        const uploadedGallery = [];
        for (let i = 0; i < config.gallery.length; i++) {
          const gUrl = await uploadToCloudinary(config.gallery[i], `${slug}_gallery_${i + 1}`);
          uploadedGallery.push(gUrl);
        }
        dest.images = uploadedGallery;
      }

      await dest.save();
      console.log(`✓ Updated [${dest.name}] cover image to: ${dest.coverImage}`);
    } else {
      console.log(`- Skipping [${dest.name}] (no specific landmark mapping defined).`);
    }
  }

  console.log('\n=========================================');
  console.log('All destination images updated successfully!');
  console.log('=========================================');
  process.exit(0);
}

updateAllDestinationImages().catch(err => {
  console.error('Update script failed:', err);
  process.exit(1);
});
