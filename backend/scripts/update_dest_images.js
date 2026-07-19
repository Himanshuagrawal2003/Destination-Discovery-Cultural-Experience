require('dotenv').config();
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const { cloudinary } = require('../config/cloudinary');

// Helper to fetch with retry & exponential back-off
const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      console.log(`[HTTP Request] Fetching URL: ${url} (Attempt ${attempt + 1}/${retries})`);
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'CultureQuestAI/1.0 (himanshuagrawal7766@gmail.com; developer)',
          ...(options.headers || {})
        }
      });

      console.log(`[HTTP Response] Status Code: ${response.status} for ${url}`);

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : backoff * Math.pow(2, attempt);
        console.warn(`⚠️ Received 429 Rate Limit for ${url}. Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (err) {
      console.error(`❌ Fetch failed for ${url} (Attempt ${attempt + 1}/${retries}):`, err.message);
      attempt++;
      if (attempt >= retries) throw err;
      const delay = backoff * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// URL Sanitizer & Validator
const sanitizeAndValidateWikimediaUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    let sanitized = url.trim();
    // Fix typos in domain name
    sanitized = sanitized.replace(/https?:\/\/(upload\.)?w+ikimedia\.o+r+g/i, 'https://upload.wikimedia.org');
    sanitized = sanitized.replace(/https?:\/\/(upload\.)?wikimedia\.o+r+g/i, 'https://upload.wikimedia.org');
    // Fix double slash after domain name
    sanitized = sanitized.replace(/(https?:\/\/upload\.wikimedia\.org)\/+/gi, '$1/');
    // Fix w-typos in wikipedia path
    sanitized = sanitized.replace(/org\/w+ikipedia/i, 'org/wikipedia');

    const parsed = new URL(sanitized);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (parsed.hostname !== 'upload.wikimedia.org') return null;
    if (!parsed.pathname.startsWith('/wikipedia/')) return null;

    return parsed.href;
  } catch (err) {
    console.warn(`⚠️ URL sanitization failed for "${url}":`, err.message);
    return null;
  }
};

// Retrieve images directly from a Wikipedia page article
const getWikiPageImages = async (query, limit = 5) => {
  try {
    console.log(`[Wikimedia Search] Searching Wikipedia for primary article of "${query}"...`);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&origin=*`;
    const searchRes = await fetchWithRetry(searchUrl);
    const searchData = await searchRes.json();
    console.log(`[Wikimedia Search] Search response for "${query}":`, JSON.stringify(searchData).slice(0, 500));

    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      console.log(`[Wikimedia Search] No articles found on Wikipedia for "${query}"`);
      return [];
    }

    const bestPage = searchData.query.search[0];
    console.log(`[Wikimedia Search] Best article match for "${query}": "${bestPage.title}"`);

    // Fetch images list from the article page
    const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${encodeURIComponent(bestPage.title)}&imlimit=50&origin=*`;
    const imagesRes = await fetchWithRetry(imagesUrl);
    const imagesData = await imagesRes.json();
    console.log(`[Wikimedia Search] Page images response:`, JSON.stringify(imagesData).slice(0, 500));

    if (!imagesData.query || !imagesData.query.pages) return [];
    const pages = Object.values(imagesData.query.pages);
    if (pages.length === 0 || !pages[0].images) {
      console.log(`[Wikimedia Search] No images embedded on page "${bestPage.title}"`);
      return [];
    }

    // Filter out vector graphics, icons, maps, portal buttons, logos, flags
    const noiseKeywords = ['flag', 'map', 'logo', 'icon', 'portal', 'shield', 'stub', 'unconfirmed', 'template', 'button', 'wikimedia-logo'];
    const imageFiles = pages[0].images
      .map(img => img.title)
      .filter(title => {
        const lower = title.toLowerCase();
        const hasValidExt = /\.(jpg|jpeg|png|webp)$/i.test(lower);
        const isNoise = noiseKeywords.some(keyword => lower.includes(keyword));
        return hasValidExt && !isNoise;
      });

    if (imageFiles.length === 0) {
      console.log(`[Wikimedia Search] No clean non-vector/non-logo images on page "${bestPage.title}"`);
      return [];
    }

    console.log(`[Wikimedia Search] Found ${imageFiles.length} clean images for "${query}" inside article:`, imageFiles.slice(0, limit));

    // Fetch direct URLs for the images (batched in one API call)
    const titlesQuery = imageFiles.slice(0, limit).join('|');
    const urlsUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&titles=${encodeURIComponent(titlesQuery)}&iiprop=url&origin=*`;
    const urlsRes = await fetchWithRetry(urlsUrl);
    const urlsData = await urlsRes.json();
    console.log(`[Wikimedia Search] Direct URLs API response:`, JSON.stringify(urlsData).slice(0, 500));

    if (!urlsData.query || !urlsData.query.pages) return [];
    const urlPages = Object.values(urlsData.query.pages);
    const validUrls = [];
    urlPages.forEach(p => {
      if (p.imageinfo && p.imageinfo[0] && p.imageinfo[0].url) {
        const validated = sanitizeAndValidateWikimediaUrl(p.imageinfo[0].url);
        if (validated) {
          validUrls.push(validated);
        }
      }
    });

    console.log(`[Wikimedia Search] Retaining ${validUrls.length} validated images for "${query}"`);
    return validUrls;
  } catch (err) {
    console.error(`[Wikimedia Search] Error in getWikiPageImages for "${query}":`, err.message);
    return [];
  }
};

// Fallback 1: Commons Search (Namespace 6: Files)
const queryCommonsSearch = async (query, limit = 5) => {
  try {
    console.log(`[Wikimedia Search] Falling back to Commons namespace 6 file search for "${query}"...`);
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=15&prop=imageinfo&iiprop=url&origin=*`;
    const response = await fetchWithRetry(commonsUrl);
    const data = await response.json();
    console.log(`[Wikimedia Search] Commons query response:`, JSON.stringify(data).slice(0, 500));

    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      const images = [];
      for (const page of pages) {
        if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
          const url = page.imageinfo[0].url;
          const validated = sanitizeAndValidateWikimediaUrl(url);
          if (validated) {
            images.push(validated);
          }
        }
      }
      return images.slice(0, limit);
    }
  } catch (err) {
    console.error(`[Wikimedia Search] Commons search failed for "${query}":`, err.message);
  }
  return [];
};

// Fallback 2: Wikipedia Standard PageImages Search
const queryWikipediaPageImages = async (query, limit = 5) => {
  try {
    console.log(`[Wikimedia Search] Falling back to Wikipedia PageImages search for "${query}"...`);
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=10&piprop=original&origin=*`;
    const response = await fetchWithRetry(wikiUrl);
    const data = await response.json();
    console.log(`[Wikimedia Search] Wikipedia PageImages response:`, JSON.stringify(data).slice(0, 500));

    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      const images = [];
      for (const page of pages) {
        if (page.original && page.original.source) {
          const validated = sanitizeAndValidateWikimediaUrl(page.original.source);
          if (validated) {
            images.push(validated);
          }
        }
      }
      return images.slice(0, limit);
    }
  } catch (err) {
    console.error(`[Wikimedia Search] Wikipedia PageImages query failed for "${query}":`, err.message);
  }
  return [];
};

const fetchRealUnsplashImage = async (query) => {
  console.log(`[Image Retrieval] Fetching cover image for "${query}"...`);
  const pageImages = await getWikiPageImages(query, 1);
  if (pageImages.length > 0) return pageImages[0];

  const commonsImages = await queryCommonsSearch(query, 1);
  if (commonsImages.length > 0) return commonsImages[0];

  const wikiPageImages = await queryWikipediaPageImages(query, 1);
  if (wikiPageImages.length > 0) return wikiPageImages[0];

  console.warn(`⚠️ [Image Retrieval] Failed to retrieve any cover image for "${query}"`);
  return null;
};

const fetchMultipleUnsplashImages = async (query, limit = 5) => {
  console.log(`[Image Retrieval] Fetching up to ${limit} gallery images for "${query}"...`);
  let images = await getWikiPageImages(query, limit);
  if (images.length >= 3) return images;

  const commons = await queryCommonsSearch(query, limit);
  images = Array.from(new Set([...images, ...commons]));
  if (images.length >= 3) return images.slice(0, limit);

  const wiki = await queryWikipediaPageImages(query, limit);
  images = Array.from(new Set([...images, ...wiki]));

  return images.slice(0, limit);
};

const uploadImageToCloudinary = async (imgUrl) => {
  if (!imgUrl || !imgUrl.startsWith('http')) return imgUrl;
  try {
    const response = await fetchWithRetry(imgUrl);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    const res = await cloudinary.uploader.upload(dataUrl, {
      folder: 'culturequest/destinations',
      resource_type: 'image'
    });
    console.log(`[Cloudinary Upload] Upload success! Secure URL: ${res.secure_url}`);
    return res.secure_url;
  } catch (err) {
    console.warn(`⚠️ Cloudinary upload failed via base64 fallback for ${imgUrl}:`, err.message);
    return imgUrl;
  }
};

const CATEGORY_FALLBACKS = {
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200',
  city: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200',
  desert: 'https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?q=80&w=1200',
  forest: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200',
  historical: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200',
  adventure: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?q=80&w=1200',
  cultural: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1200',
  wildlife: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1200',
  other: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200'
};

const migrate = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected!');

    const destinations = await Destination.find({});
    console.log(`📌 Found ${destinations.length} destinations to verify/update.`);

    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_API_SECRET && 
      !process.env.CLOUDINARY_API_SECRET.startsWith('your_');

    for (const dest of destinations) {
      console.log(`\n----------------------------------------`);
      console.log(`🧭 Processing destination: "${dest.name}" (Category: ${dest.category})`);

      // Skip generic placeholder "Destination" if it exists or empty names
      if (!dest.name || dest.name.toLowerCase() === 'destination') {
        console.log(`⚠️ Skipping placeholder or invalid destination.`);
        continue;
      }

      // 1. Throttling: Delay 1s between destinations to avoid API spikes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch authentic cover image
      console.log(`🔍 Searching Wikipedia/Wikimedia for cover image of "${dest.name}"...`);
      const rawCover = await fetchRealUnsplashImage(dest.name);
      const fallbackUrl = CATEGORY_FALLBACKS[(dest.category || 'other').toLowerCase()] || CATEGORY_FALLBACKS.other;
      const targetCoverUrl = rawCover || fallbackUrl;

      let finalCoverUrl = targetCoverUrl;

      // Upload cover to Cloudinary if configured
      if (isCloudinaryConfigured && targetCoverUrl.startsWith('http')) {
        console.log(`📤 Uploading cover image to Cloudinary (base64)...`);
        finalCoverUrl = await uploadImageToCloudinary(targetCoverUrl);
      }

      // Fetch authentic gallery images
      console.log(`🔍 Searching Wikipedia/Wikimedia for gallery images of "${dest.name}"...`);
      const rawGallery = await fetchMultipleUnsplashImages(dest.name, 6);
      let finalGallery = [];

      if (rawGallery.length > 0) {
        if (isCloudinaryConfigured) {
          console.log(`📤 Uploading ${rawGallery.length} gallery images to Cloudinary (base64)...`);
          for (const imgUrl of rawGallery) {
            // 2. Throttling: Delay 500ms between individual gallery uploads
            await new Promise(resolve => setTimeout(resolve, 500));
            const uploadedUrl = await uploadImageToCloudinary(imgUrl);
            finalGallery.push(uploadedUrl);
          }
        } else {
          finalGallery = rawGallery;
        }
      }

      // Fetch fresh copy from DB right before save to avoid VersionError race condition
      const freshDest = await Destination.findById(dest._id);
      if (freshDest) {
        freshDest.coverImage = finalCoverUrl;
        freshDest.images = finalGallery;
        freshDest.gallery = finalGallery;
        await freshDest.save();
        console.log(`💾 Successfully updated and saved "${dest.name}"!`);
      } else {
        console.warn(`⚠️ Could not find fresh document for "${dest.name}" (ID: ${dest._id}) in database.`);
      }
    }

    console.log(`\n========================================`);
    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed.');
  }
};

migrate();
