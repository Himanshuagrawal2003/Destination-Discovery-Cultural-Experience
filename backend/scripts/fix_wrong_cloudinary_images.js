const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config({ path: __dirname + "/../.env" });
cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const CORRECT_IMAGES = require("./correct_images_data.json");
async function run() {
  console.log("Connecting...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected!");
  const destColl = mongoose.connection.collection("destinations");
  const allDests = await destColl.find({}).toArray();
  let fixed = 0, skipped = 0;
  for (const d of allDests) {
    const slug = d.slug || (d.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const mapping = CORRECT_IMAGES[slug];
    if (!mapping) { console.log("SKIP: " + d.name + " (" + slug + ")"); skipped++; continue; }
    console.log("\nFixing: " + d.name + " (" + slug + ")");
    let coverUrl = "";
    try {
      const r = await cloudinary.uploader.upload(mapping.cover, { folder: "culturequest/destination_covers", public_id: slug + "_cover", overwrite: true });
      coverUrl = r.secure_url; console.log("  Cover OK: " + coverUrl.slice(50, 100));
    } catch(e) { console.error("  Cover FAIL: " + e.message); coverUrl = mapping.cover; }
    const gal = [];
    for (let i = 0; i < mapping.gallery.length; i++) {
      try {
        const g = await cloudinary.uploader.upload(mapping.gallery[i], { folder: "culturequest/destination_gallery", public_id: slug + "_gallery_" + (i+1), overwrite: true });
        gal.push(g.secure_url); console.log("  Gallery " + (i+1) + " OK");
      } catch(e) { console.warn("  Gal fail: " + e.message); gal.push(mapping.gallery[i]); }
    }
    const upd = {}; upd["$set"] = { coverImage: coverUrl, gallery: gal, images: gal };
    await destColl.updateOne({ _id: d._id }, upd);
    console.log("  DB updated!"); fixed++;
  }
  console.log("DONE: fixed=" + fixed + " skipped=" + skipped);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
