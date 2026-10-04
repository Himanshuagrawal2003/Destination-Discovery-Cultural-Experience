const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Destination = require('../models/Destination');

async function setFeatured() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const slugs = ['indore', 'ujjain', 'varanasi', 'agra', 'gwalior', 'kedarnath', 'omkareshwar', 'vrindavan'];
  const res = await Destination.updateMany(
    { slug: { $in: slugs } },
    { $set: { isFeatured: true, isTrending: true, isActive: true } }
  );
  console.log('Updated featured count:', res.modifiedCount);

  const featured = await Destination.find({ isFeatured: true }).select('name slug landmark coverImage isFeatured').lean();
  console.log(`\nFound ${featured.length} Featured Destinations:`);
  featured.forEach((d, i) => {
    console.log(`${i + 1}. ${d.name} (${d.slug})`);
    console.log(`   Cover: ${d.coverImage}`);
  });

  process.exit(0);
}

setFeatured().catch(err => {
  console.error(err);
  process.exit(1);
});
