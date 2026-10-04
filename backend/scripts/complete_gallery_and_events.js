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
    if (json.originalimage && json.originalimage.source) {
      return json.originalimage.source;
    }
    if (json.thumbnail && json.thumbnail.source) {
      return json.thumbnail.source;
    }
    return null;
  } catch (err) {
    return null;
  }
}

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

// Complete rich landmark galleries for each destination
const destinationGalleries = {
  'indore': [
    { title: 'Rajwada Palace', wiki: 'Rajwada' },
    { title: 'Lal Bagh Palace', wiki: 'Lal_Bagh_Palace,_Indore' },
    { title: 'Khajrana Ganesh', wiki: 'Khajrana_Ganesh_Temple' },
    { title: 'Sarafa Bazaar Night Food', wiki: 'Sarafa_Bazaar' },
    { title: 'Chhatris of Indore', wiki: 'Krishnapura_Chhatris' }
  ],
  'gwalior': [
    { title: 'Gwalior Fort', wiki: 'Gwalior_Fort' },
    { title: 'Jai Vilas Mahal', wiki: 'Jai_Vilas_Mahal' },
    { title: 'Sas Bahu Temples', wiki: 'Sas_Bahu_Temples,_Gwalior' },
    { title: 'Teli Ka Mandir', wiki: 'Teli_ka_Mandir' },
    { title: 'Tomb of Tansen', wiki: 'Tomb_of_Tansen' }
  ],
  'ujjain': [
    { title: 'Mahakaleshwar Jyotirlinga', wiki: 'Mahakaleshwar_Jyotirlinga' },
    { title: 'Ram Ghat Shipra', wiki: 'Ram_Ghat,_Ujjain' },
    { title: 'Kal Bhairav Temple', wiki: 'Kal_Bhairav_Temple,_Ujjain' },
    { title: 'Harsiddhi Temple', wiki: 'Harsiddhi_Temple' },
    { title: 'Mahakal Corridor', wiki: 'Mahakal_Mahalok' }
  ],
  'bhopal': [
    { title: 'Taj-ul-Masajid', wiki: 'Taj-ul-Masajid' },
    { title: 'Upper Lake Bada Talab', wiki: 'Upper_Lake_(Bhopal)' },
    { title: 'Bhojeshwar Temple', wiki: 'Bhojeshwar_Temple' },
    { title: 'Van Vihar National Park', wiki: 'Van_Vihar_National_Park' },
    { title: 'Bhimbetka Rock Shelters', wiki: 'Bhimbetka_rock_shelters' }
  ],
  'omkareshwar': [
    { title: 'Omkareshwar Jyotirlinga', wiki: 'Omkareshwar_Temple' },
    { title: 'Mamleshwar Temple', wiki: 'Mamleshwar_temple' },
    { title: 'Narmada River Ghats', wiki: 'Narmada_River' }
  ],
  'agra': [
    { title: 'Taj Mahal', wiki: 'Taj_Mahal' },
    { title: 'Agra Fort', wiki: 'Agra_Fort' },
    { title: 'Fatehpur Sikri', wiki: 'Fatehpur_Sikri' },
    { title: 'Tomb of Akbar', wiki: 'Tomb_of_Akbar_the_Great' },
    { title: 'Mehtab Bagh', wiki: 'Mehtab_Bagh' }
  ],
  'taj-mahal': [
    { title: 'Taj Mahal Front', wiki: 'Taj_Mahal' },
    { title: 'Mehtab Bagh Sunset', wiki: 'Mehtab_Bagh' },
    { title: 'Agra Fort Palace', wiki: 'Agra_Fort' }
  ],
  'mathura': [
    { title: 'Krishna Janmabhoomi', wiki: 'Krishna_Janmasthan_Temple_Complex' },
    { title: 'Dwarkadhish Temple', wiki: 'Dwarkadhish_Temple,_Mathura' },
    { title: 'Vishram Ghat', wiki: 'Vishram_Ghat' },
    { title: 'Govardhan Hill', wiki: 'Govardhan_hill' }
  ],
  'vrindavan': [
    { title: 'Prem Mandir', wiki: 'Prem_Mandir,_Vrindavan' },
    { title: 'Banke Bihari Temple', wiki: 'Bankey_Bihari_Temple' },
    { title: 'Radha Raman Temple', wiki: 'Radha_Raman_Temple' },
    { title: 'ISKCON Vrindavan', wiki: 'Krishna-Balaram_Temple' }
  ],
  'gokul': [
    { title: 'Gokul Dham', wiki: 'Gokul' },
    { title: 'Raman Reti', wiki: 'Raman_Reti' },
    { title: 'Chaurasi Khamba', wiki: 'Mahaban' }
  ],
  'delhi': [
    { title: 'India Gate', wiki: 'India_Gate' },
    { title: 'Red Fort', wiki: 'Red_Fort' },
    { title: 'Humayun Tomb', wiki: 'Humayun\'s_Tomb' },
    { title: 'Qutb Minar', wiki: 'Qutb_Minar' },
    { title: 'Lotus Temple', wiki: 'Lotus_Temple' }
  ],
  'varanasi': [
    { title: 'Dashashwamedh Ghat Aarti', wiki: 'Dashashwamedh_Ghat' },
    { title: 'Kashi Vishwanath Temple', wiki: 'Kashi_Vishwanath_Temple' },
    { title: 'Manikarnika Ghat', wiki: 'Manikarnika_Ghat' },
    { title: 'Assi Ghat', wiki: 'Assi_Ghat' },
    { title: 'Sarnath', wiki: 'Sarnath' }
  ],
  'kedarnath': [
    { title: 'Kedarnath Temple', wiki: 'Kedarnath_Temple' },
    { title: 'Bhairavnath Temple', wiki: 'Bhairavnath_Temple,_Kedarnath' },
    { title: 'Mandakini River Valley', wiki: 'Mandakini_River' }
  ],
  'manali': [
    { title: 'Solang Valley', wiki: 'Solang_Valley' },
    { title: 'Hadimba Temple', wiki: 'Hadimba_Temple' },
    { title: 'Rohtang Pass', wiki: 'Rohtang_Pass' },
    { title: 'Jogini Waterfall', wiki: 'Vashisht,_Himachal_Pradesh' }
  ],
  'mussoorie': [
    { title: 'Kempty Falls', wiki: 'Kempty_Falls' },
    { title: 'Gun Hill', wiki: 'Gun_Hill,_Mussoorie' },
    { title: 'Lal Tibba', wiki: 'Lal_Tibba' },
    { title: 'Company Garden', wiki: 'Mussoorie' }
  ],
  'kasol': [
    { title: 'Parvati Valley', wiki: 'Parvati_Valley' },
    { title: 'Manikaran Sahib Gurudwara', wiki: 'Manikaran' },
    { title: 'Tosh Village', wiki: 'Tosh,_Himachal_Pradesh' },
    { title: 'Malana Village', wiki: 'Malana,_Himachal_Pradesh' }
  ],
  'spiti': [
    { title: 'Key Monastery', wiki: 'Key_Monastery' },
    { title: 'Spiti Valley Landscape', wiki: 'Spiti_Valley' },
    { title: 'Chandratal Lake', wiki: 'Chandratal' },
    { title: 'Dhankar Gompa', wiki: 'Dhankar_Gompa' }
  ],
  'chennai': [
    { title: 'Kapaleeshwarar Temple', wiki: 'Kapaleeshwarar_Temple' },
    { title: 'Marina Beach', wiki: 'Marina_Beach' },
    { title: 'San Thome Basilica', wiki: 'San_Thome_Basilica' },
    { title: 'Fort St. George', wiki: 'Fort_St._George,_India' }
  ],
  'tamil-nadu': [
    { title: 'Meenakshi Amman Temple', wiki: 'Meenakshi_Temple' },
    { title: 'Shore Temple Mahabalipuram', wiki: 'Shore_Temple' },
    { title: 'Brihadisvara Temple Thanjavur', wiki: 'Brihadisvara_Temple,_Thanjavur' },
    { title: 'Ramanathaswamy Temple Rameswaram', wiki: 'Ramanathaswamy_Temple' }
  ],
  'bangalore': [
    { title: 'Bangalore Palace', wiki: 'Bangalore_Palace' },
    { title: 'Vidhana Soudha', wiki: 'Vidhana_Soudha' },
    { title: 'Lalbagh Botanical Garden', wiki: 'Lalbagh_Botanical_Garden' },
    { title: 'Cubbon Park', wiki: 'Cubbon_Park' }
  ],
  'goa': [
    { title: 'Palolem Beach', wiki: 'Palolem_Beach' },
    { title: 'Basilica of Bom Jesus', wiki: 'Basilica_of_Bom_Jesus' },
    { title: 'Dudhsagar Falls', wiki: 'Dudhsagar_Falls' },
    { title: 'Aguada Fort', wiki: 'Fort_Aguada' }
  ],
  'udaipur': [
    { title: 'City Palace Udaipur', wiki: 'City_Palace,_Udaipur' },
    { title: 'Lake Pichola', wiki: 'Lake_Pichola' },
    { title: 'Jag Mandir', wiki: 'Jag_Mandir' },
    { title: 'Saheliyon Ki Bari', wiki: 'Saheliyon-ki-Bari' }
  ],
  'manipur': [
    { title: 'Loktak Lake', wiki: 'Loktak_Lake' },
    { title: 'Kangla Fort', wiki: 'Kangla_Fort' },
    { title: 'Keibul Lamjao National Park', wiki: 'Keibul_Lamjao_National_Park' },
    { title: 'Ima Keithel Market', wiki: 'Ima_Keithel' }
  ],
  'nagaland': [
    { title: 'Dzükou Valley', wiki: 'Dzükou_Valley' },
    { title: 'Kohima War Cemetery', wiki: 'Kohima_War_Cemetery' },
    { title: 'Hornbill Festival Heritage Village', wiki: 'Hornbill_Festival' },
    { title: 'Kisama Heritage Village', wiki: 'Kisama_Heritage_Village' }
  ],
  'chhattisgarh': [
    { title: 'Chitrakote Waterfalls', wiki: 'Chitrakote_Falls' },
    { title: 'Tirathgarh Waterfalls', wiki: 'Tirathgarh_Falls' },
    { title: 'Bastar Palace', wiki: 'Bastar_palace' },
    { title: 'Sirpur Monuments', wiki: 'Sirpur_Group_of_Monuments' }
  ],
  'gayaji': [
    { title: 'Mahabodhi Temple Bodh Gaya', wiki: 'Mahabodhi_Temple' },
    { title: 'Vishnupad Temple', wiki: 'Vishnupad_Temple,_Gaya' },
    { title: 'Great Buddha Statue', wiki: 'Great_Buddha_Statue,_Bodh_Gaya' },
    { title: 'Dungeshwari Cave Temples', wiki: 'Bodh_Gaya' }
  ],
  'bali': [
    { title: 'Ulun Danu Beratan Temple', wiki: 'Ulun_Danu_Beratan_Temple' },
    { title: 'Tanah Lot', wiki: 'Tanah_Lot' },
    { title: 'Ubud Monkey Forest', wiki: 'Ubud_Monkey_Forest' },
    { title: 'Tegallalang Rice Terraces', wiki: 'Tegallalang' }
  ],
  'phuket': [
    { title: 'Phi Phi Islands', wiki: 'Phi_Phi_Islands' },
    { title: 'Phang Nga Bay', wiki: 'Phang_Nga_Bay' },
    { title: 'Old Phuket Town', wiki: 'Phuket_(city)' },
    { title: 'Karon Beach', wiki: 'Phuket_Province' }
  ],
  'new-york': [
    { title: 'Manhattan Skyline', wiki: 'Manhattan' },
    { title: 'Central Park', wiki: 'Central_Park' },
    { title: 'Statue of Liberty', wiki: 'Statue_of_Liberty' },
    { title: 'Empire State Building', wiki: 'Empire_State_Building' }
  ],
  'new-york-city': [
    { title: 'Times Square', wiki: 'Times_Square' },
    { title: 'Brooklyn Bridge', wiki: 'Brooklyn_Bridge' },
    { title: 'Empire State Building', wiki: 'Empire_State_Building' },
    { title: 'Central Park Lake', wiki: 'Central_Park' }
  ],
  'new-zealand': [
    { title: 'Milford Sound', wiki: 'Milford_Sound' },
    { title: 'Mount Cook', wiki: 'Aoraki_/_Mount_Cook' },
    { title: 'Rotorua Geothermal', wiki: 'Rotorua' },
    { title: 'Lake Wanaka', wiki: 'Lake_Wānaka' }
  ],
  'greenland': [
    { title: 'Ilulissat Icefjord', wiki: 'Ilulissat_Icefjord' },
    { title: 'Nuuk Capital Harbor', wiki: 'Nuuk' },
    { title: 'Disko Island', wiki: 'Disko_Island' }
  ],
  'budapest-street-art': [
    { title: 'Hungarian Parliament Building', wiki: 'Hungarian_Parliament_Building' },
    { title: 'Buda Castle', wiki: 'Buda_Castle' },
    { title: 'Széchenyi Thermal Bath', wiki: 'Széchenyi_thermal_bath' },
    { title: 'Fisherman\'s Bastion', wiki: 'Fisherman\'s_Bastion' }
  ],
  'destination': [
    { title: 'Hampi Virupaksha Temple', wiki: 'Hampi' },
    { title: 'Ellora Kailasa Temple', wiki: 'Ellora_Caves' },
    { title: 'Ajanta Cave Paintings', wiki: 'Ajanta_Caves' }
  ]
};

async function execute() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected. Enhancing all destination galleries and events...');

  const destColl = mongoose.connection.db.collection('destinations');
  const eventColl = mongoose.connection.db.collection('events');

  const dests = await destColl.find({}).toArray();

  for (const d of dests) {
    const slug = d.slug || d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const galleryPlan = destinationGalleries[slug] || [
      { title: d.name, wiki: d.name }
    ];

    console.log(`\n----------------------------------------`);
    console.log(`Processing complete gallery for: ${d.name} (${slug})`);

    const realImages = [];
    for (let i = 0; i < galleryPlan.length; i++) {
      const item = galleryPlan[i];
      try {
        const imgUrl = await getWikiImageUrl(item.wiki);
        if (imgUrl) {
          console.log(`  Downloading [${item.title}] (${item.wiki})...`);
          const buf = await fetchBuffer(imgUrl);
          const folder = `culturequest/destinations/${slug}/gallery`;
          const pubId = `${slug}_real_${i + 1}`;
          const res = await uploadToCloudinary(buf, folder, pubId);
          realImages.push(res.secure_url);
          console.log(`  ✔ [${item.title}] -> ${res.secure_url}`);
        } else {
          console.log(`  ⚠ No wiki image for ${item.wiki}`);
        }
      } catch (err) {
        console.warn(`  Failed ${item.title}: ${err.message}`);
      }
    }

    if (realImages.length > 0) {
      // First image as cover if not set or update cover
      const coverUrl = realImages[0];
      await destColl.updateOne(
        { _id: d._id },
        {
          $set: {
            coverImage: coverUrl,
            images: realImages,
            gallery: realImages
          }
        }
      );
      console.log(`✔ Updated ${d.name}: Cover + ${realImages.length} Gallery Photos in both 'images' and 'gallery'`);
    }
  }

  // Update all events with accurate real event images
  console.log(`\n----------------------------------------`);
  console.log(`Ensuring ALL events have matching real images...`);
  const allEvents = await eventColl.find({}).toArray();
  for (const ev of allEvents) {
    // Check if event has a destination and match
    let eventWiki = null;
    if (/Mahashivratri/i.test(ev.title)) eventWiki = 'Mahakaleshwar_Jyotirlinga';
    else if (/Dev Deepawali/i.test(ev.title)) eventWiki = 'Dev_Deepawali_(Varanasi)';
    else if (/Holi/i.test(ev.title)) eventWiki = 'Lathmar_Holi';
    else if (/Rangpanchami|Gair/i.test(ev.title)) eventWiki = 'Rajwada';
    else if (/Hornbill/i.test(ev.title)) eventWiki = 'Hornbill_Festival';
    else if (/Goa/i.test(ev.title)) eventWiki = 'Goa_Carnival';
    else if (/Taj/i.test(ev.title)) eventWiki = 'Taj_Mahal';
    else if (/Kite|Uttarayan/i.test(ev.title)) eventWiki = 'International_Kite_Festival_in_Gujarat_–_Uttarayan';
    else if (/Mewar/i.test(ev.title)) eventWiki = 'City_Palace,_Udaipur';
    else if (/Shilpgram/i.test(ev.title)) eventWiki = 'Shilpgram,_Udaipur';
    else if (/Gangaur/i.test(ev.title)) eventWiki = 'Gangaur';
    else if (/Matariki/i.test(ev.title)) eventWiki = 'Matariki';
    else if (/Lantern/i.test(ev.title)) eventWiki = 'Auckland_Lantern_Festival';
    else if (/Food|Mughal/i.test(ev.title)) eventWiki = 'Agra_Fort';
    else if (/Masjid|Moti/i.test(ev.title)) eventWiki = 'Moti_Masjid_(Agra_Fort)';
    else if (/Yaoshang/i.test(ev.title)) eventWiki = 'Yaoshang';
    else if (/Lai Haraoba/i.test(ev.title)) eventWiki = 'Lai_Haraoba';
    else if (/Sangai/i.test(ev.title)) eventWiki = 'Sangai_festival';
    else if (/Pasifika/i.test(ev.title)) eventWiki = 'Pasifika_Festival';
    else if (/WearableArt/i.test(ev.title)) eventWiki = 'World_of_WearableArt';

    if (eventWiki) {
      try {
        const evImgUrl = await getWikiImageUrl(eventWiki);
        if (evImgUrl) {
          const buf = await fetchBuffer(evImgUrl);
          const slug = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
          const res = await uploadToCloudinary(buf, 'culturequest/events', `event_${slug}_real`);
          await eventColl.updateOne(
            { _id: ev._id },
            {
              $set: {
                coverImage: res.secure_url,
                image: res.secure_url,
                images: [res.secure_url]
              }
            }
          );
          console.log(`✔ Event [${ev.title}] synced -> ${res.secure_url}`);
        }
      } catch (err) {
        console.warn(`Failed event ${ev.title}:`, err.message);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`🎉 ALL DESTINATIONS & EVENTS FULLY ENRICHED WITH REAL LANDMARK GALLERIES!`);
  process.exit(0);
}

execute().catch(err => {
  console.error(err);
  process.exit(1);
});
