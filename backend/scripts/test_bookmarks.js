require('dotenv').config();
const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');

const run = async () => {
  try {
    console.log('🔌 Connecting to MongoDB for tests...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    console.log('\n--- 🔒 Security Test: Reject "experience" itemType ---');
    try {
      const invalidBookmark = new Bookmark({
        user: new mongoose.Types.ObjectId(),
        itemType: 'experience',
        experience: new mongoose.Types.ObjectId()
      });
      await invalidBookmark.validate();
      console.error('❌ FAILURE: "experience" itemType was accepted by validator, but should have been rejected!');
    } catch (err) {
      console.log('✅ SUCCESS: "experience" itemType was correctly rejected by schema validation:', err.message);
    }

    console.log('\n--- 🧪 Validation Test: Accept valid itemTypes ---');
    const validTypes = ['destination', 'event', 'hidden-gem'];
    for (const type of validTypes) {
      try {
        const fields = {
          user: new mongoose.Types.ObjectId(),
          itemType: type
        };
        if (type === 'destination') fields.destination = new mongoose.Types.ObjectId();
        if (type === 'event') fields.event = new mongoose.Types.ObjectId();
        if (type === 'hidden-gem') fields.hiddenGem = new mongoose.Types.ObjectId();

        const testBookmark = new Bookmark(fields);
        await testBookmark.validate();
        console.log(`✅ SUCCESS: Valid itemType "${type}" accepted.`);
      } catch (err) {
        console.error(`❌ FAILURE: Valid itemType "${type}" rejected:`, err.message);
      }
    }

    console.log('\n========================================');
    console.log('🎉 Bookmark Schema Security Tests Completed!');
  } catch (err) {
    console.error('❌ Error during testing:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Closed database connection.');
  }
};

run();
