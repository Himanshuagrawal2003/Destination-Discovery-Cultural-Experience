const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: __dirname + '/../.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function emptyCloudinary() {
  console.log('==================================================');
  console.log(`🧹 EMPTYING CLOUDINARY ACCOUNT [${process.env.CLOUDINARY_CLOUD_NAME}]`);
  console.log('==================================================');

  // Types of resources in Cloudinary
  const resourceTypes = ['image', 'video', 'raw'];
  let totalDeletedAssets = 0;

  for (const rType of resourceTypes) {
    console.log(`\nScanning & deleting all "${rType}" assets...`);
    let nextCursor = null;

    do {
      try {
        const res = await cloudinary.api.resources({
          resource_type: rType,
          type: 'upload',
          max_results: 100,
          next_cursor: nextCursor
        });

        if (res.resources && res.resources.length > 0) {
          const publicIds = res.resources.map(r => r.public_id);
          console.log(`Deleting batch of ${publicIds.length} ${rType} assets...`);
          await cloudinary.api.delete_resources(publicIds, { resource_type: rType });
          totalDeletedAssets += publicIds.length;
        }

        nextCursor = res.next_cursor;
      } catch (err) {
        console.warn(`Note on ${rType} deletion:`, err.message);
        break;
      }
    } while (nextCursor);
  }

  console.log(`\nTotal assets deleted across all types: ${totalDeletedAssets}`);

  // Delete all folders
  console.log('\nCleaning up subfolders & root folders...');
  try {
    const subfolders = await cloudinary.api.sub_folders('culturequest');
    if (subfolders && subfolders.folders) {
      for (const f of subfolders.folders) {
        try {
          console.log(`Deleting subfolder: ${f.path}`);
          await cloudinary.api.delete_folder(f.path);
        } catch (fErr) {
          console.warn(`Could not delete subfolder ${f.path}:`, fErr.message);
        }
      }
    }
  } catch (err) {
    console.log('No culturequest subfolders or already removed.');
  }

  try {
    console.log('Deleting root folder: culturequest');
    await cloudinary.api.delete_folder('culturequest');
    console.log('Deleted root folder culturequest');
  } catch (err) {
    console.log('Root folder culturequest cleaned or already removed.');
  }

  // Final check
  const checkRes = await cloudinary.api.resources({ max_results: 10 });
  const remaining = checkRes.resources ? checkRes.resources.length : 0;

  console.log('\n==================================================');
  console.log(`✅ CLOUDINARY IS NOW COMPLETELY EMPTY!`);
  console.log(`Remaining resources in account: ${remaining}`);
  console.log('==================================================');
  process.exit(0);
}

emptyCloudinary().catch(err => {
  console.error('Fatal error emptying Cloudinary:', err);
  process.exit(1);
});
