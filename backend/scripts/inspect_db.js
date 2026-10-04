const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  
  const dests = await mongoose.connection.db.collection('destinations').find({}).toArray();
  console.log('\n--- DESTINATIONS (' + dests.length + ') ---');
  dests.forEach(d => {
    console.log(JSON.stringify({
      id: d._id,
      slug: d.slug,
      name: d.name,
      state: d.state,
      country: d.country,
      coverImage: typeof d.coverImage === 'string' ? d.coverImage.slice(0, 60) : d.coverImage,
      galleryCount: Array.isArray(d.gallery) ? d.gallery.length : 0
    }));
  });

  const events = await mongoose.connection.db.collection('events').find({}).toArray();
  console.log('\n--- EVENTS (' + events.length + ') ---');
  events.forEach(e => {
    console.log(JSON.stringify({
      id: e._id,
      title: e.title,
      destination: e.destination,
      image: typeof e.image === 'string' ? e.image.slice(0, 60) : e.image
    }));
  });

  process.exit(0);
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
