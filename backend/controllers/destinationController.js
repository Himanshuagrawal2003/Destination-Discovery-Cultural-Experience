const Destination  = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const APIFeatures  = require('../utils/apiFeatures');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const { generateContent, prompts } = require('../services/geminiService');

// Helper to fetch with retry & exponential back-off
const fetchWithRetry = async (url, options = {}, retries = 2, backoff = 500) => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'CultureQuestApp/1.0 (contact@culturequest.com; developer)',
          ...(options.headers || {})
        }
      });

      if (response.status === 404 || response.status === 400) {
        return response; // Return immediately without retrying
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : backoff * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (err) {
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
  // Try Wikipedia page images first
  const pageImages = await getWikiPageImages(query, 1);
  if (pageImages.length > 0) return pageImages[0];

  // Try Commons search next
  const commonsImages = await queryCommonsSearch(query, 1);
  if (commonsImages.length > 0) return commonsImages[0];

  // Try Wikipedia PageImages next
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

    const { cloudinary } = require('../config/cloudinary');
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

// @GET /api/destinations
exports.getDestinations = asyncHandler(async (req, res) => {
  let baseQuery = { isActive: true };

  // If user is logged in and not performing a text search across all places, scope to their own explored/created destinations
  if (req.user && !req.query.search) {
    const userExplored = req.user.exploredDestinations || [];
    baseQuery.$or = [
      { _id: { $in: userExplored } },
      { createdBy: req.user._id }
    ];
  }

  const features = new APIFeatures(
    Destination.find(baseQuery).select('-gallery'),
    req.query
  ).filter().search(['name', 'description', 'city', 'country']).sort().limitFields().paginate();

  const destinations = await features.query;
  const total = await Destination.countDocuments(baseQuery);
  sendPaginated(res, destinations, total, req.query.page || 1, req.query.limit || 12);
});

// @GET /api/destinations/featured
exports.getFeaturedDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ isActive: true, isFeatured: true })
    .sort('-rating.average')
    .limit(8)
    .select('name country city category coverImage rating isTrending slug');
  sendSuccess(res, { destinations }, 'Featured destinations fetched');
});

// @GET /api/destinations/trending
exports.getTrendingDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ isActive: true, isTrending: true })
    .sort('-viewCount')
    .limit(6)
    .select('name country city category coverImage rating viewCount slug');
  sendSuccess(res, { destinations }, 'Trending destinations fetched');
});

const parseJSON = (text) => {
  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
};

// @GET /api/destinations/:id
exports.getDestination = asyncHandler(async (req, res, next) => {
  const isId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
  const looseRegex = isId 
    ? null 
    : new RegExp('^' + req.params.id.replace(/[^a-zA-Z0-9]/g, '').split('').join('-?') + '$', 'i');

  const orQueries = [
    { _id: isId ? req.params.id : null },
    { slug: req.params.id }
  ];
  if (looseRegex) {
    orQueries.push({ slug: looseRegex });
    orQueries.push({ name: looseRegex });
  }

  let destination = await Destination.findOne({
    $or: orQueries.filter(q => Object.values(q)[0] !== null),
  }).populate('createdBy', 'name avatar');

  if (destination && !destination.isActive) {
    console.log(`🩺 Reactivating inactive destination: ${destination.name}`);
    destination.isActive = true;
    await destination.save({ validateBeforeSave: false });
  }

  if (!destination) {
    console.log(`🔍 [AI DYNAMIC] Destination "${req.params.id}" not found in DB. Generating dynamic profile...`);
    try {
      const cleanInput = req.params.id.replace(/-/g, ' ');
      const prompt = prompts.generateDestinationProfile(cleanInput);
      
      const rawText = await generateContent(prompt);
      const data = parseJSON(rawText);
      
      if (!data.name) {
        throw new Error('Failed to parse Gemini output or name missing');
      }

      // Collect landmark search candidates: destination name + famous places + highlights
      const landmarkCandidates = [
        cleanInput,
        data.name,
        ...(Array.isArray(data.famousPlaces) ? data.famousPlaces.map(p => typeof p === 'string' ? p : p.name || p) : []),
        ...(Array.isArray(data.highlights) ? data.highlights.slice(0, 3) : [])
      ].filter(Boolean);

      // Fetch real images for each landmark in parallel
      const summaryPromises = landmarkCandidates.slice(0, 8).map(async (lm) => {
        try {
          const res = await fetchWithRetry(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(lm)}`);
          if (res && res.ok) {
            const json = await res.json();
            return json.originalimage?.source || json.thumbnail?.source || null;
          }
        } catch (e) {
          // ignore
        }
        return null;
      });

      const summaryResults = await Promise.all(summaryPromises);
      const realImageUrls = Array.from(new Set(summaryResults.filter(Boolean)));

      // Fallback if needed to query Wikipedia PageImages
      if (realImageUrls.length < 4) {
        const moreWiki = await queryWikipediaPageImages(cleanInput, 6);
        for (const mw of moreWiki) {
          if (!realImageUrls.includes(mw)) realImageUrls.push(mw);
          if (realImageUrls.length >= 6) break;
        }
      }

      // Find user to assign createdBy
      const User = require('../models/User');
      let creatorId = req.user?._id;
      if (!creatorId) {
        const admin = await User.findOne({});
        if (!admin) {
          throw new Error('A user is required to seed dynamic destination');
        }
        creatorId = admin._id;
      }

      const destSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let coverImageUrl = realImageUrls[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200';
      let uploadedImages = [];

      const isCloudinaryConfigured = 
        process.env.CLOUDINARY_API_SECRET && 
        !process.env.CLOUDINARY_API_SECRET.startsWith('your_');
      
      // Upload all genuine landmark images directly to Cloudinary
      if (isCloudinaryConfigured && realImageUrls.length > 0) {
        console.log(`📤 Uploading ${realImageUrls.length} genuine real landmark images for ${data.name} to Cloudinary...`);
        const uploadPromises = realImageUrls.map((imgUrl, idx) => 
          uploadImageToCloudinary(imgUrl)
        );
        const uploaded = await Promise.all(uploadPromises);
        coverImageUrl = uploaded[0] || coverImageUrl;
        uploadedImages = uploaded;
      } else {
        uploadedImages = realImageUrls;
      }

      try {
        destination = await Destination.create({
          name: data.name,
          country: data.country || 'Unknown',
          city: data.city || data.name,
          category: data.category || 'other',
          description: data.description || '',
          history: data.history || '',
          culture: data.culture || '',
          location: {
            type: 'Point',
            coordinates: [Number(data.longitude) || 0, Number(data.latitude) || 0]
          },
          budget: {
            min: Number(data.budget?.min) || 0,
            max: Number(data.budget?.max) || 0,
            level: data.budget?.level || 'mid-range'
          },
          bestSeason: Array.isArray(data.bestSeason) ? data.bestSeason : ['year-round'],
          coverImage: coverImageUrl,
          images: uploadedImages,
          gallery: uploadedImages,
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          travelTips: Array.isArray(data.travelTips) ? data.travelTips : [],
          hiddenGemsList: Array.isArray(data.hiddenGems) ? data.hiddenGems : [],
          famousFoodsList: Array.isArray(data.famousFoods) ? data.famousFoods : [],
          famousPlacesList: Array.isArray(data.famousPlaces) ? data.famousPlaces : [],
          createdBy: creatorId
        });
      } catch (createErr) {
        if (createErr.code === 11000) {
          console.log(`ℹ️ [AI DYNAMIC] Destination with slug already exists. Fetching existing...`);
          const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          destination = await Destination.findOne({ slug }).populate('createdBy', 'name avatar');
          if (destination) {
            destination.viewCount += 1;
            await destination.save({ validateBeforeSave: false });
            if (req.user) {
              await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { exploredDestinations: destination._id }
              });
            }
            return sendSuccess(res, { destination }, 'Destination fetched');
          }
        }
        throw createErr;
      }

      // Populate createdBy details manually for front-end rendering
      destination = await Destination.findById(destination._id).populate('createdBy', 'name avatar');
      console.log(`✅ [AI DYNAMIC] Created dynamic destination: ${destination.name}`);
    } catch (err) {
      console.error('❌ Failed to dynamically generate destination:', err.message);
      return next(new AppError(`Destination not found and failed to dynamically generate: ${err.message}`, 404));
    }
  } else {
    // Increment view count for existing destination
    destination.viewCount += 1;
    await destination.save({ validateBeforeSave: false });
  }

  // If user is authenticated, add destination to their personal explored list
  if (req.user && destination) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { exploredDestinations: destination._id }
    });
  }

  sendSuccess(res, { destination }, 'Destination fetched');
});

// @POST /api/destinations  [Admin]
exports.createDestination = asyncHandler(async (req, res, next) => {
  let parsedBody = { ...req.body };
  if (req.body.data) {
    try {
      parsedBody = JSON.parse(req.body.data);
    } catch (e) {
      // ignore
    }
  }
  const data = { ...parsedBody, createdBy: req.user._id };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  if (req.files?.images)          data.images      = req.files.images.map((f) => f.path);

  const destination = await Destination.create(data);
  sendSuccess(res, { destination }, 'Destination created successfully', 201);
});

// @PUT /api/destinations/:id  [Admin]
exports.updateDestination = asyncHandler(async (req, res, next) => {
  let parsedBody = { ...req.body };
  if (req.body.data) {
    try {
      parsedBody = JSON.parse(req.body.data);
    } catch (e) {
      // ignore
    }
  }
  const data = { ...parsedBody };
  if (req.files?.coverImage?.[0]) data.coverImage = req.files.coverImage[0].path;
  if (req.files?.images)          data.images      = req.files.images.map((f) => f.path);

  const destination = await Destination.findByIdAndUpdate(req.params.id, data, {
    new: true, runValidators: true,
  });
  if (!destination) return next(new AppError('Destination not found', 404));
  sendSuccess(res, { destination }, 'Destination updated successfully');
});

// @DELETE /api/destinations/:id  [Admin]
exports.deleteDestination = asyncHandler(async (req, res, next) => {
  const destination = await Destination.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!destination) return next(new AppError('Destination not found', 404));
  sendSuccess(res, {}, 'Destination deleted successfully');
});

// @GET /api/destinations/search/suggestions
exports.getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return sendSuccess(res, { suggestions: [] });
  const regex = new RegExp(q, 'i');
  const destinations = await Destination.find({ isActive: true, $or: [{ name: regex }, { city: regex }, { country: regex }] })
    .limit(8)
    .select('name city country category slug coverImage');
  sendSuccess(res, { suggestions: destinations });
});
