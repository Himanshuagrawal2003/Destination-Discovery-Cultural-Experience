const https = require('https');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CultureQuestApp/1.0 (contact@culturequest.com)' } }, (res) => {
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

async function getWikiImageUrl(wikiTitle) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const data = await fetchBuffer(url);
    const json = JSON.parse(data.toString());
    return json.originalimage?.source || json.thumbnail?.source || null;
  } catch (err) {
    return null;
  }
}

function uploadToCloudinary(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, overwrite: true, resource_type: 'image' },
      (err, result) => err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });
}

const extras = {
  'gokul': ['Gokul', 'Krishna_Janmasthan_Temple_Complex', 'Vishram_Ghat', 'Prem_Mandir,_Vrindavan'],
  'chhattisgarh': ['Chitrakote_Falls', 'Tirathgarh_Falls', 'Bastar_palace', 'Sirpur_Group_of_Monuments'],
  'mussoorie': ['Kempty_Falls', 'Mussoorie', 'Robber\'s_Cave,_Guchhupani', 'Dehradun'],
  'indore': ['Rajwada', 'Lal_Bagh_Palace,_Indore', 'Khajrana_Ganesh_Temple', 'Sarafa_Bazaar', 'Krishnapura_Chhatris'],
  'ujjain': ['Mahakaleshwar_Jyotirlinga', 'Ram_Ghat,_Ujjain', 'Kal_Bhairav_Temple,_Ujjain', 'Shipra_River']
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const destColl = mongoose.connection.db.collection('destinations');

  for (const [slug, wikiList] of Object.entries(extras)) {
    console.log(`Enriching ${slug}...`);
    const urls = [];
    for (let i = 0; i < wikiList.length; i++) {
      const wiki = wikiList[i];
      const img = await getWikiImageUrl(wiki);
      if (img) {
        try {
          const buf = await fetchBuffer(img);
          const res = await uploadToCloudinary(buf, `culturequest/destinations/${slug}/gallery`, `${slug}_extra_${i + 1}`);
          urls.push(res.secure_url);
          console.log(`  ✔ [${wiki}] -> ${res.secure_url}`);
        } catch (e) {
          console.warn(`  Failed ${wiki}:`, e.message);
        }
      }
    }
    if (urls.length > 0) {
      await destColl.updateOne(
        { slug },
        { $set: { coverImage: urls[0], gallery: urls, images: urls } }
      );
      console.log(`✔ Synced ${slug} with ${urls.length} real photos!`);
    }
  }

  console.log('All remaining destinations enriched!');
  process.exit(0);
}
run();
