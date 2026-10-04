const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  
  await mongoose.connection.db.collection('destinations').updateOne(
    { slug: 'new-zealand' },
    {
      $set: {
        coverImage: 'https://res.cloudinary.com/qycuwhhw/image/upload/v1791146159/culturequest/destinations/new-zealand/new-zealand_cover_real.jpg',
        images: [
          'https://res.cloudinary.com/qycuwhhw/image/upload/v1791146163/culturequest/destinations/new-zealand/gallery/new-zealand_gallery_1_real.jpg',
          'https://res.cloudinary.com/qycuwhhw/image/upload/v1791146179/culturequest/destinations/new-zealand/gallery/new-zealand_gallery_2_real.jpg',
          'https://res.cloudinary.com/qycuwhhw/image/upload/v1791146185/culturequest/destinations/new-zealand/gallery/new-zealand_gallery_3_real.jpg'
        ],
        gallery: [
          'https://res.cloudinary.com/qycuwhhw/image/upload/v1791146163/culturequest/destinations/new-zealand/gallery/new-zealand_gallery_1_real.jpg',
          'https://res.cloudinary.com/qycuwhhw/image/upload/v1791146179/culturequest/destinations/new-zealand/gallery/new-zealand_gallery_2_real.jpg',
          'https://res.cloudinary.com/qycuwhhw/image/upload/v1791146185/culturequest/destinations/new-zealand/gallery/new-zealand_gallery_3_real.jpg'
        ]
      }
    }
  );
  console.log('Fixed New Zealand cover & gallery!');
  process.exit(0);
}
fix();
