const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const landmarkMap = {
  'indore': {
    landmark: 'Rajwada Palace, Indore (7-Story Holkar Palace)',
    url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Rajwada_Indore_Front_View.jpg'
  },
  'ujjain': {
    landmark: 'Shree Mahakaleshwar Temple & Mahakal Lok, Ujjain',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Mahakaleshwar_temple%2C_Ujjain%2C_India.jpg',
    altUrl: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1600&q=85'
  },
  'agra': {
    landmark: 'Taj Mahal & Agra Fort, Agra',
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=85'
  },
  'taj-mahal': {
    landmark: 'Taj Mahal, Agra Front Reflection Pool',
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=85'
  },
  'varanasi': {
    landmark: 'Varanasi Ghats & Ganga Aarti',
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=85'
  },
  'delhi': {
    landmark: 'India Gate & Red Fort, Delhi',
    url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=85'
  },
  'gwalior': {
    landmark: 'Gwalior Fort (Man Mandir Palace)',
    url: 'https://images.unsplash.com/photo-1606298246186-08868ab77562?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Gwalior_Fort_Man_Mandir_Palace_front_facade.jpg'
  },
  'bhopal': {
    landmark: 'Upper Lake (Bada Talab) & VIP Road, Bhopal',
    url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Upper_Lake_Bhopal_Sunset.jpg'
  },
  'omkareshwar': {
    landmark: 'Omkareshwar Jyotirlinga Temple & Narmada River',
    url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Omkareshwar_temple_view_from_bridge.jpg'
  },
  'mathura': {
    landmark: 'Shri Krishna Janmabhoomi Temple, Mathura',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Krishna_Janmasthan_Temple_Complex_Mathura.jpg'
  },
  'vrindavan': {
    landmark: 'Prem Mandir / Banke Bihari, Vrindavan',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Prem_Mandir_Vrindavan_Night_View.jpg'
  },
  'gokul': {
    landmark: 'Raman Reti & Gokul Temple',
    url: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Raman_Reti_Gokul_Mathura.jpg'
  },
  'kedarnath': {
    landmark: 'Kedarnath Temple with Himalayas',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85'
  },
  'manali': {
    landmark: 'Solang Valley & Himalayas, Manali',
    url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85'
  },
  'mussoorie': {
    landmark: 'Mussoorie Hills & Gun Hill',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  },
  'kasol': {
    landmark: 'Parvati Valley & Pine Mountains, Kasol',
    url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=85'
  },
  'goa': {
    landmark: 'Goa Beaches & Palm Shores',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85'
  },
  'bangalore': {
    landmark: 'Bangalore Palace & Vidhana Soudha',
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=85'
  },
  'chennai': {
    landmark: 'Kapaleeshwarar Temple Gopuram, Chennai',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Kapaleeshwarar_Temple_Gopuram_Chennai.jpg'
  },
  'tamil-nadu': {
    landmark: 'Meenakshi Amman Temple / Mahabalipuram Shore Temple',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85'
  },
  'nagaland': {
    landmark: 'Dzukou Valley & Hornbill Hills, Nagaland',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Dzukou_Valley_Nagaland.jpg'
  },
  'bali': {
    landmark: 'Ulun Danu Beratan Temple, Bali',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85'
  },
  'phuket': {
    landmark: 'Maya Bay & Phi Phi Islands, Phuket',
    url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1600&q=85'
  },
  'new-york': {
    landmark: 'Manhattan Skyline & Empire State, New York',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=85'
  },
  'new-york-city': {
    landmark: 'New York City Skyline & Central Park',
    url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=85'
  },
  'new-zealand': {
    landmark: 'Milford Sound Fiordland, New Zealand',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85'
  },
  'greenland': {
    landmark: 'Ilulissat Icebergs & Fjord, Greenland',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1600&q=85'
  },
  'spiti': {
    landmark: 'Key Monastery & Spiti Valley',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Key_Monastery_Spiti_Valley_Himachal_Pradesh.jpg'
  },
  'chhattisgarh': {
    landmark: 'Chitrakote Waterfalls, Bastar, Chhattisgarh',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Chitrakoot_waterfalls_in_Chhattisgarh_India.jpg'
  },
  'gayaji': {
    landmark: 'Mahabodhi & Vishnupad Temple, Gaya',
    url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85',
    altUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Mahabodhi_Temple%2C_Bodh_Gaya.jpg'
  },
  'budapest-street-art': {
    landmark: 'Budapest Ruin Bars & Parliament',
    url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1600&q=85'
  },
  'destination': {
    landmark: 'Scenic World Heritage Discovery',
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=85'
  }
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected successfully');
  const collection = mongoose.connection.collection('destinations');
  const dests = await collection.find({}).toArray();

  for (const d of dests) {
    const slug = d.slug || (d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
    const mapped = landmarkMap[slug] || landmarkMap[d.name?.toLowerCase()] || null;

    let targetUrl = mapped ? mapped.url : null;
    if (!targetUrl) {
      targetUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=85';
    }

    try {
      console.log(`Uploading landmark for [${d.name}] (${slug}) -> ${mapped?.landmark || 'General'}`);
      const uploadRes = await cloudinary.uploader.upload(targetUrl, {
        folder: 'culturequest/destinations',
        public_id: `${slug}_cover_landmark`,
        overwrite: true,
        resource_type: 'image'
      });

      console.log(`=> Success: ${uploadRes.secure_url}`);
      await collection.updateOne(
        { _id: d._id },
        { $set: { coverImage: uploadRes.secure_url } }
      );
    } catch (err) {
      console.error(`Failed primary for ${slug}: ${err.message}`);
      if (mapped?.altUrl) {
        try {
          console.log(`Trying altUrl for ${slug}...`);
          const altRes = await cloudinary.uploader.upload(mapped.altUrl, {
            folder: 'culturequest/destinations',
            public_id: `${slug}_cover_landmark`,
            overwrite: true,
            resource_type: 'image'
          });
          console.log(`=> Alt Success: ${altRes.secure_url}`);
          await collection.updateOne(
            { _id: d._id },
            { $set: { coverImage: altRes.secure_url } }
          );
        } catch (altErr) {
          console.error(`Alt failed too for ${slug}: ${altErr.message}`);
        }
      }
    }
  }

  console.log('ALL destination cover images successfully updated!');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
