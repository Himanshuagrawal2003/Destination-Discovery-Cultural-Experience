const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function syncAll() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  const dests = await mongoose.connection.db.collection('destinations').find({}).toArray();
  for (const d of dests) {
    if (d.gallery && d.gallery.length > 0) {
      await mongoose.connection.db.collection('destinations').updateOne(
        { _id: d._id },
        { $set: { images: d.gallery } }
      );
      console.log(`Synced ${d.name} (${d.slug}): images = gallery (${d.gallery.length} photos)`);
    }
  }
  console.log('All destination images synced!');
  process.exit(0);
}

syncAll().catch(err => {
  console.error(err);
  process.exit(1);
});
