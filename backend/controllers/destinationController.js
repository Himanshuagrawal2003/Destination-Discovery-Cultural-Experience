const Destination  = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');
const APIFeatures  = require('../utils/apiFeatures');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const { generateContent, prompts } = require('../services/geminiService');

const fetchRealUnsplashImage = async (query) => {
  try {
    const response = await fetch(
      `https://unsplash.com/s/photos/${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    if (!response.ok) return null;
    const html = await response.text();
    const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+/g);
    if (matches && matches.length > 0) {
      const uniqueMatches = Array.from(new Set(matches));
      const picked = uniqueMatches[0];
      return `${picked}?q=80&w=1200`;
    }
  } catch (err) {
    console.error('Error fetching Unsplash search page:', err.message);
  }
  return null;
};

const fetchMultipleUnsplashImages = async (query, limit = 5) => {
  try {
    const response = await fetch(
      `https://unsplash.com/s/photos/${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );
    if (!response.ok) return [];
    const html = await response.text();
    const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-_]+/g);
    if (matches && matches.length > 0) {
      const uniqueMatches = Array.from(new Set(matches)).map(url => `${url}?q=80&w=1200`);
      return uniqueMatches.slice(0, limit);
    }
  } catch (err) {
    console.error('Error fetching multiple Unsplash images:', err.message);
  }
  return [];
};

// @GET /api/destinations
exports.getDestinations = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Destination.find({ isActive: true }).select('-gallery'),
    req.query
  ).filter().search(['name', 'description', 'city', 'country']).sort().limitFields().paginate();

  const destinations = await features.query;
  const total = await Destination.countDocuments({ isActive: true });
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
      
      // 🚀 PARALLEL: Run AI generation + Unsplash scraping simultaneously
      const [rawText, scrapedCover, galleryUrls] = await Promise.all([
        generateContent(prompt),
        fetchRealUnsplashImage(cleanInput),
        fetchMultipleUnsplashImages(cleanInput, 6)
      ]);

      const data = parseJSON(rawText);
      
      if (!data.name) {
        throw new Error('Failed to parse Gemini output or name missing');
      }

      // Find any user to assign createdBy
      const User = require('../models/User');
      const admin = await User.findOne({});
      if (!admin) {
        throw new Error('A user is required to seed dynamic destination');
      }

      // Fallback categories map
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

      const categoryKey = (data.category || 'other').toLowerCase();
      const defaultFallback = CATEGORY_FALLBACKS[categoryKey] || CATEGORY_FALLBACKS.other;
      let coverImageUrl = scrapedCover || defaultFallback;

      const { cloudinary } = require('../config/cloudinary');
      const isCloudinaryConfigured = 
        process.env.CLOUDINARY_API_SECRET && 
        !process.env.CLOUDINARY_API_SECRET.startsWith('your_');
      
      // 🚀 PARALLEL: Upload cover + all gallery images to Cloudinary concurrently
      if (isCloudinaryConfigured) {
        const coverUploadPromise = cloudinary.uploader.upload(coverImageUrl, {
          folder: 'culturequest/destinations',
          resource_type: 'image'
        }).then(r => r.secure_url).catch(() => coverImageUrl);

        const galleryUploadPromises = galleryUrls.map(imgUrl =>
          cloudinary.uploader.upload(imgUrl, {
            folder: 'culturequest/destinations',
            resource_type: 'image'
          }).then(r => r.secure_url).catch(() => imgUrl)
        );

        console.log(`📤 Uploading cover + ${galleryUrls.length} gallery images for ${data.name} to Cloudinary (parallel)...`);
        const [uploadedCover, ...uploadedGallery] = await Promise.all([
          coverUploadPromise,
          ...galleryUploadPromises
        ]);
        coverImageUrl = uploadedCover;
        var uploadedImages = uploadedGallery;
      } else {
        var uploadedImages = galleryUrls;
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
          createdBy: admin._id
        });
      } catch (createErr) {
        if (createErr.code === 11000) {
          console.log(`ℹ️ [AI DYNAMIC] Destination with slug already exists. Fetching existing...`);
          const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          destination = await Destination.findOne({ slug }).populate('createdBy', 'name avatar');
          if (destination) {
            destination.viewCount += 1;
            await destination.save({ validateBeforeSave: false });
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
