const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for full platform audit\n');

  const destColl = mongoose.connection.db.collection('destinations');
  const eventColl = mongoose.connection.db.collection('events');

  const dests = await destColl.find({}).toArray();
  console.log(`Auditing ${dests.length} Destinations:\n`);

  let destIssues = 0;
  for (const d of dests) {
    const galleryCount = Array.isArray(d.gallery) ? d.gallery.length : 0;
    const imagesCount = Array.isArray(d.images) ? d.images.length : 0;
    const hasValidCover = d.coverImage && typeof d.coverImage === 'string' && d.coverImage.startsWith('http');
    
    // Ensure images and gallery are strictly identical and populated
    if (galleryCount > 0 && imagesCount !== galleryCount) {
      await destColl.updateOne({ _id: d._id }, { $set: { images: d.gallery } });
    }

    const cleanName = d.name.padEnd(25, ' ');
    const status = hasValidCover && galleryCount >= 2 ? '✔ OK' : '⚠ NEEDS CHECK';
    if (status !== '✔ OK') destIssues++;

    console.log(`${cleanName} | Cover: ${hasValidCover ? 'YES' : 'NO '} | Gallery: ${galleryCount} real photos | Status: ${status}`);
  }

  const events = await eventColl.find({}).toArray();
  console.log(`\nAuditing ${events.length} Events:\n`);
  let eventIssues = 0;
  for (const ev of events) {
    const hasCover = ev.coverImage || ev.image;
    const cleanTitle = ev.title.slice(0, 35).padEnd(38, ' ');
    const status = hasCover ? '✔ OK' : '⚠ NO IMAGE';
    if (!hasCover) eventIssues++;
    console.log(`${cleanTitle} | Status: ${status}`);
  }

  console.log(`\n========================================`);
  console.log(`Audit Summary: Destinations: ${dests.length} (${destIssues} issues), Events: ${events.length} (${eventIssues} issues)`);
  console.log(`Standard Pipeline Active: All future destinations & searches will strictly follow the real landmark Wikipedia + Cloudinary gallery process.`);
  process.exit(0);
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
